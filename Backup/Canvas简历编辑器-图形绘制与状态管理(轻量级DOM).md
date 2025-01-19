# Canvas简历编辑器-图形绘制与状态管理(轻量级DOM)

在前边我们聊了数据结构的设计和剪贴板的数据操作，那么这些操作都还是比较倾向于数据相关的操作，那么我们现在就来聊聊基本的图形绘制以及图形状态管理。

* 在线编辑: <https://windrunnermax.github.io/CanvasEditor>
* 开源地址: <https://github.com/WindrunnerMax/CanvasEditor>

关于`Canvas`简历编辑器项目的相关文章:

* [掘金老给我推Canvas，我也学习Canvas做了个简历编辑器](https://juejin.cn/post/7329799331216015395)
* [Canvas图形编辑器-数据结构与History(undo/redo)](https://juejin.cn/post/7331575219957366836)
* [Canvas图形编辑器-我的剪贴板里究竟有什么数据](https://juejin.cn/post/7331992322233024548)
* [Canvas简历编辑器-图形绘制与状态管理(轻量级DOM)](https://juejin.cn/spost/7354986873733333055)
* [Canvas简历编辑器-Monorepo+Rspack工程实践](https://juejin.cn/spost/7357349281885503500)
* [Canvas简历编辑器-层级渲染与事件管理能力设计](https://juejin.cn/spost/7376197082203684873)


## 图形绘制
我们做项目还是需要从需求出发，首先我们需要明确我们要做的是简历编辑器，那么简历编辑器要求的图形类型并不需要很多，只需要 矩形、图片、富文本 图形即可，那么我们就可以简单将其抽象一下，我们只需要认为任何元素都是矩形就可以完成这件事了。

因为绘制矩阵是比较简单的，我们可以直接从数据结构来抽象这部分图形，图形元素基类的`x, y, width, height`属性是确定的，再加上还有层级结构，那么就再加一个`z`，此外由于需要标识图形，所以还需要给其设置一个`id`。

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

那么我们的图形肯定是有很多属性的，例如矩形是会存在背景、边框的大小和颜色，富文本也需要属性来绘制具体的内容，所以我们还需要一个对象来存储内容，而且我们是插件化的实现，具体的图形绘制应该是由插件本身来实现的，这部分内容需要子类来具体实现。

```js
abstract class Delta {
  // ...
  public attrs: DeltaAttributes;
  public abstract drawing: (ctx: CanvasRenderingContext2D) => void;
}
```

那么绘制的时候，我们考虑分为两层绘制的方式，内层的`Canvas`是用来绘制具体图形的，这里预计需要实现增量更新，而外层的`Canvas`是用来绘制中间状态的，例如选中图形、多选、调整图形位置/大小等，在这里是会全量刷新的，并且后边可能会在这里绘制标尺。


![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c6d1f2df03dc43e0a89456620320a27c~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1324&h=450&s=289416&e=png&b=202124)

在这里要注意一个很重要的问题，因为我们的`Canvas`并不是再是矢量图形，如果我们是在`1080P`的显示器上直接将编辑器的`width x height`设置到元素上，那是不会出什么问题的，但是如果此时是`2K`或者是`4K`的显示器的话，就会出现模糊的问题，所以我们需要取得`devicePixelRatio`即物理像素/设备独立像素，所以我们可以通过在`window`上取得这个值来控制`Canvas`元素的`size`属性。

```js
this.canvas.width = width * ratio;
this.canvas.height = height * ratio;
this.canvas.style.width = width + "px";
this.canvas.style.height = height + "px";
```

此时我们还需要处理`resize`的问题，我们可以使用`resize-observer-polyfill`来实现这部分功能，但是需要注意的是我们的`width`和`height`必须要是整数，否则会导致编辑器的图形模糊。

```js
private onResizeBasic = (entries: ResizeObserverEntry[]) => {
  // COMPAT: `onResize`会触发首次`render`
  const [entry] = entries;
  if (!entry) return void 0;
  // 置宏任务队列
  setTimeout(() => {
    const { width, height } = entry.contentRect;
    this.width = width;
    this.height = height;
    this.reset();
    this.editor.event.trigger(EDITOR_EVENT.RESIZE, { width, height });
  }, 0);
};
```

实际上我们在实现完整的图形编辑器的时候，可能并不是完整的矩形节点，例如绘制云形状的不规则图形，我们需要将相关节点坐标放置于`attrs`中，并且在实际绘制的过程中完成`Bezier`曲线的计算即可。但是实际上我们还需要注意到一个问题，当我们点击的时候如何判断这个点是在图形内还是图形外，如果是图形内则点击时需要选中节点，如果在图形外不会选中节点，那么因为我们是闭合图形，所以我们可以用射线法实现这个能力，我们将点向一个方向做射线，如果穿越的节点数量是奇数，说明点在内部图形，如果穿越的节点数量是偶数，则说明点在图形外部。


![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1b4e3bf204b34ecea569786a67962108~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=946&h=502&s=130221&e=png&b=ffffff)

我们仅仅实现图形的绘制肯定是不行的，我们还需要实现图形的相关交互能力。在实现交互的过程中我遇到了一个比较棘手的问题，因为不存在`DOM`，所有的操作都是需要根据位置信息来计算的，比如选中图形后调整大小的点就需要在选中状态下并且点击的位置恰好是那几个点外加一定的偏移量，然后再根据`MouseMove`事件来调整图形大小，而实际上在这里的交互会非常多，包括多选、拖拽框选、`Hover`效果，都是根据`MouseDown`、`MouseMove`、`MouseUp`三个事件完成的，所以如何管理状态以及绘制`UI`交互就是个比较麻烦的问题，在这里我只能想到根据不同的状态来携带不同的`Payload`，进而绘制交互。

```js
export enum CANVAS_OP {
  HOVER,
  RESIZE,
  TRANSLATE,
  FRAME_SELECT,
}
export enum CANVAS_STATE {
  OP = 10,
  HOVER = 11,
  RESIZE = 12,
  LANDING_POINT = 13,
  OP_RECT = 14,
}
export type SelectionState = {
  [CANVAS_STATE.OP]?:
    | CANVAS_OP.HOVER
    | CANVAS_OP.RESIZE
    | CANVAS_OP.TRANSLATE
    | CANVAS_OP.FRAME_SELECT
    | null;
  [CANVAS_STATE.HOVER]?: string | null;
  [CANVAS_STATE.RESIZE]?: RESIZE_TYPE | null;
  [CANVAS_STATE.LANDING_POINT]?: Point | null;
  [CANVAS_STATE.OP_RECT]?: Range | null;
};
```

## 状态管理
在实现交互的时候，我思考了很久应该如何比较好的实现这个能力，因为上边也说了这里是没有`DOM`的，所以最开始的时候我通过`MouseDown`、`MouseMove`、`MouseUp`实现了一个非常混乱的状态管理，完全是基于事件的触发然后执行相关副作用从而调用`Mask Canvas`图层的方法进行重新绘制。

```js
const point = this.editor.canvas.getState(CANVAS_STATE.LANDING_POINT);
const opType = this.editor.canvas.getState(CANVAS_STATE.OP);
// ...
this.editor.canvas.setState(CANVAS_STATE.HOVER, delta.id);
this.editor.canvas.setState(CANVAS_STATE.RESIZE, state);
this.editor.canvas.setState(CANVAS_STATE.OP, CANVAS_OP.RESIZE);
this.editor.canvas.setState(CANVAS_STATE.OP, CANVAS_OP.TRANSLATE);
this.editor.canvas.setState(CANVAS_STATE.OP, CANVAS_OP.FRAME_SELECT);
// ...
this.editor.canvas.setState(CANVAS_STATE.LANDING_POINT, new Point(e.offsetX, e.offsetY));
this.editor.canvas.setState(CANVAS_STATE.LANDING_POINT, null);
this.editor.canvas.setState(CANVAS_STATE.OP_RECT, null);
this.editor.canvas.setState(CANVAS_STATE.OP, null);
// ...
```


再后来我觉得这样的代码根本没有办法维护，所以改动了一下，将我所需要的状态全部都存储到一个`Store`中，通过我自定义的事件管理来通知状态的改变，最终通过状态改变的类型来严格控制将要绘制的内容，也算是将相关的逻辑抽象了一层，只不过在这里相当于是我维护了大量的状态，而且这些状态是相互关联的，所以会有很多的`if/else`去处理不同类型的状态改变，而且因为很多方法会比较复杂，传递了多层，导致状态管理虽然比之前好了一些可以明确知道状态是因为哪里导致变化的，但是实际上依旧不容易维护。

```js
export const CANVAS_STATE = {
  OP: "OP",
  RECT: "RECT",
  HOVER: "HOVER",
  RESIZE: "RESIZE",
  LANDING: "LANDING",
} as const;

export type CanvasOp = keyof typeof CANVAS_OP;
export type ResizeType = keyof typeof RESIZE_TYPE;
export type CanvasStore = {
  [RESIZE_TYPE.L]?: Range | null;
  [RESIZE_TYPE.R]?: Range | null;
  [RESIZE_TYPE.T]?: Range | null;
  [RESIZE_TYPE.B]?: Range | null;
  [RESIZE_TYPE.LT]?: Range | null;
  [RESIZE_TYPE.RT]?: Range | null;
  [RESIZE_TYPE.LB]?: Range | null;
  [RESIZE_TYPE.RB]?: Range | null;
  [CANVAS_STATE.RECT]?: Range | null;
  [CANVAS_STATE.OP]?: CanvasOp | null;
  [CANVAS_STATE.HOVER]?: string | null;
  [CANVAS_STATE.LANDING]?: Point | null;
  [CANVAS_STATE.RESIZE]?: ResizeType | null;
};
```


最终我又思考了一下，我们在浏览器中进行`DOM`操作的时候，这个`DOM`是真正存在的吗，或者说我们在`PC`上实现窗口管理的时候，这个窗口是真的存在的吗，答案肯定是否定的，虽然我们可以通过系统或者浏览器提供的`API`来非常简单地实现各种操作，但是实际上些内容是系统帮我们绘制出来的，本质上还是图形，事件、状态、碰撞检测等等都是系统模拟出来的，而我们的`Canvas`也拥有类似的图形编程能力。

那么我们当然可以在这里实现类似于`DOM`的能力，因为我想实现的能力似乎本质上就是`DOM`与事件的关联，而`DOM`结构是一种非常成熟的设计了，这其中有一些很棒的能力设计，例如`DOM`的事件流，我们就不需要扁平化地调整每个`Node`的事件，而是只需要保证事件是从`ROOT`节点起始，最终又在`ROOT`上结束即可。并且整个树形结构以及状态是靠用户利用`DOM`的`API`来实现的，我们管理只需要处理`ROOT`就好了，这样就会很方便，下个阶段的状态管理是准备用这种方式来实现的，那么我们就先实现`Node`基类。

```js
class Node {
  private _range: Range;
  private _parent: Node | null;
  public readonly children: Node[];

  // 尽可能简单地实现事件流
  // 直接通过`bubble`来决定捕获/冒泡
  protected onMouseDown?: (event: MouseEvent) => void;
  protected onMouseUp?: (event: MouseEvent) => void;
  protected onMouseEnter?: (event: MouseEvent) => void;
  protected onMouseLeave?: (event: MouseEvent) => void;

  // `Canvas`绘制节点
  public drawingMask?: (ctx: CanvasRenderingContext2D) => void;

  constructor(range: Range) {
    this.children = [];
    this._range = range;
    this._parent = null;
  }

  // ====== Parent ======
  public get parent() {
    return this._parent;
  }
  public setParent(parent: Node | null) {
    this._parent = parent;
  }

  // ====== Range ======
  public get range() {
    return this._range;
  }
  public setRange(range: Range) {
    this._range = range;
  }

  // ====== DOM OP ======
  public append<T extends Node>(node: T | Empty) {
    // ...
  }
  public removeChild<T extends Node>(node: T | Empty) {
    // ...
  }
  public remove() {
    // ...
  }
  public clearNodes() {
    // ...
  }
}
```

那么接下来我们只需要定义好类似于`HTML`的`Body`元素，在这里我们将其设置为`Root`节点，该元素继承了`Node`节点。在这里我们接管了整个编辑器的事件分发，继承于此的事件都可以分发到子节点，例如我们的点选事件，就可以在子节点上设置`MouseDown`事件处理即可。并且在这里我们还需要设计事件分发的能力，我们同样可以实现事件的捕获和冒泡机制，通过栈可以很方便的将事件的触发处理出来。

```js
export class Root extends Node {
  constructor(private editor: Editor, private engine: Canvas) {
    super(Range.from(0, 0));
  }

  public getFlatNode(isEventCall = true): Node[] {
    // 非默认状态下不需要匹配
    if (!this.engine.isDefaultMode()) return [];
    // 事件调用实际顺序 // 渲染顺序则相反
    const flatNodes: Node[] = [...super.getFlatNode(), this];
    return isEventCall ? flatNodes.filter(node => !node.ignoreEvent) : flatNodes;
  }

  public onMouseDown = (e: MouseEvent) => {
    this.editor.canvas.mask.setCursorState(null);
    !e.shiftKey && this.editor.selection.clearActiveDeltas();
  };

  private emit<T extends keyof NodeEvent>(target: Node, type: T, event: NodeEvent[T]) {
    const stack: Node[] = [];
    let node: Node | null = target.parent;
    while (node) {
      stack.push(node);
      node = node.parent;
    }
    // 捕获阶段执行的事件
    for (const node of stack.reverse()) {
      if (!event.capture) break;
      const eventFn = node[type as keyof NodeEvent];
      eventFn && eventFn(event);
    }
    // 节点本身 执行即可
    const eventFn = target[type as keyof NodeEvent];
    eventFn && eventFn(event);
    // 冒泡阶段执行的事件
    for (const node of stack) {
      if (!event.bubble) break;
      const eventFn = node[type as keyof NodeEvent];
      eventFn && eventFn(event);
    }
  }

  private onMouseDownController = (e: globalThis.MouseEvent) => {
    this.cursor = Point.from(e, this.editor);
    // 非默认状态下不执行事件
    if (!this.engine.isDefaultMode()) return void 0;
    // 按事件顺序获取节点
    const flatNode = this.getFlatNode();
    let hit: Node | null = null;
    const point = Point.from(e, this.editor);
    for (const node of flatNode) {
      if (node.range.include(point)) {
        hit = node;
        break;
      }
    }
    hit && this.emit(hit, NODE_EVENT.MOUSE_DOWN, MouseEvent.from(e, this.editor));
  };

  private onMouseMoveBasic = (e: globalThis.MouseEvent) => {
    this.cursor = Point.from(e, this.editor);
    // 非默认状态下不执行事件
    if (!this.engine.isDefaultMode()) return void 0;
    // 按事件顺序获取节点
    const flatNode = this.getFlatNode();
    let next: ElementNode | ResizeNode | null = null;
    const point = Point.from(e, this.editor);
    for (const node of flatNode) {
      // 当前只有`ElementNode`和`ResizeNode`需要触发`Mouse Enter/Leave`事件
      const authorize = node instanceof ElementNode || node instanceof ResizeNode;
      if (authorize && node.range.include(point)) {
        next = node;
        break;
      }
    }
  };
  private onMouseMoveController = throttle(this.onMouseMoveBasic, ...THE_CONFIG);

  private onMouseUpController = (e: globalThis.MouseEvent) => {
    // 非默认状态下不执行事件
    if (!this.engine.isDefaultMode()) return void 0;
    // 按事件顺序获取节点
    const flatNode = this.getFlatNode();
    let hit: Node | null = null;
    const point = Point.from(e, this.editor);
    for (const node of flatNode) {
      if (node.range.include(point)) {
        hit = node;
        break;
      }
    }
    hit && this.emit(hit, NODE_EVENT.MOUSE_UP, MouseEvent.from(e, this.editor));
  };
}
```

那么接下来，我们只需要定义相关节点类型就可以了，并且通过区分不同类型就可以来实现不同的功能，例如图形绘制使用`ElementNode`节点，调整节点大小使用`ResizeNode`节点，框选内容使用`FrameNode`节点即可，那么在这里我们就先看一下`ElementNode`节点，用来表示实际节点。

```js
class ElementNode extends Node {
  private readonly id: string;
  private isHovering: boolean;

  constructor(private editor: Editor, state: DeltaState) {
    const range = state.toRange();
    super(range);
    this.id = state.id;
    const delta = state.toDelta();
    const rect = delta.getRect();
    this.setZ(rect.z);
    this.isHovering = false;
  }

  protected onMouseDown = (e: MouseEvent) => {
    if (e.shiftKey) {
      this.editor.selection.addActiveDelta(this.id);
    } else {
      this.editor.selection.setActiveDelta(this.id);
    }
  };

  protected onMouseEnter = () => {
    this.isHovering = true;
    if (this.editor.selection.has(this.id)) {
      return void 0;
    }
    this.editor.canvas.mask.drawingEffect(this.range);
  };

  protected onMouseLeave = () => {
    this.isHovering = false;
    if (!this.editor.selection.has(this.id)) {
      this.editor.canvas.mask.drawingEffect(this.range);
    }
  };

  public drawingMask = (ctx: CanvasRenderingContext2D) => {
    if (
      this.isHovering &&
      !this.editor.selection.has(this.id) &&
      !this.editor.state.get(EDITOR_STATE.MOUSE_DOWN)
    ) {
      const { x, y, width, height } = this.range.rect();
      Shape.rect(ctx, {
        x: x,
        y: y,
        width: width,
        height: height,
        borderColor: BLUE_3,
        borderWidth: 1,
      });
    }
  };
}
```

## 总结
在这里我们聊了聊如何抽象基本的图形绘制以及状态的管理，因为我们的需求在这里所以我们的图形绘制能力会设计的比较简单，而状态管理则是迭代了三个方案才确定通过轻量`DOM`的方式来实现，那么再往后，我们就需要聊一聊如何实现 层级渲染与事件管理 的能力设计。


## 每日一题

- <https://github.com/WindRunnerMax/EveryDay>

## 参考

- <https://github.com/WindRunnerMax/CanvasEditor>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas>
- <https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D>
