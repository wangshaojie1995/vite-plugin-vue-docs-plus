<template>
  <div class="doc-plus-nav">
    <template v-for="(nav,key) in navs">
      <div v-if="nav.length" :key="key">
        <div class="doc-plus-nav-group-title">{{ key }}</div>
        <div class="doc-plus-nav-item display-flex align-center" v-for="item in nav" :key="item.path">
          <router-link
            :class="{ active: item.path === $route.path }"
            :to="item.path"
          >
            {{ item.name }} {{item.title}}
          </router-link>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: "CustomNav",
  props: {
    navs: Array,
  },
};
</script>
<style scoped>
.doc-plus-nav {
  position: fixed;
  top: 88px;
  bottom: 0;
  left:0;
  border-right: 1px solid #f0f0f0;
  overflow: hidden;
  overflow-y: auto;
  width: 280px;
}
.doc-plus-nav-group-title {
  margin-top: 16px;
  margin-bottom: 16px;
  font-size: 13px;
  padding: 8px 16px;
  color: #00000073;
}
.doc-plus-nav-group-title::after {
  position: relative;
  top: 12px;
  display: block;
  width: calc(100% - 20px);
  height: 1px;
  background: #f0f0f0;
  content: "";
}
.doc-plus-nav-item {
  line-height: 40px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  cursor: pointer;
  margin: 4px 0 8px 0;
  transition: border-color .3s,background .3s,padding .1s cubic-bezier(.215,.61,.355,1);
  position: relative;
}
.doc-plus-nav-item a {
  overflow: hidden;
  font-size: 14px;
  text-overflow: ellipsis;
  color: #000000d9;
  transition: color .3s ease;
  text-decoration: none;
  background-color: transparent;
  outline: none;
  display: block;
  width: 100%;
  height: 100%;
  padding: 0 16px 0 28px;
}
.doc-plus-nav-item:hover a,.doc-plus-nav-item a.active {
  color: #1890ff;
}
.doc-plus-nav-item a::after {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  border-right: 3px solid #1890ff;
  transform: scaleY(.0001);
  opacity: 0;
  transition: transform .15s cubic-bezier(.215,.61,.355,1),opacity .15s cubic-bezier(.215,.61,.355,1);
  content: "";
}
.doc-plus-nav-item a.active {
  background: #e6f7ff;
}
.doc-plus-nav-item a.active::after {
  transform: scaleY(1);
  opacity: 1;
  transition: transform .15s cubic-bezier(.645,.045,.355,1),opacity .15s cubic-bezier(.645,.045,.355,1);
}
.doc-plus-nav-group-title ,.doc-plus-nav-item a {
  padding-left: 40px;
}
</style>
