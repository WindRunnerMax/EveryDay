# Uncontrolled DOM Behavior in Browser Input Mode
Previously, based on the selection module, we implemented a semi-controlled input mode through a combination of browser events, which is one of the essential implementations for state synchronization. Here, we need to focus on dealing with the default behaviors of complex `DOM` structures in browsers, as well as various input scenarios compatible with `IME` input methods. Essentially, we need to handle input method and browser compatibility behaviors on a `Case By Case` basis.

- Open Source Repository: <https://github.com/WindRunnerMax/BlockKit>
- Online Editor: <https://windrunnermax.github.io/BlockKit/>
- Project Notes: <https://github.com/WindRunnerMax/BlockKit/blob/master/NOTE.md>

<details>
<summary><strong>Rich Text Editor Implementation Series from Scratch</strong></summary>

- [Feeling inadequate, preparing to create a rich text editor from scratch](./Implementing-Rich-Text-Editor-from-Scratch.md)
- [Implementing Rich Text Editor from Scratch #2 - Editor Architecture Design Based on MVC Pattern](./Editor-Architecture-Design-Based-on-MVC-Pattern.md)
- [Implementing Rich Text Editor from Scratch #3 - Linear Data Structure Model Based on Delta](./Linear-Data-Structure-Model-Based-on-Delta.md)
- [Implementing Rich Text Editor from Scratch #4 - Core Interaction Strategy of Browser Selection Model](./Core-Interaction-Strategy-of-Browser-Selection-Model.md)
- [Implementing Rich Text Editor from Scratch #5 - State Structure Representation of Editor Selection Model](./State-Structure-Representation-of-Editor-Selection-Model.md)
- [Implementing Rich Text Editor from Scratch #6 - Synchronization between Browser Selection and Editor Selection Models](./Synchronization-between-Browser-Selection-and-Editor-Selection-Models.md)
- [Implementing Rich Text Editor from Scratch #7 - Semi-controlled Input Mode Based on Combination Events](./Semi-controlled-Input-Mode-Based-on-Combination-Events.md)
- [Implementing Rich Text Editor from Scratch #8 - Uncontrolled DOM Behavior in Browser Input Mode](./Uncontrolled-DOM-Behavior-in-Browser-Input-Mode.md)

</details>

## Overview
From the very beginning of the editor series, we mentioned the controllability of `ContentEditable` and browser compatibility issues, particularly when combined with `React` as the view layer, the state management and `DOM` behavior become more uncontrollable. Let's review some common browser compatibility issues:

- In an empty `contenteditable` editor, pressing Enter directly will result in `<div><br></div>` in `Chrome`, `<br>` in `FireFox (<60)`, and `<p><br></p>` in `IE`.
- In an editor with text, inserting Enter in the middle of the text like `123|123` will format the content as `123<div>123</div>` in `Chrome`, and as `<div>123</div><div>123</div>` in `FireFox`.
- Similarly, if Enter is inserted in the middle of text and then deleted, for example, `123|123->123123`, the content will revert to `123123` in `Chrome`, and become `<div>123123</div>` in `FireFox`.
- When having two lines of text, selecting both lines and executing `("formatBlock", false, "P")` command, `Chrome` will wrap both lines in a single `<p>` tag, while `FireFox` will wrap each line in its own `<p>` tag.
- ...

Since our editor's input relies on browser-provided combination events, we naturally cannot avoid related issues. The design of the editor's view structure needs to be strictly controlled so that we can synchronize the view with the selection pattern based on certain rules. Following the overall `MVC` architecture design, the current editor's view structure is designed as follows:

```html
<div data-block="true">
  <div data-node="true">
    <span data-leaf="true"><span data-string="true">inline</span></span>
    <span data-leaf="true"><span data-string="true">inline2</span></span>
  </div>
</div>
```

If the above structure is disrupted during `ContentEditable` input, issues will arise with the editor's synchronization mode we designed. To solve similar problems, we need to implement a dirty `DOM` detection; if destructive node structures appear, we need to attempt to repair the `DOM` structure and even resort to triggering a re-render using `React` to maintain a strict view structure.

However, performing `DOM` checks and repairs every time there is input or selection changes may negatively impact the overall performance or input fluency of the editor. The scope of `DOM` checking and repair also needs to be limited; otherwise, it may also affect performance. Thus, we need to categorize the browser's input modes here and implement different `DOM` check and repair modes for different types of behavior.

## Inline Nodes
Synchronizing `DOM` structure with the `Model` structure in uncontrolled `React` components becomes complex, which is actually one of the reasons why some editors choose to draw their own selection to avoid uncontrolled problems. The main issues caused by uncontrolled behaviors can be easily demonstrated. Let's assume there are two nodes present, one of `inline` type and the other of `text` type:

```
inline|text
```

At this point, our cursor is after `inline`. Assuming the `inline` rule defined in the `schema` does not inherit the formatting of the previous node, if we input a content such as `1`, the text will become `inline|1text`. This operation seems intuitive. However, when we invoke the IME to input Chinese content at this position, the text turns into incorrect content.

```
inline中文|中文text
```

The difference here is easily noticeable. When inputting English or numbers, which do not require invoking IME controlled input mode, the character `1` will be added before the `text` text node. However, when invoking the IME for uncontrolled input mode, the input content will not only appear before `text`, but also after the `inline` node, which clearly indicates a problem.

The root cause of this issue lies in the uncontrolled IME problem. When inputting English, our input is prevented from the default behavior in the `beforeinput` event, thus not triggering the browser's default DOM changes. However, in the case of invoking the IME, the DOM changes cannot be prevented, making it uncontrolled input and leading to the problem.

Due to the browser's default behavior, the content of the `inline` node will be inserted with the "Chinese" text by the input method, which is the browser's default handling of the input method. Once we complete inputting, the content will be placed before `text` in the data structure of the `Model` layer, controlled by the editor. This behavior aligns with inputting non-Chinese content and meets the expected performance.

Due to our immutable design, along with performance optimization strategies such as `memo` and the execution of `useMemo`, even with dirty DOM detection added to the final text node rendering, it is not sufficient because there will be no `rerender` performed at this point. Consequently, React will reuse the current DOM node in place, causing inconsistency between the DOM changes of IME input and the Model layer.

```js
const onRef = (dom: HTMLSpanElement | null) => {
  if (props.children === dom.textContent) return void 0;
  const children = dom.childNodes;
  for (let i = 1; i < children.length; ++i) {
    const node = children[i];
    node && node.remove();
  }
  if (isDOMText(dom.firstChild)) {
    dom.firstChild.nodeValue = props.children;
  }
};
```

If we remove `React.memo` and `useMemo` from the `leaf` directly, the issue will naturally disappear, but it will cause a decline in the editor's performance. Therefore, we need to consider detecting dirty DOM situations as much as possible. In fact, when handling pure uncontrolled input cases in `input` events or `MutationObserver`, we also need to address dirty DOM issues.

When there is a change in line status, we can directly check all `leaf` nodes of the current line, compare the text content, and correct any inconsistencies. Directly using `querySelector` may not be elegant enough. We can use a `WeakMap` to map leaf states to the DOM structure, enabling quick positioning of the required nodes.

After the state change in the line nodes, when handling side effects, checking dirty DOM nodes, and since our line state is also immutable, there is no need to worry about performance issues. This execution of checks is an `O(N)` algorithm, and the scope of the check will be limited to the lines where a `rerender` occurs. The specific method of checking nodes will naturally be consistent with the above `onRef`.

```js
const leaves = lineState.getLeaves();
for (const leaf of leaves) {
  const dom = LEAF_TO_TEXT.get(leaf);
  if (!dom) continue;
  const text = leaf.getText();
  if (text === dom.textContent) continue;
  editor.logger.debug("Correct Text Node", dom);
  const nodes = dom.childNodes;
  for (let i = 1; i < nodes.length; ++i) {
    const node = nodes[i];
    node && node.remove();
  }
  if (isDOMText(dom.firstChild)) {
    dom.firstChild.nodeValue = text;
  }
}
``` 

Here is something to keep in mind, the check for the dirty nodes' status needs to be executed during the `useLayoutEffect` timing, because we must ensure that the sequence of operations is to correct the `DOM` first before updating the selection. If done the other way around, a problem might occur where the updated selection remains on the dirty node, and then correcting it later due to `DOM` node changes would result in the selection being lost, manifesting as the selection being at the beginning of an `inline`.

```
leaf rerender -> line rerender -> line layout effect -> block layout effect
```

Furthermore, in this implementation, there is no need to check during the initial rendering since there won't be any dirty node situations at that time. Therefore, during the initial rendering, we can skip the check directly. By handling the dirty `DOM` issue in this manner, we can also avoid other potential issues. For now, we won't handle the content of zero-width character texts temporarily. If a similar situation arises again, additional checks will be necessary.

Actually, thinking from a different perspective, the issue here might also be due to our selection strategy favoring the leftmost search as much as possible. Correcting it to the right node in such scenarios might solve the problem. However, in the case of empty lines, our trailing `\n` node won't render, so this strategy currently cannot completely solve the issue. Additionally, this approach would make the editor's selection strategy more intricate.

```
[inline|][text] => [inline][|text]
```

It is also essential to pay attention to the timing of `React`'s `Hooks` calls. In the example below, obtaining `onRef` from the actual `DOM` executes first, making it reasonable to perform the initial `DOM` check at that point. Subsequent `Child LayoutEffect` is similar to line-wise `DOM` check, followed by updating the selection in the `Parent LayoutEffect` after corrections, aligning with the scheduling approach.

```
Child onRef
Child useLayoutEffect
Parent useLayoutEffect
Child useEffect
Parent useEffect
```

```js
// https://playcode.io/react
import React from 'react';
const Child = () => {
  const [,forceUpdate] = React.useState({});
  const onRef = () => console.log("Child onRef");
  React.useEffect(() => console.log("Child useEffect"));
  React.useLayoutEffect(() => console.log("Child useLayoutEffect"));
  return <button ref={onRef} onClick={() => forceUpdate({})}>Update</button>
}
export function App(props) {
  React.useEffect(() => console.log("Parent useEffect"));
  React.useLayoutEffect(() => console.log("Parent useLayoutEffect"));
  return <Child></Child>;
}
```

## Node Wrapping
Regarding the node wrapping issue, let's first discuss the design pattern. The current implementation of the rich text editor lacks block structures, making it complex to handle nested structures. While we wouldn't deal with nesting structures like tables, certain wrapper-level structures such as `blockquote` need attention.

Similar structures exist like lists, which we can completely design ourselves. However, for structures like `blockquote`, specific combinations are required. When we split text into `bold`, `italic`, or other `inline` nodes, actual `DOM` nodes get divided. If we nest an `<a>` node at this point, hovering effects like underlines get split. Thus, if we can wrap them within the same `<a>` tag, this issue can be avoided.

But a new challenge arises. Handling wrapping for a single `key` during rendering isn't complex, but dealing with multiple keys needing wrapping becomes puzzling. For instance, in the example below, individually combining `34` with `b` and then wrapping it in `a` seems sensible, but wrapping `34` in `a` before combining `b` of `5` also makes sense. Moreover, it's unclear whether `67` can be combined as well due to their shared `b` tag.

```html
1 2 3  4  5 6  7 8 9 0
a a ab ab b bc b c c c
```

After some contemplation, I came up with a simple solution. For elements needing wrapping, if the merged `list` keys and values are all the same, they can be considered as a single entity to combine. This simplifies the process, treating them as a combined value rather than separate values, which is sufficient in most scenarios.

```html
1 2 3  4  5 6  7 8 9 0
a a ab ab b bc b c c c
12 34 5 6 7 890
```

Speaking of which, this kind of `wrapper` structure is only needed in some particular scenarios. For instance, certain actions such as indentation pose challenges in distinguishing whether the intention is to indent a block quote or the text within it. This issue is prevalent in many open-source editors, especially those with flat data structure designs like the `Quill` editor.

In the absence of block structures, controlling similar behaviors becomes tricky. Whole indentation, when combined with lists, is a reasonable behavior in large documents. This implementation will have to wait for our block structure editor to be developed. Of course, if the data structure itself supports nested patterns, as in the case of `Slate`, it can be achieved.

Subsequently, in implementing the `wrap node` for an `a` tag, we encountered a similar issue to that of `inline-code` dirty `DOM` problem. Looking at the following `DOM` structure, everything seems fine. However, when the cursor is placed after the word "超链接" and Chinese characters are input using an `IME`, the input text "测试输入" seems to be placed directly under the immediate `div`, parallel to the `a` tag.

Speaking of which, I noticed that the implementation in the Feishu documents renders the `leaf` as the `a` tag, while the wrapping is done using a `span` which includes additional styles for a `hover` effect. Directly wrapping with a `span` mitigates the aforementioned issue, and although the internal `a` tag could still cause problems, it triggers the dirty `DOM` check under the `leaf`.

Therefore, building upon the previous dirty `DOM` check, we were able to resolve this issue. Fundamentally, such behaviors are a result of how browsers naturally handle these situations, and the browser's interpretation might vary. At present, browsers perceive the structure of `a` tags as being inline, similar to our `inline-code` implementation. In theory, this shouldn't pose a problem, but we need to manage these uncontrolled situations ourselves.

In practice, even the `Quill` editor faces similar issues related to dirty `DOM` handling. On the other hand, `Slate` doesn't encounter this problem. The workaround here involves placing additional `&nbsp` nodes at both ends of the `a` tag in order to avoid the issue. While this solution addresses the problem, it does introduce new nodes, and currently, shifting the cursor requires careful handling.

Moreover, in subsequent browser testing, the previously mentioned `a` tag issue resurfaced. This time, it wasn't caused by wrapping nodes, making the problem more complex, mainly due to various browsers' compatibility issues. Similar to inline code blocks, fundamentally, these are still `DOM` change issues arising from uncontrolled browser `IME`. However, there are significant differences in browser behaviors. Below is a minimal `DEMO` structure:

- In `Chrome`, inputting content at the end of the `a` tag will insert a text-type node at the same level as the `a` tag, resulting in something like `<a></a>"text"`.
- In `Firefox`, inputting content at the end of the `a` tag will insert a `span` type node inside the `a` tag, similar to `<a></a><span data-string>text</span>`.
- In `Safari`, the `a` tag and `span` tag positions will be swapped, and text content will be added at the same level as the `a` tag, resembling `<span><a></a>"text"</span>`.

```html
<!-- Chrome -->
<span data-leaf="true">
  <a href="https://www.baidu.com"><span data-string="true">link</span></a>
  "text"
</span>

<!-- Firefox -->
 <span data-leaf="true">
  <a href="https://www.baidu.com"><span data-string="true">link</span></a>
  <span data-string="true">text</span>
</span>

<!-- Safari -->
 <span data-leaf="true">
  <span data-string="true">
    <a href="https://www.baidu.com">link</a>
    "text"
    ""
  </span>
</span>
```

Therefore, our dirty `DOM` check needs to be handled with more granularity. Simply comparing text content is clearly insufficient. We also need to check if the structure of text nodes is accurate. Initially, we only dealt with the situation under `Chrome`, the simplest way is to allow only a single node under the `leaf` node. If there are multiple nodes, it indicates a dirty `DOM`.

```js
for (let i = 1; i < nodes.length; ++i) {
  const node = nodes[i];
  node && node.remove();
}
```

However, we later found that `Embed` nodes were also being removed during editing. This happened because we mistakenly considered a combined `div` node as dirty `DOM`, so a more granular approach is required here. By checking the node type, if it's a text node type, then removing it would avoid mistakenly deleting `Embed` nodes.

```js
for (let i = 1; i < nodes.length; ++i) {
  const node = nodes[i];
  isDOMText(node) && node.remove();
}
```

While this seemed to solve the problem, further issues were discovered under `Firefox` and `Safari`. Let's first look at the situation in `Firefox`, the node is not a text node type, hence it couldn't be removed in the dirty `DOM` check. This still couldn't address the dirty `DOM` issue in `Firefox`, so we need to further handle nodes of different types.

```js
// Inside data-leaf nodes, only non-text nodes or single text nodes should exist, while dual nodes for embedded types
for (let i = 1; i < nodes.length; ++i) {
  const node = nodes[i];
  // For dual nodes, that is, Void/Embed node types, the node should be ignored
  if (isHTMLElement(node) && node.hasAttribute(VOID_KEY)) {
    continue;
  }
  node.remove();
}
```

In the case of `Safari`, it is more complicated because it swaps the positions of `a` tags and `span` tags, which disrupts the `DOM` structural integrity. In this scenario, we must refresh the `DOM` structure, requiring a more complex handling where we introduce `forceUpdate` and check for `TextNode` nodes.

In fact, a similar approach is also adopted in Feishu documents; when an `a` tag in Feishu documents triggers a dirty `DOM` check upon calling the `IME` input, Feishu documents will directly `ReMount` all `leaf` nodes in the current line based on behavior to avoid complex dirty `DOM` checks. Here we implement a more refined `leaf` handling to avoid unnecessary remounting.

```js
const LeafView: FC = () => {
  const { forceUpdate, index: renderKey } = useForceUpdate();
  LEAF_TO_REMOUNT.set(leafState, forceUpdate);
  return (<span key={renderKey}></span>);
}

if (isDOMText(dom.firstChild)) {
  // ...
} else {
  const func = LEAF_TO_REMOUNT.get(leaf);
  func && func();
}
```

It is important to note that we also need to handle zero-width character types. When an `Embed` node is present at the beginning of a line without any preceding nodes, typing Chinese characters will cause the `IME` input content to be stuck on the zero-width character of the `Embed` node. This is similar to the aforementioned inline node and needs to be addressed as well.

```js
const zeroNode = LEAF_TO_ZERO_TEXT.get(leaf);
const isZeroNode = !!zeroNode;
const textNode = isZeroNode ? zeroNode : LEAF_TO_TEXT.get(leaf);
const text = isZeroNode ? ZERO_SYMBOL : leaf.getText();
const nodes = textNode.childNodes;
```

At this point, our dirty `DOM` check should be able to handle most cases. The overall pattern is that `React` processes the `DOM` structure after the layout calculation is complete and before the browser rendering. For text nodes and `<a>` tags, we need to examine the relationship between the text and the state, and when strict `DOM` structure violations occur, the component needs to be remounted directly.

```js
// There should only be one text node inside a text node, remove any extra nodes
for (let i = 1; i < nodes.length; ++i) {
  const node = nodes[i];
  node && node.remove();
}
// If the text content is invalid, usually due to dirty DOM input, correct the content
if (isDOMText(textNode.firstChild)) {
  // Case1: [inline-code][caret][text] IME can cause model/text discrepancies
  // Case3: When there is only an Embed node in a single line, inputting at the very beginning duplicates the content
  if (textNode.firstChild.nodeValue === text) return false;
  textNode.firstChild.nodeValue = text;
} else {
  // Case2: In Safari, inputting at the end of an a node may swap the inner and outer layers
  const func = LEAF_TO_REMOUNT.get(leaf);
  func && func();
  if (process.env.NODE_ENV === "development") {
    console.log("Force Render Text Node", textNode);
  }
}
```

Regarding additional text nodes, which are the compatibility issues emphasized in this chapter, we need to strictly control the `DOM` structure under the `leaf` node. If there is only a single text node, it conforms to the design structure. However, if there are multiple nodes, except for `Void/Embed` nodes, it means the `DOM` structure has been compromised, and we need to remove the excess nodes.

```js
// Inside the data-leaf node, there should only be non-text nodes, single text node, and double nodes for embedded types
for (let i = 1; i < nodes.length; ++i) {
  const node = nodes[i];
  // Ignore the node in the case of double nodes, i.e., Void/Embed node types
  if (isHTMLElement(node) && node.hasAttribute(VOID_KEY)) {
    continue;
  }
  // Case1: IME input within a tag in Chrome leads to insertion of additional text node types at the same level
  // Case2: IME input within a tag in Firefox leads to insertion of additional data-string node types at the same level
  node.remove();
}
```

## Rendering Style Combinations
Since our editor uses `immutable` to enhance rendering performance, when there is a need for consecutive format processing in text node changes, such as the styling implementation of `inline-code`, there may be issues with components not re-rendering. Specifically, having multiple consecutive `code` nodes where the last node has a length of `1`, deleting this last node would cause the previous node to not refresh its style.

```
[inline][c]|
```

The reason for this issue is that our `className` is dynamically calculated when rendering the `leaf` node, as shown in the logic below. If the previous node does not exist or is not an `inline-code`, the `inline-code-start` class attribute is added. Similarly, the `inline-code-end` class attribute needs to be added to the last node.

```js
if (!prev || !prev.op.attributes || !prev.op.attributes[INLINE_CODE_KEY]) {
  context.classList.push(INLINE_CODE_START_CLASS);
}
context.classList.push("block-kit-inline-code");
if (!next || !next.op.attributes || !next.op.attributes[INLINE_CODE_KEY]) {
  context.classList.push(INLINE_CODE_END_CLASS);
}
```

This situation is similar to the problem of `Dirty DOM`. Since the deleted node has a length of `1`, the `LeafState` of the previous node remains unchanged, thus not triggering a re-render by `React`. In this case, we need to correct it during line node rendering, which doesn't require synchronous execution like the aforementioned checks, as async execution through an effect would be sufficient.

```js
/**
 * Asynchronously called after the layout calculation of the editor line structure
 */
public didPaintLineState(lineState: LineState): void {
  for (let i = 0; i < leaves.length; i++) {
    if (!prev || !prev.op.attributes || !prev.op.attributes[INLINE_CODE_KEY]) {
      node && node.classList.add(INLINE_CODE_START_CLASS);
    }
    if (!next || !next.op.attributes || !next.op.attributes[INLINE_CODE_KEY]) {
      node && node.classList.add(INLINE_CODE_END_CLASS);
    }
  }
}
```

Even though it seems like the issue has been resolved, there are still some issues in `React` due to the fact that the current `DOM` handling is uncontrolled. For instance, in the following example, when `React` handles the `style` attribute, it only updates the properties that have changed. Even if the overall object is new, if the specific value remains the same as in the previous render, `React` won't reset that style attribute.

```js
// https://playcode.io/react
import React from "react";
export function App() {
  const el = React.useRef();
  const [, setState] = React.useState(1);
  const onClick = () => {
    el.current && (el.current.style.color = "blue");
  }
  console.log("Render App")
  return (
    <div>
      <div style={{ color:"red" }} ref={el}>Hello React.</div>
      <button onClick={onClick}>Color Button</button>
      <button onClick={() => setState(c => ++c)}>Rerender Button</button>
    </div>
  );
}
```

Therefore, in the `didPaintLineState` method mentioned above, we mainly add class attributes using `classList`. Even if `LeafState` changes, `React` won't reset the class attributes. Hence, we also need to remove unnecessary class attributes when there are changes in `didPaintLineState`.

```js
public didPaintLineState(lineState: LineState): void {
  for (let i = 0; i < leaves.length; i++) {
    if (!prev || !prev.op.attributes || !prev.op.attributes[INLINE_CODE_KEY]) {
      node && node.classList.add(INLINE_CODE_START_CLASS);
    } else {
      node && node.classList.remove(INLINE_CODE_START_CLASS);
    }
    if (!next || !next.op.attributes || !next.op.attributes[INLINE_CODE_KEY]) {
      node && node.classList.add(INLINE_CODE_END_CLASS);
    } else {
      node && node.classList.remove(INLINE_CODE_END_CLASS);
    }
  }
}
```

## Summary
Previously, we implemented a semi-controlled input mode, which is currently the mainstream implementation in most rich text editors. Here, we focus on the issues caused by the default behavior of browser `ContentEditable` input mode, and we correct these issues through dirty `DOM` checking to maintain the strict `DOM` structure of the editor.

Currently, our main focus is on the text input issue in the editor, i.e., how to write the keyboard input content into the editor data model. The next step is to focus on the controlled handling of structural changes in the input mode, such as enter, delete, drag and drop operations, which are also based on input-related events and often involve structural changes in the text, constituting supplements to the input mode.

## Daily Quiz

- <https://github.com/WindRunnerMax/EveryDay>

## References

- <https://18.react.dev/>
- <https://developer.mozilla.org/zh-CN/docs/Web/API/CompositionEvent>
- <https://medium.engineering/why-contenteditable-is-terrible-122d8a40e480>
```