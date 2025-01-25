# Graph State Management in the Canvas Editor

Previously, we discussed the design of data structures and data manipulation within the clipboard, which leaned more towards data-centric operations. Now, let's shift our focus to basic graphic rendering and graphic state management, or in other words, we need to implement a lightweight `DOM`.

* Online Editor: <https://windrunnermax.github.io/CanvasEditor>
* Open Source Repository: <https://github.com/WindrunnerMax/CanvasEditor>

Related articles on the `Canvas` resume editor project:

* [I often get recommended Canvas on Juejin, so I learned Canvas and created a resume editor](https://juejin.cn/post/7329799331216015395)
* [Canvas Graphic Editor - Data Structures and History (undo/redo)](https://juejin.cn/post/7331575219957366836)
* [Canvas Graphic Editor - What Data is in My Clipboard](https://juejin.cn/post/7331992322233024548)
* [Canvas Resume Editor - Graphic Rendering and State Management (Lightweight DOM)](https://juejin.cn/spost/7354986873733333055)
* [Canvas Resume Editor - Monorepo + Rspack Engineering Practice](https://juejin.cn/spost/7357349281885503500)
* [Canvas Resume Editor - Hierarchical Rendering and Event Management Capabilities Design](https://juejin.cn/spost/7376197082203684873)

## Graphic Rendering
When working on a project, we must start from the requirements. First, it is essential to clarify that we are developing a resume editor, which only requires a limited variety of graphic types: rectangles, images, and rich text shapes. Thus, we can conveniently abstract this: we can assume that any element is a rectangle to achieve our goal.

Since rendering rectangles is quite straightforward, we can abstract this part of the graphics directly from the data structure. The base class for graphic elements includes the definitive properties `x, y, width,` and `height`, and with the addition of a hierarchical structure, we incorporate a `z` value. Furthermore, because we need to identify the graphics, we also assign an `id`.

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

Our graphics will undoubtedly have numerous properties. For instance, a rectangle exists with background, border size, and color, while rich text will require attributes to render specific content. Therefore, we need an object to store this content, and since our implementation is plugin-based, the actual graphic rendering should be handled by the plugins themselves. This part needs to be implemented by subclasses.

```js
abstract class Delta {
  // ...
  public attrs: DeltaAttributes;
  public abstract drawing: (ctx: CanvasRenderingContext2D) => void;
}
```

As for the rendering process, we consider dividing it into two layers. The inner `Canvas` is meant for drawing the specific graphics, where we anticipate implementing incremental updates. Conversely, the outer `Canvas` is responsible for rendering intermediate states, such as selected graphics, multiple selections, and adjusting graphic positions/sizes; this will refresh entirely, and we may also draw a ruler in this layer later on.

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c6d1f2df03dc43e0a89456620320a27c~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1324&h=450&s=289416&e=png&b=202124)

A crucial point to note here is that, since our `Canvas` doesn't use vector graphics, if we directly set the `width x height` of the editor on a `1080P` display, there won't be any issues. However, if we encounter a `2K` or `4K` display, blurriness can occur. Thus, we need to obtain the `devicePixelRatio`, which is the ratio of physical pixels to device-independent pixels. We can acquire this value from `window` to control the `size` attributes of the `Canvas` element.

```js
this.canvas.width = width * ratio;
this.canvas.height = height * ratio;
this.canvas.style.width = width + "px";
this.canvas.style.height = height + "px";
```

At this point, we also need to handle the `resize` issue. We can use `resize-observer-polyfill` to implement this part of the functionality, but it's essential to ensure that our `width` and `height` are integers; otherwise, the graphics in the editor may become blurry.

```js
private onResizeBasic = (entries: ResizeObserverEntry[]) => {
  // COMPAT: `onResize` triggers the initial `render`
  const [entry] = entries;
  if (!entry) return void 0;
  // Set macro task queue
  setTimeout(() => {
    const { width, height } = entry.contentRect;
    this.width = width;
    this.height = height;
    this.reset();
    this.editor.event.trigger(EDITOR_EVENT.RESIZE, { width, height });
  }, 0);
};
```

In reality, when we are implementing a complete graphic editor, it may not be just about complete rectangular nodes. For instance, when drawing irregular shapes like clouds, we need to place the relevant node coordinates in `attrs` and complete the calculation of `Bezier` curves during the actual drawing process. However, we also need to address a crucial question: how to determine whether a clicked point is inside or outside the shape? If it’s inside the shape, the node should be selected upon clicking, while if it's outside, no selection should occur. Since we are dealing with closed shapes, we can employ the ray casting method to achieve this. We send a ray from the point in one direction; if the number of nodes it crosses is odd, it indicates that the point is inside the shape, whereas an even number signifies that the point is outside the shape.

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1b4e3bf204b34ecea569786a67962108~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=946&h=502&s=130221&e=png&b=ffffff)

Simply drawing the shapes is not enough; we must also implement relevant interaction capabilities. During the implementation of these interactions, I encountered a somewhat tricky issue—since there is no `DOM`, every operation must be calculated based on positional information. For example, when resizing a shape, the resize points need to be in a selected state, and the click must precisely align with those points with a specific offset. Subsequently, we adjust the shape's size based on `MouseMove` events. In fact, there are numerous interactions to consider here, including multi-selection, drag selection, and `Hover` effects—all of which are executed through the three events: `MouseDown`, `MouseMove`, and `MouseUp`. Therefore, managing state and rendering `UI` interactions becomes a complex challenge. Here, I can only think of carrying different `Payloads` based on the various states to facilitate the drawing of interactions.

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

## State Management
When implementing interactions, I pondered for a long time over how to best achieve this capability. As mentioned earlier, there is no `DOM` here, so initially, I implemented a rather chaotic state management system using `MouseDown`, `MouseMove`, and `MouseUp`. This approach was entirely event-driven, executing related side effects to invoke methods for redrawing the `Mask Canvas` layer.

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

Later, I felt that maintaining this kind of code was practically impossible, so I decided to make some changes. I stored all the necessary states in a single `Store` and managed event notifications for state changes through my custom event management. This way, I could strictly control what would be drawn based on the type of state change, effectively abstracting a layer of related logic. However, it does mean that I now maintain a large number of interrelated states, resulting in many `if/else` statements to handle different types of state changes. Although the state management has improved somewhat compared to before—allowing me to know exactly where state changes originate from—it still remains challenging to maintain.

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

Ultimately, I pondered whether the `DOM` we manipulate in the browser truly exists, or whether the windows we manage on a `PC` are really there. The answer is definitely no. Although we can easily perform various operations through the APIs provided by the system or the browser, what we see is actually drawn by the system—essentially graphics. Events, states, collision detection, and so on are all simulated by the system, and our `Canvas` possesses similar graphical programming capabilities.

Therefore, we can certainly implement `DOM`-like capabilities here, as what I want to achieve seems to fundamentally involve the connection between `DOM` and events. The `DOM` structure is a well-established design, with some excellent design features such as the event flow. This allows us to ensure that events originate from the `ROOT` node and ultimately end at the same point, rather than flattening out each `Node`'s events. Moreover, the entire tree structure and its state are created through user interaction with the `DOM` API, meaning we only need to manage the `ROOT`. This approach makes things much easier, and the next phase of state management will be prepared using this method; hence, we will first implement a base class for `Node`.

```js
class Node {
  private _range: Range;
  private _parent: Node | null;
  public readonly children: Node[];

  // Implementing event flow as simply as possible
  // Directly deciding on capture/bubble through `bubble`
  protected onMouseDown?: (event: MouseEvent) => void;
  protected onMouseUp?: (event: MouseEvent) => void;
  protected onMouseEnter?: (event: MouseEvent) => void;
  protected onMouseLeave?: (event: MouseEvent) => void;

  // `Canvas` drawing node
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

Next, we just need to define the `Body` element similar to `HTML`, here we will set it as the `Root` node, which inherits from the `Node` class. In this setup, we take control of the entire editor's event dispatching; events inherited from this point can be dispatched to child nodes. For instance, our click events can simply set up the `MouseDown` event handler in child nodes. Furthermore, we need to design the capability for event dispatching; we can also implement event capturing and bubbling mechanisms, allowing us to easily handle event triggers using a stack.

```js
export class Root extends Node {
  constructor(private editor: Editor, private engine: Canvas) {
    super(Range.from(0, 0));
  }

  public getFlatNode(isEventCall = true): Node[] {
    // No matching needed in non-default state
    if (!this.engine.isDefaultMode()) return [];
    // Actual order of event calls // Render order is the opposite
    const flatNodes: Node[] = [...super.getFlatNode(), this];
    return isEventCall ? flatNodes.filter(node => !node.ignoreEvent) : flatNodes;
  }

  public onMouseDown = (e: MouseEvent) => {
    this.editor.canvas.mask.setCursorState(null);
    !e.shiftKey && this.editor.selection.clearActiveDeltas();
  };
```

```typescript
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
    // Execute event on the node itself
    const eventFn = target[type as keyof NodeEvent];
    eventFn && eventFn(event);
    // Events executed during the bubble phase
    for (const node of stack) {
        if (!event.bubble) break;
        const eventFn = node[type as keyof NodeEvent];
        eventFn && eventFn(event);
    }
}

private onMouseDownController = (e: globalThis.MouseEvent) => {
    this.cursor = Point.from(e, this.editor);
    // Do not execute events when not in default mode
    if (!this.engine.isDefaultMode()) return void 0;
    // Retrieve nodes in event sequence
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
    // Do not execute events when not in default mode
    if (!this.engine.isDefaultMode()) return void 0;
    // Retrieve nodes in event sequence
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
};

private onMouseMoveController = throttle(this.onMouseMoveBasic, ...THE_CONFIG);
```

```typescript
private onMouseUpController = (e: globalThis.MouseEvent) => {
  // Do not execute the event if not in default mode
  if (!this.engine.isDefaultMode()) return void 0;
  // Retrieve nodes in order of events
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
```

Now, all we need to do is define the relevant node types, and by distinguishing between different types, we can implement various functions. For example, use the `ElementNode` for drawing shapes, `ResizeNode` for resizing nodes, and `FrameNode` for selecting content. Let's take a look at the `ElementNode`, which represents the actual node.

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

## Summary
Here, we discussed how to abstract basic shape drawing and state management. Our requirements lead to a relatively simple design for the drawing capabilities, while the state management underwent three iterations before we settled on a lightweight `DOM` approach. Next, we will need to discuss how to design capabilities for hierarchical rendering and event management.

## Daily Challenge

- <https://github.com/WindRunnerMax/EveryDay>

## References
```

- <https://github.com/WindRunnerMax/CanvasEditor>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas>
- <https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D>