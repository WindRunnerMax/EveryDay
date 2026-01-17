# Extending the Pattern of React View Layer Adapters
At the initial architecture design of the editor, we based our work on the `MVC` model, implementing a layered structure for the model, core, and view layers. Previously, we primarily discussed the design of the model and core layers, which include data models and the core interaction logic of the editor. Here, we will take `React` as an example to discuss the design of its view layer's pattern extension.

- Open Source Repository: <https://github.com/WindRunnerMax/BlockKit>
- Online Editor: <https://windrunnermax.github.io/BlockKit/>
- Project Notes: <https://github.com/WindRunnerMax/BlockKit/blob/master/NOTE.md>

<details>
<summary><strong>Series of Articles on Building a Rich Text Editor from Scratch</strong></summary>

- [Feeling a bit lost, I'm preparing to try writing a rich text editor from scratch](./从零设计实现富文本编辑器.md)
- [Building a Rich Text Editor from Scratch #2 - MVC Pattern-Based Editor Architecture Design](./基于MVC模式的编辑器架构设计.md)
- [Building a Rich Text Editor from Scratch #3 - Delta-Based Linear Data Structure Model](./基于Delta的线性数据结构模型.md)
- [Building a Rich Text Editor from Scratch #4 - Core Interaction Strategies of the Browser Selection Model](./浏览器选区模型的核心交互策略.md)
- [Building a Rich Text Editor from Scratch #5 - State Structure Representation of the Editor Selection Model](./编辑器选区模型的状态结构表达.md)
- [Building a Rich Text Editor from Scratch #6 - Synchronizing Browser Selection and Editor Selection Models](./浏览器选区与编辑器选区模型同步.md)
- [Building a Rich Text Editor from Scratch #7 - Semi-Controlled Input Mode Based on Composite Events](./基于组合事件的半受控输入模式.md)
- [Building a Rich Text Editor from Scratch #8 - Uncontrolled DOM Behavior of Browser Input Mode](./浏览器输入模式的非受控DOM行为.md)
- [Building a Rich Text Editor from Scratch #9 - Controlled Handling of Changes in Editor Text Structure](./编辑器文本结构变更的受控处理.md)
- [Building a Rich Text Editor from Scratch #10 - Extending the Pattern of React View Layer Adapters](./React视图层适配器的模式扩展.md)

</details>

## Overview
Most editors implement their own view layers, and redesigning the view layer requires addressing rendering challenges, such as handling complex `DOM` updates and the costs of differential updates. Business-wise, it also limits the reuse of the component ecosystem and introduces new learning costs. Thus, we need to leverage existing view layer frameworks like `React/Vue/Angular`, which necessitates establishing a core model for an extensible view layer at the lowest architectural level.

Reusing existing view layer frameworks means that the core layer design remains agnostic to any type of view implementation. For aspects like selection management, we only need to focus on the most basic `DOM` operations. This requirement leads us to create corresponding view layer adapters for each framework type. Even though building these adapters may not be particularly complex, they still require a certain amount of effort.

While designing the view layer independently can solve the adaptation cost issue, it correspondingly increases maintenance overhead and the overall package size. Therefore, in our editor design, we choose to reuse existing view layer frameworks. However, adapting them for a rich text editor is not a trivial task, and there are several considerations that we need to address, including but not limited to the following:

- Initial state rendering of the view layer: lifecycle synchronization, state management, rendering modes, `DOM` mapping states, etc.
- Incremental updates for content editing: immutable objects, incremental rendering, key value maintenance, etc.
- Rendering events and node checks: dirty `DOM` checks, selection updates, rendering hooks, etc.
- Predefined components for editing nodes: zero-width characters, `Embed` nodes, `Void` nodes, etc.
- Rendering of non-edit nodes: placeholder nodes, read-only mode, plugin mode, external node mounting, etc.

Furthermore, implementing a view layer adapter based on `React` involves revisiting `React`'s rendering mechanisms in depth. For example, utilizing `memo` to avoid unnecessary re-renders, using `useLayoutEffect` to control the timing of `DOM` rendering updates, strictly managing the event flow between parent and child components along with the execution order of side effects, and handling controlled updates for dirty `DOM`.

In addition to the aspects related to `React`, there are also styling issues to consider. For instance, HTML's default treatment of consecutive whitespace characters—including spaces, tabs, and line breaks—causes them to be merged into a single space during rendering. This means that multiple spaces inputted will only display as one space upon rendering.

To address this, we can sometimes use the HTML entity `&nbsp;` to represent these characters and prevent rendering merge. However, we can also adopt a simpler approach using `CSS` to control the rendering of whitespace. The following styles govern different rendering behaviors:

- `whiteSpace: "pre-wrap"`: Ensures that line breaks and consecutive whitespace are preserved during rendering while allowing long words to wrap.
- `wordBreak: "break-word"`: Prevents long words or URLs from overflowing the container; it wraps lines within words, which is particularly useful for mixed-content in Chinese and English.
- `overflowWrap: "break-word"`: Also handles text overflow wrapping, but does not break long words when adjusting to the container's width, adhering to current standards.

```js
<div
  style={{
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    overflowWrap: "break-word",
  }}
></div>
```

Among them, `word-break` is an implementation from early `WebKit` browsers, which added a non-standard property value of `break-word`. The problem here lies in the fact that in `CSS` layout calculations, there is a process called `Intrinsic Size`—that is, inherent size computation. If we set the container's width to `min-content`, the container collapses to the width of a single letter.

```html
<style>
  .wrapper { background: #eee; padding: 10px; width: min-content; border: 1px solid #999; }
  .standard { overflow-wrap: break-word; }
  .legacy { word-break: break-word; }
</style>
<h3>overflow-wrap: break-word</h3>
<div class="wrapper standard">
  Supercalifragilistic
</div>
<h3>word-break: break-word</h3>
<div class="wrapper legacy">
  Supercalifragilistic
</div>
```

## Lifecycle Synchronization
From the very beginning of the editor's design, we have separated the core layer from the view layer. To enable more flexible scheduling of the editor, we have relinquished control of the editor's instantiation timing to the user. In this scenario, exposing the `Editor`'s `ref/useImperativeHandle` interface implementation allows us to avoid setting a `null` state. The typical scheduling method resembles the following implementation:

```js
const Editor = () => {
  const editor = useMemo(() => new Editor(), []);
  return <Editable editor={editor} />;
}
```

Additionally, we need the editor to render properly when executing `SSR` or generating `SSG` static pages. Generally, we need to independently control the timing of the editor's `DOM` operations, ensuring that no `DOM` operations are carried out during the instantiation of the editor. Only once the `DOM` state is ready will those operations take place. The most common timing for this is the side effect `Hook` of the component rendering.

```js
const Editable: React.FC = (props) => {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    el && editor.mount(el);
  }, [editor]);
  return <div ref={ref}></div>;
}
```

However, in this situation, the lifecycle of the editor's instantiation must be synchronized with the lifecycle of the `Editable` component to ensure that the state of the editor remains consistent with the state of the view layer. For example, in the following scenario, if the lifecycle of the `Editable` component does not align with that of the `Editor` instance, it will lead to the unloading of all plugins in the view.

```js
const Editor = () => {
  const editor = useMemo(() => new Editor(), []);
  const [key, setKey] = useState(0);
  return (
    <Fragment>
      <button onClick={() => setKey((k) => k + 1)}>Toggle</button>
      {key % 2 ? <div><Editable editor={editor} /></div> : <Editable editor={editor} />}
    </Fragment>
  );
}
```

In the above example, it is actually fine if the `Editable` component has a consistent hierarchy. Even with conditional branches, `React` will reuse it directly. However, if the hierarchy is inconsistent, it will lead to the unloading and remounting of the `Editable` component. Essentially, this is a lifecycle issue of the components. Therefore, it can be inferred that if components are at the same level, setting them to different `key` values will trigger the same effect.

```js
const Editor = () => {
  const editor = useMemo(() => new Editor(), []);
  const [key, setKey] = useState(0);
  return (
    <Fragment>
      <button onClick={() => setKey((k) => k + 1)}>Toggle</button>
      <Editable key={key} editor={editor} />
    </Fragment>
  );
}
```

The core of the issue here is that the `useEffect` hook of the `Editable` component triggers a cleanup function when the component is unmounted, while the instantiation of the editor occurs at the outermost level. Therefore, the timings of the editor's instantiation and unmounting cannot be aligned. When unmounted, all the functionalities of the editor will be destroyed, leaving only a plain text `DOM` structure.

```js
useLayoutEffect(() => {
  const el = ref.current;
  el && editor.mount(el);
  return () => {
    editor.destroy();
  };
}, [editor]);
```

Additionally, after instantiating a standalone editor, you cannot use multiple `Editable` components to achieve the functionality of the editor. In other words, each editor instance must correspond to a single `Editable` component. Managing multiple editor components can lead to confusion in the overall editor state.

```js
const Editor = () => {
  const editor = useMemo(() => new Editor(), []);
  return (
    <Fragment>
      <Editable editor={editor} />
      <Editable editor={editor} />
    </Fragment>
  );
}
```

To avoid similar issues, we should maintain consistency with the original implementation approach. This means that the entire editor component should be merged into a standalone component. Therefore, the component that encounters issues should take the following form, where the instantiated editor and `Editable` components are combined into a single component, allowing the lifecycle to be completely aligned instead of leaving it to the user to implement.

```js
const Editor = () => {
  const editor = useMemo(() => new Editor(), []);
  return <Editable editor={editor} />;
};

const App = () => {
  const [key, setKey] = useState(0);
  return (
    <Fragment>
      <button onClick={() => setKey((k) => k + 1)}>Toggle</button>
      {key % 2 ? <div><Editor /></div> : <Editor />}
    </Fragment>
  );
}
```

In fact, we could encapsulate the behavior of instantiating the editor within the `Editable` component, but for more flexible editor scheduling, it’s more appropriate to place the instantiation in the outer layer. Moreover, from the above `Effect`, it’s evident that the lifecycle aligned with `onMount` should actually be `Unmount`. Therefore, it is more pertinent to handle the editor's DOM unmounting event.

However, if we break down the relevant events into finer granularity, we would need to define the `onMount` and `onUnmount` lifecycle methods in plugins as well, which would allow better control over the timing of related operations. In this scenario, though, users would require more complex plugin logic, needing to explicitly identify when to bind and unbind events related to the `DOM`.

Even with the finer granularity of lifecycles separated out, the timing for the editor's unmount still needs to be called actively. If not called proactively, there could be possible memory leak issues. Users may bind events directly to the `DOM` in their plugin implementations, and these events need to be explicitly unbound upon editor unmounting, putting some cognitive burden on users to learn all related agreements.

In reality, achieving finer granularity in lifecycles would lead to more efficient implementation of the entire editor. After all, if we can avoid instantiating the editor, we can minimize unnecessary state changes and event bindings. Thus, a compromise is made here: if users wish to avoid the editor’s unmount event, they can utilize the `preventDestroy` parameter to handle this, allowing users to manually unmount when the editor instantiation lifecycle ends.

```js
export const Editable: React.FC<{
  /**
   * Prevent the editor from being actively destroyed
   * - Use with caution; the editor must be destroyed when the lifecycle ends
   * - Ensure values remain immutable; otherwise, it may lead to multiple mounts of the editor
   */
  preventDestroy?: boolean;
}> = props => {
  const { preventDestroy } = props;
  const { editor } = useEditorStatic();

  useLayoutEffect(() => {
    const el = ref.current;
    el && editor.mount(el);
    return () => {
      editor.unmount();
      !preventDestroy && editor.destroy();
    };
  }, [editor, preventDestroy]);
}
```

## State Management
When it comes to state management, we need to start from scratch. Here, we will first implement a full-update mode, but the architectural design should allow for an incremental update mode in the future. Considering communication and state management between the core layer and the view layer, we wonder if using `Context/Redux/Mobx` could eliminate the need to manually maintain various state objects while achieving local refreshes instead of refreshing the entire page.

Upon deeper consideration, this approach seems unfeasible. Taking `Context` as an example for managing state, even with `immer.js`, it appears impossible to achieve local refreshes since the entire `delta` data structure cannot fully correspond to `props`. Certainly, we can use `op & attributes` as `props` and then convert the data within components, but this seems to not alleviate the need to maintain a state object.

The fundamental requirement here is to maintain a `LineState` object, as each `op` may have a state association with either the previous or the next operation, along with line attributes that need to be managed. Therefore, a basic `LineState` object is indispensable. Additionally, given the need for a plugin architecture, all the `props` provided to the `react` component can actually be handled within the plugins.

If we use `immer`, it seems we only need to ensure that the parameters provided by the plugins remain unchanged. However, every single `LineState` will re-trigger the plugin's `render` method. This does lead to some inefficiency: even if we can guarantee immutable data and avoid `re-rendering`, any destructuring or manipulation done on this object within the plugin will trigger an update.

Since the `LineState` object is unavoidable, we can abstract a `BlockState` on top of it to manage `LineState`. By using the `ContentChange` event as a bridge, this layered management approach allows for precise updates to each line, thereby reducing performance costs. In fact, it could enable exact recognition of which specific `op`s triggered the updates, making completely accurate updates possible.

Reflecting back on the initial implementation of the `State` module to update document content, we recreated all `LineState` and `LeafState` objects directly. We then listened for the `OnContentChange` event within the `BlockModel` of the `React` view layer to apply updates from `BlockState` to the view layer.

```js
delta.eachLine((line, attributes, index) => {
  const lineState = new LineState(line, attributes, this);
  lineState.index = index;
  lineState.start = offset;
  lineState.key = Key.getId(lineState);
  offset = offset + lineState.length;
  this.lines[index] = lineState;
});
```

This method is straightforward and guarantees full-state updates in `React`. However, the downside is performance; with very large documents, full recalculations can lead to a significant amount of state reconstruction. Additionally, these changes will trigger `React`'s `diff` process, resulting in a complete update of the document view—a performance cost that is often unacceptable.

That said, the approach of listening for the `OnContentChange` event to update the view is perfectly valid and serves as an important link between the core editing functionality and the view layer. The `React` view update requires `setState` to trigger state changes, so by triggering updates from the core layer’s `OnContentChange` event, the state updates can be effectively applied to the view layer.

```js
const BlockView: FC = props => {
  const [lines, setLines] = useState(() => state.getLines());

  const onContentChange = useMemoFn(() => {
    setLines(state.getLines());
  });
}
```

An interesting aspect to note here is that if we synchronously trigger multiple state updates in the core layer, this could lead to numerous updates in the view layer. This is a fairly common scenario; when an event impacts the state model, it may invoke several commands that generate multiple `Op`s. If each `Op` triggers a view synchronization, the cost can be quite substantial.

However, in `React`, the situation isn’t as dire as it might seem because `React` merges asynchronous view updates. Nevertheless, we can still avoid multiple ineffective updates and lessen the overhead of state setting in `React`. The logic is straightforward: when synchronously updating state, we guard the `React` state updates with a state variable until the asynchronous operation occurs, at which point we update the view layer.

In the following code snippet, we could illustrate the synchronous wait for a refresh queue as `||||||||`, where each `|` represents a state update. Upon entering the update step with the first `|`, the asynchronous queue will wait, while the synchronous queue is entirely guarded due to `!flushing`. After the main thread finishes execution, the asynchronous queue starts, receiving the latest data for batch re-rendering.

```js
/**
 * Synchronous data changes, asynchronous batch rendering changes
 */
const onContentChange = useMemoFn(() => {
  if (flushing.current) return void 0;
  flushing.current = true;
  Promise.resolve().then(() => {
    flushing.current = false;
    setLines(state.getLines());
  });
});
```

Returning to the task of updating, even if all `LineState` and `LeafState` instances are completely rebuilt, it’s essential to find their original `LineState` whenever possible to reuse their `key` values, thereby avoiding a complete re-mount of the entire line. Of course, even if the `key` values are reused, since the `State` instance is reconstructed, `React` will still proceed with the subsequent `re-render` process.

Such a full update naturally leads to performance wastage, especially since our data models are based on atomic `Op`. Not implementing incremental updates is inherently unreasonable. Therefore, we need to establish the logic for incremental updates at the core layer, utilizing mechanisms like `Immutable` state sequence objects and reuse of `Key` values. The view layer also needs to leverage `memo` and similar tools to avoid unnecessary rendering.

## Rendering Mode
What we aim to achieve is a communication architecture that separates the view layer, essentially using `React` for all rendering, akin to the architectural design of `Slate`. When `Facebook` launched its `Draft` rich text engine, it utilized pure `React` for rendering. However, `Draft` is no longer maintained and has since transitioned to `Lexical`.

Later, I discovered that although `Lexical` was developed by `Facebook`, it doesn't utilize `React` for rendering. This can be inferred from the absence of `Fiber` in the `DOM` nodes, confirming that standard nodes are definitely not rendered by `React`. While it's true that using `React` can lead to performance issues and may cause crashes in uncontrolled modes, being able to directly reuse the view layer is still valuable.

The `README` of `Lexical` indicates that it supports `React`. This support actually means that only `DecoratorNode` can be rendered using `React`. For instance, if you add the `ExcaliDraw` drawing board component in the `Playground`, you'll notice that `DOM` nodes outside of the `svg` are rendered by `React`, indicating that `React` components are specifically mounted.

In the example below, you can see that the `p` tag includes properties injected by `lexical`, while the child `span` tag is a `lexical` decorator node meant for rendering `React` components; this portion is not rendered by `React`. Notably, the `button` tag is clearly rendered by `React`, as it possesses properties related to `Fiber`, further confirming the separation of rendering modes.

```html
<!-- 
  __lexicalKey_gqfof: "4"
  __lexicalLineBreak: br
  __lexicalTextContent: "\n\n\n\n" 
-->
<p class="PlaygroundEditorTheme__paragraph" dir="auto">
  <!-- 
    __lexicalKey_gqfof: "5"
    _reactListening2aunuiokal: true
  -->
  <span class="editor-image" data-lexical-decorator="true" contenteditable="false">
    <!-- 
      __reactFiber$zski0k5fvkf: { ... }
      __reactProps$zski0k5fvkf: { ... }
    -->
    <button class="excalidraw-button "><!-- ... --></button>
  </span>
</p>
```

This implies that only `Void/Embed` type nodes are rendered by `React`, while other content consists of standard `DOM` structures. It feels somewhat reminiscent of the Renaissance; when using `Quill`, if it requires pairing with `React`, you typically need to employ `ReactDOM.render` to mount `React` nodes.

Another note about `Lexical` is that any coordinating functions must begin with the `$` symbol, which evokes a sense of PHP-style Renaissance. The framework implemented by `Facebook` tends to favor certain conventions, such as with `React`'s `Hooks` functions, which all need to start with `use`, creating a sort of cognitive load.

Interestingly, I didn't see any use of `ReactDOM.render` in `Lexical`, making it difficult to comprehend how `React` nodes are rendered onto the `DOM`. Upon investigating `useDecorators`, I discovered that `Lexical` actually uses the `createPortal` method for rendering.

```js
// https://react-lab.skyone.host/
const Context = React.createContext(1);
const Customer = () => <span>{React.useContext(Context)}</span>;
const App = () => {
  const ref1 = React.useRef<HTMLDivElement>(null);
  const ref2 = React.useRef<HTMLDivElement>(null);
  const [decorated, setDecorated] = React.useState<React.ReactPortal | null>(null);
    
  React.useEffect(() => {
    const div1 = ref1.current!;
    setDecorated(ReactDOM.createPortal(<Customer />, div1));
    const div2 = ref2.current!;
    ReactDOM.render(<Customer />, div2);
  }, []);
    
  return (
    <Context.Provider value={2}>
      {decorated}
      <div ref={ref1}></div>
      <div ref={ref2}></div>
      <Customer></Customer>
    </Context.Provider>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
```

Using this approach achieves a result that is essentially similar to `ReactDOM.render`, but `createPortal` allows for free usage of `Context`, and its rendering location in the `React` tree corresponds to where the user has mounted it. The main reason for discussing this part is that our view layer's rendering does not strictly rely on the framework for rendering; separating the rendering model can also be a compatible approach for performance and ecosystem considerations.

## DOM Mapping State
In implementing an `MVC` architecture, theoretically, the controller layer and the view layer operate independently, and the controller does not perceive the state of the view layer. However, in our specific implementation, the `DOM` of the view layer needs to be handled by the controller layer—for example, in event binding, selection control, clipboard operations, etc. Thus, it becomes a relevant issue on how to enable the controller layer to manipulate the corresponding `DOM`.

Theoretically, our design on `DOM` is fairly strict, meaning that `data-block` nodes are block-level nodes, `data-node` nodes are inline-level nodes, and `data-leaf` nodes are inline nodes. A `block` node can only contain `node` nodes, while a `node` node can only contain `leaf` nodes.

```html
<div contenteditable style="outline: none" data-block>
  <div data-node><span data-leaf><span>123</span></span></div>
  <div data-node>
    <span data-leaf><span contenteditable="false">321</span></span>
  </div>
  <div data-node><span data-leaf><span>123</span></span></div>
</div>
```

In this context, we can traverse the `DOM` nodes at the controller layer to obtain relevant states or use methods such as `querySelectorAll`, `createTreeWalker`, etc., to access the relevant nodes. However, such operations can lead to numerous ineffective traversals, so we need to consider whether there is a more efficient way to obtain the necessary nodes.

In `React`, we can use `ref` to access the relevant nodes. Therefore, we need to figure out how to map the `DOM` node objects to the corresponding editor objects. Since we have multiple state objects, we can fully map these objects to the corresponding primary `DOM` structure, and in `Js`, we can use `WeakMap` to maintain weak references.

```js
export class Model {
  /** DOM TO STATE */
  protected DOM_MODEL: WeakMap<HTMLElement, BlockState | LineState | LeafState>;
  /** STATE TO DOM */
  protected MODEL_DOM: WeakMap<BlockState | LineState | LeafState, HTMLElement>;

  /**
   * Map DOM - LeafState
   * @param node
   * @param state
   */
  public setLeafModel(node: HTMLSpanElement, state: LeafState) {
    this.DOM_MODEL.set(node, state);
    this.MODEL_DOM.set(state, node);
  }
}
```

In the `ref` callback function of a `React` component, we need to map the `DOM` node to the `LeafState` using the `setLeafModel` method. In `React`, the relevant execution sequence is `ref -> layout effect -> effect`, and it is essential to ensure that the reference remains unchanged. Otherwise, the callback may be invoked multiple times during `re-render` in a `null/span` state.

```js
export const Leaf: FC<LeafProps> = props => {
  /**
   * Handle ref callback
   */
  const onRef = useMemoFn((dom: HTMLSpanElement | null) => {
    dom && editor.model.setLeafModel(dom, lineState);
  });

  return (
    <span ref={onRef} {...{ [LEAF_KEY]: true }}>
      {props.children}
    </span>
  );
};
```

## Summary
Previously, we primarily discussed the design of the model layer and core layer, which includes the data model and the core interaction logic of the editor, as well as some foundational implementations related to `DOM`. We also emphasized the synchronization of selection state, input state synchronization, and addressed compatibility issues in the browser for relevant implementations.

In this current section, we mainly focus on the adapter design of the view layer, particularly the full initialization rendering of the view, covering lifecycle synchronization, state management, rendering modes, `DOM` mapping states, and more. Next, we need to handle incremental updates for changes, which pertains to performance optimization, and we must consider how to minimize `DOM` and `Op` operations, as well as how to implement incremental rendering in `React`.

## Daily Question

- <https://github.com/WindRunnerMax/EveryDay>

## References

- <https://18.react.dev/>
- <https://zh-hans.react.dev/reference/react/useImperativeHandle>
- <https://developer.mozilla.org/en-US/docs/Glossary/Character_reference>