// 事件
interface Emit {
  name: string;
  notes?: string;
  params?:string[]
}

// 参数
export interface Prop {
  name: string;
  type: string;
  default?: string;
  required?: boolean;
  notes?: string;
}

// ref 可调用方法
export interface Method {
  name: string;
  // 描述
  desc: string;
  // 参数
  params?: Prop[];
  // {name: string, age: number}
  return?: string;
}

export interface Slot {
  name: string;
  desc: string;
  params?: string[];
}

export interface RenderData {
  name: string;
  props?: {
    h3: string;
    table: {
      headers: string[];
      rows: Array[keyof Prop];
    };
  };
  emits?: {
    h3: string;
    table: {
      headers: string[];
      rows: Array[keyof Emit];
    };
  };
  methods?: {
    h3: string;
    table: {
      headers: string[];
      rows: Array[keyof Emit];
    };
  };
  slots?: {
    h3: string;
    table: {
      headers: string[];
      rows: Array[keyof Slot];
    };
  };
}

// 组件信息
export interface Component {
  name: string;
  emits?: Emit[];
  props?: Prop[];
  methods?: Method[];
  slots?: Slot[];
  desc?: string; // 组件说明
  title?: string // 组件名称
  // 组件分类
  navTitle?: string 
  // 组件在分类中的排序
  navOrder?:number
}
