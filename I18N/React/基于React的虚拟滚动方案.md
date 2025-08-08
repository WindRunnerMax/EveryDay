# React-based virtual scroll solution

When rendering a list, we typically render all items in the `DOM` at once. However, this can lead to slow page responsiveness when dealing with large amounts of data, as browsers have to handle a large number of `DOM` elements. This is where virtual scrolling comes in for performance optimization. When we have a large amount of data to display in the user interface in the form of a list or table, this performance optimization technique can significantly improve user experience and application performance. In this article, we will explore the implementation of virtual scrolling in scenarios with fixed height and variable height.

## Description
Implementing virtual scrolling is not necessarily a complex task, but we need to consider many details. Before diving into the actual implementation, I pondered an interesting question: why does virtual scrolling optimize performance? When we perform `DOM` operations in a browser, is the `DOM` actually physically present at that moment, or when we manage windows on a PC, are those windows physically existing? The answer is quite clear: these views, windows, `DOM` elements, etc., are all simulated graphically. Although we can easily perform various operations through the system or browser-provided `API`, the content is essentially rendered by the system. It is achieved through external input devices generating various event signals, leading to the simulation of states and behaviors such as collision detection based on extensive calculations.

Continuing from there, I recently wanted to learn the basic operations of `Canvas`, so I implemented a very basic graphic editor engine. Since the browser's `Canvas` only provides basic graphic operations and lacks convenient `DOM` operations, all interactive events need to be simulated through mouse and keyboard events. A critical aspect of this is determining whether two graphics intersect, and deciding whether the graphic needs to be redrawn on demand for performance enhancement.

The simplest way to determine this is by iterating through all graphics to check for intersection with the upcoming graphic. However, this approach may involve complex calculations. If we can determine in advance that certain graphics cannot intersect, we can save many unnecessary computations. Similar principles apply to layers outside the viewport: if we can ascertain that a graphic is outside the viewport, there is no need to check for intersection, and it doesn't need to be rendered. Virtual scrolling works on a similar principle. By reducing the number of `DOM` elements, we can reduce computations and thereby enhance the runtime performance of the entire page. This, in turn, improves the first-screen performance since reducing the number of `DOM` elements will speed up initial rendering.

Of course, the above reflections are my thoughts on enhancing page interactivity or runtime performance. In the community, there are many discussions on optimizing performance through virtual scrolling. For instance, reducing the number of `DOM` elements can decrease the memory footprint of the browser, allowing for quicker user responsiveness. Browser `reflow` and repaint operations typically involve significant computation, which becomes more frequent and complex with an increasing number of `DOM` elements. By reducing the number of `DOM` elements through virtual scrolling, rendering performance can be significantly enhanced.

Virtual scrolling also leads to faster initial screen rendering time, particularly as full rendering of extremely large lists can prolong the first-screen rendering time. It can also reduce `Js` performance overhead for maintaining component states in `React`, especially in the presence of `Context`, which if not managed carefully, may lead to performance degradation.

The article will introduce four virtual scrolling implementation methods, including fixed-height `OnScroll` implementation and variable-height `IntersectionObserver+OnScroll` implementation. The related demos can be found at `https://github.com/WindrunnerMax/webpack-simple-environment/tree/react-virtual-list`.

## Fixed Height
In the community, there are many reference materials on virtual scrolling solutions, especially for fixed height virtual scrolling, which can be made into a very versatile solution. Here, we will take the `List` component of `ArcoDesign` as an example to explore a generic virtual scrolling implementation. In the example provided by `Arco`, we can see that it passes the `height` property. If this property is removed, virtual scrolling will not work correctly.

In practice, `Arco` calculates the height of the entire container based on the number of list elements and the height of each element. It's important to note that the scroll container should be outside the virtual scrolling container, and the area within the viewport can be offset using `transform: translateY(Npx)`. When scrolling, we need to calculate the nodes to be rendered in the current viewport based on the actual scroll distance of the scrollbar, the height of the scroll container, and the configured height of the elements. Other nodes are not rendered, achieving virtual scrolling. There are many other configuration details regarding virtual scrolling in `Arco`, which we won't delve into fully here.

```js
<List
  {/* ... */}
  virtualListProps={{
    height: 560,
  }}
  {/* ... */}
/>
```

Considering the height of each element and the number of elements, we can easily calculate the container's height. With the container height determined, we can obtain the scroll container with the scroll bar.

```js
// packages/fixed-height-scroll/src/index.tsx
// ...
const totalHeight = useMemo(() => itemHeight * list.length, [itemHeight, list.length]);
// ...
<div
  style={{ height: 500, border: "1px solid #aaa", overflow: "auto", overflowAnchor: "none" }}
  onScroll={onScroll.run}
  ref={setScroll}
>
  {scroll && (
    <div style={{ height: totalHeight, position: "relative", overflow: "hidden" }}>
      {/* ... */}
    </div>
  )}
</div>
```

Now that we have our scrolling container set up, we need to focus on the list elements we are about to display. Since we have a scrollbar and actual scrolling going on, we need to ensure our scrollbar stays in sync with our viewport. All we need to do is calculate the quotient `scrollTop / itemHeight` and use `translateY` for overall offset. Utilizing `translate` can trigger hardware acceleration. Apart from the overall offset of the list, we also need to calculate the number of elements currently in view. This calculation is straightforward because we have a fixed height; we just need to divide it by the scroll container's height, which was actually done while instantiating the component.

```js
useEffect(() => {
  if (!scroll) return void 0;
  setLen(Math.ceil(scroll.clientHeight / itemHeight));
}, [itemHeight, scroll]);

const onScroll = useThrottleFn(
  () => {
    const containerElement = container.current;
    if (!scroll || !containerElement) return void 0;
    const scrollTop = scroll.scrollTop;
    const newIndex = Math.floor(scrollTop / itemHeight);
    containerElement.style.transform = `translateY(${newIndex * itemHeight}px)`;
    setIndex(newIndex);
  },
  { wait: 17 }
);
```

## Dynamic Heights
Fixed-height virtual scrolling suits general use cases well. Here, fixed height doesn't necessarily mean the elements have a fixed height but rather that the element height can be calculated directly without needing to be rendered first. For example, the width and height of an image can be saved upon upload and then calculated based on the container width when rendering. However, there are scenarios where element heights cannot be completely predefined, such as in rich text editors for online documents, especially in text blocks where the height varies with different fonts, browser widths, etc.

We can't determine the height before rendering, making it impossible to calculate a placeholder height in advance, especially for text block structures in virtual scrolling. Hence, we need to implement a dynamic height virtual scrolling scheduling strategy to tackle this issue.

### IntersectionObserver Placeholder
Traditionally, to check if an element is within the viewport, we would listen for the `onScroll` event. Nowadays, most browsers support the `IntersectionObserver` native object, which asynchronously observes the intersection of a target element with its ancestors or the top-level document viewport. This feature is particularly useful for determining if an element is within the viewport range. Similarly, we can leverage `IntersectionObserver` to implement virtual scrolling.

It's important to note that the `IntersectionObserver` object is typically used to observe the intersection of target elements with the viewport. However, in virtual scrolling, the target elements are not rendered or do not exist, making it impossible to observe their states. Therefore, to align with the concept of `IntersectionObserver`, we need to render actual placeholders. For example, for `10k` list nodes, we would initially render `10k` placeholders. While this seems reasonable, it's only done when performance issues in the list are noticed later on, especially for optimizing page performance, particularly in complex scenarios like documents. Assuming we initially have `10k` data entries and even if each entry only renders `3` nodes, by rendering placeholders, we can optimize the initial `30k` nodes to approximately `10k` nodes. This optimization significantly contributes to performance enhancement in itself.

Additionally, at `https://caniuse.com/?search=IntersectionObserver`, you can observe that the compatibility is quite good. In cases where the browser does not support it, you can consider using the `OnScroll` solution or opt for a `polyfill`. Moving on, let's implement this part of the content. Firstly, we need to generate data. Here, it is important to note that what we refer to as indefinite height is actually termed dynamic height. The height of elements can only be obtained after they are actually rendered. Before rendering, we use estimated heights as placeholders to allow the scroll container to create scrolling effects.

```js
// packages/dynamic-height-placeholder/src/index.tsx
const LIST = Array.from({ length: 1000 }, (_, i) => {
  const height = Math.floor(Math.random() * 30) + 60;
  return {
    id: i,
    content: (
      <div style={{ height }}>
        {i}-Height: {height}
      </div>
    ),
  };
});
```

Next, we need to create an `IntersectionObserver`. Since our scroll container may not necessarily be the `window`, we must create the `IntersectionObserver` on the scroll container. Additionally, it is common practice to add a buffer to the viewport area to pre-load elements outside the viewport. This helps avoid blank areas when users scroll. The size of this buffer is usually half of the current viewport height.

```js
useLayoutEffect(() => {
  if (!scroll) return void 0;
  // Viewport threshold equals half the scroll container's height
  const margin = scroll.clientHeight / 2;
  const current = new IntersectionObserver(onIntersect, {
    root: scroll,
    rootMargin: `${margin}px 0px`,
  });
  setObserver(current);
  return () => {
    current.disconnect();
  };
}, [onIntersect, scroll]);
```

We then need to manage the state of the placeholder nodes. As we now have actual placeholders, we no longer need to estimate the height of the entire container. We simply need to render the nodes when they scroll into view. We set three states for the nodes: `loading` state for the placeholder state, where only an empty placeholder is rendered or a loading indicator is shown as we do not yet know the actual height of the node; `viewport` state for the node when it is actually rendered in the logical viewport, allowing us to record the real height of the node; `placeholder` state for the rendered placeholder status when the node has scrolled out of the viewport, with the height of the node already recorded. We can set the height of the node to the actual height.

```
loading -> viewport <-> placeholder
```

```js
type NodeState = {
  mode: "loading" | "placeholder" | "viewport";
  height: number;
};

public changeStatus = (mode: NodeState["mode"], height: number): void => {
  this.setState({ mode, height: height || this.state.height });
};

render() {
  return (
    <div ref={this.ref} data-state={this.state.mode}>
      {this.state.mode === "loading" && (
        <div style={{ height: this.state.height }}>loading...</div>
      )}
      {this.state.mode === "placeholder" && <div style={{ height: this.state.height }}></div>}
      {this.state.mode === "viewport" && this.props.content}
    </div>
  );
}
```

Furthermore, our `Observer` observation also needs to be configured. It should be noted that the callback function of `IntersectionObserver` only carries the `target` node information. We need to manage the node state by finding the actual `Node` through the node information. To facilitate this, we utilize a `WeakMap` to establish the relationship between elements and nodes for easier processing.

```js
export const ELEMENT_TO_NODE = new WeakMap<Element, Node>();
componentDidMount(): void {
  const el = this.ref.current;
  if (!el) return void 0;
  ELEMENT_TO_NODE.set(el, this);
  this.observer.observe(el);
}

componentWillUnmount(): void {
  const el = this.ref.current;
  if (!el) return void 0;
  ELEMENT_TO_NODE.delete(el);
  this.observer.unobserve(el);
}
```

Finally, the actual scrolling scheduling, when a node appears in the viewport, we need to obtain the node information based on `ELEMENT_TO_NODE`, and then set the state according to the current viewport information. If the current node is in the viewport state, we set the node status to `viewport`. If it is out of the viewport at this time, we need to further check the current state. If it is not the initial `loading` state, we can directly set the height and `placeholder` to the node status. At this point, the height of the node is the actual height.

```js
const onIntersect = useMemoizedFn((entries: IntersectionObserverEntry[]) => {
  entries.forEach(entry => {
    const node = ELEMENT_TO_NODE.get(entry.target);
    if (!node) {
      console.warn("Node Not Found", entry.target);
      return void 0;
    }
    const rect = entry.boundingClientRect;
    if (entry.isIntersecting || entry.intersectionRatio > 0) {
      // Entered viewport
      node.changeStatus("viewport", rect.height);
    } else {
      // Left viewport
      if (node.state.mode !== "loading") {
        node.changeStatus("placeholder", rect.height);
      }
    }
  });
});
```

### IntersectionObserver Virtualization
As mentioned earlier, the goal of `IntersectionObserver` is to observe the intersection state between target elements and the viewport. Our core concept of virtual scrolling is not to render elements outside the viewport. So, can we achieve virtual scrolling effects through `IntersectionObserver`? Actually, it is feasible, but it may require `OnScroll` to assist in forcibly refreshing nodes. Here, we attempt to implement a virtual list using node marking and additional rendering. However, it is important to note that because we do not use `OnScroll` to forcibly refresh nodes, blank spaces may appear when scrolling quickly.

In the previous placeholder solution, we have already implemented the basic operations of `IntersectionObserver`, so we will not go into detail here. Our core idea is to mark the beginning and end nodes of the virtual list, where the first and last nodes are rendered additionally and are essentially outside the viewport. When the state of the first and last nodes changes, we can control the pointer range of their positions through a callback function in order to achieve virtual scrolling. Therefore, before proceeding, we need to control the state of the start and end pointers properly to avoid negative values or out-of-bounds situations.

```js
// packages/dynamic-height-virtualization/src/index.tsx
const setSafeStart = useMemoizedFn((next: number | ((index: number) => number)) => {
  if (typeof next === "function") {
    setStart(v => {
      const index = next(v);
      return Math.min(Math.max(0, index), list.length);
    });
  } else {
    setStart(Math.min(Math.max(0, next), list.length));
  }
});

const setSafeEnd = useMemoizedFn((next: number | ((index: number) => number)) => {
  if (typeof next === "function") {
    setEnd(v => {
      const index = next(v);
      return Math.max(Math.min(list.length, index), 1);
    });
  } else {
    setEnd(Math.max(Math.min(list.length, next), 1));
  }
});
```

Next, we need two more arrays to manage all the nodes and their height values because at this point our nodes may not exist. Therefore, their status and height require additional variables to manage. We also need two placeholder blocks to act as placeholders for the beginning and end nodes, to achieve the scrolling effect within the scroll container. These placeholder blocks also need to be observed. Their heights need to be calculated based on the height values of the nodes. Of course, this calculation is a bit rudimentary and there is plenty of room for optimization, like maintaining an additional monotonically increasing queue to calculate heights.

```js
const instances: Node[] = useMemo(() => [], []);
const record = useMemo(() => {
  return Array.from({ length: list.length }, () => DEFAULT_HEIGHT);
}, [list]);

<div
  ref={startPlaceHolder}
  style={{ height: record.slice(0, start).reduce((a, b) => a + b, 0) }}
></div>
// ...
<div
  ref={endPlaceHolder}
  style={{ height: record.slice(end, record.length).reduce((a, b) => a + b, 0) }}
></div>
```

When rendering nodes, we need to mark their status. The data for `Node` nodes will become more extensive. Here, it is mainly necessary to label the `isFirstNode` and `isLastNode` states. The `initHeight` needs to be passed from the outside. As mentioned earlier, nodes may not exist. If we load from the beginning again, the height will be incorrect, causing scrolling to be jerky. Therefore, we need to pass `initHeight` when rendering nodes. This height value is the actual height recorded during node rendering or the placeholder height for nodes that have not been rendered yet.

```js
<Node
  scroll={scroll}
  instances={instances}
  key={item.id}
  index={item.id}
  id={item.id}
  content={item.content}
  observer={observer}
  isFirstNode={index === 0}
  initHeight={record[item.id]}
  isLastNode={index === current.length - 1}
></Node>
```

Another issue to pay attention to is viewport locking. When the height of a node outside the visible area changes, without viewport locking, there could be abrupt movement in the visible area. Additionally, we must not use smooth scrolling animations. If animations are used, other nodes changing heights during scrolling might cause viewport locking to fail, leading to abrupt changes in the viewport area. We must explicitly specify the scroll position. If animations are necessary, they must also be simulated by incrementing values slowly rather than directly using the `smooth` parameter of `scrollTo`.

```js
componentDidUpdate(prevProps: Readonly<NodeProps>, prevState: Readonly<NodeState>): void {
  if (prevState.mode === "loading" && this.state.mode === "viewport" && this.ref.current) {
    const rect = this.ref.current.getBoundingClientRect();
    const SCROLL_TOP = 0;
    if (rect.height !== prevState.height && rect.top < SCROLL_TOP) {
      this.scrollDeltaY(rect.height - prevState.height);
    }
  }
}

private scrollDeltaY = (deltaY: number): void => {
  const scroll = this.props.scroll;
  if (scroll instanceof Window) {
    scroll.scrollTo({ top: scroll.scrollY + deltaY });
  } else {
    scroll.scrollTop = scroll.scrollTop + deltaY;
  }
};
```

Now onto the key callback function handling, which involves complex state management. Firstly, there are two placeholder nodes. When these two placeholder nodes appear in the viewport, we consider it a signal to load other nodes. For the starting placeholder node, when it appears in the viewport, we need to move the starting pointer forward based on the actual viewport intersection range.

```js
const isIntersecting = entry.isIntersecting || entry.intersectionRatio > 0;
if (entry.target === startPlaceHolder.current) {
  // The starting placeholder enters the viewport
  if (isIntersecting && entry.target.clientHeight > 0) {
    const delta = entry.intersectionRect.height || 1;
    let index = start - 1;
    let count = 0;
    let increment = 0;
    while (index >= 0 && count < delta) {
      count = count + record[index];
      increment++;
      index--;
    }
    setSafeStart(index => index - increment);
  }
  return void 0;
}
if (entry.target === endPlaceHolder.current) {
  // The ending placeholder enters the viewport
  if (isIntersecting && entry.target.clientHeight > 0) {
    // ....
    setSafeEnd(end => end + increment);
  }
  return void 0;
}
```

Next, similar to the placeholder solution, we also need to retrieve node information based on `ELEMENT_TO_NODE` and then update our height record variable accordingly. Since we cannot determine the actual scrolling direction in the `IntersectionObserver` callback and it is not easy to determine the actual scrolling range, we need to control the start and end cursor pointers based on the previously mentioned `isFirstNode` and `isLastNode` information. When `FirstNode` enters the viewport, it is considered as scrolling down, and nodes in the upper range need to be rendered; while when `LastNode` enters the viewport, it is considered as scrolling up, and nodes in the lower range need to be rendered. When `FirstNode` leaves the viewport, it is considered as scrolling up, and nodes in the upper range need to be removed; and when `LastNode` leaves the viewport, it is considered as scrolling down, and nodes in the lower range need to be removed. Here, we can observe that we use `THRESHOLD` to increase the node range and `1` to decrease the node range, representing the additional rendering of start and end nodes we need.

```js
const node = ELEMENT_TO_NODE.get(entry.target);
const rect = entry.boundingClientRect;
record[node.props.index] = rect.height;
if (isIntersecting) {
  // Enters the viewport
  if (node.props.isFirstNode) {
    setSafeStart(index => index - THRESHOLD);
  }
  if (node.props.isLastNode) {
    setSafeEnd(end => end + THRESHOLD);
  }
  node.changeStatus("viewport", rect.height);
} else {
  // Leaves the viewport
  if (node.props.isFirstNode) {
    setSafeStart(index => index + 1);
  }
  if (node.props.isLastNode) {
    setSafeEnd(end => end - 1);
  }
  if (node.state.mode !== "loading") {
    node.changeStatus("placeholder", rect.height);
  }
}
```

Finally, since this state control is rather complex and comprehensive, we need to add a fallback mechanism to prevent excessive nodes remaining on the page. However, even if nodes are left behind, it is not a problem, as it degrades to the placeholder solution mentioned above, and in practice, it does not lead to an abundance of nodes. Nonetheless, we still provide a handling mechanism here, allowing nodes to be identified by their status as boundary markers that require actual processing as start and end cursor boundaries.

```js
public prevNode = (): Node | null => {
  return this.props.instances[this.props.index - 1] || null;
};
public nextNode = (): Node | null => {
  return this.props.instances[this.props.index + 1] || null;
};
// ...
const prev = node.prevNode();
const next = node.nextNode();
const isActualFirstNode = prev?.state.mode !== "viewport" && next?.state.mode === "viewport";
const isActualLastNode = prev?.state.mode === "viewport" && next?.state.mode !== "viewport";
if (isActualFirstNode) {
  setSafeStart(node.props.index - THRESHOLD);
}
if (isActualLastNode) {
  setSafeEnd(node.props.index + THRESHOLD);
}
```

### OnScroll Event Listener for Scrolling
When implementing dynamic height for virtual scrolling, we must not forget the commonly used `OnScroll` approach. In fact, compared to using `IntersectionObserver`, the simple virtual scrolling approach with `OnScroll` is easier, although it may also lead to performance issues. The core idea of using `OnScroll` is to have a scroll container and listen for the scroll event. When the scroll event is triggered, we need to calculate the nodes currently in the viewport based on the scroll position, and then determine the nodes that need to be rendered based on their height to achieve virtual scrolling.

So, what are the differences between dynamic height virtual scrolling and the fixed height virtual scrolling we first implemented? Firstly, the height of the scroll container is unknown at the beginning, and the actual height is only known during the rendering process. Secondly, we cannot directly calculate the nodes to render based on the scroll height. In the previous implementation, the starting `index` for rendering was calculated based on the scroll container height and the total height of all the nodes. However, in dynamic height virtual scrolling, we cannot obtain the total height, nor can we determine the length of nodes to render. Additionally, it's challenging to determine the distance between nodes and the top of the scroll container, i.e., the `translateY` we mentioned earlier, which is needed to extend the scroll area and enable scrolling.

But are these values really impossible to calculate? Clearly, that's not the case. Without any optimizations, these data can be calculated through brute-force traversal. In modern browsers, the performance cost of executing addition calculations is not very high. For example, performing 10,000 addition calculations consumes less than 1ms.

```js
console.time("addition time");
let count = 0;
for (let i = 0; i < 10000; i++) {
  count = count + i;
}
console.log(count);
console.timeEnd("addition time"); // 0.64306640625 ms
```

Next, we will brutishly calculate the data we need through traversal, and then discuss some basic optimization strategies. We still need to record the height because nodes may not always be in the view. Hence, we initially store placeholder heights, and update the node heights once they are actually rendered.

```js
// packages/dynamic-height-scroll/src/index.tsx
const heightTable = useMemo(() => {
  return Array.from({ length: list.length }, () => DEFAULT_HEIGHT);
}, [list]);

componentDidMount(): void {
  const el = this.ref.current;
  if (!el) return void 0;
  const rect = el.getBoundingClientRect();
  this.props.heightTable[this.props.index] = rect.height;
}
```

Do you remember the `buffer` we discussed earlier? In `IntersectionObserver`, the `rootMargin` setting is provided to maintain the viewport buffer, whereas in `OnScroll`, we need to manage it ourselves. Therefore, here we need to set a `buffer` variable, update its value and the scroll container once the scroll container is actually created.

```js
const [scroll, setScroll] = useState<HTMLDivElement | null>(null);
const buffer = useRef(0);
```  

```js
const onUpdateInformation = (el: HTMLDivElement) => {
  if (!el) return void 0;
  buffer.current = el.clientHeight / 2;
  setScroll(el);
  Promise.resolve().then(onScroll.run);
};

return (
<div
  style={{ height: 500, border: "1px solid #aaa", overflow: "auto", overflowAnchor: "none" }}
  ref={onUpdateInformation}
>
  {/* ... */}
</div>
);
```

Now let's work on two placeholder blocks. Instead of using `translateY` for overall offset, we directly use placeholder blocks to expand the scroll area. So, we need to calculate the specific placeholders based on the start and end indices. Essentially, this involves the time-consuming issue of repetitive addition calculations we mentioned earlier. Here, we directly iterate to calculate the heights.

```js
const startPlaceHolderHeight = useMemo(() => {
  return heightTable.slice(0, start).reduce((a, b) => a + b, 0);
}, [heightTable, start]);

const endPlaceHolderHeight = useMemo(() => {
  return heightTable.slice(end, heightTable.length).reduce((a, b) => a + b, 0);
}, [end, heightTable]);

return (
  <div
    style={{ height: 500, border: "1px solid #aaa", overflow: "auto", overflowAnchor: "none" }}
    onScroll={onScroll.run}
    ref={onUpdateInformation}
  >
    <div data-index={`0-${start}`} style={{ height: startPlaceHolderHeight }}></div>
    {/* ... */}
    <div data-index={`${end}-${list.length}`} style={{ height: endPlaceHolderHeight }}></div>
  </div>
);
```

Next, we need to handle the content rendering in the `onScroll` event. Mainly, we deal with the positioning of start and end indices. For the start index, we simply calculate it based on the scroll height. As we iterate through heights and the cumulative height reaches the scroll height, we consider that index as the start node to render. Regarding the end index, we need to consider both the start index and the height of the scroll container. Similarly, we iterate until we exceed the height of the scroll container to determine the end node to render. Of course, don't forget our `buffer` data in these index calculations to avoid white spaces during scrolling.

```js
const getStartIndex = (top: number) => {
  const topStart = top - buffer.current;
  let count = 0;
  let index = 0;
  while (count < topStart) {
    count = count + heightTable[index];
    index++;
  }
  return index;
};

const getEndIndex = (clientHeight: number, startIndex: number) => {
  const topEnd = clientHeight + buffer.current;
  let count = 0;
  let index = startIndex;
  while (count < topEnd) {
    count = count + heightTable[index];
    index++;
  }
  return index;
};

const onScroll = useThrottleFn(
  () => {
    if (!scroll) return void 0;
    const scrollTop = scroll.scrollTop;
    const clientHeight = scroll.clientHeight;
    const startIndex = getStartIndex(scrollTop);
    const endIndex = getEndIndex(clientHeight, startIndex);
    setStart(startIndex);
    setEnd(endIndex);
  },
  { wait: 17 }
);
```

Because what I want to discuss is the most basic principle of virtual scrolling, so there is basically no optimization in the examples here. It is obvious that our traversal handling of heights is relatively inefficient. Even though the consumption of doing thousands of addition calculations is not significant, in large applications, it is still advisable to avoid such a large amount of computation as much as possible. Therefore, an obvious optimization direction is that we can implement height caching. Simply put, we can cache the heights that have been calculated so that we can directly use the cached heights next time without the need to traverse and calculate again. When there is a height change that requires an update, we can recalculate the cached heights from the current node to the newest cached node. This method is essentially an incrementally sorted array, and searching problems can be solved using binary search or similar methods, thus avoiding extensive traversal computations.

```
height: 10 20 30 40  50  60  ...
cache:  10 30 60 100 150 210 ...
```

## Daily Question

- <https://github.com/WindrunnerMax/EveryDay>

## References

- <https://juejin.cn/post/7232856799170805820>
- <https://developer.mozilla.org/zh-CN/docs/Web/API/IntersectionObserver>
- <https://arco.design/react/components/list#%E6%97%A0%E9%99%90%E9%95%BF%E5%88%97%E8%A1%A8>