# vite-plugin-vue-docs-plus

## 插件配置

```javascript
{
  // 文档路由地址
  base: string;
  // 组件路径 相对于 src
  componentDir: string;
  // router实例名称
  vueRoute?: string;
  // 显示使用指南(CHANGELOG.md 及 README.md)
  showUse?: boolean;
  // header
  header?: {
    // 网站header标题 默认取自项目 package.json 中的name
    title?: string;
    // 项目 github 地址
    github?:string
  };
}
```

## 组件库 说明文档

项目根目录 **README.md** 文件

## 组件库 更新日志文档

项目根目录 **CHANGELOG.md** 文件

### 组件说明 （在 script 标签中的第一个注释）

```JavaScript
/**
 * 组件名称
 * @desc 组件描述
 * @navTitle 组件 // 组件所在分类
 * @navOrder 1 // 组件排序
 */
```

### props 描述

```javascript

props: {
  /**
   * 最大值 // prop 说明
   * @type 99|22 // 类型
   * @default 99 // 默认值 default 在注释中不存在时将使用 代码中的 default 字段
   */
  max: {
    type: Number,
    default: 99,
  },
  /**
   * 类型
   * @type primary|success|warning|info|danger
   */
  type: {
    type: String,
    default: "primary",
    validator: (val: string) => {
      return ["primary", "success", "warning", "info", "danger"].includes(
        val
      );
    },
  },
  /**
   * 对象
   * @default value {a:1}  // 对象类型 default 格式要改一下 此时  {a:1} 作为默认值
   */
  obj: {
    type: Array,
    default: () => ({a:1})
  },
}
```

### emits

数组写法

```javascript
emits: [
  // 更新 value
  "update:value",
];
```

对象写法

```javascript
emits: {
  // 没有验证函数
  click: null,

  /**
   * 带有验证函数
   * 详细说明详细说明详细说明详细说明详细说明
   * @param {Object} payload 参数一
   * @param {Object} test 参数二
   * @param test1 参数三
   * @return Boolean
   */
  submit: (payload:any) => {
    if (payload.email && payload.password) {
      return true;
    } else {
      console.warn(`Invalid submit event payload!`);
      return false;
    }
  },
}
```

### 插槽注释

```html
<!-- 测试插槽一 -->
<slot></slot>
```

### 组件额外文档

在组件目录下增加 **README.md** 文件，此文件将被解析并添加到当前组件文档的末尾

## TODO

### Props

- default 为函数时生成备注

### Event

setup 中的 method
