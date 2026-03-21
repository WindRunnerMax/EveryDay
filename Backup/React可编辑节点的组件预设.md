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

此时就需要进行校正，特别需要注意此时的`focus`节点是下一行的节点，因此我们需要校正的目标是下一行行首文本节点`offset: 0`的位置，因此这样的`Model`选区就可以对应为选区两行的`0 offset`位置，同时需要同步到`DOM`选区上。

编辑器实现的校正逻辑基本上参考了`slate`的实现，大概目标是尝试找到可编辑子节点，首先会调用`getEditableChildAndIndex`查找一级子节点，相当于先查找一级来判断后续迭代方向。之后继续查找，这里是采取的`DFS`搜索形式，查找每一级都会尝试找到可编辑节点。

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
通常实现`Void/Embed`节点时，我们都需要在`Void`节点中实现一个零宽字符，用来处理选区的映射问题。通常我们都需要隐藏其本身显示的位置以隐藏光标，然而在特定条件下这里会存在吞`IME`输入的问题。

```html
<div contenteditable="true"><span contenteditable="false" style="background:#eee;">Void<span style="height: 0px; color: transparent; position: absolute;">&#xFEFF;</span></span><span>!</span></div>
```

处理这个问题的方式比较简单，我们只需要将零宽字符的标识放在`EmbedNode`之前即可，这样也不会影响到选区的查找。`https://github.com/ianstormtaylor/slate/pull/5685`。此外飞书文档的实现方式也是这样的，`ZeroNode`永远在`FakeNode`前。

```html
<div contenteditable="true"><span contenteditable="false" style="background:#eee;"><span style="height: 0px; color: transparent; position: absolute;">&#xFEFF;</span>Void</span><span>!</span></div>
```

## 行末零宽字符
前边已经明确使用零宽字符的主要目的是为了放置光标，而目前我们的视图渲染是完全对等于数据结构的。也就是说我们的行末必然存在一个零宽字符，用来对等数据结构中末尾的`\n`对应的`Leaf`节点，实现这个节点的目的主要有几个方面:

1. 完全对等数据结构，与我们设计的`LineState`数据对齐，每个`LeafState`都必然渲染一个`DOM`节点，数据模型友好，且这样就可以在空行时必然会留存有文本节点，而不必要特殊处理。
2. `Mention`节点的渲染，如果行的最后一个节点是`Void`节点，则会导致光标无法放置于末尾，这个问题的处理我们则按需渲染一个零宽字符节点即可，`slate`即如此处理的末尾`Mention`节点。
3. 在研究`Lark`的编辑器时发现每个文本行末尾必然会存在零宽字符，预计是为了解决`Blocks`的相关问题，请教了大佬还得知早起的`etherpad`每行也是实现了零宽字符，用来处理`DOM`与选区的相关问题。

在这里我们实现了太多的兼容方案来处理这个问题，例如之前的选区校正部分以及后面的`Void`选区变换部分内容，而如果实际上我们不渲染这个节点的话就不需要处理这两处相关问题，但是这样的话我们就需要处理其他的`case`来保证`DOM`与`Model`的对等性。

那么此时我们需要解决空行的选区问题，此时如果直接使用空节点即`<span></span>`设置为子节点的话，则会导致此时并没有实际的文本内容。由此这里的高度并没有撑起来并且选区是无法聚焦到此处的，所以这里我们还是需要空节点的内容为零宽字符，这样的话才可以实现选区的聚焦。

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

实际上末尾的节点如果是`<br />`节点的话，是可以不需要零宽字符来解决这个问题的。选区节点是可以放置于此节点上的，且不会有`0/1`两个`offset`的偏移需要处理，`quill`对于空行就是如此处理的，这其实也是富文本编辑器的常见实现。

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

在腾讯文档、谷歌文档等类似的`Canvas`实现的编辑器中，这个问题是通过额外绘制了淡蓝色的选区来解决的。而我们如果通过`DOM`来实现的话，则不能直接绘制内容，这样我们就可以使用零宽字符来实现，即在行末添加一个零宽字符节点，这其中实现的重点是，而当我们选区在零宽字符后时，主动将其修正为零宽字符前。这个实现在`Chrome`上表现良好，但是在`FireFox`上就没有效果了。

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

### 选区查找
这里还有需要关注的是，如果能够直接找到文本节点自然不需要继续深度查找，在`HTML`中文本节点并不属于`DOMElement`。此外，由于已经确定了当前是非文本节点，因此我们此时的`offset`值只会是`0`或者子节点长度偏移。


## Embed 节点组件


### 选区行为
对于`Embed`节点来说这里更加复杂，具体来说则是注释节点、非编辑节点、空子节点等。因此主要差异在于`getEditableChildAndIndex`的方法中，这里就是在查找子节点时，分别尝试正向和反向查找，以此来尝试找到可编辑节点。

在`slate`中的`inline`节点是在空节点内放置零宽字符，以此来实现节点本身的选中状态。而如果独占一行的时候，前后都会生成零宽字符来放置光标。我们本身的节点是不会存在零宽字符来选中本身节点的，内部自然不会存在零宽字符，外部的零宽字符则是用来放置光标，这都是符合各自的语义设计的。

```js
// slate
<div data-leaf="true">
  <div contenteditable="false">
    <ZeroSpace></ZeroSpace>
    <span>Mention</span>
  </div>
</div>

// block-kit
<div data-leaf="true">
  <ZeroSpace></ZeroSpace>
  <div contenteditable="false">
    <span>Mention</span>
  </div>
</div>
```

当拖拽选区的时候，此时如果没有拖过`Embed`节点，那么浏览器选区的放置则是`contenteditable="false"`的节点。那么从上述就能够看出来，在`slate`中查找节点的时候，是应该正常向内部查找，而我们实际上应该查找平级的节点，因此这里的实现是有差异的。当然如果选区落点在`data-leaf`节点上的话，向内查找自然是没有问题的。

```js
document.onselectionchange = () => {
  const sel = document.getSelection();
  console.log(sel.anchorNode, sel.anchorOffset, sel.focusNode, sel.focusOffset);
};
```

## 每日一题

- <https://github.com/WindRunnerMax/EveryDay>

## 参考

- <https://18.react.dev/>
- <https://www.cnblogs.com/goloving/p/16018529.html>
- <https://developer.mozilla.org/zh-CN/docs/Web/CSS/Guides/Text/Whitespace>
