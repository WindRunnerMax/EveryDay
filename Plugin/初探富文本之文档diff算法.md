# 初探富文本之文档diff算法
当我们实现在线文档的系统时，通常需要考虑到文档的版本控制与审核能力，并且这是这是整个文档管理流程中的重要环节，那么在这个环节中通常就需要文档的`diff`能力，这样我们就可以知道文档的变更情况，例如文档草稿与线上文档的差异、私有化版本`A`与版本`B`之间的差异等等，本文就以`Quill`富文本编辑器引擎为基础，探讨文档`diff`算法的实现。

## 描述
`Quill`是一个现代富文本编辑器，具备良好的兼容性及强大的可扩展性，还提供了部分开箱即用的功能。`Quill`是在`2012`年开源的，`Quill`的出现给富文本编辑器带了很多新的东西，也是目前开源编辑器里面受众非常大的一款编辑器，至今为止的生态已经非常的丰富，可以在`GitHub`等找到大量的示例，包括比较完善的协同实现。

我们首先可以思考一个问题，如果我们描述一段普通文本的话，那么大概直接输入就可以了，比如这篇文章本身底层数据结构就是纯文本，而内容格式实际上是由编译器通过词法和语法编译出来的，可以将其理解为序列化和反序列化，而对于富文本编辑器来说，如果在编辑的时候如果高频地进行序列话和反序列化，那么性能消耗是不能接受的，所以数据结构就需要尽可能是易于读写的例如`JSON`对象，那么用`JSON`来描述富文本的方式也可以多种多样，但归根结底就是需要在部分文字上挂载额外的属性，例如`A`加粗`B`斜体的话，就是在`A`上挂载`bold`属性，在`B`上挂载`italic`属性，这样的数据结构就可以描述出富文本的内容。

对于我们今天要聊的`Quill`来说，其数据结构描述是`quill-delta`，这个数据结构的设计非常棒，并且`quill-delta`同样也可以是富文本`OT`协同算法的实现，不过我们在这里不涉及协同的内容，而我们实际上要关注的`diff`能力更多的是数据结构层面的内容，也就是说我们`diff`的实际上是数据，那么在`quill-delta`中这样*一段文本*的**数据结构**如下所示。当然`quill-delta`的表达可以非常丰富，通过`retain`、`insert`、`delete`操作可以完成对于整个文档的内容描述增删改的能力，我们在后边实现对比视图功能的时候会涉及这部分`Op`。

```javascript
{
  ops: [
    { insert: "那么在" },
    { insert: "quill-delta", attributes: { inlineCode: true } },
    { insert: "中这样" },
    { insert: "一段文本", attributes: { italic: true } },
    { insert: "的" },
    { insert: "数据结构", attributes: { bold: true } },
    { insert: "如下所示。\\n" },
  ],
};
```

看到这个数据结构我们也许会想这不就是一个普通的`JSON`嘛，那么我们直接进行`JSON`的`diff`是不是就可以了，毕竟现在有很多现成的`JSON`算法可以用，这个方法对于纯`insert`的文本内容理论上可行的只是粒度不太够，没有办法精确到具体某个字的修改，也就是说依照`quill-delta`的设计想从`A`依照`diff`的结果构造`delta`进行`compose`生成到`B`这件事并不那么轻松，是需要再进行一次转换的。例如下面的`JSON`，我们`diff`的结果是删除了`insert: 1`，添加了`"insert": "12",  "attributes": { "bold": true }`，而我们实际上作出的变更是对`1`的样式添加了`bold`，并且添加了`2`附带`bold`，那么想要将这个`diff`结果应用到`A`上生成`B`需要做两件事，一是更精细化的内容修改，二是将`diff`的结果转换为`delta`，所以我们需要设计更好的`diff`算法，尽可能减少整个过程的复杂度。

```js
// A
[
  { "insert": "1" }
]

// B
[
  {
    "insert": "12",
    "attributes": { "bold": true } 
  }
]
```

## diff-delta
在这里我们的目标是希望实现更细粒度的`diff`，并且可以直接构造`delta`并且应用，也就是`A.apply(diff(a, b)) = B`，实际上在`quill-delta`中是存在已经实现好的`diff`算法，在这里我们只是将其精简了一些非`insert`的操作以便于理解，需要注意的是在这里我们讨论的是非协同模式下的`diff`，如果是已经实现`OT`的文档编辑器可以直接从历史记录中取出相关的版本`Op`进行`compose + invert`即可，并不是必须要进行文档全文的`diff`算法。

完整`DEMO`可以直接在`https://codesandbox.io/p/devbox/z9l5sl`中打开控制台查看，在前边我们提到了使用`JSON`进行`diff`后续还需要两步处理数据，特别是对于粒度的处理看起来更加费劲，那么针对粒度这个问题上不如我们换个角度思考，我们现在的是要处理富文本，而富文本就是带属性的文本，那么我们是不是就可以采用`diff`文本的算法，然后针对属性值进行额外的处理即可，这样就可以将粒度处理得很细，理论上这种方式看起来是可行的，我们可以继续沿着这个思路继续探索下去。

首先是纯文本的`diff`算法，那么我们可以先简单了解下`diff-match-patch`使用的的`diff`算法，该算法通常被认为是最好的通用`diff`算法，是由`Eugene W. Myers`设计的`https://neil.fraser.name/writing/diff/myers.pdf`，其算法本身在本文就不展开了。由于`diff-match-patch`本身还存在`match`与`patch`能力，而我们将要用到的算法实际上只需要`diff`的能力，那么我们只需要使用`fast-diff`就可以了，其将匹配和补丁以及所有额外的差异选项都移除，只留下最基本的`diff`能力，其`diff`的结果是一个二维数组`[FLAG, CONTENT][]`。

```js
// diff.INSERT === 1;
// diff.EQUAL === 0;
// diff.DELETE === -1;
const origin = "Hello World";
const target = "Hello Diff";
console.log(fastDiff(origin, target)); // [[0, "Hello "], [-1, "World"], [1, "Diff"]]
```

那么我们接下来就需要构造字符串了，`quill-delta`的数据格式在上边以及提到过了，那么构造起来也很简单了，并且我们需要先构造一个`Delta`对象来承载我们对于`delta`的`diff`结果。

```js
export const diffOps = (ops1: Op[], ops2: Op[]) => {
  const group = [ops1, ops2].map((delta) =>
    delta.map((op) => op.insert).join(""),
  );
  const result = diff(group[0], group[1]);

  const target = new Delta();
  const iter1 = new Iterator(ops1);
  const iter2 = new Iterator(ops2);
  // ...
}
```

这其中的`Iterator`是我们接下来要进行迭代取块结构的迭代器，我们可以试想一下，因为我们`diff`的结果是`N`个字的内容，而我们的`Delta`中`insert`块也是`N`个字，在`diff`之后就需要对这两个字符串的子字符串进行处理，所以我们需要对整个`Delta`取`N`个字的子字符串迭代处理，这部分数据处理方法我们就封装在`Iterator`对象当中，我们需要先来整体看一下整代器的处理方法。

```js
export class Iterator {
  // 存储`delta`中所有`ops`
  ops: Op[];
  // 当前要处理的`ops index`
  index: number;
  // 当前`insert`字符串偏移量
  offset: number;

  constructor(ops: Op[]) {
    this.ops = ops;
    this.index = 0;
    this.offset = 0;
  }

  hasNext(): boolean {
    // 通过剩余可处理长度来判断是否可以继续处理
    return this.peekLength() < Infinity;
  }

  next(length?: number): Op {
    // ...
  }

  peek(): Op {
    // 取的当前要处理的`op`
    return this.ops[this.index];
  }

  peekLength(): number {
    if (this.ops[this.index]) {
      // 返回当前`op`剩余可以迭代的`insert`长度
      // 这里如果我们的索引管理正确 则永远不应该返回`0`
      return Op.length(this.ops[this.index]) - this.offset;
    } else {
      // 返回最大值
      return Infinity;
    }
  }
}
```

这其中`next`方法的处理方式要复杂一些，在`next`方法中我们的目标主要就是取`insert`的部分内容，注意我们每次调用`insert`是不会跨`op`的，也就是说每次`next`最多取当前`index`的`op`所存储的`insert`长度，因为如果取的内容超过了单个`op`的长度，其`attributes`的对应属性是不一致的，所以不能直接合并，那么此时我们就需要考虑到如果`diff`的结果比`insert`长的情况，也就是是需要将`attributes`这部分兼容，其实就是将`diff`结果同样分块处理。

```js
next(length?: number): Op {
  if (!length) {
    // 这里并不是不符合规则的数据要跳过迭代
    // 而是需要将当前`index`的`op insert`迭代完
    length = Infinity;
  }
  // 这里命名为`nextOp`实际指向的还是当前`index`的`op`
  const nextOp = this.ops[this.index];
  if (nextOp) {
    // 暂存当前要处理的`insert`偏移量
    const offset = this.offset;
    // 我们是纯文档表达的`InsertOp` 所以就是`insert`字符串的长度
    const opLength = Op.length(nextOp);
    // 这里表示将要取`next`的长度要比当前`insert`剩余的长度要长
    if (length >= opLength - offset) {
      // 处理剩余所有的`insert`的长度
      length = opLength - offset;
      // 此时需要迭代到下一个`op`
      this.index += 1;
      // 重置`insert`索引偏移量
      this.offset = 0;
    } else {
      // 处理传入的`length`长度的`insert`
      this.offset += length;
    }
    // 这里是当前`op`携带的属性
    const retOp: Op = {};
    if (nextOp.attributes) {
      // 如果存在的话 需要将其一并放置于`retOp`中
      retOp.attributes = nextOp.attributes;
    }
    // 通过之前暂存的`offset`以及计算的`length`截取`insert`字符串并构造`retOp`
    retOp.insert = (nextOp.insert as string).substr(offset, length);
    // 返回`retOp`
    return retOp;
  } else {
    // 如果`index`已经超出了`ops`的长度则返回空`insert`
    return { insert: "" };
  }
}
```

当前我们已经可以通过`Iterator`更细粒度地截取`op`的`insert`部分，接下来我们就回到我们对于`diff`的处理上，首先我们先来看看`attributes`的`diff`，简单来看我们假设目前的数据结构就是`Record<string, string>`，这样的话我们可以直接比较两个`attributes`即可，`diff`的本质上是`a`经过一定计算使其可以变成`b`，这部分的计算就是`diff`的结果即`a + diff = b`，所以我们可以直接将全量的`key`迭代一下，如果两个`attrs`的值不相同则通过判断`b`的值来赋给目标`attrs`即可。

```js
export const diffAttributes = (
  a: AttributeMap = {},
  b: AttributeMap = {},
): AttributeMap | undefined => {
  if (typeof a !== "object") a = {};
  if (typeof b !== "object") b = {};
  const attributes = Object.keys(a)
    .concat(Object.keys(b))
    .reduce<AttributeMap>((attrs, key) => {
      if (a[key] !== b[key]) {
        attrs[key] = b[key] === undefined ? "" : b[key];
      }
      return attrs;
    }, {});
  return Object.keys(attributes).length > 0 ? attributes : undefined;
};
```

因为前边我们实际上已经拆的比较细了，所以最后的环节并不会很复杂，我们的目标是构造`a + diff = b`中`diff`的部分，所以在构造`diff`的过程中要应用的目标是`a`，我们需要带着这个目的去看整个流程，否则容易不理解对于`delta`的操作。在`diff`的整体流程中我们主要有三部分需要处理，分别是`iter1`、`iter2`、`text diff`，而我们需要根据`diff`出的类型分别处理，整体遵循的原则就是取其中较小长度作为块处理，在`diff.INSERT`的部分是从`iter2`的`insert`置入`delta`，在`diff.DELETE`部分是从`iter1`取`delete`的长度应用到`delta`，在`diff.EQUAL`的部分我们需要从`iter1`和`iter2`分别取得`op`来处理`attributes`的`diff`或`op`兜底替换。

```js
// `diff`的结果 使用`delta`描述
const target = new Delta();
const iter1 = new Iterator(ops1);
const iter2 = new Iterator(ops2);

// 迭代`diff`结果
result.forEach((item) => {
  let op1: Op;
  let op2: Op;
  // 取出当前`diff`块的类型和内容
  const [type, content] = item;
  // 当前`diff`块长度
  let length = content.length; 
  while (length > 0) {
    // 本次循环将要处理的长度
    let opLength = 0; 
    switch (type) {
      // 标识为插入的内容
      case diff.INSERT: 
        // 取 `iter2`当前`op`剩下可以处理的长度 `diff`块还未处理的长度 中的较小值
        opLength = Math.min(iter2.peekLength(), length); 
        // 取出`opLength`长度的`op`并置入目标`delta` `iter2`移动`offset/index`指针
        target.push(iter2.next(opLength));
        break;
      // 标识为删除的内容
      case diff.DELETE: 
        // 取 `diff`块还未处理的长度 `iter1`当前`op`剩下可以处理的长度 中的较小值
        opLength = Math.min(length, iter1.peekLength());
        // `iter1`移动`offset/index`指针
        iter1.next(opLength);
        // 目标`delta`需要得到要删除的长度
        target.delete(opLength);
        break;
      // 标识为相同的内容
      case diff.EQUAL:
        // 取 `diff`块还未处理的长度 `iter1`当前`op`剩下可以处理的长度 `iter2`当前`op`剩下可以处理的长度 中的较小值
        opLength = Math.min(iter1.peekLength(), iter2.peekLength(), length);
        // 取出`opLength`长度的`op1` `iter1`移动`offset/index`指针
        op1 = iter1.next(opLength);
        // 取出`opLength`长度的`op2` `iter2`移动`offset/index`指针
        op2 = iter2.next(opLength);
        // 如果两个`op`的`insert`相同
        if (op1.insert === op2.insert) {
          // 直接将`opLength`长度的`attributes diff`置入
          target.retain(
            opLength,
            diffAttributes(op1.attributes, op2.attributes),
          );
        } else {
          // 直接将`op2`置入目标`delta`并删除`op1` 兜底策略
          target.push(op2).delete(opLength);
        }
        break;
      default:
        break;
    }
    // 当前`diff`块剩余长度 = 当前`diff`块长度 - 本次循环处理的长度
    length = length - opLength; 
  }
});
// 去掉尾部的空`retain`
return target.chop();
```

在这里我们可以举个例子来看一下`diff`的效果，具体效果可以从`https://codesandbox.io/p/devbox/z9l5sl`的`src/index.ts`中打开控制台看到效果，主要是演示了对于`DELETE EQUAL INSERT`的三种`diff`类型以及生成的`delta`结果，在此处是`ops1 + result = ops2`。

```js
const ops1: Op[] = [{ insert: "1234567890\n" }];
const ops2: Op[] = [
  { attributes: { bold: "true" }, insert: "45678" },
  { insert: "90123\n" },
];
const result = diffOps(ops1, ops2);
console.log(result);

// 1234567890 4567890123
// DELETE:-1 EQUAL:0 INSERT:1
// [[-1,"123"], [0,"4567890"], [1,"123"], [0,"\n"]]
// [
//   { delete: 3 }, // DELETE 123 
//   { retain: 5, attributes: { bold: "true" } }, // BOLD 45678
//   { retain: 2 }, // RETAIN 90 
//   { insert: "123" } // INSERT 123 
// ];
```

## 对比视图
现在我们的文档`diff`算法已经有了，接下来我们就需要切入正题，思考如何将其应用到具体的文档上。我们可以先从简单的方式开始，试想一下我们现在是对文档`A`与`B`进行了`diff`得到了`patch`，那么我们就可以直接对`diff`进行修改，构造成我们想要的结构，然后将其应用到`A`中就可以得到对比视图了，当然我们也可以`A`视图中应用删除内容，`B`视图中应用增加内容，这个方式我们在后边会继续聊到。目前我们是想在`A`中直接得到对比视图，其实对比视图无非就是红色高亮表示删除，绿色高亮表示新增，而富文本本身可以直接携带格式，那么我们就可以直接借助于富文本能力来实现高亮功能。

依照这个思路实现的核心算法非常简单，在这里我们先不处理对于格式的修改，通过将`DELETE`的内容换成`RETAIN`并且附带红色的`attributes`，在`INSERT`的类型上加入绿色的`attributes`，并且将修改后的这部分`patch`组装到`A`的`delta`上，然后将整个`delta`应用到新的对比视图当中就可以了，完整`DEMO`可以参考`https://codepen.io/percipient24/pen/eEBOjG`。

```js
const findDiff = () => {
  const oldContent = quillLeft.getContents();
  const newContent = quillRight.getContents();
  const diff = oldContent.diff(newContent);
  for (let i = 0; i < diff.ops.length; i++) {
    const op = diff.ops[i];
    if (op.insert) {
      op.attributes = { background: "#cce8cc", color: "#003700" };
    }
    if (op.delete) {
      op.retain = op.delete;
      delete op.delete;
      op.attributes = { background: "#e8cccc", color: "#370000",  };
    }
  }
  const adjusted = oldContent.compose(diff);
  quillDiff.setContents(adjusted);
}
```

可以看到这里的核心代码就这么几行，通过简单的解决方案实现复杂的需求当然是极好的，在场景不复杂的情况下可以实现同一文档区域内对比，或者同样也可以使用两个视图分别应用删除和新增的`delta`。那么问题来了，如果场景复杂起来，需要我们在右侧表示新增的视图中可以实时编辑并且展示`diff`结果的时候，这样的话将`diff-delta`直接应用到文档可能会增加一些问题，除了不断应用`delta`到富文本可能造成的性能问题，在有协同的场景下还需要处理本地的`Ops`以及`History`，非协同的场景下就需要过滤相关的`key`避免`diff`结果落库。

如果说上述的场景只是在基本功能上提出的进阶能力，那么在搜索/查找的场景下，直接将高亮应用到富文本内容上似乎并不是一个可行的选择，试想一下如果我们直接将在数据层面上搜索出的内容应用到富文本上来实现高亮，我们就需要承受上边提到的所有问题，频繁地更改内容造成的性能损耗也是我们不能接受的。在`slate`中存在`decorate`的概念，可以通过构造`Range`来消费`attributes`但不会改变文档内容，这就很符合我们的需求。所以我们同样需要一种能够在不修改富文本内容的情况下高亮部分内容，但是我们又不容易像`slate`一样在编辑器底层渲染时实现这个能力，那么其实我们可以换个思路，我们直接在相关位置上加入一个半透明的高亮蒙层就可以了，这样看起来就简单很多了，在这里我们将之称为虚拟图层。

理论上实现虚拟图层很简单无非是加一层`DOM`而已，但是这其中有很多细节需要考虑。首先我们考虑一个问题，如果我们将蒙层放在富文本正上方，也就是`z-index`是高于富文本层级的话，如果此时我们点击蒙层，富文本会直接失去焦点，固然我们可以使用`event.preventDefault`来阻止焦点转移的默认行为，但是其他的行为例如点击事件等等同样会造成类似的问题，例如此时富文本中某个按钮的点击行为是用户自定义的，我们遮挡住按钮之后点击事件会被应用到我们的蒙层上，而蒙层并不会是嵌套在按钮之中的不会触发冒泡的行为，所以此时按钮的点击事件是不会触发的，这样并不符合我们的预期。那么我们转变一个思路，如果我们将`z-index`调整到低于富文本层级的话，事件的问题是可以解决的，但是又造成了新的问题，如果此时富文本的内容本身是带有背景色的，此时我们再加入蒙层，那么我们蒙层的颜色是会被原本的背景色遮挡的，而因为我们的富文本能力通常是插件化的，我们不能控制用户实现的背景色插件
必须要带一个透明度，我们的蒙层也需要是一个通用的能力，所以这个方案也有局限性。其实解决这个问题的方法很简单，在`CSS`中有一个名为`pointer-events`的属性，当将其值设置为`none`时元素永远不会成为鼠标事件的目标，这样我们就可以解决方案一造成的问题，由此实现比较我们最基本的虚拟图层样式与事件处理，此外使用这个属性会有一个比较有意思的现象，右击蒙层在控制台中是无法直接检查到节点的，必须通过`Elements`面板才能选中`DOM`节点而不能反选。

```html
<div style="pointer-events: none;"></div>
<!-- 
  无法直接`inspect`相关元素 可以直接使用`DOM`操作来查找调试
  [...document.querySelectorAll("*")].filter(node => node.style.pointerEvents === "none"); 
-->
```

在确定绘制蒙层图形的方法之后，紧接着我们就需要确认绘制图形的位置信息。因为我们的富文本绘制的`DOM`节点并不是每个字符都带有独立的节点，而是有相同`attributes`的`ops`节点是相同的`DOM`节点，那么此时问题又来了，我们的`diff`结果大概率不是某个`DOM`的完整节点，而是其中的某几个字，此时想获取这几个字的位置信息是不能直接用`Element.getBoundingClientRect`拿到了，我们需要借助`document.createRange`来构造`range`，在这里需要注意的是我们处理的是`Text`节点，只有`Text`等节点可以设置偏移量，并且`start`与`end`的`node`可以直接构造选区，并不需要保持一致。当然`Quill`中通过`editor.getBounds`提供了位置信息的获取，我们可以直接使用其获取位置信息即可，其本质上也是通过`editor.scroll`获取实际`DOM`并封装了`document.createRange`实现，以及处理了各种边缘`case`。

```js
const el = document.querySelector("xxx");
const textNode = el.firstChild;

const range = document.createRange();
range.setStart(textNode, 0);
range.setEnd(textNode, 2);

const rect = range.getBoundingClientRect();
console.log(rect);
```

接下来我们还需要探讨一个问题，`diff`的时候我们不能够确定当前的结果的长度，在之前已经明确我们是对纯文本实现的`diff`，那么`diff`的结果可能会很长，那么这个很长就有可能出现问题。我们直接通过`editor.getBounds(index, length)`得到的是`rect`即`rectangle`，这个`Range`覆盖的范围是矩形，当我们的`diff`结果只有几个字的时候，直接获取`rect`是没问题的，而如果我们的`diff`结果比较长的时候，就会出现两个获取位置时需要关注的问题：一个是单行内容过长，在编辑器中一行是无法完整显示，由此出现了折行的情况；另一个是内容本身就是跨行的，也就是说`diff`结果是含有`\n`时的情况。

```
|  这里只有一行内容内容内容内容内容 |
|内容内容内容内容内容内容内容内容内 |
|内容内容内容内容。              |

|  这里有多行内容内容内容。       |
|  这里有多行内容内容内容内容。    |
|  这里有多行内容内容内容内容内容。 |
```

在这里假设上边的内容就是`diff`出的结果，至于究竟是`INSERT/DELETE/RETAIN`的类型我们暂时不作关注，我们当前的目标是实现高亮，那么在这两种情况下，如果直接通过`getBounds`获取的`rect`矩形范围作高亮的话，很明显是会有大量的非文本内容即空白区域被高亮的，在这里我们的表现会是会取的最大范围的高亮覆盖，实际上如果只是空白区域覆盖我们还是可以接受的，但是试想一个情况，如果我们只是其中部分内容做了更改，例如第`N`行是完整的插入内容，在`N+1`行的行首同样插入了一个字，此时由于我们`N+1`行的`width`被第`N`行影响，导致我们的高亮覆盖了整个行，此时我们的`diff`高亮结果是不准确的，无论是折行还是跨行的情况下都存在这样的情况，这样的表现就是不能接受的了。

那么接下来我们就需要解决这两个问题，对于跨行位置计算的问题，在这里可以采取较为简单的思路，我们只需要明确地知道究竟在哪里出现了行的分割，在此处需要将`diff`的结果进行分割，也就是我们处理的粒度从文档级别变化到了行级别。只不过在`Quill`中并没有直接提供基于行`Range`级别的操作，所以我们需要自行维护行级别的`index-length`，在这里我们简单地通过`delta insert`来全量分割`index-length`，在这里同样也可以`editor.scroll.lines`来计算，当文档内容改变时我们同样也可以基于`delta-changes`维护索引值。此外如果我们的管理方式是通过多`Quill`实例来实现`Blocks`的话，这样就是天然的`Line`级别管理，维护索引的能力实现起来会简单很多，只不过`diff`的时候就需要一个`Block`树级别的`diff`实现，如果是同`id`的`Block`进行`diff`还好，但是如果有跨`Block`进行`diff`的需求实现可能会更加复杂。

```js
const buildLines = (content) => {
  const text = content.ops.map((op) => op.insert || "").join("");
  let index = 0;
  const lines = text.split("\n").map((str) => {
    // 需要注意我们的`length`是包含了`\n`的
    const length = str.length + 1;
    const line = { start: index, length };
    index = index + length;
    return line;
  });
  return lines;
}
```

当我们有行的`index-length`索引分割之后，接下来就是将原来的完整`diff-index-length`分割成`Line`级别的内容，在这里需要注意的是行标识节点也就是`\n`的`attributes`需要特殊处理，因为这个节点的所有修改都是直接应用到整个行上的，例如当某行从二级标题变成一级标题时就需要将整个行都高亮标记为样式变更，当然本身标题可能也会存在内容增删，这部分高亮是可以叠加不同颜色显示的，这也是我们需要维护行粒度`Range`的原因之一。

```js
return (index, length, ignoreLineMarker = true) => {
  const ranges = [];
  // 跟踪
  let traceLength = length;
  // 可以用二分搜索查找索引首尾 `body`则直接取`lines` 查找结果则需要增加`line`标识
  for (const line of lines) {
    // 当前处理的节点只有`\n`的情况 标识为行尾并且有独立的`attributes`
    if (length === 1 && index + length === line.start + line.length) {
      // 如果忽略行标识则直接结束查找
      if (ignoreLineMarker) break;
      // 需要构造整个行内容的`range`
      const payload = { index: line.start, length: line.length - 1 };
      !ignoreLineMarker && payload.length > 0 && ranges.push(payload);
      break;
    }
    // 迭代行 通过行索引构造`range`
    // 判断当前是否还存在需要分割的内容 需要保证剩余`range`在`line`的范围内
    if (
      index < line.start + line.length &&
      line.start <= index + traceLength
    ) {
      const nextIndex = Math.max(line.start, index);
      // 需要比较 追踪长度/行长度/剩余行长度
      const nextLength = Math.min(
        traceLength,
        line.length - 1,
        line.start + line.length - nextIndex
      );
      traceLength = traceLength - nextLength;
      // 构造行内`range`
      const payload = { index: nextIndex, length: nextLength };
      if (nextIndex + nextLength === line.start + line.length) {
        // 需要排除边界恰好为`\n`的情况
        payload.length--;
      }
      payload.length > 0 && ranges.push(payload);
    } else if (line.start > index + length || traceLength <= 0) {
      // 当前行已经超出范围或者追踪长度已经为`0` 则直接结束查找
      break;
    }
  }
  return ranges;
};
```

那么紧接着我们需要解决下一个问题，对于单行内容较长引起折行的问题，因为在上边我们已经将`diff`结果按行粒度划分好了，所以我们可以主要关注于如何渲染高亮的问题上。在前边我们提到过了，我们不能直接将调用`getBounds`得到的`rect`直接绘制到文本上，那么我们仔细思考一下，一段文本实际上是不是可以拆为三段，即首行`head`、内容`body`、尾行`tail`，也就是说只有行首与行尾才会出现部分高亮的墙狂，这里就需要单独计算`rect`，而`body`部分必然是完整的`rect`，直接将其渲染到相关位置就可以了。那么依照这个理论我们就可以用三个`rect`来表示单行内容的高亮就足够了，而实际上`getBounds`返回的数据是足够支撑我们分三段处理单行内容的，我们只需要取得首`head`尾`tail`的`rect`，`body`部分的`rect`可以直接根据这两个`rect`计算出来，我们还是需要根据实际的折行数量分别讨论的，如果是只有单行的情况，那么只需要`head`就足够了，如果是两行的情况那么就需要借助`head`和`tail`来渲染了，`body`在这里起到了占位的作用，如果是多行的时候，那么就需要`head`、`body`、`tail`渲染各自的内容，来保证图层的完整性。

```js
// 获取边界位置
const startRect = editor.getBounds(range.index, 0);
const endRect = editor.getBounds(range.index + range.length, 0);
// 单行的块容器
const block = document.createElement("div");
block.style.position = "absolute";
block.style.width = "100%";
block.style.height = "0";
block.style.top = startRect.top + "px";
block.style.pointerEvents = "none";
const head = document.createElement("div");
const body = document.createElement("div");
const tail = document.createElement("div");
// 依据不同情况渲染
if (startRect.top === endRect.top) {
  // 单行(非折行)的情况 `head`
  head.style.marginLeft = startRect.left + "px";
  head.style.height = startRect.height + "px";
  head.style.width = endRect.right - startRect.left + "px";
  head.style.backgroundColor = color;
} else if (endRect.top - startRect.bottom < startRect.height) {
  // 两行(折单次)的情况 `head + tail` `body`占位
  head.style.marginLeft = startRect.left + "px";
  head.style.height = startRect.height + "px";
  head.style.width = startRect.width - startRect.left + "px";
  head.style.backgroundColor = color;
  body.style.height = endRect.top - startRect.bottom + "px";
  tail.style.width = endRect.right + "px";
  tail.style.height = endRect.height + "px";
  tail.style.backgroundColor = color;
} else {
  // 多行(折多次)的情况 `head + body + tail`
  head.style.marginLeft = startRect.left + "px";
  head.style.height = startRect.height + "px";
  head.style.width = startRect.width - startRect.left + "px";
  head.style.backgroundColor = color;
  body.style.width = "100%";
  body.style.height = endRect.top - startRect.bottom + "px";
  body.style.backgroundColor = color;
  tail.style.marginLeft = 0;
  tail.style.height = endRect.height + "px";
  tail.style.width = endRect.right + "px";
  tail.style.backgroundColor = color;
}
```

解决了上述两个问题之后，我们就可以将`delta`应用到`diff`算法获取结果，并且将其按行划分构造出新的`Range`，在这里我们想要实现的是左视图体现`DELETE`内容，右视图体现`INSERT + RETAIN`的内容，在这里我们只需要根据`diff`的不同类型，分别将构造出的`Range`存储到不同的数组中，最后在根据`Range`借助`editor.getBounds`获取位置信息，构造新的图层`DOM`在相关位置实现高亮即可。

```js
const diffDelta = () => {
  const prevContent = prev.getContents();
  const nextContent = next.getContents();
  // ...
  // 构造基本数据
  const toPrevRanges = buildLines(prevContent);
  const toNextRanges = buildLines(nextContent);
  const diff = prevContent.diff(nextContent);
  const inserts = [];
  const retains = [];
  const deletes = [];
  let prevIndex = 0;
  let nextIndex = 0;
  // 迭代`diff`结果并进行转换
  for (const op of diff.ops) {
    if (op.delete !== undefined) {
      // `DELETE`的内容需要置于左视图 红色高亮
      deletes.push(...toPrevRanges(prevIndex, op.delete));
      prevIndex = prevIndex + op.delete;
    } else if (op.retain !== undefined) {
      if (op.attributes) {
        // `RETAIN`的内容需要置于右视图 紫色高亮
        retains.push(...toNextRanges(nextIndex, op.retain, false));
      }
      prevIndex = prevIndex + op.retain;
      nextIndex = nextIndex + op.retain;
    } else if (op.insert !== undefined) {
      // `INSERT`的内容需要置于右视图 绿色高亮
      inserts.push(...toNextRanges(nextIndex, op.insert.length));
      nextIndex = nextIndex + op.insert.length;
    }
  }
  // 根据转换的结果渲染`DOM`
  buildLayerDOM(prev, deleteRangeDOM, deletes, "rgba(245, 63, 63, 0.3)");
  buildLayerDOM(next, insertRangeDOM, inserts, "rgba(0, 180, 42, 0.3)");
  buildLayerDOM(next, retainRangeDOM, retains, "rgba(114, 46, 209, 0.3)");
};
// `diff`渲染时机
prev.on("text-change", _.debounce(diffDelta, 300));
next.on("text-change", _.debounce(diffDelta, 300));
window.onload = diffDelta;
```

总结一下整体的流程，实现基于虚拟图层的`diff`我们需要 `diff`算法、构造`Range`、计算`Rect`、渲染`DOM`，实际上想要做好整个能力还是比较复杂的，特别是有很多边界`case`需要处理，例如某些文字应用了不同字体或者一些样式，导致渲染高度跟普通文本不一样，而`diff`的边缘又恰好落在了此处就可能会造成我们的`rect`计算出现问题，从而导致渲染图层节点的样式出现问题。在这里我们还是没有处理类似的问题，只是将整个流程打通，没有特别关注于边缘`case`，完整的`DEMO`可以直接访问`https://codesandbox.io/p/sandbox/quill-diff-view-369jt6`查看。 

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://quilljs.com/docs/api/
https://zhuanlan.zhihu.com/p/370480813
https://www.npmjs.com/package/quill-delta
https://github.com/quilljs/quill/issues/1125
https://developer.mozilla.org/zh-CN/docs/Web/API/Range
https://developer.mozilla.org/zh-CN/docs/Web/API/Document/createRange
```
