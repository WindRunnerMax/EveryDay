# Mapping between Node and Path
Previously, we discussed the implementation of the `Decorator` decorator in `slate`. Decorators make it convenient for us to handle the rendering of `range` while editing, which is very useful for scenarios like search and replace, and code highlighting. In this article, let's talk about mapping between `Node` and `Path`. Here, `Node` refers to the rendered node object, and `Path` is the path of the node object in the current `JSON`, so the focus of this article is how to determine the position of rendered nodes in the document data definition.

* Online Editing: [Link](https://windrunnermax.github.io/DocEditor)
* Open Source: [GitHub](https://github.com/WindRunnerMax/DocEditor)

Related articles about the `slate` document editor project:

* [Building a Document Editor with Slate](https://juejin.cn/post/7265516410490830883)
* [Slate Document Editor - WrapNode Data Structure and Operations Transformation](https://juejin.cn/spost/7385752495535603727)
* [Slate Document Editor - TypeScript Type Extension and Node Type Checking](https://juejin.cn/spost/7399453742346551332)
* [Slate Document Editor - Decorator Rendering Dispatch](https://juejin.cn/post/7433069014978592819)
* [Slate Document Editor - Node and Path Mapping]()


## Rendering and Commands
In the `03-defining-custom-elements` section of the `slate` documentation, we can see that `Element` nodes in `slate` can be custom rendered. The rendering logic requires us to determine the type based on the `element` object in `props`. If the type is `code`, then we render the pre-defined `CodeElement` component, otherwise, we render the `DefaultElement` component. Here, the `type` is a pre-set value in the `init` data structure, which is a form of data structure convention.

```js
// https://docs.slatejs.org/walkthroughs/03-defining-custom-elements
const App = () => {
  const [editor] = useState(() => withReact(createEditor()))

  // Define a rendering function based on the element passed to `props`.
  const renderElement = useCallback(props => {
    switch (props.element.type) {
      case 'code':
        return <CodeElement {...props} />
      default:
        return <DefaultElement {...props} />
    }
  }, [])

  return (
    <Slate editor={editor} initialValue={initialValue}>
      <Editable
        renderElement={renderElement}
      />
    </Slate>
  )
}
```

When it comes to rendering, everything goes smoothly. Our editor is not just about rendering content; executing commands to change the document structure/content is also crucial. In the `05-executing-commands` section, we can see that toggling between bold text and code block is achieved through the functions `addMark/removeMark` and `Transforms.setNodes`.

```js
// https://docs.slatejs.org/walkthroughs/05-executing-commands
toggleBoldMark(editor) {
  const isActive = CustomEditor.isBoldMarkActive(editor)
  if (isActive) {
    Editor.removeMark(editor, 'bold')
  } else {
    Editor.addMark(editor, 'bold', true)
  }
}

toggleCodeBlock(editor) {
  const isActive = CustomEditor.isCodeBlockActive(editor)
  Transforms.setNodes(
    editor,
    { type: isActive ? null : 'code' },
    { match: n => Editor.isBlock(editor, n) }
  )
}
```

## Path Mapping

Looking at the example above, everything seems fine. It appears that we have covered the basics of rendering and executing changes to editor nodes. However, there is a possibility that we might have overlooked a crucial issue: how does `slate` know which node we are operating on when we execute a command? This raises an interesting question. When running the example mentioned above, one can observe that our operations heavily rely on the cursor's position. This is because by default, when parameters are omitted, the operations are performed based on the selection's position. While this is not a problem for ordinary node rendering, it might not be sufficient for implementing more complex modules or interactions, such as asynchronous uploading of tables and images.

Our document editor is certainly not a simple scenario. Therefore, when we need to implement complex operations in the editor, solely relying on the selection to execute operations is evidently not practical. For instance, if we want to insert a blank line under a code block element, since the selection must be on a `Text` node, we cannot directly operate the selection on a `Node` node. This type of implementation cannot solely rely on the selection to achieve the desired result. Additionally, it is not straightforward to determine the current position within a table cell, as the rendering schedule is managed by the framework at that moment, making it impossible to directly access the parent's data object. As many `slate` users are aware, neither `RenderElementProps` nor `RenderLeafProps` pass the `Path` data during rendering, instead only providing attributes and children data.

```js
export interface RenderElementProps {
    children: any;
    element: Element;
    attributes: {
        // ...
    };
}
export interface RenderLeafProps {
    children: any;
    leaf: Text;
    text: Text;
    attributes: {
        // ...
    };
}
```

This issue is not unique to rich text editors and can arise in various front-end editing scenarios, such as low-code editors. Commonly, in such scenarios, we utilize a modular approach to implement editors. Consequently, the nodes being rendered are not components that we directly write, but instead, the content is scheduled for rendering by the core layer and plugins. If a single defined component is rendered `N` times, understanding which position of data object to update becomes crucial. While adding an `id` to each rendered object is a possible solution, this approach would require iterating through the entire object to locate the position. In this context, our implementation is more efficient.

Therefore, the `Path` data is essential for data operations. In usual interaction handling, `editor.selection` suffices for most functionalities. However, in many cases, relying solely on `selection` to determine the target `Path` for operations can be limiting. In such situations, one can notice that the most relevant data to `Path` in the data structure being passed are the `element/text` values. Consequently, one can easily recall the existence of a `findPath` method in `ReactEditor`, helping us locate the corresponding `Path` through a `Node`.

```js
// https://github.com/ianstormtaylor/slate/blob/25be3b/packages/slate-react/src/plugin/react-editor.ts#L90
findPath(editor: ReactEditor, node: Node): Path {
  const path: Path = []
  let child = node
  while (true) {
    const parent = NODE_TO_PARENT.get(child)
    if (parent == null) {
      if (Editor.isEditor(child))   return path
      else break
    }
    const i = NODE_TO_INDEX.get(child)
    if (i == null) break
    path.unshift(i)
    child = parent
  }
}
```

This code snippet succinctly demonstrates a clever use of two `WeakMap` instances to retrieve a node's `Path`. It prompts us to ponder why the `Path` is not directly passed to the rendering method within `RenderProps` and instead necessitates a repetitive search, resulting in a performance cost. In reality, rendering document data alone poses no issues. However, as we typically need to edit documents, problems arise at this juncture. For instance, consider a scenario wherein at position `[10]`, there is a table, and then at position `[6]`, a blank line is added. The `Path` of our table should logically be `[11]`, yet as we did not actually edit any content related to the table, we should not refresh the table's content. Consequently, its `Props` remain unchanged. If we were to directly fetch a value at this point, we would retrieve `[10]` instead of `[11]`.

So, similarly, even if we use `WeakMap` to record the correspondence between `Node` and `Path`, and even if the `Node` of the table hasn't actually changed, we can't easily iterate through all the nodes to update their `Path`. Therefore, we can just look up when needed based on this method. Now, a new issue arises. Since we mentioned earlier that we won't update the table-related content, how should we update its `index` value? Here comes another clever method: every time a rendering is triggered due to data changes, we will also update all its parent nodes. This is consistent with the `immutable` model, so we can update all the affected index values at this point.

How can we avoid updating other nodes? It's quite clear that we can control this behavior based on the `key`. Simply assign a unique `id` to identical nodes. Additionally, here we can see that `useChildren` is defined as a `Hooks`, so it will definitely be called multiple times. Since `findPath` is called every time a component renders, we don't need to worry too much about the performance of this method. The iteration count here is determined by our hierarchy – typically we won't have too many levels of nesting, so the performance aspect is manageable.

```js
// https://github.com/ianstormtaylor/slate/blob/25be3b/packages/slate-react/src/hooks/use-children.tsx#L90
const path = ReactEditor.findPath(editor, node)
const children = []
for (let i = 0; i < node.children.length; i++) {
  const p = path.concat(i)
  const n = node.children[i] as Descendant
  const key = ReactEditor.findKey(editor, n)
  // ...
  if (Element.isElement(n)) {
    children.push(
      <SelectedContext.Provider key={`provider-${key.id}`} value={!!sel}>
        <ElementComponent />
      </SelectedContext.Provider>
    )
  } else {
      children.push(<TextComponent />)
  }
  NODE_TO_INDEX.set(n, i)
  NODE_TO_PARENT.set(n, node)
}
```

We can also utilize this concept to handle tables. When we need to implement complex interactions for table nodes, it's challenging to determine the `[RowIndex, ColIndex]` of the rendering nodes – the current cell's position within the table. We require this information for functionalities like cell selection and resizing. Using `ReactEditor.findPath` can retrieve the latest `Path` based on the `Node`, but with nested data levels, such as nested tables within tables, there are many unnecessary iterations. In reality, just two layers are enough, but using `ReactEditor.findPath` will iterate all the way to the `Editor Node`, which may cause performance issues during frequent actions like resizing.

By leveraging this concept, we can implement two `WeakMaps` as well. When rendering at the top-level node, such as the `Table` node, we establish mapping relationships. Then, we can iterate through `Tr + Cell` elements completely. With the support of `immutable`, we can obtain the current cell's index value. In later versions of `slate`, these two `WeakMaps` have been exported, eliminating the need for us to manually establish mapping relationships. Just retrieve them when necessary.

```js
// https://github.com/ianstormtaylor/slate/pull/5657
export const Table: FC = () => {
  useMemo(() => {
    const table = context.element;
    table.children.forEach((tr, index) => {
      NODE_TO_PARENT.set(tr, table);
      NODE_TO_INDEX.set(tr, index);
      tr.children &&
        tr.children.forEach((cell, index) => {
          NODE_TO_PARENT.set(cell, tr);
          NODE_TO_INDEX.set(cell, index);
        });
    });
  }, [context.element]);
}

export const Cell: FC = () => {
  const parent = NODE_TO_PARENT.get(context.element);
  console.log(
    "RowIndex - CellIndex",
    NODE_TO_INDEX.get(parent!),
    NODE_TO_INDEX.get(context.element)
  );
}
```

However, there's no issue with obtaining the mapping between `Node` and `Path` nodes to determine their positions in this manner, efficient lookup solutions make it necessary for us to rely on rendering to know the latest position of nodes. This means that when we update a node object, calling the `findPath` method immediately will not give us the latest `Path`, as rendering behavior at that moment is asynchronous. Therefore, if needed, we must iterate through the entire data object to obtain the `Path`. However, I don't think iterating through the entire object is necessary here. After making changes using `Transforms`, we should not immediately retrieve the path value, but rather wait until `React` has finished rendering before proceeding. This allows us to execute related operations in sequence. Since there are no additional asynchronous operations in `slate`, we can easily determine when the current rendering is completed in the `useEffect` of `<Editable />`.

```js
export const WithContext: FC<{ editor: EditorKit }> = props => {
  const { editor, children } = props;
  const isNeedPaint = useRef(true);
  // Ensures that re-render occurs every time Apply is triggered
  // https://github.com/ianstormtaylor/slate/blob/25be3b/packages/slate-react/src/components/slate.tsx#L29
  useSlate();

  useEffect(() => {
    const onContentChange = () => {
      isNeedPaint.current = true;
    };
    editor.event.on(EDITOR_EVENT.CONTENT_CHANGE, onContentChange, 1);
    return () => {
      editor.event.off(EDITOR_EVENT.CONTENT_CHANGE, onContentChange);
    };
  }, [editor]);

  useEffect(() => {
    if (isNeedPaint.current) {
      Promise.resolve().then(() => {
        // https://github.com/ianstormtaylor/slate/issues/5697
        editor.event.trigger(EDITOR_EVENT.PAINT, {});
      });
    }
    isNeedPaint.current = false;
  });

  return children as JSX.Element;
};
```

## Conclusion
In this discussion, we mainly focused on mapping between `Node` nodes and `Path` paths, determining where rendered nodes are located in the document data definition, which is crucial for implementing data changes in `slate`, especially for complex operations that cannot be achieved using only selections. We also analyzed the `slate` source code to explore the implementation of related issues. In the upcoming articles, we will continue discussing the lookup of table cell positions, delving into the design and interaction of the table module.

## Daily Quiz

- <https://github.com/WindRunnerMax/EveryDay>

## References

- <https://docs.slatejs.org/>
- <https://github.com/WindRunnerMax/DocEditor>
- <https://github.com/ianstormtaylor/slate/blob/25be3b/>