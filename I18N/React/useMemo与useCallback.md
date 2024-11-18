# `useMemo` and `useCallback`
`useMemo` and `useCallback` can both cache the reference or value of a function, but from a narrower perspective, `useMemo` returns a cached value, while `useCallback` returns a cached function reference.

## `useMemo`
From the TypeScript definition of `useMemo`, we can see that the generic type `T` in `useMemo` represents the type of the returned value.

```
type DependencyList = ReadonlyArray<any>;

function useMemo<T>(factory: () => T, deps: DependencyList | undefined): T;
```

The following is a simple example of `useMemo`. When the values of variables `a` and `b` do not change, the value of `memoizedValue` remains unchanged. At this point, the first parameter of the `useMemo` function, the `computeExpensiveValue` function, will not be executed, thereby achieving the purpose of saving computational resources.

```javascript
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```

By passing the function creation `factory: () => T` and the dependency array `deps: DependencyList | undefined` as parameters to `useMemo`, it only recalculates the `memoized` value when a dependency changes. This optimization helps avoid performing expensive calculations on every render, such as when `computeExpensiveValue` requires a computationally intensive function. `useMemo` helps reduce performance overhead, preventing JavaScript from running too many long computations, which can cause the page to become unresponsive. Additionally, the function passed to `useMemo` will be executed during rendering, so do not perform render-unrelated operations inside this function, such as side effects, which should be handled with `useEffect` instead of `useMemo`. If the dependency array is not provided, `useMemo` will compute a new value on every render. The `exhaustive-deps` rule in `eslint-plugin-react-hooks` can issue warnings and provide repair suggestions when incorrect dependencies are added. In comparison to `useEffect`, which may appear similar to `Vue`'s `Watch`, the underlying concepts are different. `Vue` listens to changes in values, while `React` is used to handle side effects. With regard to `useMemo`, it is quite similar to Vue's `computed`, both of which cache the results of dependent calculations, although the implementations are completely different.

## `useCallback`
From the TypeScript definition of `useCallback`, we can see that the generic type `T` in `useCallback` represents a returned function type.

```
type DependencyList = ReadonlyArray<any>;

function useCallback<T extends (...args: any[]) => any>(callback: T, deps: DependencyList): T;
```

The following is a simple example of `useCallback`. When the values of variables `a` and `b` do not change, the function reference of `memoizedCallback` remains unchanged. At this point, the first parameter of the `useCallback` function will not be redefined, and it will still refer to the original function, thereby achieving a performance optimization.

```javascript
const memoizedCallback = useCallback(
  () => {
    doSomething(a, b);
  },
  [a, b],
);
```
Pass the inline callback function `callback: T` and the array of dependencies `deps: DependencyList` as parameters to `useCallback`, it will return the `memoized` version of the callback function, which only updates when a specific dependency changes. It is very useful when passing the callback function to optimized child components (e.g. `shouldComponentUpdate`) using reference equality to avoid unnecessary re-renders. Moreover, `useCallback(fn, deps)` is equivalent to `useMemo(() => fn, deps)`, so `useCallback` is like a shortcut for `useMemo`.
The `exhaustive-deps` rule in `eslint-plugin-react-hooks` can warn and provide fix suggestions when incorrect dependencies are detected.
Regarding the application of `useCallback`, referring to the example provided by @松松, it's not always necessary to cache the creation of a function in JavaScript, so why create a shortcut specifically for caching function creation? This is related to `React.memo`. The default second parameter of `React.memo` is to shallowly compare the `props` of the last and current renders. If your component's `props` contain a callback function created during the rendering of the parent component (see the example below), then React considers the `props` of your child component to have changed every time the parent component (e.g. `<MyComponent />` in the example) renders. This will cause the child component (e.g. `<Button />` in the example) to re-render regardless of whether you use `React.memo` or not. In this case, `useCallback` is necessary to cache this callback function, so that React (or JavaScript) considers this prop to be the same as the last time, preventing unnecessary re-renders.

```
// The following three methods will recreate this callback function during the rendering of MyComponent
// This will cause Button to re-render because Button's props have changed
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

// Only using useCallback, even if MyComponent renders, a new callback function is not created
// This will prevent Button from re-rendering because Button's props have not changed
function MyComponent() {
  const handleClick = React.useCallBack(() => doWhatever(), []);
  return <Button onClick={handleClick} />;
}
```

## In conclusion
As to whether `useMemo` and `useCallback` should be used as much as possible, I personally believe that it should not be the case. If they were extremely effective in performance optimization and worth using for every dependency or function, React could simply make them default features, reducing the cognitive burden of using Hooks and making the code more concise. However, React has not done this. In fact, it is still a matter of trade-offs. The point is to evaluate the frequency and cost of your component's re-renders. The caching mechanisms of `React.memo`, `useMemo`, and `useCallback` also come with a cost, so a balance needs to be struck. Blindly using these caching optimization solutions is not recommended. It's important to analyze the root causes of performance issues and solve them effectively.

## Daily Question
```
https://github.com/WindrunnerMax/EveryDay
```

## References
```
https://www.zhihu.com/question/428921970
https://www.zhihu.com/question/390974405
https://juejin.cn/post/6844904032113278990
https://juejin.cn/post/6844904001998176263
https://segmentfault.com/a/1190000039405417
https://www.infoq.cn/article/mm5btiwipppnpjhjqgtr
https://zh-hans.reactjs.org/docs/hooks-reference.html
```
