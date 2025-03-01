# Canvas Editor: Selected Drawing Interaction Scheme

Previously, we discussed how to create a lightweight `DOM` based on `Canvas` and basic event combinations, and how to manage events along with the design capabilities for multi-layer rendering. Now, we will continue to build on this lightweight `DOM` foundation, focusing on implementing the selected drawing and drag-and-drop multi-selection interaction scheme.

* Online Editor: <https://windrunnermax.github.io/CanvasEditor>
* Open Source Repository: <https://github.com/WindrunnerMax/CanvasEditor>

Related articles about the `Canvas` resume editor project:

* [My Journey with Canvas: Creating a Resume Editor](https://github.com/WindRunnerMax/EveryDay/blob/master/Plugin/基于Canvas构建简历编辑器.md)
* [Canvas Graphics Editor - Data Structures and History (undo/redo)](https://github.com/WindRunnerMax/EveryDay/blob/master/Plugin/Canvas编辑器之数据结构设计.md)
* [Canvas Graphics Editor - What Data is in My Clipboard](https://github.com/WindRunnerMax/EveryDay/blob/master/Plugin/Canvas编辑器之剪贴板数据处理.md)
* [Canvas Resume Editor - Graphic Drawing and State Management (Lightweight DOM)](https://github.com/WindRunnerMax/EveryDay/blob/master/Plugin/Canvas编辑器之图形状态管理.md)
* [Canvas Resume Editor - Monorepo + Rspack Engineering Practice](https://github.com/WindRunnerMax/EveryDay/blob/master/Plugin/Canvas编辑器之Rspack工程实践.md)
* [Canvas Resume Editor - Hierarchical Rendering and Event Management Capability Design](https://github.com/WindRunnerMax/EveryDay/blob/master/Plugin/Canvas编辑器之层级渲染事件管理.md)
* [Canvas Resume Editor - Selected Drawing and Drag-and-Drop Multi-Selection Interaction Scheme](https://github.com/WindRunnerMax/EveryDay/blob/master/Plugin/Canvas编辑器之选中绘制交互方案.md)

## Selected Drawing
Let’s start by discussing the most fundamental interactions of node click selection and dragging. Before we dive into the specifics of the code implementation, let's first address the drawing of shapes. In `Canvas`, when we draw paths, we can fill them using `fill` or outline them using `stroke`. However, when outlining, we could encounter certain drawing issues if we’re not careful. 

For instance, if we want to draw a line, we can look at the drawing methods using `stroke` and `fill`. In a high-definition context `ctx.scale(devicePixel, devicePixel)`, you'll notice a difference of `0.5px` in the drawing positions, and if the baseline is `1px`, there will be a `1px` discrepancy along with a color deviation.

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

In our earlier selection drawing `frame`, we utilized `stroke` for implementation. Recently, I wanted to use it as a true outer border and discovered that drawing an `inside stroke` is indeed challenging. By reading the `stroke` documentation on `MDN`, we find that it is based on the centerline of the path, meaning `stroke` expands outward from the baseline. 

This brings up the question: if we draw a line that is `1px` wide, according to the documentation, its structure should expand from the center point of this `1px`, which is `0.5px` to either side. However, the actual effect takes the outer edge of the `1px` as the basis for expansion. This results in `1px` lines appearing `0.5px` wider after the `stroke`, and this can be tested with `lineTo(0, 100)` and `lineWidth=1`, revealing a visible width of only `0.5px`. This can be confirmed by drawing another `1px` `Path` for comparison.

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

Here, the phrase `Strokes are aligned to the center of a path` might not match my understanding of the `center of a path`. Perhaps it simply aims to convey that the `stroke` is drawn towards both sides, rather than explaining its reference position. I consulted on this issue and found that the misunderstanding stems from our interpretation. When we use the `API` to draw paths, there’s no inherent information regarding width; the coordinate data defines the shape or boundary of the path. Consequently, the initially defined path structure of `1px` is not valid. In the context of graphics, a path usually refers to the outline or lines of a geometric shape. The path itself is a mathematical abstraction with no width, merely a trajectory made up of points and segments. Thus, when we mention a stroke, we refer to a visual process of drawing lines of width along the path. 

If the issue were merely related to `frame` handling, it might not pose significant problems. However, when processing nodes, I found that using stroke to render operation nodes consistently exceeds the original width. This results in the aforementioned stroke issue. The additional `0.5px` edge makes me believe that drawing the edge of the nodes with fill is unproblematic. Only today did I realize the order was reversed—the inner stroke gets obscured by the fill. In other words, the implemented `border` width will always be halved. Thus, the correct drawing method is to fill first, then stroke. Furthermore, whether rendering frame nodes or drawing borders, the `inside stroke` in `Firefox` consistently encounters compatibility issues. Only by combining `fill` with `Path2D + clip` can we properly achieve a normal `inside stroke`.

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

We can utilize three methods to draw `inside strokes`. Of course, there are methods involving `lineTo/fillRect` to draw the `4` edges, which we have not listed, as this approach naturally avoids any issues; it is inherently a `fill` technique. Here, our main focus is on the stroke drawing problem. While `Path2D`, which also uses `fill`, is involved, we need to discuss the `clip` fill rule—`nonzero/evenodd`. By exploiting the characteristics of strokes, the first method involves drawing with double the `lineWidth` and then clipping off the external stroke parts, effectively preserving the inner stroke. The second method actively calibrates the stroke position, reducing it inward by `0.5px`, allowing for a complete stroke. The third method utilizes the `evenodd` fill rule to generate and retain the internal stroke via clipping, followed by actual filling.

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
```

```javascript
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

Earlier, we also mentioned compatibility issues with the `Firefox` browser. Testing the aforementioned implementation in `Firefox` reveals slight issues with the drawing of the `inside stroke`. In the first shape, the line at the top left is noticeably thinner than the one at the bottom right, while the second shape appears somewhat rougher. The third shape looks more finely drawn and aligns better with the `1px` rendering. Therefore, if we aim for compatible `inside stroke` rendering, the best approach would still be option three. Naturally, the method initially implemented using `lineTo/fillRect` to draw the four sides works just fine as well. We could also experiment with comparing the performance of the two approaches later.

<img src="https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/3ef3ab71bf3a49c38f5b611e65c0763f~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgV2luZHJ1bm5lck1heA==:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTgyOTk5OTk4OTI0NzIxNCJ9&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1726564839&x-orig-sign=6rRV2Fwm0cOxep8eMm7GUAg7dZM%3D" width="600px" referrerpolicy="no-referrer" />

Now, let's return to implementing the selection drawing on a lightweight `DOM`. First, we'll handle some common event implementations for the basic nodes, starting with click selection. Since we've already defined the basic event propagation, we now need to implement the event response on the `Element` nodes. At this point, we can directly manipulate the selection module, setting the current active node's `id` to that of the node group.

```javascript
// packages/core/src/canvas/dom/element.ts
export class ElementNode extends Node {
  protected onMouseDown = (e: MouseEvent) => {
    this.editor.selection.setActiveDelta(this.id);
  };
}
```

When we trigger the setting of the selection node, the selection module will combine all current `active` nodes to form a new `Range`. Based on this new `Range`, the system will determine if the event for selection change should be triggered. It's important to note that the dispatching of events here is crucial, as all selection change events in the editor will be dispatched from this point.

```javascript
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
}
```

```ts
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
```

After the event dispatch, we need to redraw the new selection after the selection changes. In fact, after the selection change, theoretically, we only need to render the nodes, but according to our previous scheduling design, we must proactively trigger the areas to be drawn as needed. Also, since the selection moves from other positions to the current area, we need to simultaneously draw the previous area while rendering. Thus, in our previous design, `SelectNode` acts both as an event handler and a renderer, akin to a `DOM` node, just that we control event binding and rendering directly through the class. In `drawingMask`'s `Shape.frame` rendering, we come back to the initial discussion on stroke and fill drawing issues.

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

## Dragging Multiple Selections
Once we have successfully implemented single shape selection and node rendering, we can easily think of two interaction issues. First, multiple shape selections, because when selecting nodes, we might not only select one, for instance, in a "select all" scenario. Secondly, dragging selected shapes, which is a common interaction method where both single and multiple selections can be repositioned by dragging the shapes. Let's first look at multiple selections. In fact, in our design above, we already support multiple selections; the `active` in the selection is of type `Set<string>`, and the `compose` method of `Selection` also supports multiple selections, so we just need to add the node's `id` to `active` when selecting nodes.

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

In addition to using the `shiftKey` for multi-selection, we can also select by dragging the mouse from a starting point, which is another method for making multiple selections. In this instance, we have designed this interaction within the `FrameNode`. The distinction here is that our starting action needs to be registered on the `Root` node, as we only consider events clicked on the `Root` node as the beginning of the selection; otherwise, we assume a click is made directly on the node itself. The core functionality of this drag selection interaction largely revolves around determining the size of the current selection area and the range of nodes it covers, placing all the overlapping node `id`s into the selection module.

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
      // Drag threshold
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
      // Retrieve all `State` nodes that intersect with the selection area
      const effects: string[] = [];
      this.editor.state.getDeltasMap().forEach(state => {
        if (latest.intersect(state.toRange())) effects.push(state.id);
      });
      this.editor.selection.setActiveDelta(...effects);
      // Redraw the maximum area dragged over
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

Speaking of which, beyond multi-selection, we may need to focus on an interaction here: the `Hover` effect. If we were implementing this with `CSS`, the problem would actually be quite simple—it's just a matter of adding a pseudo-class. However, in `Canvas`, we need to implement this effect ourselves, using `MouseEvent` to manually handle the process. The concept is fairly straightforward; we only need to maintain a `boolean` identifier to determine whether the current node is being hovered over and then decide whether to draw the current node’s `Range` based on the selection status.

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

Event dispatching is handled by the `Root` node, which mainly maintains a mutually exclusive `hoverId`. The primary goal here is to simulate the `OnMouseEnter` and `OnMouseLeave` events. The basic logic involves traversing the current nodes to identify those that need to trigger the relevant events. If the mouse is within the bounds of a node, it is considered a hit node. If the currently hovered node differs from the previous one, we evaluate specific conditions to trigger the `MouseLeave` event for the previous node and the `MouseEnter` event for the current node.

```js
// packages/core/src/canvas/state/root.ts
export class Root extends Node {
  /** Hover 节点 */
  public hover: ElementNode | ResizeNode | null;
```

```js
private onMouseMoveBasic = (e: globalThis.MouseEvent) => {
  // Do not execute the event when not in default mode
  if (!this.engine.isDefaultMode()) return void 0;
  // Retrieve nodes in event order
  const flatNode = this.getFlatNode();
  let next: ElementNode | ResizeNode | null = null;
  const point = Point.from(e, this.editor);
  for (const node of flatNode) {
    // Currently, only `ElementNode` and `ResizeNode` need to trigger `Mouse Enter/Leave` events
    const authorize = node instanceof ElementNode || node instanceof ResizeNode;
    if (authorize && node.range.include(point)) {
      next = node;
      break;
    }
  }
  // If the node hit is different from the previously hovered node
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
```

Next, let's discuss the issue of dragging and moving selection nodes. We have integrated this capability as part of `SelectNode`. When it comes to dragging, we only need to focus on binding mouse events for `MouseDown`, moving with `MouseMove`, and unbinding events with `MouseUp`. Our implementation is quite similar; however, since we need to take into account the rendering of nodes, it involves calling the `drawing` method in between. We opted for the most convenient on-demand rendering solution, which means all areas that have been dragged get redrawn. Naturally, the best option would be to only redraw the area triggered by the current event, which would enhance performance, and in this case, we are drawing just the borders of the drag rather than rendering all nodes being dragged. Additionally, we have implemented an interactive optimization where dragging will only trigger an event if it exceeds a certain threshold, thereby avoiding accidental operations.

```js
// packages/core/src/canvas/dom/select.ts
export class SelectNode extends Node {

  private onMouseDownController = (e: globalThis.MouseEvent) => {
    // Do not execute the event when not in default mode
    if (!this.editor.canvas.isDefaultMode()) return void 0;
    // Unbind existing event handlers
    this.unbindDragEvents();
    const selection = this.editor.selection.get();
    // Selection & strict click area determination
    if (!selection || !this.isInSelectRange(Point.from(e, this.editor), this.range)) {
      return void 0;
    }
    this.dragged = selection;
    this.landing = Point.from(e.clientX, e.clientY);
    this.bindDragEvents();
    this.refer.onMouseDownController();
  };
```

```typescript
private onMouseMoveBasic = (e: globalThis.MouseEvent) => {
  const selection = this.editor.selection.get();
  if (!this.landing || !selection) return void 0;
  const point = Point.from(e.clientX, e.clientY);
  const { x, y } = this.landing.diff(point);
  // Only consider dragging when exceeding the threshold
  if (!this._isDragging && (Math.abs(x) > SELECT_BIAS || Math.abs(y) > SELECT_BIAS)) {
    this._isDragging = true;
  }
  if (this._isDragging && selection) {
    const latest = selection.move(x, y);
    const zoomed = latest.zoom(RESIZE_OFS);
    // Redraw the maximum area that has been dragged
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
```

## Summary
Here, we continue to discuss the issues of stroke and fill rendering in the `Canvas` based on a lightweight `DOM`. We also explored the implementation of `inside stroke`, set up basic selection drawing and multi-select drag interactions, and achieved a `Hover` effect, along with moving dragged nodes. Moving forward, we can talk about designing the `fillRule` rules, conditionally rendering graphic nodes, and we can also delve into more interaction solutions like the `Resize` interaction scheme, the capability implementation of reference lines, and advanced text rendering schemes, among others.

## Daily Question

- <https://github.com/WindRunnerMax/EveryDay>

## References

- <https://github.com/WindRunnerMax/CanvasEditor>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas>
- <https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D>
