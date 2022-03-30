<template>
  <div class="doc-plus-layout">
    <HeaderComponent :header="header"/>
    <NavComponent :navs="navs"/>
    <div class="doc-plus-content-container">
      <div class="doc-plus-content">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
import NavComponent from "vite-plugin-vue-docs-plus/dist/template/nav.vue";
import HeaderComponent from "vite-plugin-vue-docs-plus/dist/template/header.vue";
import "vite-plugin-vue-docs-plus/dist/template/style.css";
import 'highlight.js/styles/idea.css'

export default {
  components: { HeaderComponent, NavComponent },
  data() {
    return {
      // @vite-plugin-vue-docs-plus layout nav
      // @vite-plugin-vue-docs-plus layout header
    };
  },
};
</script>
<style scoped>
.doc-plus-layout {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  background-color: #fff;
  color: #323233;
  text-align: left;
  font-size: 16px;
  font-family: Open Sans, -apple-system, BlinkMacSystemFont, Helvetica Neue,
    Helvetica, Segoe UI, Arial, Roboto, PingFang SC, miui, Hiragino Sans GB,
    Microsoft Yahei, sans-serif;
  min-height: 100%;
  width: 100%
}
.doc-plus-content-container {
  box-sizing: border-box;
  padding-left: 280px;
  margin-top: 64px;
}
.doc-plus-content {
  padding: 24px;
  padding-left: 64px;
}
</style>