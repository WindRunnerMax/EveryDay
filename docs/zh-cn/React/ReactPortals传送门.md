# ReactPortals传送门
`React Portals`提供了一种将子节点渲染到父组件以外的`DOM`节点的解决方案，即允许将`JSX`作为`children`渲染至`DOM`的不同部分，最常见用例是子组件需要从视觉上脱离父容器，例如对话框、浮动工具栏、提示信息等。

## 描述

```js
<div>
  <SomeComponent />
  {createPortal(children, domNode, key?)}
</div>
```

`React Portals`可以翻译为传送门，从字面意思上就可以理解为我们可以通过这个方法将我们的`React`组件传送到任意指定的位置，可以将组件的输出渲染到`DOM`树中的任意位置，而不仅仅是组件所在的`DOM`层级内。举个简单的例子，假设我们`ReactDOM.render`挂载组件的`DOM`结构是`<div id="root"></div>`，那么对于同一个组件我们是否使用`Portal`在整个`DOM`节点上得到的效果是不同的:

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
  {/* `DOM`结构挂载到了`body`下 */}
  <div class="model">
    <div>456</div>
  </div>
</body>
```

从上边的例子中可以看到我们通过`ReactDOM.createPortal`将`React`组件挂载到了其他的`DOM`结构下，在这里是挂载到了`document.body`下，当然这这也是最常见的做法，这样我们就可以通过`Portal`将组件传送到目标渲染的位置，由此来更灵活地控制渲染的行为，并解决一些复杂的`UI`交互场景，通常我们可以封装`Portal`组件来更方便地调用。

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

之前我们也聊到了，使用`Portals`最常见的场景就是对话框，或者可以认为是浮动在整个页面顶部的组件，这样的组件在`DOM`结构上是脱离了父组件的，我们当然可以自行实现相关的能力，例如主动创建一个`div`结构挂载到目标`DOM`结构下例如`document.body`下，然后利用`ReactDOM.render`将组建渲染到相关结构中，在组件卸载时再将创建的`div`移除，这个方案当然是可行的但是并没有那么优雅。当然还有一个方法是使用状态管理，在目标组件中事先定义好相关的组件，通过状态管理例如`redux`来控制显隐，这种就是纯粹的高射炮打蚊子，就没有必要再展开了。

其实我们再想一想，既然我们是要脱离父组件结构来实现这个能力，那么我们没有必要非得使用`Portals`，`CSS`的`position`定位不是也可以帮助我们将当前的`DOM`结构脱离文档流，也就是说我们没必要将目标组件的`DOM`结构实际地分离出来，只需要借助`position`定位就可以实现效果。当然想法是很美好的，真实场景就变得复杂的多了，那么脱离文档流最常用的主要是绝对定位`absolute`与固定定位`fixed`。首先我们来看一下`absolute`，那么我们使用`absolute`其实很容易想到，我们需要从当前组件一直到`body`都没有其他`position`是`relative/absolute`的元素，这个条件肯定是很难达到的，特别是如果我们写的是一个组件库的话，很难控制用户究竟套了多少层以及究竟用什么`CSS`属性。那么此时我们再将目光聚焦到`fixed`上，`fixed`是相对于视口来定位的，那么也就不需要像是`absolute`那么强的要求了，即使是父元素存在`relative/absolute`也没有关系。当然这件事没有这么简单，即使是`fixed`元素依旧可能会受到父元素样式的影响，在这里举两个例子，分别是`transform`与`z-index`。

```html
<!-- 不断改变`transform: translateY(20px);`的值 `fixed`的元素也在不断随之变化 -->
<div style="transform: translateY(20px);">
  <div style="position: fixed; left: 10px; top: 10px;">
    <div style="background-color: blue; width: 10px; height: 10px;"></div>
  </div>
</div>

<!-- 父级元素的`z-index`的层次比同级元素低 即使`fixed`元素`z-index`比父级高 也会被父级同级元素遮挡 -->
<div
  style="position: absolute; z-index: 100; width: 100px; height: 100px; background-color: #fff;"
></div>
<div style="position: absolute; z-index: 1">
  <div style="position: fixed; left: 10px; top: 10px; z-index: 1000">
    <div style="background-color: blue; width: 10px; height: 10px"></div>
  </div>
</div>
```

从上边的例子中我们可以看出，我们仅仅使用`CSS`的`position`定位是无法做到完全脱离父组件的，即使我们能够达到脱离文档流的效果，也会因为父组件的样式而受到影响，特别是在组件库中，我们作为第三方组件库的话是完全没有办法控制用户设计的`DOM`结构的，如果仅仅采用脱离文档流的方法而不实际将`DOM`结构分离出来的话，那么我们的组件就会受到用户样式的影响，这是我们不希望看到的。此外，即使我们并不是设计组件库，而仅仅是在我们的业务中实现相关需求，我们也不希望我们的组件受到父组件的影响，因为即使最开始我们的结构和样式没出现问题，随着业务越来越复杂，特别是多人协作开发项目，就很容易留下隐患，造成一些不必要的问题，当然我们可以引入`E2E`来避免相关问题，这就是另一方面的解决方案了。

综上，`React Portals`提供了一种更灵活地控制渲染的行为，可以用于解决一些复杂的`UI`交互场景，下面是一些常见的应用场景:

* 模态框和对话框: 使用`Portals`可以将模态框或对话框组件渲染到`DOM`树的顶层，确保其可以覆盖其他组件，并且在层级上独立于其他组件，这样可以避免`CSS`或`z-index`属性的复杂性，并且在组件层级之外创建一个干净的容器。
* 与第三方库的集成: 有时候，我们可能需要将`React`组件与第三方库(例如地图库或视频播放器)集成，使用`Portals`可以将组件渲染到第三方库所需的`DOM`元素中，即将业务需要的额外组件渲染到原组件封装好的`DOM`结构中，以确保组件在正确的位置和上下文中运行。
* 逻辑分离和组件复用: `Portals`允许我们将组件的渲染输出与组件的逻辑分离，我们可以将组件的渲染输出定义在一个单独的`Portal`组件中，并在需要的地方使用该`Portal`，这样可以实现组件的复用，并且可以更好地组织和管理代码。
* 处理层叠上下文: 在某些情况下，使用`Portals`可以帮助我们解决层叠上下文`stacking context`的问题，由于`Portals`可以创建独立的`DOM`渲染容器，因此可以避免由于层叠上下文导致的样式和布局问题。

## MouseEnter事件
即使`React Portals`可以将组件传送到任意的`DOM`节点中，但是其行为和普通的`React`组件一样，其并不会脱离原本的`React`组件树，这其实是一件非常有意思的事情，因为这样会看起来，我们可以利用这个特性来实现比较复杂的交互。但是在这之前，我们来重新看一下`MouseEnter`与`MouseLeave`以及对应的`MouseOver`与`MouseOut`的原生`DOM`事件。

* `MouseEnter`: 当鼠标光标进入一个元素时触发，该事件仅在鼠标从元素的外部进入时触发，不会对元素内部的子元素产生影响。例如，如果有一个嵌套的`DOM`结构`<div id="a"><div id="b"></div></div>`，此时我们在元素`a`上绑定了`MouseEnter`事件，当鼠标从该元素外部移动到内部时，`MouseEnter`事件将被触发，而当我们再将鼠标移动到`b`元素时，不会再次触发`MouseEnter`事件。
* `MouseLeave`：当鼠标光标离开一个元素时触发，该事件仅在鼠标从元素内部离开时触发，不会对元素外部的父元素产生影响。例如，如果有一个嵌套的`DOM`结构`<div id="a"><div id="b"></div></div>`，此时我们在元素`a`上绑定了`MouseEnter`事件，当鼠标从该元素内部移动到外部时，`MouseLeave`事件将被触发，而如果此时我们的鼠标是从`b`元素移出到`a`元素内，不会触发`MouseEnter`事件。
* `MouseOver`: 当鼠标光标进入一个元素时触发，该事件在鼠标从元素的外部进入时触发，并且会冒泡到父元素。例如，如果有一个嵌套的`DOM`结构`<div id="a"><div id="b"></div></div>`，此时我们在元素`a`上绑定了`MouseOver`事件，当鼠标从该元素外部移动到内部时，`MouseOver`事件将被触发，而当我们再将鼠标移动到`b`元素时，由于冒泡会再次触发绑定在`a`元素上的`MouseOver`事件，再从`b`元素移出到`a`元素时会再次触发`MouseOver`事件。
* `MouseOut`: 当鼠标光标离开一个元素时触发，该事件在鼠标从元素内部离开时触发，并且会冒泡到父元素。例如，如果有一个嵌套的`DOM`结构`<div id="a"><div id="b"></div></div>`，此时我们在元素`a`上绑定了`MouseOut`事件，当鼠标从该元素内部移动到外部时，`MouseOut`事件将被触发，而如果此时我们的鼠标是从`b`元素移出到`a`元素内，由于冒泡会同样触发绑定在`MouseOut`事件，再从`a`元素移出到外部时，同样会再次触发`MouseOut`事件。

需要注意的是`MouseEnter/MouseLeave`是在捕获阶段执行事件处理函数的，而不能在冒泡阶段过程中进行，而`MouseOver/MouseOut`是可以在捕获阶段和冒泡阶段选择一个阶段来执行事件处理函数的，这个就看在`addEventListener`如何处理了。实际上两种事件流都是可以阻断的，只不过`MouseEnter/MouseLeave`需要在捕获阶段来`stopPropagation`，一般情况下是不需要这么做的。我个人还是比较推荐使用`MouseEnter/MouseLeave`，主要有这么几点理由:

* 避免冒泡问题: `MouseEnter`和`MouseLeave`事件不会冒泡到父元素或其他元素，只在鼠标进入或离开元素本身时触发，这意味着我们可以更精确地控制事件的触发范围，更准确地处理鼠标交互，而不会受到其他元素的干扰，提供更好的用户体验。
* 避免重复触发: `MouseOver`和`MouseOut`事件在鼠标悬停在元素内部时会重复触发，当鼠标从一个元素移动到其子元素时，`MouseOut`事件会在父元素触发一次，然后在子元素触发一次，`MouseOut`事件也是同样会多次触发，可以将父元素与所有子元素都看作独立区域，而事件会冒泡到父元素来执行事件绑定函数，这可能导致重复的事件处理和不必要的逻辑触发，而`MouseEnter`和`MouseLeave`事件不会重复触发，只在鼠标进入或离开元素时触发一次。
* 简化交互逻辑: `MouseEnter`和`MouseLeave`事件的特性使得处理鼠标移入和移出的交互逻辑变得更直观和简化，我们可以仅关注元素本身的进入和离开，而不需要处理父元素或子元素的事件，这种简化有助于提高代码的可读性和可维护性。

当然究竟使用`MouseEnter/MouseLeave`还是`MouseEnter/MouseLeave`事件还是要看具体的业务场景，如果需要处理鼠标移入和移出元素的子元素时或者需要利用冒泡机制来实现功能，那么`MouseOver`和`MouseOut`事件就是更好的选择，`MouseEnter/MouseLeave`能提供更大的灵活性和控制力，让我们能够创建复杂的交互效果，并更好地处理用户与元素的交互，当然应用的复杂性也会相应提高。

让我们回到`MouseEnter/MouseLeave`事件本身上，在这里`https://codesandbox.io/p/sandbox/trigger-component-1hv99o?file=/src/components/mouse-enter-test.tsx:1,1`提供了一个事件的`DEMO`可以用来测试事件效果。需要注意的是，在这里我们是借助于`React`的合成事件来测试的，而在测试的时候也可以比较明显地发现`MouseEnter/MouseLeave`的`TS`提示是没有`Capture`这个选项的，例如`Click`事件是有`onClick`与`onClickCapture`来表示冒泡和捕获阶段事件绑定的，而即使是在`React`合成事件中`MouseEnter/MouseLeave`也只会在捕获阶段执行，所以没有`Capture`事件绑定属性。


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

我们分别在三个`DOM`上都绑定了`MouseEnter`事件，当我们鼠标移动到`a`上时，会执行`a`元素绑定的事件，当依次将鼠标移动到`a`、`b`、`c`的时候，同样会以此执行`a`、`b`、`c`的事件绑定函数，并且不会因为冒泡事件导致父元素事件的触发，当我们鼠标直接移动到`c`的时候，可以看到依旧是按照`a`、`b`、`c`的顺序执行，也可以看出来`MouseEnter`事件是依赖于捕获阶段执行的。

## Portal事件
在前边也提到了，尽管`React Portals`可以被放置在`DOM`树中的任何地方，但在任何其他方面，其行为和普通的`React`子节点行为一致。我们都知道`React`自行维护了一套基于事件代理的合成事件，那么由于`Portal`仍存在于原本的`React`组件树中，这样就意味着我们的`React`事件实际上还是遵循原本的合成事件规则而与`DOM`树中的位置无关，那么我们就可以认为其无论其子节点是否是`Portal`，像合成事件、`Context`这样的功能特性都是不变的，下面是一些使用`React Portals`需要关注的点:

* 事件冒泡会正常工作: 合成事件将通过冒泡传播到`React`树的祖先，事件冒泡将按预期工作，而与`DOM`中的`Portal`节点位置无关。
* `React`以控制`Portal`节点及其生命周期: `Portal`未脱离`React`组件树，当通过`Portal`渲染子组件时，`React`仍然可以控制组件的生命周期。
* `Portal`只影响`DOM`结构: 对于`React`来说`Portal`仅仅是视觉上渲染的位置变了，只会影响`HTML`的`DOM`结构，而不会影响`React`组件树。
* 预定义的`HTML`挂载点: 使用`React Portal`时，我们需要提前定义一个`HTML DOM`元素作为`Portal`组件的挂载。

在这里`https://codesandbox.io/p/sandbox/trigger-component-1hv99o?file=/src/components/portal-test.tsx:1,1`提供了一个`Portals`与`MouseEnter`事件的`DEMO`可以用来测试效果。那么在代码中实现的嵌套精简如下:

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

单纯从代码上来看，这就是一个很简单的嵌套结构，而因为传送门`Portals`的存在，在真实的`DOM`结构上，这段代码结构表现的效果是这样的，其中`id`只是用来标识`React`的`DOM`结构，实际并不存在:

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

接下来我们依次来试试定义的`MouseEnter`事件触发情况，首先鼠标移动到`a`元素上，控制台打印`a`，符合预期，接下来鼠标移动到`b`元素上，控制台打印`b`，同样符合预期，那么接下来将鼠标移动到`c`，神奇的事情来了，我们会发现会先打印`b`再打印`c`，而不是仅仅打印了`c`，由此我们可以得到虽然看起来`DOM`结构不一样了，但是在`React`树中合成事件依然保持着嵌套结构，`C`组件作为`B`组件的子元素，在事件捕获时依然会从`B -> C`触发`MouseEnter`事件，基于此我们可以实现非常有意思的一件事情，多级嵌套的弹出层。

## Trigger弹出层
实际上上边聊的内容都是都是为这部分内容做铺垫的，因为工作的关系我使用`ArcoDesign`是非常多的，又由于我实际是做富文本文档的，需要弹出层来做交互的地方就非常多，所以在平时的工作中会大量使用`ArcoDesign`的`Trigger`组件`https://arco.design/react/components/trigger`，之前我一直非常好奇这个组件的实现，这个组件可以无限层级地嵌套，而且当多级弹出层组件的最后一级鼠标移出之后，所有的弹出层都会被关闭，最主要的是我们只是将其嵌套做了一层业务实现，并没有做任何的通信传递，所以我也一直好奇这部分的实现，直到前一段时间我为了解决`BUG`深入研究了一下相关实现，发现其本质还是利用`React Portals`以及`React`树的合成事件来完成的，这其中还是有很多交互实现可以好好学习下的。


同样的，在这里也完成了一个`DEMO`实现`https://codesandbox.io/p/sandbox/trigger-component-1hv99o?file=/src/components/trigger-simple.tsx:1,1`，而在调用时，则直接嵌套即可实现两层弹出层，当我们鼠标移动到`a`元素时，`b`元素与`c`元素会展示出来，当我们将鼠标移动到`c`元素时，`d`元素会被展示出来，当我们继续将鼠标快速移动到`d`元素时，所有的弹出层都不会消失，当我们直接将鼠标从`d`元素移动到空白区域时，所有的弹出层都会消失，如果我们将其移动到`b`元素，那么只有`d`元素会消失。

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

让我们来拆解一下代码实现，首先是`Portal`组件的封装，在这里我们就认为我们将要挂载的组件是在`document.body`上的就可以了，因为我们要做的是弹出层，在最开始的时候也阐明了我们的弹出层`DOM`结构需要挂在最外层而不能直接嵌套地放在`DOM`结构中，当然如果能够保证不会出现相关问题，滚动容器不是`body`的情况且需要`position absolute`的情况下，可以通过`getContainer`传入`DOM`节点来制定传送的位置，当然在这里我们认为是`body`就可以了。在下面这段实现中我们就通过封装`Portal`组件来调度`DOM`节点的挂载和卸载，并且实际的组件也会被挂载到我们刚创建的节点上。


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

接下来我们来看构造在`React`树中的`DOM`结构，这块可以说是整个实现的精髓，可能会比较绕，可以认为实际上每个弹出层都分为了两块，一个是原本的`child`，另一个是弹出的`portal`，这两个结构是平行的放在`React DOM`树中的，那么在多级弹出层之后，实际上每个子`trigger(portal + child)`都是上层`portal`的`children`，这个结构可以用一个树形结构来表示。

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

从树形结构中我们可以看出来，虽然在`DOM`结构中我们现实出来是平铺的结构，但是在`React`的事件树中却依旧保持着嵌套结构，那么我们就很容易解答最开始的一个问题，为什么我们可以无限层级地嵌套，而且当多级弹出层组件的最后一级鼠标移出之后，所有的弹出层都会被关闭，就是因为实际上即使我们的鼠标在最后一级，但是在`React`树结构中其依旧是属于所有`portal`的子元素，既然其是`child`那么实际上我们可以认为其并没有移出各级`trigger`的元素，自然不会触发`MouseLeave`事件来关闭弹出层，如果我们移出了最后一级弹出层到空白区域，那么相当于我们移出了所有`trigger`实例的`portal`元素区域，自然会触发所有绑定的`MouseLeave`事件来关闭弹出层。

那么虽然上边我们虽然解释了`Trigger`组件为什么能够维持无限嵌套层级结构下能够维持弹出层的显示，并且在最后一级鼠标移出之后能够关闭所有弹出层，或者从最后一级返回到上一级只关闭最后一级弹出层，但是我们还有一个问题没有想明白，上边的问题是因为所有的`trigger`弹出层实例都是上一级`trigger`弹出层实例的子元素，那么我们还有一个平级的`portal`与`child`元素呢，当我们鼠标移动到`child`时，`portal`元素会展示出来，而此时我们将鼠标移动到`portal`元素时，这个`portal`元素并不会消失，而是会一直保持显示，在这里的`React`树是不存在嵌套结构的，所以这里需要对事件进行特殊处理。


```js
onMouseEnter = (e: React.SyntheticEvent<HTMLDivElement, MouseEvent>) => {
  console.log("onMouseEnter", this.childrenDom);
  const mouseEnterDelay = this.props.duration;
  this.clearDelayTimer();
    his.setPopupVisible(true, mouseEnterDelay || 0);
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
    onst currentVisible = this.state.popupVisible;

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

实际上在这里的通信会比较简单，之前我们也提到`portal`与`child`元素是平级的，那么我们可以明显地看出来实际上这是在一个组件内的，那么整体的实现就会简单很多，我们可以设计一个延时，并且可以为`portal`和`child`分别绑定`MouseEnter`和`MouseLeave`事件，在这里我们为`child`绑定的是`onMouseEnter`和`onMouseLeave`两个事件处理函数，为`portal`绑定了`onPopupMouseEnter`和`onPopupMouseLeave`两个事件处理函数。那么此时我们模拟一下上边的情况，当我们鼠标移入`child`元素时，会触发`onMouseEnter`事件处理函数，此时我们会清除掉`delayTimer`，然后会调用`setPopupVisible`方法，此时会将`popupVisible`设置为`true`然后显示出`portal`，那么此时重点来了，我们这里实际上会有一个`delay`的延时，也就是说实际上当我们移出元素时，在`delay`时间之后才会将元素真正的隐藏，那么如果此时我们将鼠标再移入到`portal`，触发`onPopupMouseEnter`事件时调用`clearDelayTimer`清除掉`delayTimer`，那么我们就可以阻止元素的隐藏，那么再往后的嵌套弹出层无论是`child`还是`portal`本身依旧是上一层`portal`的子元素，即使是在子`portal`与子`child`之间切换也可以利用`clearDelayTimer`来阻止元素的隐藏，所以之后的弹出层就可以利用这种方式递归处理就可以实现无限嵌套了。我们可以将`DEMO`中鼠标从`a -> b -> c -> d -> empty`事件打印出来: 

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

至此我们探究了`Trigger`组件的实现，当然在实际的处理过程中还有相当多的细节需要处理，例如位置计算、动画、事件处理等等等等，而且实际上这个组件也有很多我们可以学习的地方，例如如何将外部传递的事件处理函数交予`children`、`React.Children.map`、`React.isValidElement`、`React.cloneElement`等方法的使用等等，也都是非常有意思的实现。

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

## 每日一题

- <https://github.com/WindRunnerMax/EveryDay>

## 参考

- <https://zhuanlan.zhihu.com/p/29880992>
- <https://juejin.cn/post/6844904024378982413>
- <https://juejin.cn/post/6904979968413925384>
- <https://segmentfault.com/a/1190000012325351>
- <https://zh-hans.legacy.reactjs.org/docs/portals.html>
- <https://codesandbox.io/p/sandbox/trigger-component-1hv99o>
- <https://zh-hans.react.dev/reference/react-dom/createPortal>
- <https://github.com/arco-design/arco-design/blob/main/components/Trigger/index.tsx>
