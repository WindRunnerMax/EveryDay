# React中的纯组件
`React`提供了一种基于浅比较模式来确定是否应该重新渲染组件的类`React.PureComponent`，通常只需要继承`React.PureComponent`就可以定义一个纯组件。`React.PureComponent`与`React.Component`很相似，两者的区别在于`React.Component`并未实现`shouldComponentUpdate()`，而`React.PureComponent`中以浅层对比`prop`和`state`的方式来实现了该函数。如果赋予`React`组件相同的`props`和`state`，`render()`函数会渲染相同的内容，那么在某些情况下使用`React.PureComponent`可提高性能。

## 概述
首先我们来回顾下`React`组件执行重渲染`re-render`更新的时机，一般当一个组件的`props`属性或者`state`状态发生改变的时候，也就是父组件传递进来的`props`发生变化或者使用`this.setState`函数时，组件会进行重新渲染`re-render`。而在接受到新的`props`或者`state`到组件更新之间会执行其生命周期中的一个函数`shouldComponentUpdate`，当该函数返回`true`时才会进行重渲染，如果返回`false`则不会进行重渲染，在这里`shouldComponentUpdate`默认返回`true`，因此当组件遇到性能瓶颈的时候可以在`shouldComponentUpdate`中进行逻辑判断，来自定义组件是否需要重渲染。  
我们可以稍微查看一下源码的实现，可以看到`PureComponent`是通过寄生组合继承的方式继承了`Component`，`commit id`为` 0cf22a5`。

```javascript
// master/packages/react/src/ReactBaseClasses.js line 123
// ...
function ComponentDummy() {}
ComponentDummy.prototype = Component.prototype;

/**
 * Convenience component with default shallow equality check for sCU.
 */
function PureComponent(props, context, updater) {
  this.props = props;
  this.context = context;
  // If a component has string refs, we will assign a different object later.
  this.refs = emptyObject;
  this.updater = updater || ReactNoopUpdateQueue;
}

const pureComponentPrototype = (PureComponent.prototype = new ComponentDummy());
pureComponentPrototype.constructor = PureComponent;
// Avoid an extra prototype jump for these methods.
Object.assign(pureComponentPrototype, Component.prototype);
pureComponentPrototype.isPureReactComponent = true;
// ...
```

同时在`checkShouldComponentUpdate`函数中有一段这样的逻辑，在函数名上就能看出是对传入的参数进行了一次浅比较，因此实际上`PureReactComponent`组件和`ReactComponent`组件的区别就是`React.PureComponent`中以浅层对比`prop`和`state`的方式来实现了`shouldComponentUpdate()`函数。

```javascript
// master/packages/react-reconciler/src/ReactFiberClassComponent.new.js line 334
// ...
  if (ctor.prototype && ctor.prototype.isPureReactComponent) {
    return (
      !shallowEqual(oldProps, newProps) || !shallowEqual(oldState, newState)
    );
  }
// ...
```

需要注意的是，`React.PureComponent`中的`shouldComponentUpdate()`仅作对象的浅层比较。如果对象中包含复杂的数据结构，则有可能因为无法检查深层的差别，产生错误的比对结果。仅在你的`props`和`state`较为简单时才使用`React.PureComponent`，或者每次更新都使用新的对象，或者在深层数据结构发生变化时调用`forceUpdate()`来确保组件被正确地更新，你也可以考虑使用`immutable`对象加速嵌套数据的比较。此外`React.PureComponent`中的`shouldComponentUpdate()`将跳过所有子组件树的`prop`更新，因此需要确保所有子组件也都是纯的组件。

### 优点
* 在`shouldComponentUpdate`生命周期做了优化会自动`shadow diff`组件的`state`和`props`，结合`immutable`数据就可以很好地去做更新判断。
* 隔离了父组件与子组件的状态变化。

### 缺点
* `shouldComponentUpdate`中的`shadow diff`同样消耗性能。
* 需要确保组件渲染仅取决于`props`与`state`。

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://zhuanlan.zhihu.com/p/30659051
https://juejin.cn/post/6844903618848669709
https://juejin.cn/post/6844904099679305741
https://segmentfault.com/a/1190000014979065
https://ginnko.github.io/2018/12/17/pure-component/
https://zh-hans.reactjs.org/docs/react-api.html#reactpurecomponent
```

