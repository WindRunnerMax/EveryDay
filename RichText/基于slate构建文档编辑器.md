# 基于slate构建文档编辑器
`slate.js`是一个完全可定制的框架，用于构建富文本编辑器，在这里我们使用`slate.js`构建专注于文档编辑的富文本编辑器。

* [基于Slate构建文档编辑器](./基于slate构建文档编辑器.md)
* [Slate文档编辑器-WrapNode数据结构与操作变换](./WrapNode数据结构与操作变换.md)
* [Slate文档编辑器-TS类型扩展与节点类型检查](./TS类型扩展与节点类型检查.md)
* [Slate文档编辑器-Decorator装饰器渲染调度](./Decorator装饰器渲染调度.md)
* [Slate文档编辑器-Node节点与Path路径映射](./Node节点与Path路径映射.md)

## 描述

[GitHub](https://github.com/WindrunnerMax/DocEditor) ｜ [Editor DEMO](https://windrunnermax.github.io/DocEditor/)

富文本编辑器是一种可内嵌于浏览器，所见即所得的文本编辑器。现在有很多开箱即用的富文本编辑器，例如`UEditor`、`WangEditor`等，他们的可定制性差一些，但是胜在开箱即用，可以短时间就见到效果。而类似于`Draft.js`、`Slate.js`，他们是富文本编辑器的`core`或者叫做`controller`，并不是一个完整的功能，这样就能够让我们有非常高的可定制性，当然也就会造成开发所需要的时间比较多。在实际应用或技术选型的时候，还是要多做一些调研，因为在业务上框架没有绝对的优势与劣势，只有合适不合适。   

在`slate`的文档中有对于框架的设计原则上的描述，搬运一下：
* 插件是一等公民，`slate`最重要的部分就是插件是一等公民实体，这意味着你可以完全定制编辑体验，去建立像`Medium`或是`Dropbox`这样复杂的编辑器，而不必对库的预设作斗争。
* 精简的`schema`核心，`slate`的核心逻辑对你编辑的数据结构进行的预设非常少，这意味着当你构建复杂用例时，不会被任何的预制内容所阻碍。
* 嵌套文档模型，`slate`文档所使用的模型是一个嵌套的，递归的树，就像`DOM`一样，这意味着对于高级用例来说，构建像表格或是嵌套引用这样复杂的组件是可能的，当然你也可以使用单一层次的结构来保持简单性。
* 与`DOM`相同，`slate`的数据模型基于`DOM`，文档是一个嵌套的树，其使用文本选区`selections`和范围`ranges`，并且公开所有的标准事件处理函数，这意味着像是表格或者是嵌套引用这样的高级特性是可能的，几乎所有你在`DOM`中可以做到的事情，都可以在`slate`中做到。
* 直观的指令，`slate`文档执行命令`commands`来进行编辑，它被设计为高级并且非常直观地进行编辑和阅读，以便定制功能尽可能地具有表现力，这大大的提高了你理解代码的能力。
* 可协作的数据模型，`slate`使用的数据模型特别是操作如何应用到文档上，被设计为允许协同编辑在最顶层，所以如果你决定要实现协同编辑，不必去考虑彻底重构。
* 明确的核心划分，使用插件优先的结构和精简核心，使得核心和定制的边界非常清晰，这意味着核心的编辑体验不会被各种边缘情况所困扰。

前边提到了`slate`只是一个`core`，简单来说他本身并不提供各种富文本编辑功能，所有的富文本功能都需要自己来通过其提供的`API`来实现，甚至他的插件机制也需要通过自己来拓展，所以在插件的实现方面就需要自己制定一些策略。`slate`的文档虽然不是特别详细，但是他的示例是非常丰富的，在文档中也提供了一个演练作为上手的基础，对于新手还是比较友好的。在这里我们构建了专注于文档编辑的富文本编辑器，交互与`ui`方面对于飞书文档的参考比较多，整体来说坑也是比较多的，尤其是在做交互策略方面，不过做好兜底以后实现基本的文档编辑器功能是没有问题的。在这里我使用的`slate`版本为`0.80.0`，不排除之后的框架策略调整，所以对于版本信息也需要注意。   

## 插件策略
上边我们提到了，`slate`本身并没有提供插件注册机制，这方面可以直接在文档的演练部分看出，同时也可以看出`slate`暴露了一些`props`使我们可以拓展`slate`的功能，例如`renderElement`、`renderLeaf`、`onKeyDown`等等，也可以看出`slate`维护的数据与渲染是分离的，我们需要做的是维护数据结构以及决定如何渲染某种类型的数据，所以在这里我们需要基于这些注册机制来实现自己的插件拓展方案。  
这是文档中演练最后实现的代码，可以简单了解一下`slate`的控制处理方案，可以看到块级元素即`<CodeElement />`的渲染是通过`renderElement`来完成的，行内元素即`bold`样式的渲染是通过`renderLeaf`来完成的，在`onKeyDown`中我们可以看到通过监听键盘的输入，我们对`slate`维护的数据通过`Transforms`进行了一些处理，通过匹配`Node`将`attributes`写入了数据结构，然后通过两种`render`的`props`将其渲染了出来，所以这就是`slate`的拓展机制与数据渲染分离结构。

```typescript
const initialValue = [
  {
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph.' }],
  },
]

const App = () => {
  const [editor] = useState(() => withReact(createEditor()))

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
}

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

### 插件注册
在上一节我们了解了`slate`的插件拓展与数据处理方案，那么我们也可以看到这种最基本的插件注册方式还是比较麻烦的，那么我们就可以自己实现一个插件的注册方案，统一封装一下插件的注册形式，用来拓展`slate`。在这里插件注册时通过`slate-plugins.tsx`来实现，具体来说，每个插件都是一个必须返回一个`Plugin`类型的函数，当然直接定义一个对象也是没问题的，函数的好处是可以在注册的时候传递参数，所以一般都是直接用函数定义的。

* `key`: 表示该插件的名字，一般不能够重复。
* `priority`: 表示插件执行的优先级，通常用户需要包裹`renderLine`的组件。
* `command`: 注册该插件的命令，工具栏点击或者按下快捷键需要执行的函数。
* `onKeyDown`: 键盘事件的处理函数，可以用他来制定回车或者删除等操作的具体行为等。
* `type`: 标记其是`block`或者是`inline`。
* `match`: 只有返回`true`即匹配到的插件才会执行。
* `renderLine`: 用于`block`的组件，通常用作在其子元素上包裹一层组件。
* `render`: 对于`block`组件具体渲染的组件由该函数决定，对于`inline`组件则与`block`的`renderLine`表现相同。

```typescript
type BasePlugin = {
  key: string;
  priority?: number; // 优先级越高 在越外层
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

在具体的实现上，我们采用了实例化类的方式，当实例化之后我们可以不断`add`插件，因为`toolbar`等插件是负责执行命令的，所以需要首先获取前边注册完成的插件的命令，将其传入后再注册到插件当中，通过这种注册的机制实现了统一的插件管理，在`apply`之后，我们可以将返回的值传入到`<Editable />`中，就可以将插件正常的拓展到`slate`当中了。

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

### 类型拓展
在`slate`中预留了比较好的类型拓展机制，可以通过`TypeScript`中的`declare module`配合`interface`来拓展`BlockElement`与`TextElement`的类型，使实现插件的`attributes`有较为严格的类型校验。

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

## 实现方案
在这里是具体的插件实现方案与示例，每个部分都是一种类型的插件的实现，具体的代码都可以在 [GitHub](https://github.com/WindRunnerMax/DocEditor) 中找到。在插件实现方面，整体还是借助了`HTML5`的标签来完成各种样式，这样能够保持文档的标签语义完整性但是会造成`DOM`结构嵌套比较深。

使用纯`CSS`来完成各种插件也是没问题的，而且实现上是更简单一些的，`context`提供`classList`来操作`className`，只不过纯`CSS`实现样式的话标签语义完整性就欠缺一些。这方面主要是个取舍问题，在此处实现的插件都是借助`HTML5`的标签以及一些自定义的交互策略来完成的，交互的执行上都是通过插件注册命令后触发实现的。

### Leaf
`leaf`类型的插件是行内的元素，例如加粗、斜体、下划线、删除线等等，在实现上只需要注意插件的命令注册与在该命令下如何渲染元素即可，下面是`bold`插件的实现，主要是注册了操作`attributes`的命令，以及使用`<strong />`作为渲染格式的标签。

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
    match: props => !!props.leaf[boldPluginKey],
    command: (editor, key) => {
      Transforms.setNodes(
        editor,
        { [key]: true },
        { match: node => Text.isText(node), split: true }
      );
    },
    render: context => <strong>{context.children}</strong>,
  };
};
```

### Element
`element`类型的插件是属于块级元素，例如标题、段落、对齐等等，简单来说是作用在行上的元素，在实现上不光要注意命令的注册和渲染元素，还有注意各种`case`，尤其是在`wrapper`嵌套下的情况。在下面的`heading`示例中，在命令阶段处理了是否已经处于`heading`状态，如果处于改状态那就取消`heading`，生成的`id`是为了之后作为锚点使用，在处理键盘事件的时候，就需要处理一些`case`，在这里实现了我们回车的时候不希望在下一行继承`heading`格式，以及当光标置于行最前点击删除则会删除该行标题格式。

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

          if (isSlateElement(block)) {
            if (event.key === KEYBOARD.BACKSPACE && isFocusLineStart(editor, path)) {
              const properties = getOmitAttributes([headingPluginKey]);
              Transforms.setNodes(editor, properties, { at: path });
              event.preventDefault();
            }
            if (event.key === KEYBOARD.ENTER && isFocusLineEnd(editor, path)) {
              const attributes = getBlockAttributes(block, [headingPluginKey]);
              if (isWrappedNode(editor)) {
                // 在`wrap`的情况下插入节点会出现问题 先多插入一个空格再删除
                Transforms.insertNodes(
                  editor,
                  { ...attributes, children: [{ text: " " }] },
                  { at: editor.selection.focus, select: false }
                );
                Transforms.move(editor, { distance: 1 });
                Promise.resolve().then(() => editor.deleteForward("character"));
              } else {
                Transforms.insertNodes(editor, { ...attributes, children: [{ text: "" }] });
              }
              event.preventDefault();
            }
          }
        }
      }
    },
  };
};
```

### Wrapper
`wrapper`类型的插件同样也是属于块级元素，例如引用块、有序列表、无序列表等，简单来说是在行上额外嵌套了一行，所以在实现上不光要注意命令的注册和渲染元素，还有注意各种`case`，在`wrapper`下需要注意的`case`就特别多，所以我们也需要自己实现一些策略来避免这些问题。在下面的`quote-block`示例中，实现了支持一级块引用，回车会继承格式，作为`wrapped`插件不能与其他`wrapped`插件并行使用，行空且该行为`wrapped`首行或尾行时回车和删除会取消该行块引用格式，光标置于行最前点击删除且该行为`wrapped`首行或尾行时则会取消该行块引用格式。

```typescript
declare module "slate" {
  interface BlockElement {
    "quote-block"?: boolean;
    "quote-block-item"?: boolean;
  }
}

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
`void`类型的插件同样也是属于块级元素，例如分割线、图片、视频等，`void`元素应该是一个空元素，他会有一个空的用于渲染的文本子节点，并且是不可编辑的，所以是一类单独的节点类型。在下面的`dividing-line`示例中，主要需要注意分割线的选中以及`void`节点的定义。

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
`toolbar`类型的插件是属于自定义的一类单独的插件，主要是用于执行命令，因为我们在插件定义的时候注册了命令，那么也就意味着我们完全可以通过命令来驱动节点的变化，`toolbar`就是用于执行命令的插件。在下面的`doc-toolbar`示例中，我们可以看到如何实现左侧的悬浮菜单以及命令的执行等。

```typescript
const DocMenu: React.FC<{
  editor: Editor;
  element: RenderElementProps["element"];
  commands: SlateCommands;
}> = props => {
  const [visible, setVisible] = useState(false);

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
        一级标题
      </Menu.Item>
      <Menu.Item key="heading.h2">
        <IconH2 />
        二级标题
      </Menu.Item>
      <Menu.Item key="heading.h3">
        <IconH3 />
        三级标题
      </Menu.Item>
      <Menu.Item key="quote-block">
        <IconQuote />
        块级引用
      </Menu.Item>
      <Menu.Item key="ordered-list">
        <IconOrderedList />
        有序列表
      </Menu.Item>
      <Menu.Item key="unordered-list">
        <IconUnorderedList />
        无序列表
      </Menu.Item>
      <Menu.Item key="dividing-line">
        <IconEdit />
        分割线
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
};

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
`shortcut`类型的插件是属于自定义的一类单独的插件，同样也是用于快捷键执行命令，这也是使用命令驱动的一种实现。在下面的`shortcut`示例中，我们可以看到如何处理快捷键的输入以及命令的执行等。

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


## 每日一题

- <https://github.com/WindRunnerMax/EveryDay>

## 参考

- <https://docs.slatejs.org/>
- <https://github.com/ianstormtaylor/slate>
- <https://www.slatejs.org/examples/richtext>
- <http://t.zoukankan.com/kagol-p-14820617.html>
- <https://rain120.github.io/athena/zh/slate/Introduction.html>
- <https://www.wangeditor.com/v5/#%E6%8A%80%E6%9C%AF%E8%80%81%E6%97%A7>

