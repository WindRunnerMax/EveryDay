# Handwriting `useState` and `useEffect`
`useState` and `useEffect` are the basics that drive `React hooks`. `useState` is used to manage state, while `useEffect` is used to handle side effects. Understanding the operation principles of `useState` and `useEffect` by writing them manually.

## useState
A simple usage of `useState` is as follows.

```jsx
// App.tsx
import { useState } from "react";
import "./styles.css";

export default function App() {
  const [count, setCount] = useState(0);

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
When the page is first rendered, it will render the `<App />` function component. In reality, it calls the `App()` method, obtains a virtual `DOM` element, and renders it on the browser page. When the user clicks the `button`, it calls the `addCount` method, and then re-renders the `<App />` function component. In reality, it calls the `App()` method again, obtains a new virtual `DOM` element, and then `React` executes the `DOM diff` algorithm, updating the changed parts to the browser page. In other words, each time `setCount` is called, it will re-execute the `App()` function. This can be seen in the effect of `console.log("refresh")`, which prints "refresh" to the console every time the button is clicked.
So the question is, when the page is first rendered and when we perform the `+1` operation, both times the `App()` function is called to execute the line `const [count, setCount] = useState(0);`, how does it manage to execute the same code after the `+` operation without reinitializing the variable `n` (which continues to be `0`), and instead, it retrieves the latest value of `n`. Considering this problem, we can simply implement a `useMyState` function. This brings up the issue raised in `Hooks` about hooking into a function's scope. Therefore, we can completely implement a `Hooks` function to hook into a scope. In essence, in `useMyState`, we save a variable within a closure, and this variable holds the previous value. When called again, we simply retrieve this previously saved value, [`https://codesandbox.io/s/fancy-dust-kbd1i?file=/src/use-my-state-version-1.ts`](https://codesandbox.io/s/fancy-dust-kbd1i?file=/src/use-my-state-version-1.ts).

```jsx
// index.tsx
import { render } from "react-dom";
import App from "./App";

// Modify to export and allow us to forcefully refresh `<App />`
export const forceRefresh = () => {
  console.log("Force fresh <App />");
  const rootElement = document.getElementById("root");
  render(<App />, rootElement);
};

forceRefresh();
```

```jsx
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
```

```jsx
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

You can see that independent state updates in multiple `State` have been achieved. Then a new problem arises. `<App />` uses `saveState` and `index`, but what about other components? In other words, how do multiple components resolve their independent scopes? One solution is for each component to create its own `saveState` and `index`, but several components in one file will lead to conflicts between `saveState` and `index`. Another solution is to place them on the corresponding virtual node objects for the components. This is also the approach adopted by `React`, which places the `saveState` and `index` variables on the corresponding virtual node object `FiberNode`. In `React`, the specific implementation of `saveState` is called `memoizedState`. In reality, `React` replaces arrays with a form similar to a singly linked list, linking all the hooks in order through `next`.

It's evident that `useState` relies heavily on the defined order. The order in which values are saved in the `useState` array is crucial, as it allows the corresponding state value to be obtained by incrementing the index when executing function components. Since the order is maintained, it forces you to not change the order of `useState`. For instance, using conditional judgment to determine whether to execute `useState` will cause the obtained values to differ from the expected values. This problem also occurs with `React.useState` itself. Therefore, `React` does not allow you to use conditional judgment to control the order of `useState` in function components, as it would result in chaotic values. The code snippet below would throw an exception similar to the following:

```
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

Of course, this is only a simple implementation of `useState`. For the actual implementation in `React`, you can refer to `packages/react-reconciler/src/ReactFiberHooks.js`. The current version of `React` is `16.10.2`, and you can also take a brief look at the related types.

```ts
type Hooks = {
  memoizedState: any, // Points to the final state value after each complete update of the current rendering node `Fiber`
  baseState: any, // Initialized `initialState` and `newState` after each `dispatch`
  baseUpdate: Update<any> | null, // The current `Update` that needs to be updated. After each update, the previous `update` is assigned to facilitate `react` in tracing back to the data on the edge of rendering errors
  queue: UpdateQueue<any> | null, // Cached update queue to store multiple update actions
  next: Hook | null, // `Link` to the next `hooks` by `next` to link all `hooks`
}
```

## useEffect
Here's a simple use case of `useEffect`.

```
import { useEffect, useState } from "react";
import "./styles.css";

export default function App() {
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);

  console.log("refresh");
  const addCount1 = () => setCount1(count1 + 1);
  const addCount2 = () => setCount2(count2 + 1);

  useEffect(() => {
    console.log("count1 -> effect", count1);
  }, [count1]);

  return (
    <>
      <div>{count1}</div>
      <button onClick={addCount1}>Count1++</button>
      <div>{count2}</div>
      <button onClick={addCount2}>Count2++</button>
    </>
  );
}
```

In the same way, every time `addCount1` is executed, the `App()` function is re-executed. The console will print `refresh` every time the button is clicked. Here, the change in `count1` is used as a side effect to print `count1 -> effect ${count1}`. However, clicking `addCount2` does not trigger the side effect printing. The obvious reason is that we only specified the side effect of `count1`. It can be seen that `useEffect` can be used to achieve more granular side effect handling.

Here, we continue the train of thought of implementing `useState` by storing the previous data and comparing whether the data has changed when the function is executed. If a change has occurred, the function is executed. Of course, we also need to complete the side effect cleanup function. [Example Link](https://codesandbox.io/s/react-usestate-8v0li9?file=/src/use-my-effect.ts).

```typescript
// use-my-effect.ts
const dependencyList: unknown[][] = [];
const clearCallbacks: (void | (() => void))[] = [];
let index: number = 0;

export function useMyEffect(
  callback: () => void | (() => void),
  deps: unknown[]
): void {
  const curIndex = index;
  index++;
  const lastDeps = dependencyList[curIndex];
  const changed =
    !lastDeps || !deps || deps.some((dep, i) => dep !== lastDeps[i]);
  if (changed) {
    dependencyList[curIndex] = deps;
    const clearCallback = clearCallbacks[curIndex];
    if (clearCallback) clearCallback();
    clearCallbacks[curIndex] = callback();
  }
}

export function clearEffectIndex() {
  index = 0;
}
```

```typescript
// App.tsx
import { useState } from "react";
import { useMyEffect, clearEffectIndex } from "./use-my-effect";
import "./styles.css";

export default function App() {
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);

  console.log("refresh");

  const addCount1 = () => setCount1(count1 + 1);
  const addCount2 = () => setCount2(count2 + 1);

  useMyEffect(() => {
    console.log("count1 -> effect", count1);
    console.log("setTimeout", count1);
    return () => console.log("clear setTimeout", count1);
  }, [count1]);

  useMyEffect(() => {
    console.log("count2 -> effect", count2);
  }, [count2]);

  clearEffectIndex();

  return (
    <>
      <div>{count1}</div>
      <button onClick={addCount1}>Count1++</button>
      <div>{count2}</div>
      <button onClick={addCount2}>Count2++</button>
    </>
  );
}
```

With this implementation, we can also use the method of storing dependencies and cleanup functions to achieve the functionality of `useEffect`. By comparing the previously passed dependency values with the current ones, we can determine whether to execute the passed function. Since we cannot know when the last `Effect` of the `React.FC` component function is completed, we need to manually assign the `index` marker to `0`. In `React`, `useEffect` is also mounted on `Fiber` and the required dependency values are stored in the `memorizedState` of the current `Fiber`. This is achieved by implementing a linked list and judging the initial load in order to connect all the `hooks` in sequence through `next`, thus determining which is the last `Hooks`. Furthermore, `useEffect` also strongly depends on the defined order, allowing `React` to align the dependencies when executing the component function multiple times.

## Custom Hooks

When I was first learning `Hooks`, I always had a question about the difference between using `React Hooks` and regular function calls, and at that time, I even answered a question on Zhihu.

In my understanding of `React` after a few days of study, the difference between custom `Hooks` and regular functions lies in:
- `Hooks` should only be called within `React` function components and not in regular function calls.
- `Hooks` can call functions such as `useState`, `useEffect`, and `useContext`, while regular functions cannot.

Therefore, I feel that `Hooks` are like `mixins`, a way to share state and side effects between components. So, functions related to component lifecycle and other component-related functions should be considered as `Hooks`, rather than just regular `utils` functions.

Regarding the first question, if a function is declared as a `Hook` but does not fulfill the role of a Hook, then I believe it should not be called a `Hook`. To avoid confusion, it is advisable to use the `use` prefix when calling other `Hooks`. Of course, for instance, even if you implement a `useState` function that does not call other `Hooks`, but is closely related to the functionality of function components, it definitely falls under the category of `Hooks`.

As for the second question, the requirement to use a prefix of `use` is not a syntax rule or a mandatory solution. Beginning with `use` is more of a convention, similar to the convention that `GET` requests do not carry a `Body`. Its main purpose is still to constrain syntax. If you try to implement a simple functionality similar to `useState` by yourself, you will understand why code like `if (xxx) const [a, setA] = useState(0);` cannot appear. The `React` documentation clearly states the rules for using `Hooks`, and the purpose of using the `use` prefix is to make `React` recognize that it is a `Hook` in order to check these rules. Typically, `ESlint` is used in conjunction with `eslint-plugin-react-hooks` to check these rules.

Later on, I gained a new understanding of this issue. If you define a truly custom `Hook`, it usually needs to use `useState`, `useEffect`, and other `Hooks`. This means that a custom `Hook` is composed of official `Hooks`, and by combining these official `Hooks`, you can achieve the mounting of data onto nodes. In other words, the actual `memorizedState` mentioned earlier is within the `Fiber`, and functions self-implemented, such as the `Hooks` implementation mentioned earlier, cannot achieve this. This means that through custom `Hooks`, we encapsulate some state or other aspects of logic within the nodes by combining official `Hooks` and our own logic, while using regular functions with a syntax similar to `Hooks` can only encapsulate global state and logic. In simple terms, it provides an interface for us to encapsulate logic on nodes.

As an example, if we want to encapsulate a `useUpdateEffect` to prevent the effect from being executed when a function component is first mounted, we should use `useRef` or `useState` rather than simply defining a variable to store state, as shown in this [sandbox](https://codesandbox.io/s/flamboyant-tu-21po2l?file=/src/App.tsx).

```javascript
// use-update-effect-ref.ts
import { DependencyList, EffectCallback, useEffect, useRef } from "react";

export const useUpdateEffect = (
  effect: EffectCallback,
  deps?: DependencyList
) => {
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    } else {
      return effect();
    }
  }, deps);
};
```

```javascript
// use-update-effect-var.ts
import { DependencyList, EffectCallback, useEffect } from "react";

let isMounted = false;
export const useUpdateEffect = (
  effect: EffectCallback,
  deps?: DependencyList
) => {
  useEffect(() => {
    if (!isMounted) {
      isMounted = true;
    } else {
      return effect();
    }
  }, deps);
};
```

```javascript
// App.tsx
import { useState, useEffect } from "react";
import { useUpdateEffect } from "./use-update-effect-ref";
// import { useUpdateEffect } from "./use-update-effect-var";
import "./styles.css";
```

```jsx
export default function App() {
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);

  const addCount1 = () => setCount1(count1 + 1);
  const addCount2 = () => setCount2(count2 + 1);

  useUpdateEffect(() => {
    console.log("count1 -> effect", count1);
  }, [count1]);

  useUpdateEffect(() => {
    console.log("count2 -> effect", count2);
  }, [count2]);

  return (
    <>
      <div>{count1}</div>
      <button onClick={addCount1}>Count1++</button>
      <div>{count2}</div>
      <button onClick={addCount2}>Count2++</button>
    </>
  );
}
```



When we switch between `use-update-effect-ref` and `use-update-effect-var` of `useUpdateEffect`, we will find that when refreshing the page, using `use-update-effect-ref` will not print any value, while `use-update-effect-var` will print `count2 -> effect 0`. Clicking `Count1++` or `Count2++` works normally, indicating that `use-update-effect-ref` can achieve the functionality we want, while `use-update-effect-var` cannot correctly implement the functionality due to the problem of variable sharing. Of course, we can also solve this problem by using array-like methods, but when it comes to the sharing between specific components, we cannot achieve it based on the `Hooks` syntax. We must manually register a closure to achieve similar functionality, and similar to updating the component and its child components when using `useState` to refresh when `set` is called, we must rely on `useState` to achieve this.

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://zhuanlan.zhihu.com/p/265662126
https://juejin.cn/post/6927698033798807560
https://segmentfault.com/a/1190000037608813
https://github.com/brickspert/blog/issues/26
https://codesandbox.io/s/flamboyant-tu-21po2l
https://codesandbox.io/s/react-usestate-kbd1i
https://codesandbox.io/s/react-usestate-8v0li9
https://stackoverflow.com/questions/60133412/react-custom-hooks-vs-normal-functions-what-is-the-difference
```