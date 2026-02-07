# Immutable State Management and Incremental Rendering
In our previous discussions, we focused on the design of view layer adapters, particularly concerning full initialization rendering, including lifecycle synchronization, state management, rendering modes, and `DOM` mapping states. Here, we need to handle incremental updates for changes, which is a performance consideration and requires an implementation of immutable state objects to facilitate `Op` operations while minimizing `DOM` changes.

- Open Source Repository: <https://github.com/WindRunnerMax/BlockKit>
- Online Editor: <https://windrunnermax.github.io/BlockKit/>
- Project Notes: <https://github.com/WindRunnerMax/BlockKit/blob/master/NOTE.md>

<details>
<summary><strong>Implementing a Rich Text Editor from Scratch Series</strong></summary>

- [Feeling utterly unskilled, I'm planning to try building a rich text editor from scratch](./从零设计实现富文本编辑器.md)
- [Implementing a Rich Text Editor from Scratch #2 - MVC Pattern-Based Editor Architecture Design](./基于MVC模式的编辑器架构设计.md)
- [Implementing a Rich Text Editor from Scratch #3 - Delta-Based Linear Data Structure Model](./基于Delta的线性数据结构模型.md)
- [Implementing a Rich Text Editor from Scratch #4 - Core Interaction Strategies for Browser Selection Model](./浏览器选区模型的核心交互策略.md)
- [Implementing a Rich Text Editor from Scratch #5 - State Structure Representation of Editor Selection Model](./编辑器选区模型的状态结构表达.md)
- [Implementing a Rich Text Editor from Scratch #6 - Synchronization of Browser and Editor Selection Models](./浏览器选区与编辑器选区模型同步.md)
- [Implementing a Rich Text Editor from Scratch #7 - Semi-Controlled Input Mode Based on Composite Events](./基于组合事件的半受控输入模式.md)
- [Implementing a Rich Text Editor from Scratch #8 - Uncontrolled DOM Behavior in Browser Input Mode](./浏览器输入模式的非受控DOM行为.md)
- [Implementing a Rich Text Editor from Scratch #9 - Controlled Handling of Editor Text Structure Changes](./编辑器文本结构变更的受控处理.md)
- [Implementing a Rich Text Editor from Scratch #10 - Pattern Extension of React View Layer Adapter](./React视图层适配器的模式扩展.md)
- [Implementing a Rich Text Editor from Scratch #11 - Immutable State Management and Incremental Rendering](./Immutable状态维护与增量渲染.md)

</details>

## Line-Level Immutable State
Here, we will not yet introduce rendering issues at the view layer but will implement detailed handling at the `Model` level. Specifically, we will create immutable state objects where only the nodes that are updated will be recreated, while others will be reused directly. This approach complicates the module's implementation, as it handles state objects directly without relying on frameworks like `immer`, so we'll start by considering a simple update model.

Going back to the initial implementation of the `State` module for updating document content, we directly rebuilt all `LineState` and `LeafState` objects and monitored the `OnContentChange` event in the `BlockModel` of the `React` view layer to apply updates to `BlockState`.

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

This method is straightforward, and a full state update ensures that the `React` state is updated. However, the performance issue arises when document content is very large; full computation leads to extensive state rebuilding, and these changes will result in `React`'s `diff`, consequently triggering a full update of the document view—this performance overhead is generally unacceptable.

Typically, we need to determine state updates based on changes. First, we need to define the granularity of updates, such as reusing the existing `LineState` when there are no changes at the line level. This means attempting to reuse the `Origin List` as much as possible while generating a `Target List`. This approach can obviously avoid rebuilding parts of the state, maximizing the reuse of original objects.

The overall strategy involves first executing transformations to produce the latest list, then setting the `row` and `col` pointer values for both the old and new lists, recording the starting `row` during updates. Deletions and additions can be handled as usual, while updates would be treated as a delete followed by an add. Content processing will require a separate discussion for single-line and multi-line cases, with the content in between treated as a rebuild operation.

Finally, we can place the incremental additions and deletions of `LineState` data into `Changes`, allowing us to obtain the actual `Ops` for additions and deletions. By doing this, we optimize performance since only the middle portion of the original list and target list needs to be rebuilt, while the other line states can be directly reused. Additionally, this data does not exist in the `apply`'s `delta`, and can also be considered as supplementary information.

```js
  Origin List (Old)                          Target List (New)
+-------------------+                      +-------------------+
| [0] LineState A   | <---- Retain ------> | [0] LineState A   | (Reused)
+-------------------+                      +-------------------+
| [1] LineState B   |          |           | [1] LineState B2  | (Update)
+-------------------+       Changes        |     (Modified)    | (Del C)
| [2] LineState C   |          |           +-------------------+
+-------------------+          V           | [2] NewState X    | (Inserted)
| [3] LineState D   | ---------------\     +-------------------+
+-------------------+                 \--> | [3] LineState D   | (Reused)
| [4] LineState E   | <---- Retain ------> | [4] LineState E   | (Reused)
+-------------------+                      +-------------------+
```

There are some important points that require our attention. We are currently maintaining a state model, which means that all updates are no longer direct `compose` operations, but rather manipulations of the state objects we have implemented. Essentially, we need to realize line-level `compose` methods, and the implementation here is crucial; any inaccuracies in how we handle the data could lead to issues with the state.

Furthermore, in this approach, our determination of whether a `LineState` needs to be newly created is based on all `LeafState` within the entire line. In other words, we must traverse all the `ops` again, and since we ultimately need to segment the `Delta` after `compose` into line-level content, we realistically need to traverse at least twice even after applying changes.

At this point, we need to consider optimization strategies. First, for the initial `retain`, we should directly and completely reuse the original `LineState`, including the remaining nodes after processing. For the intermediary nodes, we should design independent update strategies; theoretically, this portion needs to be completely handled as a new state object, which could reduce the traversal of certain `Leaf Ops`.

```js
new Delta().retain(5).insert("xx")
insert("123"), insert("\n") // skip 
insert("456"), insert("\n") // new line state
```

In this case, if a node is new, we simply construct a new `LineState`. Deleted nodes should not be included from the original `LineState` into the new list. As for updated nodes, we need to update the original `LineState` object since the line does undergo updates, and the key point is that we need to reuse the `key` value of the original `LineState`.

Here, we simply aim to describe the issue of reuse. A convenient implementation is to use `\n` as an identifier for targeting the `State`, which means we need to treat `\n` independently as a separate state. For instance, if we insert `\n` at the position indicated by `123|456`, then `123` would represent a new `LineState`, and `456` would be the original `LineState`, thereby allowing for the reuse of the `key`.

```js
[
  insert("123"), insert("\n"), 
  insert("456"), insert("\n")
]
// ===>
[ 
  LineState(LeafState("123"), LeafState("\n")), 
  LineState(LeafState("456"), LeafState("\n"))
]
```

It’s important to note that `LineState` does not have a corresponding `Op` in `Delta`, while the corresponding `LeafState` does have specific `Op`s. This means that when updating `LineState`, we cannot directly control it based on changes; we must find mappable states, and the simplest scheme is to map based on the `\n` nodes.

```js
LeafState("\n", key="1") <=> LineState(key="L1")
```

To summarize, initially, we considered updating first and then computing `diff`, but later we shifted to updating while also recording. The advantage of updating while recording is that it avoids the overhead of re-traversing all `Leaf` nodes while also mitigating the complexity of `diff`. However, there is a challenge: if multiple `retain` operations are performed internally, we cannot directly reuse `LineState`.
```

However, generally speaking, the most frequent operation is inputting content. In this case, the first operation is usually `retain`, and an empty tail operation will collect the remaining document content, meaning this optimization will often be triggered. On the other hand, if there are multiple content modifications, although we can determine whether to reuse the line object by checking if the leaf nodes within the line have changed, this comes with added complexity.

Regarding the specific implementation of this part, there is an independent `Mutate` module in the editor's state management system, which will be discussed separately when we cover the various modules later. At this point, we can implement a basic `Immutable` state maintenance system whereby if a `Leaf` node changes, its parent `Line` will trigger an update, while other nodes can be reused directly.

## Key Value Maintenance
At this stage, we have implemented a simple `Immutable Delta+Iterator` to handle updates. By leveraging immutability, we can facilitate the updating of `React` views. In `React`’s rendering model, managing `key` values is an essential topic of discussion.

Here, we can generate `key` values based on the immutability of the state, using a `WeakMap` to map to the associated string `id` values, which allows us to utilize key management and `React.memo` for view reuse. Initially, it appears that `key` values should only be actively controlled in instances requiring a forced refresh or when completely new nodes are introduced.

However, this approach poses challenges. For example, even when simple content is input, it can lead to the entire line's `key` changing unnecessarily. Hence, `key` values need to be maintained separately; we cannot directly use immutable objects to index `key` values. Using `index` as a `key` raises potential issues regarding in-place reuse.

In-place reuse of `key` values may result in incorrect preservation of a component's state. For instance, if there’s a list of uncontrolled input components and text has been entered in one of the fields, rearranging the inputs may leave the original content fixed in its initial position due to the unchanged overall list order `key`, leading `React` to reuse nodes directly.

In the maintenance of `key` values for the `LineState` node, the initial value is derived from an incrementing reference based on `state`, while during changes, the aim is to reuse the original line's `key` as much as possible, thus minimizing the reconstruction of line nodes and controlling forced refreshes of the entire line.

Initially, the `key` value for `LeafState` nodes directly uses `index` values, which introduces subtle issues. If we were to generate `key` values solely based on `Immutable`, any text content modification would cause `key` values to change, resulting in frequent DOM node reconstruction.

```js
export const NODE_TO_KEY = new WeakMap<Object.Any, Key>();
export class Key {
  /** Current node id */
  public id: string;
  /** Automatically incrementing identifier */
  public static n = 0;

  constructor() {
    this.id = `${Key.n++}`;
  }

  /**
   * Get id based on node
   * @param node
   */
  public static getId(node: Object.Any): string {
    let key = NODE_TO_KEY.get(node);
    if (!key) {
      key = new Key();
      NODE_TO_KEY.set(node, key);
    }
    return key.id;
  }
}
```

Using `index` as a `key` is typically feasible; however, in some uncontrolled scenarios, it may cause rendering issues due to in-place reuse. We will temporarily set aside the performance issues caused by the `diff` algorithm. In the example below, we can see that each time we remove an element from the top of the array, the actual effect on the `input` values appears to delete the elements at the tail. This highlights the issue of in-place reuse, which is particularly pronounced in uncontrolled circumstances, such as our `ContentEditable` component; thus, we need to revisit the approach to `key` values here.

```js
const { useState, Fragment, useRef, useEffect } = React;
function App() {
  const ref = useRef<HTMLParagraphElement>(null);
  const [nodes, setNodes] = useState(() => Array.from({ length: 10 }, (_, i) => i));

  const onClick = () => {
    const [_, ...rest] = nodes;
    console.log(rest);
    setNodes(rest);
  };

  useEffect(() => {
    const el = ref.current;
    el && Array.from(el.children).forEach((it, i) => ((it as HTMLInputElement).value = i + ""));
  }, []);
```

```jsx
return (
    <Fragment>
      <p ref={ref}>
        {nodes.map((_, i) => (<input key={i}></input>))}
      </p>
      <button onClick={onClick}>slice</button>
    </Fragment>
  );
}
```

Considering our earlier discussion about avoiding any changes in text content from triggering a change in the `key` value that would lead to a rebuild, we cannot directly use a computed `immutable` object reference to handle the `key` value. The only operation method left to describe a single `op`, aside from `insert`, is `attributes`.

However, if we base it on `attributes`, we would need to accurately control the merging of `insert`, requiring the use of the old object reference, and an `op` without attributes would be difficult to handle. Therefore, we might have to convert it to a string for processing, but this would similarly prevent maintaining complete stability of the `key`, as changes in the previous index would lead to subsequent values changing.

```js
const prefix = new WeakMap<LineState, Record<string, number>>();
const suffix = new WeakMap<LineState, Record<string, number>>();
const mapToString = (map: Record<string, string>): string => {
  return Object.keys(map)
    .map(key => `${key}:${map[key]}`)
    .join(",");
};
const toKey = (state: LineState, op: Op): string => {
  const key = op.attributes ? mapToString(op.attributes) : "";
  const prefixMap = prefix.get(state) || {};
  prefix.set(state, prefixMap);
  const suffixMap = suffix.get(state) || {};
  suffix.set(state, suffixMap);
  const prefixKey = prefixMap[key] ? prefixMap[key] + 1 : 0;
  const suffixKey = suffixMap[key] ? suffixMap[key] + 1 : 0;
  prefixMap[key] = prefixKey;
  suffixMap[key] = suffixKey;
  return `${prefixKey}-${suffixKey}`;
};
```

In `slate`, I previously believed that the generated `key` had a one-to-one correspondence with the nodes, meaning that whenever a node `A` changed, the hierarchy `key` representing it would necessarily change. However, upon further examination, I found that after updating to generate a new `Node`, it synchronously updates the `Path` and the `PathRef` corresponding to the `Node`, as well as its corresponding `key` value.

```js
for (const [pathRef, key] of pathRefMatches) {
  if (pathRef.current) {
    const [node] = Editor.node(e, pathRef.current)
    NODE_TO_KEY.set(node, key)
  }
  pathRef.unref()
}
```

Upon later examining the range model implemented by `Lexical`, I discovered that it uniquely identifies each leaf node using the `key` value, and selections are described based on this `key` as well. The overall structure is somewhat similar to the selection structure in `Slate`, or one could say, resembles a `DOM` tree structure. Here we focus on `Range` selections, but `Lexical` actually has three additional types of selections.

```js
{
  anchor: { key: "51", offset: 2, type: "text" },
  focus: { key: "51", offset: 3, type: "text" }
}
```

What is particularly important here is the state maintenance when the `key` value changes because the content of the editor needs to be editable. However, if we aim for `immutable`, it is clear that directly mapping `key` based on state object references would lead to the invalid recreation of the entire editor `DOM`. For instance, adjusting the level of a heading would cause a complete row rebuild due to the change in the entire row's `key`.

Thus, exploring how to reuse the `key` values as much as possible becomes a significant question. The `key` at our editor's row level is specially maintained, achieving both `immutable` property and `key` value reuse. Currently, the `key` of the leaf state is dependent on the `index` value. Therefore, if we investigate `Lexical`'s implementation, we can similarly apply this to maintaining our `key` values.

Through debugging in the `playground`, we can observe that even if we cannot determine if it is implemented as `immutable`, we can see that `Lexical` maintains `key` values in a somewhat left-biased manner. Therefore, in our editor implementation, we can adopt a similar approach, merging with direct adherence to left values for reuse, while if splitting starts at `0`, we directly reuse; if it starts with a non-`0`, we create a new `key`.
```

1. In the text `[123456(key1)][789(bold-key2)]`, remove the bold formatting from `789`, while keeping the `key` value of the entire text as `key1`.
2. In the text `[123456789(key1)]`, make the segment `789` bold, while keeping the `key` value of the text on the left `123456` as `key1`, and giving `789` a new `key`.
3. In the text `[123456789(key1)]`, make the segment `123` bold, while keeping the `key` value of the text on the left `123` as `key1`, and assigning a new `key` to `456789`.
4. In the text `[123456789(key1)]`, make the segment `456` bold, while keeping the `key` value of the text on the left `123` as `key1`, and assigning new `keys` to both `456` and `789`.

Thus, when editing in the editor, we also maintain the `key` in a slightly left-aligned manner. Since we need to keep it `immutable`, the expression here actually aims to reuse the previous `key` state as much as possible. This approach is similar to how `LineState` maintains the `key` values: first, a state is created, and then its `key` value is updated, though there are many details that need to be addressed.

```js
// Initial and clipping position is equivalent to NextOp => Immutable in-place reuse State
if (offset === 0 && op.insert.length <= length) {
  return nextLeaf;
}
const newLeaf = new LeafState(retOp, nextLeaf.parent);
// If the offset is 0, directly reuse the original key value
offset === 0 && newLeaf.updateKey(nextLeaf.key);
```

There is also another small issue: when we create `LeafState`, we immediately obtain the corresponding `key` value and then consider reusing the original `key`. This can lead to many unused `key` values being created, resulting in a significant numerical difference between `key` values during updates. However, this does not affect overall functionality and performance; it just looks odd during debugging.

Therefore, we can optimize this part of the performance by not immediately creating the `key` value upon creation, but rather setting the `key` value from the external context during initialization and updates. This implementation is quite similar to how we handle `index` and `offset`: we process all related values during the `update`, and strict checks are performed during development mode rendering.

```js
// BlockState
let offset = 0;
this.lines.forEach((line, index) => {
  line.index = index;
  line.start = offset;
  line.key = line.key || Key.getId(line);
  const size = line.isDirty ? line.updateLeaves() : line.length;
  offset = offset + size;
});
this.length = offset;
this.size = this.lines.length;
```

```js
// LineState
let offset = 0;
const ops: Op[] = [];
this.leaves.forEach((leaf, index) => {
  ops.push(leaf.op);
  leaf.offset = offset;
  leaf.parent = this;
  leaf.index = index;
  offset = offset + leaf.length;
  leaf.key = leaf.key || Key.getId(leaf);
});
this._ops = ops;
this.length = offset;
this.isDirty = false;
this.size = this.leaves.length;
```

Furthermore, during unit testing, it was found that maintaining a separate `key` value on `leaf` means that the special node `\n` would also have its own independent `key`. In this case, the `key` value maintained at the `line` level might as well reuse the `key` value of the `\n` `leaf`. Of course, this is only a theoretical implementation and might lead to unexpected refresh issues.

## Incremental View Rendering
In the initial design of the view module, our state management form was to perform a full `Delta` update, then use `EachLine` to iterate and rebuild all states. In fact, we maintained two data models: `Delta` and `State`, and establishing their mapping relationship incurs some overhead; the target state during rendering is `Delta`, not `State`.

This model inevitably consumes performance, as each time `Apply` is called, the entire document needs to be updated and the line state re-iterated. While it may not heavily burden performance when it comes to calculation iterations, since we are dealing with new objects each time, updating the view can cause greater performance loss, as computational efficiency is generally acceptable, but the cost of updating the view `DOM` is significantly higher.

In reality, reusing the `key` value solves the issue of avoiding the complete re-mounting of the line state view. Even though we reuse the `key`, since the entire `State` instance is reconstructed, `React` will continue with the subsequent `re-render` process. Therefore, what we need to address here is how to avoid the view `re-render` as much as possible in the absence of changes.

Due to our implementation of row-level immutable state management, we can directly compare the references of state objects in the view to determine whether a re-render is necessary. Therefore, we only need to enhance the `ViewModel` nodes with `React.memo`. In this scenario, there's no need to rewrite the comparison function; we can simply rely on our `immutable` state reuse to achieve the desired effect.

```js
const LeafView: FC<{ editor: Editor; leafState: LeafState; }> = props => {
  return (
    <span {...{ [LEAF_KEY]: true }} >
      {runtime.children}
    </span>
  );
}
export const LeafModel = React.memo(LeafView);
```

Similarly, the `LineView` also needs to incorporate `memo`. Furthermore, since the component itself may experience internal state changes—such as controlling `Composing` combined input—we will use `useMemo` for internal node calculations to cache the results and avoid repeated computations.

```js
const LineView: FC<{ editor: Editor; lineState: LineState; }> = props => {
  const elements = useMemo(() => {
    // ...
    return nodes;
  }, [editor, lineState]);
  return (
    <div {...{ [NODE_KEY]: true }} >
      {elements}
    </div>
  );
}
export const LineModel = React.memo(LineView);
```

The view refresh still directly controls the reference of the `lines` state. The core content changes and view layer re-renders depend directly on event module communication. Since each access to the `lines` state generates a new reference, `React` interprets this as a state change, thereby triggering a re-render.

```js
const onContentChange = useMemoFn(() => {
  if (flushing.current) return void 0;
  flushing.current = true;
  Promise.resolve().then(() => {
    flushing.current = false;
    setLines(state.getLines());
  });
});
```

Even though rendering is triggered, the existence of `key` and `memo` enables comparison based on the `line` state. The `LineModel` view will only trigger the update logic if the reference of the `LineState` object changes; otherwise, it will reuse the original view. We can directly observe this using `React`'s `devtools` recording or `Highlight`.

The incremental update of views is relatively straightforward, as the logic for implementing immutable objects and maintaining `key` values is handled at the core layer. The view layer primarily relies on this to calculate whether a re-render is necessary. A similar implementation can also be applied in low-code scenarios; after all, rich text essentially functions as a zero-code editor, where the elements assembled are not components but text.

## Conclusion
Previously, we mainly discussed the design of the view layer's adapter, focusing on full view initialization rendering and the rules governing the state model's structural correspondence to the `DOM`. Here, we primarily consider performance optimizations during update processing, concentrating on minimizing `DOM` and `Op` operations, maintaining `key` values, and realizing incremental rendering in `React`.

Next, we need to consider how to prevent the specified `DOM` structure from being disrupted when inputting content, mainly involving dirty `DOM` checks, selection updates, and rendering `Hooks`. These topics were discussed in detail in the processing of input methods in sections `#8` and `#9`, so we won't delve into them here again.

We should now discuss preset components for editing nodes, such as zero-width characters, `Embed` nodes, `Void` nodes, etc. The goal is to provide preset components for the editor's plugin extensions, which include some default behaviors and also predefine parts of the `DOM` structure, enabling editor operations within specified constraints.

## Daily Challenge

- <https://github.com/WindRunnerMax/EveryDay>

## References

- <https://18.react.dev/>
- <https://18.react.dev/reference/react/memo>
- <https://18.react.dev/reference/react/useMemo>