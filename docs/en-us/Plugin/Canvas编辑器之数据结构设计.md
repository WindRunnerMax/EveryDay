# Data Structure Design of Canvas Editor

This is a follow-up content as part of the series [Juejin pushed me to learn Canvas, so I made a resume editor with Canvas](https://juejin.cn/post/7329799331216015395), mainly introducing the design of data structure and implementation of the `History` capability.

* Online Editor: <https://windrunnermax.github.io/CanvasEditor>
* Open Source Repository: <https://github.com/WindrunnerMax/CanvasEditor>

Related articles about the `Canvas` resume editor project:

* [Juejin pushed me to learn Canvas, so I made a resume editor with Canvas](https://juejin.cn/post/7329799331216015395)
* [Canvas Graphics Editor-Data Structure and History (undo/redo)](https://juejin.cn/post/7331575219957366836)
* [Canvas Graphics Editor-What Data is in My Clipboard](https://juejin.cn/post/7331992322233024548)
* [Canvas Resume Editor-Graphic Drawing and State Management (Lightweight DOM)](https://juejin.cn/spost/7354986873733333055)
* [Canvas Resume Editor-Monorepo+Rspack Engineering Practice](https://juejin.cn/spost/7357349281885503500)
* [Canvas Resume Editor-Layer Rendering and Event Management Capability Design](https://juejin.cn/spost/7376197082203684873)

## Description
For an editor, `History`, which includes `undo` and `redo`, is an essential capability. There are generally two methods to implement the history recording:

1. Store full snapshots, meaning that every operation requires storing the full data usually in `JSON` format in an array. If the user triggers `redo`, the full data is retrieved and applied to the `Editor` object. The advantage of this implementation is simplicity with minimal design required, but the drawback is the potential memory explosion with extensive operations.

2. Implement based on `Op`, where `Op` represents an atomic record for an operation. For example, if shape `A` is moved `3px` to the right, the `Op` could be `type: "MOVE", offset: [3, 0]`. To perform a rollback operation, the reverse operation like `type: "MOVE", offset: [-3, 0]` is needed. This method offers finer granularity, reduces storage pressure, but demands complex design and calculation.

Since we are starting from scratch to design an editor, it's unlikely that we would choose solution `1`. We are more inclined to design atomic `Op` structures to achieve `History`. Therefore, when embarking on this path, we need to first design the data structure.

## Data Structure
I highly recommend taking a look at the data structure design of [quill-delta](https://www.npmjs.com/package/quill-delta/v/4.2.2), which is an excellent design. It can describe a rich text document and handle complete insertions, deletions, and modifications through `change` to the rich text. It also offers operations like `compose`, `invert`, `diff` on data, and serves as an implementation of rich text Operational Transformation (`OT`) algorithm. The design is truly remarkable.

Initially, I had no experience in designing data structures, let alone discussing the design of `Op` to implement history recording. Therefore, while designing the data structure, I found myself pondering and struggling as achieving a data description level like `quill-delta` was nearly impossible. Hence, I resorted to a simplistic design based on my own thoughts, which may still undergo further refinements in the future.

Given my lack of prior experience with `Canvas`, my primary goal is learning. I want to keep all implementations as simple as possible. Therefore, I consider all elements to be rectangles since drawing rectangles is relatively straightforward. Thus, the base class of graphic elements should have `x, y, width, height` attributes, along with a layer structure, which includes an additional `z`. Moreover, for identifying graphics, each element requires an `id` attribute.

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

As I aim to achieve a plugin-based implementation, where all shapes should inherit from this class, the custom function body needs to store its own data. Hence, I include an `attrs` property, defined as `Record<string, string>`, to store data. Since each graphic's drawing should be implemented by its subclass, an abstract method for drawing functions needs to be defined. This establishes the foundation of the data structure. We can further discuss the plugin-based design in the upcoming discussions.

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

So now that we have the basic data structure in place, let's think about what operations we should have. After some consideration, we concluded that there are five main operations: `INSERT`, `DELETE`, `MOVE`, `RESIZE`, and `REVISE`. These five `Op` operations cover all the actions we can perform on the current editor graphics. Therefore, all our subsequent design will revolve around these five operations.

It may sound simple at first glance, but designing it effectively is not an easy task. Since our goal is `History`, we not only need to consider forward operations but also carefully design the `invert` function to handle reverse operations. Taking the example of a previous `MOVE` operation, when we move an element using `MOVE(3, 0)`, the corresponding reverse operation should be automatically generated as `MOVE(3, 0).invert = MOVE(-3, 0)`. What about `RESIZE` operations, especially when resizing multiple elements simultaneously? We need to ensure that inverse operations can be implemented. One approach is to record the movement distances of each point, but this would lead to excessive information stored for each `Op`. Similarly, for `REVISE`, we need to include both the previous and new values of attributes in the `Op` to execute it correctly.

So, how can we effectively address this challenge? It becomes evident that if we aim to use lightweight data to carry the content, storing unnecessary previous data that may not be used is not ideal. Hence, automatically extracting relevant content as `invert-op` is a feasible solution. When performing the `invert` operation, we can simply pass the `Delta` before the operation as a parameter. By verifying it, the function signature would be `Op.invert(Delta) = Op'`.

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

This looks promising, so we can now move forward with designing the complete set of `Op` and `Invert` methods. Initially, I intended to design the ability to combine several graphics for future expansion, hence I reserved a `parentId` field for later development but it's not currently needed and can be disregarded. The `Invert` operation essentially involves transforming operations `case by case`: `INSERT -> DELETE`, `DELETE -> INSERT`, `MOVE -> MOVE`, `RESIZE -> RESIZE`, and `REVISE -> REVISE`. The `DeltaSet` here can be understood as all the current `Delta` data, with a type signature similar to `Record<string, Delta>`, maintaining a flat structure for easier data retrieval.

```js
export type OpPayload = {
  [OP_TYPE.INSERT]: { delta: Delta; parentId: string };
  [OP_TYPE.DELETE]: { id: string; parentId: string };
  [OP_TYPE.MOVE]: { ids: string[]; x: number; y: number };
  [OP_TYPE.RESIZE]: { id: string; x: number; y: number; width: number; height: number };
  [OP_TYPE.REVISE]: { id: string; attrs: DeltaAttributes };
};
```

```typescript
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
Now that we have designed the atomic operations and data structures based on `Op`, we can move on to implementing the `History` capability. Here, it's important to note that we had the idea of automatically generating `InvertOp` based on `DeltaSet`. There are two ways to achieve this.

1. The first approach is to generate an `InvertOp` based on the current `DeltaSet` before applying `Op`, and then store this `Op` in the `History` module for undo operations.

2. The second approach is to first create a new `Previous DeltaSet`, which is an `immer` copy, before applying `Op`. Then, both `Prev DeltaSet` and `Next DeltaSet` are passed to the `History` module as an `OnChangeEvent` for further operations.

In the end, I chose the second approach for implementation without any specific reasons. I just felt that the `immer` copy might be used not only here but also as part of the event distribution of previous data values. So, the general implementation of applying `Op` looks like this.

```js
public apply(op: OpSetType, applyOptions?: ApplyOptions) {
    const options = applyOptions || { source: "user", undoable: true };
    const previous = new DeltaSet(this.editor.deltaSet.getDeltas());

    switch (op.type) {
      // Perform different operations based on different `Op`
    }

    this.editor.event.trigger(EDITOR_EVENT.CONTENT_CHANGE, {
      previous,
      current: this.editor.deltaSet,
      changes: op,
      options,
    });
}
```

In fact, we can also see that the internal communication of the entire editor relies on the `event` module. In other words, this `apply` function does not directly call related content of `History`. Our `History` module independently mounts the `CONTENT_CHANGE` event. Next, we need to design the data storage of the `History` module. First, let's clarify what we want to achieve. The atomic `Op` has been designed, so when designing the `History` module, there is no need to save snapshots in full. However, it may not be ideal if each operation needs to be incorporated into the `History Stack`. Typically, `N` `Op` are `Undo/Redo` together. Therefore, this module should have a timer, a cache array, and a maximum time. If no new `Op` is added within `N` milliseconds, the `Op` will be incorporated into the `History Stack`. Additionally, there should be regular `undo stack` and `redo stack`, and the contents stored in the stack should not be very large, so the maximum storage capacity also needs to be set.

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

As mentioned earlier, we communicate through events, so we need to mount events here first, and prepare the `Op` of `Invert` and place it in the cache of batch operations.

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

Later, I thought about a problem - what if the user performs an `Undo` operation within these `N` milliseconds? After some thought, it's actually quite simple. At this point, we just need to clear the timer, immediately place the temporarily stored `Op[]` in the `Redo Stack`.

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

The actual `redo` and `undo` operations will be performed next. However, here the batch operation is done by looping through each `Op` and applying them individually. This doesn't feel quite good since it requires multiple modifications. Although I will only perform batch rendering once later, the number of event triggers here seems a bit excessive. Additionally, there is one point to note: the operations performed in the `History` module should not be recorded again in the `History` itself, so there is a `ApplyOptions` setting here that needs attention. Furthermore, after `undo`, this part of the content needs to be inverted again and added to the `redo stack`, and vice versa. At this point, we can directly take the `DeltaSet` of the current editor.

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

## Conclusion
In this article, we summarized the design of the data structures in our graphic editor and the implementation of the `History` module. Although it does not involve the `Canvas` itself for now, these are all basic capabilities of the editor and are also common skills that can be learned. There are still many other capabilities that we can introduce later, such as copy-paste module, canvas layering, event management, infinite canvas, on-demand drawing, performance optimization, focus control, reference lines, rich text, shortcuts, layer control, rendering order, event simulation, `PDF` typesetting, etc. Overall, it's quite interesting. Feel free to follow me and stay tuned for upcoming articles.

## Daily Challenge

```
https://github.com/WindRunnerMax/EveryDay
```

## References

```
https://github.com/WindRunnerMax/CanvasEditor
https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas
https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
```