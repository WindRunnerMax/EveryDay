# TS Type Extension and Node Type Checking

Previously, we discussed the `WrapNode` data structure and operations transformation based on `slate` to address the normalization and transformers required for nested data structure types. Now, let's delve deeper into the data structure design of the document editor and talk about the type system implemented based on `slate`.

- Online Editing: [DocEditor Online](https://windrunnermax.github.io/DocEditor)
- Open Source Repository: [GitHub - DocEditor](https://github.com/WindrunnerMax/DocEditor)

Related articles about the `slate` document editor project:

- [Building a Document Editor with Slate](https://juejin.cn/post/7265516410490830883)
- [Slate Document Editor - WrapNode Data Structure and Operation Transformation](https://juejin.cn/spost/7385752495535603727)
- [Slate Document Editor - TS Type Extension and Node Type Checking](https://juejin.cn/spost/7399453742346551332)

## TS Type Extension
When incorporating `slate` into TypeScript (`TS`), you may notice that when calling `createEditor` to instantiate the editor, there is no generic type defined for input. Does this imply that `slate` cannot define types in `TS` and one must resort to using `as` for type assertions during property handling? This approach is not suitable for a mature editor engine. For a rich text editor, defining types in `TS` is crucial. We can perceive rich text as text with attributes. Unclear attribute definitions can lead to maintenance challenges. Maintaining rich text content is already problematic, hence defining types becomes necessary.

Before exploring type extensions in `slate`, let's first look at `declare module` and `interface` declarations provided by TypeScript. The distinction between interfaces defined by using `type` and `interface` is significant. Apart from `type` being able to define union types, a key difference is that an `interface` can be merged, allowing for extension of defined interfaces. On the other hand, `type` cannot redefine type declarations within the same module.

```js
interface A { a: string }
interface A { b: number }
const a: A =  { a: "", b: 1 }

type B = { a: string }
// type B = { b: number }
const b = { a: "" }
```

Initially, the difference between `interface` and `type` might seem minor and almost interchangeable. However, in practical applications, the merging feature of interfaces is crucial, especially in scenarios involving `declare module`. It can be used to extend type declarations for existing libraries, thereby adding extra type definitions.

```js
declare module "some-library" {
    export interface A {
        a: number;
    }
    export function fn(): void;
}
```

By utilizing the merging feature of `declare module + interface`, we can extend the type definitions of modules. This is similar to how `slate` extends classes, where we inject the required basic types by extending the module with interfaces. Our basic types are defined using the `interface` keyword, allowing continuous extension of types through the `declare module`. One crucial aspect to note is that once we implement type extensions through `declare module`, we can dynamically load the extended types as needed. This means that the corresponding type declarations are only loaded when the defined types are actually referenced, enabling on-demand type extension.

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

Actually, I highly recommend defining types in separate files. Otherwise, when we use the feature to jump to type definitions in the IDE and look at the complete `slate` type file, we will find that it jumps to the location of the file we defined above. Similarly, when we separate `slate` and its related modules into separate packages, we may find that the type jumps are not that convenient. Even if our goal is not to extend type definitions, we might end up jumping to the location of our `declare module` file. Therefore, after separating them out, handle declaration files as separate modules, so there won't be any positioning issues. Below is an example of our declared code block format type definitions.

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

## Node Type Checking
After expanding the types in `TS`, we also need to pay attention to actual node type checking. After all, `TS` only helps with static type checking. When compiled to `Js` and running in the browser, there usually won't be any additional code injection. However, in our usual usage, we clearly need these type checks. For instance, we might need to check if the current selection node is correctly positioned on a `Text` node to respond accordingly to user actions.

Let's organize the node types in `slate`. Based on the `CustomTypes` exported by `slate`, we can determine that the most basic types are just `Element` and `Text`, which I prefer to rename as `BlockElement` and `TextElement`. Due to the complexity of our business, we often need to extend two more types, `InlineElement` and `TextBlockElement`.

Let's start with `BlockElement`, the basic block element defined in `slate`. For example, the outermost nesting structure of our code block needs to be a `BlockElement`. Due to possible complex nesting structures like nested column structures in tables or nested code block structures within columns, we can understand `BlockElement` as the required structure for nesting. Checking whether a node is of type `BlockElement` can be done directly using the `Editor.isBlock` method.

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

`TextElement` is defined as a text node, and it's worth noting that attributes can also be added here, known as `markers` in `slate`. Regardless of the nested node types or the leaf nodes of the tree data structure, it must be a text node. Similarly, checking for `TextElement` can be done through the `isText` method on `Text`.

```js
export interface TextElement {
  text: string;
  children?: never;
  [key: string]: unknown;
}

export const isText = (node: Node): node is TextElement => Text.isText(node);
```

```js
// https://github.com/ianstormtaylor/slate/blob/25be3b/packages/slate/src/interfaces/text.ts#L53
export const Text = {
  isText(value: any): value is Text {
    return isPlainObject(value) && typeof value.text === 'string'
  },
}
```

If we carefully examine the conditions for determining `BlockElement` in `slate`, we can see that besides calling the `Element.isElement` method, it also checks the `editor.isInline` method. Since `InlineElement` in `slate` is a special kind of `BlockElement`, we also need to independently implement type checking for it. The way to check for `InlineElement` needs to be implemented by the `editor.isInline` method, which actually needs to be defined by us during `with`.

```js
export interface InlineElement {
  text?: never;
  children: TextElement[];
  [key: string]: unknown;
}

export const isInline = (editor: Editor, node: Node): node is InlineElement => {
  return editor.isInline(node);
}
```

In business scenarios, we often need to determine the actual rendering node of a text paragraph, `TextBlockElement`. This determination is also very important because it identifies the current node as the paragraph we actually want to render. This is very useful in data conversion scenarios. When we need to re-parse data, when encountering a text paragraph, we can determine that the current block-level structure parsing can end and we can proceed to build the content composition of the paragraph. Since a paragraph may contain both `TextElement` and `InlineElement` nodes, our check needs to consider both cases. Under normal conditions, we usually only need to check if the first node meets the criteria. In development mode, we can try comparing the structures of all nodes to determine and verify dirty data.

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

## Summary
In this discussion, we focused on the data structure design of document editors and talked about the type system of document editors implemented based on `slate`. In `slate`, there are many additional concepts and operations to pay attention to, such as `Range`, `Operation`, `Editor`, `Element`, `Path`, etc. In the upcoming articles, we will mainly discuss the representation of `Path` in `slate`, and how to control the content expression in `React` and properly maintain the `Path` path and `Element` content rendering. Moreover, we will also delve into the design and implementation of table modules.

## Question of the Day

- <https://github.com/WindRunnerMax/EveryDay>

## References

- <https://docs.slatejs.org/>
- <https://github.com/WindRunnerMax/DocEditor>
- <https://github.com/ianstormtaylor/slate/blob/25be3b/>
