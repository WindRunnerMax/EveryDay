# Editor Architecture Design Based on MVC Pattern

In the previous planning, we needed to implement an editor architecture based on the `MVC` pattern, splitting the application into three core components: controller, model, and view. When a command is executed through the controller, the current data model is modified, which is then reflected in the rendering of the view. Simply put, it involves constructing a data model that describes the document structure and content and using a custom `execCommand` to modify the data model. This implementation of an `L1` level rich text editor, by abstracting the data model, addresses issues in rich text such as dirty data and challenges in implementing complex functionalities.

- Open Source Repository: <https://github.com/WindRunnerMax/BlockKit>
- Online Editor: <https://windrunnermax.github.io/BlockKit/>
- Project Notes: <https://github.com/WindRunnerMax/BlockKit/blob/master/NOTE.md>

Articles on implementing a rich text editor project from scratch:

- [Feeling Inadequate, Getting Started on Writing a Rich Text Editor from Scratch](./从零设计实现富文本编辑器.md)
- [Implementing a Rich Text Editor from Scratch #2 - Editor Architecture Design based on MVC Pattern](./基于MVC模式的编辑器架构设计.md)
- [Implementing a Rich Text Editor from Scratch #3 - Linear Data Structure Model based on Delta](./基于Delta的线性数据结构模型.md)
- [Implementing a Rich Text Editor from Scratch #4 - Core Interaction Strategy of Browser Selection Model](./浏览器选区模型的核心交互策略.md)
- [Implementing a Rich Text Editor from Scratch #5 - State Structure Representation of Editor Selection Model](./编辑器选区模型的状态结构表达.md)
- [Implementing a Rich Text Editor from Scratch #6 - Synchronization between Browser Selection and Editor Selection Model](./浏览器选区与编辑器选区模型同步.md)
- [Implementing a Rich Text Editor from Scratch #7 - Half-Controlled Input Mode based on Composite Events](./基于组合事件的半受控输入模式.md)

## Streamlined Editor
In the design of the entire system architecture, the most crucial core concept is **state synchronization**. If we take the state model as the foundation, then the state synchronization we need to maintain can be summarized into the following two aspects:

- Synchronizing user operation states to the state model. When users perform text-related operations such as selection, input, deletion, etc., changes need to be reflected in the state model.
- Synchronizing state model states to the view layer. When commands are executed in the controller, the newly updated state model resulting from the changes needs to be synchronized to the view layer to ensure consistency between data state and view.

In fact, these two state synchronizations are a forward dependent process: user operations lead to synchronization in the state model, and changes in the state model are then synchronized to the view layer, which in turn serves as the basis for user operations. For example, when a user selects a portion of text by dragging, the selected range needs to be synchronized to the state model. Subsequently, when a deletion operation is executed, the corresponding text in the data needs to be removed, followed by refreshing the view to display the new `DOM` structure. This cycle continues to ensure state synchronization, input execution, and view refresh in subsequent interactions.

Therefore, our primary goal is state synchronization. Although it may seem simple with just these two principles, it is not as straightforward in practice. When we perform state synchronization, we heavily rely on browser-related `APIs` such as selection, input, keyboard events, etc. At this point, we must address browser-related issues, like the inability of `ContentEditable` to fully prevent `IME` input or the compatibility issues of `EditContext` which require further enhancements, all of which are challenges to be tackled.

As we incorporate more browser `APIs` for implementation, the considerations for browser compatibility also increase. This is why many rich text editor implementations explore alternatives to `ContentEditable`, such as DingTalk's custom selection regions or Google Docs' `Canvas` document drawing. While these alternatives reduce reliance on certain browser `APIs`, they are still inherently tied to browser implementations. Even a document drawn with `Canvas` still relies on browser `APIs` for input handling, position calculations, and more.

Returning to our streamlined editor model, previous articles have mentioned the `ContentEditable` attribute and `execCommand` command. While using `document.execCommand` to modify `HTML` via commands may seem simple, its controllability is notably poor. The behavior of `execCommand` commands varies across browsers, presenting the browser compatibility behavior mentioned earlier. Unfortunately, these behaviors are beyond our control and are default behaviors of the browsers.

Therefore, to achieve greater extensibility, control, and resolve the mismatch between data and view, the `L1` rich text editor adopts the concept of a custom data model. By abstracting a data structure from the `DOM` tree, where identical data structures ensure consistent rendering of `HTML`, and directly controlling the data model with custom commands, the editor guarantees the consistency of the rendered HTML document. Regarding selection representation, continual normalization of the selection `Model` based on `DOM` selections is crucial.

This leads us to the topic of the `MVC` model architecture we are discussing today. We organize the editor project by managing related packages through a `monorepo` structure, naturally forming a layered architecture. However, before diving into that, we can implement the most basic editor in an `HTML` file initially [simple-mvc.html](https://github.com/WindRunnerMax/BlockKit/blob/master/examples/simple-mvc.html). Our focus will primarily be on implementing the basic ability to bold text, emphasizing control over the entire process. As for input capabilities, which pose a more complex challenge, we will address them in a separate section.

### Data Model
Firstly, we need to define the data model, comprising two parts: nodes describing document content and operations targeting data structures. Starting with describing the content of the document, we use a flat data structure to represent content and deliberately avoid multi-level `DOM` nesting to simplify the `DOM` structure description.

```js
let model = [
  { type: "strong", text: "123", start: 0, len: 3 },
  { type: "span", text: "123123", start: 3, len: 6 },
];
```

In the above data, `type` represents the node type, while `text` represents the text content. However, merely describing the data structure in the data model is not enough. We also need to include additional states to describe positional information, such as `start` and `len` in the data above. This part of the data is crucial for us to compute selection transformations.

Therefore, this data model section should not just be referred to as data, but should rather be termed as state. Next, we will focus on operations related to the data structure, specifically operations like insertion, deletion, and modification on the data model. Here, we have simply defined the operation of extracting data, while the complete `compose` operation can be referred to in [delta.ts](https://github.com/WindRunnerMax/BlockKit/blob/fae5a/packages/delta/src/delta/delta.ts#L255).

The operation of extracting data serves as the foundation for executing the `compose` operation. When we have the original text and change descriptions, we need to transform each into iterator objects to extract data separately, constructing a new data model in the process. The iterator part here first defines two methods, `peekLength` and `hasNext`, to determine if there is any remaining part of data that can be obtained and whether iteration can continue.

```js
peekLength() {
  if (this.data[this.index]) {
    return this.data[this.index].text.length - this.offset;
  } else {
    return Infinity;
  }
}

hasNext() {
  return this.peekLength() < Infinity;
}
```

The handling of the `next` method is more complex. Our main aim here is to acquire a portion of the `text`. Note that each call to `next` does not cross nodes, meaning that at most, `next` will take the length of the `insert` stored in the current `index`. If the content taken exceeds the length of a single `op`, theoretically its corresponding attributes are inconsistent, so they cannot be directly merged.

When calling the `next` method, if the `length` parameter does not exist, it defaults to `Infinity`. Then, we obtain the current node at `index`, calculate the remaining length of the current node, and if the `length` to be taken is greater than the remaining length, we take the remaining length; otherwise, we take the desired `length`. Subsequently, we extract the `text` content based on the `offset` and `length`.

```js
next(length) {
  if (!length) length = Infinity;
  const nextOp = this.data[this.index];
  if (nextOp) {
    const offset = this.offset;
    const opLength = nextOp.text.length;
    const restLength = opLength - offset;
    if (length >= restLength) {
      length = restLength;
      this.index = this.index + 1;
      this.offset = 0;
    } else {
      this.offset = this.offset + length;
    }
    const newOp = { ...nextOp };
    newOp.text = newOp.text.slice(offset, offset + length);
    return newOp;
  }
  return null;
}
```

Thus, we have briefly defined the state that describes the data model and the iterator that can be used to extract data structure. This section forms the foundation for describing the content and modifications of the data structure. Although we have simplified many details here, making it appear relatively simple, the actual implementation involves many complexities, such as implementing `immutable` to reduce redundant rendering and ensure performance.

### View Layer
The view layer is primarily responsible for rendering the data model. In this part, we can utilize `React` for rendering, but in this simple example, we can directly create `DOM` elements. Hence, here we iterate through the data model, create corresponding `DOM` nodes based on the node type, and then insert them into the `div` with `contenteditable`.

```js
const render = () => {
  container.innerHTML = "";
  for (const data of model) {
    const node = document.createElement(data.type);
    node.setAttribute("data-leaf", "true");
    node.textContent = data.text;
    container.appendChild(node);
    MODEL_TO_DOM.set(data, node);
    DOM_TO_MODEL.set(node, data);
  }
  editor.updateDOMselection();
};
```

Here we have additionally added the `data-leaf` attribute to mark leaf nodes for the purpose of updating selections that need to fall on a specific `DOM` node. The `MODEL_TO_DOM` and `DOM_TO_MODEL` mappings are used to maintain the relationship between the `Model` and the `DOM` since we need to retrieve corresponding values based on both `DOM` and `MODEL`.

This way, we have defined a very simple view layer, where performance issues are not a concern in the provided example. However, in a real-world scenario like in `React`, completing the view layer involves dealing with various challenges due to the behavior of uncontrolled `ContentEditable`, such as maintaining key values, checking for dirty `DOM` elements, minimizing redundant renders, batch scheduling refreshes, and correcting selections.

### Controller
The controller is the most complex part of our architecture, involving extensive logic. Our editor controller model needs to be implemented on top of the data structure and the view layer. Hence, we describe it last, coincidentally making it the last part of the `MVC` model sequence under `Controller`. The primary function at the controller layer is synchronization, which means keeping the data model and the view layer in sync.

For instance, our view layer is rendered based on the data model. If we input content at a certain node, we need to synchronize this content with the data model. Failing to sync the data model correctly can lead to issues with calculating the selection's length. This, in turn, can cause problems with synchronization of selection indices, where controlled and uncontrolled scenarios need to be differentiated.

First and foremost, we focus on synchronizing selections. Selections are fundamental to editor operations, where the selected state serves as the reference point for operations. The essence of synchronization lies in using browser APIs to sync with the data model. The browser's selection change can be tracked through the `selectionchange` event, allowing us to capture the latest selection information.

By using `window.getSelection()`, we can obtain the current selection's details, and then with `getRangeAt`, we can retrieve the `Range` object of the selection. Using this `Range` object, we can determine the start and end positions of the selection. With these start and end positions, we can obtain the corresponding positions through the previously established mapping.

```js
document.addEventListener("selectionchange", () => {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const { startContainer, endContainer, startOffset, endOffset } = range;
  const startLeaf = startContainer.parentElement.closest("[data-leaf]");
  const endLeaf = endContainer.parentElement.closest("[data-leaf]");
  const startModel = DOM_TO_MODEL.get(startLeaf);
  const endModel = DOM_TO_MODEL.get(endLeaf);
  const start = startModel.start + startOffset;
  const end = endModel.start + endOffset;
  editor.setSelection({ start, len: end - start });
  editor.updateDOMselection();
});
```

Obtaining the corresponding `DOM` node from the selection node is not always straightforward, as the browser's selection position rules are uncertain for our model. Therefore, we need to find the target leaf node based on the selection node. For instance, in the common text selection scenario, the selection is on a text node, while in a triple-click selection, it's on the entire line `DOM` node.

Hence, using `closest` here handles only the simplest text node selection. More complex situations require normalization. `DOM_TO_MODEL` serves as a state mapping, and once the latest selection positions are obtained, the actual selection position in the `DOM` needs to be updated for correcting the browser's selection state.

On the contrary, the `updateDOMselection` method works oppositely. While the event handling updates the `Model` selection based on the `DOM` selection, `updateDOMselection` updates the `DOM` selection based on the `Model` selection. At this point, having only `start/len`, finding the corresponding `DOM` is not straightforward, and thus, DOM node lookup is necessary.

```js
const leaves = Array.from(container.querySelectorAll("[data-leaf]"));
```

This involves considerable `DOM` searching, so in practical scenarios, it's important to limit the scope of selections as much as possible. In our actual design, we base the search on lines to look for `span` type nodes. Subsequently, we need to iterate through the whole `leaves` array, fetch the corresponding state using `DOM_TO_MODEL`, and then acquire the nodes and offsets required to construct the range.

```js
const { start, len } = editor.selection;
const end = start + len;
for (const leaf of leaves) {
  const data = DOM_TO_MODEL.get(leaf);
  const leafStart = data.start;
  const leafLen = data.text.length;
  if (start >= leafStart && start <= leafStart + leafLen) {
    startLeaf = leaf;
    startLeafOffset = start - leafStart;
    // When the selection is collapsed, `start` and `end` can be the same
    if (windowSelection.isCollapsed) {
      endLeaf = startLeaf;
      endLeafOffset = startLeafOffset;
      break;
    }
  }
  if (end >= leafStart && end <= leafStart + leafLen) {
    endLeaf = leaf;
    endLeafOffset = end - leafStart;
    break;
  }
}
```

Once we find the target `DOM` node, we can create a `modelRange` and set it as the browser's selection. However, it is important to check if the current selection is the same as the original one here. Imagine setting the selection again, it would trigger a `SelectionChange` event, causing an infinite loop, which definitely needs to be avoided.

```js
if (windowSelection.rangeCount > 0) {
  range = windowSelection.getRangeAt(0);
  // If the current selection is the same as the Model selection, no need to update
  if (
    range.startContainer === modelRange.startContainer &&
    range.startOffset === modelRange.startOffset &&
    range.endContainer === modelRange.endContainer &&
    range.endOffset === modelRange.endOffset
  ) {
    return void 0;
  }
}
windowSelection.setBaseAndExtent(
  startLeaf.firstChild,
  startLeafOffset,
  endLeaf.firstChild,
  endLeafOffset
);
```

Dealing with selections is not less complicated than dealing with input methods. Here, we simply synchronize the browser selection with our model selection and the key remains the synchronization of states. Next, we can synchronize the data model, in here it means implementing the actual command execution instead of using `document.execCommand` directly.

Now is the time to put our previously defined data iterator to use. The operation target also needs to be achieved using a `range`, for example, a text segment like `123123` with a selection of `start: 3, len: 2`, and a `strong` type, data within this interval will turn into `123[12 strong]3`, which involves truncating long data.

Firstly, we construct a `retain` array based on the selection we want to operate. Although this part should ideally use `ops` for operations, it would require more implementation of `compose`. Therefore, we simply use an array and an index here.

```js
let retain = [start, len, Infinity];
let retainIndex = 0;
```

We then need to define an iterator and merge it with the `retain` array. Here, we move the pointer with the `0` index and extract data within the index, change the `type` with the `1` index, and fix the `2` index as `Infinity` to cover all remaining data. The crucial `length` here is calculated as the minimum of the two values to perform data truncation effectively.

```js
const iterator = new Iterator(model);
while (iterator.hasNext()) {
  const length = Math.min(iterator.peekLength(), retain[retainIndex]);
  const isApplyAttrs = retainIndex === 1;
  const thisOp = iterator.next(length);
  const nextRetain = retain[retainIndex] - length;
  retain[retainIndex] = nextRetain;
  if (retain[retainIndex] === 0) {
    retainIndex = retainIndex + 1;
  }
  if (!thisOp) break;
  isApplyAttrs && (thisOp.type = type);
  newModel.push(thisOp);
}
```

In the end, remember that what we are maintaining is not just data representation, but also the description of the entire data state. Therefore, we still need to refresh all the data at the end to ensure the correctness of the final data model. At this point, we need to call `render` to re-render the view layer, and then refresh the browser's selection.

```js
let index = 0;
for (const data of newModel) {
  data.start = index;
  data.len = data.text.length;
  index = index + data.text.length;
}
render();
editor.updateDOMselection();
```

By doing this, we have defined a relatively complex controller layer. The controller layer here mainly synchronizes the data model and the state of the view layer, and implements the most basic command operations, of course, without handling many complex edge cases. In actual editor implementation, this part of the logic can be very complex because we need to deal with many issues such as input methods, selection models, clipboards, and so on.

## Project Architecture Design
With our basic editor `MVC` model implemented, it naturally can be abstracted into an independent `package`. Luckily, we manage the project in the form of a `monorepo`. Thus, we can abstract it into four core packages: `core`, `delta`, `react`, and `utils`, corresponding to the core logic of the editor, data model, view layer, and utility functions respectively. The specific editor module implementations are then defined in the form of plugins in the `plugin` package.

### Core
The `Core` module encapsulates the core logic of the editor, including modules such as clipboard, history operations, input handling, selection management, and state management. All these modules are referenced through an instantiated `editor` object. Besides the layered logic implementation, we also hope to achieve modularity in the modules by allowing extension capabilities. Modules can be referenced, extended, and then reloaded onto the editor.

```
Core
 ├── clipboard
 ├── collect
 ├── editor
 ├── event
 ├── history
 ├── input
 ├── model
 ├── perform
 ├── plugin
 ├── rect
 ├── ref
 ├── schema
 ├── selection
 ├── state
 └── ...
```

In fact, there are dependencies within the `Core` module itself. For example, the selection module depends on event module event dispatching. This is mainly because modules need to depend on instances of other modules during construction to initialize their own data and events. Therefore, the order of instantiation of modules becomes important, but when we actually talk about it, we simply follow the order as defined above, rather than following the direct dependencies directed acyclic graph order.

The `clipboard` module mainly handles data serialization and deserialization, as well as clipboard operations. Typically, the DOM structure of rich text editors may not be very standard. For instance, in `slate`, we see attributes like `data-slate-node`, `data-slate-leaf`, which can be understood as template structures.

```html
<p data-slate-node="element">
  <span data-slate-node="text">
    <span data-slate-leaf="true">
      <span data-slate-string="true">text</span>
    </span>
  </span>
</p>
```

Therefore, when serializing, it is necessary to serialize this complex structure into relatively standard `HTML`. Especially since many styles are not achieved using semantic tags, but through the `style` attribute, standardizing them becomes crucial.

Deserialization involves converting `HTML` into the editor's data model, which is essential for cross-editor content pasting. The internal data structures of editors are usually not consistent, so for cross-editors, a relatively standard intermediate structure is required. This is also an unwritten rule in editors, where serialization in editor `A` should be as standard as possible for editor `B` to deserialize effectively.

The `collect` module fetches related data based on selection data. For instance, when a user selects a portion of text and performs a copy operation, this module needs to extract the selected data content before serialization can occur. Additionally, the `collect` module can also retrieve an `op` node at a certain position, handle inherited `marks`, etc.

The `editor` module is a module aggregator for the editor, primarily responsible for managing the entire editor's lifecycle, such as instantiation, mounting the `DOM`, destruction, and other states. This module needs to combine all modules and also focus on organizing the modules' dependency relationships in a directed graph. Most of the essential editor `APIs` should be exposed by this module.

The `event` module is an event distribution module where native event bindings are implemented. All events within the editor should be dispatched from this module. This approach allows for greater customization space, such as extending plugin-level event execution. It can also reduce the probability of memory leaks because as long as we ensure that the editor's destruction method is called, all events can be correctly unmounted.

The `history` module maintains the history of operations in the editor. Implementing `undo` and `redo` in the editor is quite complex; we need to perform atomic operations rather than storing a snapshot of the editor's full data. It involves maintaining two stacks to handle data transfer. Additionally, we need to implement extensions on top of this, such as automatic grouping, operation merging, collaborative processing, etc.

Automatic grouping refers to merging consecutive high-frequency user operations into one operation. Operation merging means that we can implement merging through `APIs`, for instance, when a user uploads an image, performs other input operations, and then after a successful upload, the final operation should be combined with the image upload operation. Collaborative processing follows a principle that we can only undo our own operations and not the operations collaborated by others.

The `input` module handles input in the editor, where input is one of the core operations in the editor. We need to handle input methods, keyboard, mouse, and other input operations. Interacting with input methods requires a lot of compatibility handling, including candidate words, predictive words, shortcuts, accents, etc. Mobile input method compatibility is even more troublesome, with compatibility issues for mobile input methods outlined separately in `draft`.

For instance, a common example is that `ContentEditable` cannot truly prevent input from an `IME`, which means we cannot fully prevent Chinese input. In the example below, inputting English and numbers will not trigger a response, but Chinese can be input normally. This is one reason why many editors choose to customize the selection and input, such as `VSCode`, DingTalk documents, etc.

The `model` module is used to map the relationship between the `DOM` view and the state model. This part serves as a bridge between the view layer and the data model. Often, we need to retrieve the state model through the `DOM`, and vice versa, we might need to obtain the corresponding `DOM` view through the state model. This section uses a `WeakMap` to maintain mappings to achieve state synchronization.

The `perform` module encapsulates the basic module for executing changes to the data model. Since constructing basic `delta` operations can be complex, for instance, executing changes to the `marks` attribute requires filtering out the `\n` operation, while conversely, operations on line attributes need to filter out normal text operations. It's necessary to encapsulate these operations to simplify the cost of executing changes.

The `plugin` module implements the editor's plugin mechanism. Pluginization is essential, and theoretically, all formats beyond plain text should be implemented by plugins. The pluginization here mainly provides basic plugin definitions and types, manages the lifecycle of plugins, and includes capabilities such as grouping by method call, method dispatch priority, etc.

The `rect` module handles the position information of the editor. Often, we need to calculate the position based on `DOM` nodes and provide the node's relative position in the editor. Particularly in many additional capabilities, such as virtual scroll viewport locking, virtual layers for comparison views, height positioning for commenting capabilities, etc. Additionally, the position information of the selection is also important, such as the popup location of a floating toolbar.

The `ref` module implements the reference transfer of the editor's position, which actually utilizes collaborative `transform` to handle index information, similar to `Slate`'s `PathRef`. For example, when a user uploads an image, other content insertion operations may take place at the same time, causing the image's index value to change. Using the `ref` module allows us to obtain the latest index value.

The `schema` module is used to define the data application rules for the editor. Here, we need to define methods for data attributes to be processed. For example, bold marks need to inherit the bold attribute after input, while inline code inline types do not need to be inherited. Elements like images, horizontal lines should be defined as occupying a whole line as a `Void` type, while `Mention`, `Emoji`, etc., need to be defined as `Embed` types.


The `selection` module is used to handle selections in the editor, which are the core operational benchmarks. We need to manage selection synchronization, selection correction, and so on. In reality, selection synchronization is a very complex matter. Mapping from the browser's `DOM` to the selection model itself requires careful design, and selection correction involves handling a multitude of boundary cases.

As mentioned earlier, considering the following `DOM` structure, if we were to express a collapsed selection to the left of the character `4`, there could be various ways to achieve this position depending on the browser's default behavior. Therefore, we need to ensure the mapping of this selection ourselves, as well as the correction logic in unconventional states.

```js
// <span>123</span><b><em>456</em></b><span>789</span>
{ node: 123, offset: 3 }
{ node: <em></em>, offset: 0 }
{ node: <b></b>, offset: 0 }
```

The `state` module maintains the core state of the editor. After passing basic data during editor instantiation, the content we subsequently maintain becomes the state, rather than the originally passed data content. Our state modification methods will also be implemented here, especially in maintaining the state using `Immutable/Key`, ensuring the immutability of state to reduce redundant rendering.

```
                             |-- LeafState
             |-- LineState --|-- LeafState
             |               |-- LeafState            
BlockState --|
             |               |-- LeafState
             |-- LineState --|-- LeafState
                             |-- LeafState
```

### Delta
The `Delta` module encapsulates the editor's data model. We need to describe the editor's content and content changes based on the data model. Additionally, it encapsulates many operations on the data model such as `compose`, `transform`, `invert`, `diff`, `Iterator`, and others.

```
Delta
 ├── attributes
 ├── delta
 ├── mutate
 ├── utils
 └── ...
```

The `Delta` implementation is based on a transformation of `Quill`'s data model. `Quill`'s data model design is excellent, especially encapsulating methods for operational transformation based on `OT`. However, there are still some inconvenient aspects in the design. Therefore, referencing `EtherPad`'s data implementation, we have modified some parts of the implementation based on that, and we will elaborate on the data structure design in the future.

Furthermore, it is important to note that our `Delta` implementation is primarily used to describe documents and changes, serving as a form of serialization and deserialization. As mentioned, after initializing the editor, the data we maintain becomes an inherent state rather than the initially provided data content. Consequently, many methods at the controller level will have separate designs, such as maintaining the `immutable` state.

The `attributes` module maintains operations related to describing text attributes. We have simplified attribute implementation here, where `AttributeMap` defines a type of `<string, string>`. The specific module further defines methods such as `compose`, `invert`, `transform`, `diff`, to carry out operations like merging, reversing, transforming, and computing differences on attributes.

The `delta` module implements the entire editor's data model, where `delta` uses `ops` to represent a linear structure of the data model. The structures of the `ops` mainly include three types of operations: `insert` for inserting text, `delete` for deleting text, and `retain` for retaining text/moving pointers, along with methods like `compose`, `transform`, and others.

The `mutate` module implements an immutable version of the `delta` module and introduces `\n` as an independent operation. The initial design of the controller was based on data changes but has been transformed into maintaining the original state. Consequently, this implementation has been moved to the `delta` module, making it directly correspond to editor state maintenance, suitable for unit testing, among other purposes.

The `utils` module encapsulates helper methods for `op` and `delta`, with methods like `clone` for deep copying `op`, `delta`, and equivalent operations. Due to our new design, there is no need to introduce `lodash`'s related methods. Additionally, it includes methods for data checking and formatting, such as determining start/end of strings, splitting `\n`, and others.

### React
The `React` module serves as the adapter for the view layer, providing basic node types like `Text`, `Void`, `Embed`, and rendering modes that encapsulate a dispatch pattern in line with the `Core` mode. It also offers wrapped `HOC` nodes, `Hooks`, and methods to extend the view layer through plugins.

```
React
 ├── hooks
 ├── model
 ├── plugin
 ├── preset
 └── ...
```

The `hooks` module implements a method to retrieve the editor instance, making it convenient to access the editor instance in `React` components, which, of course, depends on our `Provider` component. Additionally, the read-only status method is also implemented here. The maintenance of the read-only status was originally maintained within the plugin itself, but later it was extracted into the `React` component, making it easier to switch between editing and read-only states.

The `model` module implements the built-in data model of the editor, which essentially corresponds to the `State` of the `Core` layer, i.e., the data model of `Block/Line/Leaf`. Apart from adhering to the patterns required by `DOM` nodes, other functionalities like dirty `DOM` detection methods are also implemented. Moreover, there is a special `EOL` node here, which is a special `LeafModel` that schedules the rendering of end-of-line nodes based on a specific strategy.

The `plugin` module implements the plugin mechanism of the editor. Here, pluginization mainly extends the basic plugin definitions and types. For example, the return value type of plugin methods defined in the `Core` as `any` needs to be specifically defined here as `ReactNode`. Furthermore, it implements plugins for rendering, which are types that do not maintain state at the core level, mainly for pluginizing node types of `Wrap`.

The `preset` module presets the API components exposed by the editor, such as `Context`, `Void`, `Embed`, `Editable` components, etc., mainly providing basic components for building the editor view and extending components at the plugin layer. It also encapsulates many interactive implementations, such as automatic focus, selection synchronization, view refresh adapters, etc.

### Utils
The `Utils` module implements many common utility functions, mainly to handle common logic within the editor, such as debounce, throttle, etc. It also includes helper methods for handling `DOM` structures, event dispatching methods, event binding decorators, list operations, internationalization, clipboard operations, etc.

```
Utils
 ├── debounce.ts
 ├── decorator.ts
 ├── dom.ts
 └── ...
```

## Summary
Here we have implemented a simple editor `MVC` architecture example, and from there, naturally abstracted the core modules of the editor, data model, view layer, utility functions, etc., followed by a brief description of each. In the future, we will describe the design of the editor's data model, introduce our `Delta` data structure method, and discuss relevant applications in the editor. Data structure design is crucial because the core operations of the editor are all based on the data model. Failing to understand the design of the data structure may lead to difficulties in comprehending many operational models of the editor.

## Daily Question

- <https://github.com/WindRunnerMax/EveryDay>

## References

- <https://developer.mozilla.org/en-US/docs/Web/API/EditContext>
- <https://www.oschina.net/translate/why-contenteditable-is-terrible>
- <https://stackoverflow.com/questions/78268797/how-to-prevent-ime-input-method-editor-to-mutate-the-contenteditable-element>