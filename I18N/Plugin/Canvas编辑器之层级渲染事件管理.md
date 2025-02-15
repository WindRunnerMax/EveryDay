# Canvas Resume Editor - Layered Rendering and Event Management Capability

Before discussing the capabilities related to `Canvas`, we talked about engineering practices, such as designing the `Monorepo` architecture for projects and implementing the new packaging tool `Rspack`, to manage the entire project and its hierarchical structure. Now let's go back to the content design related to `Canvas` and discuss how to manage events and the ability to render multiple layers based on the lightweight `DOM` we previously implemented.

* Online editor: <https://windrunnermax.github.io/CanvasEditor>
* Source code: <https://github.com/WindrunnerMax/CanvasEditor>

Articles related to the `Canvas` resume editor project:

* [I was recommended to use Canvas by an old miner, so I made a resume editor learning Canvas](https://juejin.cn/post/7329799331216015395)
* [Canvas Graphic Editor - Data Structure and History (undo/redo)](https://juejin.cn/post/7331575219957366836)
* [Canvas Graphic Editor - What's in my clipboard](https://juejin.cn/post/7331992322233024548)
* [Canvas Resume Editor - Graphic Drawing and State Management (lightweight DOM)](https://juejin.cn/spost/7354986873733333055)
* [Canvas Resume Editor - Monorepo+Rspack Engineering Practice](https://juejin.cn/spost/7357349281885503500)
* [Canvas Resume Editor - Layered Rendering and Event Management Capability Design](https://juejin.cn/spost/7376197082203684873)


## Layered Rendering

We mentioned earlier that we want to complete the drawing and interaction of `Canvas` by simulating the `DOM`, which is what we previously referred to as a lightweight `DOM`. Here, it obviously involves two important aspects of the `DOM`, namely `DOM` rendering and event handling. Let's first talk about the rendering aspect. Using `Canvas` is akin to setting all `DOM` elements' `position` to `absolute`, where all rendering is done relative to the `Canvas` element's position.

Thus, we need to consider overlapping scenarios. For example, let's consider elements `A` with a `zIndex` of `10`, its child element `B` with a `zIndex` of `100`, and another element `C` at the same hierarchy level as `A` with a `zIndex` of `20`. In a situation where these three elements overlap, intuitively or based on their `zIndex` values, element `B` with the highest `zIndex` value should be at the top layer.

However, running the code, we may find that the topmost element is `C` (green), followed by `B` (blue), and at the bottom is `A` (red), even though their `zIndex` relationships are `C: 20 - B: 100 - A: 10`. So, through observation, we can conclude that `zIndex` actually only considers elements at the same hierarchy level. For instance, if the `zIndex` of `A` is `10` and the `zIndex` of `B` (A's child element) is `1`, when these two elements overlap, the top element will be `B`, indicating that child elements are usually rendered above parent elements.

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

Here, we also need to simulate this behavior. However, since we don't have a browser's rendering composite layer and can only operate on one layer, we need to render based on specific strategies. Similar to the rendering strategy of the `DOM`, we render parent elements before child elements, resembling a depth-first recursive traversal for rendering sequence. The difference is that we need to sort child nodes based on `zIndex` before traversing each node to ensure the rendering overlap relationship of same-level nodes.

Therefore, when operating on various hierarchical nodes, we need to incorporate hierarchical processing for each node's operation. Each node needs to implement some operations similar to the `DOM`. To facilitate this, we can also implement other operations, such as adding caching and cleaning up cache relationships along the entire node chain.

```js
export class Node {
  // ...
  public append<T extends Node>(node: T | Empty) {
    if (!node) return void 0;
    // This is similar to Shell Sort ensuring `children` are ordered in ascending `zIndex`
    // Alternatively, `sort` can also be used as the ES standard introduced `sort` as a stable sort
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

Once our hierarchy of nodes is established, we can traverse to get the rendering order of current node's contents. Since we deal more with event handling here, we opt to reverse the order at this stage. As previously described, being a custom lightweight `DOM`, we can introduce caching within it. The structure being tree-like, we can clearly see the hierarchy. Each node at a level can have a cache of its child nodes. For instance, the `root` node can contain a collection of all node contents, which is a typical space-time trade-off method.

Adding caching entails designing a clear cache method. One straightforward approach is to consider that all `append/remove` operations on nodes need to clear the cache of the current node and the entire chain up to the `root` node. In a binary tree structure, if we operate on a node's right subtree, the left subtree's cache remains intact. Subsequently, when retrieving nodes for rendering, we can directly access the left subtree's cache for efficiency gain.

```js
export class Node {
  // ...
  public getFlatNode() {
    if (this.flatNodes) return this.flatNodes;
    // Post-order traversal with priority on right subtree to ensure event sequence
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

At this point, we can obtain all nodes in render order. Leveraging the previous plugin-based design and on-demand rendering capability, when we need to render a node, we simply call the `drawingEffect` method, which will collect affected nodes through `collectEffects`. One aspect to consider here is when a graphic undergoes a change. If, for instance,  two graphics `A` and `B` overlap, with `A` having a higher stack level than `B`, changing properties of `B` necessitates a redraw of both `A` and `B`. Failing to redraw `A` would lead to the overlapping part of `B` rendering over `A`, hence the need to recalculate the rendering scope here.

So next up, after we've collected all the affected shapes, we need to continuously `compose` all affected `ranges`, which basically expands their affected area. Then, using `batchDrawing`, we gather up the affected shape ranges within a period of events, and then proceed to uniformly draw out all nodes. It's important to note here that the order in which our `collectEffects` retrieves nodes from the `root` is the opposite of the event invocation order initially designed, so the traversal order to find affected nodes here is reversed.

```js
export class Mask {
  private range: Range | null;
  private effects: Set<Node> | null;
  private canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  private timer: ReturnType<typeof setTimeout> | null;

  private collectEffects(range: Range) {
    // Determine nodes affected within the `range`
    const effects = new Set<Node>();
    const nodes: Node[] = this.engine.root.getFlatNode(false);
    // Rendering order is opposite of event invocation order
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      // Exclude `root` to prevent complete redraw
      if (node === this.engine.root) continue;
      if (!this.editor.canvas.isOutside(node.range) && range.intersect(node.range)) {
        effects.add(node);
      }
    }
    return effects;
  }

  private drawing(effects: Set<Node>, range: Range) {
    // Skip drawing in read-only mode
    if (this.editor.state.get(EDITOR_STATE.READONLY)) return void 0;
    const { x, y, width, height } = range.rect();
    // Only draw affected nodes and clip excess areas
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
    // COMPAT: Prevent flickering during multiple instantaneous drawings
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
```

```javascript
public drawingEffect(range: Range, options?: DrawingEffectOptions) {
    const { immediately = false, force = false } = options || {};
    // Don't need to draw `Mask` if not in default mode
    if (!force && !this.engine.isDefaultMode()) return void 0;
    // COMPAT: Range does not fully cover
    const current = range.zoom(this.editor.canvas.devicePixelRatio);
    // Incrementally draw nodes within the `range`
    const effects = this.collectEffects(current);
    immediately ? this.drawing(effects, current) : this.batchDrawing(effects, current);
  }
}
```


## Event Management

In addition to rendering, we also need to consider event implementation, such as our selection state, click behavior, drag behavior, and more. Taking the example of adjusting the size with eight vertex elements, these points must be rendered above the selected nodes, regardless of the rendering order or event dispatch order. So if we need to simulate the `onMouseEnter` event now, because these eight points overlap with the selected nodes, if the mouse moves to the overlapping point at this moment, the `Resize` actual rendering position will be higher. Therefore, only the event of this point should be triggered, not the event of the selected nodes behind it.

Since there is no DOM structure present, we can only use coordinate calculations. Therefore, the simplest method here is to ensure the entire traversal order. That is to say, the traversal of higher nodes must be done before lower nodes. When we find this node, we end the traversal and trigger the event. We also need to simulate event capturing and bubbling mechanisms. As mentioned above, the order is actually opposite to the rendering. This means that the element rendered at the top is typically rendered last, but due to its location at the very top, event propagation should be dispatched first.

```
     A
   /   \
  B     C
```

Assuming our three nodes `A`, `B`, and `C` are as shown above, and assuming these nodes are currently overlapping, then without considering `zIndex`, according to our previously designed rendering logic, the rendering order would be `A -> B -> C`. At this point, node `C` should be at the top, followed by node `B`, and finally node `A`. So in our event capture dispatch, the event call order should be `C -> B -> A`, meaning the order is opposite to the rendering order. In fact, it is also worth noting that child elements are usually rendered above parent elements, meaning child elements are typically rendered later than parent elements. Therefore, in the capture event dispatch, child elements are usually scheduled before parent elements.

For our data structure, when traversing, we want elements at the top to take priority. The overall scheduling approach is more like a right subtree-first postorder traversal, meaning simply swapping the output of preorder traversal, left subtree, and right subtree positions. However, a new problem arises: in frequent events like `onMouseMove`, calculating node positions each time using depth-first traversal is very performance-intensive. So here, let's discuss caching mentioned earlier. We store all child nodes of the current node in order, and if a node changes, we directly notify all layers of parent nodes to recalculate. This can be done on demand, saving time for the next calculation when another subtree remains unchanged. Since we store references to nodes, the overhead is minimal, effectively turning recursion into iteration.

Since the DOM event flow fits our event scheduling scenario very well, we also need to simulate it. Additionally, due to the existence of `CSS` `pointerEvents: none`, we can filter out these nodes by marking them as `ignoreEvent`. For example, if we click on an element, that element becomes the final stage of event dispatch. Because this node is the event source, we have essentially found the current node. When simulating capture and bubble phases, recursive triggering is unnecessary, as it can be simulated through two stacks.
```js
export class Root extends Node {
```

```js
  private emit<T extends keyof NodeEvent>(target: Node, type: T, event: NodeEvent[T]) {
    const stack: Node[] = [];
    let node: Node | null = target.parent;
    while (node) {
      stack.push(node);
      node = node.parent;
    }
    // Events executed during the capture phase
    for (const node of stack.reverse()) {
      if (!event.capture) break;
      const eventFn = node[type as keyof NodeEvent];
      eventFn && eventFn(event);
    }
    // Event executed on the node itself
    const eventFn = target[type as keyof NodeEvent];
    eventFn && eventFn(event);
    // Events executed during the bubble phase
    for (const node of stack) {
      if (!event.bubble) break;
      const eventFn = node[type as keyof NodeEvent];
      eventFn && eventFn(event);
    }
  }
  
}
```

When simulating events, we need to start from the root node `root`. Due to the previous design, there is no need to adjust the events of each `Node` in a flat manner. Instead, we ensure that the events start from the `ROOT` node and end back at `ROOT`. The entire tree structure and state are managed by plugins using the `DOM` `API`, so we only need to deal with `ROOT` management. This makes it very convenient, and thus our state management can be implemented based on this design.

```js
export class Root extends Node {

  private onMouseDownController = (e: globalThis.MouseEvent) => {
    this.cursor = Point.from(e, this.editor);
    // Do not execute events in non-default state
    if (!this.engine.isDefaultMode()) return void 0;
    // Get nodes in order of events
    // ...
    hit && this.emit(hit, NODE_EVENT.MOUSE_DOWN, MouseEvent.from(e, this.editor));
  };

  private onMouseMoveBasic = (e: globalThis.MouseEvent) => {
    this.cursor = Point.from(e, this.editor);
    // Do not execute events in non-default state
    if (!this.engine.isDefaultMode()) return void 0;
    // Get nodes in order of events
    // ...
    // If hitting the node and no stored `hover` node
    // ...
  };
  private onMouseMoveController = throttle(this.onMouseMoveBasic, ...THE_CONFIG);

  private onMouseUpController = (e: globalThis.MouseEvent) => {
    // Do not execute events in non-default state
    if (!this.engine.isDefaultMode()) return void 0;
    // Get nodes in order of events
    // ...
    hit && this.emit(hit, NODE_EVENT.MOUSE_UP, MouseEvent.from(e, this.editor));
  };
}
```


## Summary
Here, we continue to focus on the design of `Canvas` related content, talking about how to manage the event dispatching order and the multi-level rendering capability based on the lightweight `DOM` implementation we previously achieved. We have also implemented data caching for the overall rendering and event dispatching node order, simulated event capture and bubble dispatch, and briefly discussed on-demand rendering. Next, we will delve into implementing focus on the `Canvas` canvas and the related topics of infinite canvas. Since we have already simulated events and systems based on `DOM`, we can further discuss dragging, selection, box selection, resizing of nodes, and reference line-related issues. After completing the entire system's graphic plugin design, we can also research how to draw rich text on the `Canvas` canvas.


## Daily Challenge

- <https://github.com/WindRunnerMax/EveryDay>

## Reference
```

- [CanvasEditor](https://github.com/WindRunnerMax/CanvasEditor)
- [HTML Canvas Element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas)
- [CanvasRenderingContext2D API](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D)