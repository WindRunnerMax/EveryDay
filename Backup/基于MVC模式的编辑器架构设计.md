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
视图层主要负责渲染数据模型，

### 控制器

## 项目架构设计

### Delta

### Core

### React

### Utils

## 每日一题

- <https://github.com/WindRunnerMax/EveryDay>

## 参考

- <https://www.oschina.net/translate/why-contenteditable-is-terrible>
