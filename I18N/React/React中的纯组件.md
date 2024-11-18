# Pure Components in React

In `React`, there is a class called `React.PureComponent` that determines whether a component should be re-rendered based on a shallow comparison mode. Typically, inheriting from `React.PureComponent` is all you need to define a pure component. The main difference between `React.PureComponent` and `React.Component` is that `React.Component` does not implement `shouldComponentUpdate()`, while `React.PureComponent` implements this function using shallow comparisons of `props` and `state`. If a `React` component is given the same `props` and `state`, and the `render()` function renders the same content, using `React.PureComponent` can improve performance in certain scenarios.

## Description

First, let's review when a `React` component re-renders to update. Usually, a component re-renders when its `props` or `state` change, meaning when the `props` passed from the parent component change or when the `this.setState` function is used. Before receiving new `props` or `state`, a component will execute a function in its lifecycle called `shouldComponentUpdate`. It will only re-render when this function returns `true`. If it returns `false`, the component will not re-render. By default, `shouldComponentUpdate` returns `true`, but when a component encounters performance bottlenecks, logical conditions can be set in `shouldComponentUpdate` to determine whether the component needs to re-render.

Let's take a brief look at the source code implementation. We can see that `PureComponent` is inherited from `Component` through parasitic combination inheritance, with the commit id being `0cf22a5`.

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

Also, in the `checkShouldComponentUpdate` function, there is a section of logic that involves shallow comparisons of the passed parameters. Consequently, the primary difference between `PureReactComponent` and `ReactComponent` is that `React.PureComponent` implements `shouldComponentUpdate()` using shallow comparisons of `props` and `state`.

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

It is important to note that the `shouldComponentUpdate()` in `React.PureComponent` only performs a shallow comparison of objects. If the object contains complex data structures, incorrect comparison results may occur due to the inability to check deep differences. Only use `React.PureComponent` when your `props` and `state` are relatively simple, or when using new objects for each update, or when calling `forceUpdate()` when deep data structure changes occur to ensure that the component is updated correctly. You can also consider using immutable objects to speed up the comparison of nested data. In addition, the `shouldComponentUpdate()` in `React.PureComponent` will skip the updating of all subcomponent trees, so make sure that all subcomponents are also pure.

### Advantages
* Optimizing `shouldComponentUpdate` lifecycle will automatically `shadow diff` the component's `state` and `props`, combined with immutable data, to make good update judgments.
* Isolates the state changes between parent and child components.

### Disadvantages
* `shadow diff` in `shouldComponentUpdate` also consumes performance.
* Ensuring that component rendering depends only on `props` and `state`.

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://zhuanlan.zhihu.com/p/30659051
https://juejin.cn/post/6844903618848669709
https://juejin.cn/post/6844904099679305741
https://segmentfault.com/a/1190000014979065
https://ginnko.github.io/2018/12/17/pure-component/
https://zh-hans.reactjs.org/docs/react-api.html#reactpurecomponent
```