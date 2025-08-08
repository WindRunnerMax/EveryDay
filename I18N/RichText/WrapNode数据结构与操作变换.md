# WrapNode Data Structure and Transformation Operations

Previously, we discussed some basic concepts of the `slate` rich text engine and explored the plugin capabilities design, type extensions, specific solutions, etc., for building a document editor based on `slate`. Now, let's focus more on the details of the document editor and delve deeper into the design of its capabilities.

- Online Editing: [DocEditor](https://windrunnermax.github.io/DocEditor)
- Open Source Repository: [GitHub - WindrunnerMax/DocEditor](https://github.com/WindrunnerMax/DocEditor)

Related articles on the `slate` document editor project:

* [Building a Document Editor with Slate](./基于slate构建文档编辑器.md)
* [Slate Document Editor - WrapNode Data Structure and Operation Transformation](./WrapNode数据结构与操作变换.md)
* [Slate Document Editor - TS Type Extension and Node Type Checking](./TS类型扩展与节点类型检查.md)
* [Slate Document Editor - Decorator Rendering Dispatcher](./Decorator装饰器渲染调度.md)
* [Slate Document Editor - Node and Path Mapping](./Node节点与Path路径映射.md)

## Normalize

Normalizing data structures in `slate` can be quite challenging, especially when dealing with nested structures, such as the `Quote` and `List` in this project. When normalizing data structures, there are multiple approaches, as illustrated by these two sets of data structures. Dealing with nested structures poses efficiency challenges in terms of operations like addition, deletion, and modification. In the absence of best practice guidelines, it requires continuous trial and error.

The initial approach involves reusing the current block structures, where the `Quote Key` and `List Key` are at the same level. This simplifies content searching and handling due to fewer levels of nesting relationships. However, mismatched `Pair` and `Wrap` relationships can arise when `Quote` and `List` do not align completely, making normalization unpredictable.

```js
{
    "quote-wrap": true,
    "list-wrap": true,
    children: [
        { "quote-pair": true, "list-pair": 1, children: [/* ... */] },
        { "quote-pair": true, "list-pair": 2, children: [/* ... */] },
        { "quote-pair": true, children: [/* ... */] },
        { "quote-pair": true, "list-pair": 1, children: [/* ... */] },
        { "quote-pair": true, "list-pair": 2, children: [/* ... */] },
    ]
}
```

Alternatively, by not overly controlling the content and relying on default behaviors in `slate`, the data structure representation becomes more predictable. With this approach, normalization becomes less problematic, and since it aligns with default behavior, there's less need to focus on data handling operations. However, handling such structured data can be cumbersome, especially when maintaining corresponding relationships, requiring recursive processing of all child nodes. This becomes complex with multiple levels of nesting, and further complicates when supporting structures like tables.

```js
{
    "quote-wrap": true,
    children: [
        {
            "list-wrap": true,
            children: [
                { "quote-pair": true, "list-pair": 1, children: [/* ... */] },
                { "quote-pair": true, "list-pair": 2, children: [/* ... */] },
            ]
        },
        { "quote-pair": true,  children: [/* ... */] },
        { "quote-pair": true,  children: [/* ... */] },
    ]
}
```

However, this data structure is not without flaws. The major issue is the significant gap between `wrap` and `pair`, leading to numerous boundary issues. For instance, in a scenario with outermost quote block nesting a table within, and the table containing a highlighted block, which further nests a quote block, the depth required for `wrap` to match `pair` becomes extensive. This significantly impacts normalization, necessitating deep DFS processing, consuming performance for traversal and risking potential issues if not handled properly.

So, in this situation, we can simplify nested levels as much as possible, meaning we need to avoid spacing issues with '`wrap - pair`'. It's quite clear that we strictly require all `children` of 'wrap' to be 'pair'. In this scenario, normalizing becomes much simpler; we just need to iterate through the child nodes of 'wrap' and check the parent node in the 'pair' case. Of course, this solution isn't flawless. It demands a higher level of precision in our data operations because here, we don't follow default behaviors. Everything needs to be controlled manually, especially defining all nesting relationships and boundaries strictly. This places a greater demand on the design of the editor behavior.

```js
{
    "quote-wrap": true,
    children: [
        {
            "list-wrap": true,
            "quote-pair": true,
            children: [
                { "list-pair": 1, children: [/* ... */] },
                { "list-pair": 2, children: [/* ... */] },
                { "list-pair": 3, children: [/* ... */] },
            ]
        },
        { "quote-pair": true, children: [/* ... */] },
        { "quote-pair": true, children: [/* ... */] },
        { "quote-pair": true, children: [/* ... */] },
    ]
}
```

So, why does the data structure become more complex? Using the above structure as an example, if we remove the nesting structure of the 'list-pair: 2' node from the 'list-wrap', we need to transform the node like the following type. The structural difference here is quite significant. Apart from splitting the 'list-wrap' into two parts, we also need to update the ordered list index values of other 'list-pair', which involves multiple operations. Therefore, aiming for a more generic 'Schema' requires more design and standardization.

One easily overlooked point here is that we need to add `"quote-pair": true` to the original 'list-pair: 2' node because at this point, the line becomes a child element of 'quote-wrap'. In summary, we need to replicate the properties originally in 'list-wrap' to 'list-pair: 2' to maintain the correct nesting structure. Why proactive duplication rather than passive addition via `normalize`? The reason is simple; if it were 'quote-pair', it could be done easily by setting it to `true` directly. However, if it's 'list-pair', we wouldn't know what the data structure of this value should be like, thus leaving this implementation to be handled by the plugin's `normalize`.

```js
{
    "quote-wrap": true,
    children: [
        {
            "list-wrap": true,
            "quote-pair": true,
            children: [
                { "list-pair": 1, children: [/* ... */] },
            ]
        },
        { "quote-pair": true,  children: [/* ... */] },
        {
            "list-wrap": true,
            "quote-pair": true,
            children: [
                { "list-pair": 1, children: [/* ... */] },
            ]
        },
        { "quote-pair": true,  children: [/* ... */] },
        { "quote-pair": true,  children: [/* ... */] },
        { "quote-pair": true,  children: [/* ... */] },
    ]
}
```

## Transformers
As mentioned earlier, there are default behaviors in nested data structures. Previously, as I consistently followed default behaviors, I didn't encounter many data processing issues. However, upon altering the data structure, it became apparent that controlling data structures isn't always straightforward. When handling `SetBlock` previously, I typically matched node types with the `match` parameter since, under default behaviors, this handling usually proceeded without issues.

However, during the process of changing the data structure, issues arose when handling `Normalize`. The behavior of matching block elements did not align with expectations, causing the data processing to malfunction persistently, resulting in the inability to complete `Normalize` until an exception was thrown. The main problem here was the inconsistency between the iteration order and what I expected. For example, when executing `[...Editor.nodes(editor, {at: [9, 1, 0] })]` on the `DEMO` page, the returned result starts from the top `Editor` down to the bottom `Node`, including all `Leaf` nodes within the range, which is equivalent to a `Range`.

```
[]          Editor
[9]         Wrap
[9, 1]      List
[9, 1, 9]   Line
[9, 1, 0]   Text
```

In reality, under these circumstances, there would have been no issue if I had stuck to the original `Path.equals(path, at)`. I had relied too much on its default behavior, resulting in poor control over the accuracy of the data. Our data processing should be predictable, not reliant on default behaviors. Moreover, the documentation for `slate` is too concise, lacking many details. In such cases, one must resort to reading the source code to gain a better understanding of data processing. For example, by delving into the source code, I learned that every operation retrieves all elements that meet the conditions in the `Range` for matching, possibly triggering multiple `Op` dispatches within a single call.

Additionally, since this handling mainly focused on supporting nested elements, I discovered features related to `unwrapNodes` or similar data processing. When calling `unwrapNodes`, with only different values passed into `at`, namely `A-[3, 1, 0]` and `B-[3, 1, 0, 0]`, a key point is that although we strictly match `[3, 1, 0]`, the results of the calls differ. In `A`, all elements of `[3, 1, 0]` are unwrapped, while in `B`, only `[3, 1, 0, 0]` is unwrapped. We can ensure that the `match` results are completely consistent, so the issue lies in the `at` values. If one does not understand the data operation model of `slate`, a dive into the source code is unavoidable. While examining the source code, one can discover that `Range.intersection` helps narrow down the scope, hence the value of `at` impacts the final result.

```js
unwrapNodes(editor, { match: (_, p) => Path.equals(p, [3, 1, 0]), at: [3, 1, 0] }); // A
unwrapNodes(editor, { match: (_, p) => Path.equals(p, [3, 1, 0]), at: [3, 1, 0, 0] }); // B
```

This issue signifies that all our data should not be handled casually. We must be very clear about the data and its structure we intend to operate on. Another issue mentioned earlier is the complexity in dealing with situations involving deep nesting, which ultimately involves an editing boundary scenario, complicating data maintenance. For example, if we have a table nested with many `Cell`s, handling multiple instances of the `Cell` structure separately ensures that any data processed after filtering out the `Editor` instances will not affect the other `Editor` instances. However, if the structure is represented in JSON nested form, there is a risk of crossing operation boundaries and affecting other data, especially the parent data structures. Therefore, we must pay attention to handling boundary conditions, precisely defining the data structures to be operated on and delineating the operational nodes and ranges.

```js
{
    children: [
        {
            BLOCK_EDGE: true, // Block structure edges
            children: [
                { children: [/* ... */] },
                { children: [/* ... */] },
            ]
        },
        { children: [/* ... */] },
        { children: [/* ... */] },
    ]
}
```

Furthermore, debugging code in an existing online page can be a challenge, especially when the `editor` is not exposed to the `window`. Obtaining the editor instance directly would require replicating the online environment locally. In such cases, one can capitalize on `React` writing the `Fiber` directly to the DOM nodes, allowing access to the `Editor` instance through the DOM node. However, the native `slate` employs numerous `WeakMap`s to store data, posing a challenge without direct references to such objects or instances in the `editor`. Unless the `editor` actually references such objects or has its instance, one may have to set breakpoints for debugging and temporarily store objects as global variables during the debugging process.

```js
const el = document.querySelector(`[data-slate-editor="true"]`);
const key = Object.keys(el).find(it => it.startsWith("__react"));
const editor = el[key].child.memoizedProps.node;
```


## Final Notes
Here we discussed the `WrapNode` data structure and transformation operations, focusing mainly on the content relevant to nested data structures. In reality, node types can be further classified into various categories. In a broader sense, we have `BlockNode`, `TextBlockNode`, `TextNode`. Within `BlockNode`, we can distinguish `BaseNode`, `WrapNode`, `PairNode`, `InlineBlockNode`, `VoidNode`, `InstanceNode`, and so on. Therefore, the content described in this document remains quite basic. In addition to that, in `slate`, there are numerous additional concepts and operations to pay attention to, such as `Range`, `Operation`, `Editor`, `Element`, `Path`, among others. In the upcoming articles, our focus will mainly be on the representation of `Path` in `slate` and how one can control and maintain the expression of its content in `React`, along with ensuring the correct rendering of `Path` paths and `Element` content.

## Daily Question

- <https://github.com/WindRunnerMax/EveryDay>

## References

- <https://docs.slatejs.org/>
- <https://github.com/ianstormtaylor/slate>
- <https://github.com/WindRunnerMax/DocEditor>