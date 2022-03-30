import { Config } from "./index";
import fs from "fs-extra";
import DocsRoute, { Route } from "./route";
import path from "path";
import { debug } from "./utils";

function createDir(config: Config): void {
  fs.ensureDirSync(config.cacheDir);
}

function createLayout(config: Config, route: DocsRoute): void {
  const layoutDir = path.join(__dirname, "./template/layout.vue");
  const oldDir = config.cacheDir + "/layout.vue";

  let oldData = "";
  if (fs.existsSync(oldDir)) {
    oldData = fs.readFileSync(oldDir, "utf-8");
  }

  const navs = route.toNavRouteData();
  // 不使用模板引擎，直接使用标志的方式替换掉
  const layout = fs
    .readFileSync(`${layoutDir}`, "utf-8")
    .replace(
      "// @vite-plugin-vue-docs-plus layout header",
      `header: ${JSON.stringify(config.header)},`
    )
    .replace(
      "// @vite-plugin-vue-docs-plus layout nav",
      `navs: ${JSON.stringify(navs)},`
    );

  if (oldData === layout) return;

  fs.writeFileSync(oldDir, layout);
}

function clean(config: Config): void {
  fs.emptyDirSync(config.cacheDir);
}

function childFile(config: Config, route: Route): string {
  const cacheDir = path.join(config.cacheDir, route.name + ".vue");
  debug.cache("childFile %s", cacheDir);
  const tmpContent = fs.readFileSync(
    path.join(__dirname, "./template/content.vue"),
    "utf-8"
  );

  let oldContent = "";
  if (fs.existsSync(cacheDir)) {
    oldContent = fs.readFileSync(cacheDir, "utf-8");
  }

  let cacheData = tmpContent.replace(
    `// @vite-plugin-vue-docs-plus content result`,
    `result: ${JSON.stringify(route.data)},`
  )
  if (route.readme) {
    cacheData = cacheData.replace(`<!-- @vite-plugin-vue-docs-plus readme -->`,`<div>${route.readme}</div>`)
  }
  const demos = [];
  if (route.demos) {
    // TODO: demo 设置ID 以便通过hash快速找到
    for (const key in route.demos) {
      if (Object.prototype.hasOwnProperty.call(route.demos, key)) {
        const demo = route.demos[key];
        const demoCode = demo.code
          ?.replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/{/g, "&#123;")
          .replace(/}/g, "&#125");
        demos.push(`<div class="doc-plus-demo-item">
        <section class="desc-plus-demo-view"><${demo.name} /></section>
        <div class="doc-plus-demo-meta">
          <div class="doc-plus-demo-title">${demo.title || 'Demo'}</div>
          <div class="doc-plus-demo--desc" v-if="${demo.desc ? 'true' : 'false'}">${demo.desc}</div>
          <div class="doc-plus-demo-source-code">
            <span style="cursor: pointer" @click="toggleSourceCodeVisible('${demo.name}')">
                {{sourceCodeVisible['${demo.name}'] ? '收起' : '展开'}}代码
            </span>
          </div>
        </div>
        <div class="doc-plus-demo-code">
          <pre v-highlightjs v-show="sourceCodeVisible['${demo.name}']"><code class="language-js">${demoCode}</code></pre>
        </div>
     </div>`);
      }
    }
  }
  if (route.demo) {
    const demo = route.demo;
    const demoCode = demo.code
      ?.replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/{/g, "&#123;")
      .replace(/}/g, "&#125");
    cacheData = cacheData.replace(
      `<!-- @vite-plugin-vue-docs-plus content template demo -->`,
      `<div class="doc-plus-demo-item">
          <section class="desc-plus-demo-view"><${demo.name} /></section>
          <div class="doc-plus-demo-meta">
            <div class="doc-plus-demo-title">${demo.title || 'Demo'}</div>
            <div class="doc-plus-demo--desc" v-if="${demo.desc ? 'true' : 'false'}">${demo.desc}</div>
            <div class="doc-plus-demo-source-code">
              <span style="cursor: pointer" @click="toggleSourceCodeVisible('${demo.name}')">
                  {{sourceCodeVisible['${demo.name}'] ? '收起' : '展开'}}代码
              </span>
            </div>
          </div>
          <div class="doc-plus-demo-code">
            <pre v-highlightjs v-show="sourceCodeVisible['${
              demo.name
            }']"><code class="language-js">${demoCode}</code></pre>
          </div>
       </div>${demos.join("")}`
    );
  } else {
    cacheData = cacheData.replace(`<!-- @vite-plugin-vue-docs-plus content template demo -->`,demos.join(""))
  }
  
  if (oldContent === cacheData) return cacheDir;

  fs.writeFileSync(cacheDir, cacheData);
  return cacheDir;
}

const Cache = {
  clean,
  childFile,
  createDir,
  createLayout,
};

export default Cache;
