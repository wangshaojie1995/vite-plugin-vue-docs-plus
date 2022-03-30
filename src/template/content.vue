<template>
  <section>
    <h1>{{ result.title }}({{ result.name }})</h1>
    <p class="doc-plus-component-desc">{{result.desc}}</p >
    <div class="doc-plus-demo-conainer">
      <h2>代码演示</h2>
      <!-- @vite-plugin-vue-docs-plus content template demo -->
    </div>
    <h2>API</h2>
    <template v-for="(values,type) in types" :key="type">
      <div class="doc-plus-apis" v-if="result[type]?.length" :key="type">
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
<style scoped>
section h1 {
  margin-top: 8px;
  margin-bottom: 20px;
  color: #000000d9;
  font-weight: 500;
  font-size: 30px;
  font-family: Avenir,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji",sans-serif;
  line-height: 38px;
}
.doc-plus-component-desc {
  margin: 1.6em 0 0.6em;
  color: #000000d9;
  font-weight: 500;
  font-family: Avenir,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji",sans-serif;
}
.doc-plus-demo-conainer h2 {
  margin: 1.6em 0 0.6em;
  color: #000000d9;
  font-weight: 500;
  font-family: Avenir,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji",sans-serif;
  font-size: 24px;
  line-height: 32px;
}
.doc-plus-demo-item {
  position: relative;
  width: 100%;
  margin: 0 0 16px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  transition: all .2s;
}
.desc-plus-demo-view {
  padding: 42px 24px 50px;
  color: #000000d9;
  border-bottom: 1px solid #f0f0f0;
}
.doc-plus-demo-meta {
  position: relative;
}
.doc-plus-demo-title {
  position: absolute;
  top: -14px;
  margin-left: 16px;
  padding: 1px 8px;
  color: #000000d9;
  background: #fff;
  border-radius: 2px 2px 0 0;
  transition: background-color .4s;
  z-index: 20;
}
.doc-plus-demo--desc{
  padding: 18px 24px 12px;
}
.doc-plus-demo-source-code {
  display: flex;
  justify-content: center;
  padding: 12px 0;
  border-top: 1px dashed #f0f0f0;
  opacity: .7;
  transition: opacity .3s;
}
.doc-plus-apis table {
  display: block;
  margin: 2em 0;
  overflow-x: auto;
  overflow-y: hidden;
  font-size: 13px;
  font-family: SFMono-Regular,Consolas,Liberation Mono,Menlo,Courier,monospace;
  line-height: 1.5715;
  border: 0;
  -webkit-overflow-scrolling: touch;
  width: 100%;
  direction: ltr;
  empty-cells: show;
  border-collapse: collapse;
  border-spacing: 0;
}
.doc-plus-apis table th:first-child {
border-left: 1px solid #f0f0f0;
}
.doc-plus-apis table th {
  padding-top: 14px;
  border-width: 1px 0 2px 0;
  padding: 12px;
  color: #5c6b77;
  font-weight: 500;
  white-space: nowrap;
  background: rgba(0,0,0,.02);
  text-align: left;
  border: 1px solid #f0f0f0
}
.doc-plus-apis table td:first-child {
  font-weight: 600;
  white-space: nowrap;
  border-left: 1px solid #f0f0f0;
}
.doc-plus-apis table td {
  color: #595959;
  padding: 12px;
  border-color: #f0f0f0;
  border-width: 1px 0;
  text-align: left;
  border: 1px solid #f0f0f0;
  width: 20%
}
</style>