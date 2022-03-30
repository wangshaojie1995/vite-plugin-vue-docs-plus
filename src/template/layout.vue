<template>
  <div class="van-doc">
    <HeaderComponent :header="header" />
    <NavComponent :navs="navs" />
    <div class="van-doc-container van-doc-row">
      <div class="van-doc-content van-doc-content--common">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
import NavComponent from "vite-plugin-vue-docs-plus/dist/template/nav.vue";
import HeaderComponent from "vite-plugin-vue-docs-plus/dist/template/header.vue";
import "vite-plugin-vue-docs-plus/dist/template/style.css";
import "highlight.js/styles/default.css";
import "ant-design-vue/dist/antd.css";

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
