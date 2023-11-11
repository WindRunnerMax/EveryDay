# Understanding `useEffect` and `useLayoutEffect`

`useEffect` and `useLayoutEffect` can be collectively referred to as the `Effect Hook`. The `Effect Hook` allows you to perform side effects in a functional component. Side effects refer to when the behavior of a function or expression depends on the external environment, or in this case, when modifying a certain state can affect other states. Data fetching, setting subscriptions, and manual manipulation of the DOM within a `React` component all fall under side effects.

## useEffect

The `useEffect` Hook can be seen as a combination of the `componentDidMount`, `componentDidUpdate`, and `componentWillUnmount` lifecycle methods. Using multiple `Effect`s achieves separation of concerns, meaning that the granularity of `useEffect` is lower, allowing you to separate the handling of side effects in different locations.

Since `useEffect` combines `componentDidMount`, `componentDidUpdate`, and `componentWillUnmount`, we can also separate them using `useEffect`. First, for `componentDidMount` and `componentWillUnmount`, which are meant to run only once (i.e., execute the effect only when the component mounts and unmounts), since there are no dependencies, the second parameter would be an empty array. If the second parameter is omitted, the effect runs during component initialization and updates. In general, this is not desirable because of the way `Hooks` are designed; each `setState` invocation re-executes the component function, leading to frequent execution of the effect function. Therefore, it's usually better not to omit the second parameter. In terms of lifecycle, if a timer is set up when the component is created, it's desired to destroy the timer when the component is unmounted to avoid memory leaks. This can be achieved by returning a function call within `useEffect`. This way, we can focus our attention in one place, without needing to handle two different lifecycles separately.

In terms of `componentDidUpdate`, if accomplishing the same functionality in a `class` component required embedding a lot of logic within this lifecycle, using `useEffect` allows us to separate different concerns and handle their side effects separately. Of course, if there is still a need to clean up things such as subscriptions or timers, a cleanup function can still be returned.

The documentation also points out the importance of ensuring that the array contains all the variables from the outer scope that are used in the `effect` and may change over time. Otherwise, your code would reference old variables from the previous render. If you pass an empty array `[]`, the `props` and `state` within the effect will always have their initial values. In the example below, a `bug` would occur if the `count` were not included in the dependencies array, as the effect closure created when the effect is run would hold the value of `count` from the initial render and would not change. To resolve this issue, we can include `count` in the dependencies array. `React` has provided an `exhaustive-deps` `ESLint` rule as part of the `eslint-plugin-react-hooks` package, which helps identify components that do not handle updates consistently.

```javascript
import { useEffect, useState } from "react";
import "./styles.css";

export default function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1);
      console.log(count + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []); // `count` has not been specified as a dependency

  return (
    <div>
      <div>{count}</div>
      <button onClick={() => setCount(count + 1)}>count + 1</button>
    </div>
  );
}
```

It looks very much like `Vue`'s `watch`, but it's not exactly the same. The main syntax difference is that `useEffect` can monitor changes in multiple properties, which `watch` cannot. Of course, `watch` can achieve this indirectly, but the concepts are different. `Vue` listens for value changes while `React` is used to handle side effects. The reason for mentioning this is that I used to write more `Vue` before, and I always tend to compare various implementations of `React` from the perspective of `Vue`. I feel this approach has both advantages and disadvantages. The advantage is that it's easy to get started quickly, but the disadvantage is that it's easy to get stuck or overthink. As a great developer once said, you need to forget about `Vue` and then learn about `Hooks`, although it's not absolute, it makes a lot of sense.

When a function component refreshes and renders, the entire process including the component containing `useEffect` is as follows:
* Trigger component re-rendering by changing the component's state or by re-rendering the component's parent, causing the child node to be re-rendered.
* Execute the component function.
* Render the component to the screen.
* Execute the `useEffect` hook.

## useLayoutEffect
`useLayoutEffect` is very similar to `useEffect`, the function signature is also the same, the only difference is that `useEffect` is asynchronous while `useLayoutEffect` is synchronous. When a function component refreshes and renders, the entire process including the component containing `useLayoutEffect` is as follows:
* Trigger component re-rendering by changing the component's state or by re-rendering the component's parent, causing the child component to be re-rendered.
* Execute the component function.
* Execute the `useLayoutEffect` hook, and `React` waits for the `useLayoutEffect` function to finish execution.
* Render the component to the screen.

## Daily Challenge

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://zhuanlan.zhihu.com/p/348701319
https://zhuanlan.zhihu.com/p/259766064
https://segmentfault.com/a/1190000039087645
http://www.ptbird.cn/react-hoot-useEffect.html
https://react.docschina.org/docs/hooks-effect.html
https://pengfeixc.com/blog/605af93600f1525af762a725
https://react.docschina.org/docs/hooks-faq.html#is-it-safe-to-omit-functions-from-the-list-of-dependencies
```
