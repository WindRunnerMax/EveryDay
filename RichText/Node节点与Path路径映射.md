# Node节点与Path路径映射
在之前我们聊到了`slate`中的`Decorator`装饰器实现，装饰器可以为我们方便地在编辑器渲染调度时处理`range`的渲染，这在实现搜索替换、代码高亮等场景非常有用。那么在这篇文章中，我们聊一下`Node`节点与`Path`路径映射，这里的`Node`指的是渲染的节点对象，`Path`则是节点对象在当前`JSON`中的路径，即本文的重点是如何确定渲染出的节点处于文档数据定义中的位置。

* 在线编辑: <https://windrunnermax.github.io/DocEditor>
* 开源地址: <https://github.com/WindRunnerMax/DocEditor>

<details>
<summary><strong>Slate 文档编辑器项目系列文章</strong></summary>

* [基于 Slate 构建文档编辑器](./基于slate构建文档编辑器.md)
* [Slate 文档编辑器#2-WrapNode 数据结构与操作变换](./WrapNode数据结构与操作变换.md)
* [Slate 文档编辑器#3-TS 类型扩展与节点类型检查](./TS类型扩展与节点类型检查.md)
* [Slate 文档编辑器#4-Decorator 装饰器渲染调度](./Decorator装饰器渲染调度.md)
* [Slate 文档编辑器#5-Node 节点与 Path 路径映射](./Node节点与Path路径映射.md)

</details>

## 渲染与命令
在`slate`的文档中的`03-defining-custom-elements`一节中，我们可以看到我们可以看到`slate`中的`Element`节点是可以自定义渲染的，渲染的逻辑是需要我们根据`props`的`element`对象来判断类型，如果类型是`code`的话那就要渲染我们预定义好的`CodeElement`组件，否则渲染`DefaultElement`组件，这里的`type`是我们预设的`init`数据结构值，是数据结构的形式约定。

```js
// https://docs.slatejs.org/walkthroughs/03-defining-custom-elements
const App = () => {
  const [editor] = useState(() => withReact(createEditor()))

  // Define a rendering function based on the element passed to `props`. We use
  // `useCallback` here to memoize the function for subsequent renders.
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
        // Pass in the `renderElement` function.
        renderElement={renderElement}
      />
    </Slate>
  )
}
```

那么这里的渲染自然是不会有什么问题，我们的编辑器实际上必然不仅仅是要渲染内容，执行命令来变更文档结构/内容也是非常重要的事情。那么在`05-executing-commands`中一节中，我们可以看到对于文本内容加粗与代码块的切换分别是执行了`addMark/removeMark`以及`Transforms.setNodes`的函数来执行的。

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

## 路径映射
在上述的例子中看起来并没有什么问题，似乎我们对于编辑器基础的节点渲染与变更执行都已经完备了。然而，这里我们却可能忽略一个问题，为什么我们执行命令的时候`slate`可以知道我们要操作的是哪个节点，这是个很有趣的问题。

如果将上述的例子运行起来的话，就可以发现我们直接执行上述操作非常依赖与光标的位置，这是因为在默认参数缺省的情况下就是取的选区位置来执行变更操作。这对于普通的节点渲染自然是没有问题的，但是当我们想实现比较复杂的模块或者交互时，例如表格模块与图片的异步上传等场景时，这可能并不足以让我们完成这些功能。

我们的文档编辑器当然并不是特别简单的场景，那么如果我们需要深入实现编辑器的复杂操作时，完全依赖选区来执行操作显然不够现实。例如我们希望在在代码块元素下面插入一个空行，由于选区必须要在`Text`节点上，我们不能直接操作选区到`Node`节点上，这种实现就不能直接依靠选区来完成。

此外，在单元格中得知当前处于表格的位置也不是件易事，因为此时的渲染调度是由框架来实现的，我们无法直接获取`parent`的数据对象。那么经常使用`slate`的同学都知道，无论是`RenderElementProps`还是`RenderLeafProps`在渲染的时候，除了`attributes`以及`children`等数据之外，是没有`Path`数据的传递的。

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

这个问题实际上不光在富文本编辑器中会出现，在重前端编辑的场景下都有可能会出现，例如低代码编辑器中。其共性是我们通常都会使用插件化的形式来实现编辑器，那么此时渲染的节点不是我们直接写的组件，而是由核心层与插件自行调度渲染的内容，单个定义的组件会被渲染`N`次。

那么我们如果需要操作组件的数据，就需要知道到底是要更新哪个位置的数据对象，即在渲染的组件中如何得知我此时处在数据对象的什么位置。诚然对每个渲染的对象都定义`id`是个可行的方案，但是这样就必须要迭代整个对象来查找位置，我们在这里的实现则更加高效。

那么我们对于数据操作的时候`Path`是非常重要的，在平时的交互处理中，我们使用`editor.selection`就可以满足大部分功能了。然而很多情况下单纯用`selection`来处理要操作的目标`Path`是有些捉襟见肘的。那么此时在传递的数据结构中我们可以看到与`Path`最相关的数据就是`element/text`值了，那么此时我们可以比较轻松地记起在`ReactEditor`中存在`findPath`方法，可以让我们通过`Node`来查找对应的`Path`。

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

简单压缩了代码，在这里的实现是通过两个`WeakMap`非常巧妙地让我们可以取得节点的`Path`。那么这里就需要思考一个问题，为什么我们不直接在`RenderProps`直接将`Path`传递到渲染的方法中，而是非得需要每次都得重新查找而浪费一部分性能。实际上，如果我们只是渲染文档数据，那么自然是不会有问题的，然而我们通常是需要编辑文档的，在这个时候就会出现问题。

举个例子，假设我们在`[10]`位置有一个表格，而此时我们在`[6]`位置上增添了`1`个空白行，那么此时我们的表格`Path`就应该是`[11]`了，然而由于我们实际上并没有编辑与表格相关的内容，所以我们本身也不应该刷新表格的相关内容，自然其`Props`就不会变化，此时我们如果直接取值的话，则会取到`[10]`而不是`[11]`。

那么同样的，即使我们用`WeakMap`记录`Node`与`Path`的对应关系，即使表格的`Node`实际并没有变化，我们也无法很轻松地迭代所有的节点去更新其`Path`。因此我们就可以基于这个方法，在需要的时候查找即可。那么新的问题又来了，既然前边我们提到了不会更新表格相关的内容，那么应该如何更新其`index`的值呢，在这里就是另一个巧妙的方法了，在每次由于数据变化导致渲染的时候，我们同样会向上更新其所有的父节点，这点和`immutable`的模型是一致的，那么此时我们就可以更新所有影响到的索引值了。

那么如何避免其他节点的更新呢，很明显我们可以根据`key`去控制这个行为，对于相同的节点赋予唯一的`id`即可。另外在这里可以看出，`useChildren`是定义为`Hooks`的，那么其调用次数必定不会低，而在这里每次组件`render`都会存在`findPath`调用，所以这里倒也不需要太过于担心这个方法的性能问题，因为这里的迭代次数是由我们的层级决定的，通常我们都不会有太多层级的嵌套，所以性能方面还是可控的。

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

我们也可以借助这个概念来处理表格，当我们需要实现表格节点的复杂交互时，可以发现很难确定渲染节点的`[RowIndex, ColIndex]`，即当前单元格在表格中的位置，我们需要这些信息来实现单元格选择和调整大小等功能。

使用`ReactEditor.findPath`可以使用基于`Node`获取最新的`Path`，但是当数据嵌套层级较多时，例如表格中嵌套表格，这里就有很多不必要的迭代。实际上两层就可以满足需求，但是使用`ReactEditor.findPath`会一直迭代到`Editor Node`，这在频繁触发的操作例如`Resize`中可能会导致一些性能问题。

而如果借助这个概念，我们就同样可以实现两个`WeakMap`，在最顶层节点即`Table`节点渲染时将映射关系建立好，此时就可以完全迭代`Tr + Cell`的`element`对象，在`immutable`的支持下，我们就可以得到当前单元格的索引值。当然在后期的`slate`中这两个`WeakMap`已经导出，不需要我们自行建立映射关系，只需要将其取出即可。

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

但是通过这种方式来获取`Node`与`Path`节点的映射来获取位置就没有问题了嘛，高效的查找方案使得我们在这里必须依赖渲染后才可以得知节点最新的位置，也就是说当我们更新了节点对象后，如果此时立刻调用`findPath`方法是无法得到最新的`Path`的，因为此时的渲染行为是异步的。

那么如果需要的话此时就必须要迭代整个数据对象来获取`Path`，当然我觉得这里倒是没有迭代整个对象的必要，在使用`Transforms`更改内容后，我们不应该立即获取路径值，而是等到`React`完成渲染后再进行下一步。这样我们可以按顺序执行相关操作，由于`slate`中没有额外的异步操作，我们可以轻松地在`<Editable />`的`useEffect`中确定当前渲染何时完成。

```js
export const WithContext: FC<{ editor: EditorKit }> = props => {
  const { editor, children } = props;
  const isNeedPaint = useRef(true);
  // 保证每次触发 Apply 时都会重新渲染
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

## 总结
在这里我们主要讨论了`Node`节点与`Path`路径映射，即如何确定渲染出的节点处于文档数据定义中的位置，这是`slate`中实现数据变更时的重要表达，特别是在仅使用选区无法实现的复杂操作中，并且还分析了`slate`源码来探究了相关问题的实现。那么在后面的文章中，我们延续当前提到的表格但单元格位置的查找，来聊聊表格模块的设计及交互。

## 每日一题

- <https://github.com/WindRunnerMax/EveryDay>

## 参考

- <https://docs.slatejs.org/>
- <https://github.com/WindRunnerMax/DocEditor>
- <https://github.com/ianstormtaylor/slate/blob/25be3b/>
