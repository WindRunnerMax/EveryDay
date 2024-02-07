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

写入文档内容

虚拟图层


实际上想要做好整个能力还是比较复杂的，特别是有很多边界`case`需要处理，完整的`DEMO`如下所示，也可以直接打开`https://codesandbox.io/p/sandbox/quill-diff-view-369jt6`。 

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>quill-diff</title>
    <link
      href="https://cdn.quilljs.com/1.3.6/quill.snow.css"
      rel="stylesheet"
    />
    <style>
      body,
      html {
        margin: 0;
        padding: 0;
        height: 100%;
        overflow: hidden;
      }
      .container {
        display: flex;
        height: calc(100% - 43px);
      }
      .container > div {
        width: 50%;
        margin: 5px;
      }
      .ql-editor {
        padding: 5px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div><div id="prev"></div></div>
      <div><div id="next"></div></div>
    </div>
    <script src="https://cdn.quilljs.com/1.3.6/quill.js"></script>
    <script
      src="https://lf9-cdn-tos.bytecdntp.com/cdn/expire-1-y/lodash.js/4.17.21/lodash.min.js"
      type="application/javascript"
    ></script>
    <script>
      const prevEditorDOM = document.getElementById("prev");
      const nextEditorDOM = document.getElementById("next");
      const prev = new Quill(prevEditorDOM, { theme: "snow" });
      prev.setContents([
        // 设置内容
        { insert: "insert\ncontent\nheading line" },
        { insert: "\n", attributes: { header: 1 } },
        { insert: "end\n" },
      ]);
      window.prev = prev;
      const next = new Quill(nextEditorDOM, { theme: "snow" });
      next.setContents([
        // 设置内容
        { insert: "content", attributes: { italic: true } },
        { insert: "\nformat " },
        { insert: "bold", attributes: { bold: true } },
        { insert: "\nheading line\nend\n\n" },
      ]);
      window.next = next;
      // 创建`VirtualLayer`图层`DOM`
      const deleteRangeDOM = document.createElement("div");
      deleteRangeDOM.className = "ql-range diff-delete";
      const insertRangeDOM = document.createElement("div");
      insertRangeDOM.className = "ql-range diff-insert";
      const retainRangeDOM = document.createElement("div");
      retainRangeDOM.className = "ql-range diff-retain";
      prevEditorDOM.appendChild(deleteRangeDOM);
      nextEditorDOM.appendChild(insertRangeDOM);
      nextEditorDOM.appendChild(retainRangeDOM);
      // 在`VirtualLayer`图层中渲染内容
      const buildLayerDOM = (editor, dom, ranges, color) => {
        dom.innerText = ""; // 清理`DOM`
        ranges.forEach((range) => {
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
            head.style.marginLeft = startRect.left + "px";
            head.style.height = startRect.height + "px";
            head.style.width = endRect.right - startRect.left + "px";
            head.style.backgroundColor = color;
          } else if (endRect.top - startRect.bottom < startRect.height) {
            head.style.marginLeft = startRect.left + "px";
            head.style.height = startRect.height + "px";
            head.style.width = startRect.width - startRect.left + "px";
            head.style.backgroundColor = color;
            body.style.height = endRect.top - startRect.bottom + "px";
            tail.style.width = endRect.right + "px";
            tail.style.height = endRect.height + "px";
            tail.style.backgroundColor = color;
          } else {
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
          block.appendChild(head);
          block.appendChild(body);
          block.appendChild(tail);
          dom.appendChild(block);
        });
      };
      // `diff`计算
      const diffDelta = () => {
        const prevContent = prev.getContents();
        const nextContent = next.getContents();
        // 按行计算索引位置
        const buildLines = (content) => {
          const text = content.ops.map((op) => op.insert || "").join("");
          let index = 0;
          const lines = text.split("\n").map((str) => {
            const length = str.length + 1;
            const line = { start: index, length };
            index = index + length;
            return line;
          });
          return (index, length, ignoreLineMarker = true) => {
            const ranges = [];
            let traceLength = length;
            // 可以用二分搜索优化
            for (const line of lines) {
              if (length === 1 && index + length === line.start + line.length) {
                if (ignoreLineMarker) break;
                // 行标识符
                const payload = { index: line.start, length: line.length - 1 };
                !ignoreLineMarker && payload.length > 0 && ranges.push(payload);
                break;
              }
              // 迭代行 通过行索引构造`Range`
              if (
                index < line.start + line.length &&
                line.start <= index + traceLength
              ) {
                const nextIndex = Math.max(line.start, index);
                const nextLength = Math.min(
                  traceLength,
                  line.length - 1,
                  line.start + line.length - nextIndex
                );
                traceLength = traceLength - nextLength;
                const payload = { index: nextIndex, length: nextLength };
                if (nextIndex + nextLength === line.start + line.length) {
                  // 边界`\n`的情况
                  payload.length--;
                }
                payload.length > 0 && ranges.push(payload);
              } else if (line.start > index + length || traceLength <= 0) {
                break;
              }
            }
            return ranges;
          };
        };
        // 构造基本数据
        const toPrevRanges = buildLines(prevContent);
        const toNextRanges = buildLines(nextContent);
        const diff = prevContent.diff(nextContent);
        const inserts = [];
        const retains = [];
        const deletes = [];
        let prevIndex = 0;
        let nextIndex = 0;
        // console.log("diff.ops :>> ", diff.ops);
        // 迭代`diff`结果并进行转换
        for (const op of diff.ops) {
          if (op.delete !== undefined) {
            deletes.push(...toPrevRanges(prevIndex, op.delete));
            prevIndex = prevIndex + op.delete;
          } else if (op.retain !== undefined) {
            if (op.attributes) {
              retains.push(...toNextRanges(nextIndex, op.retain, false));
            }
            prevIndex = prevIndex + op.retain;
            nextIndex = nextIndex + op.retain;
          } else if (op.insert !== undefined) {
            inserts.push(...toNextRanges(nextIndex, op.insert.length));
            nextIndex = nextIndex + op.insert.length;
          }
        }
        // console.log("op - results :>> ", inserts, deletes, retains);
        // 根据转换的结果渲染`DOM`
        buildLayerDOM(prev, deleteRangeDOM, deletes, "rgba(245, 63, 63, 0.3)");
        buildLayerDOM(next, insertRangeDOM, inserts, "rgba(0, 180, 42, 0.3)");
        buildLayerDOM(next, retainRangeDOM, retains, "rgba(114, 46, 209, 0.3)");
      };
      // `diff`渲染时机
      prev.on("text-change", _.debounce(diffDelta, 300));
      next.on("text-change", _.debounce(diffDelta, 300));
      window.onload = diffDelta;
    </script>
  </body>
</html>
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://quilljs.com/docs/api/
https://www.npmjs.com/package/quill-delta
https://github.com/quilljs/quill/issues/1125
```
