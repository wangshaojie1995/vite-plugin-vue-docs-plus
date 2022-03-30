import { Config, vueToJsonData } from "./index";
import { debug, getBaseUrl, toLine, toPascalCase } from "./utils";
import { Component } from "./type";
import { ViteDevServer } from "vite";
import * as fs from "fs";
import Cache from "./cache";
import path from "path";
import hljs from 'highlight.js'
import { string } from "fast-glob/out/utils";
const md = require("markdown-it")({
  html: true,
  highlight: function (str: string, lang: string) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          '<pre class="hljs"><code>' +
          hljs.highlight(str, { language: lang }).value +
          "</code></pre>"
        );
      } catch (__) {}
    }

    return (
      '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + "</code></pre>"
    );
  },
});
const readmeRouteKey = "/readme"
const changelogRouteKey = "/changelog"
const readmeRouteName =  "使用说明"
const changelogRouteName =  "更新日志"
// 子组件
export interface Route {
  name: string;
  path: string;
  file: string;
  component: string;
  data?: Component | null;
  // 组件 src 下demo 文件
  demo?: Demo | null;
  // demo 目录
  demos?: Record<string, Demo>;
  // 组件 README.md 文件解析内容
  readme?:string
}

export interface Demo {
  file: string;
  name: string;
  code: string;
  // demo 名称
  title?: string
  // demo 说明
  desc?:string
}

export interface NavRoute {
  title: string;
  data: NavRouteData[];
}

export interface NavRouteData {
  // 组件路径
  path: string;
  // 组件英文名称
  name: string;
  // 中文名称
  title?: string
  // 分类名称
  navTitle?:string
  // 分类名称 排序
  navOrder?:number
}

class DocsRoute {
  // key: routePath
  route: { [key: string]: Route };
  config: Config;
  baseRoute: string;
  server: ViteDevServer | null | undefined;
  private static _instance: DocsRoute;

  private constructor(config: Config) {
    this.config = config;
    this.baseRoute = getBaseUrl(this.config);
    this.route = {};
    const cwd = process.cwd()
    const dirname = path.resolve(__dirname)
    if (config.showUse) {
      const readmePath = path.join(cwd,'README.md')
      const chanlogPath = path.join(cwd,'CHANGELOG.md')
      const existsChangelog = fs.existsSync(chanlogPath)
      const existsReadme = fs.existsSync(readmePath)
      const contentFlag = "<!-- content -->"
      const readmeVuePath = `/readme.vue`
      const changelogVuePath = `/changelog.vue`
      if (existsReadme) {
        const result = md.render(
          fs.readFileSync(readmePath, "utf-8")
        );
        let fileContent = fs.readFileSync(`${dirname}/${config.templateFolder}${readmeVuePath}`, "utf-8")
        fileContent = fileContent.replace(contentFlag, result)
        fs.writeFileSync(`${config.cacheDir}${readmeVuePath}`, fileContent);
        this.route[readmeRouteKey] = {
          path: "",
          name: readmeRouteName,
          file: readmeVuePath,
          component: `() => import('${config.cacheDir}${readmeVuePath}')`,
        }
      }
      if (existsChangelog) {
        const result = md.render(
          fs.readFileSync(chanlogPath, "utf-8")
        );
        let fileContent = fs.readFileSync(`${dirname}/${config.templateFolder}${changelogVuePath}`, "utf-8")
        fileContent = fileContent.replace(contentFlag, result)
        fs.writeFileSync(`${config.cacheDir}${changelogVuePath}`, fileContent);
        this.route[changelogRouteKey] = {
          path: "/changelog",
          name: changelogRouteName,
          file: changelogVuePath,
          component: `() => import('${config.cacheDir}${changelogVuePath}')`,
        }
      }
      // this.route = {
      //   "/readme": {
      //     path: "",
      //     name: "使用说明",
      //     file: config.templateDir + "/Readme.vue",
      //     component: `() => import('${config.templateDir}/Readme.vue')`,
      //   },
      //   "/changelog": {
      //     path: "/changelog",
      //     name: "更新日志",
      //     file: config.templateDir + "/ChangeLog.vue",
      //     component: `() => import('${config.templateDir}/ChangeLog.vue')`,
      //   },
      // };
    }
  }

  static instance(config?: Config): DocsRoute {
    if (!this._instance && config) {
      this._instance = new this(config);
    }

    return this._instance;
  }

  initWs(server: ViteDevServer): void {
    this.server = server;
  }

  getRoutePathByFile(file: string): string | null {
    let newFile = file;
    if (file.includes("demo")) {
      newFile = file.replace(".demo.vue", ".vue");
    }
    if (this.config.fileExp.test(newFile)) {
      const path = newFile.replace(this.config.root, "").replace(".vue", "");
      return toLine(path);
    }

    return null;
  }

  getRouteNameByFile(file: string): string | null {
    const routePath = this.getRoutePathByFile(file);
    if (routePath) {
      // return toPascalCase(routePath.replace(/\//g, "_"));
      return toPascalCase(routePath.split("/")[1]);
    }

    return null;
  }

  getRouteByFile(file: string): Route | null {
    const routePath = this.getRoutePathByFile(file);
    if (routePath) return this.route[routePath];
    return null;
  }

  getRouteDemo(route: Route, demoFile: string, fileName: string = ""): Demo {
    const code = fs.readFileSync(demoFile, "utf-8")
    const res = vueToJsonData(code);
    const {title,desc} = res?.content || {}
    if (fileName) {
      return {
        file: demoFile,
        name: route.name + fileName
          .replace(".vue", "")
          .replace(/\.\w/g, ($1) => $1.replace(".", "").toUpperCase()),
        code: fs.readFileSync(demoFile, "utf-8"),
        title,
        desc
      };
    }
    return {
      file: demoFile,
      name: route.name + "Demo",
      code: fs.readFileSync(demoFile, "utf-8"),
      title,
      desc
    };
  }

  add(file: string): { [key: string]: Route } {
    const routePath = this.getRoutePathByFile(file);
    if (!routePath) return this.route;
    const routeName = this.getRouteNameByFile(file) || "";
    const pathArr = file.split("/");
    const componentRoot = pathArr.slice(0, pathArr.length - 2).join("/");
    // demo 目录
    const demosDir = path.join(componentRoot, "demo");
    // 组件readme 路径
    const componentReadmePath = path.join(componentRoot, 'README.md')
    const existsDemoDir = fs.existsSync(demosDir)
    const existsReadme = fs.existsSync(componentReadmePath)
    if (!existsDemoDir && !existsReadme) {
      return this.route
    }
    const demoFile = file.replace(".vue", ".demo.vue");

    const result = vueToJsonData(fs.readFileSync(file, "utf-8"));
    const route: Route = {
      path: `/${routePath.split("/")[1]}`,
      name: routeName,
      file,
      component: "",
      data: result?.content,
    };
    // 解析demo 目录下的demo
    if (existsDemoDir) {
      const demos = fs.readdirSync(demosDir);
      if (demos?.length) {
        route.demos = route.demos || {};
        for (let index = 0; index < demos.length; index++) {
          const demo = demos[index];
          route.demos[demo] = this.getRouteDemo(
            route,
            path.join(demosDir, demo),
            demo
          );
        }
      }
    }
    // 解析src 下的demo
    if (fs.existsSync(demoFile)) {
      // 不能删 否则出不来demo
      route.demo = this.getRouteDemo(route, demoFile);
      // debug.route("add demo %O", route.demo);
    }
    // 解析 readme
    if (existsReadme) {
      const result = md.render(
        fs
          .readFileSync(componentReadmePath, "utf-8")
      );
      route.readme = result
    }
    const cacheDir = Cache.childFile(this.config, route);

    route.component = `() => import('${cacheDir}')`;

    // if (fs.existsSync(demoFile)) {
    //   route.demo = {
    //     file: demoFile,
    //     name: toPascalCase(routeName + "-demo"),
    //     code: fs.readFileSync(demoFile, "utf-8"),
    //   };
    //   console.log(route.demo);
    // }
    this.route[routePath] = route;
    return this.route;
  }

  change(file: string): void {
    const routePath = this.getRoutePathByFile(file);
    if (!routePath || !this.route[routePath]) return;
    const route = this.route[routePath];

    if (file.includes(".demo.vue")) {
      route.demo = this.getRouteDemo(route, file);
    } else {
      const result = vueToJsonData(fs.readFileSync(file, "utf-8"));
      debug.route("change %O", this.route[routePath]);
      this.route[routePath].data = result?.content;
    }

    Cache.childFile(this.config, this.route[routePath]);
  }

  toArray(): Route[] {
    const arr = [];
    for (const key in this.route) {
      arr.push(this.route[key]);
    }

    return arr;
  }

  toClientCode(): string {
    const arr = [];
    const demoImports = [];
    const demoComponent = [];
    for (const key in this.route) {
      const route = this.route[key];
      const json = {
        path: route.path.replace(/\//, ""),
        name: route.name,
        component: route.component,
        props: {
          content: route.data,
        },
      };

      if (route.demo) {
        const demoName = route.demo.name;
        demoImports.push(`import ${demoName} from "${route.demo.file}"`);
        demoComponent.push(`Vue.component('${demoName}', ${demoName})`);
      }
      if (route.demos) {
        for (const key in route.demos) {
          if (Object.prototype.hasOwnProperty.call(route.demos, key)) {
            const demo = route.demos[key];
            const demoName = demo.name;
            demoImports.push(`import ${demoName} from "${demo.file}"`);
            demoComponent.push(`Vue.component('${demoName}', ${demoName})`);
          }
        }
      }

      arr.push(
        JSON.stringify(json).replace(/"\(\) => .*?\)"/, function (str) {
          return str.replace(/"/g, "");
        })
      );
    }
    const layout = `[{
      path: '/docs',
      component: () => import('${this.config.cacheDir}/layout.vue'),
      children: [${arr.join(",\n").replace(/\s+/g, "")}]
    }]`;

    Cache.createLayout(this.config, this);

    debug.route("demo imports %O", demoImports);
    debug.route("demo component %O", demoComponent);

    let code = `export const routes = ${layout.replace(/\s+|\n+/g, "")};\n`;
    code += `${
      demoImports.length <= 1
        ? demoImports.join(";") + ";\n"
        : demoImports.join(";\n") + ";\n"
    }`;

    debug.route(
      "demo plugin",
      `export function initVueDocsDemo(Vue) {${
        demoComponent.length <= 1
          ? demoComponent.join(",") + "\n"
          : demoComponent.join(";\n")
      }};`
    );

    code += `export function initVueDocsDemo(Vue) {${
      demoComponent.length <= 1
        ? demoComponent.join(",") + "\n"
        : demoComponent.join(";\n")
    }};`.replace(/\n+/g, "");
    code += `export default routes;`;

    return code;
  }

  toNavRouteData(): { [key: string]: NavRouteData[] | [] } {
    const navs: NavRoute[] = [];

    const config = this.config;
    const routes = this.toArray();
    const otherClassifyKey = '未分类组件'
    const routeClassify:Record<string,NavRouteData[]> = {
    }
    const otherClassify:NavRouteData[] = []
    const defaultRoute: NavRouteData[] = [];
    const componentRoutes: { [key: string]: NavRouteData[] | [] } = {};
    routes.map((item) => {
      const path = config.base + item.path;
      // 默认路由
      if ([readmeRouteName,changelogRouteName].includes(item.name)) {
        // defaultRoute.push({
        //   name: item.name,
        //   path,
        // });
          routeClassify["使用指南"] = routeClassify["使用指南"] || []
          routeClassify['使用指南'].push({
            name: item.name,
            path,
            // title, navTitle, navOrder
          })
      } else {
        // console.log(item)
        const { title, navTitle, navOrder } = item.data || {}
        if (navTitle) {
          routeClassify[navTitle] = routeClassify[navTitle] || []
          routeClassify[navTitle].push({
            name: item.name,
            path,title,navTitle,navOrder
          })
        } else {
          otherClassify.push({
            name: item.name,
            path,title,navTitle,navOrder
          })
        }
      
        // const temp = path.split("/");
        // const d: NavRouteData[] = componentRoutes[temp[2]] || [];
        // d.push({
        //   name: item.name,
        //   path,title,navTitle,navOrder
        // });
        // componentRoutes[temp[2]] = d;
      }
    });
    for (const key in routeClassify) {
      if (Object.prototype.hasOwnProperty.call(routeClassify, key)) {
        const data = routeClassify[key];
        routeClassify[key] = data.sort((prev,next) => (prev.navOrder || 0) > (next.navOrder||0) ? 1 : -1)
      }
    }
    routeClassify[otherClassifyKey] = otherClassify
    // console.log(defaultRoute)
    // if (defaultRoute && defaultRoute.length > 0) {
    //   navs.push({
    //     title: "使用指南",
    //     data: defaultRoute,
    //   });
    // }

    // const otherClassify: NavRoute = {
    //   title: "未分类组件",
    //   data: [],
    // };
    // console.log(componentRoutes)
    // for (const key in componentRoutes) {
    //   const data = componentRoutes[key];
    //   if (data.length <= 1) {
    //     otherClassify.data.push(data[0]);
    //   } else {
    //     navs.push({
    //       title: key.toUpperCase(),
    //       data: data,
    //     });
    //   }
    // }

    // navs.push(otherClassify);

    // debug.route("生成导航 %O", navs);

    return routeClassify;
  }

  clean(): void {
    this.route = {};
    Cache.clean(this.config);
  }
}

export default DocsRoute;
