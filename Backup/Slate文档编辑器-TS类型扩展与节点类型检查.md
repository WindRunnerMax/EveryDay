# Slate文档编辑器-TS类型扩展与节点类型检查

在之前我们聊到了一些关于`slate`富文本引擎的基本概念，并且对基于`slate`实现文档编辑器的一些插件化能力设计、类型拓展、具体方案等作了探讨，那么接下来我们更专注于文档编辑器的细节，由浅入深聊聊文档编辑器的相关能力设计。

* 在线编辑: https://windrunnermax.github.io/DocEditor
* 开源地址: https://github.com/WindrunnerMax/DocEditor

关于`slate`文档编辑器项目的相关文章:

* [基于Slate构建文档编辑器](https://juejin.cn/post/7265516410490830883)
* [Slate文档编辑器-WrapNode数据结构与操作变换](https://juejin.cn/spost/7385752495535603727)
* [Slate文档编辑器-TS类型扩展与节点类型检查]()

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

那么在这里我们就可以通过`declare module + interface`的合并特性来扩展模块的类型定义了，这也就是`slate`实际上定义的类型拓展方式，我们可以通过为`slate`模块拓展类型的方式，来注入我们需要的基本类型，而我们的基本类型都是使用`interface`关键字定义的，这样就表示我们的类型是可以不断通过`declare module`的方式进行扩展的。

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


## 最后

