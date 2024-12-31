# Canvas简历编辑器-层级渲染与事件管理能力

在之前我们在`Canvas`相关能力设计之外聊了一下工程实践的内容，聊了聊如何设计项目的`Monorepo`架构，并且实践了较新的打包工具`Rspack`，以此来管理我们的整个项目与层级结构。现在我们重新回到`Canvas`相关的内容设计上，聊一聊在我们先前实现的轻量级`DOM`基础上如何管理事件以及多层级渲染的能力设计。

* 在线编辑: <https://windrunnermax.github.io/CanvasEditor>
* 开源地址: <https://github.com/WindrunnerMax/CanvasEditor>

关于`Canvas`简历编辑器项目的相关文章:

* [掘金老给我推Canvas，我也学习Canvas做了个简历编辑器](https://juejin.cn/post/7329799331216015395)
* [Canvas图形编辑器-数据结构与History(undo/redo)](https://juejin.cn/post/7331575219957366836)
* [Canvas图形编辑器-我的剪贴板里究竟有什么数据](https://juejin.cn/post/7331992322233024548)
* [Canvas简历编辑器-图形绘制与状态管理(轻量级DOM)](https://juejin.cn/spost/7354986873733333055)
* [Canvas简历编辑器-Monorepo+Rspack工程实践](https://juejin.cn/spost/7357349281885503500)
* [Canvas简历编辑器-层级渲染与事件管理能力设计](https://juejin.cn/spost/7376197082203684873)


## 层级渲染

在前边我们提到了我们想通过模拟`DOM`来完成`Canvas`的绘制与交互，也就是我们之前说的轻量级`DOM`，那么在这里就很明显涉及到`DOM`的两个重要内容，即`DOM`渲染与事件处理。那么就先聊下渲染方面的内容，使用`Canvas`实际上就很像将所有`DOM`的`position`设置为`absolute`，所有的渲染都是相对于`Canvas`这个`DOM`元素的相对位置绘制。

那么我们就需要考虑重叠的情况，那么想一个例子，`A`的`zIndex`是`10`，`A`的子元素`B`的`zIndex`是`100`，`C`与`A`是平级的且`zIndex`为`20`，那么当这三个元素重叠的时候，从直觉上或者说从`zIndex`的值来看，由于`B`的`zIndex`最高应该其是在最高层。

然而我们实际将其代码运行，会发现在最顶部的元素是`C`(绿色)，其次是`B`(蓝色)，最底部是`A`(红色)，然而其`zIndex`的关系是`C: 20 - B: 100 - A: 10`。那么通过观察我们可以得到结论，`zIndex`实际上只看平级元素，再假如`A`的`zIndex`是`10`，`A`的子元素`B`的`zIndex`是`1`，那么在这两个元素重叠的时候，在最顶部的元素是`B`，也就是说子元素通常都是渲染在父元素之上的。

```html
<div style="position: relative;">
    <!-- A: red -->
    <div style="position: absolute; width: 100px; height: 100px; background-color: red; z-index: 10;">
        <!-- B: blue -->
        <div style="position: absolute; width: 50px; height: 50px; background-color: blue; z-index: 100;"></div>
    </div>
    <!-- C: green -->
    <div style="position: absolute; width: 25px; height: 25px; background-color: green; z-index: 20;"></div>
</div>
```

[jcode](https://code.juejin.cn/pen/7375494341399478272)


那么我们在这里也需要模拟这个行为，但是因为我们没有浏览器的渲染合成层，我们能够操作的只有一层，所以在这里我们需要根据一定的策略进行渲染，在渲染时我们与`DOM`的渲染策略相同，即先渲染父元素再渲染子元素，类似于深度优先递归遍历的渲染顺序，不同的是我们需要在每个节点遍历之前，将子节点根据`zIndex`排序来保证同层级的节点渲染重叠关系。

那么首先在各层级节点操作时，我们需要为各个节点的操作加入层级处理，也就是说我们每个节点都需要实现类似于`DOM`的一些操作，当然为了方便我们同样也可以实现一些其他的操作，例如增加缓存以及清理整个节点链路上的缓存关系。

```js
export class Node {
  // ...
  public append<T extends Node>(node: T | Empty) {
    if (!node) return void 0;
    // 类似希尔排序 保证`children`有序 `zIndex`升序
    // 如果使用`sort`也可以 `ES`规范添加了`sort`作为稳定排序
    const index = this.children.findIndex(item => item.z > node.z);
    if (index > -1) {
      this.children.splice(index, 0, node);
    } else {
      this.children.push(node);
    }
    node.setParent(this);
    this.clearFlatNodeOnLink();
  }

  public removeChild<T extends Node>(node: T | Empty) {
    if (!node) return void 0;
    const index = this.children.indexOf(node);
    if (index > -1) {
      this.children.splice(index, 1);
    }
    this.clearFlatNodeOnLink();
  }

  public remove() {
    const parent = this._parent;
    if (parent) {
      const index = parent.children.indexOf(this);
      if (index > -1) {
        this.children.splice(index, 1);
      }
      this.clearFlatNodeOnLink();
    }
  }

}
```

在我们的层级关系节点建立完成后，我们就可以通过遍历获取当前节点的所有要渲染内容顺序了。当然在这里我们由于事件处理的会更多一些，所以我们在这里直接将其反转。在先前的描述中，由于我们是自行实现的轻量`DOM`，所以可以在其中加入缓存，关于顺序我们可以很明显地看出来这是树状的结构，因此在层级上的每个节点都可以加入子节点的缓存，例如在`root`节点就有所有节点内容的集合，这是比较典型的空间换时间的方法。

由于我们加入了缓存，我们就必须设计缓存的清理方式，在这里我们可以直接简单地认为所有的节点`append/remove`都需要清理当前节点以及整个链路直到`root`节点的缓存。假如我们是二叉树的结构，并且我们操作的节点是某个节点的右子树，那么这个节点的左子树的缓存便依旧存在，此时我们再次获取需要渲染的节点时就可以直接读取左子树的缓存，由此来获取效率上的提升。

```js
export class Node {
  // ...
  public getFlatNode() {
    if (this.flatNodes) return this.flatNodes;
    // 右子树优先后序遍历 保证事件调用的顺序
    const nodes: Node[] = [];
    const reverse = [...this.children].reverse();
    reverse.forEach(node => {
      nodes.push(...node.getFlatNode());
      nodes.push(node);
    });
    this.flatNodes = nodes;
    return nodes;
   }

  public clearFlatNode() {
    this.flatNodes = null;
  }

  public clearFlatNodeOnLink() {
    this.clearFlatNode();
    let node: Node | null = this.parent;
    while (node) {
      node.clearFlatNode();
      node = node.parent;
    }
  }
}
```

至此，我们可以根据渲染顺序获得所有节点，那么再根据之前的插件化设计以及按需渲染的能力，当我们需要渲染某个节点时，我们只需要调用`drawingEffect`方法，然后在这里会通过`collectEffects`收集会被影响的节点。在这里的操作我们是需要关注到的问题，假如此时我们的某个图形发生了变化，此时如果我们仅仅绘制当前的节点是不行的，例如图形`A`与图形`B`重叠了一部分，此时`A`的层级比`B`的层级高，也就是说`A`的一部分会叠在`B`上边，然后此时我们修改了`B`图形的属性时会导致`B`节点的重绘，那么此时我们也必须要将`A`重新绘制，否则会导致此时的`B`的重叠部分会渲染在`A`图形之上，所以在这里的渲染范围我们就需要重新计算一下。

那么接下来当我们收集到所有影响到的图形之后，我们就需要通过不断地将所有影响到的`range`进行`compose`，也就是将其影响的范围扩大，然后通过`batchDrawing`将一段事件内的影响到的图形范围收集起来，然后再统一将所有的节点绘制出来。在这里还需要注意的是，我们的`collectEffects`通过`root`获取的节点顺序是最开始设计的事件调用顺序相反的，所以在这里的查找受影响节点时的遍历顺序是相反的。

```js
export class Mask {
  private range: Range | null;
  private effects: Set<Node> | null;
  private canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  private timer: ReturnType<typeof setTimeout> | null;

  private collectEffects(range: Range) {
    // 判定`range`范围内影响的节点
    const effects = new Set<Node>();
    const nodes: Node[] = this.engine.root.getFlatNode(false);
    // 渲染顺序和事件调用顺序相反
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      // 需要排除`root`否则必然导致全量重绘
      if (node === this.engine.root) continue;
      if (!this.editor.canvas.isOutside(node.range) && range.intersect(node.range)) {
        effects.add(node);
      }
    }
    return effects;
  }

  private drawing(effects: Set<Node>, range: Range) {
    // 只读状态下不进行绘制
    if (this.editor.state.get(EDITOR_STATE.READONLY)) return void 0;
    const { x, y, width, height } = range.rect();
    // 只绘制受影响的节点并且裁剪多余位置
    this.clear(range);
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(x, y, width, height);
    this.ctx.clip();
    effects.forEach(node => node.drawingMask?.(this.ctx));
    this.ctx.closePath();
    this.ctx.restore();
  }

  private batchDrawing(effects: Set<Node>, range: Range) {
    // COMPAT: 防止瞬时多次绘制时闪动
    this.range = this.range ? this.range.compose(range) : range;
    this.effects = new Set([...(this.effects || []), ...effects]);
    if (!this.timer) {
      this.timer = setTimeout(() => {
        const currentRange = this.range || range;
        const currentEffects = this.effects || effects;
        this.editor.logger.debug("Mask Effects", currentEffects);
        this.drawing(currentEffects, currentRange);
        this.timer = null;
        this.range = null;
        this.effects = null;
      }, 16.7);
    }
  }

  public drawingEffect(range: Range, options?: DrawingEffectOptions) {
    const { immediately = false, force = false } = options || {};
    // 非默认模式下不需要绘制`Mask`
    if (!force && !this.engine.isDefaultMode()) return void 0;
    // COMPAT: 选区范围未能完全覆盖
    const current = range.zoom(this.editor.canvas.devicePixelRatio);
    // 增量绘制`range`范围内的节点
    const effects = this.collectEffects(current);
    immediately ? this.drawing(effects, current) : this.batchDrawing(effects, current);
  }
}
```


## 事件管理

在渲染的基础上，我们还需要考虑事件的实现，例如我们的选中状态、点击行为、拖拽行为等。我们以八个顶点元素调整大小的节点为例，这些点的元素一定是在选区节点的上层的，无论是渲染的顺序还是事件的调度顺序。那么假如现在我们需要实现`onMouseEnter`事件的模拟，那么因为`Resize`这八个点位与选区节点是有一定重叠的，所以如果此时鼠标移动到重叠的点因为`Resize`的实际渲染位置更高，所以只应该触发这个点的事件而不应该触发后边的选区节点事件。

实际上由于没有`DOM`结构的存在我们就只能使用坐标计算，那么在这里我们最简单的方法就是保证整个遍历的顺序，也就是说高节点的遍历一定是要先于低节点的，当我们找到这个节点就结束遍历然后触发事件，事件的捕获与冒泡机制我们也需要模拟。在上边我们也提到了，实际上这个顺序跟渲染是反过来的，也就是说我们渲染在最顶点的元素通常是最后渲染的，但是由于其是在最顶端，事件的分发应该是首先调度的。

```
     A
   /   \
  B     C
```

假设我们的三个节点`A`、`B`、`C`如上所示，假设此时三个节点是重叠的，那么在不考虑`zIndex`的情况下，按照我们之前设计的渲染逻辑，则渲染顺序为`A -> B -> C`，此时`C`节点应该是在最上方的，其次是`B`节点，最后是`A`节点。那么在我们的捕获事件调度中，则事件调用的顺序就应该是`C -> B -> A`，也就是说其顺序是与渲染顺序相反的。实际上这里还需要关注的是，子元素通常是会渲染在父元素之上的，也就是子元素的渲染顺序通常是晚于父元素的，因此在捕获事件的调度上就是子元素通常比父元素优先调度。

那么对于我们的数据结构而言，我们遍历时想要的是优先顶部的元素，整体调度的方式更像树的右子树优先后序遍历，也就是把前序遍历的输出、左子树、右子树三个位置调换一下即可。但是新的问题来了，在`onMouseMove`这种高频事件触发的时候，我们每次都去计算节点的位置并且采用深度优先遍历，是非常耗费性能的。所以我们在这里再来聊一下前边提到的缓存，将当前节点的子节点按顺序全部存储起来，如果有节点的变动，就直接通知该节点的所有每一层父节点重新计算，这里做成按需计算即可，这样当另一颗子树不变的时候还可以节省下次计算的时间，并且存储的是节点的引用，不会有太大的消耗，这样就变递归为迭代了。

那么由于`DOM`的事件流是非常适用于我们的事件调度场景的，所以我们也需要将其模拟出来，并且实际上由于存在`CSS`的`pointerEvents: none`，我们也可以通过标记`ignoreEvent`来过滤这部分节点。假设我们此时点击了某个元素，那么这个元素就是事件最终调度的阶段，而因为这个节点是事件源，相当于找到了当前的节点，在模拟捕获与冒泡的时候就不需要再递归触发了，通过两个栈即可模拟。


```js
export class Root extends Node {

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
  
}
```

那么在事件的模拟中我们需要从根节点`root`出发，由于先前的设计，我们不需要扁平化地调整每个`Node`的事件，而是只需要保证事件是从`ROOT`节点起始，最终又在`ROOT`上结束即可，并且整个树形结构以及状态是靠插件利用`DOM`的`API`来实现的，我们管理只需要处理`ROOT`就好了，这样就会很方便，因此我们的状态管理就可以基于这种设计实现。

```js
export class Root extends Node {

  private onMouseDownController = (e: globalThis.MouseEvent) => {
    this.cursor = Point.from(e, this.editor);
    // 非默认状态下不执行事件
    if (!this.engine.isDefaultMode()) return void 0;
    // 按事件顺序获取节点
    // ...
    hit && this.emit(hit, NODE_EVENT.MOUSE_DOWN, MouseEvent.from(e, this.editor));
  };

  private onMouseMoveBasic = (e: globalThis.MouseEvent) => {
    this.cursor = Point.from(e, this.editor);
    // 非默认状态下不执行事件
    if (!this.engine.isDefaultMode()) return void 0;
    // 按事件顺序获取节点
    // ...
    // 如果命中节点且没有暂存的`hover`节点
    // ...
  };
  private onMouseMoveController = throttle(this.onMouseMoveBasic, ...THE_CONFIG);

  private onMouseUpController = (e: globalThis.MouseEvent) => {
    // 非默认状态下不执行事件
    if (!this.engine.isDefaultMode()) return void 0;
    // 按事件顺序获取节点
    // ...
    hit && this.emit(hit, NODE_EVENT.MOUSE_UP, MouseEvent.from(e, this.editor));
  };
}
```


## 最后
在这里我们依旧关注在`Canvas`相关的内容设计上，聊到了在我们先前实现的轻量级`DOM`基础上如何管理事件的调度顺序以及多层级渲染的能力设计，且对于整体渲染与事件的调度节点顺序实现了数据缓存，模拟了事件的捕获与冒泡的调度，并且简单聊到了如何按需渲染的问题。那么接下来，我们会聊到对于`Canvas`画布的焦点实现以及无限画布的相关内容，并且由于当前我们已经基于`DOM`模拟实现了事件与模拟系统，我们还可以继续聊一聊节点的拖拽、选中、框选、`Resize`、以及参考线相关的问题，在我们聊完整个系统的图形插件化设计之后，我们还可以研究一下如何在`Canvas`上绘制富文本能力。


## 每日一题

- <https://github.com/WindRunnerMax/EveryDay>

## 参考

- <https://github.com/WindRunnerMax/CanvasEditor>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas>
- <https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D>

