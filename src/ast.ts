import { Node } from "@babel/traverse";
import * as t from "@babel/types";
import {
  ArrayExpression,
  ObjectExpression,
  ObjectProperty,
} from "@babel/types";
import { toLine } from "./utils";
import { Emit, Prop, Method, Slot } from "./type";
import { parse as commentParse } from "comment-parser";
import { SFCTemplateBlock } from "@vue/compiler-sfc";
import * as cheerio from "cheerio";

export function getPropsByObject(ast: ObjectExpression): Prop[] {
  if (ast.properties && ast.properties.length) {
    return ast.properties.map((item) => {
      const variables = item as ObjectProperty;

      return handleProp(variables);
    });
  }

  return [];
}
// 处理emits {click: null, change: {...}}
export function getEmitsByObject(ast: ObjectExpression): Emit[] {
  if (ast.properties && ast.properties.length) {
    return ast.properties.map((item) => {
      const variable = item as ObjectProperty;
      const emit: Emit = {
        name: getAstValue(variable.key),
        notes: "",
        // params: ''
      };
      if (variable.leadingComments && variable.leadingComments.length) {
        
        const commentArr = commentParse(`/*${variable.leadingComments[0].value || ''}\n*/`) || [];
        if (commentArr.length) {
          const commentData = commentArr[0]
          const commentTag = commentData.tags;
          emit.notes = commentData.description
          emit.params = commentTag.filter(item => item.tag === 'param').map(({name,type,description}) => {
            let str = name
            if(type)str += `，类型：${item.type}`
            if (description) str += `，说明：${description}`
            return str
          })
        } else {
          emit.notes = variable.leadingComments[0].value;
        }
      }
      return emit;
    });
  }

  return [];
}

// 处理emits ['click', 'change',...]
export function getEmitsByArray(ast: ArrayExpression): Emit[] {
  return ast.elements.map((item) => {
    const emit: Emit = {
      name: "",
      notes: "",
    };

    /**
     * emits: [
     *    // 点击事件
     *    'click'
     * ]
     */
    const name = getAstValue(item) as string;
    if (name && item) {
      emit.name = name;
      const notes = item.leadingComments?.map((item) => item.value) || [];
      emit.notes = notes.join("\n");
    }

    return emit;
  });
}

export function getMethodsByObject(ast: ObjectExpression): Method[] {
  const methods: Method[] = [];

  ast.properties.map((item) => {
    if (t.isObjectMethod(item)) {
      const method: Method = {
        name: getAstValue(item.key) as string,
        desc: "",
        params: [],
        return: "",
      };
      const methodProps: Prop[] = [];
      const comments = item.leadingComments || [];
      const comment = comments.filter((item) => {
        return (
          item.type === "CommentBlock" && item.value.includes("@vue-docs-ref")
        );
      })[0];

      if (comment) {
        const commentArr = commentParse(`/*${comment.value}\n*/`) || [];
        const commentTag = commentArr[0].tags;
        if (commentTag && commentTag[0].tag === "vue-docs-ref") {
          commentTag.map((item) => {
            switch (item.tag) {
              case "description": {
                method.desc = item.name;
                break;
              }

              case "param": {
                methodProps.push({
                  name: item.name,
                  type: item.type.toLocaleLowerCase(),
                  notes: item.description,
                  default: "",
                });
                break;
              }

              case "return": {
                method.return = item.description;
                break;
              }
            }
          });
          method.params = methodProps;
          methods.push(method);
        }
      }
    }
  });

  return methods;
}

export function getAstValue(ast: Node | null): string {
  if (t.isIdentifier(ast)) {
    return ast.name;
  }

  if (t.isStringLiteral(ast) || t.isNumericLiteral(ast)) {
    return ast.value as string;
  }

  return "";
}

interface SlotAst {
  slot: cheerio.Element;
  comment?: cheerio.CommentElement | null;
}

export function getSlotsByTemplate(template: SFCTemplateBlock): Slot[] {
  const slots: Slot[] = [];
  const html = template.content;
  const $ = cheerio.load(html);
  const $contents = $("*").contents();
  const slotAsts: SlotAst[] = [];

  $contents.map((index, el) => {
    if (el.type === "tag" && el.name === "slot") {
      // slot前面有一个文本节点，所以减2
      const comment = $contents[index - 2];
      slotAsts.push({
        slot: el,
        comment: comment.type === "comment" ? comment : null,
      });
    }
  });

  if (slotAsts.length) {
    slotAsts.map((item) => {
      const { slot, comment } = item;
      const name = $(slot).attr("name") || "default";
      slots.push({
        name,
        desc: comment && comment.data ? comment.data.replace(/\s+/g, "") : "",
        params:
          Object.keys($(slot).attr())
            .filter((param) => param != "name")
            .map((item) => item.replace(/:/, "")) || [],
      });
    });
  }

  return slots;
}

// 处理props
export function handleProp(variables: Node): Prop {
  const param: Prop = {
    name: "",
    type: "",
  };
  

  if (t.isObjectProperty(variables)) {
    // 参数名
    param.name = toLine(getAstValue(variables.key) as string);

    /**
     * 参数 对象写法
     * {
     *     type: String,
     *     default: 'xxx'
     *     required: 'xxx'
     * }
     */
    if (t.isObjectExpression(variables.value)) {
      variables.value.properties.map((item) => {
        const obj = item as ObjectProperty;
        const name = getAstValue(obj.key);
        let value: any;
        // type: string | type: number
        if (t.isIdentifier(obj.value) || t.isStringLiteral(obj.value) || t.isNumericLiteral(obj.value)) {
          value = getAstValue(obj.value);
        }

        // type: [string, number]
        if (t.isArrayExpression(obj.value)) {
          value = obj.value.elements
            .map((type) => getAstValue(type))
            .filter((str) => str)
            .join(" | ")
            .toLocaleLowerCase();
        }
        // type: boolean
        if (t.isBooleanLiteral(obj.value)) {
          value = `${obj.value.value}`
        }
        // default: () => any
        if (t.isArrowFunctionExpression(obj.value)) {
          // console.log('函数')
          // TODO: 函数返回值
          // value = obj.value
          // console.log(obj)
        }

        switch (name) {
          case "type":
            param.type = value.toLocaleLowerCase();
            break;

          case "required":
            param.required = value;
            break;

          case "default":
            param.default = value;
            break;
        }
      });
    }

    /**
     * 简写方式
     * type: String
     */
    if (t.isIdentifier(variables.value)) {
      param.type = getAstValue(variables.value).toLocaleLowerCase();
    }

    // type: [string, number]
    if (t.isArrayExpression(variables.value)) {
      param.type = handleTypes(variables.value).join(" | ").toLocaleLowerCase();
    }
  }

  // 注释 注释中的每一项都非必填
  // 以下多行注释为示例
  /**
   * props 说明
   * @type 99|22 // props 类型
   * @default value 99 // props 默认值
   */
  if (variables.leadingComments?.length) {
    const commentArr = commentParse(`/*${variables.leadingComments[0].value || ''}\n*/`) || [];
    if (commentArr.length) {
      param.notes = commentArr[0].description
      commentArr[0].tags.forEach((item) => {
        const {tag,name,description} = item
        switch (tag) {
          case 'type':
            param.type = name.split('|').join(" | ")
            break;
          case 'default':
            param.default = description || name
              
            break;
        }
      })
    }
  } else {
    const notes = variables.leadingComments?.map((item) => item.value);
    param.notes = (notes && notes.join("\n")) || "";
  }
  return param;
}

/**
 * 处理支持多种类型的参数
 * type: [string, number]
 */
function handleTypes(ast: ArrayExpression): string[] {
  return ast.elements.map((item) => {
    return getAstValue(item as Node) as string;
  });
}
