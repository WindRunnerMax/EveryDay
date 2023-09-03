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

1. 模态框和对话框: 使用`Portals`可以将模态框或对话框组件渲染到`DOM`树的顶层，确保其可以覆盖其他组件，并且在层级上独立于其他组件，这样可以避免`CSS`或`z-index`属性的复杂性，并且在组件层级之外创建一个干净的容器。
2. 与第三方库的集成: 有时候，我们可能需要将`React`组件与第三方库(例如地图库或视频播放器)集成，使用`Portals`可以将组件渲染到第三方库所需的`DOM`元素中，即将业务需要的额外组件渲染到原组件封装好的`DOM`结构中，以确保组件在正确的位置和上下文中运行。
3. 逻辑分离和组件复用: `Portals`允许我们将组件的渲染输出与组件的逻辑分离，我们可以将组件的渲染输出定义在一个单独的`Portal`组件中，并在需要的地方使用该`Portal`，这样可以实现组件的复用，并且可以更好地组织和管理代码。
4. 处理层叠上下文: 在某些情况下，使用`Portals`可以帮助我们解决层叠上下文`stacking context`的问题，由于`Portals`可以创建独立的`DOM`渲染容器，因此可以避免由于层叠上下文导致的样式和布局问题。

## MouseEnter事件
即使`React Portals`可以将组件传送到任意的`DOM`节点中，但是其行为和普通的`React`组件一样，其并不会脱离原本的`React`组件树，我们可以利用这个特性来实现比较复杂的交互，但是在这之前，我们来重新看一下`MouseEnter`与`MouseLeave`的原生`DOM`事件。



## Portal事件
在前边也提到了，尽管`React Portals`可以被放置在`DOM`树中的任何地方，但在任何其他方面，其行为和普通的`React`子节点行为一致。我们都知道`React`自行维护了一套基于事件代理的合成事件，那么由于`Portal`仍存在于原本的`React`组件树中，这样就意味着我们的`React`事件实际上还是遵循原本的合成事件规则而与`DOM`树中的位置无关，那么我们就可以认为其无论其子节点是否是`Portal`，像合成事件、`Context`这样的功能特性都是不变的，下面是一些使用`React Portals`需要关注的点:

* 事件冒泡会正常工作: 合成事件将通过冒泡传播到`React`树的祖先，事件冒泡将按预期工作，而与`DOM`中的`Portal`节点位置无关。
* `React`以控制`Portal`节点及其生命周期: `Portal`未脱离`React`组件树，当通过`Portal`渲染子组件时，`React`仍然可以控制组件的生命周期。
* `Portal`只影响`DOM`结构: 对于`React`来说`Portal`仅仅是视觉上渲染的位置变了，只会影响`HTML`的`DOM`结构，而不会影响`React`组件树。
* 预定义的`HTML`挂载点: 使用`React Portal`时，我们需要提前定义一个`HTML DOM`元素作为`Portal`组件的挂载。




## Trigger弹出层

https://codesandbox.io/p/sandbox/trigger-component-1hv99o


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

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
