# React可编辑节点的组件预设
先前我们实现了内容更新时性能的优化，考虑了最小化`Op`操作`DOM`变更、`key`值的维护、以及在`React`中实现增量渲染的方式。那么接下来我们需要讨论的是编辑节点的组件预设，例如零宽字符、`Embed`节点、`Void`节点等，为编辑器的插件扩展提供预设默认行为的组件。

- 开源地址: <https://github.com/WindRunnerMax/BlockKit>
- 在线编辑: <https://windrunnermax.github.io/BlockKit/>
- 项目笔记: <https://github.com/WindRunnerMax/BlockKit/blob/master/NOTE.md>

<details>
<summary><strong>从零实现富文本编辑器系列文章</strong></summary>

- [深感一无所长，准备试着从零开始写个富文本编辑器](./从零设计实现富文本编辑器.md)
- [从零实现富文本编辑器#2-基于MVC模式的编辑器架构设计](./基于MVC模式的编辑器架构设计.md)
- [从零实现富文本编辑器#3-基于Delta的线性数据结构模型](./基于Delta的线性数据结构模型.md)
- [从零实现富文本编辑器#4-浏览器选区模型的核心交互策略](./浏览器选区模型的核心交互策略.md)
- [从零实现富文本编辑器#5-编辑器选区模型的状态结构表达](./编辑器选区模型的状态结构表达.md)
- [从零实现富文本编辑器#6-浏览器选区与编辑器选区模型同步](./浏览器选区与编辑器选区模型同步.md)
- [从零实现富文本编辑器#7-基于组合事件的半受控输入模式](./基于组合事件的半受控输入模式.md)
- [从零实现富文本编辑器#8-浏览器输入模式的非受控DOM行为](./浏览器输入模式的非受控DOM行为.md)
- [从零实现富文本编辑器#9-编辑器文本结构变更的受控处理](./编辑器文本结构变更的受控处理.md)
- [从零实现富文本编辑器#10-React视图层适配器的模式扩展](./React视图层适配器的模式扩展.md)
- [从零实现富文本编辑器#11-Immutable状态维护与增量渲染](./Immutable状态维护与增量渲染.md)
- [从零实现富文本编辑器#12-React可编辑节点的组件预设](./React可编辑节点的组件预设.md)
- [从零实现富文本编辑器#13-React非编辑节点的内容渲染](./React非编辑节点的内容渲染.md)
- [从零实现富文本编辑器#14-编辑器历史变更管理与状态回溯](./编辑器历史变更管理与状态回溯.md)

</details>

## 概述
富文本编辑器之所以被称为富文本，除了其能够支持文本的格式化之外，还能够支持插入图片、视频、`Mention`等内容。而最开始我们就提到了，实现受控的编辑器是需要严格设计`DOM`结构的，以便于能够正确查找和操作这些节点，因此支持这些节点仍然需要需要预设`DOM`结构。

然而诸如图片等节点是需要交由开发者自定义实现的，因此这里的`DOM`结构在编辑器框架层面上是完全不可控的，因此我们需要约定好针对不同类型的组件嵌套不同的`HOC`组件，以此来处理默认的`DOM`结构以及行为。例如下面这个组件就固定了最外层的结构，开发者只需要使用即可。

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

此外还有非文本节点选区问题，通常情况下选区都是在文本节点上的，也就是说通过`Selection`对象取得的节点是`text`类型节点。然而在某些情况下，会存在非文本节点的选区，例如在三击文本行的时候，会出现整行的选区，此时会出现`anchor`节点是行首`text`节点，而`focus`节点是下一行的行节点。

```js
{
  anchorNode: text,
  anchorOffset: 0,
  focusNode: div, // <div data-node="true">...</div>
  focusOffset: 0,
}
```

类似这种情况就需要进行校正，将选区校正到文本类型节点上。特别需要注意此时的`focus`节点是下一行的节点，因此我们需要校正的目标是下一行行首文本节点`offset: 0`的位置，因此这样的`Model`选区就可以对应为选区两行的`0 offset`位置，同时需要同步到`DOM`选区上。

编辑器实现的查找逻辑基本上参考了`slate`的实现，大概目标是尝试找到可编辑子节点，首先会调用`getEditableChildAndIndex`查找一级子节点，相当于先查找一级来判断后续迭代方向。之后继续查找，这里是采取的`DFS`搜索形式，查找每一级都会尝试找到可编辑节点。

这里有必要提一下，其实在上一篇文章中处理完增量变更之后，接下来需要考虑输入内容时避免预设`DOM`的结构被破坏的问题，包括本文预设的组件也需要处，主要涉及脏`DOM`检查、选区更新、渲染`Hook`等。但这部分内容在`#8`和`#9`的输入法处理中已经有了详细的讨论，因此这里就不再次展开了。

## 零宽字符
零宽字符顾名思义是没有宽度的字符，因此就很容易推断出这些字符在视觉上是不显示的。因此这些字符就可以作为不可见的占位内容，实现特殊的效果。例如可以实现信息隐藏，以此来实现水印的功能，以及加密的信息分享等等，某些小说站点会通过这种方式以及字形替换来追溯盗版。

### 文本选区模式
这个零宽字符在视觉上是不显示的，因为其是零宽度，但是在编辑器中，这个字符却是很重要的。简单来说，我们需要这个字符来放置光标，以及做额外的显示效果。需要注意的是我们在这里指的是`ContentEditable`实现的编辑器，如果是自绘选区的编辑器则不一定需要这部分设计。

其实这个也与编辑器的设计强关联，假设我们引入块级结构，也就是将这些图片等节点的选中效果自行实现，而非依赖浏览器文本选区模型的话，理论上是不需要零宽字符的。例如飞书文档的图片块结构就没有内嵌的零宽字符，可以对比我们的实现携带零宽字符选区效果。

```html
<!-- 飞书文档 -->
<div class="image-block-width-wrapper flash-block-content">
  <div class="resizable-wrapper" contenteditable="false">
    <img />
  <div>
</div>

<!-- 携带零宽字符选区 -->
<span data-leaf="true">
  <span data-zero-space="true" data-zero-void="true">&ZeroWidthSpace;</span>
  <div class="block-kit-image-container" contenteditable="false" data-void="true">
    <img />
  </div>
</span>
```

然而实际情况也并没有那么理想，还是以飞书文档举例，即使自行实现了块级的选区，但仍然会免不了混合选区的情况。也就是说在浏览器中可以同时选中图片和文本，这种情况下不能阻止用户混选，因此还是得依靠零宽字符来作为选区落点，飞书文档是在块级节点上下分别放了零宽字符。

```js
<div class="block docx-image-block" data-block-type="image" data-block-id="65">
  <div class="docx-block-zero-space"><span data-zero-space="true">&ZeroWidthSpace;</span></div>
  <div contenteditable="false"><img /></div>
  <div class="docx-block-zero-space"><span data-zero-space="true">&ZeroWidthSpace;</span></div>
</div>
```

回到我们编辑器的设计上，这里我们只需要提供一个公共组件，以此来提供给`Void`节点和`Embed`节点使用。当然在实现的时候我们需要标注相关类型，以判断对应的样式，例如`Void`类型的零宽字符不能出现光标，而`Embed`类型的零宽字符可以需要保持光标。

```js
/**
 * 零宽字符组件
 * - void hide => 独占一行的空节点, 例如 Image
 * - embed => 嵌入节点, 例如 Mention
 * - enter => 行末尾占位, 保留于 EOLView
 * - len => 空节点占位长度, 配合 Void/Embed
 * @param props
 */
export const ZeroSpace: FC<ZeroSpaceProps> = props => {
  return <span>{ZERO_SYMBOL}</span>
}
```

### 输入法处理
通常实现`Void/Embed`节点时，我们都需要在`Void`节点中实现一个零宽字符，用来处理选区的映射问题。通常我们都需要隐藏其本身显示的位置以隐藏光标，然而在特定条件下这里会存在吞`IME`输入的问题，下面这个例子中在`!`前是无法正常唤醒`IME`输入多个字符的。

```html
<div contenteditable="true"><span contenteditable="false" style="background:#eee;">Void<span style="height: 0px; color: transparent; position: absolute;">&#xFEFF;</span></span><span>!</span></div>
```

处理这个问题的方式比较简单，我们只需要将零宽字符的标识放在`EmbedNode`之前即可，这样也不会影响到选区的查找，`https://github.com/ianstormtaylor/slate/pull/5685`。此外飞书文档的实现方式也是这样的，`ZeroNode`永远在`FakeNode`前。

```html
<div contenteditable="true"><span contenteditable="false" style="background:#eee;"><span style="height: 0px; color: transparent; position: absolute;">&#xFEFF;</span>Void</span><span>!</span></div>
```

### 行末零宽字符
前边已经明确使用零宽字符的主要目的是为了放置光标，而目前我们的视图渲染是完全对等于数据结构的。也就是说我们的行末必然存在一个零宽字符，用来对等数据结构中末尾的`\n`对应的`Leaf`节点，实现这个节点的目的主要有几个方面:

1. 完全对等数据结构，与我们设计的`LineState`数据对齐，每个`LeafState`都必然渲染一个`DOM`节点，数据模型友好，且这样就可以在空行时必然会留存有文本节点，而不必要特殊处理。
2. `Mention`节点的渲染，如果行的最后一个节点是`Void`节点，则会导致光标无法放置于末尾，这个问题的处理我们则按需渲染一个零宽字符节点即可，`slate`即如此处理的末尾`Mention`节点。
3. 在研究飞书文档的编辑器时发现每个文本行末尾必然会存在零宽字符，预计是为了解决`Blocks`的相关问题，后期还得知早期的`Etherpad`每行也是实现了零宽字符，用来处理`DOM`与选区的相关问题。

在这里我们实现了太多的兼容方案来处理这个问题，例如之前文章的选区校正部分以及后面的`Void`选区变换部分内容，而如果实际上我们不渲染这个节点的话就不需要处理这两处相关问题，但是这样的话我们就需要处理其他的`case`来保证`DOM`与`Model`的对等性。

现在我们需要解决空行的选区问题，此时如果直接使用空节点即`<span></span>`设置为子节点的话，则会导致此时并没有实际的文本内容。由此这里的高度并没有撑起来并且选区是无法聚焦到此处的，所以这里我们还是需要空节点的内容为零宽字符，这样的话才可以实现选区的聚焦。

```js
const nodes: JSX.Element[] = [];
leaves.forEach((leaf, index) => {
  if (leaf.eol) {
    // 空行则仅存在一个 Leaf, 此时需要渲染空的占位节点
    !index && nodes.push(<EOLModel key={EOL} editor={editor} leafState={leaf} />);
    return void 0;
  }
  nodes.push(<LeafModel key={index} editor={editor} index={index} leafState={leaf} />);
});
return nodes;
```

实际上末尾的节点如果是`<br />`节点的话，是可以不需要零宽字符来解决这个问题的。选区节点是可以放置于此节点上的，且不会有`0/1`两个`offset`的偏移需要处理。`Quill`对于空行就是如此处理的，这其实也是富文本编辑器的常见实现。

不过对于我们来说，因为`br`节点并非文本，且仅存在`0 offset`，这就导致了选区在`Void`节点时依赖默认行为无法正常删除当前节点，还需要特殊处理非文本节点。此外需要处理方向键的回调来控制光标，还有`issue`提到`br`节点还可能存在卡断`IME`的情况，所以当前还是保持了零宽字符实现。

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

行末的零宽字符还有个比较重要的应用，如果我们的选区操作是从上一行的末尾选到下一行的部分内容时，通过`Selection`得到的选区变换的`Model`是跨越两行的。此时如果做一些操作例如`TAB`缩进的话，是会对多行应用的操作，然而我们的淡蓝色选区看起来只有一行，因此看起来会像是个`BUG`，主要还是视觉上与实际操作上的不一致。

在腾讯文档、谷歌文档等类似的`Canvas`实现的编辑器中，这个问题是通过额外绘制了淡蓝色的选区来解决的。而我们如果通过`DOM`来实现的话，则不能直接绘制内容，这样我们就可以使用零宽字符来实现，即在行末添加一个零宽字符节点，这其中实现的重点是。而当我们选区在零宽字符后时，主动将其修正为零宽字符前，这个实现在`Chrome`上表现良好，但是在`FireFox`上就没有效果了。

```html
<div contenteditable="true">
  <div><span>末尾零宽字符 Line 1</span><span>&#8203;</span></div>
  <div><span>末尾零宽字符 Line 2</span><span>&#8203;</span></div>
  <div><span>末尾纯文本 Line 1</span></div>
  <div><span>末尾纯文本 Line 2</span></div>
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

## Void 节点组件
`Void`节点即我们常说的空节点，空节点内部应该完全由用户自定义，内部即使存在文本内容也会被编辑器作为整体块来处理。因此除了`schema`中定义之外，还需要实现`HOC`组件来提供给开发者调用，组件整体还是非常清晰的，但是需要实现选区、点击等事件的处理。

```js
/**
 * 空嵌入节点 HOC
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

### 选区查找
上边我们提到了，该组件内部结构是完全由用户自定义的，而编辑器引擎本身并不知道这里会存在什么内容，因此我们就需要在选区变换时实现一个查找逻辑。这个实现其实还是非常困扰的，因为从上至下只有通过迭代的形式才能查找，`slate`就是以层级迭代的形式实现的，我们同样如此。

下面`getEditableChildAndIndex`就是查找子节点的实现，同一级开始分别尝试正向和反向查找，以传入的`direction`方向优先，以此来尝试找到可编辑节点。这只是同一级的查找，如果没有查找到的话，还需要继续查找父节点的子节点，这里也是基于层级而非递归的实现。

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

这里还有需要关注的是，如果能够直接找到文本节点自然不需要继续深度查找，在`HTML`中文本节点并不属于`DOMElement`。此外，由于已经确定了当前是非文本节点，因此我们此时的`offset`值只会是`0`或者子节点长度偏移。

```js
// Determine the new offset inside the text node.
offset = isLast && node.textContent != null ? node.textContent.length : 0
```

### 默认行为
本质上富文本编辑器是图文混排的编辑器，在通过`Void`来实现图片的时候，可以发现如果点击图片节点并不能触发`DOM`选区的变化。而由于`DOM`选区本身不变化则会导致我们的`Model`选区不会跟随变动，因此诸如焦点和选择等问题就会出现。

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

在`Slate`中的实现是当触发`OnClick`事件时，会主动调用`ReactEditor.toSlateNode`方法查找`data-slate-node`对应的`DOM`节点，然后通过`ELEMENT_TO_NODE`查找对应的`Slate Node`节点，最后再通过`ReactEditor.findPath`来获取其对应的`Path`节点。如果此时两个基点都是`Void`则会创建`range`，然后最终设置最新的`DOM`。

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

由于我们的设计是通过`Void`节点作为高阶组件来实现，因此在这里可以直接借助`onMouseDown`事件来实现选区的设置即可。而在这里的选区又出现了问题，此处的节点状态是` \n`，此处实际上会被分为三个位置，而我们实际上的`Void`只应该在第二个位置，而这个位置实际上也应该被认为是行首，因为在按键盘左右键的时候也需要用到。

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

// Case 2: 光标位于 data-zero-void 节点前时, 需要将其修正为节点末
// [cursor][void]\n => [void][cursor]\n
const isVoidZero = isVoidZeroNode(node);
if (isVoidZero && offset === 0) {
  return new Point(lineIndex, 1);
}
```

在编辑器场景中，节点的选中状态是非常常见的功能，例如在当点击图片节点时，通常需要为图片节点添加选中状态。当前我思考了两种实现方式，分别是使用`React Context`和内建的事件管理来实现，`Context`是在最外层维护选区的`useState`状态，而内建事件管理则是监听编辑器内部的选区事件来处理回调。

`Slate`是使用`Context`来实现的，在每个`ElementComponent`节点的外层都会有`SelectedContext`来管理选中状态，当选区状态变化时则会重新执行`render`函数。这样的方式实现起来方便，只需要预设`Hooks`就可以直接在渲染后的组件中获取到选中状态，但是这样的方式需要在最外层将`selection`状态传递到子组件当中。

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

在这里我们使用的方式则是管理编辑器事件来管理选区，因为在我们的插件里是实例化后调用方法来完成视图渲染的调度。那么在这里我们就实现继承于`EditorPlugin`的类以及选区高阶组件，在实例中监听编辑器的选区变化，用以触发高阶组件的状态变化，而高阶组件的选择状态则可以直接根据`leaf`的位置与当前选区的位置来判断。

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

接下来需要处理`Void`选区移动问题，当选区在`Void`上时，选区会移动到回车零宽字符的末尾，而由于我们的选区校正会将其又校正回`Void`节点的零宽字符后，这就导致了光标无法移动的问题。因此这里需要主动控制选区的移动，在`Void`节点上绑定键盘事件，按上下方向键时受控处理。

```js
// case KEY_CODE.DOWN:
const point = new Point(nextLine.index, nextLine.length - 1);
editor.selection.set(new Range(point, point.clone()), true);
// case KEY_CODE.UP:
const point = new Point(prevLine.index, prevLine.length - 1);
editor.selection.set(new Range(point, point.clone()), true);
```

### 输入法处理
接下来我们处理输入法问题，如果光标此时在`Void`节点时，此时按下任何输入键则会导致节点内容变成`inline-block`的形式，这里的问题是`BlockVoid`节点应该是独占一行的，而输入内容之后，则实际的状态变成了如下内容。

```
[Zero][input]\n
```

因此在这里最简单的方案则是此时如果光标在`Void`节点时按下输入键则直接阻止默认行为，如果输入内容则不会触发`insert`具体的文本，这个行为跟`Slate`的表现是一致的。

```js
const indexOp = pickOpAtRange(editor, sel);
if (editor.schema.isVoid(indexOp)) {
  return void 0;
}
```

但是在这里我们还需要处理中文输入的情况，因为`beforeinput`事件是不能够实际阻止`IME`的行为的，而此时我们的内容虽然没有办法输入进去，但是选区发生了变化。还会导致我们的`toDOMRange`方法出现了问题，选区此时会被重置为`null`，因此我们需要在选区从`DOM`到`Modal`时重新为其校正。

```js
// Case 3: 光标位于 data-zero-void 节点唤起 IME 输入, 修正为节点末
// [ xxx[cursor]]\n => [ [cursor]xxx]\n
const isVoidZero = isVoidZeroNode(node);
if (isVoidZero && offset !== 1) {
  return new Point(lineIndex, 1);
}
```

此外这里一个很有趣的事情，是关于`ContentEditable`以及`IME`的交互问题。在`slate`的`issue`中发现，如果最外层节点是`editable`的，然后子节点中某个节点是`not editable`的，然后其后续紧接着是`span`的文本节点，当前光标位于这两者中间，即`Void`节点的末尾。

此时唤醒`IME`输入部分内容，如果按着键盘的左键将`IME`的编辑向左移动到最后，则会使整个编辑器失去焦点，`IME`以及输入的文本也会消失，此时如果在此唤醒`IME`则会重新出现之前的文本。这个现象只在`Chromium`中存在，在`Firefox/Safari`中则表现正常。

```html
<div contenteditable="true"><span contenteditable="false" style="background:#eee;">Void</span><span>!</span></div>
```

这个问题在`https://github.com/ianstormtaylor/slate/pull/5736`中进行了修复，关键点是外层`span`标签有`display:inline-block`样式，子`div`标签有`contenteditable=false`属性。

```html
<div contenteditable="true"><span contenteditable="false" style="background: #eee; display: inline-block;"><div contenteditable="false">Void</div></span><span>!</span></div>
```


## Embed 节点组件
`Embed`节点组件相对`Void`节点组件更加复杂，因为`Embed`节点是行内节点，因此其本身是需要实现文本选区的所有行为的。然而其本身并不是字符，因为在行内还需要将其作为完整的行内块，并且还需要实现文本选区行为，不过在这里我们仍然是需要提供一个`HOC`组件。

```js
/**
 * Embed 嵌入节点 HOC
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

### 节点结构设计
我们的`Embed`节点实际上应该是`InlineVoid`节点，但是因为组件名太长所以就起了别名为`Embed`，而在具体实现的时候遇到了太多了的问题，我只得感慨纸上得来终觉浅，绝知此事要躬行。

在之前我们一直都是在使用富文本引擎来实现应用层的功能，而虽然我也基本阅读过`Slate`的代码并且提过了一些`pr`来解决一些问题，但在真正想对照实现的时候发现问题实在是太多。现在的问题是我们是借助浏览器本身的`ContentEditable`来绘制的光标位置，而不是采用自绘选区的方式，这样就导致我们必须要依赖浏览器本身对于选区的实现。

而此时如果我们是实现`InlineVoid`节点且行内只有该节点时，就会导致光标无法放在周围的位置上，这跟文本内容的表现是不一致的。在下面的例子中，中间的行是做不到单击时光标落在节点末尾的，虽然可以通过双击或者方向键来实现，但是此时的节点并不是在文本节点上的，与我们的选区设计不符。

```html
<div contenteditable style="outline: none">
  <div data-node><span data-leaf><span>123</span></span></div>
  <div data-node>
    <span data-leaf><span contenteditable="false">321</span></span>
  </div>
  <div data-node><span data-leaf><span>123</span></span></div>
</div>
```

对于这个问题的解法，无论是`Quill`、`Slate`都是在`Embed`节点的两侧添加了零宽字符`&#xFEFF;`用以放置光标，当然这仅仅是当`Embed`节点左右没有文本节点时的情况，如果两侧有文本则不需要这样的特殊处理。那么如果我们此时如果按照`Slate`的设计，即此时存在三个可选位置可以放置光标作为选区，即`Embed`本身以及左右光标`CARET`，那么此时就会存在三个零宽字符位置。

```html
<span data-zero-enter> </span>
<span data-zero-embed> </span>
<span data-zero-enter> </span>
```

而且在`Slate`中的数据结构是经过`normalize`之后与数据结构格式严格对应的，也就是说在上边这个例子中，`Slate`的行结构内容将会类似下面的内容。其实这样也就很容易理解为什么类似于图片这种`Void`节点也必须要存在`children`结构了，因为其存在的零宽字符必须要完整对应数据结构，且由于其计算时会真正计算为零宽，光标落点也在零宽字符节点上，这样则可以保证选区只会在零宽节点的`0 offset`上。

```js
[
  { text: "" },
  { type: "embed", children: [{ text: "" }] },
  { text: "" }
]
```

但是有个重要的问题是，零宽字符是存在两个光标位置的，即`0|1`两个`offset`，那么此时我们就存在了`4`个光标位置`|||`。而此时我们的`Model`在此时只有两个节点即` \n`，那么即使我们不允许光标放在`\n`后，也才能勉强对应上三个光标位置，而这里最重要的是我们前边说的一个零宽字符存在两个`offset`，那么对于`toDOMPoint`时同一个光标位置的处理就会存在两个情况。


```html
<span data-zero-enter> |</span>
<span data-zero-embed>| </span>
<span data-zero-enter> </span>
```

而我们最开始设计`toDOMPoint`的时候优先将光标放置于前一个节点的末尾，那么我们点击行末尾的时候，此时的光标会位于`zero-enter`节点后，那么此时的`offset`是`2`，而此时由于我们的选区校正存在，这里的`offset`会被校正为`1`。

那么此时我们的选区则会被校正为第一个`data-zero-enter`节点，且`offset`的值为`1`，那么此时我们本应该希望放置于最后一个`data-zero-enter`节点上的光标，现在却被校正到首个节点上了，这里的数据并非我们希望的选区位置。

```html
<span data-zero-enter> |</span>
<span data-zero-embed> </span>
<span data-zero-enter> </span>
```

那么假设我们最开始不将`offset`的`2`值校正为`1`的话，此时我们的选区则会被设置到`data-zero-embed`节点的`offset -> 1`位置上，依然不是我们希望的光标位置。因此这里依然不是正确的选区位置，这样依然需要存在额外校正的情况。

```html
<span data-zero-enter> </span>
<span data-zero-embed> |</span>
<span data-zero-enter> </span>
```

那么这里如果改造起来可能存在不少问题，主要是这里存在了两个节点的突变，那么我们如果换个思路减少零宽字符的节点，即去掉第一个零宽字符节点。那么我们这样就无法保持三个选区状态了，而如果希望`zero-embed`的`0 offset`为左光标，`offset 1`为嵌入内容的选中效果则是不容易实现的，因为光标本身不能是左出现右消失的状态，这里需要样式的额外处理才可以。

那么根据上述的问题，`data-zero-embed`节点则会是我们要处理的左光标，右光标则依然是`data-zero-enter`节点，左光标的处理则需要让右侧的`Embed`内容存在`margin`样式。那么在默认情况下，此时我们在校正`\n`节点后的选区`offset`为`1`，默认的选区位置则如下所示。

```html
<span data-zero-embed> |</span>
<span data-zero-enter> </span>
```

那么这里依然会有问题，我们点击行末尾时，此时的选区则会被浏览器转移到节点光标左侧的位置上，这里的效果显然是不合适的。因为这样的话我们无法聚焦到行末，因此这里我们需要为`toDOMPoint`设置额外的处理逻辑，即取消了默认的`offset`优先逻辑，而是采用`node`优先逻辑。在`data-zero-embed`节点且`offset`为`1`时，优先聚焦到后续的`data-zero-enter`节点`offset -> 0`上。

```js
const nodeOffset = Math.max(offset - start, 0);
const nextLeaf = leaves[i + 1];
// CASE1: 对同个光标位置, 且存在两个节点相邻时, 实际上是存在两种表达
// 即 <s>1|</s><s>1</s> / <s>1</s><s>|1</s>
// 当前计算方法的默认行为是 1, 而 Embed 节点在末尾时则需要额外的零宽字符放置光标
// 如果当前节点是 Embed 节点, 并且 offset 为 1, 并且存在下一个节点时
// 需要将焦点转移到下一个节点, 并且 offset 为 0
if (
  leaf.hasAttribute(ZERO_EMBED_KEY) &&
  nodeOffset === 1 &&
  nextLeaf &&
  nextLeaf.hasAttribute(ZERO_SPACE_KEY)
) {
  return { node: nextLeaf, offset: 0 };
}
```

这里实际上还存在问题，如果后续的节点是文本节点，会依然导致无法放置光标，因此这里实际上只需要判断`nextLeaf`存在即需要移动选区位置。而此时依然存在问题，因为同节点会存在两个`offset`位置，所以此时我们还是需要先校正`toModelPoint`的位置，即如果光标位于`data-zero-embed`节点后时, 需要将其修正为节点前。

```js
// Case 4: 光标位于 data-zero-embed 节点后时, 需要将其修正为节点前
// 若不校正会携带 DOM-Point CASE1 的零选区位置, 按下左键无法正常移动光标
// [embed[cursor]]\n => [[cursor]embed]\n
const isEmbedZero = isEmbedZeroNode(node);
if (isEmbedZero && offset) {
  return new Point(lineIndex, leafOffset - 1);
}
```

那么此时又会出现新的问题，当光标位于节点左时，会导致我们按右键无法移动光标，因为此时的选区会被上述的逻辑校正回原本的位置。因此我们依然需要在`onKeyDown`事件中受控处理这个问题，当选区位于`data-zero-embed`节点时，按下右键则主动调整选区。

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

虽然看起来问题都解决了，但是`DOM`的`normalize`频繁操作却带来了一个隐晦的问题，当行中仅存在`Embed`节点时，我们无法用鼠标拖拽选区来选中该节点，甚至这个操作会触发我们预设的选区`limit`错误，而且在控制台的选区变换打印非常频繁。

这个问题应该算是受控的选区和非受控的拖选造成的问题，我们无法控制浏览器的拖选，那么就只能尽可能减少受控的行为。因此这里我们需要避免在用户拖拽的时候主动设置选区，以避免打断拖选的行为，同时还需要注意输入的情况下即使按下鼠标但仍然需要更新`DOM`选区，且在鼠标松开时再校准一次。

```js
// 按下鼠标的情况下不更新选区, 而 force 的情况则例外
// 若总是更新选区, 则会导致独行的 Embed 节点无法选中, 需要非受控
// 若是没有 force 的调度控制, 则在按下鼠标且输入时会导致选区 DOM 滞留
if (!force && this.editor.state.get(EDITOR_STATE.MOUSE_DOWN)) {
  return false;
}
```

### 选区行为
在`Slate`中的`inline`节点是在空节点内放置零宽字符，以此来实现节点本身的选中状态。而如果独占一行的时候，前后都会生成零宽字符来放置光标。我们本身的节点是不会存在零宽字符来选中本身节点的，内部自然不会存在零宽字符，外部的零宽字符则是用来放置光标，这都是符合各自的语义设计的。

当拖拽选区的时候，此时如果没有拖过`Embed`节点，那么浏览器选区的放置则是`contenteditable="false"`的节点。那么从上述就能够看出来，在`Slate`中查找节点的时候，是应该正常向内部查找，而我们实际上应该查找平级的节点，因此这里的实现是有差异的。当然如果选区落点在`data-leaf`节点上的话，向内查找自然是没有问题的。

```js
// Slate
<div data-leaf="true">
  <div contenteditable="false">
    <ZeroSpace></ZeroSpace>
    <span>Mention</span>
  </div>
</div>

// 平级节点
<div data-leaf="true">
  <ZeroSpace></ZeroSpace>
  <div contenteditable="false"><span>Mention</span></div>
</div>
```

从前边`Embed`节点的设计中，是将内置的零宽字符`0/1`两个位置作为光标的放置位置，而`offset 1`的位置会被实际移动到后一个节点的`offset 0`上，那么实际上如果此时我们仅使用该偏移方案而不校正`ModelPoint`的话，理论上而言是可行的。

然而在实际的操作中，我们发现如果两个选区节点之间不连续的话，按左键会导致选区从`node2 offset 0`移动到`node1 offset 1`的位置，而如果连续的话则是会正常移动到`node1 offset len-1`的位置。

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

在这个例子中按`Embed`按钮后再按左键选区变换的`offset`会得到`3`，而使用`Span`按钮后则会得到`2`。而如果直接将零宽字符节点放到`Embed`节点后的话虽然可以解决这个问题，但是这样就无法将光标放置于`Embed`节点前了。

此时这就需要在最前边再放一个零宽字符，这样额外的交互处理更是麻烦，且在`Slate`还提过零宽字符打断中文`IME`的输入问题`PR`。其实这里的选区映射也有个有趣的问题，光标位于`data-zero-embed`节点后时, 需要将其修正为节点前。

那么此时我们按右键选区会被这段`toModelPoint`中的逻辑重新映射回原本的位置，即`L => L`并没有变化，那么也就无法触发`Model Sel Change`，而`DOM`选区则会从`offset 1`重新被`force`校正为`0`。

那么如果我们在按下右键主动调整选区的话，则会先出发`Model Sel Change`进而`UpdateDOM`，然后再由`DOM Sel Change`来校正选区，因为这时候选区不在`Embed`零宽字符上了，就不会命中校正逻辑，因而可以正常进行选区的移动。

```js
// CASE2: 当 Embed 元素前存在内容且光标位于节点末时, 需要校正到 Embed 节点上
// <s>1|</s><e> </e> => <s>1</s><e>| </e>
if (nodeOffset === len && nextLeaf && nextLeaf.hasAttribute(ZERO_EMBED_KEY)) {
  return { node: nextLeaf, offset: 0 };
}
// [[cursor]embed]\n => right => [embed[cursor]]\n => [[cursor]embed]\n
// SET(1) => [embed[cursor]]\n => [embed][[cursor]\n] => SET(1) => EQUAL
```

可以看出`Embed`选区行为需要注意的点过多，在前边的设计中虽然基本是可以实现，但是在实际使用过程中会出现一些问题。例如在从左到右选择时，若是鼠标拖拽到`Embed`节点偏左时，浏览器选区并未覆盖节点，然而抬起鼠标时的计算会将其覆盖整个节点，这属于是选区不同步的问题。

造成这个问题的原因是，我们的选区模型设计是左侧的零宽节点设计，因为放置于右侧的话可能会导致输入法的问题，对于类似的问题在`slate#5685`以及`slate#5736`中都有提到过。因此在我们的编辑器实现中，会直接将其放置于嵌入节点的左侧。

```js
<span data-leaf="true">
  <span data-zero-space="true" data-zero-embed="true">&ZeroWidthSpace;</span>
  <span contenteditable="false" data-void="true">{/** xxx */}</span>
</span>
```

因此在先前的实现中，虽然整个选区的行为是更倾向于偏左的节点，但是在`Embed`节点上的右侧选区则是偏右的，这是因为这里的设计会导致浏览器的光标始终是展示在左侧的，这部分实现则依旧保持现状。说起来`slate`的实现是额外增加了零宽节点作为选区，不会存在类似问题。

```js
// 选区变换观测
document.onselectionchange = () => {
  const sel = document.getSelection();
  console.log(sel.anchorNode, sel.anchorOffset, sel.focusNode, sel.focusOffset);
};
```

此处的修改主要是对于`Case 4`做了增添，主体原则是落于零宽字符时，无论`offset`是`0`还是`1`，光标都会置于节点前，当然由于`offset`为`0`时本身就是左选区无需特殊处理。`data-void`位置表示选区需要置于节点后, 由此能够对齐浏览器的实现。

并且实现了`Case 5`的情况，由于`Embed`节点是不会实现`user-select: none`的情况，因此在拖拽选区时，`offset`可能会越界出现偏移问题。此外，若是非折叠的选区, 则需要判断是否是`End`节点决定边界, 将整个`Embed`选区选中，这里需要传递相关环境状态。

```js
// Case 4: 光标位于 data-zero-embed 节点上时, 需要将其修正为节点前
// 若不校正会携带 DOM-Point CASE1 的零选区位置, 按下左键无法正常移动光标
// 主体原则是落于零宽字符时，光标置于节点前, `div`位置表示节点后, 对齐浏览器
// [[z][caret]]\n => [[caret][z]]\n
// [[z][div[caret]]][123]\n => [[z][div]][[caret]123]\n
// Case 5: 光标在 Embed 节点内时, 光标可能会在其内部文本上(offset 可能 > 1)
// 无论是选区折叠与否, 若不校正会导致选区越界, 会导致拖拽选区时出现偏移问题
// 若是非折叠的选区, 则需要判断是否是 End 节点决定边界, 将整个 Embed 选区选中
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

此外，若是存在连续的`Embed`节点时，浏览器三击时会导致仅能选中覆盖首个节点，后续节点无法覆盖，选区变换时拿到的是`Embed div`节点。因此，我们需要额外判断三击时的选区行为，直接主动选择整行，而不需要依赖浏览器的选区变换。

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

### 输入法处理
在`Embed`节点中，输入法同样会带来额外的影响，除了上述提到的输入法相关问题时，还有一个额外需要解决的`Case`。当文本仅有在单行，且仅存在 `Embed`节点时, 在节点最前输入会导致内容重复，即`IME`导致输入的内容滞留在零宽字符上。

```
[Zero<IME Text>][<IME Text>]\n
```

在这种情况下，就需要在`IME`输入完成后，重新校正零宽字符上的文本内容。由于我们本身就携带了行内容的文本校正，所以只需要在`IME`输入完成后，重新校正零宽字符上的文本内容即可。

```js
const isZeroNode = !!zeroNode;
const textNode = isZeroNode ? zeroNode : LEAF_TO_TEXT.get(leaf);
const text = isZeroNode ? ZERO_SYMBOL : leaf.getText();
// 如果文本内容不合法, 通常是由于输入的脏 DOM, 需要纠正内容
if (isDOMText(textNode.firstChild)) {
  // Case1: [inline-code][caret][text] IME 会导致模型/文本差异
  // Case3: 在单行仅存在 Embed 节点时, 在节点最前输入会导致内容重复
  if (textNode.firstChild.nodeValue === text) return false;
  textNode.firstChild.nodeValue = text;
} 
```

## 总结
在这里我们讨论了是编辑节点的组件预设，包括零宽字符、`Embed`节点、`Void`节点等。主要是为编辑器的插件扩展提供预设的组件，在这些组件内存在一些默认的行为，并且同样预设了部分`DOM`结构，处理了大量选区交互以及`IME`输入法造成的问题。

那么接下来我们需要讨论的是非编辑节点内容渲染，也就是占位节点、只读模式、插件模式、外部节点挂载等。这些节点类型在编辑器的设计中处于常见的外部节点，例如占位符号、弹出层等，并不会像编辑节点那样需要处理选区交互以及`IME`输入法造成的问题。


## 每日一题

- <https://github.com/WindRunnerMax/EveryDay>

## 参考

- <https://18.react.dev/>
- <https://www.cnblogs.com/goloving/p/16018529.html>
- <https://developer.mozilla.org/zh-CN/docs/Web/CSS/Guides/Text/Whitespace>
