# Slate文档编辑器-TS类型扩展与节点类型检查

在之前我们基于`slate`实现的文档编辑器探讨了`WrapNode`数据结构与操作变换，主要是对于嵌套类型的数据结构类型需要关注的`Normalize`与`Transformers`，那么接下来我们更专注于文档编辑器的数据结构设计，聊聊基于`slate`实现的文档编辑器类型系统。

* 在线编辑: https://windrunnermax.github.io/DocEditor
* 开源地址: https://github.com/WindrunnerMax/DocEditor

关于`slate`文档编辑器项目的相关文章:

* [基于Slate构建文档编辑器](https://juejin.cn/post/7265516410490830883)
* [Slate文档编辑器-WrapNode数据结构与操作变换](https://juejin.cn/spost/7385752495535603727)
* [Slate文档编辑器-TS类型扩展与节点类型检查](https://juejin.cn/spost/7399453742346551332)

## TS类型扩展
当我们使用`TS`引入`slate`时，可能会发现调用`createEditor`实例化编辑器时，并没有提供范型的定义类型传入，那么这是不是意味着`slate`无法在`TS`中定义类型，而是只能在处理属性时采用`as`的形式强制类型断言。那么作为成熟的编辑器引擎显然是不能这样的，对于富文本编辑器来说，能够在`TS`中定义类型是非常重要的，我们可以将富文本理解为带着属性的文本，如果属性的定义不明确，那么维护起来可能会变得越来越困难，而本身维护富文本就充斥着各种问题，所以维护类型的定义是很有必要的。

在研究`slate`的类型扩展之前，我们需要先看看`TypeScript`提供的`declare module`以及`interface`声明，我们可能经常会遇到对`type`和`interface`定义的接口类型的区别，实际上除了`type`可以定义联合类型以外，`interface`和`type`还有一个比较重要的区别就是`interface`可以被合并，也就是可以将定义的接口进行扩展。而`type`在同一个模块内是无法重新定义类型声明的。

```js
interface A { a: string }
interface A { b: number }
const a: A =  { a: "", b: 1 }

type B = { a: string }
// type B = { b: number }
const b = { a: "" }
```

当我们初步了解时可能会觉得`interface`和`type`的区别不大几乎可以平替，但是在实际应用中`interface`的合并特性是非常重要的，特别是在`declare module`的场景下，我们可以用于为模块扩展声明类型，也就是为已经有类型定义的库增加额外类型定义。

```js
declare module "some-library" {
    export interface A {
        a: number;
    }
    export function fn(): void;
}
```

那么在这里我们就可以通过`declare module + interface`的合并特性来扩展模块的类型定义了，这也就是`slate`实际上定义的类扩展方式，我们可以通过为`slate`模块扩展类型的方式，来注入我们需要的基本类型，而我们的基本类型都是使用`interface`关键字定义的，这样就表示我们的类型是可以不断通过`declare module`的方式进行扩展的。还有一点需要特别关注，当我们实现了`declare module`的类型扩展时，我们就可以按需加载类型的扩展，也就是说只有当实际引用到我们定义好的类型时，才会加载对应的类型声明，做到按需扩展类型。

```js
// packages/delta/src/interface.ts
import type { BaseEditor } from "slate";

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor;
    Element: BlockElement;
    Text: TextElement;
  }
}

export interface BlockElement {
  text?: never;
  children: BaseNode[];
  [key: string]: unknown;
}

export interface TextElement {
  text: string;
  children?: never;
  [key: string]: unknown;
}
```

实际上我是非常推荐将类型定义独立抽离出单独的文件来定义的，否则当我们在`IDE`中使用跳转到类型定义的功能查看完整`slate`的类型文件时，发现其跳转的位置是我们上述定义的文件位置，同理当我们将`slate`及其相关模块独立抽离为单独的包时，会发现类型的跳转变得并不那么方便，即使我们的目标不是扩展类型的定义也会被跳转到我们`declare module`的文件位置。因此当我们将其抽离出来之后，声明文件单独作为独立的模块处理，这样就不会存在定位问题了，例如下面就是我们声明代码块格式的类型定义。

```js
// packages/plugin/src/codeblock/types/index.ts
declare module "doc-editor-delta/dist/interface" {
  interface BlockElement {
    [CODE_BLOCK_KEY]?: boolean;
    [CODE_BLOCK_CONFIG]?: { language: string };
  }
  interface TextElement {
    [CODE_BLOCK_TYPE]?: string;
  }
}

export const CODE_BLOCK_KEY = "code-block";
export const CODE_BLOCK_TYPE = "code-block-type";
export const CODE_BLOCK_CONFIG = "code-block-config";
```

## 节点类型检查
那么在`TS`方面我们将类型扩展好之后，我们还需要关注实际的节点类型判断，毕竟`TS`只是帮我们实现了静态类型检查，在实际编译为`Js`运行在浏览器中时，通常是不会有实际额外代码注入的，而在我们平常使用的过程中是明显需要这些类型的判断的，例如通常我们需要检查当前的选区节点是否正确位于`Text`节点上，以便对用户的操作做出对应的响应。

那么我们就可以梳理一下在`slate`当中的节点类型，实际上根据`slate`导出的`CustomTypes`我们可以确定最基本的类型就只有`Element`和`Text`，而我更习惯将其重命名为`BlockElement`和`TextElement`。而实际上由于我们的业务复杂性，我们通常还需要扩展出`InlineElement`和`TextBlockElement`两个类型。

那么我们首先来看`BlockElement`，这是`slate`中定义的基本块元素，例如我们的代码块最外层的嵌套结构需要是`BlockElement`，而实际上由于可能存在的复杂嵌套结构，例如表格中嵌套分栏结构，分栏结构中继续嵌套代码块结构等，所以我们可以将其理解为`BlockElement`是嵌套所需的结构即可，而判断节点类型是否是`BlockElement`的方式则可以直接调度`Editor.isBlock`方法即可。

```js
export interface BlockElement {
  text?: never;
  children: BaseNode[];
  [key: string]: unknown;
}

export const isBlock = (editor: Editor, node: Node | null): node is BlockElement => {
  if (!node) return false;
  return Editor.isBlock(editor, node);
};

// https://github.com/ianstormtaylor/slate/blob/25be3b/packages/slate/src/interfaces/editor.ts#L590
export const Editor = {
  isBlock(editor: Editor, value: any): value is Element {
    return Element.isElement(value) && !editor.isInline(value)
  }
}
```

`TextElement`被定义为文本节点，需要注意的是这里同样也是可以加入属性的，在`slate`中被称为`marker`，无论什么节点类型的嵌套，数据结构即树形结构的叶子节点一定需要是文本节点，而针对于`TextElement`的判断则同样可以调度`Text`上的`isText`方法。

```js
export interface TextElement {
  text: string;
  children?: never;
  [key: string]: unknown;
}

export const isText = (node: Node): node is TextElement => Text.isText(node);


// https://github.com/ianstormtaylor/slate/blob/25be3b/packages/slate/src/interfaces/text.ts#L53
export const Text = {
  isText(value: any): value is Text {
    return isPlainObject(value) && typeof value.text === 'string'
  },
}
```

如果仔细看`slate`判断`BlockElement`的条件，我们可以发现除了调用`Element.isElement`方法外，还判断了`editor.isInline`方法，由于`slate`中`InlineElement`是一种特殊的`BlockElement`，我们同样需要为其独立实现类型判断，而判断`InlineElement`的方式则需要由`editor.isInline`方法来实现，这部分实际上是由我们在`with`的时候需要定义好的。

```js
export interface InlineElement {
  text?: never;
  children: TextElement[];
  [key: string]: unknown;
}

export const isInline = (editor: Editor, node:Node): node is InlineElement => {
  return editor.isInline(node);
}
```

在业务中通常我们还需要判断文本段落实际渲染的节点`TextBlockElement`，这个判断同样非常重要，因为这里决定了当前的节点是我们实际要渲染的段落了，这在数据转换等场景中非常有用，当我们需要二次解析数据的时候，当遇到文本段落时，我们就可以确定当前的块级结构解析可以结束了，接下来可以构建段落的内容组合了。而由于段落中可能存在`TextElement`和`InlineElement`两种节点，我们的判断就需要将两种情况都考虑到，在规范的条件下我们通常只需要判断首个节点是否符合条件即可，而在开发模式下我们可以尝试对比所有节点的结构来判断并且校验脏数据。

```js
export interface TextBlockElement {
  text?: never;
  children: (TextElement | InlineElement)[];
  [key: string]: unknown;
}

export const isTextBlock = (editor: Editor, node: Node): node is TextBlockElement => {
  if (!isBlock(editor, node)) return false;
  const firstNode = node.children[0];
  const result = firstNode && (isText(firstNode) || isInline(editor, firstNode));
  if (process.env.NODE_ENV === "development") {
    const strictInspection = node.children.every(child => isText(firstNode) || isInline(editor, firstNode));
    if (result !== strictInspection) {
      console.error("Fatal Error: Text Block Check Fail", node);
    }
  }
  return result;
};
```

## 最后
在这里我们更专注于文档编辑器的数据结构设计，聊聊基于`slate`实现的文档编辑器类型系统。在`slate`中还有很多额外的概念和操作需要关注，例如`Range`、`Operation`、`Editor`、`Element`、`Path`等，那么在后边的文章中我们就主要聊一聊在`slate`中`Path`的表达，以及在`React`中是如何控制其内容表达与正确维护`Path`路径与`Element`内容渲染的，并且我们还可以聊一聊表格模块的设计与实现。
