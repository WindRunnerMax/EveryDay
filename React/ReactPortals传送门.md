# ReactPortals传送门
`React Portals`提供了一种将子节点渲染到父组件以外的`DOM`节点的解决方案，即允许将`JSX`作为`children`渲染至`DOM`的不同部分，最常见用例是子组件需要从视觉上脱离父容器，例如对话框、浮动工具栏、提示信息等。

## 描述
`React Portals`可以翻译为传送门，从字面意思上就可以理解为我们可以通过这个方法将我们的`React`组件传送到任意指定的位置。举个简单的例子，假设我们`ReactDOM.render`挂载组件的`DOM`结构是`<div id="root"></div>`，那么对于同一个组件我们是否使用`Portal`在整个`DOM`节点上得到的效果是不同的:

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

从上边的例子中可以看到我们通过`ReactDOM.createPortal`将`React`组件挂载到了其他的`DOM`结构下，在这里是挂载到了`document.body`下，当然这这也是最常见的做法，这样我们就可以通过`Portal`将组件传送到目标渲染的位置，由此来更灵活地控制渲染的行为，并解决一些复杂的`UI`交互场景。

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

从上边的例子中我们可以看出，我们仅仅使用`CSS`的`position`定位是无法做到完全脱离父组件的，即使我们能够达到脱离文档流的效果，也会因为父组件的样式而受到影响，特别是在组件库中，我们作为第三方组件库的话是完全没有办法控制用户设计的`DOM`结构的，如果仅仅采用脱离文档流的方法而不实际将`DOM`结构分离出来的话，那么我们的组件就会受到用户样式的影响，这是我们不希望看到的。此外，即使我们并不是设计组件库，而仅仅是在我们的业务中实现相关需求，我们也不希望我们的组件受到父组件的影响，因为即使最开始我们的结构和样式没出现问题，随着业务越来越复杂，特别是多人协作开发项目，就很容易留下隐患，造成一些不必要的问题，当然我们可以引入`E2E`来避免相关问题，这就是另一方面的问题了。


描述
MouseEnter事件
Portal事件
Trigger弹出层


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
https://zh-hans.react.dev/reference/react-dom/createPortal
https://github.com/arco-design/arco-design/blob/main/components/Trigger/index.tsx
```
