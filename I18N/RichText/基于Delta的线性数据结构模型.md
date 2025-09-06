# Linear Data Structure Model Based on Delta
The design of the data model is the core foundation of the editor, directly affecting the design of modules such as selection model, DOM model, and state management. For example, in `quill`, the selection model is expressed as `index + len`, while in `slate` it is expressed as `anchor + focus`, all of which are derived from the design of data models. Therefore, when building a rich text editor from scratch, it is essential to start with the design of the data model and then gradually implement other modules.

- Source Code: <https://github.com/WindRunnerMax/BlockKit>
- Live Editor: <https://windrunnermax.github.io/BlockKit/>
- Project Notes: <https://github.com/WindRunnerMax/BlockKit/blob/master/NOTE.md>

Articles on implementing a rich text editor project from scratch:

- [Feeling Inadequate, Getting Started on Writing a Rich Text Editor from Scratch](./从零设计实现富文本编辑器.md)
- [Implementing a Rich Text Editor from Scratch #2 - Editor Architecture Design based on MVC Pattern](./基于MVC模式的编辑器架构设计.md)
- [Implementing a Rich Text Editor from Scratch #3 - Linear Data Structure Model based on Delta](./基于Delta的线性数据结构模型.md)
- [Implementing a Rich Text Editor from Scratch #4 - Core Interaction Strategy of Browser Selection Model](./浏览器选区模型的核心交互策略.md)
- [Implementing a Rich Text Editor from Scratch #5 - State Structure Representation of Editor Selection Model](./编辑器选区模型的状态结构表达.md)
- [Implementing a Rich Text Editor from Scratch #6 - Synchronization between Browser Selection and Editor Selection Model](./浏览器选区与编辑器选区模型同步.md)
- [Implementing a Rich Text Editor from Scratch #7 - Half-Controlled Input Mode based on Composite Events](./基于组合事件的半受控输入模式.md)

## Delta
As mentioned in the previous architectural design, we have implemented a flat data structure with independent modular design, making it more convenient to handle both editor operations and server-side data parsing. While nested data structures may align better with the `DOM` representation, they introduce complexity to data manipulation.

Therefore, in the design of the data structure, we have made modifications based on the `delta` structure of `quill`. The main transformation is to make it an `immutable` implementation, maintaining the state in the editor rather than the `delta` structure itself. We have also streamlined the expression of the entire data model, reducing the complexity of `insert` and `Attribute` types, thus reducing the operational logic complexity.

`Delta` is a concise and powerful format for describing document content and changes. This format, based on `JSON`, is not only easy to read but also machine-parsable. By using `delta` to describe content, one can accurately represent the content and formatting information of any rich text document, avoiding the ambiguities and complexities common in `HTML`.

A `delta` consists of a series of operations that describe changes to the document. Common operations include `insert`, `delete`, and `retain`. It is important to note that these operations do not depend on specific index positions; they always describe changes at the current index position and can move the pointer position using `retain`.

A `delta` can represent the entire document or changes made to the document. Here, we describe the main class objects of `delta` and their related operational logic, especially in practical editor scenarios, major transformations, and related type declarations.

### insert
The `insert` method inserts data into the `delta`, representing the essence of `delta`. When describing the entire document content, all content should be represented as `insert`. The first parameter is the text content to insert, and the second parameter is an optional attribute object describing the text's formatting information.

```js
const delta = new Delta();
delta.insert("123").insert("567", { a: "1" });
// [{"insert":"123"},{"insert":"567","attributes":{"a":"1"}}]
```

The original `insert` parameter could be an object type `Embed` structure, expressing non-textual structures like images, videos, mentions, etc. The `AttributeMap` parameter is of type `Record<string, unknown`, describing complex attribute values.

In our streamlined design, the `insert` parameter only supports `string` type, with the specific schema defined during editor initialization and formatting information organized under `Attrs`. The `AttributeMap` has been changed to `Record<string, string>` type, simplifying complexities like `CloneDeep` and `isEqual` for complex data structures.

For instance, in `EtherPad`, `Attribute` is of type `[string, string]`, which we also utilize in our design. Under this foundational structure, we suggest flattening attribute values under the `attributes` property rather than using a single attribute value as a `key`, nesting all attribute values under `value`.

```js
export interface AttributeMap {
  [key: string]: string;
}
```

The term `delta` is typically used to describe changes. Apart from representing the entire document content, it can also describe changes made to the content. Applying changes to content requires the use of `compose`, which we will discuss further ahead.

```js
const delta1 = new Delta().insert("123");
const delta2 = new Delta().insert("456");
delta1.compose(delta2); // [{"insert":"456123"}]
```

### delete
The `delete` method describes the length of content to delete. Given that our current content is entirely textual, the original data definition included the length of `1` for embedded `Embed` structures.

```js
const delta = new Delta().insert("123");
delta.compose(new Delta().delete(1)); // [{"insert":"23"}]
```

Actually, this is quite an intriguing aspect. When we describe changes using `delete`, we cannot ascertain what specific content was removed. Therefore, in such cases, when performing `invert`, additional data is needed to construct the `insert` operation. A similar situation exists in `OT-JSON`, where the content description is directly written into `op`, allowing for `invert` operations to be conducted based solely on `op`.

```js
const delta = new Delta().insert("123");
const del = new Delta().delete(1);
const invert1 = del.invert(delta); // [{"insert":"1"}]
const delta2 = delta.compose(del); // [{"insert":"23"}]
delta2.compose(invert1); // [{"insert":"123"}]
```

### retain
The `retain` method describes the length of content to keep, in other words, this operation can be used to move a pointer.

```js
const delta = new Delta().insert("123");
delta.compose(new Delta().retain(1).insert("a")); // [{"insert":"1a23"}]
```

The `retain` operation can also be used to modify the attribute values of the content. Additionally, if you want to remove a specific attribute, simply set the `value` to `""`.

```js
const delta = new Delta().insert("123");
const d2 = new Delta().retain(1).retain(1, { "a": "1" });
const d3 = delta.compose(d2); // [{"insert":"1"},{"insert":"2","attributes":{"a":"1"}},{"insert":"3"}]
d3.compose(new Delta().retain(1).retain(1, { "a": "" })); // [{"insert":"123"}]
```

### push
The `push` method is the foundational method upon which the aforementioned `insert`, `delete`, and `retain` operations depend; its main function is to push content into the array maintained by `delta`. A critical aspect of this implementation is the merging of `op`—when attribute values are the same, they need to be merged into a single `op`.

```js
const delta = new Delta();
delta.push({ insert: "123" }).push({ insert: "456" }); // [{"insert": "123456"}]
```

Of course, not only `insert` operations are capable of merging; the same applies to `delete` and `retain` operations. This merging operation is based on the `attributes` values of `op`. If the `attributes` values differ, they are treated as distinct `op` and will not be merged automatically.

```js
const delta = new Delta();
delta.push({ delete: 1 }).push({ delete: 1 }); // [{"delete": 2}]
const delta2 = new Delta();
delta2.push({ retain: 1 }).push({ retain: 1 }); // [{"retain": 2}]
const delta3 = new Delta();
delta3.push({ retain: 1 }).push({ retain: 1, attributes: { a: "1"} }); // [{"retain": 1}, {"retain": 1, "attributes": {"a": "1"}}]
```

### slice
The `slice` method is used to extract portions of `delta`; this method slices based on the `length` property of `op`.

```js
const delta = new Delta().insert("123").insert("456", {a: "1"});
delta.slice(2, 4); // [{"insert":"3"},{"insert":"4","attributes":{"a":"1"}}]
```

### eachLine
The `eachLine` method is used to iterate through the entire `delta` line by line. Our overall data structure is linear, but the editor's DOM needs to segment content by lines, hence using `\n` to delineate lines is quite customary.

This method is crucial for initializing the editor, and once initialization is complete, our changes should be implemented based on state rather than requiring this method each time. Here, we have also modified it; the original `eachLine` method does not include the `\n` nodes.
```

```js
const delta = new Delta().insert("123\n456\n789");
delta.eachLine((line, attributes) => {
  console.log(line, attributes);
});
// [{insert:"123"},{insert:"\n"}] {}
// [{insert:"456"},{insert:"\n"}] {}
// [{insert:"789"},{insert:"\n"}] {}
```

### diff
The `diff` method is used to compare the differences between two `delta` objects. This method is actually implemented based on the `myers diff` algorithm for plain text. By converting the `delta` objects into plain text, `diff` continuously selects the shorter operation parts after diffing to achieve the difference between the `delta` objects.

In fact, in our implementation, it is entirely feasible to separate the `diff` method. The only external dependency used here is `fast-diff`. In `quill`, `diff` is necessary because it entirely relies on uncontrolled input, text input depends on the `diff` of `DOM` text to achieve the difference, whereas our input relies on semi-controlled input through the `beforeinput` event, thus not strongly reliant on `diff`.

```js
const delta1 = new Delta().insert("123");
const delta2 = new Delta().insert("126");
delta1.diff(delta2); // [{"retain":2},{"insert":"6"},{"delete":1}]
```

### chop
The `chop` method is used to trim the trailing `retain` operations. When there is a trailing `retain` without any attribute operations, it is meaningless, hence this method can be called to check and remove it.

```js
const delta = new Delta().insert("123").retain(1);
delta.chop(); // [{"insert":"123"}]
```

### compose
The `compose` method can merge two `delta` objects into one. Specifically, it applies the `delta` operations of `B` onto those of `A`, resulting in a new `delta` object. In our implementation, we have inherited the original `Delta` class and overridden the `compose` method to achieve immutability.

`compose` has numerous applications in editors, such as input events, content pasting, history operations, etc. Similar to the editor's `apply` method, it essentially applies content changes.

```js
const delta1 = new Delta().insert("123");
const delta2 = new Delta().retain(1).delete(1);
delta1.compose(delta2); // [{"insert":"13"}]
```

### invert
The `invert` method reverses the operations in a `delta`. This method is crucial in history operations as `undo` involves reversing the current operation. Additionally, in implementing operational transformations (`OT`) in `local-cs`, `invert` also plays a vital role.

It is worth noting that `delete` operations and `retain` operations do not record the original content during execution, so in `invert`, the original `delta` is needed as the data source for operations. Here, `delta` refers to the initial `delta`, not the `delta` after inversion.

```js
const delta = new Delta().insert("123");
const del = new Delta().delete(1);
const invert1 = del.invert(delta); // [{"insert":"1"}]
const delta2 = delta.compose(del); // [{"insert":"23"}]
delta2.compose(invert1); // [{"insert":"123"}]
```

### concat
The `concat` method combines two `delta` objects into a new `delta`. This operation differs from `compose` in that `compose` applies `B`'s operations to `A`, whereas `concat` appends `B`'s operations after `A`.

```js
const delta1 = new Delta().insert("123");
const delta2 = new Delta().insert("456");
delta1.compose(delta2); // [{"insert":"456123"}]
delta1.concat(delta2); // [{"insert":"123456"}]
```

### transform
The `transform` method is the foundation for implementing operational transformations (`OT`). Even without implementing collaborative editing, the history operation module in the editor will require this implementation. Suppose we have user `A[uid:1]` and user `B[uid:2]`, with user `A` having a higher priority defined by `uid`, and the current document content is `12`.

If we're talking about collaboration, the meaning of `b'=a.t(b)` is that if `a` and `b` both originate from the same `draft` branch, then `b'` assumes that `a` has already been applied. At this point, `b` needs to transform into `b'` based on `a` in order to be directly applied. We can also understand this as `transform` resolving the impact of `a` operation on `b` operation.

Now, let's say `A` inserted the character `A` after position `12`, and `B` inserted the character `B` after position `12`. If we perform collaborative operations, then both are essentially inserting a character at the same position. If we apply them directly without transformation, conflicts will arise in their data; `A`'s data would be `12BA`, while `B`'s data would be `12AB`. Therefore, transformation is needed before applying.

```js
// User A
const base = new Delta().insert("12");
const delta = new Delta().retain(2).insert("A");
let current = base.compose(delta); // 12A
// Accept Remote B
const remote = new Delta().retain(2).insert("B");
const remote2 = delta.transform(remote, true); // [{"retain":3},{"insert":"B"}] 
current = current.compose(remote2); // 12AB
```

```js
// User B
const base = new Delta().insert("12");
const delta = new Delta().retain(2).insert("B");
let current = base.compose(delta); // 12B
// Accept Remote A
const remote = new Delta().retain(2).insert("A");
const remote2 = delta.transform(remote, false); // [{"retain":2},{"insert":"A"}] 
current = current.compose(remote2); // 12AB
```

### transformPosition
The `transformPosition` method is used to convert a specified position. This method is mainly used for transforming positions like selections/cursor movements in an editor. For example, if a cursor is after position `1`, and a `delta` adds content before `1`, the cursor needs to move accordingly.

```js
const delta = new Delta().retain(5).insert("a");
delta.transformPosition(4); // 4
delta.transformPosition(5); // 6
```

### OpIterator
The `OpIterator` class defines an iterator for iterating over `op` operations in a `delta`. This iterator is heavily used in methods like `diff`, `compose`, `transform`, etc. It's important to note that when calling `next` on the iterator, it won't cross over to the next `op`, even if the provided `length` exceeds the current `op` length.

```js
const delta = new Delta()
  .insert("Hello", { bold: "true" })
  .insert(" World", { italic: "true" })
  .retain(3);
iter.next(2); // { insert: "He", attributes: { bold: "true" } }
iter.next(10); // { insert: "llo", attributes: { bold: "true" } }
```

## EtherPad
`EtherPad` is also an excellent collaborative editor with a linear internal data structure. The document structure is referred to as `ClientVars`, and data structure changes are known as `ChangeSet`. The collaborative algorithm implementation is named `EasySync`, and the documentation provides detailed insights on how to handle server-side scheduling.

`ClientVars/Changeset` is yet another JSON-based data format used to describe document content and its alterations. However, unlike `Delta`, the structure is not as straightforward in expressing content changes in JSON but mainly resides within the `AttributePool`. Text content representation is kept in a plain text structure.

### Document Description
The document content is represented using the `ClientVars` data structure, which comprises three parts: `apool` for text attribute pool, `text` for text content, and `attribs` for attribute descriptions. In the example below, we denote content like headings, bold, italics, and plain text, showcasing how each part is structured.

```js
({
  initialAttributedText: {
    text: "short description\n*Heading1\ntext\n*Heading2\nbold italic\nplain text\n\n",
    attribs: "*0|1+i*0*1*2*3+1*0|2+e*0*4*2*3+1*0|1+9*0*5+4*0+1*0*6+6*0|2+c|1+1",
  },
  apool: {
    numToAttrib: {
      "0": ["author", "a.XYe86foM7oYgmpuu"],
      "1": ["heading", "h1"],
      "2": ["insertorder", "first"],
      "3": ["lmkr", "1"],
      "4": ["heading", "h2"],
      "5": ["bold", "true"],
      "6": ["italic", "true"],
    },
    nextNum: 7,
  },
});
```

At first glance, this content may appear to be quite complex, and in reality, it is. The `apool` serves as an attribute pool where all the decorations related to the text content are stored. In particular, the `numToAttrib` property contains values in the form of `[string, string]`, while `nextNum` indicates the next index where a new entry will be placed. The `text` represents the plain text content that effectively reflects the raw text of the document at that moment. The `attribs` is a coded representation of the decorative text content, derived from the plain text in `text` and the attributes from `apool`.

Thus, `attribs` needs to be parsed separately. The `*n` notation indicates that the `n`th attribute should be applied to the text. It typically needs to be used in conjunction with the `|n` and `+n` notations, where `|n` signifies affecting `n` lines—this is specifically applicable when encountering the `\n` character—while `+n` refers to the number of characters to be extracted, akin to the `retain` operation. This not only allows for pointer movement but can also be used to hold attribute changes. It is particularly worth noting that `|m` cannot appear independently and is always expressed alongside `+n`, indicating that among those `n` characters, there are `m` line breaks, and the last applied character will definitely be `\n`.

Moreover, most of the numbers in `EasySync` are in base `36`, so notations like `+i` or `+e` are not special symbols. Instead, they are interpreted using `0-9` digits for the characters `0-9`, while `10-35` corresponds to the characters `a-z`. For example, `+i` translates to `i - a = 8 => 8 + 10 = 18`.

- `*0` indicates the extraction of the `author` attribute, while `|1+i` signifies that this attribute applies to the length of `i`, which is `18`, over the string `short description\n`, and since it contains a `\n`, it confirms the use of `|1`.
- `*0*1*2*3` suggests that the first `4` attributes are being extracted, with `+1` applying it to `1` character, namely the `*` character, which in `EasySync` denotes line attributes rather than being placed within `\n`.
- `*0` again extracts the `author` attribute, while `|2+e` indicates application over `e` characters, which is `14`, over the string `Heading1\ntext\n`; the presence of two `\n` confirms the use of `|2`.
- `*0*4*2*3` indicates the extraction of related attributes, with `+1` again applying it to `1` character, the `*` character indicating line attribute content.
- `*0|1+9` extracts the `author` attribute, applying it to `9` characters or `Heading2\n`, with the trailing `\n` confirming the use of `|1`.
- `*0*5+4` indicates extraction of bold attributes and applies to `4` characters for `bold`.
- `*0+1` extracts the `author` attribute and applies to `1` character, that being a space.
- `*0*6+6` extracts italic attributes and applies to `6` characters for `italic`.
- `*0|2+c` extracts related attributes and applies for `12` characters for `\nplain text\n`, again indicating two `\n`, thus confirming the use of `|2`.
- `|1+1` indicates the end `\n` attribute; in `EasySync`, the line-end character must be defined separately.

### Change Description
The fundamental atomic implementations for `OT` operation transformations consist of three actions: `insert`, `delete`, and `retain`. Consequently, the content description in `ChangeSet` is quite similar. However, the data change descriptions are not structured as clearly as those in a `delta`; rather, a specially designed data structure defines them.

When a document is first created or imported, it generates the initial `ClientVars`. Each subsequent modification of the document content leads to the generation of a `ChangeSet`. The aforementioned three operations correspond to three symbols: `=` denotes `retain`, `+` represents `insert`, and `-` indicates `delete`. The various combinations of these three symbols can effectively describe changes to the document's content, alongside additional definitions:

- `Z`: The first letter `MagicNumber`, which represents the sign bit.
- `:N`: The original length of the document content is `N`.
- `>N`: The final document length will be longer than the original document length by `N`.
- `<N`: The final document length will be shorter than the original document length by `N`.
- `+N`: The actual operation, indicating that `N` characters were inserted.
- `-N`: The actual operation, indicating that `N` characters were deleted.
- `=N`: The actual operation, indicating that `N` characters were retained, moving a pointer or applying an attribute.
- `|N`: Indicates it affected `N` lines; this must be used with `+/-/=N` as described above. The operation length includes `N` newline characters (`\n`), and the final operation must be a newline. If the newline at the end of the document needs to be represented, it must be indicated as `|1=1`.
- `*I`: Indicates an attribute is applied, where `I` is the index in `apool`. There can be any number of `*` operations before a `+`, `=` or `|`.
- `$`: Indicates the end symbol, marking the end of the `Operation` section.
- `char bank`: Used to store the specific character content of `insert` operations, retrieved in order when performing insert operations.

In the same example as above, if the document already contains the text `exist text\n\n` and the above content is pasted into the document, the changes in the `User ChangeSet` are described as follows:

```js
({
  changeset:
    "Z:c>1t|1=b*0|1+i*0*1*2*3+1*0|2+e*0*4*2*3+1*0|1+9*0+5*0*5+6*0|1+1*0+a$short description\n*Heading1\ntext\n*Heading2\nbold italic\nplain text",
  apool: {
    numToAttrib: {
      "0": ["author", "a.XYe86foM7oYgmpuu"],
      "1": ["heading", "h1"],
      "2": ["insertorder", "first"],
      "3": ["lmkr", "1"],
      "4": ["heading", "h2"],
      "5": ["italic", "true"],
    },
    nextNum: 6,
  },
});
```

- `Z` indicates the `MagicNumber`, or the sign bit.
- `c` indicates the original length of the document content is `12`, which is the length of `exist text\n\n`.
- `>1t` indicates the final document will be longer than the original content by `1t`, where base 36 conversion `1t` equals `64`, specifically referring to the index in `char bank`.
- `|1=b` indicates a pointer movement of length `b`, where the conversion length is `11`, and the text content is `exist text\n`, ending with the newline defined by `|1`.
- `*0|1+i` indicates taking the `0` attribute from `apool` and applying it, converting to a length of `18`, with the text content being `short description\n`, ending with the newline defined by `|1`.
- `*0*1*2*3+1` indicates extracting `4` attributes and applying them for `1`, with the text content being `*`, specifically marking the start of line attributes.
- `*0|2+e` indicates taking the `0` attribute, applying it for `e`, converting to a length of `14`, with the text content being `Heading1\ntext\n`, ending with the newline and including the two `\n` defining `|2`.
- `*0*4*2*3+1` indicates extracting `4` attributes and applying them for `1`, with the text content being `*`, the same as the start of line attributes.
- `*0|1+9` indicates taking the `0` attribute and applying it with a length of `9`, with the text content being `Heading2\n`, ending with the newline defined by `|1`.
- `*0+5` indicates taking the `0` attribute and applying it with a length of `5`, with the text content being `bold `.
- `*0*5+6` indicates extracting italic and related attributes, applying them with a length of `6`, with the text content being `italic`.
- `*0|1+1` indicates taking the `0` attribute and applying it with a length of `1`, and the newline at the end defines `|1`, with the text content being `\n`.
- `*0+a` indicates taking the `0` attribute and applying it with a length of `a`, or `10`, with the text content being `plain text`.
- `$` indicates the end symbol, and the subsequent content symbols are part of the `char bank`. The final newline usually does not need to be represented; even if indicated, it needs to be separately represented as `|1=1`.

## Slate
The `slate` data structure and the selection design are almost perfectly aligned with the `DOM` structure, and the data structure design has not been separated. Also based on a `JSON` structure, it is very similar to low-code structural design. Operation transformations are implemented directly in the core module `Transform` of `slate`, with location-related operation transformations dispersed in the `Point` and `Path` objects.

```js
[
  {
    type: "paragraph",
    children: [
      { text: "This is editable " },
      { text: "rich", bold: true },
      { text: " text." },
    ],
  },
  { type: "block-quote", children: [{ text: "A wise quote." }] },
];
```

### Operation
Similarly, the operation transformation algorithm is based on `OT`, where linear data structures require only three basic operations: `insert`, `delete`, and `retain`. In contrast, `slate` implements `9` types of atomic operations to describe changes, which include text processing, node handling, and selection transformations.

- `insert_node`: Insert a node.
- `insert_text`: Insert text.
- `merge_node`: Merge nodes.
- `move_node`: Move a node.
- `remove_node`: Remove a node.
- `remove_text`: Remove text.
- `set_node`: Set node properties.
- `set_selection`: Set the selection.
- `split_node`: Split a node.

In practice, applying these operations is straightforward, but their corresponding `invert` and `transform` functions can be quite complex. In `slate`, the operations related to `inverse` are implemented in `operation.ts`, while the position-related `transform` functions are found in `path.ts` and `point.ts`.

Typically, these operations aren't directly called within the editor; `slate` encapsulates these fundamental actions into the `Transforms` module. This module implements numerous specific operations, such as `insertNodes`, `liftNodes`, `mergeNodes`, `moveNodes`, `removeNodes`, and so on, resulting in far more than just `9` types of actions.

- `insertFragment`: Insert a fragment of nodes at a specified location.
- `insertNodes`: Insert nodes at a specified location.
- `removeNodes`: Delete nodes from a specified location in the document.
- `mergeNodes`: Merge a node with its preceding sibling.
- `splitNodes`: Split a node at a specified location within it.
- `wrapNodes`: Wrap a node with another node at a specified location within it.
- `unwrapNodes`: Unwrap a node at a specified location within it.
- `setNodes`: Set node properties at a specified location within it.
- `unsetNodes`: Remove node properties at a specified location within it.
- `liftNodes`: Lift a node one level up at a specified location within it.
- `moveNodes`: Move nodes to a specified location in the document.
- `collapse`: Collapse the selection to a caret position.
- `select`: Actively set the selection position.
- `deselect`: Clear the selection position.
- `move`: Shift the selection position.
- `setPoint`: Set the position of one side of the selection.
- `setSelection`: Define a new selection position.
- `delete`: Remove content within the selection.
- `insertText`: Insert text at the selection.
- `transform`: Execute an `op` immutably in the editor.

### OT-JSON
Similarly, `OT-JSON (json0)` implements `11` types of operations. In rich text scenarios, the `SubType` still requires extension, which naturally calls for more operations to describe changes. Thus, using a nested `JSON` data format to describe content changes is considerably more complex than linear operations.

In `slate`, the basic `op` has been wrapped on its own. If it were built on the foundation of `OT-JSON`, encapsulating `Transforms` would facilitate collaborative implementations of `OT` more effectively, as frameworks like `ShareDB` reference the definitions of `OTTypes`. Of course, achieving collaboration based on `CRDT` seems more manageable.

- `{p:[path], na:x}`: Add value `x` to the specified path `[path]`.
- `{p:[path,idx], li:obj}`: Insert object `obj` before index `idx` in list `[path]`.
- `{p:[path,idx], ld:obj}`: Remove object `obj` from index `idx` in list `[path]`.
- `{p:[path,idx], ld:before, li:after}`: Replace object `before` at index `idx` in list `[path]` with object `after`.
- `{p:[path,idx1], lm:idx2}`: Move the object at index `idx1` in list `[path]` to index `idx2`.
- `{p:[path,key], oi:obj}`: Add key `key` and object `obj` to the object at path `[path]`.
- `{p:[path,key], od:obj}`: Remove key `key` and value `obj` from the object at path `[path]`.
- `{p:[path,key], od:before, oi:after}`: Replace the object `before` at key `key` in path `[path]` with object `after`.
- `{p:[path], t:subtype, o:subtypeOp}`: Apply a subtype operation `o` of type `t` to the object at path `[path]`.
- `{p:[path,offset], si:s}`: Insert string `s` at offset `offset` of the string at path `[path]`, using a subtype internally.
- `{p:[path,offset], sd:s}`: Remove string `s` at offset `offset` of the string at path `[path]`, using a subtype internally.

## Summary
The design of data structures is crucial, especially for editors, as it directly affects the design of selection models, the `DOM` model, state management, and other modules. Here, we've discussed various data structure designs, including the linear structures of `Delta` and `Changeset`, as well as the nested structures in `Slate`. Each type of data has its own specific design considerations.

Once a data structure has been determined, we can build the different modules of the editor on top of that foundation. Next, we will start from the data model to design the representation of the selection model, and then implement the synchronization between the browser's selection and the editor's selection model. By using the selection model as the target for operations, we will enable fundamental editing operations such as insertions, deletions, and formatting.

## Daily Challenge

- <https://github.com/WindRunnerMax/EveryDay>

## References

- <https://github.com/slab/delta/blob/main/src/Delta.ts>
- <https://github.com/slab/delta/blob/main/src/AttributeMap.ts>
- <https://github.com/ether/etherpad-lite/tree/develop/doc/public/easysync>
- <https://github.com/ether/etherpad-lite/blob/develop/src/static/js/Changeset.ts>
- <https://github.com/ether/etherpad-lite/blob/develop/src/static/js/AttributePool.ts>
- <https://github.com/ianstormtaylor/slate/blob/main/packages/slate/src/interfaces/operation.ts>
- <https://github.com/ianstormtaylor/slate/blob/main/packages/slate/src/interfaces/transforms/general.ts>