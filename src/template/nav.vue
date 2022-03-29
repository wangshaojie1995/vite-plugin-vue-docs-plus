<template>
  <div class="van-doc-nav" style="top: 64px; bottom: 0">
    <template v-for="(nav,key) in navs">
      <div class="van-doc-nav__group" v-if="nav.length" :key="key">
        <div class="van-doc-nav__title">{{ key }}</div>
        <div class="van-doc-nav__item" v-for="item in nav" :key="item.path">
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
