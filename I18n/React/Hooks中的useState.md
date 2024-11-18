# useState in Hooks
In `React`, data flows unidirectionally from top to bottom, that is, from parent components to child components. Component data is stored in `props` and `state`. In fact, data is essential in any application. We need to directly change a section of the page to update the view, or indirectly change the data elsewhere. In `React`, the `props` and `state` properties are used to store data. The main purpose of `state` is to save, control, and modify the mutable state of the component. `state` is initialized within the component, can be modified by the component itself and cannot be accessed or modified externally. `state` can be considered as a local data source controlled only by the component itself. For `React` functional components, `useState` is the hook function used to manage the component's own state.

## Hooks
Regarding the meaning of `React Hooks`, Ruan Yifeng explained that the meaning of `React Hooks` is to write components as pure functions as much as possible. If external functionality and side effects are needed, use hooks to hook in external code. `React Hooks` are those hooks. I think this explanation is very appropriate. Taking `useState` as an example, when writing functional components, this function is hooked in. Inside this function, some internal scoped variables are saved, which is also known as a closure. Therefore, `Hooks` can also be understood as hooking in another scoped variable and function logic to be used in the current scope.

As for why to use `React Hooks`, the summary is still for component reusability, especially in more granular component reusability, `React Hooks` perform better. In `React`, there is an endless array of solutions for code reusability, but overall, code reusability is still very complex. A large part of this complexity is because fine-grained code reusability should not be tied to component reusability. Solutions based on component composition such as `HOC` and `Render Props` essentially wrap the reusable logic into components and then utilize component reusability to achieve logic reusability, naturally limiting the component reusability, resulting in limited extensibility, `Ref` barriers, `Wrapper Hell`, and other issues. Therefore, we need a simple and direct way of code reusability. Functions are the most direct and cost-effective way to abstract reusable logic into functions should be the most straightforward and cost-effective way to reuse code. However, for state logic, some abstract patterns (such as `Observable`) are still needed to achieve reusability. This is precisely the concept behind `Hooks`, to treat functions as the smallest unit of code reusability, while incorporating built-in patterns to simplify the reuse of state logic. Compared to the aforementioned approaches, `Hooks` decouple the logic reusability within components from the reusability of components, truly attempting to solve the problem of fine-grained logic reuse (between components) from the bottom layer. Additionally, this declarative logic reuse approach extends the explicit data flow between components and the concept of composition further into the components.

The motivation for using `React Hooks` is explained by the official documentation as follows:

`Hooks` solve a variety of seemingly unrelated problems we encountered while writing and maintaining `react` for the past five years. Whether you are learning `react`, using it every day, or even if you are only using a framework with a component model similar to `React`, you will more or less notice these issues. 

Reusable stateful logic across components is very difficult. `React` does not provide a way to attach reusable behavior to a component, such as connecting it to a `store` like the `connect` method in state management libraries like `redux`. If you have been using `React` for a while, you may be familiar with patterns like render props and higher-order components to try to solve these problems, but these patterns require you to refactor your components when using them, which can be cumbersome and make the code harder to maintain. With `Hooks`, you can extract stateful logic from a component so it can be tested independently and reused. If you look at a typical `React` application in `React DevTools`, you may find a wrapper hell composed of components containing providers, consumers, higher-order components, render props, and other abstraction layers. Although we can filter them out in `DevTools`, it reflects a deeper problem: `React` needs a better native way to share stateful logic. With `Hooks`, you can extract the stateful logic from the components, making it easier to test and reuse. At the same time, `Hooks` allow you to reuse stateful logic without changing the component structure, making it easier to share `Hook` among many components or with the community.

Complex components become hard to understand. We often end up maintaining components that started out very simple but slowly evolved into an unmanageable mess of stateful logic and a bunch of side-effectful components. As development progresses, they become larger and messier, with various logic scattered throughout the components, and each lifecycle hook containing a bunch of unrelated logic. For example, our component might perform some data fetching work in `componentDidMount` and `componentDidUpdate`, but the same `componentDidMount` method might also contain some unrelated logic, such as setting up event listeners (which later need to be cleaned up in `componentWillUnmount). Related code is split, but completely unrelated code ends up being combined into one method, making it too easy to introduce errors and inconsistencies. The end result is that tightly related code is separated, while unrelated code is combined, which can easily lead to bugs and exceptions. In many cases, we are not likely to decompose these components into smaller ones because stateful logic is everywhere, and testing them is also very difficult. This is also one of the reasons why many people like to combine `React` with a state management library. However, this usually introduces too much abstraction, requiring you to switch between different files and making reusing components more difficult. Therefore, `Hooks` allow you to split a component into smaller functions based on related pieces (such as setting up subscriptions or fetching data) without forcing you to break it into lifecycle methods. You can also opt to use a `reducer` to manage the component's local state to make it more predictable.

Hard-to-understand `class`. Apart from the difficulty in code reuse and management, we also found that `class` is a major barrier to learning `React`. You have to understand how `this` works in `JavaScript`, which is vastly different from other languages, and not to mention binding event handlers. Without a stable syntax proposal, this code becomes very redundant. People can understand `props`, `state`, and the top-down data flow very well, but when it comes to `class`, they are at a loss. Even among experienced `React` developers, there are differences in understanding the differences between function components and `class` components, as well as the scenarios for using the two types of components. In addition, `React` has been released for five years, and we hope it can keep up with the times for the next five years, just like other libraries such as `Svelte`, `Angular`, `Glimmer`, etc., have shown. Component pre-compilation has huge potential, especially when it is not limited to templates. Recently, we have been experimenting with `Prepack` to try `component folding`, and have made some initial progress. However, we found that using `class` components inadvertently encourages developers to use some solutions that render optimization measures ineffective. `class` also brings some problems to the current tools, for example, `class` cannot be compressed well and can cause unstable situations in hot reloading. Therefore, we want to provide an API that makes code easier to optimize. To solve these problems, `Hooks` allow you to use more `React` features in a non-`class` scenario. In concept, `React` components have always been more like functions, and `Hooks` embrace functions while also not sacrificing the spirit of `React`. `Hooks` provide a solution to the problem without the need to learn complex functional or reactive programming techniques.

## useState
The simplest use of `useState` is as follows: `https://codesandbox.io/s/fancy-dust-kbd1i?file=/src/App.tsx`.

```
// App.tsx
import { useState } from "react";
import "./styles.css";

export default function App() {
  const [count, setCount] = useState(0);
```

```jsx
console.log("refresh");
const addCount = () => setCount(count + 1);

return (
  <>
    <div>{count}</div>
    <button onClick={addCount}>Count++</button>
  </>
);
}

When the page is initially rendered, the `<App />` function component is rendered, which actually calls the `App()` method, obtains a virtual `DOM` element, and renders it on the browser page. When the user clicks the `button`, the `addCount` method is called, and then the `<App />` function component is rendered again, which actually calls the `App()` method with the `props` parameter, obtaining a new virtual `DOM` element. Then `React` executes the `DOM diff` algorithm and updates the changed parts on the browser page. In other words, every time `setCount` is executed, the `App()` function is re-executed, and this can be seen with the effect of `console.log("refresh")`, which is printed in the console each time the button is clicked.

So the question is, during the initial rendering and the `+1` operation, the `App()` function is called to execute the `const [count, setCount] = useState(0);` line of code. How does it manage to execute the same code after the `+ +` operation without reinitializing the variable `n`, which always remains as `0`, but instead, it gets the latest value of `n`.

Considering this issue, we can easily implement a `useMyState` function. As mentioned in the discussion about why `Hooks` are called `Hooks`, it was suggested that a function scope can be hooked. Therefore, we can also completely implement a `Hooks` to hook a scope. In simple terms, we can save a variable inside `useMyState`, that is, a closure that saves this variable inside it, and this variable retains the previous value. When called again, we can simply retrieve the previously saved value, `https://codesandbox.io/s/fancy-dust-kbd1i?file=/src/use-my-state-version-1.ts`.

// index.tsx
import { render } from "react-dom";
import App from "./App";

// Let's modify it to export, so that we can forcibly refresh `<App />`
export const forceRefresh = () => {
  console.log("Force fresh <App />");
  const rootElement = document.getElementById("root");
  render(<App />, rootElement);
};

forceRefresh();
```

// use-my-state-version-1.ts
import { forceRefresh } from "./index";

let saveState: any = null;

export function useMyState<T>(state: T): [T, (newState: T) => void] {
  saveState = saveState || state;
  const rtnState: T = saveState;
  const setState = (newState: T): void => {
    saveState = newState;
    forceRefresh();
  };
  return [rtnState, setState];
}

// App.tsx
import { useMyState } from "./use-my-state-version-1";
import "./styles.css";

export default function App() {
  const [count, setCount] = useMyState(0);

  console.log("refresh");
  const addCount = () => setCount(count + 1);

  return (
    <>
      <div>{count}</div>
      <button onClick={addCount}>Count++</button>
    </>
  );
}
```

You can see in `code sandbox` that now we can click the button to perform the `++` operation, instead of always getting `0` no matter how many times you click. However, the above situation is too simple because there is only one `state`. If multiple variables are used, you need to call `useState` twice. We need to make some improvements, otherwise it will cause multiple variables to exist in one `saveState`, resulting in conflicts and overrides. There are two ways to improve: `1` making it into an object, such as `saveState = { n:0, m:0 }`, but this way does not quite meet the requirement because `useState` only passes an initial value parameter and does not pass a name. `2` make `saveState` into an array, such as `saveState: [0, 0]`. In fact, in `React`, it is replaced by a form similar to a singly linked list, sequentially linking all the `hooks` with `next`. Using an array is a similar operation because both depend on the order of defining `Hooks`, `https://codesandbox.io/s/fancy-dust-kbd1i?file=/src/use-my-state-version-2.ts`.

You can see that independent state updates in multiple `State` have been achieved. But then, here comes another problem. `<App />` uses `saveState` and `index`, so what do other components use? In other words, if multiple components need to solve the issue of independent scopes for each component, Solution `1` would be to create a `saveState` and `index` for each component. However, several components in one file will lead to conflicts with `saveState` and `index`. Solution `2` would be to place it on the corresponding virtual node object of the component. This is also the approach adopted by `React`. It places the `saveState` and `index` variables on the virtual node object `FiberNode`. In React, the specific implementation of `saveState` is called `memoizedState`. In fact, React uses a form similar to a singly linked list to replace arrays and uses `next` to sequentially link all the hooks.

It can be seen that `useState` is strongly dependent on the defined order. The order in which the `useState` array is saved is very important. When executing function components, you can obtain the corresponding `state` value by incrementing the index. Because it is obtained in order, this will force you not to change the order of `useState`. For example, using conditional judgment to determine whether to execute `useState` will lead to obtaining values in a different order than expected. This problem also exists in `React.useState` itself. Therefore, React does not allow you to use conditional judgment to control the order of `useState` in function components, as this will result in obtaining chaotic values. A similar code as below will throw an exception.

```jsx
const App = () => {
    let state;
    if(true){
        [state, setState] = React.useState(0);
    }
    return (
        <div>{state}</div>
    )
}

<!-- React Hook "React.useState" is called conditionally. React Hooks must be called in the exact same order in every component render  react-hooks/rules-of-hooks-->
```

Of course, this is just a simple implementation of `useState`. For the true implementation of `React`, you can refer to `packages/react-reconciler/src/ReactFiberHooks.js`. The current version of `React` is `16.10.2`. You can also take a brief look at the related `type`.

```ts
type Hooks = {
  memoizedState: any, // Points to the final status value of the current rendering node `Fiber` after the last complete update
  baseState: any, // Initialized `initialState` as well as `newState` after each `dispatch`
  baseUpdate: Update<any> | null, // The current update needed `Update` will be assigned the previous `update` after each update, making it easier for `react` to trace back the data on the edge of rendering errors
  queue: UpdateQueue<any> | null, // Cached update queue storing multiple update behaviors
  next: Hook | null, // `link` to the next `hooks` linking all `hooks` through `next`
}
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
- https://juejin.cn/post/6963559556366467102
- https://juejin.cn/post/6944908787375734791
- https://juejin.cn/post/6844903990958784526
- https://juejin.cn/post/6865473218414247944
- https://juejin.cn/post/6844903999083118606
- https://github.com/brickspert/blog/issues/26
- https://react.docschina.org/docs/hooks-state.html
- https://jelly.jd.com/article/61aed4a97f05d46ce6b791f4
- https://blog.csdn.net/Marker__/article/details/105593118
- https://www.ruanyifeng.com/blog/2019/09/react-hooks.html
- https://react.docschina.org/docs/hooks-faq.html#how-does-react-associate-hook-calls-with-components
```