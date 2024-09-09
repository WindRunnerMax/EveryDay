# Canvas图形编辑器-数据结构与History(undo/redo)
这是作为 [掘金老给我推Canvas，于是我也学习Canvas做了个简历编辑器](https://juejin.cn/post/7329799331216015395) 的后续内容，主要是介绍了对数据结构的设计以及`History`能力的实现。

* 在线编辑: https://windrunnermax.github.io/CanvasEditor
* 开源地址: https://github.com/WindrunnerMax/CanvasEditor

关于`Canvas`简历编辑器项目的相关文章:

* [掘金老给我推Canvas，我也学习Canvas做了个简历编辑器](https://juejin.cn/post/7329799331216015395)
* [Canvas图形编辑器-数据结构与History(undo/redo)](https://juejin.cn/post/7331575219957366836)
* [Canvas图形编辑器-我的剪贴板里究竟有什么数据](https://juejin.cn/post/7331992322233024548)
* [Canvas简历编辑器-图形绘制与状态管理(轻量级DOM)](https://juejin.cn/spost/7354986873733333055)
* [Canvas简历编辑器-Monorepo+Rspack工程实践](https://juejin.cn/spost/7357349281885503500)
* [Canvas简历编辑器-层级渲染与事件管理能力设计](https://juejin.cn/spost/7376197082203684873)

## 描述
对于编辑器而言，`History`也就是`undo`和`redo`是必不可少的能力，实现历史记录的方法通常有两种:

1. 存储全量快照，也就是说我我们每进行一个操作,都需要将全量的数据通常也就是`JSON`格式的数据存到一个数组里，如果用户此时触发了`redo`就将全量的数据取出应用到`Editor`对象当中。这种实现方式的优点是简单，不需要过多的设计，缺点就是一旦操作的多了就容易炸内存。

2. 基于`Op`的实现，`Op`就是对于一个操作的原子化记录，举个例子如果将图形`A`向右移动`3px`，那么这个`Op`就可以是`type: "MOVE", offset: [3, 0]`，那么如果想要做回退操作依然很简单，只需要将其反向操作即`type: "MOVE", offset: [-3, 0]`就可以了，这种方式的优点是粒度更细，存储压力小，缺点是需要复杂的设计以及计算。

既然我们是从零开始设计一个编辑器，那么大概率是不会采用方案`1`的，我们更希望能够设计原子化的`Op`来实现`History`，所以从这个方向开始我们就需要先设计数据结构。

## 数据结构
我特别推荐大家去看一下 [quill-delta](https://www.npmjs.com/package/quill-delta/v/4.2.2) 的数据结构设计，这个数据结构的设计非常棒，其可以用来描述一篇富文本，同时也可以用来构建`change`对富文本做完整的增删改操作，对于数据的`compose`、`invert`、`diff`等操作也一应俱全，而且`quill-delta`也可以是富文本`OT`协同算法的实现，这其中的设计还是非常牛逼的。

其实我之前也没有设计过数据结构，更不用谈设计`Op`去实现历史记录功能了，所以我在设计数据结构的时候是抓耳挠腮、寝食难安，想设计出 `quill-delta` 这种级别的数据描述几乎是不可能了，所以只能依照我的想法来简单地设计，这其中有很多不完善的地方后边可能还会有所改动。

因为之前也没有接触过`Canvas`，所以我的主要目标是学习，所以我希望任何的实现都以尽可能简单的方向走。那么在这里我认为任何元素都是矩形，因为绘制矩阵是比较简单的，所以图形元素基类的`x, y, width, height`属性是确定的，再加上还有层级结构，那么就再加一个`z`，此外由于需要标识图形，所以还需要给其设置一个`id`。

```js
class Delta {
  public readonly id: string;
  protected x: number;
  protected y: number;
  protected z: number;
  protected width: number;
  protected height: number;
}
```

因为我想做一个插件化的实现，也就是说所有的图形都应该继承这个类，那么这个自定义的函数体肯定是需要存储自己的数据，所以在这里加一个`attrs`属性，又因为想简单实现整个功能，所以这个数据类型就被定义为`Record<string, string>`。因为是插件化的，每个图形的绘制应该由子类来实现，所以需要定义绘制函数的抽象方法，于是一个数据结构就这么设计好了，关于插件化的设计我们后续可以再继续聊。

```js
abstract class Delta {
  public readonly id: string;
  protected x: number;
  protected y: number;
  protected z: number;
  protected width: number;
  protected height: number;
  public attrs: DeltaAttributes;
  public abstract drawing: (ctx: CanvasRenderingContext2D) => void;
}
```

那么现在已经有了基本的数据结构，我们可以设想一下究竟应该有哪几种操作，经过考虑大概无非是 插入`INSERT`、删除`DELETE`、移动`MOVE`、调整大小`RESIZE`、修改属性`REVISE`，这五个`Op`就可以覆盖我们对于当前编辑器图形的所有操作了，所以我们后续的设计都要围绕着这五个操作来进行。

看起来其实并不难，但实际上想要将其设计好并不容易，因为我们目标是`History`所以我们不光要顾及正向的操作，还需要设计好`invert`也就是反向操作，依旧以之前的`MOVE`操作举例，我们移动一个元素可以使用`MOVE(3, 0)`，反向操作就可以直接生成也就是`MOVE(3, 0).invert = MOVE(-3, 0)`，那么`RESIZE`操作呢，尤其是在多选操作时的`RESIZE`，我们需要想办法让其能够实现`invert`操作，一种方法是记录每个点的移动距离，但是这样对于每个`Op`存储的信息有点过多，我们在构造一个正向的`Op`时也需要将相关的数据拉到`Op`中，同样对于`REVISE`而言我们需要将属性的前值和后值都放在`Op`中才可以继续执行。

那么如何比较好的解决这个问题呢，很明显如果我们想用轻量的数据来承载内容，那么先前的数据在不一定会使用的情况下我们是没必要存储的，那是不是可以自动提取相关的内容作为`invert-op`呢，当然是可以的，我们可以在进行`invert`的时候，将未操作前的`Delta`一并作为参数传入就好了，我们可以来验证一下，我们的函数签名将会是`Op.invert(Delta) = Op'`。

```js
// Prev DeltaSet
[{id: "xxx", x: x1, y: y1, width: w1, height: h1}]
// ResizeOp
RESIZE({id: "xxx", x: x2, y: y2})
// Next DeltaSet
[{id: "xxx", x: x1 + x2, y: y1 + y2, width: w1, height: w1}]
// Invert InsertOp
RESIZE({id: "xxx", x: -x2, y: -y2})

// Prev DeltaSet
[{id: "xxx", x: x1, y: y1, width: w1, height: h1}]
// ResizeOp
RESIZE({id: "xxx", x: x2, y: y2, width: w2, height: h2})
// Next DeltaSet
[{id: "xxx", x: x2, y: y2, width: w2, height: h2}]
// Invert InsertOp
RESIZE({id: "xxx", x: x1, y: y1, width: w1, height: h1})
```

看起来是没有问题的，所以我们现在可以设计全量的`Op`和`Invert`方法了，在这里因为我最开始是预计要设计组合也就是将几个图形组合在一起操作的能力，所以还预留了一个`parentId`作为后期开发拓展用，但是暂时是用不上的所以这个字段暂时可以忽略。下面的`Invert`实际上就是`case by case`地进行转换，`INSERT -> DELETE`、`DELETE -> INSERT`、`MOVE -> MOVE`、`RESIZE -> RESIZE`、`REVISE -> REVISE`。这其中的`DeltaSet`可以理解为当前的所有`Delta`数据，类型签名类似于`Record<string, Delta>`，是扁平的结构，便于数据查找。

```js
export type OpPayload = {
  [OP_TYPE.INSERT]: { delta: Delta; parentId: string };
  [OP_TYPE.DELETE]: { id: string; parentId: string };
  [OP_TYPE.MOVE]: { ids: string[]; x: number; y: number };
  [OP_TYPE.RESIZE]: { id: string; x: number; y: number; width: number; height: number };
  [OP_TYPE.REVISE]: { id: string; attrs: DeltaAttributes };
};

export class Op<T extends OpType> {
  public readonly type: T;
  public readonly payload: OpPayload[T];
  constructor(type: T, payload: OpPayload[T]) {
    this.type = type;
    this.payload = payload;
  }

  public invert(prev: DeltaSet) {
    switch (this.type) {
      case OP_TYPE.INSERT: {
        const payload = this.payload as OpPayload[typeof OP_TYPE.INSERT];
        const { delta, parentId } = payload;
        return new Op(OP_TYPE.DELETE, { id: delta.id, parentId });
      }
      case OP_TYPE.DELETE: {
        const payload = this.payload as OpPayload[typeof OP_TYPE.DELETE];
        const { id, parentId } = payload;
        const delta = prev.get(id);
        if (!delta) return null;
        return new Op(OP_TYPE.INSERT, { delta, parentId });
      }
      case OP_TYPE.MOVE: {
        const payload = this.payload as OpPayload[typeof OP_TYPE.MOVE];
        const { x, y, ids } = payload;
        return new Op(OP_TYPE.MOVE, { ids, x: -x, y: -y });
      }
      case OP_TYPE.RESIZE: {
        const payload = this.payload as OpPayload[typeof OP_TYPE.RESIZE];
        const { id } = payload;
        const delta = prev.get(id);
        if (!delta) return null;
        const { x, y, width, height } = delta.getRect();
        return new Op(OP_TYPE.RESIZE, { id, x, y, width, height });
      }
      case OP_TYPE.REVISE: {
        const payload = this.payload as OpPayload[typeof OP_TYPE.REVISE];
        const { id, attrs } = payload;
        const delta = prev.get(id);
        if (!delta) return null;
        const prevAttrs: DeltaAttributes = {};
        for (const key of Object.keys(attrs)) {
          prevAttrs[key] = delta.getAttr(key);
        }
        return new Op(OP_TYPE.REVISE, { id, attrs: prevAttrs });
      }
      default:
        break;
    }
    return null;
  }
}
```

## History
既然我们已经设计好了基于`Op`的原子化操作以及数据结构，那么紧接着我们就可以开始做`History`能力了，在这里首先需要注意我们先前对于`Invert`的思想是让其根据`DeltaSet`自动先生成`InvertOp`，在这里我们可以有两种方案来实现。

1. 第一种方式是在应用`Op`之前我们先根据当前的`DeltaSet`自动生成一个`InvertOp`，然后将这个`Op`交给`History`模块存储起来作为`Undo`的组操作即可。

2. 第二种方式是我们在应用`Op`之前首先生成一遍新的`Previous DeltaSet`，是一个`immer`的副本，然后将`Prev DeltaSet`以及`Next DeltaSet`一并作为`OnChangeEvent`交给`History`模块进行后续的操作。

最终我是选择了方案二作为整体实现，倒是没有什么具体依据，只是觉得这个`immer`的副本可能不仅会在这里使用，作为事件的一部分分发先前的数据值我认为是合理的，所以在应用`Op`的时候大致实现如下。

```js
public apply(op: OpSetType, applyOptions?: ApplyOptions) {
    const options = applyOptions || { source: "user", undoable: true };
    const previous = new DeltaSet(this.editor.deltaSet.getDeltas());

    switch (op.type) {
      // 根据不同的`Op`执行不同的操作
    }

    this.editor.event.trigger(EDITOR_EVENT.CONTENT_CHANGE, {
      previous,
      current: this.editor.deltaSet,
      changes: op,
      options,
    });
}
```

其实我们也可以看到，整个编辑器内部的通信是依赖于`event`这个模块的，也就是说这个`apply`函数不会直接调用`History`的相关内容，我们的`History`模块是独立挂载`CONTENT_CHANGE`事件的。那么紧接着，我们需要设计`History`模块的数据存储，我们先来明确一下想要实现的内容，现在原子化的`Op`已经设计好了，所以在设计`History`模块时就不需要全量保存快照了，但是如果每个操作都需要并入`History Stack`的话可能并不是很好，通常都是有`N`个`Op`的一并`Undo/Redo`，所以这个模块应该有一个定时器与缓存数组还有最大时间，如果在`N`毫秒秒内没有新的`Op`加入的话就将`Op`并入`History Stack`，还有就是常规的`undo stack`以及`redo stack`，栈存储的内容也不应该很大，所以还需要设置最大存储量。

```js
export class History {
  private readonly DELAY = 800;
  private readonly STACK_SIZE = 100;
  private temp: OpSetType[];
  private undoStack: OpSetType[][];
  private redoStack: OpSetType[][];
  private timer: ReturnType<typeof setTimeout> | null;
}
```

前边也提到过我们都是通过事件来进行通信的，所以这里需要先挂载事件，并且在这里将`Invert`的`Op`构建好，将其置入批量操作的缓存中。

```js
  constructor(private editor: Editor) {
    this.editor.event.on(EDITOR_EVENT.CONTENT_CHANGE, this.onContentChange, 10);
  }

  destroy() {
    this.editor.event.off(EDITOR_EVENT.CONTENT_CHANGE, this.onContentChange);
  }
  
  private onContentChange = (e: ContentChangeEvent) => {
    if (!e.options.undoable) return void 0;
    this.redoStack = [];
    const { previous, changes } = e;
    const invert = changes.invert(previous);
    if (invert) {
      this.temp.push(invert);
      if(!this.timer) {
        this.timer = setTimeout(this.collectImmediately, this.DELAY);
      }
    }
  };
```

后来我在思考一个问题，如果这`N`毫秒内用户进行了`Undo`操作应该怎么办，后来想想实际上很简单，此时只需要清除定时器，将暂存的`Op[]`立即放置于`Redo Stack`即可。

```js
  private collectImmediately = () => {
    if (!this.temp.length) return void 0;
    this.undoStack.push(this.temp);
    this.temp = [];
    this.redoStack = [];
    this.timer && clearTimeout(this.timer);
    this.timer = null;
    if (this.undoStack.length > this.STACK_SIZE) this.undoStack.shift();
  };
```

后边就是实际进行`redo`和`undo`的操作了，只不过在这里批量操作是使用循环每个`Op`都需要单独`Apply`的，这样感觉并不是很好，毕竟需要修改多次，虽然后边的渲染我只会进行一次批量渲染，但是这里事件触发的次数有点多，另外这里有个点还需要注意，我们在`History`模块里进行的操作，本身不应该再记入`History`中，所以这里还有一个`ApplyOptions`的设置需要注意。此外，在`undo`之后需要将这部分内容再次`invert`之后入`redo stack`，反过来也是一样的，此时我们直接取当前编辑器的`DeltaSet`即可。

```js
  public undo() {
    this.collectImmediately();
    if (!this.undoStack.length) return void 0;
    const ops = this.undoStack.pop();
    if (!ops) return void 0;
    this.editor.canvas.mask.clearWithOp();
    this.redoStack.push(
      ops.map(op => op.invert(this.editor.deltaSet)).filter(Boolean) as OpSetType[]
    );
    this.editor.logger.debug("UNDO", ops);
    ops.forEach(op => this.editor.state.apply(op, { source: "undo", undoable: false }));
  }

  public redo() {
    if (!this.redoStack.length) return void 0;
    const ops = this.redoStack.pop();
    if (!ops) return void 0;
    this.editor.canvas.mask.clearWithOp();
    this.undoStack.push(
      ops.map(op => op.invert(this.editor.deltaSet)).filter(Boolean) as OpSetType[]
    );
    this.editor.logger.debug("REDO", ops);
    ops.forEach(op => this.editor.state.apply(op, { source: "redo", undoable: false }));
  }
```

## 最后
本文我们介绍总结了我们的图形编辑器中数据结构的设计以及`History`模块的实现，虽然暂时不涉及到`Canvas`本身，但是这都是作为编辑器本身的基础能力，也是通用的能力可以学习。后边我们可以介绍的能力还有很多，例如复制粘贴模块、画布分层、事件管理、无限画布、按需绘制、性能优化、焦点控制、参考线、富文本、快捷键、层级控制、渲染顺序、事件模拟、`PDF`排版等等，整体来说还是比较有意思的，欢迎关注我并留意后续的文章。

