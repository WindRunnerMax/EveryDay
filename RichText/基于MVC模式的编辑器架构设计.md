# 基于MVC模式的编辑器架构设计
在先前的规划中我们是需要实现`MVC`架构的编辑器，将应用程序分为控制器、模型、视图三个核心组件，通过控制器执行命令时会修改当前的数据模型，进而表现到视图的渲染上。简单来说就是构建一个描述文档结构与内容的数据模型，并且使用自定义的`execCommand`对数据描述模型进行修改。以此实现的`L1`级富文本编辑器，通过抽离数据模型，解决了富文本中脏数据、复杂功能难以实现的问题。

- 开源地址: <https://github.com/WindRunnerMax/BlockKit>
- 在线编辑: <https://windrunnermax.github.io/BlockKit/>
- 项目笔记: <https://github.com/WindRunnerMax/BlockKit/blob/master/NOTE.md>

从零实现富文本编辑器项目的相关文章:

- [深感一无所长，准备试着从零开始写个富文本编辑器]()
- [从零实现富文本编辑器-基于MVC模式的编辑器架构设计]()

## 精简的编辑器
在整套系统架构的设计中，最重要的核心理念便是**状态同步**，如果以状态模型为基准，那么我们需要维护的状态同步就可以归纳为下面的两方面:

- 将用户操作状态同步到状态模型中，当用户操作文本状态时，例如用户的选区操作、输入操作、删除操作等，需要将变更操作到状态模型中。
- 将状态模型状态同步到视图层中，当在控制层中执行命令时，需要将经过变更后生成的新状态模型同步到视图层中，保证数据状态与视图的一致。

其实这两个状态同步是个正向依赖的过程，用户操作形成的状态同步到状态模型，状态模型的变更同步到视图层，视图层则又是用户操作的基础。举个例子，当用户通过拖拽选择部分文本时，需要将其选中的范围同步到状态模型。当此时执行删除操作时，需要将数据中的这部分文本删除，之后再刷新视图的到新的`DOM`结构。下次循环就需要继续保证状态的同步，然后执行输入、刷新视图等操作。

由此我们的目标主要是状态同步，虽然看起来仅有简单的两个原则，但是这件事做起来并没有那么简单。当我们执行状态同步时，是非常依赖浏览器的相关`API`的，例如选区、输入、键盘等事件。然而此时我们必须要处理浏览器的相关问题，例如截止目前`ContentEditable`无法真正阻止`IME`的输入，`EditContext`的兼容性也还有待提升，这些都是我们需要处理的问题。

实际上当我们用到了越多的浏览器`API`实现，我们就需要考虑越多的浏览器兼容性问题。因此富文本编辑器的实现才会出现很多非`ContentEditable`的实现，例如如钉钉文档的自绘选区、`Google Doc`的`Canvas`文档绘制等。但是这样虽然能够降低部分浏览器`API`的依赖，但是也无法真正完全脱离浏览器的实现，因此即使是`Canvas`绘制的文档，也必须要依赖浏览器的`API`来实现输入、位置计算等等。

回到我们的精简编辑器模型，先前的文章已经提到了`ContentEditable`属性以及`execCommand`命令，通过`document.execCommand`来执行命令修改`HTML`的方案虽然简单，但是很明显其可控性比较差。`execCommand`命令的行为在各个浏览器的表现是不一致的，这也是之前我们提到的浏览器兼容行为的一种，然而这些行为我们也没有任何办法去控制，这都是其默认的行为。

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
`Core`模块封装了编辑器的核心逻辑，包括剪贴板模块、历史操作模块、输入模块、选区模块、状态模块等等，所有的模块通过实例化的`editor`对象引用。这里除了本身分层的逻辑实现外，还希望能够实现模块的扩展能力，可以通过引用编辑器模块并且扩展能力后，可以重新装载到编辑器上。

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

实际上`Core`模块中存在本身的依赖关系，例如选区模块依赖于事件模块的事件分发，这主要是由于模块在构造时需要依赖其他模块的实例，以此来初始化本身的数据和事件等。因此事件实例化的顺序会比较重要，但是我们在实际聊下来的时候则直接按上述定义顺序，并未按照直接依赖的有向图顺序。

`clipboard`模块主要负责数据的序列化与反序列化，以及剪贴板的操作。通常来说，富文本编辑器的`DOM`结构并没有那么的规范，举个例子，在`slate`中我们可以看到诸如`data-slate-node`、`data-slate-leaf`等节点属性，我们可以将其理解为模版结构。

```html
<p data-slate-node="element">
  <span data-slate-node="text">
    <span data-slate-leaf="true">
      <span data-slate-string="true">text</span>
    </span>
  </span>
</p>
```

那么我们通过`react`来构建视图层自然也会存在这样的模版结构，因此在序列化的过程中就是需要将这部分复杂的结构序列化为相对规范的`HTML`。特别是很多样式我们并不是使用规范的语义标签，而是通过`style`属性来实现的，因此将其规整化是非常重要的。

反序列化则将`HTML`转换为编辑器的数据模型，这部分实现则是为了跨编辑器的内容粘贴。编辑器内建的数据结构通常都不一致，因此跨编辑器就需要较为规范的中间结构。这其实也是编辑器中不成文的规定，`A`编辑器序列化的时候尽可能规范，`B`编辑器反序列化才可以更好地处理。

`collect`模块是可以根据选区数据来得到相关的数据，举个例子，当用户选中了一段文本，执行复制的时候就需要将选中的这部分数据内容取出来，然后才能进行序列化操作。此外，`collect`模块还可以取得某个位置的`op`节点、`marks`继承处理等等。

`editor`模块是编辑器的模块聚合类，其本身主要是管理整个编辑器的生命周期，例如实例化、挂载`DOM`、销毁等状态。此模块需要组合所有的模块，并且还需要关注模块的有向图组织依赖关系，主要的编辑器`API`都应该从此模块暴露出来。

`event`模块是事件分发模块，原生事件的绑定都是在该模块中实现，编辑器内所有的事件都应该从该模块来分发。这种方式可以有更高度的自定义空间，例如扩展插件级别的事件执行，并且可以减少内存泄漏的概率，毕竟只要我们能够保证编辑器的销毁方法调用，那么所有的事件都可以被正确卸载。

`history`模块是维护历史操作的模块，在编辑器中实现`undo`和`redo`是比较复杂的，我们需要基于原子化的操作执行，而不是存储编辑器的全量数据快照，并且需要维护两个栈来处理数据转移。此外我们还需要在此基础上实现扩展，例如自动组合、操作合并、协同处理等。

这里的自动组合指的是用户进行高频连续操作时，我们需要将其合并为一个操作。操作合并则是指我们可以通过`API`来实现合并，例如用户上传图片后，执行了其他输入操作，然后上传成功后产生的操作，最后这个操作应该合并到上传图片的这个操作上。协同处理则是需要遵循一个原则，即我们仅能撤销属于自己的操作，而不能撤销其他人协同过来的操作。

`input`模块是处理输入的模块，输入是编辑器的核心操作之一，我们需要处理输入法、键盘、鼠标等输入操作。输入法的交互处理是需要非常多的兼容处理，例如输入法还存在候选词、联想词、快捷输入、重音等等。甚至是移动端的输入法兼容更麻烦，在`draft`中还单独列出了移动端输入法的兼容问题。

举个目前比较常见的例子，`ContentEditable`无法真正阻止`IME`的输入，这就导致了我们无法真正阻止中文的输入。在下面的这个例子中，输入英文和数字是不会有响应的，但是中文却是可以正常输入的，这也是很多编辑器选择自绘选区和输入的原因之一，例如`VSCode`、钉钉文档等。

```html
<div contenteditable id="$1"></div>
<script>
  const stop = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  $1.addEventListener('beforeinput', stop);
  $1.addEventListener('input', stop);
  $1.addEventListener('keydown', stop);
  $1.addEventListener('keypress', stop);
  $1.addEventListener('keyup', stop);
  $1.addEventListener('compositionstart', stop);
  $1.addEventListener('compositionupdate', stop);
  $1.addEventListener('compositionend', stop);
</script>
```

`model`模块是用来映射`DOM`视图和状态模型的关系，这部分是视图层和数据模型的桥梁，在很多时候我们需要通过`DOM`来获取状态模型，同样也会需要通过状态模型在获取对应的`DOM`视图。这部分就是利用`WeakMap`来维护映射，以此来实现状态的同步。

`perform`模块是封装了针对数据模型执行变更的基础模块，由于构造基本的`delta`操作会比较复杂，例如执行属性`marks`的变更，是需要过滤掉`\n`的这个`op`，反过来对行属性的操作则是需要过滤掉普通文本`op`。因此需要封装这部分操作，来简化执行变更的成本。

`plugin`模块实现了编辑器的插件化机制，插件化是非常有必要的，理论上而言普通文本外的所有格式都应该由插件来实现。那么这里的插件化主要是提供了基础的插件定义和类型，管理了插件的生命周期，以及诸如按方法调用分组、方法调度优先级等能力。

`rect`模块是用来处理编辑器的位置信息，在很多时候我们需要根据`DOM`节点来计算位置，并且需要提供节点在编辑器的相对位置，特别是很多附加能力中，例如虚拟滚动的视口锁定、对比视图的虚拟图层、评论能力的高度定位等等。此外，选区的位置信息也是很重要的，例如浮动工具栏的弹出位置。

`ref`模块是实现了编辑器的位置转移引用，这部门其实是利用了协同的`transform`来处理的索引信息，类似于`slate`的`PathRef`。举个例子，当用户上传图片后，此时可能会进行其他的内容插入操作，此时图片的索引值会发生变化，而使用`ref`模块则可以拿到最新的索引值。

`schema`模块是用来定义编辑器的数据应用规则，我们需要在此处定义数据属性需要处理的方法，例如加粗的属性`marks`需要在输入后继续继承加粗属性，而行内代码`inline`类型则不需要继续继承，类似于图片、分割线则需要被定义为独占整行的`Void`类型，`Mention`、`Emoji`等则需要被定义为`Embed`类型。

`selection`模块是用来处理选区的模块，选区是编辑器的核心操作基准，我们需要处理选区同步、选区校正等等。实际上选区的同步是非常复杂的事情，从浏览器的`DOM`映射到选区模型本身就是需要精心设计的事情，而选区的校正则是需要处理非常多的边界情况。

在先前我们也提到了相关的问题，以下面的`DOM`结构为例，如果我们要表达选区折叠在`4`这个字符左侧时，同样会出现多种表达可以实现这个位置，这实际上就会很依赖浏览器的默认行为。因此这样就需要我们自己来保证这个选区的映射，以及在非常规状态下的校正逻辑。

```js
// <span>123</span><b><em>456</em></b><span>789</span>
{ node: 123, offset: 3 }
{ node: <em></em>, offset: 0 }
{ node: <b></b>, offset: 0 }
```

`state`模块维护了编辑器的核心状态，在实例化编辑器时传递基本数据后，我们后续维护的内容就变成了状态，而不是最开始传递的数据内容。我们的状态变更方法同样会在此处实现，特别是`Immutable/Key`的状态维护，我们需要保证状态的不可变性，以此来减少重复渲染。

```
                             |-- LeafState
             |-- LineState --|-- LeafState
             |               |-- LeafState            
BlockState --|
             |               |-- LeafState
             |-- LineState --|-- LeafState
                             |-- LeafState
```

### Delta
`Delta`模块封装了编辑器的数据模型，我们需要基于数据模型来描述编辑器的内容，以及编辑器内容的变更。除此之外，还封装了数据模型的诸多操作，例如`compose`、`transform`、`invert`、`diff`、`Iterator`等等。

```
Delta
 ├── attributes
 ├── delta
 ├── mutate
 ├── utils
 └── ...
```

这里的`Delta`实现是基于`Quill`的数据模型改造的，`Quill`的数据模型设计非常优秀，特别是封装了基于`OT`的操作变换等方法。但是设计上还是存在不方便的地方，因此参考了`EtherPad`的数据实现，在此基础上改造了部分实现，我们后续会详细讲述数据结构设计。

此外需要注意的是，我们的`Delta`实现最主要的是用来描述文档以及变更，相当于一种序列化和反序列化的实现。上边也提到了在初始化编辑器之后，我们维护的数据就变成了内建的状态，而非最初初始化的数据内容。因此很多方法在控制器层面上，都会有单独的设计，例如`immutable`的状态维护。

`attributes`模块维护了针对文本描述属性的操作，我们在这里简化了属性的实现，即`AttributeMap`类型定义了为`<string, string>`的类型。而具体的模块中则定义了`compose`、`invert`、`transform`、`diff`等方法，以此来实现属性的合并、反转、变换、差异等操作。

`delta`模块实现了整个编辑器的数据模型，`delta`通过`ops`实现了线形结构的数据模型。`ops`的结构主要包括三种操作，`insert`用来描述插入文本、`delete`用来描述删除文本、`retain`用来描述保留文本/移动指针，以及在此基础上的`compose`、`transform`等等方法。

`mutate`模块则实现了`immutable`的`delta`模块实现，并且独立了`\n`作为独立的`op`。最初的控制器设计实现是基于数据变更实现的，后续将其改造为原始状态的维护，因此这部分实现移动到了`delta`模块中，因此这部分可以直接对应编辑器的状态维护，可以用于单元测试等等。

`utils`模块则封装了对于`op`以及`delta`的辅助方法，`clone`的相关方法实现了诸如`op`、`delta`等深拷贝以及对等方法，当然由于我们新的设计则无需引入`lodash`的相关方法。此外还实现了一些数据的判断以及格式化方法，例如数据的起始/结束字符串判断、分割`\n`的方法等等。

### React
`React`模块实现了视图层的适配器，提供了基本的`Text`、`Void`、`Embed`等类型的节点，以及相关的渲染模式，相当于封装了符合`Core`模式的调度范式。并且还提供了相关包装的`HOC`节点，以及`Hooks`等方法，以此来实现插件的视图层扩展。

```
React
 ├── hooks
 ├── model
 ├── plugin
 ├── preset
 └── ...
```

`hooks`模块实现了获取编辑器实例的方法，方便在`React`组件中获取编辑器实例，当然这依赖于我们的`Provider`组件。此外还实现了`readonly`的状态方法，这里的只读状态维护本身是维护在插件中的，但是后来将其提取到了`React`组件中，这样能更容易切换编辑/只读状态。

`model`模块实现了编辑器内建的数据模型，实际上是对应了`Core`层的`State`，即`Block/Line/Leaf`的数据模型，这其中除了`DOM`节点需要遵循的模式外，还实现了诸如脏`DOM`检测的方式等。此外这里还存在了特殊的`EOL`节点，是个特殊的`LeafModel`，会根据策略调度行尾节点的渲染。

`plugin`模块实现了编辑器的插件化机制，这里的插件化主要是扩展了基础的插件定义和类型，例如在`Core`中定义的插件方法类型返回值是`any`，在这里我们需要将其定义为具体的`ReactNode`类型。此外，这里还实现了渲染时的插件，即没有在核心层维护状态的类型，主要是`Wrap`类型的节点插件化。

`preset`模块预设了编辑器对外暴露的`API`组件，诸如编辑器的`Context`、`Void`、`Embed`、`Editable`组件等等，主要是提供构建编辑器视图的基础组件，以及插件层的组件扩展等。当然还封装了很多交互实现，例如自动聚焦、选区同步、视图刷新适配器等等。

### Utils
`Utils`模块实现了诸多通用的工具函数，主要是处理编辑器内的通用逻辑，例如防抖、节流等等，也有处理`DOM`结构的辅助方法，还有事件分发的处理方法、事件绑定的装饰器等，以及诸如列表的操作、国际化、剪贴板操作等等。

```
Utils
 ├── debounce.ts
 ├── decorator.ts
 ├── dom.ts
 └── ...
```

## 总结
在这里我们实现了简单的编辑器`MVC`架构示例，然后在此基础上自然而然地抽象出了编辑器的核心模块、数据模型、视图层、工具函数等，并且将其做了简单的叙述。在后续我们会描述编辑器的数据模型设计，介绍我们的`Delta`数据结构方法，以及在编辑器中的相关应用场景。数据结构是非常重要的设计，因为编辑器的核心操作都是基于数据模型的，若不能够理解数据结构的设计，则会导致难以理解编辑器的很多操作模型。

## 每日一题

- <https://github.com/WindRunnerMax/EveryDay>

## 参考

- <https://developer.mozilla.org/en-US/docs/Web/API/EditContext>
- <https://www.oschina.net/translate/why-contenteditable-is-terrible>
- <https://stackoverflow.com/questions/78268797/how-to-prevent-ime-input-method-editor-to-mutate-the-contenteditable-element>
