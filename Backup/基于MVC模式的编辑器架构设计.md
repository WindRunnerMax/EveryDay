# 基于MVC模式的编辑器架构设计
在先前的规划中我们是需要实现`MVC`架构的编辑器，将应用程序分为控制器、模型、视图三个核心组件，通过控制器执行命令时会修改当前的数据模型，进而表现到视图的渲染上。简单来说就是构建一个描述文档结构与内容的数据模型，并且使用自定义的`execCommand`对数据描述模型进行修改。以此实现的`L1`级富文本编辑器，通过抽离数据模型，解决了富文本中脏数据、复杂功能难以实现的问题。

- 开源地址: <https://github.com/WindRunnerMax/BlockKit>
- 在线编辑: <https://windrunnermax.github.io/BlockKit/>
- 项目笔记: <https://github.com/WindRunnerMax/BlockKit/blob/master/NOTE.md>

从零实现富文本编辑器项目的相关文章:

- [深感缺乏擅长领域，准备试着从零开始写个富文本编辑器]()
- [从零实现富文本编辑器-基于MVC模式的编辑器架构设计]()

## 精简的编辑器
我们先前已经提到了`ContentEditable`属性以及`execCommand`命令，通过`document.execCommand`来执行命令修改`HTML`的方案虽然简单，但是很明显其可控性比较差。`execCommand`命令的行为在各个浏览器的表现是不一致的，这也是之前我们提到的浏览器兼容行为的一种，然而这些行为我们也没有任何办法去控制，这都是其默认的行为。

```html
<div>
  <button id="$1">加粗</button>
  <div style="border: 1px solid #eee; outline: none" contenteditable>123123</div>
</div>
<script>
  $1.onclick = () => {
    document.execCommand("bold");
  };
</script>
```

因此为了更强的扩展以及可控性，也解决数据与视图无法对应的问题，`L1`的富文本编辑器使用了自定义数据模型的概念。即在`DOM`树的基础上抽离出来的数据结构，相同的数据结构可以保证渲染的`HTML`也是相同的，配合自定义的命令直接控制数据模型，最终保证渲染的`HTML`文档的一致性。对于选区的表达，则需要根据`DOM`选区来不断`normalize`选区`Model`。

这也就是我们今天要聊的`MVC`模型架构，我们组织编辑器项目是通过`monorepo`的形式来管理的相关包，这样就自然而然地可以形成分层的架构。不过在此之前，我们可以在`HTML`文件中实现最基准的编辑器 [simple-mvc.html](https://github.com/WindRunnerMax/BlockKit/blob/master/examples/simple-mvc.html)，当然我们还是实现最基本的加粗能力，主要关注点在于整个流程的控制。而针对输入的能力则是更加复杂的问题，我们暂时就不处理了，这部分需要单独开章节来叙述。

### 数据模型
首先我们需要定义数据模型，这里的数据模型需要有两部分，一部分是描述文档内容的节点，另一部分是针对数据结构的操作。首先来看描述文档的内容，我们仍然以扁平的数据结构来描述内容，此外为了简单描述`DOM`结构，此处不会存在多级的`DOM`嵌套。

```js
let model = [
  { type: "strong", text: "123", start: 0, len: 3 },
  { type: "span", text: "123123", start: 3, len: 6 },
];
```

在上述的数据中，`type`即为节点类型，`text`则为文本内容。而数据模型仅是描述数据结构还不够，我们还需要额外增加状态来描述位置信息，也就是上述数据中的`start`和`len`，这部分数据对于我们计算选区变换很有用。

因此数据模型这部分不仅仅是数据，更应该被称作为状态。接下来则是针对数据结构的操作，也就是说针对数据模型的插入、删除、修改等操作。在这里我们简单定义了数据截取的操作，而完整的`compose`操作则可以参考 [delta.ts](https://github.com/WindRunnerMax/BlockKit/blob/fae5a/packages/delta/src/delta/delta.ts#L255)。

截取数据的操作是执行`compose`操作的基础，当我们存在原文和变更描述时，需要分别将其转换为迭代器对象来截取数据，以此来构造新的数据模型。这里的迭代器部分先定义了`peekLength`和`hasNext`两个方法，用于判断当前数据是否存在剩余可取得的部分，以及是否可继续迭代。

```js
peekLength() {
  if (this.data[this.index]) {
    return this.data[this.index].text.length - this.offset;
  } else {
    return Infinity;
  }
}

hasNext() {
  return this.peekLength() < Infinity;
}
```

`next`方法的处理方式要复杂一些，这里我们的目标主要就是取`text`的部分内容。注意我们每次调用`next`是不会跨节点的，也就是说每次`next`最多取当前`index`的节点所存储的`insert`长度。因为如果取的内容超过了单个`op`的长度，理论上其对应属性是不一致的，所以不能直接合并。

调用`next`方法时，如果不存在`length`参数，则默认为`Infinity`。然后我们取当前`index`的节点，计算出当前节点的剩余长度，如果取`length`大于剩余长度，则取剩余长度，否则取希望取得的`length`长度。然后根据`offset`和`length`来截取`text`内容。

```js
next(length) {
  if (!length) length = Infinity;
  const nextOp = this.data[this.index];
  if (nextOp) {
    const offset = this.offset;
    const opLength = nextOp.text.length;
    const restLength = opLength - offset;
    if (length >= restLength) {
      length = restLength;
      this.index = this.index + 1;
      this.offset = 0;
    } else {
      this.offset = this.offset + length;
    }
    const newOp = { ...nextOp };
    newOp.text = newOp.text.slice(offset, offset + length);
    return newOp;
  }
  return null;
}
```

以此我们简单定义了描述数据模型的状态，以及可以用来截取数据结构的迭代器。这部分是描述数据结构内容以及变更的基础，当然在这里我们精简了非常多的内容，因此看起来比较简单。实际上这里还有非常复杂的实现，例如如何实现`immutable`来减少重复渲染保证性能。

### 视图层
视图层主要负责渲染数据模型，这部分我们是可以使用`React`来渲染的，只不过在这个简单例子中，我们可以直接全量创建`DOM`即可。因此在这里我们直接遍历数据模型，根据节点类型来创建对应的`DOM`节点，然后将其插入到`contenteditable`的`div`中。

```js
const render = () => {
  container.innerHTML = "";
  for (const data of model) {
    const node = document.createElement(data.type);
    node.setAttribute("data-leaf", "true");
    node.textContent = data.text;
    container.appendChild(node);
    MODEL_TO_DOM.set(data, node);
    DOM_TO_MODEL.set(node, data);
  }
  editor.updateDOMselection();
};
```

这里我们还额外增加了`data-leaf`属性，以便于标记叶子结点。我们的选区更新是需要标记叶子结点，以便于能够正确计算选区需要落在某个`DOM`节点上。而`MODEL_TO_DOM`和`DOM_TO_MODEL`则是用来维护`Model`与`DOM`的映射关系，因为我们需要根据`DOM`和`MODEL`来相互获取对应值。

以此我们定义了非常简单的视图层，示例中我们不需要考虑太多的性能问题。但是在`React`真正完成视图层的时候，由于非受控的`ContentEditable`的表现，我们就需要考虑非常多的问题，例如`key`值的维护、脏`DOM`的检查、减少重复渲染、批量调度刷新、选区修正等等。

### 控制器
控制器则是我们的架构中最复杂的部分，这里存在了大量的逻辑处理。我们的编辑器控制器模型需要在数据结构和视图层的基础上实现，因此我们就在最后将其叙述，恰好在这里的`MVC`模型顺序的最后即是`Controller`。在控制器层，总结起来最主要的功能就是同步，即同步数据模型和视图层的状态。

举个例子，我们的视图层是基于数据模型来渲染的，假如此时我们在某个节点上输入了内容，那么我们需要将输入的内容同步到数据模型中。而如果此时我们没有正确同步数据模型，那么选区的长度计算就会出现问题，这种情况下自然还会导致选区的索引同步出现问题，这里还要区分受控和非受控问题。

那么首先我们需要关注选区的同步，选区是编辑器操作的基础，选中的状态则是操作的基准位置。同步的本质实现则是需要用浏览器的`API`来同步到数据模型中，浏览器的选区存在`selectionchange`事件，通过这个事件我们可以关注到选区的变化，此时便可以获取最新的选区信息。

通过`window.getSelection`方法我们可以获取到当前选区的信息，然后通过`getRangeAt`就可以拿到选区的`Range`对象，我们自然就可以通过`Range`对象来获取选区的开始和结束位置。有了选区的起始和结束位置，我们就可以通过先前设置的映射关系来取的对应的位置。

```js
document.addEventListener("selectionchange", () => {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const { startContainer, endContainer, startOffset, endOffset } = range;
  const startLeaf = startContainer.parentElement.closest("[data-leaf]");
  const endLeaf = endContainer.parentElement.closest("[data-leaf]");
  const startModel = DOM_TO_MODEL.get(startLeaf);
  const endModel = DOM_TO_MODEL.get(endLeaf);
  const start = startModel.start + startOffset;
  const end = endModel.start + endOffset;
  editor.setSelection({ start, len: end - start });
  editor.updateDOMselection();
});
```

这里通过选区节点获取对应的`DOM`节点并不一定是我们需要的节点，浏览器的选区位置规则对我们的模型来说是不确定的，因此我们需要根据选区节点来查找目标的叶子节点。举个例子，普通的文本选中情况下选区是在文本节点上的，三击选中则是在整个行`DOM`节点上的。

因此这里的`closest`只是处理最普通的文本节点选区，复杂的情况还需要进行`normalize`操作。而`DOM_TO_MODEL`则是状态映射，获取到最近的`[data-leaf]`节点就是为了拿到对应的状态，当获取到最新选区位置之后，是需要更新`DOM`的实际选区位置的，相当于校正了浏览器本身的选区状态。

`updateDOMselection`方法则是完全相反的操作，上述的事件处理是通过`DOM`选区更新`Model`选区，而`updateDOMselection`则是通过`Model`选区更新`DOM`选区。那么此时我们是只有`start/len`，基于这两个数字的到对应的`DOM`并不是简单的事情，此时我们需要查找`DOM`节点。

```js
const leaves = Array.from(container.querySelectorAll("[data-leaf]"));
```

这里同样会存在不少的`DOM`查找，因此实际的操作中也需要尽可能地减少选择的范围，在我们实际的设计中，则是以行为基准查找`span`类型的节点。紧接着就需要遍历整个`leaves`数组，然后继续通过`DOM_TO_MODEL`来获取`DOM`对应的状态，然后来获取构造`range`需要的节点和偏移。

```js
const { start, len } = editor.selection;
const end = start + len;
for (const leaf of leaves) {
  const data = DOM_TO_MODEL.get(leaf);
  const leafStart = data.start;
  const leafLen = data.text.length;
  if (start >= leafStart && start <= leafStart + leafLen) {
    startLeaf = leaf;
    startLeafOffset = start - leafStart;
    // 折叠选区状态下可以 start 与 end 一致
    if (windowSelection.isCollapsed) {
      endLeaf = startLeaf;
      endLeafOffset = startLeafOffset;
      break;
    }
  }
  if (end >= leafStart && end <= leafStart + leafLen) {
    endLeaf = leaf;
    endLeafOffset = end - leafStart;
    break;
  }
}
```

当查找到目标的`DOM`节点之后，我们那就可以构造出`modelRange`，并且将其设置为浏览器选区。但是需要注意的是，我们需要在此处检查当前选区是否与原本的选区相同，设想一下如果再次设置选区，那么就会触发`SelectionChange`事件，这样就会导致无限循环，自然是需要避免此问题。

```js
if (windowSelection.rangeCount > 0) {
  range = windowSelection.getRangeAt(0);
  // 当前选区与 Model 选区相同, 则不需要更新
  if (
    range.startContainer === modelRange.startContainer &&
    range.startOffset === modelRange.startOffset &&
    range.endContainer === modelRange.endContainer &&
    range.endOffset === modelRange.endOffset
  ) {
    return void 0;
  }
}
windowSelection.setBaseAndExtent(
  startLeaf.firstChild,
  startLeafOffset,
  endLeaf.firstChild,
  endLeafOffset
);
```

实际上选区的问题不比输入法的问题少，在这里我们就是非常简单地实现了浏览器选区与我们模型选区的同步，核心仍然是状态的同步。接下来就可以实现数据模型的同步，在这里也就是我们实际执行命令的实现，而不是直接使用`document.execCommand`。

此时我们先前定义的数据迭代器就派上用场了，我们操作的目标也是需要使用`range`来实现，例如`123123`这段文本在`start: 3, len: 2`的选区，以及`strong`的类型，在这区间内的数据类型就会变成`123[12 strong]3`，这也就是将长数据进行裁剪的操作。

我们首先根据需要操作的选区来构造`retain`数组，虽然这部分描述本身应该构造`ops`来操作，然而这里就需要更多的补充`compose`的实现，因此这里我们只使用一个数组和索引来标识了。

```js
let retain = [start, len, Infinity];
let retainIndex = 0;
```

然后则需要定义迭代器和`retain`来合并数据，这里我们的操作是`0`索引来移动指针以及截取索引内的数据，`1`索引来实际变化类型的`type`，`2`索引我们将其固定为`Infinity`，在这种情况下我们是取剩余的所有数据。这里重要的`length`则是取两者较短的值，以此来实现数据的截取。

```js
const iterator = new Iterator(model);
while (iterator.hasNext()) {
  const length = Math.min(iterator.peekLength(), retain[retainIndex]);
  const isApplyAttrs = retainIndex === 1;
  const thisOp = iterator.next(length);
  const nextRetain = retain[retainIndex] - length;
  retain[retainIndex] = nextRetain;
  if (retain[retainIndex] === 0) {
    retainIndex = retainIndex + 1;
  }
  if (!thisOp) break;
  isApplyAttrs && (thisOp.type = type);
  newModel.push(thisOp);
}
```

在最后，还记得我们维护的数据不仅是数据表达，更是描述整个数据的状态。因此最后我们还需要将所有的数据刷新一遍，以此来保证最后的数据模型正确，此时还需要调用`render`来重新渲染视图层，然后重新刷新浏览器选区。

```js
let index = 0;
for (const data of newModel) {
  data.start = index;
  data.len = data.text.length;
  index = index + data.text.length;
}
render();
editor.updateDOMselection();
```

以此我们定义了相对复杂的控制器层，这里的控制器层主要是同步数据模型和视图层的状态，以及实现了最基本的命令操作，当然没有处理很多复杂的边界情况。在实际的编辑器实现中，这部分逻辑会非常复杂，因为我们需要处理非常多的问题，例如输入法、选区模型、剪贴板等等。

## 项目架构设计
那么我们基本编辑器`MVC`模型已经实现，因此自然而然就可以将其抽象为独立的`package`，恰好我们也是通过`monorepo`的形式来管理项目的。因此在这里就可以将其抽象为`core`、`delta`、`react`、`utils`四个核心包，分别对应编辑器的核心逻辑、数据模型、视图层、工具函数。而具体的编辑器模块实现，则全部以插件的形式定义在`plugin`包中。

### Core
`core`模块封装了编辑器的核心逻辑，包括剪贴板模块、历史操作模块、输入模块、选区模块、状态模块等等，所有的模块通过实例化的`editor`对象引用。这里除了本身分层的逻辑实现外，还希望实现模块的扩展能力，可以通过引用编辑器模块并且扩展能力后，可以重新装载到编辑器上。

```
Core
 ├── clipboard
 ├── collect
 ├── editor
 ├── event
 ├── history
 ├── input
 ├── model
 ├── perform
 ├── plugin
 ├── rect
 ├── ref
 ├── schema
 ├── selection
 ├── state
 └── ...
```

实际上`core`模块中存在本身的依赖关系，例如选区模块依赖于事件模块的事件分发，这主要是由于模块在构造时需要依赖其他模块的实例，以此来初始化本身的数据和事件等。因此事件实例化的顺序会比较重要，但是我们在实际聊下来的时候则直接按上述定义顺序，并未按照直接依赖的有向图顺序。



### Delta

```
Delta
 ├── attributes
 ├── delta
 ├── mutate
 └── ...
```

### React

```
React
 ├── hooks
 ├── model
 ├── plugin
 ├── preset
 └── ...
```

### Utils

```
Utils
 ├── debounce.ts
 ├── decorator.ts
 ├── dom.ts
 └── ...
```

## 每日一题

- <https://github.com/WindRunnerMax/EveryDay>

## 参考

- <https://www.oschina.net/translate/why-contenteditable-is-terrible>
