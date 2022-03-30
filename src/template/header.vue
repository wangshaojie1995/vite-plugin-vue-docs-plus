<template>
  <div class="doc-plus-header">
    <div class="display-flex align-center justify-space-between">
      <router-link class="doc-plus-logo" to="/docs">
        <span>{{ header.title }} </span>
      </router-link>

      <a
        class="doc-plus-git"
        target="_blank"
        :href="header.github"
      >
        <img src="https://b.yzcdn.cn/vant/logo/github.svg" alt="" />
      </a>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    header: Object,
  },
};
</script>
<style scoped>
.doc-plus-header {
  position: fixed;
  z-index: 999;
  max-width: 100%;
  background: #fff;
  box-shadow: 0 2px 8px #f0f1f2;
  left: 0;
  right: 0;
  width: 100%;
  line-height: 64px;
  padding: 0 24px;
  box-sizing: border-box;
}
.doc-plus-logo {
  font-weight: 500;
  color: #2c3e50;
  position: relative;
  font-size: 22px;
}
.doc-plus-git, .doc-plus-logo  {
  text-decoration: none;
}
.doc-plus-git {
  background: #000;
  border-radius: 50%;
  overflow: hidden;
}
.doc-plus-git img{
  display: block;
  width: 30px;
  height: 30px;
  transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
</style>