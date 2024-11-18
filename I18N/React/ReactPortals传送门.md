# React Portals - The Gateway for Component Teleportation

`React Portals` provide a solution to render child nodes to a `DOM` node outside of the parent component, allowing `JSX` to be rendered as `children` to different parts of the `DOM`. The most common use case is when a child component needs to visually break away from its parent container, such as in the case of dialogs, floating toolbars, or tooltips.

## Description

```js
<div>
  <SomeComponent />
  {createPortal(children, domNode, key?)}
</div>
```

`React Portals` can be metaphorically translated as gateways, signifying the method through which our `React` components can be transported to any specified location. It enables the rendering of a component's output to any position within the `DOM` tree, rather than just within the same `DOM` hierarchy as the component itself. To illustrate, consider the effect of using `Portal` on the entire `DOM` node when mounting a component's `DOM` structure with `ReactDOM.render` as `<div id="root"></div>`. The resulting effect varies for the same component:

```js
export const App: FC = () => {
  return (
    <React.Fragment>
      <div>123</div>
      <div className="model">
        <div>456</div>
      </div>
    </React.Fragment>
  );
};

// -> 

<body>
  <div id="root">
    <div>123</div>
    <div class="model">
      <div>456</div>
    </div>
  </div>
</body>
```

```js
export const App: FC = () => {
  return (
    <React.Fragment>
      <div>123</div>
      {ReactDOM.createPortal(
        <div className="model">
          <div>456</div>
        </div>,
        document.body
      )}
    </React.Fragment>
  );
};

// -> 

<body>
  <div id="root">
    <div>123</div>
  </div>
  {/* The `DOM` structure is mounted under the `body` */}
  <div class="model">
    <div>456</div>
  </div>
</body>
```

As seen in the above examples, using `ReactDOM.createPortal` allows us to mount the `React` component to a different `DOM` structure, in this case, to `document.body`. This practice is common, offering more flexibility in controlling the rendering behavior and resolving complex UI interaction scenarios. Typically, we can encapsulate the `Portal` component to facilitate its usage.

```js
export const Portal: React.FC = ({ children }) => {
  return typeof document === "object" ? ReactDOM.createPortal(children, document.body) : null;
};

export const App: FC = () => (
  <Portal>
    <SomeComponent />
  </Portal>
);
```

As previously discussed, the most common use of `Portals` is for dialogs or components that can be thought of as floating at the top of the entire page. These components are visually detached from the parent component in the `DOM` structure. While it is possible to manually implement related capabilities, such as creating a `div` structure and mounting it to the target `DOM` structure like `document.body`, and then using `ReactDOM.render` to render the component into the related structure, and subsequently removing the created `div` upon component unmount, this approach is feasible but not as elegant. Another method involves using state management, where relevant components are defined in advance in the target component, and their visibility is controlled using state management tools such as `redux`. However, this is akin to using a sledgehammer to crack a nut and does not warrant further discussion.

Actually, let's think about this again. Since we need to detach from the parent component's structure to achieve this capability, we don't necessarily have to use `Portals`. The `position` property in CSS can also help us detach the current DOM structure from the document flow. In other words, we don't need to physically separate the DOM structure of the target component; we just need to use `position` to achieve the effect. Of course, the idea sounds great, but the real scenario becomes much more complex. The most commonly used methods to detach from the document flow are absolute positioning (`absolute`) and fixed positioning (`fixed`). First, let's take a look at `absolute`. When using `absolute`, it's easy to realize that we need to ensure that there are no other `position` elements from the current component all the way up to the `body` that are `relative/absolute`. This condition is definitely hard to achieve, especially if we are writing a component library. It's difficult to control how many layers the user may have and what CSS properties they may use. Now, let's focus on `fixed`. `fixed` is positioned relative to the viewport, so it doesn't require the same strong conditions as `absolute`. Even if the parent element has `relative/absolute`, it doesn't matter. This matter is not so simple, though. Even a `fixed` element can still be affected by the parent element's styles. Here are two examples where this is evident: `transform` and `z-index`.

```html
<!-- Continuously changing the value of `transform: translateY(20px);` causes the `fixed` element to change continuously as well -->
<div style="transform: translateY(20px);">
  <div style="position: fixed; left: 10px; top: 10px;">
    <div style="background-color: blue; width: 10px; height: 10px;"></div>
  </div>
</div>

<!-- The parent element's `z-index` level is lower than the sibling element, so even if the `z-index` of the `fixed` element is higher, it will be obscured by the parent's sibling element -->
<div
  style="position: absolute; z-index: 100; width: 100px; height: 100px; background-color: #fff;"
></div>
<div style="position: absolute; z-index: 1">
  <div style="position: fixed; left: 10px; top: 10px; z-index: 1000">
    <div style="background-color: blue; width: 10px; height: 10px"></div>
  </div>
</div>
```

From the examples above, we can see that using only CSS positioning is not enough to completely detach from the parent component. Even if we can achieve the effect of breaking away from the document flow, it will still be affected by the parent component's styles. Especially in a component library, as a third-party component library, we have no way to control the user's designed DOM structure. If we only use methods to detach from the document flow without actually separating the DOM structure, our components will be impacted by user styles, which is not what we want to see. Furthermore, even if we are not designing a component library, but only implementing related requirements in our business, we do not want our components to be affected by the parent component, because even if our structure and style are initially fine, as the business becomes more complex, especially in multi-person cooperative development projects, it's easy to leave hidden dangers and cause unnecessary problems. Of course, we can introduce E2E to avoid related problems, which is another solution in this regard.

In conclusion, `React Portals` provide a more flexible way to control rendering behavior, which can be used to solve some complex UI interaction scenarios. Below are some common application scenarios:

* Modals and dialogs: Using `Portals`, modal or dialog components can be rendered to the top-level of the DOM tree, ensuring they can overlay other components and exist independently of other components in terms of hierarchy. This helps avoid the complexity of CSS or `z-index` properties and creates a clean container outside of the component hierarchy.
* Integration with third-party libraries: Sometimes, we may need to integrate React components with third-party libraries (such as map libraries or video players). Using `Portals` allows the components to be rendered into the DOM elements required by the third-party library, ensuring that the required additional components are rendered in the correct position and context within the original component's encapsulated DOM structure.
* Separation of logic and component reuse: `Portals` allow us to separate the rendering output of components from their logic. We can define the rendering output of a component in a separate `Portal` component and use that `Portal` where needed. This promotes component reuse and better organization and management of code.
* Dealing with stacking context: In some cases, using `Portals` can help us solve problems related to stacking context, as `Portals` can create independent DOM rendering containers, avoiding style and layout problems caused by stacking contexts.



## MouseEnter Event
Even though `React Portals` can transport components to any `DOM` node, their behavior is just like regular `React` components, they don't actually detach from the original `React` component tree. This is actually a very interesting thing because it seems like we can use this feature to implement more complex interactions. But before that, let's take a closer look at the native `DOM` events `MouseEnter` and `MouseLeave`, as well as their counterparts `MouseOver` and `MouseOut`.

- `MouseEnter`: This event is triggered when the mouse cursor enters an element. The event is only triggered when the mouse enters from outside the element and does not affect any inner child elements. For example, if there is a nested `DOM` structure `<div id="a"><div id="b"></div></div>`, when we bind the `MouseEnter` event to element `a`, the `MouseEnter` event will be triggered when the mouse moves from outside the element to inside. However, when we then move the mouse to element `b`, the `MouseEnter` event will not be triggered again.
- `MouseLeave`: This event is triggered when the mouse cursor leaves an element. The event is only triggered when the mouse leaves from inside the element and does not affect any outer parent elements. For example, if there is a nested `DOM` structure `<div id="a"><div id="b"></div></div>`, when we bind the `MouseLeave` event to element `a`, the `MouseLeave` event will be triggered when the mouse moves from inside the element to outside. If the mouse moves from element `b` to inside element `a`, the `MouseEnter` event will not be triggered.
- `MouseOver`: This event is triggered when the mouse cursor enters an element. The event is triggered when the mouse moves from outside the element to inside and bubbles up to the parent element. For example, if there is a nested `DOM` structure `<div id="a"><div id="b"></div></div>`, when we bind the `MouseOver` event to element `a`, the `MouseOver` event will be triggered when the mouse moves from outside the element to inside. When the mouse then moves to element `b`, the `MouseOver` event will be triggered again due to the bubbling from element `b` to `a`.
- `MouseOut`: This event is triggered when the mouse cursor leaves an element. The event is triggered when the mouse moves from inside the element to outside and bubbles up to the parent element. For example, if there is a nested `DOM` structure `<div id="a"><div id="b"></div></div>`, when we bind the `MouseOut` event to element `a`, the `MouseOut` event will be triggered when the mouse moves from inside the element to outside. If the mouse moves from element `b` to inside element `a`, the `MouseOut` event will be triggered again due to the bubbling.

It is important to note that `MouseEnter/MouseLeave` execute event handlers during the capturing phase and cannot be executed during the bubbling phase, while `MouseOver/MouseOut` can be executed during either the capturing or bubbling phase, depending on how `addEventListener` handles it. In fact, both event streams can be blocked, but `MouseEnter/MouseLeave` need to use `stopPropagation` during the capturing phase, which is generally not necessary. Personally, I still prefer using `MouseEnter/MouseLeave` for several reasons:

- Avoiding bubbling issues: `MouseEnter` and `MouseLeave` events do not bubble to parent or other elements. They only trigger when the mouse enters or leaves the element itself. This means we can precisely control the event triggering range and handle mouse interactions more accurately without interference from other elements, providing a better user experience.
- Avoiding repeated triggering: `MouseOver` and `MouseOut` events repeatedly trigger when the mouse hovers inside an element. When the mouse moves from one element to its child element, the `MouseOut` event triggers at the parent element and then at the child element. The `MouseOut` event also triggers multiple times. Treating parent and all child elements as independent areas, the event will bubble up to the parent element to execute the event binding function, potentially leading to repeated event handling and unnecessary logical triggers. `MouseEnter` and `MouseLeave` events do not repeatedly trigger, only triggering once when the mouse enters or leaves the element.
- Simplifying interaction logic: The characteristics of `MouseEnter` and `MouseLeave` events simplify the logic for handling mouse enter and leave interactions. We can focus solely on the element itself entering and leaving, without having to handle parent or child element events. This simplification helps improve code readability and maintainability.

Of course, whether to use `MouseEnter/MouseLeave` or `MouseOver/MouseOut` events depends on the specific business scenario. If handling mouse enter and leave for child elements is necessary or utilizing bubbling mechanisms to implement functionality, then `MouseOver` and `MouseOut` events are the better choice. `MouseEnter/MouseLeave` can provide greater flexibility and control, allowing us to create complex interactive effects and better handle user-element interactions. However, it also increases the complexity of the application accordingly.

Let's go back > Original: <https://wiki-power.com/> to the `MouseEnter/MouseLeave` events themselves. Here's a [DEMO](https://codesandbox.io/p/sandbox/trigger-component-1hv99o?file=/src/components/mouse-enter-test.tsx:1,1) that can be used to test the event effects. It's worth noting that here we are testing with the help of React's synthetic events, and during testing, it is quite obvious that the `TS` prompts for `MouseEnter/MouseLeave` do not have the `Capture` option. For example, the `Click` event has `onClick` and `onClickCapture` to indicate the binding of events in the bubble and capture phases. Even in React's synthetic events, `MouseEnter/MouseLeave` only execute in the capture phase, so there's no `Capture` event binding attribute.

```
--------------------------
|    c |      b |      a |
|      |        |        |
|-------        |        |
|               |        |
|----------------        |
|                        |
--------------------------
```

We've separately bound the `MouseEnter` event to three `DOM` elements. When we move the mouse over `a`, the event bound to the `a` element will be executed. Similarly, when we move the mouse over `a`, `b`, and `c` in sequence, the event binding functions for `a`, `b`, and `c` will be executed in that order, and it won't trigger the parent element's event due to bubbling. When we directly move the mouse to `c`, it can be seen that the events are still executed in the order of `a`, `b`, and `c`, indicating that the `MouseEnter` event depends on the capture phase execution.

## Portal Events
As mentioned earlier, despite the fact that `React Portals` can be placed anywhere in the `DOM` tree, in all other respects, they behave like regular `React` child nodes. We all know that `React` maintains its own set of synthetic events based on event delegation. Therefore, since the `Portal` still exists in the original `React` component tree, our `React` events actually still follow the rules of the original synthetic events and are not dependent on the position of the `Portal` in the `DOM` tree. This means that features like synthetic events and `Context` remain unchanged, regardless of whether the child nodes are Portals. Here are some points to note when using `React Portals`:

* Event bubbling works as expected: Synthetic events will propagate through the `React` tree to ancestors as expected, regardless of the position of the `Portal` node in the `DOM`.
* `React` controls Portal nodes and their lifecycle: The `Portal` is not detached from the `React` component tree, and when rendering child components through the Portal, `React` can still control the component's lifecycle.
* Portal only affects the `DOM` structure: For `React`, a Portal merely changes the visual rendering position, affecting only the `HTML` `DOM` structure, not the `React` component tree.
* Predefined HTML mounting point: When using `React Portal`, we need to define an HTML `DOM` element in advance as the mounting point for the Portal component.

Here's a [DEMO](https://codesandbox.io/p/sandbox/trigger-component-1hv99o?file=/src/components/portal-test.tsx:1,1) that demonstrates the effects of using Portals with MouseEnter events. The nested implementation in the code is as follows:

```
-------------------
|               a |
|           ------|------  --------
|           |     |   b |  |    c | 
|           |     |     |  |      |
|           |     |     |  --------
|           ------|------
-------------------
```

```js
const C = ReactDOM.createPortal(<div onMouseEnter={e => console.log("c", e)}></div>, document.body);
const B = ReactDOM.createPortal(
  <React.Fragment>
    <div onMouseEnter={e => console.log("b", e)}>
      {C}
    </div>
  </React.Fragment>,
  document.body
);
const App = (
  <React.Fragment>
    <div onMouseEnter={e => console.log("a", e)}></div>
    {B}
  </React.Fragment>
);

// ==>

const App = (
  <React.Fragment>
    <div onMouseEnter={e => console.log("a", e)}></div>
    {ReactDOM.createPortal(
      <React.Fragment>
        <div onMouseEnter={e => console.log("b", e)}>
          {ReactDOM.createPortal(
            <div onMouseEnter={e => console.log("c", e)}></div>,
            document.body
          )}
        </div>
      </React.Fragment>,
      document.body
    )}
  </React.Fragment>
);
```

Simply looking at the code, this is a very simple nested structure. However, due to the presence of the `Portals` portal, the actual effect of this code structure on the real `DOM` structure is like this, where the `id` is only used to identify the `React` `DOM` structure, and does not actually exist:

```html
<body>
  <div id="root">
    <div id="a"></div>
  </div>
  <div id="b"></div>
  <div id="c"></div>
  <div>
</body>
```

Next, let's try defining the triggering scenario for the `MouseEnter` event one by one. First, when the mouse moves over the `a` element, 'a' is printed in the console, which is as expected. Next, when the mouse moves over the `b` element, 'b' is printed in the console, which is also as expected. Then, when we move the mouse to `c`, something magical happens. We will notice that 'b' is printed first and then 'c', rather than just printing 'c'. From this, we can conclude that even though the `DOM` structure appears to be different, the synthetic event in the `React` tree still maintains a nested structure. The `C` component, as a child element of the `B` component, still triggers the `MouseEnter` event from `B` to `C`. Based on this, we can implement a very interesting feature, multi-level nested pop-up layers.

## Trigger Overlay
In fact, all the previous discussions were laying the foundation for this part, because I use `ArcoDesign` a lot in my work, and due to the nature of my work in rich text documents, there are many places where pop-up layers are needed for interaction. So, in my day-to-day work, I heavily use the `Trigger` component of `ArcoDesign` `https://arco.design/react/components/trigger`, and I have always been very curious about the implementation of this component. This component can be nested to an unlimited number of levels, and when the last level of the multi-level pop-up layer component is moved out of the mouse, all the pop-up layers will be closed. The most important thing is that we have only nested it one level in our business implementation, without doing any communication or passing, so I have always been curious about this part of the implementation. It wasn't until some time ago, in order to solve a bug, that I delved into the related implementation and found that it is essentially accomplished using `React Portals` and the synthetic events of the `React` tree. There are many interactive implementations within it that are worth studying.

Similarly, I have also implemented a `DEMO` here `https://codesandbox.io/p/sandbox/trigger-component-1hv99o?file=/src/components/trigger-simple.tsx:1,1`, and during the call, simply nesting it can achieve a two-level pop-up layer. When we move the mouse over the `a` element, the `b` and `c` elements will be displayed. When we move the mouse to the `c` element, the `d` element will be displayed. When we continue to quickly move the mouse to the `d` element, all the pop-up layers will not disappear. When we directly move the mouse from the `d` element to the blank area, all the pop-up layers will disappear. If we move it to the `b` element, only the `d` element will disappear.

```
-------------------  -------------  --------
|               a |  |         b |  |    d | 
|                 |  |--------   |  |      |
|                 |  |      c |  |  --------    
|                 |  |--------   |      
|                 |  -------------   
|                 | 
-------------------
```

```js
<TriggerSimple
  duration={200}
  popup={() => (
    <div id="b" style={{ height: 100, width: 100, backgroundColor: "green" }}>
      <TriggerSimple
        popup={() => <div id="d" style={{ height: 50, width: 50, backgroundColor: "blue" }}></div>}
        duration={200}
      >
        <div id="c" style={{ paddingTop: 20 }}>Hover</div>
      </TriggerSimple>
    </div>
  )}
>
  <div id="a" style={{ height: 150, width: 150, backgroundColor: "red" }}></div>
</TriggerSimple>
```

Let's break down the code implementation. First, we encapsulate the `Portal` component. Here, we assume that the component we are going to mount is on the `document.body`, because what we want to do is a pop-up layer. At the beginning, we also clarified that our pop-up layer `DOM` structure needs to be mounted on the outermost layer and cannot be directly nested in the `DOM` structure. Of course, if it can be ensured that there will be no related problems and if the scrolling container is not the `body` and it needs to be positioned absolutely, it can specify the transmission position by passing the `DOM` node through `getContainer`. But here, we assume it is `body`. In the implementation below, we manage the mounting and unmounting of the `DOM` nodes through the encapsulation of the `Portal` component, and the actual components will also be mounted on the node we just created.

```js
// trigger-simple.tsx
getContainer = () => {
  const popupContainer = document.createElement("div");
  popupContainer.style.width = "100%";
  popupContainer.style.position = "absolute";
  popupContainer.style.top = "0";
  popupContainer.style.left = "0";
  this.popupContainer = popupContainer;
  this.appendToContainer(popupContainer);
  return popupContainer;
};

// portal.tsx
const Portal = (props: PortalProps) => {
  const { getContainer, children } = props;
  const containerRef = useRef<HTMLElement | null>(null);
  const isFirstRender = useIsFirstRender();

  if (isFirstRender || containerRef.current === null) {
    containerRef.current = getContainer();
  }

  useEffect(() => {
    return () => {
      const container = containerRef.current;
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
        containerRef.current = null;
      }
    };
  }, []);
  return containerRef.current
    ? ReactDOM.createPortal(children, containerRef.current)
    : null;
};
```

Next, let's take a look at the `DOM` structure constructed in the `React` tree, which can be said to be the essence of the whole implementation. It may be a bit convoluted, and you can think of it as each pop-up layer being divided into two parts: the original `child` and the popped-up `portal`. These two structures are placed parallel in the `React DOM` tree. So, after multiple levels of pop-ups, in fact, each child `trigger(portal + child)` is the `children` of the upper-level `portal`. This structure can be represented by a tree structure.

```js
<React.Fragment>
  {childrenComponent}
  {portal}
</React.Fragment>
```

```
                         ROOT
                        /    \
               A(portal)      A(child)
                /     \
        B(portal)      B(child)
         /     \
  C(portal)     C(child)
   /     \
.....   ..... 
```

```html
<body>
  <div id="root">
    <!-- ... -->
    <div id="A-child"></div>
    <!-- ... -->
  </div>
  <div id="A-portal">
    <div id="B-child"></div>
  </div>
  <div id="B-portal">
    <div id="C-child"></div>
  </div>
  <div id="C-portal">
    <!-- ... -->
  </div>
</body>
```

From the tree structure, we can see that although in the `DOM` structure, it is displayed as a flat structure, in the `React` event tree, it still maintains a nested structure. So, it's easy to answer the initial question: why can we nest infinitely, and when the mouse leaves the last level of the pop-up component, all pop-up layers are closed. That's because, in fact, even if our mouse is in the last level, in the `React` tree structure, it still belongs to the child of all `portals`. Since it is a `child`, we can consider that it has not actually moved out of the elements of each level of `trigger` and naturally will not trigger the `MouseLeave` event to close the pop-up layer. If we move out of the last level pop-up layer to the blank area, it's equivalent to moving out of the `portal` element area of all `trigger` instances, and naturally, it will trigger the closing of all bound `MouseLeave` events to close the pop-up layer.

So, although we have explained why the `Trigger` component can maintain the display of pop-up layers under an infinitely nested structure and close all pop-up layers after the mouse leaves the last level, or return to the previous level and only close the last level pop-up layer, there is still an issue we haven't figured out. The issue is that since all instances of `trigger` pop-up layers are child elements of the upper-level `trigger` pop-up layer, we also have a sibling `portal` and `child` elements. When we move the mouse to the `child`, the `portal` element will be displayed. However, when we move the mouse to the `portal` element, this `portal` element does not disappear, but remains displayed. Here, since there is no nested structure in the `React` tree, special handling of events is required.
```

```js
onMouseEnter = (e: React.SyntheticEvent<HTMLDivElement, MouseEvent>) => {
  console.log("onMouseEnter", this.childrenDom);
  const mouseEnterDelay = this.props.duration;
  this.clearDelayTimer();
  this.setPopupVisible(true, mouseEnterDelay || 0);
};

onMouseLeave = (e: React.SyntheticEvent<HTMLDivElement, MouseEvent>) => {
  console.log("onMouseLeave", this.childrenDom);
  const mouseLeaveDelay = this.props.duration;
  this.clearDelayTimer();
  if (this.state.popupVisible) {
    this.setPopupVisible(false, mouseLeaveDelay || 0);
  }
};

onPopupMouseEnter = () => {
  console.log("onPopupMouseEnter", this.childrenDom);
  this.clearDelayTimer();
};

onPopupMouseLeave = (e: React.SyntheticEvent<HTMLDivElement, MouseEvent>) => {
  console.log("onPopupMouseLeave", this.childrenDom);
  const mouseLeaveDelay = this.props.duration;
  this.clearDelayTimer();
  if (this.state.popupVisible) {
    this.setPopupVisible(false, mouseLeaveDelay || 0);
  }
};

setPopupVisible = (visible: boolean, delay = 0, callback?: () => void) => {
  const currentVisible = this.state.popupVisible;

  if (visible !== currentVisible) {
    this.delayToDo(delay, () => {
      if (visible) {
        this.setState({ popupVisible: true }, () => {
          this.showPopup(callback);
        });
      } else {
        this.setState({ popupVisible: false }, () => {
          callback && callback();
        });
      }
    });
  } else {
    callback && callback();
  }
};

delayToDo = (delay: number, callback: () => void) => {
  if (delay) {
    this.clearDelayTimer();
    this.delayTimer = setTimeout(() => {
      callback();
      this.clearDelayTimer();
    }, delay);
  } else {
    callback();
  }
};
```

Actually, the communication here would be relatively simple. As mentioned earlier, the `portal` and `child` elements are on the same level, so we can clearly see that they are actually within the same component. Therefore, the overall implementation will be much simpler. We can design a delay and bind `MouseEnter` and `MouseLeave` events to both `portal` and `child` separately. Here, we bind `onMouseEnter` and `onMouseLeave` event handling functions to `child`, and `onPopupMouseEnter` and `onPopupMouseLeave` event handling functions to `portal`.

Now, let's simulate the scenario above. When the mouse enters the `child` element, the `onMouseEnter` event handling function will be triggered. At this point, we will clear the `delayTimer`, and then call the `setPopupVisible` method. This will set `popupVisible` to `true` and display the `portal`. Here comes the key point: we actually have a delay set here, meaning that when we move the mouse out of the element, the element will not be hidden until after the delay time. If we move the mouse back into the `portal` during this delay, and the `onPopupMouseEnter` event is triggered, we can call `clearDelayTimer` to clear the `delayTimer`, preventing the element from being hidden. This way, regardless of further nested pop-up layers involving `child` or `portal`, they are still child elements of the previous `portal`. Even when switching between the child `portal` and `child`, we can use `clearDelayTimer` to prevent the elements from being hidden. Therefore, subsequent pop-up layers can be recursively handled in this way, achieving unlimited nesting.

We can use the `DEMO` to print out the mouse events from `a -> b -> c -> d -> empty`:

```
onMouseEnter a
onMouseLeave a
onPopupMouseEnter b
onMouseEnter c
onMouseLeave c
onPopupMouseLeave b
onPopupMouseEnter b
onPopupMouseEnter d
onPopupMouseLeave d
onPopupMouseLeave b
```

Thus, we have explored the implementation of the `Trigger` component. Of course, in the actual handling process, there are still quite a few details to address, such as position calculation, animation, event handling, and so on. Furthermore, this component has many aspects from which we can learn, such as how to pass externally provided event handling functions to `children`, the usage of methods like `React.Children.map`, `React.isValidElement`, `React.cloneElement`, and so on, which are all very interesting implementations.

```js
const getWrappedChildren = () => {
  return React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      const { props } = child;
      return React.cloneElement(child, {
        ...props,
        onMouseEnter: mouseEnterHandler,
        onMouseLeave: mouseLeaveHandler,
      });
    } else {
      return child;
    }
  });
};
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://zhuanlan.zhihu.com/p/29880992
https://juejin.cn/post/6844904024378982413
https://juejin.cn/post/6904979968413925384
https://segmentfault.com/a/1190000012325351
https://zh-hans.legacy.reactjs.org/docs/portals.html
https://codesandbox.io/p/sandbox/trigger-component-1hv99o
https://zh-hans.react.dev/reference/react-dom/createPortal
https://github.com/arco-design/arco-design/blob/main/components/Trigger/index.tsx
```