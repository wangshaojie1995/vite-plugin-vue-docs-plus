import type { Plugin, UserConfig ,PluginOption} from "vite";
import fg from "fast-glob";
import { vueToJsonData } from "./main";
import DocsRoute from "./route";
import { MODULE_NAME, MODULE_NAME_VIRTUAL } from "./constants";
import path from "path";
import { hmr } from "./hmr";
import Cache from "./cache";

// 可自定义的配置
export interface CustomConfig {
  // 文档路由地址
  base: string;
  // 组件路径 相对于 src
  componentDir: string;
  // router实例名称
  vueRoute?: string;
  // 显示使用指南
  showUse?: boolean;
  // header
  header?: ConfigHeader;
}

interface ConfigHeader {
  // 网站header标题
  title?: string;
  // github 地址
  github?:string
}

export interface Config extends CustomConfig {
  // 组件绝对路径
  root: string;
  // 组件正则匹配
  fileExp: RegExp;
  // 缓存路径
  cacheDir: string;
  // vite
  viteConfig?: UserConfig;
  // 模板路径
  templateDir?: string;
  // 用户项目地址
  userProjectDir: string;
  // 模板文件夹名称
  templateFolder?:string
}

export default function vueDocs(rawOptions?: CustomConfig): false | Plugin | PluginOption[] {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const userPkg = require(`${process.cwd()}/package.json`);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pkg = require(`${path.join(__dirname, "../package.json")}`);
  const userProjectDir = process.cwd();
  const {header={},...customConfig} = rawOptions || {}
  const config: Config = {
    base: "/docs",
    componentDir: "/components",
    root: "",
    vueRoute: "router",
    fileExp: RegExp(""),
    showUse: true,
    userProjectDir: userProjectDir,
    cacheDir: path.join(userProjectDir,'node_modules', `.${pkg.name}`),
    header: {
      title: userPkg.name,
      github: "https://github.com/wangshaojie1995/vite-plugin-vue-docs-plus",
      ...header
    },
    ...customConfig,
  };

  config.root = `${process.cwd()}/src${config.componentDir}`;
  config.fileExp = RegExp(`${config.componentDir}\\/.*?.vue$`);
  config.templateFolder = `template`;
  config.templateDir = `${pkg.name}/dist/${config.templateFolder}`;

  Cache.createDir(config);
  const Route = DocsRoute.instance(config);

  return {
    name: pkg.name,
    enforce: "pre",
    config(viteConfig) {
      config.viteConfig = viteConfig;
      return {
        server: {
          force: true,
        },
      };
    },

    resolveId(id) {
      return id.includes(MODULE_NAME) ? MODULE_NAME_VIRTUAL : null;
    },

    async load(id) {
      if (id !== MODULE_NAME_VIRTUAL) return null;
      const files = await fg([".editorconfig", `${config.root}/**/*.vue`]);
      files.map((item) => {
        if (!item.includes("demo")) {
          Route.add(item);
        }
      });

      return Route.toClientCode();
    },

    transform(code, id) {
      if (id.includes("main.ts") || id.includes("main.js")) {
        code += `import VueHighlightJS from 'vue3-highlightjs';`;
        code += `app.use(VueHighlightJS);`;
        return code;
      }

      if (!/vue&type=route/.test(id)) {
        return;
      }

      return {
        code: "export default {}",
        map: null,
      };
    },

    configureServer(server) {
      hmr(server, config, Route);
    },
  };
}

export { vueToJsonData };
