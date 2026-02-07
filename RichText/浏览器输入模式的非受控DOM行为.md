# 浏览器输入模式的非受控DOM行为
先前我们在选区模块的基础上，通过浏览器的组合事件来实现半受控的输入模式，这是状态同步的重要实现之一。在这里我们要关注于处理浏览器复杂`DOM`结构默认行为，以及兼容`IME`输入法的各种输入场景，相当于我们来`Case By Case`地处理输入法和浏览器兼容的行为。

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

</details>

## 概述
在整个编辑器系列最开始的时候，我们就提到了`ContentEditable`的可控性以及浏览器兼容性问题，特别是结合了`React`作为视图层的模式下，状态管理以及`DOM`的行为将变得更不可控，这里回顾一下常见的浏览器的兼容性问题:

- 在空`contenteditable`编辑器的情况下，直接按下回车键，在`Chrome`中的表现是会插入`<div><br></div>`，而在`FireFox(<60)`中的表现是会插入`<br>`，`IE`中的表现是会插入`<p><br></p>`。
- 在有文本的编辑器中，如果在文本中间插入回车例如`123|123`，在`Chrome`中的表现内容是`123<div>123</div>`，而在`FireFox`中的表现则是会将内容格式化为`<div>123</div><div>123</div>`。
- 同样在有文本的编辑器中，如果在文本中间插入回车后再删除回车，例如`123|123->123123`，在`Chrome`中的表现内容会恢复原本的`123123`，而在`FireFox`中的表现则是会变为`<div>123123</div>`。
- 在同时存在两行文本的时候，如果同时选中两行内容再执行`("formatBlock", false, "P")`命令，在`Chrome`中的表现是会将两行内容包裹在同个`<p>`中，而在`FireFox`中的表现则是会将两行内容分别包裹`<p>`标签。
- ...

由于我们的编辑器输入是依靠浏览器提供的组合事件，自然无法规避相关问题。编辑器设计的视图结构是需要严格控制的，这样我们才能根据一定的规则实现视图与选区模式的同步。依照整体`MVC`架构的设计，当前编辑器的视图结构设计如下:

```html
<div data-block="true" >
  <div data-node="true">
    <span data-leaf="true"><span data-string="true">inline</span></span>
    <span data-leaf="true"><span data-string="true">inline2</span></span>
  </div>
</div>
```

那么如果在`ContentEdiable`输入时导致上述的结构被破坏，我们设计的编辑器同步模式便会出现问题。因此为了解决类似的问题，我们就需要实现脏`DOM`检查，若是出现破坏性的节点结构，就需要尝试修复`DOM`结构，甚至需要调度`React`来重新渲染严格的视图结构。

然而，如果每次输入或者选区变化等时机都进行`DOM`检查和修复，势必会影响编辑器整体性能或者输入流畅性，并且`DOM`检查和修复的范围也需要进行限制，否则同样影响性能。因此在这里我们需要对浏览器的输入模式进行归类，针对不同的类型进行不同的`DOM`检查和修复模式。

## 行内节点
`DOM`结构与`Model`结构的同步在非受控的`React`组件中变得复杂，这其实也就是部分编辑器选择自绘选区的原因之一，可以以此避免非受控问题。那么非受控的行为造成的主要问题可以比较容易地复现出来，假设此时存在两个节点，分别是`inline`类型和`text`类型的文本节点:

```
inline|text
```

此时我们的光标在`inline`后，假设`schema`中定义的`inline`规则是不会继承前个节点的格式，那么接下来如果我们输入内容例如`1`，此时文本就变成了`inline|1text`。这个操作是符合直觉的，然而当我们在上述的位置唤醒`IME`输入中文内容时，这里的文本就变成了错误的内容。

```
inline中文|中文text
```

这里的差异可以比较容易地看出来，如果是输入的英文或者数字，即不需要唤醒`IME`的受控输入模式，`1`这个字符是会添加到`text`文本节点前。而唤醒`IME`输入法的非受控输入模式，则会导致输入的内容不仅出现在`text`前，而且还会出现在`inline`节点的后面，这部分显然是有问题的。

这里究其原因还是在于非受控的`IME`问题，在输入英文时我们的输入在`beforeinput`事件中被阻止了默认行为，因此不会触发浏览器默认行为的`DOM`变更。然而当前在唤醒`IME`的情况下，`DOM`的变更行为是无法被阻止的，因此此时属于非受控的输入，这样就导致了问题。

此时由于浏览器的默认行为，`inline`节点的内容会被输入法插入“中文”的文本，这部分是浏览器对于输入法的默认处理。而当我们输入完成后，数据结构`Model`层的内容是会将文本放置于`text`前，这部分则是编辑器来控制的行为，这跟我们输入非中文的表现是一致的，也是符合预期表现的。

那么由于我们的`immutable`设计，再加上性能优化策略的`memo`以及`useMemo`的执行，即使在最终的文本节点渲染加入了脏`DOM`检测也是不够的，因为此时完全不会执行`rerender`。这就导致`React`原地复用了当前的`DOM`节点，因此造成了`IME`输入的`DOM`变更和`Model`层的不一致。

```js
const onRef = (dom: HTMLSpanElement | null) => {
  if (props.children === dom.textContent) return void 0;
  const children = dom.childNodes;
  // If the text content is inconsistent due to the modification of the input
  // it needs to be corrected
  for (let i = 1; i < children.length; ++i) {
    const node = children[i];
    node && node.remove();
  }
  // Guaranteed to have only one text child
  if (isDOMText(dom.firstChild)) {
    dom.firstChild.nodeValue = props.children;
  }
};
```

而如果我们直接将`leaf`的`React.memo`以及`useMemo`移除，这个问题自然是会消失，然而这样就会导致编辑器的性能下降。因此我们就需要考虑尽可能检查到脏`DOM`的情况，实际上如果是在`input`事件或者`MutationObserver`中处理输入的纯非受控情况，也需要处理脏`DOM`的问题。

那么我们可以明显的想到，当行状态发生变更时，我们就直接检查当前行的所有`leaf`节点，然后对比文本内容，如果存在不一致的情况则直接进行修正。如果直接使用`querySelector`的话显然不够优雅，我们可以借助`WeakMap`来映射叶子状态到`DOM`结构，以此来快速定位到需要的节点。

然后在行节点的状态变更后，在处理副作用的时候检查脏`DOM`节点，并且由于我们的行状态也是`immutable`的，因此也不需要担心性能问题。此时检查的执行是`O(N)`的算法，而且检查的范围也会限制在发生`rerender`的行中，具体检查节点的方法自然也跟上述`onRef`一致。

```js
const leaves = lineState.getLeaves();
for (const leaf of leaves) {
  const dom = LEAF_TO_TEXT.get(leaf);
  if (!dom) continue;
  const text = leaf.getText();
  // 避免 React 非受控与 IME 造成的 DOM 内容问题
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

这里需要注意的是，脏节点的状态检查是需要在`useLayoutEffect`时机执行的，因为我们需要保证执行的顺序是先校正`DOM`再更新选区。如果反过来的话就会导致一个问题，先更新的选区依然停留在脏节点上，此时再校正会由于`DOM`节点变化导致选区的丢失，表现是选区会在`inline`的最前方。

```
leaf rerender -> line rerender -> line layout effect -> block layout effect
```

此外，这里的实现在首次渲染并不需要检查，此时不会存在脏节点的情况，因此初始化渲染的时候我们可以直接跳过检查。以这种策略来处理脏`DOM`的问题，还可以避免部分其他可能存在的问题，零宽字符文本的内容暂时先不处理，如果再碰到类似的情况是需要额外的检查的。

其实换个角度想，这里的问题也可能是我们的选区策略是尽可能偏左侧的查找，如果在这种情况将其校正到右侧节点可能也可以解决问题。不过因为在空行的情况下我们的末尾`\n`节点并不会渲染，因此这样的策略目前并不能彻底解决问题，而且这个处理方式也会使得编辑器的选区策略变得更加复杂。

```
[inline|][text] => [inline][|text]
```

这里还需要关注下`React`的`Hooks`调用时机，在下面的例子中，从真实`DOM`中得到`onRef`执行顺序是最前的，因此在此时进行首次`DOM`检查是合理的。而后续的`Child LayoutEffect`就类似于行`DOM`检查，在修正过后在`Parent LayoutEffect`中更新选区是符合调度时机方案。

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

## 包装节点
关于包装节点的问题需要我们先聊一下这个模式的设计，现在实现的富文本编辑器是没有块结构的，因此实现任何具有嵌套的结构都是个复杂的问题。在这里我们原本就不会处理诸如表格类的嵌套结构，但是例如`blockquote`这种`wrapper`级结构我们是需要处理的。

类似的结构还有`list`，但是`list`我们可以完全自己绘制，但是`blockquote`这种结构是需要具体组合才可以的。然而如果仅仅是`blockquote`还好，在`inline`节点上使用`wrapper`是更常见的实现，例如`a`标签的包装在编辑器的实现模式中就是很常规的行为。

具体来说，在我们将文本分割为`bold`、`italic`等`inline`节点时，会导致`DOM`节点被实际切割，此时如果嵌套`<a>`节点的话，就会导致`hover`后下划线等效果出现切割。因此如果能够将其`wrapper`在同一个`<a>`标签的话，就不会出现这种问题。

但是新的问题又来了，如果仅仅是单个`key`来实现渲染时嵌套并不是什么复杂问题，而同时存在多个需要`wrapper`的`key`则变成了令人费解的问题。如下面的例子中，如果将`34`单独合并`b`，外层再包裹`a`似乎是合理的，但是将`34`先包裹`a`后再合并`5`的`b`也是合理的，甚至有没有办法将`67`一并合并，因为其都存在`b`标签。

```html
1 2 3  4  5 6  7 8 9 0
a a ab ab b bc b c c c
```

思来想去，我最终想到了个简单的实现，对于需要`wrapper`的元素，如果其合并`list`的`key`和`value`全部相同的话，那么就作为同一个值来合并。那么这种情况下就变的简单了很多，我们将其认为是一个组合值，而不是单独的值，在大部分场景下是足够的。

```html
1 2 3  4  5 6  7 8 9 0
a a ab ab b bc b c c c
12 34 5 6 7 890
```

不过话又说回来，这种`wrapper`结构是比较特殊的场景下才会需要的，在某些操作例如缩进这个行为中，是无法判断究竟是要缩进引用块还是缩进其中的文字。这个问题在很多开源编辑器中都存在，特别是扁平化的数据结构设计例如`Quill`编辑器。

其实也就是在没有块结构的情况下，对于类似的行为不好控制，而整体缩进这件事配合`list`在大型文档中也是很合理的行为，因此这部分实现还是要等我们的块结构编辑器实现才可以。当然，如果数据结构本身支持嵌套模式，例如`Slate`就可以实现。

后续在`wrap node`实现的`a`标签来实现输入时，又出现了上述类似`inline-code`的脏`DOM`问题。以下面的`DOM`结构来看，看似并不会有什么问题，然而当光标放置于超链接这三个字后唤醒`IME`输入中文时，会发现输入“测试输入”这几个字会被放置于直属`div`下，与`a`标签平级。

```html
<div contenteditable>
  <a href="https://www.baidu.com"><span>超链接</span></a>
  <span>文本</span>
</div>
```

```html
<div contenteditable>
  <a href="https://www.baidu.com"><span>超链接</span></a>
  测试输入
  <span>文本</span>
</div>
```

在这种情况下我们先前实现的脏`DOM`检测就失效了，因为检查脏`DOM`的实现是基于`data-leaf`实现的。此时浏览器的输入表现会导致我们无法正确检查到这部分内容，除非直接拿`data-node`行节点来直接判断，这样的实现自然不够好。

说到这里，先前我发现飞书文档的实现是`a`标签渲染的`leaf`，而`wrap`的包装实现是使用的`span`直接处理的，并且额外增加了样式来实现`hover`效果。直接使用`span`包裹就不会出现上述问题，而内部的`a`标签虽然会导致同样的问题，但是在`leaf`下可以触发脏`DOM`检查。

```html
<div contenteditable>
  <span>
    <a href="https://www.baidu.com"><span>超链接</span></a>
    测试输入
  </span>
  <span>文本</span>
</div>
```

因此就可以在先前的脏`DOM`检查基础上解决了问题，而本质上类似的行为就是浏览器默认处理的结果，不同的浏览器处理结果可能都不一样。目前看起来是浏览器认为`a`标签的结构应该是属于`inline`的实现，也就是类似我们的`inline-code`实现，理论上倒却是并没有什么问题，由此我们需要自己来处理这些非受控的问题。

实际上`Quill`本身也会出现这个问题，同样也是脏`DOM`的处理。而`slate`并不会出现这个问题，这里处理方案则是通过`DOM`规避了问题，在`a`标签两端放置额外的`&nbsp`节点，以此来避免这个问题。当然还引入了额外的问题，引入了新的节点，目前看起来转移光标需要受控处理。

```html
<!-- https://github.com/ianstormtaylor/slate/blob/main/site/examples/ts/inlines.tsx -->
<div contenteditable>
  <a href="https://www.baidu.com"
    ><span contenteditable="false" style="font-size: 0">&nbsp;</span
    ><span>超链接测试输入</span
    ><span contenteditable="false" style="font-size: 0">&nbsp;</span></a
  ><span>文本</span>
</div>
```

## 浏览器兼容性
在后续浏览器的测试中，重新出现了上述提到的`a`标签问题，此时并不是由于包装节点引起的，因此问题变得复杂了很多，主要是各个浏览器的兼容性的问题。类似于行内代码块，本质上还是浏览器`IME`非受控导致的`DOM`变更问题，但是在浏览器表现差异很大，下面是最小的`DEMO`结构。

```html
<div contenteditable>
  <span data-leaf><a href="#"><span data-string>在[:]后输入:</span></a></span><span data-leaf>非链接文本</span>
</div>
```

在上述示例的`a`标签位置的最后的位置上输入内容，主流的浏览器的表现是有差异的，甚至在不同版本的浏览器上表现还不一致:

- 在`Chrome`中会在`a`标签的同级位置插入文本类型的节点，效果类似于`<a></a>"text"`内容。
- 在`Firefox`中会在`a`标签内插入`span`类型的节点，效果类似于`<a></a><span data-string>text</span>`内容。
- 在`Safari`中会将`a`标签和`span`标签交换位置，然后在`a`标签上同级位置加入文本内容，类似`<span><a></a>"text"</span>`。

```html
<!-- Chrome -->
<span data-leaf="true">
  <a href="https://www.baidu.com"><span data-string="true">超链接</span></a>
  "文本"
</span>

<!-- Firefox -->
 <span data-leaf="true">
  <a href="https://www.baidu.com"><span data-string="true">超链接</span></a>
  <span data-string="true">文本</span>
</span>

<!-- Safari -->
 <span data-leaf="true">
  <span data-string="true">
    <a href="https://www.baidu.com">超链接</a>
    "文本"
    ""
  </span>
</span>
```

因此我们的脏`DOM`检查需要更细粒度地处理，仅仅对比文本内容显然是不足以处理的，我们还需要检查文本的内容节点结构是否准确。其实最开始我们是仅处理了`Chrome`下的情况，最简单的办法就是在`leaf`节点下仅允许存在单个节点，存在多个节点则说明是脏`DOM`。

```js
for (let i = 1; i < nodes.length; ++i) {
  const node = nodes[i];
  node && node.remove();
}
```

但是后来发现在编辑时会把`Embed`节点移除，这里也就是因为我们错误地把组合的`div`节点当成了脏`DOM`，因此这里就需要更细粒度地处理了。然后考虑检查节点的类型，如果是文本的节点类型再移除，那么就可以避免`Embed`节点被误删的问题。

```js
for (let i = 1; i < nodes.length; ++i) {
  const node = nodes[i];
  isDOMText(node) && node.remove();
}
```

虽然看起来是解决了问题，然而在后续就发现了`Firefox`和`Safari`下的问题。先来看`Firefox`的情况，这个节点并非文本类型的节点，在脏`DOM`检查的时候就无法被移除掉，这依然无法处理`Firefox`下的脏`DOM`问题，因此我们需要进一步处理不同类型的节点。

```js
// data-leaf 节点内部仅应该存在非文本节点, 文本类型单节点, 嵌入类型双节点
for (let i = 1; i < nodes.length; ++i) {
  const node = nodes[i];
  // 双节点情况下, 即 Void/Embed 节点类型时需要忽略该节点
  if (isHTMLElement(node) && node.hasAttribute(VOID_KEY)) {
    continue;
  }
  node.remove();
}
```

在`Safari`的情况下就更加复杂，因为其会将`a`标签和`span`标签交换位置，这样就导致了`DOM`结构性造成了破坏。这种情况下我们就必须要重新刷新`DOM`结构，这种情况下就需要更加复杂地处理，在这里我们加入`forceUpdate`以及`TextNode`节点的检查。

其实在飞书文档中也是采用了类似的做法，飞书文档的`a`标签在唤醒`IME`输入后，同样会触发脏`DOM`的检查，然后飞书文档会直接以行为基础`ReMount`当前行的所有`leaf`节点，这样就可以避免复杂的脏`DOM`检查。我们这里实现更精细的`leaf`处理，主要是避免不必要的挂载。

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

这里需要注意的是，我们还需要处理零宽字符类型的情况。当`Embed`节点前没有任何节点，即位于行首时，输入中文后同样会导致`IME`的输入内容被滞留在`Embed`节点的零宽字符上，这点与上述的`inline`节点是类似的，因此这部分也需要处理。

```js
const zeroNode = LEAF_TO_ZERO_TEXT.get(leaf);
const isZeroNode = !!zeroNode;
const textNode = isZeroNode ? zeroNode : LEAF_TO_TEXT.get(leaf);
const text = isZeroNode ? ZERO_SYMBOL : leaf.getText();
const nodes = textNode.childNodes;
```

到这里，我们的脏`DOM`检查已经能够处理大部分情况了，整体的模式都是`React`在行`DOM`结构计算完成后，浏览器渲染前进行处理。针对于文本节点以及`a`标签的检查，需要检查文本与状态的关系，以及严格的`DOM`结构破坏后的需要直接`Remount`组件。

```js
// 文本节点内部仅应该存在一个文本节点, 需要移除额外节点
for (let i = 1; i < nodes.length; ++i) {
  const node = nodes[i];
  node && node.remove();
}
// 如果文本内容不合法, 通常是由于输入的脏 DOM, 需要纠正内容
if (isDOMText(textNode.firstChild)) {
  // Case1: [inline-code][caret][text] IME 会导致模型/文本差异
  // Case3: 在单行仅存在 Embed 节点时, 在节点最前输入会导致内容重复
  if (textNode.firstChild.nodeValue === text) return false;
  textNode.firstChild.nodeValue = text;
  } else {
  // Case2: Safari 下在 a 节点末尾输入时, 会导致节点内外层交换
  const func = LEAF_TO_REMOUNT.get(leaf);
  func && func();
  if (process.env.NODE_ENV === "development") {
    console.log("Force Render Text Node", textNode);
  }
}
```

而针对于额外的文本节点，即本章节中重点提到的浏览器兼容性问题，我们需要严格地控制`leaf`节点下的`DOM`结构。如果仅存在单个文本节点的情况下，是符合设计的结构，而如果是存在多个节点，除了`Void/Embed`节点的情况外，则说明`DOM`结构被破坏了，这里我们就需要移除掉多余的节点。

```js
// data-leaf 节点内部仅应该存在非文本节点, 文本类型单节点, 嵌入类型双节点
for (let i = 1; i < nodes.length; ++i) {
  const node = nodes[i];
  // 双节点情况下, 即 Void/Embed 节点类型时需要忽略该节点
  if (isHTMLElement(node) && node.hasAttribute(VOID_KEY)) {
    continue;
  }
  // Case1: Chrome a 标签内的 IME 输入会导致同级的额外文本节点类型插入
  // Case2: Firefox a 标签内的 IME 输入会导致同级的额外 data-string 节点类型插入
  node.remove();
}
```

## 样式组合渲染
由于我们的编辑器是以`immutable`提高渲染性能，因此在文本节点变更时若是需要存在连续的格式处理，例如`inline-code`的样式实现，就会出现组件不重新渲染问题。具体表现是若是存在多个连续的`code`节点，最后一个节点长度为`1`，删除最后这个节点时会导致前一个节点无法刷新样式。

```
[inline][c]|
```

这个问题的原因是我们的`className`是在渲染`leaf`节点时动态计算的，具体的逻辑如下所示。如果前一个节点不存在或者前一个节点不是`inline-code`，则添加`inline-code-start`类属性，类似的需要在最后一个节点加入`inline-code-end`类属性。

```js
if (!prev || !prev.op.attributes || !prev.op.attributes[INLINE_CODE_KEY]) {
  context.classList.push(INLINE_CODE_START_CLASS);
}
context.classList.push("block-kit-inline-code");
if (!next || !next.op.attributes || !next.op.attributes[INLINE_CODE_KEY]) {
  context.classList.push(INLINE_CODE_END_CLASS);
}
```

这个情况同样类似于`Dirty DOM`的问题，由于删除的节点长度为`1`，因此前一个节点的`LeafState`并没有变更，因此不会触发`React`的重新渲染。这里我们就需要在行节点渲染时进行纠正，这里的执行倒是不需要像上述检查那样同步执行，以异步的`effect`执行即可。

```js
/**
 * 编辑器行结构布局计算后异步调用
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

虽然看起来已经解决了问题，然而在`React`中还是存在一些问题，主要的原因此时的`DOM`处理是非受控的。类似于下面的例子，由于`React`在处理`style`属性时，只会更新发生变化的样式属性，即使整体是新对象，但具体值与上次渲染时相同，因此`React`不会重新设置这个样式属性。

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

因此，在上述的`didPaintLineState`中我们主要是`classList`添加类属性值，即使是`LeafState`发生了变更，`React`也不会重新设置类属性值，因此这里我们还需要在`didPaintLineState`变更时删除非必要的类属性值。

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

## 总结
在先前我们实现了半受控的输入模式，这个输入模式同样是目前大多数富文本编辑器的主流实现方式。在这里我们关注于浏览器`ContentEditable`模式输入的默认行为造成的`DOM`结构问题，并且通过脏`DOM`检查的方式来修正这些问题，以此来保持编辑器的严格`DOM`结构。

当前我们主要关注的是编辑器文本的输入问题，即如何将键盘输入的内容写入到编辑器数据模型中。而接下来我们需要关注于输入模式结构化变更的受控处理，即回车、删除、拖拽等操作的处理，这些操作同样也是基于输入相关事件实现的，而且通常会涉及到文本的结构变更，属于输入模式的补充。

## 每日一题

- <https://github.com/WindRunnerMax/EveryDay>

## 参考

- <https://18.react.dev/>
- <https://developer.mozilla.org/zh-CN/docs/Web/API/CompositionEvent>
- <https://medium.engineering/why-contenteditable-is-terrible-122d8a40e480>
