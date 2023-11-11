# Hooks and Event Binding

In `React`, we often need to add event handlers to components, such as handling form submissions and click events. Typically, in class components, we use the `this` keyword to bind the context of event handlers so that we can access the component's instance properties and methods within the function. `React Hooks` is a new feature introduced in `React 16.8`, enabling functional components to have state and lifecycle methods. The advantage of `Hooks` lies in the ability to reuse state logic and side effect code without writing class components. One common use case of `Hooks` is event handling.

## Description

When using class components in `React`, we can often be bothered by a lot of `this`, such as `this.props`, `this.state`, and calling functions within the class. Additionally, when defining event handlers, it is typically necessary to use the `bind` method to bind the context of the function to ensure that the component instance's properties and methods can be accessed correctly within the function. Although arrow functions can reduce the use of `bind`, the use of `this` syntax is still unavoidable.

However, when using `Hooks`, there is no need to use the `this` keyword in functional components. `Hooks` organize component logic in the form of functions. We typically only need to define a regular function component and use `useState`, `useEffect`, and other `Hooks` to manage the component's state and side effects. When handling event binding, we simply need to pass the defined event handling function into the `JSX`, without requiring `this` or `bind`.

Now the question arises, is this issue really that simple? We often hear about the heavy mental burden of something like `Hooks`. From the perspective of the event binding we are discussing, the mental burden mainly manifests in `useEffect`, `useCallback`, and dependency arrays. In comparison, class components are similar to the mental burden of introducing `this` and `bind`, and `Hooks` solve the mental burden of class components while introducing a new mental burden. However, from another perspective, the so-called mental burden is simply new knowledge that needs to be accepted. We need to understand `React` introducing new designs and new component models. Once we have mastered them, it will no longer be called a mental burden, but rather syntax. Of course, calling it a burden is not entirely unreasonable, as it is easy to inadvertently create hazards. Next, let's discuss the issues related to `Hooks` and event binding, and all sample codes are available at `https://codesandbox.io/s/react-ts-template-forked-z8o7sv`.

## Event Binding

Using `Hooks` for regular synthetic event binding is quite straightforward. In this example, we use the ordinary synthetic event `onClick` to listen to the button click event and call the `add` function to update the value of the `count` state variable when the button is clicked. This way, every time the button is clicked, `count` will increase by `1`.

```js
// https://codesandbox.io/s/hooks-event-z8o7sv
import { useState } from "react";

export const CounterNormal: React.FC = () => {
  const [count, setCount] = useState(0);
  const add = () => {
    setCount(count + 1);
  };
  return (
    <div>
      {count}
      <div>
        <button onClick={add}>count++</button>
      </div>
    </div>
  );
};
```

This example looks very simple, so we won't explain it further. In fact, from another perspective, isn't this similar to the native `DOM0` event flow model, where each object can only bind one `DOM` event? Therefore, there is no need to maintain the original function reference for unmounting, as in the `DOM2` event flow model. Otherwise, it cannot be uninstalled. If the reference address is not kept the same, it will cause an infinite binding, leading to memory leaks. With `DOM0`, we simply need to override it without needing to maintain the previous function reference. In actuality, some of the mental burdens we are about to discuss are closely related to reference addresses.

Additionally, we need to clarify one point. When we click this `count` button, what does `React` do for us? For the current `<CounterNormal />` component, when we click the button, it definitely needs to refresh the view. `React's` strategy is to re-execute this function to obtain the returned `JSX`, then go through processes like `diff`, and finally render. The focus now is on the re-execution of this function component. `Hooks` are essentially just functions. `React` assigns special meaning to functions through built-in `use`, allowing them to access `Fiber` to bind data and nodes to each other. Therefore, it is a function, and it will be re-executed when `setState` is called. Consequently, the address of the `add` function before and after clicking the button is different because the function is actually redefined, although it has the same name. Thus, its generated static scope is different. This can lead to what is known as a closure trap. Next, we will continue to discuss related issues.

## Native Event Binding
Although `React` provides us with synthetic events, in actual development, for various reasons, we cannot avoid using native event binding. For example, with `ReactDOM` portals, they follow the synthetic event flow rather than the `DOM` event flow. For instance, when you directly mount a component under `document.body`, the event may not follow the expected `DOM` structure, which might not meet our expectations. In such cases, native event binding may be necessary. Additionally, many libraries may have event binding similar to `addEventListener`, so it is essential to add and remove event bindings at the appropriate times.

Let's take a look at the example of native event binding below:

```js
// https://codesandbox.io/s/react-ts-template-forked-z8o7sv?file=/src/counter-native.tsx
import { useEffect, useRef, useState } from "react";

export const CounterNative: React.FC = () => {
  const ref1 = useRef<HTMLButtonElement>(null);
  const ref2 = useRef<HTMLButtonElement>(null);
  const [count, setCount] = useState(0);

  const add = () => {
    setCount(count + 1);
  };

  useEffect(() => {
    const el = ref1.current;
    const handler = () => console.log(count);
    el?.addEventListener("click", handler);
    return () => {
      el?.removeEventListener("click", handler);
    };
  }, []);

  useEffect(() => {
    const el = ref2.current;
    const handler = () => console.log(count);
    el?.addEventListener("click", handler);
    return () => {
      el?.removeEventListener("click", handler);
    };
  }, [count]);

  return (
    <div>
      {count}
      <div>
        <button onClick={add}>count++</button>
        <button ref={ref1}>log count 1</button>
        <button ref={ref2}>log count 2</button>
      </div>
    </div>
  );
};
```

In this example, we have done native event binding for both `ref1` and `ref2` buttons. The event binding for `ref1` occurs when the component is mounted, while the event binding for `ref2` occurs when `count` changes. It may seem like there's only a difference between the dependency arrays `[]` and `[count]` in the code, but in reality, there is a significant difference in the effects. In the above `CodeSandbox` example, if we first click the `count++` button three times and then click the `log count 1` and `log count 2` buttons, the output will be as follows:

```js
0 // log count 1
3 // log count 2
```

Here, we can see that even though the `count` value on the page is `3`, when we click the `log count 1` button, the output is `0`, and it is only when we click the `log count 2` button that the output is `3`. Thus, the output from clicking the `log count 1` button definitely does not meet our expectations.

So, why does this happen? Actually, this is the so-called "React Hooks closure trap." In fact, as we mentioned earlier, `Hooks` are nothing more than functions. `React` assigns special meaning to functions through the built-in `use`, allowing them to access `Fiber` and bind data and nodes to each other. Since it is a function, and it re-executes when `setState` is called, the address of the `add` function before and after clicking the button is different because the function is essentially redefined, albeit with the same name. As a result, the static scope created by the new function execution is different. Therefore, when the new function is executed, if we do not update the new function, i.e., do not update the function scope, it will retain the reference to the previous `count`, leading to printing the data from the first binding.

So, similarly, `useEffect` is also a function, and the function we defined to bind events is actually just the parameter of `useEffect`. When the `state` changes, this function is also redefined. However, due to the relationship with our second parameter, which is the dependency array, the values inside the array remain the same after two `render` calls. Therefore, `useEffect` will not trigger the execution of this side effect. In fact, in `log count 1`, because the dependency array is empty `[]`, the values inside the array remain unchanged after two `render` calls, so the side effect function will not be executed. In `log count 2`, because the dependent array is `[count]`, the values have changed after two `render` calls, causing the previous side effect function to be executed, which in this case is the cleanup function `removeEventListener`, followed by the execution of the newly passed side effect function `addEventListener`. 

It's also because React needs to return a cleanup function for the side effect, so the first function cannot be directly decorated with `async`, otherwise, after executing the side effect, it will return a `Promise` object instead of directly executable side effect cleanup function.

## useCallback
In the above scenario, we seem to have solved the problem by adding a dependency array to `useEffect`, but consider a scenario where a function needs to be imported in multiple places, similar to our previous example of the `handler` function. If we need to reference this function in multiple places, we cannot directly define it in the first parameter of `useEffect` as we did in the previous example. If defined externally, this function will be redefined at each `re-render`, causing the dependency array of `useEffect` to change, thereby causing the side effect function to be re-executed, which is not what we expect. At this point, we need to keep the address of this function unique, and that's where the `useCallback` Hook comes in. When using the `useCallback Hook` in React, it returns a memoized callback function that is only recreated when its dependencies change, otherwise it is cached for reuse in subsequent renders. This approach can help optimize performance in React components because it prevents unnecessary re-renders. When passing this memoized callback function to a child component, it avoids recreating it on each render, improving performance and reducing memory usage. 

Now, let's look at the example below, which uses `useCallback` to bind events:

```js
// https://codesandbox.io/s/react-ts-template-forked-z8o7sv?file=/src/counter-callback.tsx
import { useCallback, useEffect, useRef, useState } from "react";

export const CounterCallback: React.FC = () => {
  const ref1 = useRef<HTMLButtonElement>(null);
  const ref2 = useRef<HTMLButtonElement>(null);
  const [count, setCount] = useState(0);

  const add = () => {
    setCount(count + 1);
  };

  const logCount1 = () => console.log(count);

  useEffect(() => {
    const el = ref1.current;
    el?.addEventListener("click", logCount1);
    return () => {
      el?.removeEventListener("click", logCount1);
    };
  }, []);

  const logCount2 = useCallback(() => {
    console.log(count);
  }, [count]);

  useEffect(() => {
    const el = ref2.current;
    el?.addEventListener("click", logCount2);
    return () => {
      el?.removeEventListener("click", logCount2);
    };
  }, [logCount2]);

  return (
    <div>
      {count}
      <div>
        <button onClick={add}>count++</button>
        <button ref={ref1}>log count 1</button>
        <button ref={ref2}>log count 2</button>
      </div>
    </div>
  );
};
```

In this example, our `logCount1` is not wrapped in a `useCallback`, so it is redefined every time a re-render occurs. At the same time, `useEffect` did not define an array, so it doesn't re-execute event binding during re-render. On the other hand, for `logCount2`, we used `useCallback` wrapping, so every time there's a re-render, because the dependency array is `[count]`, when `count` changes, the address of the function returned by `useCallback` also changes. If there were many other states and they changed while `count` stayed the same, `logCount2` would not change. Since we only have the `count` state here, when a re-render occurs, the dependency array of `useEffect` changes and the event binding is re-executed. 

In the CodeSandbox above, if we first click the `count++` button three times and then click the `log count 1` and `log count 2` buttons respectively, the output will be as follows:

```js
0 // log count 1
3 // log count 2
```

In fact, if we don't use the `react-hooks/exhaustive-deps` rule, it will suggest using the `3.3` method to handle dependencies, which is the most standard solution. The other solutions either involve unnecessary function redefinition or the persistence of old function scope references. 

Although these situations may seem complex, following the `react-hooks/exhaustive-deps` rule would actually recommend the use of the `3.3` method to handle dependencies, which is the most standard solution. Other solutions either involve unnecessary function redefinition or the persistence of old function scope references. This suggests that the mental burden of `React` is indeed significant, and `useCallback` does not completely solve the problem.

## useMemoizedFn

Similarly, let's consider another example that might be relatively complex because it involves a long dependency chain, making it appear quite tricky. In this case, it's not that `useCallback` is flawed, but rather it presents a significant mental burden.

```js
const getTextInfo = useCallback(() => { // Retrieve some data
  return [text.length, dep.length];
}, [text, dep]);

const post = useCallback(() => { // Send data
  const [textLen, depLen] = getTextInfo();
  postEvent({ textLen, depLen });
}, [getTextInfo, postEvent]);

useEffect(() => {
  post();
}, [dep, post]);
```

In this example, our goal is to trigger the `post` function only when `dep` changes, in order to send the data. We've defined the functions according to the `react-hooks/exhaustive-deps` rules. At first glance, everything seems fine, but in practice, if the `text` state changes, it also triggers the execution of the `post` function. This is a subtle issue that may not be immediately apparent, especially if the `text` state changes infrequently. Moreover, the dependency chain in this case is already quite long, and if the function becomes more complex, the overall complexity will become increasingly difficult to maintain.

So, how do we solve this problem? One feasible solution is to define the function on `useRef`, so we always get the latest function definition, just like directly defining a function call, without being constrained by the `react-hooks/exhaustive-deps` rule. However, in practice, this doesn't reduce the complexity but simply shifts it to `useRef`, adding additional mental burden to maintain the value of `useRef`.

```js
const post = useRef(() => void 0);

post.current = () => {
  postEvent({ textLen, depLen });
}

useEffect(() => {
  post.current();
}, [dep]);
```

So since we can rely on `useRef` to solve this problem, can we encapsulate it as a custom `Hook`? And because in reality we can't prevent the creation of functions, we use two `refs`, the first `ref` ensures that it is always the same reference, that is, the returned function always points to the same function address. The second `ref` is used to save the current incoming function, so that when a `re-render` occurs, we update it every time a new function is created, which means that we will always call the latest function. In this way, with two `refs`, we can ensure two things: first, no matter how many `re-renders` occur, we will always return the same function address; second, no matter how many `re-renders` occur, the function we are about to call is always the latest one. Therefore, let's see how `ahooks` implements `useMemoizedFn`.

```js
type noop = (this: any, ...args: any[]) => any;

type PickFunction<T extends noop> = (
  this: ThisParameterType<T>,
  ...args: Parameters<T>
) => ReturnType<T>;

function useMemoizedFn<T extends noop>(fn: T) {
  const fnRef = useRef<T>(fn);

  // why not write `fnRef.current = fn`?
  // https://github.com/alibaba/hooks/issues/728
  fnRef.current = useMemo(() => fn, [fn]);

  const memoizedFn = useRef<PickFunction<T>>();
  if (!memoizedFn.current) {
    memoizedFn.current = function (this, ...args) {
      return fnRef.current.apply(this, args);
    };
  }

  return memoizedFn.current as T;
}
```

So using it is very simple, you can see that when we use `useMemoizedFn`, we do not need a dependency array. Although we defined the dependency of the `post` function in `useEffect`, since we ensured the first point above, the address of this dependency function will not change until the component is completely unmounted. Therefore, we can ensure that only changes in `dep` will trigger `useEffect`, and we ensure the second point, which allows us to get the latest function scope after `re-render`, that is, `textLen` and `depLen` are guaranteed to be the latest and there is no problem of getting values from the old function scope.

```js
const post = useMemoizedFn(() => {
  postEvent({ textLen, depLen });
});

useEffect(() => {
  post.current();
}, [dep, post]);
```

## Daily question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://juejin.cn/post/7194368992025247804
https://juejin.cn/post/7098137024204374030
https://react.dev/reference/react/useCallback
```