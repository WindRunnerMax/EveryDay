# Canvas简历编辑器-选中绘制与拖拽多选交互方案

在之前我们聊了聊如何基于`Canvas`与基本事件组合实现了轻量级`DOM`，并且在此基础上实现了如何进行管理事件以及多层级渲染的能力设计。那么此时我们就依然在轻量级`DOM`的基础上，关注于实现选中绘制与拖拽多选交互方案。

* 在线编辑: <https://windrunnermax.github.io/CanvasEditor>
* 开源地址: <https://github.com/WindrunnerMax/CanvasEditor>

关于`Canvas`简历编辑器项目的相关文章:

* [掘金老给我推Canvas，我也学习Canvas做了个简历编辑器](https://juejin.cn/post/7329799331216015395)
* [Canvas图形编辑器-数据结构与History(undo/redo)](https://juejin.cn/post/7331575219957366836)
* [Canvas图形编辑器-我的剪贴板里究竟有什么数据](https://juejin.cn/post/7331992322233024548)
* [Canvas简历编辑器-图形绘制与状态管理(轻量级DOM)](https://juejin.cn/spost/7354986873733333055)
* [Canvas简历编辑器-Monorepo+Rspack工程实践](https://juejin.cn/spost/7357349281885503500)
* [Canvas简历编辑器-层级渲染与事件管理能力设计](https://juejin.cn/spost/7376197082203684873)
* [Canvas简历编辑器-选中绘制与拖拽多选交互方案](https://juejin.cn/post/7415654362972585984)

## 选中绘制
我们先来聊一聊最基本的节点点击选中以及拖拽的交互，而在聊具体的代码实现之前，我们先来看一下对于图形的绘制问题。在`Canvas`中我们绘制路径的话，我们可以通过`fill`来填充路径，也可以通过`stroke`来描边路径，而在我们描边的时候，如果不注意的话可能会陷入一些绘制的问题。假如此时我们要绘制一条线，我们可以分别来看下使用`stroke`和`fill`的绘制方法实现，此时如果在高清`ctx.scale(devicePixel, devicePixel)`情况下，则能明显地看出来绘制位置差`0.5px`，而如果基准为`1px`的话则会出现`1px`的差值以及色值偏差。

```js
ctx.beginPath();
ctx.strokeStyle = "blue";
ctx.lineWidth = 1;
ctx.moveTo(5, 5);
ctx.lineTo(100, 5);
ctx.closePath();
ctx.stroke();
ctx.fillStyle = "red";
ctx.beginPath();
ctx.moveTo(100, 5);
ctx.lineTo(200, 5);
ctx.lineTo(200, 6);
ctx.lineTo(100, 6);
ctx.closePath();
ctx.fill();
```

在先前的选中图形`frame`中，我们都是用`stroke`来实现的，然后最近我想将其真正作为外边框来绘制，然后就发现想绘制`inside stroke`确实不是一件容易的事。从`MDN`上阅读`stroke`的文档可以得到其是以路径的中心线为基准的，也就是说`stroke`是由基准分别向内外扩展的，那么问题就来了，假如我们绘制了一条线，而这条线本身是存在`1px`宽度的，那么初步理解按照文档所说其本身结构应该是以这`1px`本身的中心点也就是`0.5px`的位置为中心点向外发散，然而其实际效果是以`1px`的外边缘为基准发散，那么就会导致`1px`的线在`stroke`之后会多出`0.5px`的宽度，这个效果可以通过`lineTo(0, 100)`外加`lineWith=1`来测试，可以发现其可见宽度只有`0.5px`，这点可以通过再画一个`1px`的`Path`来对比。

```js
ctx.beginPath();
ctx.lineWidth = 6;
ctx.strokeStyle = "blue";
ctx.moveTo(0, 0);
ctx.lineTo(100, 0);
ctx.closePath();
ctx.stroke();
ctx.beginPath();
ctx.fillStyle = "red";
ctx.moveTo(100, 3);
ctx.lineTo(200, 3);
ctx.closePath();
ctx.stroke();
```

那么这里的`Strokes are aligned to the center of a path`可能与我理解的`center of a path`并不相同，或许其只是想表达`stroke`是分别向两侧绘制描边的，而并不是解释其基准位置。关于这个问题我咨询了一下，这里主要是理解有偏差，在我们使用`API`绘制路径时，本身并没有设置宽度的信息，而坐标信息定义的是路径的轮廓或边界，因此我们在最开始定义的路径结构`1px`是不成立的。在图形学的上下文中，路径`path`通常是指一个几何形状的轮廓或线条，路径本身是数学上的抽象概念，没有宽度，只是一个由点和线段构成的轨迹，因此当我们提到描边`stroke`时，指的是一个可视化过程，即在路径的周围绘制有宽度的线条。 

实际上这里如果仅仅是处理`frame`的问题的话，可能并没有太大的问题，然而在处理节点的时候，发现由于是使用`stroke`绘制的操作节点，那么实际上其总是会超出原始宽度的，也就是上边说的描边问题，而因为超出的这`0.5px`的边缘节点，使得我一直认为绘制节点的边缘与填充是没问题的，然而今天才发现这里的顺序反了，描边的内部会被填充覆盖掉，也就是说实现的`border`宽度总是会被除以`2`的，因此要先填充再描边才是正确的绘制方式。此外，无论是`frame`节点的绘制还是类似`border`的绘制，在`Firefox`中`inside stroke`总是会出现兼容性问题，仅有组合`fill`以及使用`fill`配合`Path2D + clip`才能绘制正常的`inside stroke`。

```js
ctx.save();
ctx.beginPath();
ctx.arc(70, 75, 50, 0, 2 * Math.PI);
ctx.stroke();
ctx.fillStyle = "white";
ctx.fill();
ctx.closePath();
ctx.restore();

ctx.save();
ctx.beginPath();
ctx.arc(200, 75, 50, 0, 2 * Math.PI);
ctx.fillStyle = "white";
ctx.fill();
ctx.stroke();
ctx.closePath();
ctx.restore();
```

那么我们就可以利用三种方式绘制`inside stroke`，当然还有借助`lineTo/fillRect`分别绘制`4`条边的方式我们没有列举，因为这种方式自然不会出现什么问题，其本身就是使用`fill`的方式绘制的，而我们这里主要是讨论`stroke`的绘制问题，只是借助`Path2D`同样也是`fill`的方式绘制的，但是这里需要讨论一下`clip`的`fillRule-nonzero/evenodd`的问题。那么借助`stroke`的特性，方式`1`是我们绘制两倍的`lineWidth`，然后裁剪掉外部的描边部分，这样就能够正确保留内部的描边了，方式`2`则是我们主动校准了描边的位置，将其向内缩小`0.5px`的位置，由此来绘制完整的描边，方式`3`是借助`evenodd`的填充规则，通过`clip`来生成规则保留内部的描边，再来实际填充即可实现。

```html
<canvas id="canvas" width="800" height="800"></canvas>
<script>
  // https://stackoverflow.com/questions/36615592/canvas-inner-stroke
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const devicePixelRatio = Math.ceil(window.devicePixelRatio || 1);
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  canvas.width = width * devicePixelRatio;
  canvas.height = height * devicePixelRatio;
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  ctx.scale(devicePixelRatio, devicePixelRatio);

  ctx.save();
  ctx.beginPath();
  ctx.rect(10, 10, 150, 100);
  ctx.clip();
  ctx.closePath();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "blue";
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.rect(170 + 0.5, 10 + 0.5, 150 - 1, 100 - 1);
  ctx.closePath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "blue";
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  const region = new Path2D();
  region.rect(330, 10, 150, 100);
  region.rect(330 + 1, 10 + 1, 150 - 2, 100 - 2);
  ctx.clip(region, "evenodd");
  ctx.rect(330, 10, 150, 100);
  ctx.closePath();
  ctx.fillStyle = "blue";
  ctx.fill();
  ctx.restore();
</script>
```

那么先前我们也提到了在`Firefox`浏览器的兼容性问题，那么我们将上述的实现方式在`Firefox`中进行测试，可以发现`inside stroke`的绘制是有些许问题的，第一个图形明显左上的线比右下的线细一些，第二个图形则明显会粗糙一些，第三个图形则看起来绘制更细致更符合`1px`的绘制。因此我们如果想要兼容绘制`inside stroke`的话最好的方式还是选择方式三，当然像最开始的实现中借助`lineTo/fillRect`分别绘制`4`条边的方式自然也是没问题的，两者的性能对比在后边也可以尝试实验一下。

<img src="https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/3ef3ab71bf3a49c38f5b611e65c0763f~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgV2luZHJ1bm5lck1heA==:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTgyOTk5OTk4OTI0NzIxNCJ9&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1726564839&x-orig-sign=6rRV2Fwm0cOxep8eMm7GUAg7dZM%3D" width="600px" referrerpolicy="no-referrer" />

那么接着我们就回到在轻量级`DOM`上实现选中的绘制，首先我们对基本节点的事件做一些通用的实现，我们先来实现点击的选取。因为在之前我们已经定义好了事件的基本传递，那么我们此时只需要在`Element`节点上实现事件的响应即可，那么在这里我们就可以直接操作选区模块，直接将当前的活跃节点`id`设置为节点组的内容即可。

```js
// packages/core/src/canvas/dom/element.ts
export class ElementNode extends Node {
  protected onMouseDown = (e: MouseEvent) => {
    this.editor.selection.setActiveDelta(this.id);
  };
}
```

而当我们触发选区的节点设置之后，在选区模块则会将此时所有的`active`节点组合起来形成新的`Range`，然后在新的`Range`基础上判断当前是否应该触发选区变换的事件，这里的事件分发比较重要，整个编辑器的选区变化事件都会在此处分发。

```js
// packages/core/src/selection/index.ts
export class Selection {
  public set(range: Range | null) {
    if (this.editor.state.get(EDITOR_STATE.READONLY)) return this;
    const previous = this.current;
    if (Range.isEqual(previous, range)) return this;
    this.current = range;
    this.editor.event.trigger(EDITOR_EVENT.SELECTION_CHANGE, {
      previous,
      current: range,
    });
    return this;
  }

  public setActiveDelta(...deltaIds: string[]) {
    this.active.clear();
    deltaIds.forEach(id => this.active.add(id));
    this.compose();
  }

  public compose() {
    const active = this.active;
    if (active.size === 0) {
      this.set(null);
      return void 0;
    }
    let range: Range | null = null;
    active.forEach(key => {
      const delta = this.editor.deltaSet.get(key);
      if (!delta) return void 0;
      const deltaRange = Range.from(delta);
      range = range ? range.compose(deltaRange) : deltaRange;
    });
    this.set(range);
  }
}
```

那么在事件分发之后，我们必须要在选区变换之后绘制新的选区，实际上在选区变换后我们理论上仅仅需要将节点绘制出来即可，而按照我们先前的调度设计而言，我们需要主动按需触发要绘制的区域，并且由于选区是由其他的位置变换到当前区域的，因此绘制时就需要将先前的区域同时绘制。那么按照我们先前的设计，`SelectNode`本身既是事件处理器又是渲染器，基本与`DOM`节点基本一致，只是我们绑定事件和绘制都是直接由类控制而已，而在`drawingMask`的`Shape.frame`绘制中，就是我们最开始聊的描边与填充绘制问题。

```js
// packages/core/src/canvas/dom/node.ts
export class SelectNode extends Node {
  protected onSelectionChange = (e: SelectionChangeEvent) => {
    const { current, previous } = e;
    this.editor.logger.info("Selection Change", current);
    const range = current || previous;
    if (range) {
      const refresh = range.compose(previous).compose(current);
      this.editor.canvas.mask.drawingEffect(refresh.zoom(RESIZE_OFS));
    }
  };

  public drawingMask = (ctx: CanvasRenderingContext2D) => {
    const selection = this.editor.selection.get();
    if (selection) {
      const { x, y, width, height } = selection.rect();
      Shape.frame(ctx, { x, y, width, height, borderColor: BLUE_6 });
    }
  };
}
```

## 拖拽多选
当我们已经成功实现图形单选以及节点绘制之后，我们很容易想到两个交互问题，首先是图形的多选，因为我们在选中节点的时候可能不会仅仅选一个节点，例如全选的场景，其次则是选中图形的拖拽，这个就是常见的交互方式了，无论是单选还是多选的时候，都可以通过拖拽图形来调整位置。那么我们首先来看一下多选，实际上在上边我们的设计中本就是支持多选的，我们在选区的`active`就是`Set<string>`类型，以及`Selection`的`compose`方法也是支持多选的，那么我们只需要在选中节点的时候，将节点的`id`添加到`active`中即可。

```js
// packages/core/src/canvas/dom/element.ts
export class ElementNode extends Node {
  protected onMouseDown = (e: MouseEvent) => {
    if (e.shiftKey) {
      this.editor.selection.addActiveDelta(this.id);
    } else {
      this.editor.selection.setActiveDelta(this.id);
    }
  };
}
```

除了按住`shiftKey`键进行多选之外，我们使用鼠标以某个点为起点拖拽选区进行选择也是一种多选的方式，那么在这里我们将这个交互方式设计在了`FrameNode`内，而这里有点不同的是我们的起始行为需要归并到`Root`节点上，因为只有点击在`Root`节点上的事件我们才认为是起始，否则是认为点击到了节点本身上，而框选这个交互的本身事件则主要是判断当前的选区大小，以及其覆盖的节点范围，将覆盖的节点`id`全部放置于选区模块即可。

```js
// packages/core/src/canvas/dom/frame.ts
export class FrameNode extends Node {
  private onRootMouseDown = (e: MouseEvent) => {
    this.savedRootMouseDown(e);
    this.unbindOpEvents();
    this.bindOpEvents();
    this.landing = Point.from(e.x, e.y);
    this.landingClient = Point.from(e.clientX, e.clientY);
  };

  private onMouseMoveBridge = (e: globalThis.MouseEvent) => {
    if (!this.landing || !this.landingClient) return void 0;
    const point = Point.from(e.clientX, e.clientY);
    const { x, y } = this.landingClient.diff(point);
    if (!this.isDragging && (Math.abs(x) > SELECT_BIAS || Math.abs(y) > SELECT_BIAS)) {
      // 拖拽阈值
      this.isDragging = true;
    }
    if (this.isDragging) {
      const latest = new Range({
        startX: this.landing.x,
        startY: this.landing.y,
        endX: this.landing.x + x,
        endY: this.landing.y + y,
      }).normalize();
      this.setRange(latest);
      // 获取获取与选区交叉的所有`State`节点
      const effects: string[] = [];
      this.editor.state.getDeltasMap().forEach(state => {
        if (latest.intersect(state.toRange())) effects.push(state.id);
      });
      this.editor.selection.setActiveDelta(...effects);
      // 重绘拖拽过的最大区域
      const zoomed = latest.zoom(RESIZE_OFS);
      this.dragged = this.dragged ? this.dragged.compose(zoomed) : zoomed;
      this.editor.canvas.mask.drawingEffect(this.dragged);
    }
  };
  private onMouseMoveController = throttle(this.onMouseMoveBridge, ...THE_CONFIG);

  private onMouseUpController = () => {
    this.unbindOpEvents();
    this.setRange(Range.reset());
    if (this.isDragging) {
      this.dragged && this.editor.canvas.mask.drawingEffect(this.dragged);
    }
    this.landing = null;
    this.isDragging = false;
    this.dragged = null;
    this.setRange(Range.reset());
  };

  public drawingMask = (ctx: CanvasRenderingContext2D) => {
    if (this.isDragging) {
      const { x, y, width, height } = this.range.rect();
      Shape.rect(ctx, { x, y, width, height, borderColor: BLUE_5, fillColor: BLUE_6_6 });
    }
  };
}
```

说到这里，在多选之外这里我们可能还需要关注一个交互，就是`Hover`的效果。如果我们是`CSS`实现的话，这个问题实际上很简单，无非是增加一个伪类的问题，然而在`Canvas`中我们需要自己实现这个效果，也就是需要借助`MouseEvent`来手动处理这个过程。当然思路是比较简单的，我们只需要维护一个`boolean`的`id`标识来确定当前节点是否被`Hover`，然后根据选区状态来判断是否需要绘制当前节点的`Range`即可。

```js
// packages/core/src/canvas/dom/element.ts
export class ElementNode extends Node {
  protected onMouseEnter = () => {
    this.isHovering = true;
    if (this.editor.selection.has(this.id)) {
      return void 0;
    }
    this.editor.canvas.mask.drawingEffect(this.range);
  };

  protected onMouseLeave = () => {
    this.isHovering = false;
    if (this.editor.selection.has(this.id)) {
      return void 0;
    }
    this.editor.canvas.mask.drawingEffect(this.range);
  };

  public drawingMask = (ctx: CanvasRenderingContext2D) => {
    if (
      this.isHovering &&
      !this.editor.selection.has(this.id) &&
      !this.editor.state.get(EDITOR_STATE.MOUSE_DOWN)
    ) {
      const { x, y, width, height } = this.range.rect();
      Shape.frame(ctx, {
        x: x,
        y: y,
        width: width,
        height: height,
        borderColor: BLUE_4,
      });
    }
  };
}
```

而事件的调度则是由`Root`节点来实现的，这里主要是维护了一个互斥的`hoverId`来实现的，当然这里的主要目的还是模拟`OnMouseEnter`以及`OnMouseLeave`事件。基本逻辑是遍历当前的节点，如果发现需要触发相关事件的节点，则判断鼠标是否在当前节点内，如果在节点内则作为命中的节点，判断当前`Hover`的节点如果与先前不一致，则根据具体的条件来判断并且触发先前的节点`MouseLeave`与当前节点`MouseEnter`事件。

```js
// packages/core/src/canvas/state/root.ts
export class Root extends Node {
  /** Hover 节点 */
  public hover: ElementNode | ResizeNode | null;

  private onMouseMoveBasic = (e: globalThis.MouseEvent) => {
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
    // 如果命中的节点与先前 Hover 的节点不一致
    if (this.hover !== next) {
      const prev = this.hover;
      this.hover = next;
      if (prev !== null) {
        this.emit(prev, NODE_EVENT.MOUSE_LEAVE, MouseEvent.from(e, this.editor));
        if (prev instanceof ElementNode) {
          this.editor.event.trigger(EDITOR_EVENT.HOVER_LEAVE, { node: prev });
        }
      }
      if (next !== null) {
        this.emit(next, NODE_EVENT.MOUSE_ENTER, MouseEvent.from(e, this.editor));
        if (next instanceof ElementNode) {
          this.editor.event.trigger(EDITOR_EVENT.HOVER_ENTER, { node: next });
        }
      }
    }
  };
}
```

紧接着我们就来聊一聊选区节点的拖拽移动问题，关于这部分能力的实现我们将其作为了`SelectNode`的一部分实现。对于拖拽这件事本身来说，我们只需要关注`MouseDown`绑定事件、`MouseMove`移动、`MouseUp`取消绑定事件，那么这里我们同样也是类似的实现，只不过由于我们需要考虑节点的绘制，因此需要在其中穿插着图形的`drawing`方法调用。在这里我们采用了最方便的按需绘制方案，即所有拖拽过的区域都重新绘制，当然最好的方案还是当前事件触发区域的重绘，这样性能会更好一些，且在这里我们只绘制拖拽的边框而不是将所有节点都拖拽着绘制。此外，在这里我们还实现了交互上的优化，即只有拖拽超过一定的阈值才会触发拖拽事件，这样可以避免误操作。

```js
// packages/core/src/canvas/dom/select.ts
export class SelectNode extends Node {

  private onMouseDownController = (e: globalThis.MouseEvent) => {
    // 非默认状态下不执行事件
    if (!this.editor.canvas.isDefaultMode()) return void 0;
    // 取消已有事件绑定
    this.unbindDragEvents();
    const selection = this.editor.selection.get();
    // 选区 & 严格点击区域判定
    if (!selection || !this.isInSelectRange(Point.from(e, this.editor), this.range)) {
      return void 0;
    }
    this.dragged = selection;
    this.landing = Point.from(e.clientX, e.clientY);
    this.bindDragEvents();
    this.refer.onMouseDownController();
  };

  private onMouseMoveBasic = (e: globalThis.MouseEvent) => {
    const selection = this.editor.selection.get();
    if (!this.landing || !selection) return void 0;
    const point = Point.from(e.clientX, e.clientY);
    const { x, y } = this.landing.diff(point);
    // 超过阈值才认为正在触发拖拽
    if (!this._isDragging && (Math.abs(x) > SELECT_BIAS || Math.abs(y) > SELECT_BIAS)) {
      this._isDragging = true;
    }
    if (this._isDragging && selection) {
      const latest = selection.move(x, y);
      const zoomed = latest.zoom(RESIZE_OFS);
      // 重绘拖拽过的最大区域
      this.dragged = this.dragged ? this.dragged.compose(zoomed) : zoomed;
      this.editor.canvas.mask.drawingEffect(this.dragged);
      const offset = this.refer.onMouseMoveController(latest);
      this.setRange(offset ? latest.move(offset.x, offset.y) : latest);
    }
  };
  private onMouseMoveController = throttle(this.onMouseMoveBasic, ...THE_CONFIG);

  private onMouseUpController = () => {
    this.unbindDragEvents();
    this.refer.onMouseUpController();
    const selection = this.editor.selection.get();
    if (this._isDragging && selection) {
      const rect = this.range;
      const { startX, startY } = selection.flat();
      const ids = [...this.editor.selection.getActiveDeltaIds()];
      this.editor.state.apply(
        new Op(OP_TYPE.MOVE, { ids, x: rect.start.x - startX, y: rect.start.y - startY })
      );
      this.editor.selection.set(rect);
      this.dragged && this.editor.canvas.mask.drawingEffect(this.dragged);
    }
    this.landing = null;
    this.dragged = null;
    this._isDragging = false;
  };
}
```

## 最后
在这里我们就依然在轻量级`DOM`的基础上，讨论了`Canvas`中描边与填充的绘制问题，以及`inside stroke`的实现方式，然后我们实现了基本的选中绘制以及拖拽多选的交互方案，并且实现了`Hover`的效果，以及拖拽节点的移动。那么在后边我们可以聊一下`fillRule`规则设计、按需绘制图形节点，也可以聊到更多的交互方案，例如`Resize`的交互方案、参考线能力的实现、富文本的绘制方案等等。

## 每日一题

```
https://github.com/WindRunnerMax/EveryDay
```

## 参考

```
https://github.com/WindRunnerMax/CanvasEditor
https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas
https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
```
