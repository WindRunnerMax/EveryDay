# Component Presets for Editable Nodes in React
Previously, we optimized performance during content updates by minimizing the `Op` operation `DOM` changes, maintaining `key` values, and implementing incremental rendering in `React`. Next, we need to discuss component presets for editable nodes such as zero-width characters, `Embed` nodes, `Void` nodes, etc., which provide default behaviors for editor plugin extensions.

- Open Source Address: <https://github.com/WindRunnerMax/BlockKit>
- Online Editor: <https://windrunnermax.github.io/BlockKit/>
- Project Notes: <https://github.com/WindRunnerMax/BlockKit/blob/master/NOTE.md>

<details>
<summary><strong>Series of Articles on Building a Rich Text Editor from Scratch</strong></summary>

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
- [Implementing a Rich Text Editor from Scratch #12 - Component Presets for Editable Nodes in React](./React可编辑节点的组件预设.md)

</details>

## Overview
Rich text editors are called "rich" not only because they support text formatting but also because they can accommodate the insertion of images, videos, `Mentions`, and other content. From the outset, we've pointed out that creating a controlled editor calls for a meticulously designed `DOM` structure to enable accurate node searching and manipulation. Consequently, supporting these nodes still requires establishing a preset `DOM` structure.

However, nodes like images must be implemented by developers, making the `DOM` structure completely uncontrollable at the editor framework level. Therefore, we need to agree on nesting different `HOC` components for various types of components, which will manage the default `DOM` structure and behaviors. For example, the component below fixes the outer structure, allowing developers to utilize it directly.

```js
export const HOC: FC = () => {
  return (
    <div onMouseDown={defaultBehavior}>
      <span>{"\u200B"}</span>
      <div contentEditable={false}>
        <img src={src} alt={alt} />
      </div>
    </div>
  );
}
```

Additionally, there is the issue of non-text node selections. Typically, selections occur on text nodes; that is, the nodes retrieved via the `Selection` object are of `text` type. However, in certain situations, there may be selections on non-text nodes. For example, when triple-clicking a text line, the entire line may be selected, and at this point, the `anchor` node will be the first `text` node, while the `focus` node will be the line node of the next row.

```js
{
  anchorNode: text,
  anchorOffset: 0,
  focusNode: div, // <div data-node="true">...</div>
  focusOffset: 0,
}
```

Cases like this require correction, adjusting the selection back to a text type node. It's especially important to note that the `focus` node here is the node of the next line, so the correction target is the text node at the start of the next line, `offset: 0`. Thus, this `Model` selection can correspond to the `0 offset` position in the selection across two lines, which also needs to sync with the `DOM` selection.

The search logic implemented in the editor largely references the approach used by `slate`, aiming to find editable child nodes. It starts by calling `getEditableChildAndIndex` to search for first-level child nodes, serving as a preliminary check to determine the subsequent iteration direction. It continues to search in a `DFS` manner, endeavoring to find editable nodes at each level.

It's worth mentioning that after handling incremental changes in the previous article, the next challenge is ensuring that the preset `DOM` structure remains intact when inputting content, which also applies to the components defined in this article. This involves dirty `DOM` checks, selection updates, rendering `Hook`s, and more. However, these topics have already been thoroughly discussed in sections `#8` and `#9` concerning input methods, so we won't revisit them here.

## Zero-width Characters
As the name suggests, zero-width characters have no width, making it easy to deduce that these characters do not visually appear. Therefore, these characters can serve as invisible placeholders to achieve special effects. For example, they can be used for information hiding, creating watermarks, or sharing encrypted information. Certain novel sites use this method and font replacements to trace piracy.

### Text Selection Model
Visually, zero-width characters are not displayed because they have zero width, but in an editor, they are quite significant. Simply put, we need these characters to position the cursor and create additional display effects. It is important to note that we are referring to editors implemented with `ContentEditable`; if it is a self-drawn selection editor, this part of the design may not be necessary.

This is closely related to the design of the editor. If we introduce block-level structures, meaning that the selection effect for these image nodes and similar elements is implemented independently rather than relying on the browser's text selection model, theoretically, zero-width characters are not needed. For instance, in Feishu documents, the image block structure does not have embedded zero-width characters, which can be contrasted against our implementation that incorporates zero-width character selection effects.

```html
<!-- Feishu Document -->
<div class="image-block-width-wrapper flash-block-content">
  <div class="resizable-wrapper" contenteditable="false">
    <img />
  </div>
</div>

<!-- With Zero-width Character Selection -->
<span data-leaf="true">
  <span data-zero-space="true" data-zero-void="true">&ZeroWidthSpace;</span>
  <div class="block-kit-image-container" contenteditable="false" data-void="true">
    <img />
  </div>
</span>
```

However, the reality is not so ideal. Taking Feishu documents as an example, even if block-level selections are implemented independently, the situation of mixed selections cannot be avoided. This means users can select both images and text simultaneously in the browser, which prevents the blocking of mixed selections. Hence, we still rely on zero-width characters as selection points. In Feishu documents, zero-width characters are placed both above and below block-level nodes.

```js
<div class="block docx-image-block" data-block-type="image" data-block-id="65">
  <div class="docx-block-zero-space"><span data-zero-space="true">&ZeroWidthSpace;</span></div>
  <div contenteditable="false"><img /></div>
  <div class="docx-block-zero-space"><span data-zero-space="true">&ZeroWidthSpace;</span></div>
</div>
```

Returning to the design of our editor, we only need to provide a common component for use by `Void` and `Embed` nodes. Of course, while implementing this, we need to mark the related types to determine the corresponding styles; for example, a zero-width character of `Void` type should not display the cursor, but a zero-width character of `Embed` type may need to maintain the cursor.

```js
/**
 * Zero-width character component
 * - void hide => a standalone empty node, e.g., Image
 * - embed => embedded node, e.g., Mention
 * - enter => placeholder at the end of the line, reserved for EOLView
 * - len => placeholder length for empty nodes, in conjunction with Void/Embed
 * @param props
 */
export const ZeroSpace: FC<ZeroSpaceProps> = props => {
  return <span>{ZERO_SYMBOL}</span>
}
```

### Input Method Handling
When implementing `Void/Embed` nodes, we typically need to incorporate a zero-width character in the `Void` node to handle selection mapping issues. Usually, we need to hide its display position to conceal the cursor. However, under specific conditions, there may be issues with `IME` input swallowing. In the example below, multiple characters cannot be entered properly after the `!` when preceded by a `Void` node.

```html
<div contenteditable="true"><span contenteditable="false" style="background:#eee;">Void<span style="height: 0px; color: transparent; position: absolute;">&#xFEFF;</span></span><span>!</span></div>
```

Handling this issue is relatively simple; we just need to place the zero-width character identifier before the `EmbedNode`, ensuring it does not affect the selection search, as noted in `https://github.com/ianstormtaylor/slate/pull/5685`. Moreover, Feishu Document’s implementation follows this pattern: the `ZeroNode` is always before the `FakeNode`.

```html
<div contenteditable="true"><span contenteditable="false" style="background:#eee;"><span style="height: 0px; color: transparent; position: absolute;">&#xFEFF;</span>Void</span><span>!</span></div>
```

### Zero-width Character at the End of Line
As previously stated, the primary purpose of using zero-width characters is to position the cursor, and our current view rendering is fully equivalent to the data structure. This means that there is necessarily a zero-width character at the end of our lines, corresponding to the `Leaf` node at the end of the data structure, which serves several purposes:

1. **Complete Equivalence to Data Structure**: This aligns with our designed `LineState` data. Each `LeafState` must render a `DOM` node, making the data model friendly, and ensuring that a text node always remains during empty lines without requiring special handling.
2. **Rendering of Mention Nodes**: If the last node in a line is a `Void` node, it can prevent the cursor from being positioned at the end. To address this issue, we can conditionally render a zero-width character node, as `slate` does for the ending `Mention` node.
3. **Findings from Feishu Document Editor**: It was observed that every text line consistently has a zero-width character at the end, likely to resolve issues related to `Blocks`. Additionally, it was learned that earlier versions of `Etherpad` also implemented zero-width characters for handling `DOM` and selection-related problems.

Here, we have implemented numerous compatibility solutions to address this issue, such as the selection correction part mentioned in previous articles and the subsequent handling of `Void` selection transformations. If we actually did not render this node, we would not need to address these two related issues; however, this would require managing other cases to ensure the equivalence of `DOM` and `Model`.

Now we need to solve the selection problem of an empty line. If we directly use an empty node like `<span></span>` as a child node, it leads to the absence of actual text content. Consequently, the height would not be sustained, and selection could not focus on that area. Therefore, we still need the content of this empty node to be a zero-width character so that selection can indeed focus correctly.

```js
const nodes: JSX.Element[] = [];
leaves.forEach((leaf, index) => {
  if (leaf.eol) {
    // For empty lines, only one Leaf exists, requiring an empty placeholder node
    !index && nodes.push(<EOLModel key={EOL} editor={editor} leafState={leaf} />);
    return void 0;
  }
  nodes.push(<LeafModel key={index} editor={editor} index={index} leafState={leaf} />);
});
return nodes;
```

In fact, if the last node is a `<br />` node, a zero-width character would not be necessary to solve this issue. The selection node can be placed on this node without any `0/1` offset that needs handling. `Quill` manages empty lines in this manner, which is common for rich text editors.

However, for us, since the `br` node is not text and only has a `0 offset`, it results in selection depending on default behavior, which fails to delete the current node, thus requiring special handling for non-text nodes. Additionally, we need to manage the callback for directional keys to control the cursor, and there is an `issue` noted that the `br` node may interrupt the `IME`, so we currently maintain the zero-width character implementation.

```js
export const getTextNode = (node: Node | null): Text | null => {
  if (isDOMText(node)) {
    return node;
  }
  if (isDOMElement(node)) {
    const textNode = node.childNodes[0];
    if (textNode && (isDOMText(textNode) || isBRNode(textNode))) {
      return textNode;
    }
  }
  return null;
};
```

Another quite important application of the zero-width character at the end of the line is when our selection operation spans from the end of one line to part of the next line. The `Model` of the selection obtained via `Selection` will cross two lines. If we perform an operation like `TAB` indenting, it will affect operations across multiple lines. However, our light blue selection only appears to cover one line, making it seem like a `BUG`, mainly due to the inconsistency between the visual representation and actual operation.

In editors like Tencent Documents and Google Docs, which implement similar `Canvas`, this issue is resolved by an additional light blue selection rendering. However, if we were to implement it via `DOM`, it would not allow for direct content rendering. Hence, we utilize zero-width characters, meaning we add a zero-width character node at the end of the line. The key to this implementation lies here. When our selection is after the zero-width character, we proactively correct it to be before the zero-width character. This implementation works well in `Chrome`, but has no effect in `FireFox`.

```html
<div contenteditable="true">
  <div><span>Trailing Zero-width Character Line 1</span><span>&#8203;</span></div>
  <div><span>Trailing Zero-width Character Line 2</span><span>&#8203;</span></div>
  <div><span>Trailing Plain Text Line 1</span></div>
  <div><span>Trailing Plain Text Line 2</span></div>
</div>
<script>
  document.addEventListener("selectionchange", () => {
    const selection = window.getSelection();
    if (selection.rangeCount < 1) return;
    const staticSel = selection.getRangeAt(0);
    const { startContainer, endContainer, startOffset, endOffset, collapsed } = staticSel;
    if (startContainer?.textContent === "\u200B" && startOffset > 0) {
      selection.setBaseAndExtent( startContainer, 0, endContainer, collapsed ? 0 : endOffset);
    }
  });
</script>
```

## Void Node Component
The `Void` node refers to what we commonly call an empty node, which should be completely user-defined. Even if there is textual content inside, the editor treats it as a whole block. Therefore, in addition to the definitions in the `schema`, a `HOC` component also needs to be implemented for developers to use. The overall component is quite clear but requires handling of events such as selection and clicks.

```js
/**
 * Empty Embed Node HOC
 * @param props
 */
export const Void: FC<VoidProps> = props => {
  const { context, tag: Tag = "span" } = props;
  return (
    <React.Fragment>
      <ZeroSpace />
      <Tag contentEditable={false}>
        {props.children}
      </Tag>
    </React.Fragment>
  );
};
```

### Selection Lookup
As mentioned above, the internal structure of this component is entirely user-defined, and the editor engine itself does not know what content may exist here. Therefore, we need to implement a lookup logic when the selection changes. This implementation can be quite challenging because it requires an iterative approach from top to bottom. The `slate` library implements this in a hierarchical iterative manner, and we follow suit.

The `getEditableChildAndIndex` function below is the implementation for finding child nodes. It attempts to look forward and backward at the same level, prioritizing the direction provided in the `direction` argument to find editable nodes. This is just a lookup at the same level; if nothing is found, it then needs to continue looking through the child nodes of the parent, which is also implemented hierarchically rather than recursively.

```js
// https://github.com/ianstormtaylor/slate/blob/9a21251/packages/slate-dom/src/utils/dom.ts#L156
export const getEditableChildAndIndex = (/* xxx */): [DOMNode, number] => {
  while (/* xxx */) {
    if (triedForward && triedBackward) {
      break
    }
    if (i >= childNodes.length) {
      triedForward = true
      i = index - 1
      direction = 'backward'
      continue
    }
    if (i < 0) {
      triedBackward = true
      i = index + 1
      direction = 'forward'
      continue
    }
    child = childNodes[i]
    index = i
    i += direction === 'forward' ? 1 : -1
  }
}
```

It is also important to note that if a text node can be found directly, there is no need to continue deeper searches. In `HTML`, text nodes do not belong to `DOMElement`. Furthermore, since it has been established that the current node is a non-text node, our current `offset` value will only be `0` or the length offset of the child nodes.

```js
// Determine the new offset inside the text node.
offset = isLast && node.textContent != null ? node.textContent.length : 0
```

### Default Behavior
Essentially, a rich text editor is an editor that supports mixed text and images. When implementing images through `Void`, it becomes clear that clicking on the image node does not trigger changes in the `DOM` selection. Since the `DOM` selection itself does not change, our `Model` selection will not reflect any alterations, leading to issues such as focus and selection errors.

```html
<div contenteditable>
  <div><span>123</span></div>
  <div><span><img src="https://windrunnermax.github.io/DocEditor/favicon.ico" /></span></div>
  <div><span>123</span></div>
</div>
<script>
  document.addEventListener("selectionchange", function() {
    console.log(window.getSelection());
  });
</script>
```

In `Slate`, the implementation is such that when the `OnClick` event is triggered, it actively calls the `ReactEditor.toSlateNode` method to locate the `DOM` node corresponding to `data-slate-node`. It then uses `ELEMENT_TO_NODE` to find the corresponding `Slate Node`, and finally retrieves its associated `Path` node via `ReactEditor.findPath`. If both anchor points are `Void`, a `range` will be created, and ultimately, the latest `DOM` will be set.

```js
// https://github.com/ianstormtaylor/slate/blob/f2e211/packages/slate-react/src/components/editable.tsx#L1153
const node = ReactEditor.toSlateNode(editor, event.target)
const path = ReactEditor.findPath(editor, node)
const start = Editor.start(editor, path)
const end = Editor.end(editor, path)
const startVoid = Editor.void(editor, { at: start })
const endVoid = Editor.void(editor, { at: end })
if (
  startVoid &&
  endVoid &&
  Path.equals(startVoid[1], endVoid[1])
) {
  const range = Editor.range(editor, start)
  Transforms.select(editor, range)
}
```

Since our design utilizes `Void` nodes as higher-order components, we can directly leverage the `onMouseDown` event to set the selection. However, an issue arises with the selection at this point; the node state is `\n`, which effectively divides it into three positions. Our actual `Void` should only occupy the second position, which should also be considered the start of the line, as it needs to be utilized when navigating with the left and right arrow keys.

```js
const onMouseDown = () => {
  const el = ref.current;
  if (!el) return void 0;
  const leafNode = el.closest(`[${LEAF_KEY}]`) as HTMLElement | null;
  const leafState = editor.model.getLeafState(leafNode);
  if (leafState) {
    const point = new Point(leafState.parent.index, leafState.offset + leafState.length);
    const range = new Range(point, point.clone());
    editor.selection.set(range, true);
  }
};

// Case 2: When the cursor is before the data-zero-void node, it needs to be adjusted to the end of the node
// [cursor][void]\n => [void][cursor]\n
const isVoidZero = isVoidZeroNode(node);
if (isVoidZero && offset === 0) {
  return new Point(lineIndex, 1);
}
```

In the context of the editor, the selection state of nodes is a very common feature. For example, when clicking on an image node, it is typically necessary to add a selection state to that image. I have considered two implementation methods: using `React Context` and built-in event management. The `Context` approach involves maintaining the selection `useState` state at the top level, while the built-in event management listens to selection events within the editor to handle callbacks.

`Slate` is implemented using `Context`, where each `ElementComponent` node is wrapped with `SelectedContext` to manage the selection state. When the selection state changes, the `render` function is executed again. This approach is convenient as it only requires setting up `Hooks` to directly access the selection state in the rendered components; however, it necessitates passing the `selection` state from the outermost layer to the child components.

```js
// https://github.com/ianstormtaylor/slate/blob/f2e2117/packages/slate-react/src/hooks/use-children.tsx#L64
const sel = selection && Range.intersection(range, selection)
children.push(
  <SelectedContext.Provider key={`provider-${key.id}`} value={!!sel}>
    <ElementComponent
      element={n}
      key={key.id}
      selection={sel}
    />
  </SelectedContext.Provider>
)
```

Here, we're managing editor events to handle the selection, since our plugin calls methods post-instantiation to complete the view render scheduling. Thus, we implement a class that extends `EditorPlugin` and a selection higher-order component (HOC), listening for changes in the editor's selection to trigger state updates in the HOC, with the selection state determined directly based on the position of the `leaf` relative to the current selection.

```js
export class SelectionHOC extends React.PureComponent<Props, State> {
  public onSelectionChange(range: Range | null) {
    const nextState = range ? isLeafRangeIntersect(this.props.leaf, range) : false;
    this.state.selected !== nextState && this.setState({ selected: nextState });
  }
  public render() {
    return (
      <div className={cs(this.props.className, selected && "block-kit-selected")}>
        {React.Children.map(this.props.children, child => {
          return React.isValidElement(child) ?
            React.cloneElement(child, { ...child.props, selected: selected });
            : child;
        })}
      </div>
    );
  }
}
```

Next, we need to address the movement of the selection in `Void` nodes. When the selection is over a `Void` node, it shifts to the end of the zero-width character generated by pressing Enter, but due to our selection adjustment, it gets corrected back to the zero-width character of the `Void` node, preventing the cursor from moving. Hence, we need to actively control the selection's movement by binding keyboard events on the `Void` node for the up and down arrow keys.

```js
// case KEY_CODE.DOWN:
const point = new Point(nextLine.index, nextLine.length - 1);
editor.selection.set(new Range(point, point.clone()), true);
// case KEY_CODE.UP:
const point = new Point(prevLine.index, prevLine.length - 1);
editor.selection.set(new Range(point, point.clone()), true);
```

### Input Method Handling
Now, we address input method issues. If the cursor is currently in a `Void` node and any input key is pressed, the content of the node turns into an `inline-block` format. The issue here is that a `BlockVoid` node should occupy an entire line, but after input, the actual state looks like the following:

```
[Zero][input]\n
```

Thus, the simplest solution is to prevent the default behavior when pressing input keys while the cursor is in the `Void` node. If content is input, it won't trigger the actual text `insert`, which behaves consistently with `Slate`.

```js
const indexOp = pickOpAtRange(editor, sel);
if (editor.schema.isVoid(indexOp)) {
  return void 0;
}
```

However, here we also need to address the situation with Chinese input, because the `beforeinput` event cannot actually prevent the behavior of the `IME`, and while our content cannot be input at this moment, the selection changes. This can also lead to issues with our `toDOMRange` method, where the selection might be reset to `null`, so we need to recalibrate it when transitioning the selection from `DOM` to `Modal`.

```js
// Case 3: Cursor located at the data-zero-void node invokes IME input, corrected to the end of the node
// [ xxx[cursor]]\n => [ [cursor]xxx]\n
const isVoidZero = isVoidZeroNode(node);
if (isVoidZero && offset !== 1) {
  return new Point(lineIndex, 1);
}
```

Additionally, a very interesting issue arises regarding the interaction between `ContentEditable` and `IME`. It was discovered in a `slate` issue that if the outermost node is `editable`, and then a child node is `not editable`, immediately followed by a text node inside a `span`, and the cursor is positioned in between these two, specifically at the end of the `Void` node.

When the `IME` is activated to input part of the content and the left arrow key is pressed to move the `IME` edit to the left to the end, it causes the entire editor to lose focus, resulting in the `IME` and any entered text disappearing. If we then reactivate the `IME`, the previously entered text will reappear. This phenomenon only exists in `Chromium`, while `Firefox/Safari` behave normally.

```html
<div contenteditable="true"><span contenteditable="false" style="background:#eee;">Void</span><span>!</span></div>
```

This issue was addressed in `https://github.com/ianstormtaylor/slate/pull/5736`, with the key point being that the outer `span` tag has a `display:inline-block` style, while the child `div` tag has the `contenteditable=false` attribute.

```html
<div contenteditable="true"><span contenteditable="false" style="background: #eee; display: inline-block;"><div contenteditable="false">Void</div></span><span>!</span></div>
```


## Embed Node Component
The `Embed` node component is more complex than the `Void` node component because the `Embed` node is an inline node, which means it is required to implement all the behaviors of text selection. However, it itself is not a character, as it must also be treated as a complete inline block and implement text selection behavior. Nonetheless, we still need to provide a `HOC` component here.

```js
/**
 * Embed Node HOC
 * - Inline Block HOC
 * @param props
 */
export const Embed: FC<EmbedProps> = props => {
  return (
    <React.Fragment>
      <ZeroSpace embed={true} />
      <span
        style={{ margin: "0 0.1px", ...props.style }}
        contentEditable={false}
      >
        {props.children}
      </span>
    </React.Fragment>
  );
};
```

### Node Structure Design
In reality, our `Embed` node should be an `InlineVoid` node, but because the component name is too long, we alias it to `Embed`. However, in the process of implementation, I encountered numerous challenges and can only lament that what is learned from paper does feel shallow, true understanding comes from practical experience.

Previously, we had been using a rich text engine to fulfill application layer functionalities, and while I had basically read through the `Slate` code and made some `pr`s to address certain issues, upon trying to implement it directly, I found the challenges to be overwhelming. The current issue is that we are relying on the browser's own `ContentEditable` to render the cursor position, rather than using self-drawn selections. This means we have to depend on how the browser itself implements selections.

If we were to implement an `InlineVoid` node where only that node is inline, it would prevent the cursor from being placed in surrounding positions, which is inconsistent with how text content behaves. In the example below, the middle line cannot place the cursor at the end of the node on a click, although it is possible via double-clicking or using the arrow keys. However, this node is not located on a text node, which conflicts with our selection design.

```html
<div contenteditable style="outline: none">
  <div data-node><span data-leaf><span>123</span></span></div>
  <div data-node>
    <span data-leaf><span contenteditable="false">321</span></span>
  </div>
  <div data-node><span data-leaf><span>123</span></span></div>
</div>
```

For the solution to this problem, both `Quill` and `Slate` add zero-width characters `&#xFEFF;` on either side of the `Embed` nodes to facilitate cursor placement. Of course, this is only necessary when there are no text nodes adjacent to the `Embed` nodes; if there are text nodes on either side, no special handling is required. If we follow `Slate`'s design in this scenario, we end up with three potential positions to place the cursor within the selection: the `Embed` itself, and the left and right cursor `CARET`, which results in three locations for the zero-width characters.

```html
<span data-zero-enter> </span>
<span data-zero-embed> </span>
<span data-zero-enter> </span>
```

Moreover, the data structure in `Slate` directly corresponds to the normalized data format. This means in the previous example, the structural content in `Slate` will look something like this. This also clarifies why `Void` nodes, like images, must have a `children` structure; as their zero-width characters must fully align with the data structure. Given that they are truly calculated as zero-width, the cursor points will also land on the zero-width character nodes, ensuring that the selection can only occur at the `0 offset` of these zero-width nodes.

```js
[
  { text: "" },
  { type: "embed", children: [{ text: "" }] },
  { text: "" }
]
```

However, a critical issue arises with zero-width characters, which contain two cursor positions, namely `0|1`, leading us to a total of `4` cursor positions `|||`. At this point, our `Model` has only two nodes, which are `\n`. Thus, even if we do not allow the cursor to be placed after `\n`, we can barely match up with three cursor positions. The most significant point here is that each zero-width character accounts for two `offsets`, which creates two scenarios for handling the same cursor position when using `toDOMPoint`.

```html
<span data-zero-enter> |</span>
<span data-zero-embed>| </span>
<span data-zero-enter> </span>
```

Initially, when we designed `toDOMPoint`, we prioritized placing the cursor at the end of the previous node. Therefore, when we click at the end of the line, the cursor will end up right after the `zero-enter` node, giving it an offset of `2`. However, due to our selection correction, this offset gets adjusted to `1`.

At this point, our selection is corrected to the first `data-zero-enter` node with an `offset` value of `1`. Ideally, we wanted the cursor positioned at the last `data-zero-enter` node, but instead, it is adjusted to the first node, which is not the intended selection location.

```html
<span data-zero-enter> |</span>
<span data-zero-embed> </span>
<span data-zero-enter> </span>
```

Now, assuming we did not adjust the offset from `2` to `1`, our selection would instead be set at `data-zero-embed` node's `offset -> 1`, still not the desired cursor location. Thus, this situation is also an incorrect selection location, and we would still need further adjustments.

```html
<span data-zero-enter> </span>
<span data-zero-embed> |</span>
<span data-zero-enter> </span>
```

Transforming the structure here may present several issues, primarily related to the mutation of two nodes. If we adjust our approach to reduce the zero-width character nodes by eliminating the first zero-width character node, we would lose the ability to maintain three selection states. If we wish for the `zero-embed`'s `0 offset` to signify the left cursor and `offset 1` to indicate the selection effect of the embedded content, it becomes difficult to achieve. The cursor itself cannot be in a state that appears on the left and disappears on the right, requiring further styling adjustments.

Based on the issues outlined above, the `data-zero-embed` node would be the left cursor we need to manage, while the right cursor remains as the `data-zero-enter` node. Handling the left cursor would necessitate applying a `margin` style to the content of the right `Embed`. Thus, under default conditions, when we correct the selection offset after the `\n` node to `1`, the default selection position will appear as follows.

```html
<span data-zero-embed> |</span>
<span data-zero-enter> </span>
```

So, there are still issues here. When we click at the end of a line, the browser will move the selection to the left side of the node's cursor position, which is clearly not the desired effect. Because of this, we can’t focus at the very end of the line. Therefore, we need to add extra handling logic for `toDOMPoint`: instead of the default priority on `offset`, we switch to a priority on `node`. Specifically, when the node is a `data-zero-embed` and the `offset` is `1`, we prioritize focusing on the following `data-zero-enter` node with an `offset` of `0`.

```js
const nodeOffset = Math.max(offset - start, 0);
const nextLeaf = leaves[i + 1];
// CASE1: When two adjacent nodes share the same cursor position,
// there are actually two expressions:
// <s>1|</s><s>1</s> / <s>1</s><s>|1</s>
// The default calculation here is 1, but when an Embed node is at the end,
// we need to place a zero-width character to allow cursor placement.
// If the current node is an Embed node, offset is 1, and there is a next node,
// the focus should move to the next node with offset 0.
if (
  leaf.hasAttribute(ZERO_EMBED_KEY) &&
  nodeOffset === 1 &&
  nextLeaf &&
  nextLeaf.hasAttribute(ZERO_SPACE_KEY)
) {
  return { node: nextLeaf, offset: 0 };
}
```

Actually, this still leaves a problem: if the next node is a text node, the cursor cannot be placed properly. So we actually only need to check if `nextLeaf` exists to decide whether to shift the selection. At the same time, there is still an issue because the same node has two possible `offset` positions. Therefore, we first need to correct the position in `toModelPoint`: if the cursor is positioned after a `data-zero-embed` node, it should be corrected to the position before the node.

```js
// Case 4: When the cursor is after a data-zero-embed node,
// we need to correct it to the position before the node.
// Without this correction, the DOM-Point CASE1 zero-width selection
// would prevent normal cursor movement when pressing the left arrow key.
// [embed[cursor]]\n => [[cursor]embed]\n
const isEmbedZero = isEmbedZeroNode(node);
if (isEmbedZero && offset) {
  return new Point(lineIndex, leafOffset - 1);
}
```

But then another issue arises: if the cursor is positioned on the left side of the node, pressing the right arrow key will not move the cursor properly, because the selection is corrected back to the original spot by the above logic. To fix this, we still need to control this behavior in the `onKeyDown` event — when the selection is on a `data-zero-embed` node and the right arrow key is pressed, we actively adjust the selection.

```js
const sel = getStaticSelection();
if (rightArrow && sel && isEmbedZeroNode(sel.startContainer)) {
  event.preventDefault();
  const newFocus = new Point(focus.line, focus.offset + 1);
  const isBackward = event.shiftKey && range.isCollapsed ? false : range.isBackward;
  const newAnchor = event.shiftKey ? anchor : newFocus.clone();
  this.set(new Range(newAnchor, newFocus, isBackward), true);
  return void 0;
}
```

Although it seems the problems are resolved, the frequent `normalize` calls on the `DOM` bring a subtle issue: when a line consists only of an `Embed` node, mouse dragging to select it fails. In fact, such dragging even triggers our preset selection `limit` errors, and the console shows a very frequent log of selection changes.

This problem likely stems from a mix of controlled selections and uncontrolled dragging by the browser. Since we can’t fully control browser dragging, the best approach is to minimize controlled behavior during dragging. So here, we avoid actively setting the selection while the user is dragging, which prevents interfering with the drag selection behavior. We also must remember that during input, even if the mouse is down, the `DOM` selection needs to update, and it should be reconciled again when the mouse is released.

```js
// Do not update the selection while the mouse is held down, unless forced.
// Always updating the selection causes dragging on single Embed nodes to fail,
// so this must be uncontrolled.
// Without forced dispatch control, updating selection while mouse is down
// leads to stale DOM selections during input.
if (!force && this.editor.state.get(EDITOR_STATE.MOUSE_DOWN)) {
  return false;
}
```

### Selection Behavior  
There are quite a few points to consider regarding the selection behavior of `Embed` nodes. Although the previous implementation basically worked, some issues emerged during practical use. For example, when selecting from left to right, if the mouse drag stops slightly to the left of an `Embed` node, the browser's selection does not cover the node. However, when the mouse is released, the calculation ends up selecting the entire node. This is a typical selection synchronization problem.

The cause is that our selection model is designed with zero-width nodes placed on the left side. Placing them on the right could lead to IME-related issues, as mentioned in issues `slate#5685` and `slate#5736`. Hence, in our editor, these nodes are directly placed to the left of the embedded node.

```js
<span data-leaf="true">
  <span data-zero-space="true" data-zero-embed="true">&ZeroWidthSpace;</span>
  <span contenteditable="false" data-void="true">{/** xxx */}</span>
</span>
```

In the previous implementation, while the overall selection behavior tended to the left side of the node, the selection on the right side of the `Embed` node was biased to the right. This is because the design causes the browser cursor to always appear on the left. We have retained this implementation for now. In contrast, `slate` adds an extra zero-width node for selection, effectively preventing this issue.

```js
// Observe selection changes
document.onselectionchange = () => {
  const sel = document.getSelection();
  console.log(sel.anchorNode, sel.anchorOffset, sel.focusNode, sel.focusOffset);
};
```

The major modification here adds support for `Case 4`. The main principle is that when the cursor lands on the zero-width character, regardless of whether the offset is `0` or `1`, the cursor should be positioned before the node. Since an offset of `0` already corresponds to a left-side selection, no special handling is required in that case. The `data-void` marker indicates that the selection should be placed after the node, thereby aligning with browser behavior.

Additionally, `Case 5` has been implemented. Because the `Embed` node does not implement `user-select: none`, during dragging, the offset can go out of bounds, causing selection offset issues. Furthermore, if the selection is not collapsed, we need to check whether we're at the `End` node to determine the boundary and select the entire `Embed` node accordingly. This requires passing the relevant environment state.

```js
// Case 4: When the cursor is on the data-zero-embed node, it needs to be corrected to before the node
// Failing to correct will carry the zero-width DOM-Point Case 1 selection position, causing the left key to not move the cursor correctly
// Main principle: when on the zero-width character, place the cursor before the node; `div` position means after the node to align with browsers
// [[z][caret]]\n => [[caret][z]]\n
// [[z][div[caret]]][123]\n => [[z][div]][[caret]123]\n
// Case 5: When the cursor is inside the Embed node, the offset might be > 1 within the embedded text
// Regardless of whether the selection is collapsed, failure to correct will cause selection overflow, leading to offset issues during drag selection
// If the selection is not collapsed, we must check if it's the End node to decide the boundary and select the entire Embed node
// [embed[caret > 1]] => [embed[caret = 1]]
if (leafModel && leafModel.embed && offset >= 1) {
  const isEmbedZeroContainer = isEmbedZeroNode(nodeContainer);
  if (isEmbedZeroContainer && nodeOffset) {
    return new Point(lineIndex, leafModel.offset);
  }
  if (!isCollapsed && isDOMText(nodeContainer)) {
    return new Point(lineIndex, leafModel.offset + (isEndNode ? 1 : 0));
  }
  return new Point(lineIndex, leafModel.offset + 1);
}
```

Moreover, when multiple `Embed` nodes are consecutive, triple-clicking in the browser results in only the first node being selected, while subsequent nodes remain unselected. The selection transformation yields the `Embed div` node. Therefore, we need to specifically handle triple-click selection behavior by proactively selecting the entire line ourselves, rather than relying on the browser's default selection behavior.

```js
protected onTripleClick(event: MouseEvent) {
  if (event.detail !== 3 || !this.current) {
    return void 0;
  }
  const line = this.current.start.line;
  const state = this.editor.state.block.getLine(line);
  if (!state) {
    return void 0;
  }
  const range = Range.fromTuple([state.index, 0], [state.index, state.length - 1]);
  this.set(range, true);
  event.preventDefault();
}
```

In `Slate`, the `inline` nodes place zero-width characters within empty nodes to signify the selection state of the node itself. When a line is occupied exclusively, zero-width characters are generated before and after to position the cursor. The nodes themselves do not contain zero-width characters to mark their own selection; naturally, there are no zero-width characters inside, while the external zero-width characters serve the purpose of cursor placement, aligning with their respective semantic designs.

While dragging a selection area, if the `Embed` node has not been crossed, the browser's selection will then be placed on nodes with `contenteditable="false"`. From this, it becomes clear that when searching for nodes in `Slate`, the search should ideally be conducted inward, whereas in reality, we should be looking for sibling nodes. Thus, the implementation here shows some differences. Of course, if the selection point lands on a `data-leaf` node, searching inward is naturally not a problem.

```js
// Slate
<div data-leaf="true">
  <div contenteditable="false">
    <ZeroSpace></ZeroSpace>
    <span>Mention</span>
  </div>
</div>

// Sibling Node
<div data-leaf="true">
  <ZeroSpace></ZeroSpace>
  <div contenteditable="false"><span>Mention</span></div>
</div>
```

When implementing the `Embed` node, the built-in zero-width characters are utilized as cursor placement positions using `0/1`, where the `offset 1` will be adjusted to the `offset 0` of the subsequent node. Theoretically, if we only employ this offset scheme without correcting the `ModelPoint`, it is feasible.

However, in practice, we observe that if the two selection nodes are not contiguous, clicking the left mouse button causes the selection to move from `node2 offset 0` to `node1 offset 1`. Conversely, if they are contiguous, the selection moves correctly to `node1 offset len-1`.

```html
<div contenteditable style="outline: none">
  <div><span id="$1">123</span><span contenteditable="false">Embed</span><span id="$2">456</span></div>
  <div><span id="$3">123</span><span id="$4">456</span></div>
</div>
<div>
  <button id="$5">Embed</button>
  <button id="$6">Span</button>
</div>
<script>
  const sel = window.getSelection();
  document.addEventListener("selectionchange", () => {
    console.log("selection", sel?.anchorNode.parentElement, sel?.focusOffset);
  });
  $5.onclick = () => sel.setBaseAndExtent($2.firstChild, 0, $2.firstChild, 0); 
  $6.onclick = () => sel.setBaseAndExtent($4.firstChild, 0, $4.firstChild, 0);
</script>
```

In this example, after pressing the `Embed` button and then clicking the left mouse button, the resulting selection's `offset` becomes `3`, while using the `Span` button yields an `offset` of `2`. Although placing the zero-width character immediately after the `Embed` node could solve this issue, it would prevent the cursor from being positioned before the `Embed` node.

At this point, another zero-width character would need to be added at the very front, complicating the interaction handling even further. Additionally, I have previously mentioned the issue of zero-width characters interrupting the input of Chinese `IME` in `Slate`. This also presents an interesting problem regarding selection mapping: when the cursor is located after a `data-zero-embed` node, it needs to be corrected to the position before the node.

Thus, pressing the right mouse button to select will remap the logic within this `toModelPoint` back to the original position, i.e., `L => L` remains unchanged, which does not trigger the `Model Sel Change`, while the `DOM` selection is forcibly corrected from `offset 1` to `0`.

So if we actively adjust the selection by right-clicking, it will first trigger `Model Sel Change`, followed by `UpdateDOM`, and then `DOM Sel Change` will correct the selection. At this moment, since the selection is no longer on the `Embed` zero-width character, it won't hit the correction logic, allowing the selection movement to proceed normally.

```js
// CASE2: When there is content before the Embed element and the cursor is at the end of the node, correction is needed to move to the Embed node
// <s>1|</s><e> </e> => <s>1</s><e>| </e>
if (nodeOffset === len && nextLeaf && nextLeaf.hasAttribute(ZERO_EMBED_KEY)) {
  return { node: nextLeaf, offset: 0 };
}
// [[cursor]embed]\n => right => [embed[cursor]]\n => [[cursor]embed]\n
// SET(1) => [embed[cursor]]\n => [embed][[cursor]\n] => SET(1) => EQUAL
```

### Input Method Handling
In `Embed` nodes, input methods can also introduce additional effects. Beyond the issues related to the input method mentioned earlier, there’s another situation that needs to be addressed. When text is only on a single line and contains only `Embed` nodes, entering content at the very beginning of the node can cause duplication. This occurs because the `IME` keeps the input content stuck on the zero-width character.

```
[Zero<IME Text>][<IME Text>]\n
```

In such cases, after the `IME` input is completed, it is necessary to re-correct the text content on the zero-width character. Since we already carry the text correction of the line content, we only need to re-correct the text content on the zero-width character after the `IME` input is completed.

```js
const isZeroNode = !!zeroNode;
const textNode = isZeroNode ? zeroNode : LEAF_TO_TEXT.get(leaf);
const text = isZeroNode ? ZERO_SYMBOL : leaf.getText();
// If the text content is invalid, usually due to dirty DOM input, it needs to correct the content
if (isDOMText(textNode.firstChild)) {
  // Case1: [inline-code][caret][text] IME causes model/text discrepancy
  // Case3: When only Embed nodes exist on a single line, inputting at the very front of the node causes content duplication
  if (textNode.firstChild.nodeValue === text) return false;
  textNode.firstChild.nodeValue = text;
} 
```

## Summary
Here, we discussed the preset components for editing nodes, including zero-width characters, `Embed` nodes, `Void` nodes, etc. These are mainly preset components for plugin extensions in the editor, within which there are some default behaviors and certain preset `DOM` structures, handling numerous selection interactions and issues caused by `IME` input.

Next, we will discuss rendering content for non-editing nodes, such as placeholder nodes, read-only mode, plugin mode, external node mounting, etc. These node types are common external nodes in the design of the editor, such as placeholders and pop-ups, and do not require handling selection interactions or issues caused by `IME` input like editing nodes do.

## Daily Question

- <https://github.com/WindRunnerMax/EveryDay>

## References

- <https://18.react.dev/>
- <https://www.cnblogs.com/goloving/p/16018529.html>
- <https://developer.mozilla.org/zh-CN/docs/Web/CSS/Guides/Text/Whitespace>