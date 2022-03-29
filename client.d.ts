declare module "virtual:vite-plugin-vue-docs-plus" {
  import { RouteRecordRaw } from "vue-router";
  export const routes: RouteRecordRaw[];
  type InitVueDocsDemo = () => void;

  export const initVueDocsDemo: InitVueDocsDemo;
  export default routes;
}
