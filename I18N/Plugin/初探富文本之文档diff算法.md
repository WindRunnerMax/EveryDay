# Exploring the Document Diff Algorithm in Rich Text

When implementing an online document system, it's essential to consider version control and auditing capabilities, as these are crucial aspects of the entire document management process. In this process, document differencing or `diff` capability is typically required, allowing us to track document changes like the variances between a document draft and the live document, or the disparities between private versions `A` and `B`. This article is based on the `Quill` rich text editor engine and delves into the implementation of document `diff` algorithms.

## Description
`Quill` is a modern rich text editor known for its excellent compatibility, robust extensibility, and some out-of-the-box features. Open-sourced in `2012`, `Quill` has brought many innovations to the rich text editor scene, making it one of the most widely used editors in the open-source community. The ecosystem around `Quill` is rich and diverse, with numerous examples available on platforms like `GitHub`, including comprehensive collaboration implementations.

Firstly, let's consider a scenario - when describing a piece of plain text, simple input suffices. For instance, the underlying data structure of this article is plain text, and the content format is compiled by the compiler through lexical and syntax analysis, akin to serialization and deserialization. However, for a rich text editor like `Quill`, frequent serialization and deserialization during editing are performance-intensive. Hence, the data structure needs to be easily readable and writable, such as a `JSON` object. Describing rich text in `JSON` can take various forms, but fundamentally, it involves attaching additional attributes to specific text segments. For instance, if `A` is bold and `B` is italic, `bold` property is attached to `A`, and `italic` property to `B`. This data structure can effectively represent rich text content.

For `Quill`, the data structure is described by `quill-delta`. This data structure's design is excellent, and `quill-delta` also serves as an implementation of rich text Operational Transformation (`OT`) collaboration algorithm. However, for the `diff` capability we are focusing on here, it pertains more to the data structure level than collaboration. In `quill-delta`, the data structure for *a piece of text* is illustrated as follows. Of course, `quill-delta` expressions can be quite elaborate, enabling complete document content description through operations like `retain`, `insert`, and `delete`. We will delve into these `Op` when implementing the diff view feature later on.

```javascript
{
  ops: [
    { insert: "So in" },
    { insert: "quill-delta", attributes: { inlineCode: true } },
    { insert: "like this" },
    { insert: "a segment of text", attributes: { italic: true } },
    { insert: "'s" },
    { insert: "data structure", attributes: { bold: true } },
    { insert: "as shown below.\\n" },
  ],
};
```

Upon seeing this data structure, one might think it's just a standard `JSON`. Can't we directly use `JSON` diff since there are numerous algorithms available? This method theoretically works for purely `insert` text content, but the granularity may lack precision, failing to pinpoint specific word modifications. Thus, constructing a `delta` based on the `diff` results as per the `quill-delta` structure from `A` to `B` is not straightforward. For instance, in the following `JSON`, the result of our `diff` is deleting `insert: 1` and adding `"insert": "12",  "attributes": { "bold": true }`. In reality, what we've done is added `bold` style to `1` and appended `2` with `bold`. To apply this `diff` result to generate `B` from `A`, two actions are required: precise content modifications and transforming the `diff` result into `delta`. Hence, a better `diff` algorithm design is needed to simplify the entire process.

```js
// A
[
  { "insert": "1" }
]

// B
[
  {
    "insert": "12",
    "attributes": { "bold": true } 
  }
]
```

## diff-delta
Our goal here is to achieve a finer granularity in `diff`, construct `delta` directly, and apply it, meaning `A.apply(diff(a, b)) = B`. `Quill-delta` already has a pre-implemented `diff` algorithm, but we have streamlined it for better comprehension, especially concerning non-`insert` operations. It's crucial to note that the `diff` we discuss here is for non-collaborative modes. For document editors that have implemented `OT`, relevant version `Op` can be extracted from the history for `compose + invert`, and performing a full document `diff` algorithm isn't always necessary.

Complete `DEMO` can be directly opened in the console at `https://codesandbox.io/p/devbox/z9l5sl` to view it. As mentioned earlier, after using `JSON` for `diff`, we still need to process the data in two additional steps, especially for dealing with granularity seems more challenging. So, why not change our perspective on this granularity issue? We are working on processing rich text, and rich text is text with attributes. Therefore, can we adopt a text `diff` algorithm, then perform additional processing on the attribute values? This way, we can handle granularity very finely. In theory, this approach seems feasible, so we can continue exploring along this line of thinking.

First, let's consider the pure text `diff` algorithm. So, let's briefly understand the `diff` algorithm used by `diff-match-patch`. This algorithm is generally considered the best general-purpose `diff` algorithm, designed by `Eugene W. Myers` [here](https://neil.fraser.name/writing/diff/myers.pdf). Due to the capability of `match` and `patch` in `diff-match-patch`, but the algorithm we actually need only requires the `diff` capability, so we can just use `fast-diff`. It removes matching, patching, and all extra difference options, retaining only the basic `diff` capability, with the `diff` result being a two-dimensional array `[FLAG, CONTENT][]`.

```js
// diff.INSERT === 1;
// diff.EQUAL === 0;
// diff.DELETE === -1;
const origin = "Hello World";
const target = "Hello Diff";
console.log(fastDiff(origin, target)); // [[0, "Hello "], [-1, "World"], [1, "Diff"]]
```

Next, we need to construct the string. As mentioned above, the data format of `quill-delta` has been mentioned, so it is simple to construct. We need to first create a `Delta` object to carry the `diff` result of our `delta`.

```js
export const diffOps = (ops1: Op[], ops2: Op[]) => {
  const group = [ops1, ops2].map((delta) =>
    delta.map((op) => op.insert).join(""),
  );
  const result = diff(group[0], group[1]);

  const target = new Delta();
  const iter1 = new Iterator(ops1);
  const iter2 = new Iterator(ops2);
  // ...
}
```

The `Iterator` here is the iterator we will use to iterate over block structures. We can imagine that since the `diff` result consists of `N` characters, and the `insert` block in our `Delta` also has `N` characters, after `diff`, we need to process substrings of these two strings. Therefore, we need to iterate over `N` characters of the entire `Delta` for processing, and this part of data processing methods is encapsulated in the `Iterator` object. Let's take an overall look at the iterator's processing method.

```js
export class Iterator {
  // Store all `ops` in `delta`
  ops: Op[];
  // Current `ops index` to process
  index: number;
  // Offset of current `insert` string
  offset: number;

  constructor(ops: Op[]) {
    this.ops = ops;
    this.index = 0;
    this.offset = 0;
  }

  hasNext(): boolean {
    // Check if can continue processing based on remaining length
    return this.peekLength() < Infinity;
  }

  next(length?: number): Op {
    // ...
  }

  peek(): Op {
    // Get the current `op` to process
    return this.ops[this.index];
  }

  peekLength(): number {
    if (this.ops[this.index]) {
      // Return the remaining insert length of current `op` for iteration
      // It should never return `0` if our index management is correct
      return Op.length(this.ops[this.index]) - this.offset;
    } else {
      // Return the maximum value
      return Infinity;
    }
  }
}
```

In this case, the handling of the `next` method is a bit more complex. In the `next` method, our main goal is to extract the content of the `insert` part. It's important to note that each time we call `insert`, it won't span across `op`s. In other words, each `next` call can only extract up to the length of the `insert` stored in the current `op`. If the content exceeds the length of a single `op`, the corresponding attributes will not be consistent, making direct merging impossible. In such cases, we need to consider scenarios where the `diff` result is longer than the `insert`, requiring compatible handling of the attributes, essentially breaking down the `diff` result into blocks for processing.

```js
next(length?: number): Op {
  if (!length) {
    // Here, we are not skipping the iteration for invalid data,
    // but rather completing the iteration for the current 'op insert' at the current 'index'.
    length = Infinity;
  }
  // Although named 'nextOp', it actually refers to the current 'op' at the 'index'.
  const nextOp = this.ops[this.index];
  if (nextOp) {
    // Storing the current 'insert' offset to be processed
    const offset = this.offset;
    // Since we are dealing with pure textual 'InsertOp', it corresponds to the length of the 'insert' string
    const opLength = Op.length(nextOp);
    // If the length to be extracted is greater than the remaining length of the current 'insert'
    if (length >= opLength - offset) {
      // Processing all remaining length of the 'insert'
      length = opLength - offset;
      // Move to the next 'op' at this point
      this.index += 1;
      // Reset the 'insert' index offset
      this.offset = 0;
    } else {
      // Processing the 'insert' of the specified 'length'
      this.offset += length;
    }
    // Attributes carried by the current 'op'
    const retOp: Op = {};
    if (nextOp.attributes) {
      // Include them in 'retOp' if they exist
      retOp.attributes = nextOp.attributes;
    }
    // Extract the 'insert' string based on the previously stored 'offset' and computed 'length', then construct 'retOp'
    retOp.insert = (nextOp.insert as string).substr(offset, length);
    // Return 'retOp'
    return retOp;
  } else {
    // Return an empty 'insert' if the 'index' has exceeded the length of 'ops'
    return { insert: "" };
  }
}
```

Now, with the `Iterator`, we can extract the 'insert' part of 'op' in a more granular manner. Next, let's return to handling the `diff`. First, let’s look at the `diff` of the `attributes`. Fundamentally, assuming the current data structure is `Record<string, string>`, we can directly compare two `attributes`. The essence of `diff` is transforming `a` to become `b` through certain calculations, where `a + diff = b`. Therefore, iterating through all keys, if the values of the two `attrs` differ, we can assign the value of `b` to the target `attrs` based on value comparison.

```js
export const diffAttributes = (
  a: AttributeMap = {},
  b: AttributeMap = {},
): AttributeMap | undefined => {
  if (typeof a !== "object") a = {};
  if (typeof b !== "object") b = {};
  const attributes = Object.keys(a)
    .concat(Object.keys(b))
    .reduce<AttributeMap>((attrs, key) => {
      if (a[key] !== b[key]) {
        attrs[key] = b[key] === undefined ? "" : b[key];
      }
      return attrs;
    }, {});
  return Object.keys(attributes).length > 0 ? attributes : undefined;
};
```

Because we have already broken it down quite finely upfront, the final step won't be too complicated. Our goal is to construct the `a + diff = b` equation, focusing on the `diff` part. Therefore, when constructing `diff`, the target to consider is `a`. We need to keep this purpose in mind throughout the process, or else it may be hard to understand the operations on `delta`. In the overall process of `diff`, there are three main parts to handle: `iter1`, `iter2`, and `text diff`. Depending on the type of `diff` produced, we need to process accordingly. The guiding principle is to take the shorter length as the block to process. In the `diff.INSERT` section, we insert `delta` from `iter2` inserts. In the `diff.DELETE` section, we apply the length of `delete` from `iter1` to `delta`. In the `diff.EQUAL` section, we extract `op` from both `iter1` and `iter2` to handle the `diff` of `attributes` or `op` replacement.

```js
// The `diff` result is described using `delta`
const target = new Delta();
const iter1 = new Iterator(ops1);
const iter2 = new Iterator(ops2);
```

```js
// Iterating through the 'diff' results
result.forEach((item) => {
  let op1: Op;
  let op2: Op;
  // Retrieving the type and content of the current 'diff' block
  const [type, content] = item;
  // Length of the current 'diff' block
  let length = content.length; 
  while (length > 0) {
    // Length to be processed in this iteration
    let opLength = 0; 
    switch (type) {
      // Content identified as insertion
      case diff.INSERT: 
        // Retrieve the minimum value between the remaining length of 'op' in iter2 and the unprocessed length of the 'diff' block
        opLength = Math.min(iter2.peekLength(), length); 
        // Retrieve 'op' of length 'opLength' and add it to the target 'delta', then move the 'offset/index' pointer of iter2.
        target.push(iter2.next(opLength));
        break;
      // Content identified as deletion
      case diff.DELETE: 
        // Retrieve the minimum value between the unprocessed length of the 'diff' block and the remaining length of 'op' in iter1
        opLength = Math.min(length, iter1.peekLength());
        // Move the 'offset/index' pointer of iter1
        iter1.next(opLength);
        // The target 'delta' needs to record the length to be deleted
        target.delete(opLength);
        break;
      // Content identified as identical
      case diff.EQUAL:
        // Retrieve the minimum value between the unprocessed length of the 'diff' block, the remaining length of 'op' in iter1, and the remaining length of 'op' in iter2
        opLength = Math.min(iter1.peekLength(), iter2.peekLength(), length);
        // Retrieve 'op1' of length 'opLength' and move the 'offset/index' pointer of iter1
        op1 = iter1.next(opLength);
        // Retrieve 'op2' of length 'opLength' and move the 'offset/index' pointer of iter2
        op2 = iter2.next(opLength);
        // If the 'insert' content of both 'op' is the same
        if (op1.insert === op2.insert) {
          // Directly add the 'attributes diff' of length 'opLength' to the target
          target.retain(
            opLength,
            diffAttributes(op1.attributes, op2.attributes),
          );
        } else {
          // Directly add 'op2' to the target 'delta' and delete 'op1' as a fallback strategy
          target.push(op2).delete(opLength);
        }
        break;
      default:
        break;
    }
    // Remaining length of the current 'diff' block = current length of the 'diff' block - length processed in this iteration
    length = length - opLength; 
  }
});
// Remove trailing empty 'retain'
return target.chop();
```

Here we can illustrate the effect of 'diff' with an example. To see the specific effect, you can open the console in `https://codesandbox.io/p/devbox/z9l5sl` in the `src/index.ts` file. It mainly demonstrates the three types of 'diff' - `DELETE`, `EQUAL`, `INSERT`, and the resulting `delta`, where in this case `ops1 + result = ops2`.

```js
const ops1: Op[] = [{ insert: "1234567890\n" }];
const ops2: Op[] = [
  { attributes: { bold: "true" }, insert: "45678" },
  { insert: "90123\n" },
];
const result = diffOps(ops1, ops2);
console.log(result);

// 1234567890 4567890123
// DELETE:-1 EQUAL:0 INSERT:1
// [[-1, "123"], [0, "4567890"], [1, "123"], [0, "\n"]]
// [
//   { delete: 3 }, // DELETE 123 
//   { retain: 5, attributes: { bold: "true" } }, // BOLD 45678
//   { retain: 2 }, // RETAIN 90 
//   { insert: "123" } // INSERT 123 
// ];
```

## Comparison View
Now that our document `diff` algorithm is ready, it's time to get down to business and think about how to apply it to specific documents. Let's start with a simple approach. Imagine we have performed a `diff` between documents `A` and `B`, resulting in a `patch`. We can modify the `diff` directly, structure it as desired, and apply it to `A` to obtain a comparison view. Of course, we can also apply deleted content from `A` and added content from `B` to generate the view, which we'll discuss later. For now, let's focus on getting the comparison view directly from `A`.

Essentially, a comparison view highlights deletions in red and additions in green. Since rich text comes with its own formatting, we can leverage this to implement highlighting directly using rich text capabilities.

The core algorithm based on this approach is quite simple. Here, we handle formatting modifications by changing `DELETE` content to `RETAIN` with red `attributes`, adding green `attributes` to `INSERT` types, and then assembling this modified `patch` onto `A`'s `delta`. Applying the complete `delta` to the new comparison view is all that's needed. For a complete `DEMO`, refer to `https://codepen.io/percipient24/pen/eEBOjG`.

```js
const findDiff = () => {
  const oldContent = quillLeft.getContents();
  const newContent = quillRight.getContents();
  const diff = oldContent.diff(newContent);
  for (let i = 0; i < diff.ops.length; i++) {
    const op = diff.ops[i];
    if (op.insert) {
      op.attributes = { background: "#cce8cc", color: "#003700" };
    }
    if (op.delete) {
      op.retain = op.delete;
      delete op.delete;
      op.attributes = { background: "#e8cccc", color: "#370000" };
    }
  }
  const adjusted = oldContent.compose(diff);
  quillDiff.setContents(adjusted);
}
```

In essence, the core functionality in the code is just a few lines. It's great to solve complex requirements with a simple approach. In less complicated scenarios, you can achieve a comparison within the same document area or use separate views to apply deletion and addition `deltas`. However, as scenarios become more complex, such as needing to allow real-time editing and displaying `diff` results in the view representing additions on the right side, directly applying `diff-delta` to the document may pose some issues. Apart from potential performance concerns from continuously applying `delta` to rich text, in collaborative environments, managing local `Ops` and `History` is necessary, or in non-collaborative settings, filtering relevant keys to prevent storing `diff` results.

If the scenarios mentioned above just touch the advanced capabilities in basic functionalities, then in search scenarios, directly applying highlights to rich text content doesn't seem feasible. Imagine applying search results directly from the data layer to rich text for highlighting. This would involve all the issues mentioned earlier, and the performance cost due to frequent content changes is unacceptable. In `slate`, the concept of `decorate` exists, allowing the construction of `Range` to consume `attributes` without changing the document content, which aligns with our needs. Hence, we need a way to highlight content without modifying the rich text content, but it's not easy to achieve this capability at the editor-level rendering like `slate`. Alternatively, we can take a different approach by simply adding a semi-transparent highlight overlay to relevant positions, making it much simpler. Here, we refer to it as a virtual layer.

On a theoretical level, implementing a virtual layer is rather simple, just adding an extra layer of `DOM`, but there are many details to consider in this process. Firstly, let's address an issue: if we place a masking layer directly above a rich text editor, with a higher `z-index` than the text editor's, clicking on the masking layer would cause the rich text editor to lose focus. While we can use `event.preventDefault` to prevent the default behavior of focus shifting, other actions like click events would still pose similar problems. For instance, if a button's click action in the rich text editor is user-defined, covering the button with the masking layer would redirect the click event to the layer instead of triggering the button's action as expected. This scenario does not align with our intentions. 

To tackle this, let's shift our perspective. Lowering the `z-index` below that of the rich text editor can resolve the event issues. However, it triggers another problem; if the rich text content itself has a background color, adding a masking layer would conceal the layer's color beneath the original background color. Since our rich text capabilities are typically plugin-based, we can't control the user's background color plugins. These plugins must contain some level of transparency, and our masking layer needs to offer a universal capability. As a result, this solution also has its limitations.

The solution to this issue is actually quite simple. In `CSS`, there's a property named `pointer-events`, which, when set to `none`, ensures an element never becomes the target of mouse events. This can address the problems caused by the earlier approach. By using this, we can achieve our basic virtual layer styles and event handling. Additionally, using this property may lead to an interesting observation: right-clicking on the masking layer won't allow you to directly inspect the node in the console; you must use the `Elements` panel to select the `DOM` node rather than the reverse.

```html
<div style="pointer-events: none;"></div>
<!--
  You can't directly `inspect` related elements. Instead, use `DOM` operations to find and debug.
  [...document.querySelectorAll("*")].filter(node => node.style.pointerEvents === "none");
-->
```

After determining the method for drawing the masking layer, the next step is to confirm the position information for drawing shapes. Since the `DOM` nodes created by our rich text editor do not have separate nodes for each character, but rather nodes with the same `attributes` grouped together, a new issue arises. When dealing with a `diff` result, it's highly likely that we won't have a complete node for a particular `DOM`, but just a few characters. In such cases, we can't directly use `Element.getBoundingClientRect` to get the position information. Instead, we must rely on `document.createRange` to construct a range. It's worth noting that we are handling `Text` nodes, and only `Text` nodes and similar ones can set offsets. Both the `start` and `end` nodes in a `Text` node range can be directly constructed without needing to match exactly. For instance, in Quill, `editor.getBounds` offers location information retrieval. This method essentially uses `editor.scroll` to obtain the actual `DOM` and wraps it with `document.createRange`, handling various edge cases.

```js
const el = document.querySelector("xxx");
const textNode = el.firstChild;

const range = document.createRange();
range.setStart(textNode, 0);
range.setEnd(textNode, 2);

const rect = range.getBoundingClientRect();
console.log(rect);
```

Furthermore, we need to discuss another issue. With `diff`, we cannot guarantee the length of the current result. As we've established previously, we are implementing `diff` for plain text. Therefore, the `diff` result may be lengthy, which can potentially lead to problems. While using `editor.getBounds(index, length)` directly provides a `rect` (rectangle) covering range, issues may arise when dealing with longer `diff` results. Two key considerations arise in such cases: first, single-line content extending beyond the editor's visible area, causing line breaks; and second, content that spans multiple lines with `\n` characters included in the `diff` results.

Assuming the content above is the `diff` result, we are not focusing on whether it is of type `INSERT/DELETE/RETAIN` for now. Our current goal is to implement highlighting. In these two scenarios, if we directly highlight the rectangular area fetched through `getBounds`, it is obvious that a large amount of non-text or blank spaces will be highlighted. In this case, our approach would be to take the maximum range for highlighting coverage. Actually, we can accept it if only blank spaces are covered, but consider a scenario where only some content is changed. For example, content is inserted in the entire line N, and at the beginning of line N+1, a letter is also inserted. Due to the width of line N affecting line N+1, the highlight ends up covering the entire line. This inaccurate highlighting in our `diff` result is not acceptable, whether it involves line breaks or spanning across lines.

Next, we need to address these two issues. For the calculation of positions spanning multiple lines, we can adopt a relatively simple approach. We just need to know exactly where the line breaks occur and split the `diff` result accordingly to change our granularity from document-level to line-level processing. However, `Quill` doesn't directly provide operations at the line `Range` level. Therefore, we need to maintain our own line-level `index-length`. We can easily split the `index-length` comprehensively by using `delta insert` and calculate using `editor.scroll.lines`. When there are changes in the document content, we can also maintain index values based on `delta-changes`. Moreover, if we manage `Blocks` through multiple `Quill` instances, managing at the `Line` level becomes more straightforward, and maintaining index becomes simpler. However, during `diff`, we will need a `Block` tree-level implementation. It's relatively easier to implement `diff` when dealing with `Blocks` with the same `id`, but when there is a need for `diff` across `Blocks`, the implementation might become more complex.

```js
const buildLines = (content) => {
  const text = content.ops.map((op) => op.insert || "").join("");
  let index = 0;
  const lines = text.split("\n").map((str) => {
    // It's important to note that our `length` includes `\n`
    const length = str.length + 1;
    const line = { start: index, length };
    index = index + length;
    return line;
  });
  return lines;
}
```

Once we have split the line `index-length` index, the next step is to break down the original complete `diff-index-length` into line-level content. Here, it is crucial to handle the line-identifying node, namely `\n`, `attributes`, with special consideration. Because all modifications to this node are directly applied to the entire line. For instance, when a line changes from a second-level heading to a first-level heading, the entire line needs to be highlighted as a style change. Of course, there may also be content additions or deletions within the heading, and these highlights can be displayed in different colors. This is one of the reasons we need to maintain line-level `Range`.

```js
return (index, length, ignoreLineMarker = true) => {
  const ranges = [];
  // Tracking
  let traceLength = length;
  // Index can be found by binary search. `body` is directly taken from `lines`, searching results require adding `line` identifier.
  for (const line of lines) {
    // For nodes with only `\n`, indicating end of line and having independent `attributes`
    if (length === 1 && index + length === line.start + line.length) {
      // If ignoring line markers, stop the search
      if (ignoreLineMarker) break;
      // Need to construct the `range` for the entire line content
      const payload = { index: line.start, length: line.length - 1 };
      !ignoreLineMarker && payload.length > 0 && ranges.push(payload);
      break;
    }
    // Iterate through lines to construct `range` using line index
    // Check if content needs to be split and ensure remaining `range` is within the `line`'s range
    if (
      index < line.start + line.length &&
      line.start <= index + traceLength
    ) {
      const nextIndex = Math.max(line.start, index);
      // Compare tracking length/line length/remaining line length
      const nextLength = Math.min(
        traceLength,
        line.length - 1,
        line.start + line.length - nextIndex
      );
      traceLength = traceLength - nextLength;
      // Construct range within the line
      const payload = { index: nextIndex, length: nextLength };
      if (nextIndex + nextLength === line.start + line.length) {
        // Exclude cases where it's exactly `\n` at the boundary
        payload.length--;
      }
      payload.length > 0 && ranges.push(payload);
    } else if (line.start > index + length || traceLength <= 0) {
      // If the current line exceeds the range or tracking length is zero, stop the search directly
      break;
    }
  }
  return ranges;
};
```

Next, we need to address the issue of line wrapping due to long single-line content. Since we have already segmented the `diff` results into lines, we can focus on how to render the highlights. As mentioned earlier, we cannot directly draw the `rect` obtained from calling `getBounds` onto the text. Therefore, we can consider splitting a paragraph into three parts: the first line `head`, content `body`, and last line `tail`. Only the beginning and end of each line will have partial highlighted areas, which require separate calculation of `rect`. The `body` part will always have a complete `rect` which can be rendered directly. Therefore, using three `rect`s to represent the highlight of single-line content will suffice. The data returned from `getBounds` is sufficient to support the processing of single-line content into three sections. We need to obtain the `rect` of the first `head` and last `tail`, and calculate the `rect` of the `body` part based on these two `rect`s. Depending on the number of actual line breaks, different scenarios need to be considered: for single-line content, only the `head` is sufficient; for two lines, both `head` and `tail` are needed for rendering with `body` acting as a placeholder for positioning; for multiple lines, `head`, `body`, and `tail` need to render their respective contents to ensure the integrity of the layers.

```js
// Get boundary positions
const startRect = editor.getBounds(range.index, 0);
const endRect = editor.getBounds(range.index + range.length, 0);
// Single-line block container
const block = document.createElement("div");
block.style.position = "absolute";
block.style.width = "100%";
block.style.height = "0";
block.style.top = startRect.top + "px";
block.style.pointerEvents = "none";
const head = document.createElement("div");
const body = document.createElement("div");
const tail = document.createElement("div");
// Render based on different scenarios
if (startRect.top === endRect.top) {
  // Single line (non-wrapping) scenario `head`
  head.style.marginLeft = startRect.left + "px";
  head.style.height = startRect.height + "px";
  head.style.width = endRect.right - startRect.left + "px";
  head.style.backgroundColor = color;
} else if (endRect.top - startRect.bottom < startRect.height) {
  // Two lines (wrapped once) scenario `head + tail` `body` placeholder
  head.style.marginLeft = startRect.left + "px";
  head.style.height = startRect.height + "px";
  head.style.width = startRect.width - startRect.left + "px";
  head.style.backgroundColor = color;
  body.style.height = endRect.top - startRect.bottom + "px";
  tail.style.width = endRect.right + "px";
  tail.style.height = endRect.height + "px";
  tail.style.backgroundColor = color;
} else {
  // Multiple lines (wrapped multiple times) scenario `head + body + tail`
  head.style.marginLeft = startRect.left + "px";
  head.style.height = startRect.height + "px";
  head.style.width = startRect.width - startRect.left + "px";
  head.style.backgroundColor = color;
  body.style.width = "100%";
  body.style.height = endRect.top - startRect.bottom + "px";
  body.style.backgroundColor = color;
  tail.style.marginLeft = 0;
  tail.style.height = endRect.height + "px";
  tail.style.width = endRect.right + "px";
  tail.style.backgroundColor = color;
}
```

After solving the above two issues, we can apply `delta` to the `diff` algorithm to obtain results, and divide them line by line to construct a new `Range`. Here we want the left view to reflect `DELETE` content and the right view to reflect `INSERT + RETAIN` content. By storing the constructed `Range` in different arrays based on the different types of `diff`, and finally obtaining position information with `editor.getBounds` based on the `Range`, constructing new layer `DOM` at relevant positions to achieve highlighting is all we need to do.

```js
const diffDelta = () => {
  const prevContent = prev.getContents();
  const nextContent = next.getContents();
  // ...
  // Building basic data
  const toPrevRanges = buildLines(prevContent);
  const toNextRanges = buildLines(nextContent);
  const diff = prevContent.diff(nextContent);
  const inserts = [];
  const retains = [];
  const deletes = [];
  let prevIndex = 0;
  let nextIndex = 0;
  // Iterating over `diff` results and transforming
  for (const op of diff.ops) {
    if (op.delete !== undefined) {
      // Content of `DELETE` needs to be placed in the left view in red highlight
      deletes.push(...toPrevRanges(prevIndex, op.delete));
      prevIndex = prevIndex + op.delete;
    } else if (op.retain !== undefined) {
      if (op.attributes) {
        // Content of `RETAIN` needs to be placed in the right view in purple highlight
        retains.push(...toNextRanges(nextIndex, op.retain, false));
      }
      prevIndex = prevIndex + op.retain;
      nextIndex = nextIndex + op.retain;
    } else if (op.insert !== undefined) {
      // Content of `INSERT` needs to be placed in the right view in green highlight
      inserts.push(...toNextRanges(nextIndex, op.insert.length));
      nextIndex = nextIndex + op.insert.length;
    }
  }
  // Rendering `DOM` based on transformed results
  buildLayerDOM(prev, deleteRangeDOM, deletes, "rgba(245, 63, 63, 0.3)");
  buildLayerDOM(next, insertRangeDOM, inserts, "rgba(0, 180, 42, 0.3)");
  buildLayerDOM(next, retainRangeDOM, retains, "rgba(114, 46, 209, 0.3)");
};
// Timing of `diff` rendering
prev.on("text-change", _.debounce(diffDelta, 300));
next.on("text-change", _.debounce(diffDelta, 300));
window.onload = diffDelta;
```

To summarize the overall process, in order to implement a `diff` based on virtual layers, we need a `diff` algorithm, construct `Range`, calculate `Rect`, and render `DOM`. In fact, to achieve this skill well is quite complex, especially with many edge cases to handle. For example, some text may have different fonts or styles applied, resulting in different rendering heights compared to regular text. If the `diff` falls on these edges, it may cause issues in calculating our `rect`, leading to problems in rendering the styles of layer nodes. Here we have not addressed such issues, only established the entire process without special focus on edge cases. For a complete demo, you can directly visit `https://codesandbox.io/p/sandbox/quill-diff-view-369jt6`.

## Daily Challenge

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://quilljs.com/docs/api/
https://zhuanlan.zhihu.com/p/370480813
https://www.npmjs.com/package/quill-delta
https://github.com/quilljs/quill/issues/1125
https://developer.mozilla.org/zh-CN/docs/Web/API/Range
https://developer.mozilla.org/zh-CN/docs/Web/API/Document/createRange
```