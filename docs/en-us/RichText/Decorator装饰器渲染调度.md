# Decorator Rendering Dispatcher
Previously, we discussed the design of data structures based on a document editor and talked about the document editor type system implemented based on `slate`. Now, let's dive into the implementation of decorators in the `slate` editor. Decorators play a crucial role in `slate`, allowing us to easily handle the rendering of `range` during editor dispatch.

* Online Editor: <https://windrunnermax.github.io/DocEditor>
* Open Source Repository: <https://github.com/WindrunnerMax/DocEditor>

Related articles about the `slate` document editor project:

* [Building a Document Editor with Slate](https://juejin.cn/post/7265516410490830883)
* [Slate Document Editor - WrapNode Data Structure and Operation Transformation](https://juejin.cn/spost/7385752495535603727)
* [Slate Document Editor - TS Type Extension and Node Type Checking](https://juejin.cn/spost/7399453742346551332)
* [Slate Document Editor - Decorator Rendering Dispatcher]()

## Decorate
In `slate`, `decoration` is a particularly interesting feature. Imagine a scenario where we need to highlight code blocks. We can implement this in several ways: the first approach involves directly parsing the content of the code block, extracting the keyword categories, and storing them in the data structure to render the highlight information during rendering. However, this increases the size of the data structure. The second approach involves storing only the code information and parsing it into `Marks` during frontend rendering when highlighting is needed. This approach adds a bit of complexity because we may need to mark it as a non-collaborative operation and as pure client-side `Op` that does not require server storage. The third method involves using `decoration`, where `slate` essentially streamlines the second approach by rendering additional `Marks` without altering the data structure.

Of course, decorators are not limited to code block highlighting. Any content that should not be expressed in the data structure but needs to be displayed during rendering requires the use of `decoration`. A clear example is the search feature. When implementing a search function in the editor, we need to mark the found content, which can be achieved using `decoration`. Alternatively, we would have to draw virtual layers to accomplish this. Similarly, for implementing user-friendly hyperlink parsing functionality, such as automatically converting pasted links into hyperlink nodes, decorators can be leveraged.

During my recent testing of the `search-highlighting example` on the `slate` official website, the search worked well for single-node searches like `adds`. However, highlighting across multiple nodes was less effective. Details can be found at `https://github.com/ianstormtaylor/slate/pull/5670`.
This reveals some challenges when `decoration` handles cross-node processing. For instance, when searching for `123` or `12345`, the decorations are rendered correctly, but searching for `123456` with a `range` constructed as `path: [0], offset: [0-6]` results in mislabeling content because we are crossing the boundary of the `[0]` node.

By examining the related code for searching, we can see that the parent's `decorate` results are passed down for subsequent rendering. At this level, the passing `decorate` function is called to generate new `decorations`. It is crucial to note that if the parent's `decorations` and the range of the current node intersect, the content will continue to be passed down. The crux of the matter lies here. Considering our scenario with the content mentioned earlier as an example, if we want to find the index of `123456` at this point, just searching within the `text: 12345` node is insufficient. We must concatenate the content of all text nodes in the higher array and then search to accurately locate the index position.

```js
// https://github.com/ianstormtaylor/slate/blob/25be3b/packages/slate-react/src/hooks/use-children.tsx#L21
const useChildren = (props: {
  decorations: Range[]
  // ...
}) => {
  // ...

  for (let i = 0; i < node.children.length; i++) {
    // ...
    const ds = decorate([n, p])
    for (const dec of decorations) {
      const d = Range.intersection(dec, range)
      if (d) {
        ds.push(d)
      }
    }
    // ...
  }
  // ...
}
```

At this point, it is clear that we need to specify that the node we invoke `decorate` on is the parent element. When the parent node is passed to the `text` node we need to process, we use `Range.intersection` to determine if there is an intersection. The strategy for determining the intersection is actually simple. We have provided two examples below, one where there is an intersection and another where there isn't. Essentially, we only need to check the final state of the two nodes.

```js
// https://github.com/ianstormtaylor/slate/blob/25be3b/packages/slate/src/interfaces/range.ts#L118

// start1          end1          start2          end2
// end1          start2
// end1 < start2 ===> No intersection

// start1          start2          end1          end2
// start2          end1
// start2 < end1 ===> Intersection [start2, end1]
```

So, can we solve this problem by modifying the logic part of `Range.intersection` in the `decorate` code? Specifically, when the content we find exceeds the original `range`, we should trim the part that needs to be decorated and discard the rest. In fact, this logic was found to be correct during our analysis earlier, that is, when we search for `'123456'`, we are able to fully display the portion `'12345'`. Based on the earlier analysis, in this current iteration, our nodes are all at `path: [0]`. This part of the code will trim the part of the code from `start: 0` to `end: 5` of the `range` and render it.

However, continuing to find the part `'6'` within the next `text range` is not as simple because in the previous search, the actual `range` was `path: [0], offset: [0-6]`, while the basic `range` of the second `text` was `path: [1], offset: [0-5]`. Based on these conditions, we find that there is no intersection. Therefore, if we need to handle this here, we would need to obtain the previous `range`, or even traverse back through many nodes in the case of spanning multiple nodes. When there are many `decorations`, we would need to check all the nodes because at this point, we do not know if the previous node has exceeded the length of the node itself. In such cases, the computational load here might be relatively high, potentially leading to performance issues.

Hence, it is better to start by constructing the `range` during parsing. When crossing nodes, we need to split the content we find into multiple `ranges`, and then insert marks for each `range`. Referring to the data above, the search result now consists of two parts: `path: [0], offset: [0, 5]` and `path: [1], offset: [0, 1]`. In this scenario, we can handle intersections properly when using `Range.intersection`. At this point, our `path` is fully aligned, and even if the content completely spans, that is, when the search content crosses more than one node, we can still handle it using this method.

In addition, when using decorators in scheduling, it is important to pay attention to the value of the `RenderLeafProps` parameter in the `renderLeaf` function, as there are two types of text content here, namely `leaf: Text;` and `text: Text;` which are fundamental `TextInterface` types. When we render content using `renderLeaf`, such as highlighting the rendering of the `mark` node within a code block, we actually need to base the rendering on the `leaf` rather than the `text`. For example, when rendering `mark` and `bold` styles overlap, both of these nodes need to be based on the `leaf`.

The reason for this is that `decorations` in Slate are split into multiple `leaves` based on the `text` node, and then these `leaves` are passed to `renderLeaf` for rendering. So in essence, the `text` attribute is the original value, while the `leaf` attribute is a more granular node. When scheduling `renderLeaf`, it is also rendered based on the granularity of `leaf`. Of course, when not using decorators, the node types of these two attributes are equivalent.

```js
// https://github.com/ianstormtaylor/slate/blob/25be3b/packages/slate-react/src/components/text.tsx#L39
const leaves = SlateText.decorations(text, decorations)
const key = ReactEditor.findKey(editor, text)
const children = []

for (let i = 0; i < leaves.length; i++) {
  const leaf = leaves[i]

  children.push(
    <Leaf
    isLast={isLast && i === leaves.length - 1}
    key={`${key.id}-${i}`}
    renderPlaceholder={renderPlaceholder}
    leaf={leaf}
    text={text}
    parent={parent}
    renderLeaf={renderLeaf}
    />
  )
}
```

## Summary
Here we mainly discussed the implementation of the `decoration` decorator in Slate, as well as the potential issues that may arise in practical use. Particularly in cases involving multiple nodes, we need to split the `range` into multiple `ranges` and process them separately. We also analyzed the source code to delve into the implementation of related issues. In the upcoming articles, we will primarily delve into discussing how `Path` is expressed in `slate` and how to correctly maintain `Path` paths and `Element` content rendering in `React`.

## Daily Quiz

- <https://github.com/WindRunnerMax/EveryDay>

## References

- <https://docs.slatejs.org/>
- <https://github.com/WindRunnerMax/DocEditor>
- <https://github.com/ianstormtaylor/slate/blob/25be3b/>