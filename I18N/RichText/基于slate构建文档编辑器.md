# Building Document Editor with Slate
`slate.js` is a fully customizable framework for building rich text editors. Here we use `slate.js` to build a rich text editor focused on document editing.

* [Building a Document Editor with Slate](./基于slate构建文档编辑器.md)
* [Slate Document Editor - WrapNode Data Structure and Operation Transformation](./WrapNode数据结构与操作变换.md)
* [Slate Document Editor - TS Type Extension and Node Type Checking](./TS类型扩展与节点类型检查.md)
* [Slate Document Editor - Decorator Rendering Dispatcher](./Decorator装饰器渲染调度.md)
* [Slate Document Editor - Node and Path Mapping](./Node节点与Path路径映射.md)

## Description

[GitHub](https://github.com/WindrunnerMax/DocEditor) ｜ [Editor DEMO](https://windrunnermax.github.io/DocEditor/)

A rich text editor is a text editor that can be embedded in a browser and provides a what-you-see-is-what-you-get editing experience. There are many out-of-the-box rich text editors available, such as `UEditor` and `WangEditor`. They may have limited customization, but they offer quick implementation and visible results. On the other hand, frameworks like `Draft.js` and `Slate.js` serve as the core or controller of a rich text editor, providing high customizability but requiring more development time. When considering practical application or technology selection, it is important to conduct thorough research, as there is no absolute advantage or disadvantage of a framework in business scenarios – it's all about suitability.

The `slate` framework's design principles are described in its documentation:
* Plugins are first-class citizens, meaning you can fully customize the editing experience to build complex editors like those of `Medium` or `Dropbox` without struggling against the library's defaults.
* Lean schema core, providing minimal presets for the data structure you're editing, allowing complex use cases without being hindered by predefined content.
* Nested document model, similar to the `DOM`, enabling the construction of complex components such as tables or nested references for advanced use cases, while also supporting a simple single-level structure.
* Like the `DOM`, `slate`'s data model is based on a nested tree, using text selections and ranges, and exposing all standard event handling functions. This means that advanced features like tables and nested references, almost anything possible in the `DOM`, can be achieved in `slate`.
* Intuitive commands, executing commands for editing that are designed to be highly intuitive, providing expressive customizability and greatly enhancing code understanding.
* Collaborative data model, designed to allow collaboration edits at the top level, meaning that implementing collaborative editing won't require a complete overhaul.
* Clear core boundaries, using a plugin-focused structure and lean core, ensuring clear boundaries between core and customization, preventing core editing experience from being troubled by various edge cases.

As mentioned earlier, `slate` is just a core. In other words, it doesn't provide various rich text editing features; all rich text functionality needs to be implemented using its provided API, even its plugin mechanism needs to be extended manually. Although `slate`'s documentation is not very detailed, its examples are quite rich. It also provides a tutorial as a starting point, making it relatively friendly for beginners. Here, we have built a rich text editor focused on document editing, with a lot of references to the interaction and UI of the Feishu Documents. Overall, there are quite a few challenges, especially in terms of interaction strategies, but with proper fallbacks, implementing basic document editor functionality is not a problem. The `slate` version used here is `0.80.0`, and it's worth noting that framework strategies may adjust in the future, so pay attention to version information as well.

## Plugin Strategy
As mentioned earlier, `slate` itself does not provide a plugin registration mechanism, as can be seen directly in the documentation's tutorial. It also exposes some props to extend `slate`'s functionality, such as `renderElement`, `renderLeaf`, and `onKeyDown`. It can be observed that `slate` maintains data and rendering separately, and what we need to do is maintain the data structure and decide how to render a certain type of data. Therefore, we need to implement our plugin extension scheme based on these registration mechanisms.

This is the final implementation code of the tutorial in the documentation. It provides a simple understanding of `slate`'s control handling. We can see that the rendering of block-level elements, such as `<CodeElement />`, is achieved through `renderElement`, and the rendering of inline elements, such as the `bold` style, is achieved through `renderLeaf`. In `onKeyDown`, we can see that by listening to keyboard input, we perform some data processing on `slate`'s maintained data through `Transforms`, write attributes into the data structure by matching `Node`, and then render them using the two `render` props. This is how `slate`'s extension mechanism and data rendering separation work.

```typescript
const initialValue = [
  {
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph.' }],
  },
]

const App = () => {
  const [editor] = useState(() => withReact(createEditor()))
```

```javascript
const renderElement = useCallback(props => {
  switch (props.element.type) {
    case 'code':
      return <CodeElement {...props} />
    default:
      return <DefaultElement {...props} />
  }
}, [])

// Define a leaf rendering function that is memoized with `useCallback`.
const renderLeaf = useCallback(props => {
  return <Leaf {...props} />
}, [])

return (
  <Slate editor={editor} value={initialValue}>
    <Editable
      renderElement={renderElement}
      // Pass in the `renderLeaf` function.
      renderLeaf={renderLeaf}
      onKeyDown={event => {
        if (!event.ctrlKey) {
          return
        }

        switch (event.key) {
          case '`': {
            event.preventDefault()
            const [match] = Editor.nodes(editor, {
              match: n => n.type === 'code',
            })
            Transforms.setNodes(
              editor,
              { type: match ? null : 'code' },
              { match: n => Editor.isBlock(editor, n) }
            )
            break
          }

          case 'b': {
            event.preventDefault()
            Transforms.setNodes(
              editor,
              { bold: true },
              { match: n => Text.isText(n), split: true }
            )
            break
          }
        }
      }}
    />
  </Slate>
)

const Leaf = props => {
  return (
    <span
      {...props.attributes}
      style={{ fontWeight: props.leaf.bold ? 'bold' : 'normal' }}
    >
      {props.children}
    </span>
  )
}
```

### Plugin Registration
In the previous section, we learned about the extension and data processing methods of `slate` plugins, and we can see that this basic plugin registration method is still quite cumbersome. Therefore, we can implement our own plugin registration method to uniformly encapsulate the plugin registration form to extend `slate`. Here, the plugin registration is implemented through `slate-plugins.tsx`. Specifically, each plugin is a function that must return a `Plugin` type. Of course, it is also possible to directly define an object, but the advantage of using a function is that it can pass parameters when registered, so generally a function is directly used for definition.

* `key`: Represents the name of the plugin, which generally cannot be repeated.
* `priority`: Indicates the execution priority of the plugin, and is usually used to wrap the component of `renderLine`.
* `command`: Registers the command of the plugin, which is the function that needs to be executed when the toolbar is clicked or a shortcut key is pressed.
* `onKeyDown`: The keyboard event handling function, which can be used to specify the specific behavior of operations such as Enter or delete.
* `type`: Marks whether it is `block` or `inline`.
* `match`: Only the plugin that returns `true` will be executed.
* `renderLine`: Used for the component of `block`, usually used to wrap a layer of component around its child elements.
* `render`: For the specific rendering of the `block` component, it is determined by this function, and for the `inline` component, it behaves the same as `renderLine` for `block`.


```typescript
type BasePlugin = {
  key: string;
  priority?: number; // The higher the priority, the further out it is
  command?: CommandFn;
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => boolean | void;
};
type ElementPlugin = BasePlugin & {
  type: typeof EDITOR_ELEMENT_TYPE.BLOCK;
  match: (props: RenderElementProps) => boolean;
  renderLine?: (context: ElementContext) => JSX.Element;
  render?: (context: ElementContext) => JSX.Element;
};
type LeafPlugin = BasePlugin & {
  type: typeof EDITOR_ELEMENT_TYPE.INLINE;
  match: (props: RenderLeafProps) => boolean;
  render?: (context: LeafContext) => JSX.Element;
};
```

In the specific implementation, we use the instantiation of classes. After instantiation, we can continuously `add` plugins. Because the `toolbar` and other plugins are responsible for executing commands, we need to first obtain the commands of the previously registered plugins, pass them in, and then register them to the plugins. Through this registration mechanism, we achieve unified plugin management. After `apply`, we can pass the returned value into `<Editable />`, and the plugins can be seamlessly integrated into `slate`.

```typescript
const { renderElement, renderLeaf, onKeyDown, withVoidElements, commands } = useMemo(() => {
  const register = new SlatePlugins(
    ParagraphPlugin(),
    HeadingPlugin(editor),
    BoldPlugin(),
    QuoteBlockPlugin(editor),
    // ...
  );

  const commands = register.getCommands();
  register.add(
    DocToolBarPlugin(editor, props.isRender, commands),
    // ...
  );
return register.apply();
}, [editor, props.isRender]);
```

### Type Extension
In `slate`, a good type extension mechanism is provided, which can be used to extend the types of `BlockElement` and `TextElement` through `declare module` in TypeScript, combined with `interface`, to provide strict type checking for plugin `attributes`.

```typescript
// base
export type BaseNode = BlockElement | TextElement;
declare module "slate" {
  interface BlockElement {
    children: BaseNode[];
    [key: string]: unknown;
  }
  interface TextElement {
    text: string;
    [key: string]: unknown;
  }
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: BlockElement;
    Text: TextElement;
  }
}

// plugin
declare module "slate" {
  interface BlockElement {
    type?: { a: string; b: boolean };
  }
  interface TextElement {
    type?: boolean;
  }
}
```

## Implementation Approach
Here is the specific plugin implementation approach and examples. Each section represents the implementation of a specific type of plugin. The specific code can be found on [Github](https://github.com/WindrunnerMax/DocEditor). In terms of plugin implementation, we mainly leverage HTML5 tags to achieve various styles, which helps maintain the semantic integrity of the document, but may result in deep DOM nesting. It's also feasible to use pure CSS to implement various plugins, which is simpler in implementation. The `context` provides `classList` to manipulate `className`, but the semantic integrity of the tags is somewhat compromised when using pure CSS for styling. This is mainly a matter of trade-off. The plugins implemented here are all based on HTML5 tags and some custom interaction strategies. Interactions are executed by triggering the implementation after registering commands for the plugin.


### Leaf
The `leaf` type of plugin is an inline element, such as bold, italics, underline, and strikethrough. In its implementation, you only need to pay attention to the registration of the plugin's command and how to render the element under that command. Below is the implementation of the `bold` plugin, mainly registering the command for manipulating `attributes` and using `<strong />` as the rendering format tag.

```typescript
declare module "slate" {
  interface TextElement {
    bold?: boolean;
  }
}

export const boldPluginKey = "bold";
export const BoldPlugin = (): Plugin => {
  return {
    key: boldPluginKey,
    type: EDITOR_ELEMENT_TYPE.INLINE,
    match: (props) => !!props.leaf[boldPluginKey],
    command: (editor, key) => {
      Transforms.setNodes(
        editor,
        { [key]: true },
        { match: (node) => Text.isText(node), split: true }
      );
    },
    render: (context) => <strong>{context.children}</strong>,
  };
};
```

### Element
The `element` type of plugin belongs to block-level elements, such as headers, paragraphs, and alignment. Simply put, it acts on elements within a line. In its implementation, you not only need to pay attention to the registration of commands and rendering elements but also to various cases, especially when nested in a `wrapper`. In the example of `heading` below, during the command phase, it handles whether it is already in a `heading` state, if so, it cancels the `heading`. The generated `id` is intended for later use as an anchor point. When handling keyboard events, you need to handle some cases, such as ensuring that when pressing Enter, the next line does not inherit the `heading` format. Also, when the cursor is placed at the beginning of the line and you click delete, it will remove the header format for that line.

```typescript
declare module "slate" {
  interface BlockElement {
    heading?: { id: string; type: string };
  }
}

export const headingPluginKey = "heading";
const headingCommand: CommandFn = (editor, key, data) => {
  if (isObject(data) && data.path) {
    if (!isMatchedAttributeNode(editor, `${headingPluginKey}.type`, data.extraKey)) {
      setBlockNode(editor, { [key]: { type: data.extraKey, id: uuid().slice(0, 8) } }, data.path);
    } else {
      setBlockNode(editor, getOmitAttributes([headingPluginKey]), data.path);
    }
  }
};
```

```jsx
export const HeadingPlugin = (editor: Editor): Plugin => {
  return {
    key: headingPluginKey,
    type: EDITOR_ELEMENT_TYPE.BLOCK,
    command: headingCommand,
    match: props => !!props.element[headingPluginKey],
    renderLine: context => {
      const heading = context.props.element[headingPluginKey];
      if (!heading) return context.children;
      const id = heading.id;
      switch (heading.type) {
        case "h1":
          return (
            <h1 className="doc-heading" id={id}>
              {context.children}
            </h1>
          );
        case "h2":
          return (
            <h2 className="doc-heading" id={id}>
              {context.children}
            </h2>
          );
        case "h3":
          return (
            <h3 className="doc-heading" id={id}>
              {context.children}
            </h3>
          );
        default:
          return context.children;
      }
    },
    onKeyDown: event => {
      if (
        isMatchedEvent(event, KEYBOARD.BACKSPACE, KEYBOARD.ENTER) &&
        isCollapsed(editor, editor.selection)
      ) {
        const match = getBlockNode(editor, editor.selection);

        if (match) {
          const { block, path } = match;
          if (!block[headingPluginKey]) return void 0;
```

```typescript
declare module "slate" {
  interface BlockElement {
    "quote-block"?: boolean;
    "quote-block-item"?: boolean;
  }
}
```

### Wrapper
The `wrapper` type plugin also belongs to block-level elements, such as block quotes, ordered lists, unordered lists, etc. In simple terms, it nests an additional line on the line. Therefore, in the implementation, we not only need to pay attention to the registration of commands and rendering elements, but also need to pay attention to various cases. There are particularly many cases to consider under `wrapper`, so we need to implement some strategies to avoid these problems ourselves. In the `quote-block` example below, support for first-level block quotes is implemented. Pressing Enter inherits the format. As a `wrapped` plugin, it cannot be used in parallel with other `wrapped` plugins. If the line is empty and the line is the first or last line of a `wrapped` block quote, pressing Enter or Delete will cancel the block quote format of the line. Clicking to delete at the beginning of the line and the line is the first or last line of a `wrapped` block quote will also cancel the block quote format of the line.

```javascript
export const quoteBlockKey = "quote-block";
export const quoteBlockItemKey = "quote-block-item";
const quoteCommand: CommandFn = (editor, key, data) => {
  if (isObject(data) && data.path) {
    if (!isMatchedAttributeNode(editor, quoteBlockKey, true, data.path)) {
      if (!isWrappedNode(editor)) {
        setWrapNodes(editor, { [key]: true }, data.path);
        setBlockNode(editor, { [quoteBlockItemKey]: true });
      }
    } else {
      setUnWrapNodes(editor, quoteBlockKey);
      setBlockNode(editor, getOmitAttributes([quoteBlockItemKey, quoteBlockKey]));
    }
  }
};
export const QuoteBlockPlugin = (editor: Editor): Plugin => {
  return {
    key: quoteBlockKey,
    type: EDITOR_ELEMENT_TYPE.BLOCK,
    match: props => !!props.element[quoteBlockKey],
    renderLine: context => (
      <blockquote className="slate-quote-block">{context.children}</blockquote>
    ),
    command: quoteCommand,
    onKeyDown: event => {
      if (
        isMatchedEvent(event, KEYBOARD.BACKSPACE, KEYBOARD.ENTER) &&
        isCollapsed(editor, editor.selection)
      ) {
        const quoteMatch = getBlockNode(editor, editor.selection, quoteBlockKey);
        const quoteItemMatch = getBlockNode(editor, editor.selection, quoteBlockItemKey);
        if (quoteMatch && !quoteItemMatch) setUnWrapNodes(editor, quoteBlockKey);
        if (!quoteMatch && quoteItemMatch) {
          setBlockNode(editor, getOmitAttributes([quoteBlockItemKey]));
        }
        if (!quoteMatch || !quoteItemMatch) return void 0;

        if (isFocusLineStart(editor, quoteItemMatch.path)) {
          if (
            !isWrappedEdgeNode(editor, editor.selection, quoteBlockKey, quoteBlockItemKey, "or")
          ) {
            if (isMatchedEvent(event, KEYBOARD.BACKSPACE)) {
              editor.deleteBackward("block");
              event.preventDefault();
            }
          } else {
            setUnWrapNodes(editor, quoteBlockKey);
            setBlockNode(editor, getOmitAttributes([quoteBlockItemKey, quoteBlockKey]));
            event.preventDefault();
          }
        }
      }
    },
  };
};
```

### Void
The plugin of type `void` also belongs to block-level elements, such as dividing lines, images, videos, etc. The `void` element should be an empty element with an empty text child node for rendering, and it is not editable, so it is a separate type of node. In the example of `dividing-line` below, special attention should be paid to the selection of the dividing line and the definition of the `void` node.


```typescript
declare module "slate" {
  interface BlockElement {
    "dividing-line"?: boolean;
  }
}

export const dividingLineKey = "dividing-line";

const DividingLine: React.FC = () => {
  const selected = useSelected();
  const focused = useFocused();
  return <div className={cs("dividing-line", focused && selected && "selected")}></div>;
};
export const DividingLinePlugin = (): Plugin => {
  return {
    key: dividingLineKey,
    isVoid: true,
    type: EDITOR_ELEMENT_TYPE.BLOCK,
    command: (editor, key) => {
      Transforms.insertNodes(editor, { [key]: true, children: [{ text: "" }] });
      Transforms.insertNodes(editor, { children: [{ text: "" }] });
    },
    match: props => existKey(props.element, dividingLineKey),
    render: () => <DividingLine></DividingLine>,
  };
};
```

### Toolbar
The `toolbar` type of plugin belongs to a custom category of plugins, mainly used for executing commands. Since we registered commands when defining the plugin, it means that we can completely drive the node changes through commands. The `toolbar` is used to execute commands. In the `doc-toolbar` example below, we can see how to implement the floating menu on the left and execute commands.

```typescript
const DocMenu: React.FC<{
  editor: Editor;
  element: RenderElementProps["element"];
  commands: SlateCommands;
}> = props => {
  const [visible, setVisible] = useState(false);
```

```jsx
const affixStyles = (param: string) => {
  setVisible(false);
  const [key, data] = param.split(".");
  const path = ReactEditor.findPath(props.editor, props.element);
  focusSelection(props.editor, path);
  execCommand(props.editor, props.commands, key, { extraKey: data, path });
};
const MenuPopup = (
  <Menu onClickMenuItem={affixStyles} className="doc-menu-popup">
    <Menu.Item key="heading.h1">
      <IconH1 />
      Heading 1
    </Menu.Item>
    <Menu.Item key="heading.h2">
      <IconH2 />
      Heading 2
    </Menu.Item>
    <Menu.Item key="heading.h3">
      <IconH3 />
      Heading 3
    </Menu.Item>
    <Menu.Item key="quote-block">
      <IconQuote />
      Block Quote
    </Menu.Item>
    <Menu.Item key="ordered-list">
      <IconOrderedList />
      Ordered List
    </Menu.Item>
    <Menu.Item key="unordered-list">
      <IconUnorderedList />
      Unordered List
    </Menu.Item>
    <Menu.Item key="dividing-line">
      <IconEdit />
      Divider
    </Menu.Item>
  </Menu>
);
return (
  <Trigger
    popup={() => MenuPopup}
    position="bottom"
    popupVisible={visible}
    onVisibleChange={setVisible}
  >
    <span
      className="doc-icon-plus"
      onMouseDown={e => e.preventDefault()} // prevent toolbar from taking focus away from editor
    >
      <IconPlusCircle />
    </span>
  </Trigger>
);
```

```typescript
const NO_DOC_TOOL_BAR = ["quote-block", "ordered-list", "unordered-list", "dividing-line"];
const OFFSET_MAP: Record<string, number> = {
  "quote-block-item": 12,
};
export const DocToolBarPlugin = (
  editor: Editor,
  isRender: boolean,
  commands: SlateCommands
): Plugin => {
  return {
    key: "doc-toolbar",
    priority: 13,
    type: EDITOR_ELEMENT_TYPE.BLOCK,
    match: () => true,
    renderLine: context => {
      if (isRender) return context.children;
      for (const item of NO_DOC_TOOL_BAR) {
        if (context.element[item]) return context.children;
      }
      let offset = 0;
      for (const item of Object.keys(OFFSET_MAP)) {
        if (context.element[item]) {
          offset = OFFSET_MAP[item] || 0;
          break;
        }
      }
      return (
        <Trigger
          popup={() => <DocMenu editor={editor} commands={commands} element={context.element} />}
          position="left"
          popupAlign={{ left: offset }}
          mouseLeaveDelay={200}
          mouseEnterDelay={200}
        >
          <div>{context.children}</div>
        </Trigger>
      );
    },
  };
};
```

### Shortcut
The `shortcut` type plugin belongs to a custom category of plugins, also used for executing commands with keyboard shortcuts, which is another implementation driven by commands. In the `shortcut` example below, we can see how to handle keyboard shortcut inputs and execute commands.

```typescript
const SHORTCUTS: Record<string, string> = {
  "1.": "ordered-list",
  "-": "unordered-list",
  "*": "unordered-list",
  ">": "quote-block",
  "#": "heading.h1",
  "##": "heading.h2",
  "###": "heading.h3",
  "---": "dividing-line",
};
```

```typescript
export const ShortCutPlugin = (editor: Editor, commands: SlateCommands): Plugin => {
  return {
    key: "shortcut",
    type: EDITOR_ELEMENT_TYPE.BLOCK,
    match: () => false,
    onKeyDown: event => {
      if (isMatchedEvent(event, KEYBOARD.SPACE) && isCollapsed(editor, editor.selection)) {
        const match = getBlockNode(editor);
        if (match) {
          const { anchor } = editor.selection;
          const { path } = match;
          const start = Editor.start(editor, path);
          const range = { anchor, focus: start };
          const beforeText = Editor.string(editor, range);
          const param = SHORTCUTS[beforeText.trim()];
          if (param) {
            Transforms.select(editor, range);
            Transforms.delete(editor);
            const [key, data] = param.split(".");
            execCommand(editor, commands, key, { extraKey: data, path });
            event.preventDefault();
          }
        }
      }
    },
  };
};
```


## Daily Challenge

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://docs.slatejs.org/
https://github.com/ianstormtaylor/slate
https://www.slatejs.org/examples/richtext
http://t.zoukankan.com/kagol-p-14820617.html
https://rain120.github.io/athena/zh/slate/Introduction.html
https://www.wangeditor.com/v5/#%E6%8A%80%E6%9C%AF%E8%80%81%E6%97%A7
```