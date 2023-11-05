# useMemo与useCallback
`useMemo`和`useCallback`都可缓存函数的引用或值，从更细的角度来说`useMemo`则返回一个缓存的值，`useCallback`是返回一个缓存函数的引用。

## useMemo
`useMemo`的`TS`定义可以看出，范型`T`在`useMemo`中是一个返回的值类型。

```
type DependencyList = ReadonlyArray<any>;

function useMemo<T>(factory: () => T, deps: DependencyList | undefined): T;
```

下面是`useMemo`的简单示例，在`a`和`b`的变量值不变的情况下，`memoizedValue`的值不变，在此时`useMemo`函数的第一个参数也就是`computeExpensiveValue`函数不会被执行，从而达到节省计算量的目的。

```javascript
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```

把创建函数`factory: () => T`和依赖项数组`deps: DependencyList | undefined`作为参数传入 `useMemo`，它仅会在某个依赖项改变时才重新计算`memoized` 值，这种优化有助于避免在每次渲染时都进行高开销的计算，例如上文的`computeExpensiveValue`是需要一个大量计算的函数时，`useMemo`有助于减少性能开销，以防止`Js`太多次长时间运行计算导致页面无响应。  
此外，传入`useMemo`的函数会在渲染期间执行，所以不要在这个函数内部执行与渲染无关的操作，诸如副作用这类的操作属于` useEffect`的适用范畴，而不是`useMemo`。如果没有提供依赖项数组，`useMemo`在每次渲染时都会计算新的值。  
`eslint`的`eslint-plugin-react-hooks`中的`exhaustive-deps`规则可以在添加错误依赖时发出警告并给出修复建议。  
相比较于`useEffect`看起来和`Vue`的`Watch`很像，但是思想方面是不同的，`Vue`是监听值的变化而`React`是用以处理副作用。在`useMemo`方面就和`Vue`的`computed`非常类似了，同样都属于缓存依赖项的计算结果，当然在实现上是完全不同的。

## useCallback
`useCallback`的`TS`定义可以看出，范型`T`在`useCallback`中是一个返回的函数类型。

```
type DependencyList = ReadonlyArray<any>;

function useCallback<T extends (...args: any[]) => any>(callback: T, deps: DependencyList): T;
```

下面是`useCallback`的简单示例，在`a`和`b`的变量值不变的情况下，`memoizedCallback`的函数引用不变，在此时`useCallback`函数的第一个参数不会被重新定义，即引用的依旧是原函数，从而达到性能优化的目的。

```javascript
const memoizedCallback = useCallback(
  () => {
    doSomething(a, b);
  },
  [a, b],
);
```
把内联回调函数`callback: T`及依赖项数组`deps: DependencyList`作为参数传入 `useCallback`，它将返回该回调函数的`memoized`版本，该回调函数仅在某个依赖项改变时才会更新，将回调函数传递给经过优化的并使用引用相等性去避免非必要渲染(例如` shouldComponentUpdate`)的子组件时，它将非常有用。此外，`useCallback(fn, deps)`相当于`useMemo(() => fn, deps)`，由此`useCallback`可以看作`useMemo`的语法糖。  
`eslint`的`eslint-plugin-react-hooks`中的`exhaustive-deps`规则可以在添加错误依赖时发出警告并给出修复建议。  
在`useCallback`的应用方面，在这里引用一下 @松松 给出的例子，一般`Js`上创建一个函数需要的时间并不至于要缓存的程度，那为什么要专门给缓存函数的创建做一个语法糖呢，这就跟`React.memo`有关系了。`React.memo`的默认第二参数是浅对比`shallow compare`上次渲染的`props`和这次渲染的`props`，如果你的组件的`props`中包含一个回调函数，并且这个函数是在父组件渲染的过程中创建的(见下例)，那么每次父组件(下例中的`<MyComponent />`）渲染时，`React`是认为你的子组件(下例中的`<Button />`)`props`是有变化的，不管你是否对这个子组件用了`React.memo`，都无法阻止重复渲染。这时就只能用`useCallback`来缓存这个回调函数，才会让`React`(或者说`Js`)认为这个`prop`和上次是相同的。

```
// 下面三种方法都会在MyComponent渲染的过程中重新创建这个回调函数
// 这样都会引起Button的重新渲染 因为Button的props变化了
function MyComponent() {
  return <Button onClick={() => doWhatever()} />;
}

function MyComponent() {
  const handleClick = () => doWhatever();
  return <Button onClick={handleClick} />;
}

function MyComponent() {
  function handleClick(){ 
    doWhatever();
  }
  return <Button onClick={handleClick} />;
}

// 只有使用useCallback， 才会导致即使MyComponent渲染，也不重新创建一个新的回调函数
// 这样就不会引发Button的重新渲染 因为Button的props没变
function MyComponent() {
  const handleClick = React.useCallBack(() => doWhatever(), []);
  return <Button onClick={handleClick} />;
}
```

## 最后
关于`useMemo`与`useCallback`是否值得尽量多用，私认为并不应该这么做，如果在性能优化方面非常有效，值得在每个依赖或者函数都值得使用`useMemo`与`useCallback`的话，`React`可以干脆将其作为默认的功能，又可以减少用户使用`Hooks`的心智负担，又可以减少使用`Hooks`的包裹让代码更加简洁，可是`React`并没有这么做，实际上这仍然是一个权衡的问题，权衡性能优化的点，取一个折衷，具体来说就是你需要评估你组件`re-render` 的次数和代价，`React.memo`、`useMemo`与`useCallback`这些缓存机制也是有代价的，需要做好平衡，不能盲目的多用这类缓存优化方案，比起盲目的进行各种细微的优化，分析清楚性能问题出现的原因才能真正的解决问题。


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.zhihu.com/question/428921970
https://www.zhihu.com/question/390974405
https://juejin.cn/post/6844904032113278990
https://juejin.cn/post/6844904001998176263
https://segmentfault.com/a/1190000039405417
https://www.infoq.cn/article/mm5btiwipppnpjhjqgtr
https://zh-hans.reactjs.org/docs/hooks-reference.html
```
