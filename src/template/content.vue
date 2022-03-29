<template>
  <section>
    <h1>{{ result.title }}({{ result.name }})</h1>
    <p class="component-desc">{{result.desc}}</p >
    <!-- @vite-plugin-vue-docs-plus content template demo -->

    <template v-for="(values,type) in types">
      <div class="card" v-if="result[type]?.length" :key="type">
        <h3 :id="type">{{ values.title }}</h3>
        <table>
          <thead>
            <tr>
              <th
                v-for="(item, index) in values.data"
                :key="index"
              >
                {{ item.title }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(v, k) in result[type]" :key="k">
              <td v-for="(item, i) in values.data" :key="i">
                <!-- 类型 -->
                <!-- <em v-if="type === 'props' && k === 2">{{ v }}</em> -->
                <!-- 必填 -->
                <!-- <code v-else-if="type === 'props' && k === 4">{{ v }}</code> -->
                <!-- <span v-else>{{ v }}</span> -->
                <div v-if="Array.isArray(v[item.key])">
                  <div v-if="v[item.key].length">
                    <div v-for="(child,i) in v[item.key]" :key="i">{{child}}</div>
                  </div>
                  <span v-else>-</span>
                </div >
                <div v-else>{{v[item.key] || '-'}}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
    <!-- @vite-plugin-vue-docs-plus readme -->
  </section>
</template>
<script>
export default {
  data() {
    return {
      types: {
        slots: {
          title: '插槽',
          data:[
            {
              title: '名称',
              key: 'name'
            },
            {
              title: '说明',
              key: 'desc'
            },
            {
              title: '返回参数',
              key: 'params'
            },
          ]
        },
        props: {
          title: "属性",
          data:[
            {
              title: '参数',
              key: 'name'
            },
            {
              title: '说明',
              key: 'notes'
            },
            {
              title: '类型',
              key: 'type'
            },
            {
              title: '默认值',
              key: 'default'
            },
            {
              title: '必填',
              key: 'required'
            },
          ]
        },
        emits: {
          title: "事件",
          data:[
            {
              title: '事件',
              key: 'name'
            },
            {
              title: '说明',
              key: 'notes'
            },
            {
              title: '回调参数',
              key: 'params'
            },
          ]
        },
        methods: {
          title: "方法",
          data:[
            {
              title: '方法名',
              key: 'name'
            },
            {
              title: '说明',
              key: 'desc'
            },
            {
              title: '参数: 说明',
              key: 'params'
            },
            {
              title: '返回值',
              key: 'return'
            },
          ]
        }
      },
      showDemo: false,
      showSourceCode: false,
      sourceCodeVisible: {},
      // @vite-plugin-vue-docs-plus content result
    };
  },
  methods: {
    toggleSourceCodeVisible(key) {
      this.sourceCodeVisible = {
        ...this.sourceCodeVisible,
        [key]: !this.sourceCodeVisible[key],
      };
    },
  },
};
</script>
