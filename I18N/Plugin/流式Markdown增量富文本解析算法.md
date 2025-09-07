# Incremental Rich Text Parsing Algorithm in Streaming Markdown

Previously, we have implemented streaming output with `SSE` and a `RAG` service based on vector indexing, both falling under the realm of `AI Infra`. Now, let's delve into combining Markdown parsing and rich text editor rendering on the basis of `SSE` streaming output to achieve an incremental parsing algorithm for editors, also part of infrastructure development in the document context.

## Overview
In the scenario of `SSE` streaming output, the `LLMs` model will gradually output Markdown text. In a basic scenario, we only need to implement rendering of the `DOM`. However, in the context of a rich text editor, things get more complex. Editors usually maintain their own data structure and cannot directly accept `DOM` structure. Additionally, taking into consideration performance issues, we need to address the following points:

- Streaming: Handling incomplete Markdown text requires support for rebuilding rendered content when syntax issues arise in incomplete situations.
- Incremental: Updating stable content incrementally, rather than rerendering everything each time, is essential.
- Rich text parsing: Full parsing of Markdown, whether in streaming processing or incremental parsing, needs equivalent implementation based on the editor's structure.

Even in the case of basic `DOM` rendering, there are many boundary cases to consider. Performance issues like full rendering every time `Md` is output with `SSE`, and problems like re-rendering image nodes leading to potential reload problems, need to be addressed. Therefore, the incremental parsing algorithm process discussed here is valuable even for basic scenarios.

Moreover, in more complex scenarios during `SSE` streaming output, users might always have temporary incomplete `Md` text. Before complete `Md` text is output, there might be non-standard `Md` parsing or misalignment with another `Md` syntax. Such situations require additional algorithm processing to implement some syntax correction solutions.

```
<img src="http://
<img src="http://example.com/
<img src="http://example.com/image.png" alt=
```

Furthermore, tasks like rendering syntax extensions and custom components involve additional syntax handling. For custom parsing and rendering implementations, `react-markdown` provides a good reference. This pipeline is quite extensive and serves as a good example for custom processing of `AST`. The `remark` ecosystem is also rich, offering various implementations related to Markdown parsing.

```
markdown -> remark + mdast -> remark plugins + mdast -> remark-rehype + hast -> rehype plugins + hast-> components + ->react elements
```

However, here we are not delving into discussions on custom syntax parsing. Instead, the focus is mainly on basic `Md` syntax parsing and incremental rendering. Yet, during the parsing process, handling issues related to syntax error matching is inevitable.

For related implementations, you can refer to [BlockKit](https://windrunnermax.github.io/BlockKit/streaming.html) and [StreamDelta](https://github.com/WindRunnerMax/webpack-simple-environment/tree/master/packages/stream-delta). Additionally, unit tests are available to verify the implementation results and various important boundary cases.

```mermaid
%%{init: {"theme": "neutral" } }%%
graph LR
    Text --> |Fragments| Lexical Analysis --> |Tokens| Cursor Pointer --> DC[Delta Changes]
    Editor --> DF[Delta Fragments] --> R[Retain Pointer] --> D[Diff Delta] --> Apply
    DC --> D
```

## Markdown Incremental Parsing
Let's first implement incremental parsing for Markdown, allowing progressive parsing. The key foundation for enabling incremental parsing is that subsequent formatting in `Md` output generally does not affect earlier formatting, enabling archiving of stable content. Thus, we can design a data processing approach based on the following core principles to adhere to during parsing:

- Parsing Markdown non-essentially, dividing and processing data progressively based on streams.
- Binding incremental changes to `Delta` based on the structure parsed by `Lexer`.

### Lexical Analysis
Initially, we need a lexical analyzer to parse `Md` into a stream of `Tokens`, or a syntax parser to transform `Md` into an `AST`. For our flat data structure, secondary parsing of standard flat `Token` flow is not overly complex. However, for a completely nested data structure, utilizing a syntax parser to generate `AST` for parsing `Md` might be more convenient.

Popular parsers in the current scene have various related implementations. `marked` provides a `lexer` method and `marked.Lexer` as a parser. `remark`, a part of the extensive `unified` ecosystem, offers `mdast-util-from-markdown` as an independent parser. Similarly, `markdown-it` also provides `parse` and `parseInline` methods as parsers.

Here we have chosen `marked` as the parser mainly because it is simple and easy to understand. The ecosystem of the `remark` series is too extensive, but as a standard `AST` parser, it is a very good choice. `markdown-it`'s `Token` parser is slightly more complex, it does not nest directly but processes data using tags like `heading_open`.

From the name, one can also tell that the `lexer` provided by `marked` leans towards lexical analysis, but it is not purely a lexical analyzer. This is because the output structure also contains nested elements. However, it is not a standard `AST` structure but rather leans towards a mixed structure more akin to a `Token` stream implementation. The parsing structure of a piece of Markdown text is as shown below:

```js
// marked.lexer("> use marked")
{
    "type": "blockquote",
    "raw": "> use marked",
    "tokens": [
        {
            "type": "paragraph",
            "raw": "use marked",
            "text": "use marked",
            "tokens": [{ "type": "text", "raw": "use marked", "text": "use marked", "escaped": false }]
        }
    ],
    "text": "use marked"
}
```

### Archive Index
During the parsing process, we need to maintain several variables to hold the current parsing state. `content` maintains the current segment being parsed, accepting streaming data requires continuously obtaining new segments to assemble, `indexIds` uses index values as stable keys for mapping `id` values, and `archiveLexerIndex` maintains the index values of the already archived primary `Tokens` nodes.

```js
/** Currently parsing content */
protected content: string;
/** Idempotent indexing */
public indexIds: O.Map<O.Map<string>>;
/** Index values of archived primary nodes */
public archiveLexerIndex: number;
```

When appending new content, we simply merge the `content` with the text being appended, then with the help of `marked` lexer, we can obtain the `Token Tree`. In the scheduling main framework, we only parse primary nodes. Parsing only primary nodes can simplify the data we need to handle, and secondary nodes can be further indexed for processing.

```js
const tree = marked.lexer(this.content);
const archiveLexerIndex = this.archiveLexerIndex;
// Iterating only first-level child nodes of root
for (let i = 0; i < tree.length; i++) {
  // ...
}
```

Next, we need to handle the archived positions. Archiving means that we consider the `Token` will no longer be processed, so the index held increments. The `block.raw` is the raw content of the `Token` being parsed, which is the simplification of using `marked`, otherwise we would need to parse it manually based on the index. For text archival, we simply remove the portion directly.

```js
/**
 * Archive a portion of content
 * @returns length of archived characters
 */
public archive(block: Token) {
  this.archiveLexerIndex++;
  const len = block.raw.length;
  this.content = this.content.slice(len);
  return len;
}
```

After handling the archived indices properly, we can then specifically process these archived portions within the loop. The strategy here is quite simple - if a node in the loop has a preceding node, we can archive the previous node. However, archiving here is not ideal, especially when there are list, table, etc., nodes, which require special handling, a topic we will discuss later.

Then it's time to parse the current `Token`, this part needs to be adapted to the editor's own data structure implementation. In the current editor, we consider a `Token` as a primary node, yet it might not directly correspond to the state of an editor row completely. For instance, a `list` node might have nested `list_item` nodes, while our structure is purely flattened row structure, therefore requiring independent adaptation.

```js
const prev = tree[i - 1];
const child = tree[i];
// Archive the previous node when first-level child has a second level
// Additionally, nodes like tables can be regex-matched to avoid premature archiving
if (prev && child) {
  this.archive(prev);
}
const section = parseLexerToken(child, {
  depth: 0,
  mc: this,
  parent: null,
  index: archiveLexerIndex + i,
});
```

In the process of converting `Token` to `Delta` fragments, let's take the `heading` line format and the `bold` inline format as examples to briefly explain the parsing process. For line nodes, the order of execution is crucial. It is necessary to recursively process all inline nodes first, and then proceed with the processing of line nodes. Whether it is a line node or an inline node, the properties are modified in-place in an encapsulated manner.

```js
switch (token.type) {
  case "heading": {
    const tokens = token.tokens || [];
    const delta = parseChildTokens(tokens, { ...options, depth: depth + 1, parent: token });
    applyLineMarks(delta, { heading: "h" + token.depth });
    return delta;
  }
  case "strong": {
    const tokens = token.tokens || [];
    const delta = parseChildTokens(tokens, { ...options, depth: depth, parent: token });
    applyMarks(delta, { bold: "true" });
    return delta;
  }
}
```

Furthermore, if there is a need to further parse `HTML` nodes, it is necessary to introduce independent HTML analysis tools such as `parse5/htmlparse2` to parse HTML fragments. However, the parse5 parsing result strictly handles the nested structure of the DOM, making it more suitable to use `htmlparse2` to handle HTML fragments. Another common parsing approach is to process all data as HTML and then parse it into an HTML-AST format.

### Syntax Correction
In the above implementation, we have been able to achieve incremental parsing for the Markdown part. Although this strategy is mostly effective, there are two issues that may arise during streaming output. Firstly, there might be transient nodes during streaming input, leading to incorrect archiving, such as indented lists. Secondly, there could be erroneous syntax matching, as in the case of interpreting an indented unordered list item as a heading.

Therefore, it is essential to address these cases, primarily focusing on correcting the syntax mismatches rather than completing incomplete syntax. Let's first consider the issue of list indentation. Using the above strategy directly in the following example would result in the misclassification of the `1` node in the first line, causing the `1.1` node to lack proper indentation formatting since there is no nested list token.

```md
- Unordered list item 1
   - Unordered list item 1.1
```

Let's analyze the problem here. During the streaming output process, the `1.1` line will have a transient `   ` state, i.e., three preceding spaces for indentation. Before outputting the `-` character, the parsing format of this token is as follows. According to the aforementioned strategy, if the preceding token exists and the current token also exists, the preceding token is archived.

```js
[{ type: "list", raw: "1. xxx", ordered: true, start: 1, loose: false, items: [ /* ... */ ]},
{  type:"space", raw:"\n   \n" }]
```

After archiving, only the `1.1` node remains for parsing. Since the previous `1` node has been archived, `1.1` is now considered a new `list` and `list_item` node. As there are no nested nodes, it can still parse the content properly, but the indentation format is lost.

```js
{ type:"list", raw:"   -\n", ordered: false, start: "", loose: false, items: [ /* ... */ ]}
```

Therefore, to address this issue, extra processing of the parsed tokens is necessary. In the aforementioned case, we can consider the presence of a `space` node causing premature archiving of the preceding list node. Hence, the `space` node is deemed a temporary state and should not trigger archive of the preceding node.

```js
export const normalizeTokenTree = (tree: Token[]) => {
  const copied = [...tree];
  if (!copied.length) return copied;
  const last = copied[copied.length - 1];
  // If awaiting further data processing, remove the last node
  // Case 1: In the presence of a space node, there might be a need to await input, as seen in the list example provided above.
  if (last.type === "space") {
    copied.pop();
  }
  return copied;
};
```

Regarding the second issue, errors in syntax matching may also manifest notably. Incorrect syntax matching can lead to style inconsistencies. These states are also transient and should be rectified during continued parsing to ensure the correct structural matching, thereby preventing abrupt style changes during output. For instance, in the example below, an unordered list `-` should have been interpreted as a heading, but was erroneously parsed.

```md
- xxx
   - 
```

```js
({
  type: "list",
  items: [
    {
      type: "list_item",
      tokens: [ { type: "heading", tokens: [ /* ...*/ ] } ],
    },
  ],
});
```

Actually, this format is not problematic at all, because this is the format specified in the standard itself, just that using `---` to set the heading format is not commonly used in practice. Naturally, we can also consult the format definition in the standard, in the `Setext headings` section where relevant definitions can be found:

> The setext heading underline can be preceded by up to three spaces of indentation, and may have trailing spaces or tabs - Example 86

```md
Foo
   ----
```
> A list item can contain a heading - Example 300

```md
- # Foo
- Bar
  ---
  baz
```

Therefore, the solution to this issue is quite simple as well, which is to avoid the occurrence of this temporary state. This is also the principle we should follow when dealing with these two issues. Hence, we can use regex to match this temporary state, and if a match is found, the line can be removed, awaiting the appearance of the correct format later.

```js
export const normalizeFragment = (md: string) => {
  // Case 1: When a single - appears at the end of an indented unordered list item, it needs to be avoided from being parsed as a heading
  // - xxx
  //    -
  const lines = md.split("\n");
  const lastLine = lines[lines.length - 1];
  if (lastLine && /^[ ]{2,}-[ \n]?$/.test(lastLine)) {
    lines.pop();
  }
  return lines.join("\n");
};
```

## Editor Streaming Rendering
After the incremental parsing of `Markdown`, we need to map the parsed result to the editor's own data structure, and the main process here needs to be coordinated with the implementation of the `Md` parsing process. Similarly, we follow the process of `Md` parsing, implementing archive indexing and reconstruction of parsed data, among other methods.

### Streaming Parsing
Several variables are also needed in the process of streaming parsing. Firstly, the `Token Delta` being processed needs to ensure that it is an independent top-level `Token` node, which is the main node that matches the `Md` parsing. Secondly, the length of the archived `Delta` as well as the text length index of the `Delta` array are different from the indexing in `Md` parsing.

```js
/** Archived index */
public archiveIndex: number;
/** Currently processing token-delta */
public current: Delta | null;
```

When appending content, we need to apply the latest `Token` to the editor. However, since the editor has already applied the content, the editor applies changes, and hence the difference between the content applied and the target content needs to be calculated so that it can be directly applied to the editor itself.

```js
/**
 * Append delta
 * @returns The applied difference
 */
public compose(delta: Delta) {
  const copied = new Delta(cloneOps(delta.ops));
  if (!this.current) {
    this.current = copied;
    return delta;
  }
  // Here, you can also avoid diffing, directly construct the deletion of the original content and then add the new content
  // Since the content will be archived, whether comparing differences or deleting/adding will not consume too much performance
  const diff = this.current.diff(copied);
  this.current = copied;
  return diff;
}
```

The implementation of archiving is relatively straightforward, mainly involving archiving the current `Delta` and updating the archive index. Since theoretically only `insert` operations will exist, the `length` method can be directly called to obtain the current length of the `Delta`, although it is advisable to still check the type of operation here.

```js
/**
 * Archive part of the content
 * @returns The length of the archived delta
 */
public archive() {
  if (this.current) {
    // This should theoretically only have insert, so there is no need to consider pointer issues for deleting
    const len = this.current.length();
    this.archiveIndex = this.archiveIndex + len;
    this.current = null;
    return len;
  }
  return 0;
}
```

Next, we need to integrate the combining process of `Delta` into the parsing process of `Md`. First, we need to obtain the current archived index, which needs to be converted to `retain` to align the indexes. Then, while looping through the archiving process, we need to continue handling index information, primarily because the subsequent process is `merge diff`, where the length is not the same as `dc`.

The final `compose` method merges the remaining parsed `Token` transformed `Delta`, ultimately returning the delta, which represents the changes of the current appended content, as mentioned earlier in the `diff` method. Finally, the `merge` method merges the changes with the previous `retain` pointer to ensure the correctness of the index.

```js
// Since the first value of delta is retain, here we also need to align its length expression
let archiveLength = this.dc.archiveIndex;
for (let i = 0; i < tree.length; i++) {
  if (prev && child) {
    this.archive(prev);
    archiveLength = archiveLength + this.dc.archive();
    const deltaLength = getDeltaPointerPosition(delta);
    // If the archived length is greater than the current delta length, then the pointer needs to be moved
    if (archiveLength - deltaLength > 0) {
      delta.push({ retain: archiveLength - deltaLength });
    }
  }
  // ...
  const diff = this.dc.compose(section);
  delta.merge(diff);
}
```

In practice, this implementation requires thorough testing to ensure stability, especially when handling various cases. It is essential to maintain a test suite to avoid issues with previously tested content parsing. During unit testing, we mainly focus on the following types of inputs and outputs:

- Firstly, complete `Md` text input is tested mainly for the correctness of parsing all `Token`.
- Secondly, text content streaming input, where testing can be done using a stable flow rendering output with single characters.
- Lastly, random character streaming input poses challenges in maintaining stable unit test outputs, requiring testing of the final output.

### Stable Key-Value
Although our current editor does not implement block-level structure nesting, such structures are usually inevitable, such as code blocks, tables, etc. Regardless of simple block structure nesting or structure implementation in `Blocks` mode, there are usually unique block-level structures identified by an `id` value.

During the streaming output process, the problem of `id` value being regenerated easily arises, especially in complex structures like tables. When implementing archiving only for primary nodes, each cell might be re-parsed, leading to new `id` values. Thus, maintaining a mapping table for `id` values during parsing is crucial to avoid performance issues caused by repeated rendering.

Therefore, maintaining the `id` mapping table requires implementing a stable key-value. Without a stable key-value, it is impossible to determine whether the `id` parsed previously and the current `id` should match. Here, we use a combination of `index` and `depth` values as the index to map `id` values for complex structures, which is the role of `indexIds` mentioned earlier.

```js
const key = `depth:${depth}-index:${index}`;
const id = (mc.indexIds[key] && mc.indexIds[key].id) || generateId();
const delta = parseChildTokens(tokens, { ...options, depth: depth + 1, parent: token });
const block = new Block({ id, delta });
// ...
```

### Editing Mode
Typically, we do not allow user editing during the streaming output process, so setting `readonly` to `true` suffices until the output is complete, then set it to `false`. However, if users need to edit during streaming output, the issue becomes complex.

Regarding the editing mode, resolving data conflicts caused by various input modes usually involves using the `OT` algorithm. If the editor structure can support `CRDT` data mode, the problem should be simpler since it theoretically handles relative edit positions. The need to address index conflicts arises from absolute position issues.

In `OT` implementation, the most crucial aspect is the `transform` method. Looking at the meaning conveyed by `transform`, if in collaboration, `b' = a.t(b)` implies that if `a` and `b` stem from the same draft, `b'` is what `b` should transform to based on `a`. 

Also, viewing `transform` as addressing the impact of `a` operations on `b` operations, similar to the `undoable` implementation in the `History` module, `transform` resolves the effect of operations `Opa` and `Opb` on a local client, hence handling the impact of streaming output and user input data interactions.

This strategy actually applies to incremental streaming processing on existing documents as well. In other words, it performs incremental `Md` parsing on existing documents, which would be more significant in the context of our editor. Imagine a scenario where, similar to the editing mode in an `IDE`, users want to add or delete content to existing documents. In such cases, the content can be applied directly instead of using pop-up dialogs.

Since we have recorded `archiveLength`, changes within `archiveLength` are considered to be stable structures, while changes outside `archiveLength` are considered temporary states. Therefore, handling `OT` becomes much simpler here, splitting our calculations into two parts:

- For changes within `archiveLength`, we simply add the index values for `insert` operations and subtract them for `delete` operations.
- For changes outside `archiveLength`, we need to construct a `retain` operation based on the index, and then integrate the user's changes into the current `Delta`.

Here we need to clarify a basic principle. The term `archive` refers to stable content, so only the values expressed by `retain` in the changes should be used as indices, while the lengths of `insert` and `delete` operations should be considered as actual change content lengths. Therefore, when calculating archiving index values, we should only consider the length of `retain`, treating other operations as lengths of changed content.

Another issue, although in theory, when inputting content, we mostly encounter `retain + insert/delete` operations, for unforeseen circumstances, we should handle all types of operations completely. Hence, we need to use `retain` to calculate the cutting points, where the operations on the left are considered changes in archiving length, and those on the right are considered changes in the current `Delta`.

```js
/**
 * Get the content fragment resulting from changes
 */
export const getContentChangeFragment = (delta: Delta, dc: DeltaComposer) => {
  /** Remaining archive retain */
  let archive = dc.archiveIndex;
  /** Length of target archive changes */
  let changeLength = 0;
  /** Delta split -> archive | current delta */
  let dividing = 0;
  let op: Op | undefined;
  const newOps = [...delta.ops];
  while ((op = newOps.shift())) {
    if (isRetainOp(op)) {
      if (op.retain > archive) {
        newOps.unshift({ retain: op.retain - archive });
        dividing = dividing + archive;
        break;
      } else {
        archive = archive - op.retain;
        dividing = dividing + op.retain;
      }
      continue;
    }
    if (isDeleteOp(op)) {
      changeLength = changeLength - op.delete;
      dividing = dividing + op.delete;
      continue;
    }
    if (isInsertOp(op)) {
      changeLength = changeLength + op.insert.length;
      dividing = dividing + op.insert.length;
      continue;
    }
  }
  return { delta: new Delta(newOps), changeLength };
};
```

## Summary
In this article, we implemented lexical parsing for `Md` and further processed incremental `Token` archiving and processing. We combined the entire `Md` process with incremental rendering of the editor's data structure. We also addressed specific syntax matching issues and editor details such as `id` indexing and editing mode. Based on these aspects, we achieved the implementation of an incremental rich text parsing algorithm for Markdown.

Furthermore, since editor data structures are usually specific patterns maintained by each, we leaned towards business code implementation rather than generic parsing patterns. Adaptations are needed in different business scenarios. However, abstracting a lower-level implementation from the `Md` parsing process is a fairly common pattern, which can indeed provide a universal algorithm.

In fact, at this point, we need to consider one more thing. If the goal is to start from scratch and output content rather than incremental processing, we can also implement a streaming output of pure `HTML` rendering mode, then replace it with the editor after the streaming output is complete. This is a viable solution that can avoid many complex implementations, but the cost shifts to needing an additional set of pure rendering styles to match the editor's style, ensuring user experience.

## Question of the Day

- <https://github.com/WindRunnerMax/EveryDay>

## References

- <https://astexplorer.net/>
- <https://spec.commonmark.org/0.30/>
- <https://marked.js.org/using_pro#lexer>
- <https://github.com/remarkjs/react-markdown>
- <https://marked.js.org/demo/?outputType=lexer>
- <https://github.com/syntax-tree/mdast-util-from-markdown>