# The trap of closures in React

`React Hooks` is a new feature introduced in `React 16.8`, allowing functional components in `React` to have state and lifecycle methods. Its advantage lies in enabling us to reuse state logic and side-effect code with finer granularity without writing class components. However, it also brings additional mental burden, and one of the pitfalls is the closure trap.

## Closures
From the name "React closure trap", it is evident that our problem is related to closures. Thus, closures are the issue we must explore. A closure is formed by binding a function and its lexical environment, constituting a bridge that allows inner functions to access the outer function's scope. In `JavaScript`, functions create closures each time they are created. Essentially, a closure is a bridge connecting the interior and exterior of a function. Generally, not all the names used in a program code are always valid or accessible, and the code scope that delimits the availability of a name is the name's scope. When a method or member is declared, it possesses the current execution context environment. Within a specific value context, expressions are visible and can be referenced. If a variable or expression is not in the current scope, it cannot be used. Scopes can be hierarchically layered based on the code's structure, enabling child scopes to access parent scopes. Usually, this involves traversing a chain of scope to locate variables and references in parent scopes, which cannot be accessed from a child scope.

To define a closure, we first need a function to encase an anonymous function. Closures are intended to make use of local variables; using global variables would negate the purpose of using closures. The outermost defined function can establish a local scope to define local variables, which cannot be directly accessed from outside the function. From the example below, we can observe that the `name` variable defined inside the function is not destroyed, and we can still access this local variable from the outside using the function. With closures, local variables can remain in memory, helping to avoid the use of global variables, as the pollution caused by global variables can lead to unpredictability in the application and every module being callable is sure to lead to a disaster.

```JavaScript
const Student = () => {
    const name = "Ming";
    const sayMyName = function(){ // `sayMyName` as an inner function has the right to access the variable in the parent function scope `Student`
        console.log(name);
    }
    console.dir(sayMyName); // ... `[[Scopes]]: Scopes[2] 0: Closure (student) {name: "Ming"} 1: Global` ...
    return sayMyName; // `return` allows the closure to be accessed from the outside, it has the same effect as attaching to the `window` object
}
const stu = Student(); 
stu(); // `Ming`

```

There are numerous scenarios in practical development where closures are utilized, such as the frequently used callback function. A callback function is a typical example of a closure, as it can access variables in the parent function's scope without needing to pass the variables as parameters to the callback function, thereby reducing parameter passing and enhancing code readability. In the following example, we can see that the `local` variable is a local one, and the lexical scope used by `setTimeout` is the global scope. In theory, the local variable `local` cannot be accessed, but using closure allows us to create a function that can access the internal local variable. Thus, the value of this variable can be printed normally. Although passing parameters directly, similar to the second `setTimeout`, is feasible, if a lot of logic is encapsulated here, the parameter passing would become more complicated. Depending on the actual situation, using closure may be more appropriate.

```js
const cb = () => {
  const local = 1;
  return () => {
    console.log(local);
  };
}

setTimeout(cb(), 1000); // 1
setTimeout(console.log, 2000, 2); // 2
```

Let's consider another example: when working with `Node`, we may encounter a scenario where calling third-party service interfaces is restricted by a frequency limit, such as making a maximum of `3` requests within `1s`. In such a case, there are typically two solutions. One is to control the frequency of requests directly when initiating the request, where the restricted requests need to be queued. The other solution is not to limit the frequency of initiating requests, but to use a retry mechanism. When the request result is limited by frequency, a delay is set before making the request again. Exponential backoff algorithms can be used to control the retry time. In practice, Ethernet uses this approach in congested situations, where devices calculate the wait time based on the exponential backoff algorithm, gradually increasing the wait time to reduce the probability of another collision.

Here we need to focus on how to retry in the second scenario. When making a request, we usually carry a lot of information, such as `url`, `token`, `body`, etc., for querying. If we need to retry, we definitely need to store these data somewhere for the next request. So, where should we store these variables? Of course, we can construct a global object in `global/window` to store them, but as previously mentioned, global variable pollution can lead to unpredictability in the application. Therefore, here we prefer to use closures for storage. In the example below, we use a closure to store some information when a request is made. It ensures that this information remains as initially defined when retrying, so we don't need to pollute global variables. For easier business use, we can wrap the retry mechanism in `requestWithLimit` internally, resolving the promise only after the internal request is completed.

```js
const requestFactory = (url, token) => {
  return function request(){ // Assume this function makes the request and returns the result
    return { url, token };
  }
}

const req1 = requestFactory("url1", "token1");
console.log(req1()); // Making request `{url: 'url1', token: 'token1'}`
console.log(req1()); // Retry request `{url: 'url1', token: 'token1'}`
const req2 = requestFactory("url2", "token2");
console.log(req2()); // Making request `{url: 'url2', token: 'token2'}`
console.log(req2()); // Retry request `{url: 'url2', token: 'token2'}`
```

`Js` has static scope, but the `this` object is an exception. The `this` binding issue is similar to dynamic scope. It doesn't care about how functions and scopes are declared or where they are declared, it only cares about where they are called from. The `this` binding is not determined when the function is defined, but only when the function is executed. In actuality, `this` ultimately refers to the calling object. The design of `this` is mainly to be able to obtain the current running environment `context` inside the function, because in `Js`'s memory design, `Function` is independent of and not directly related to `Object`, so it needs to be bound to a running environment.

As mentioned earlier, lexical scope is determined at the time of definition, so lexical scope can also be called static scope. Let's take a look at the example below. Doesn't it look like how we define components using `React Hooks`? After running this example, we can see that even though the function execution looks completely the same, the value obtained when printed is from the previous scope. Now we need to focus on the `fn` function. When we say "determined at the time of definition," it specifically refers to when this function is declared and defined, or rather when the lexical scope is determined when the function address is generated. From this example, it seems that there's nothing wrong, it should be this way originally. So why bring up this example? In fact, the point here is that if we accidentally retain the address of the previous `fn` function when writing the code, although we hope to get the `index` to be `5`, the actual `index` obtained is `1`, which is what we call a closure trap. We can also use this example to understand the visual model of `React` when discussing `React`.

```js
const collect = [];

const View = (props) => {
  const index = props.index;

  const fn = () => {
    console.log(index);
  }

  collect.push(fn);

  return index;
}

for(let i=0; i<5; ++i){
  View({index: i + 1});
}

collect.forEach(fn => fn()); // 1 2 3 4 5
```

## Closure Trap
Talking about this trap, it reminds me of a saying: "Fool me once, shame on you; fool me twice, shame on me." When developing, it can be said that we easily fall into traps unwittingly. So, is this trap completely caused by closures? Definitely not, it's just a language feature of `Js`. Is this trap entirely caused by `React`? Of course not. So next, let's take a look at why combining closures with `React` results in this trap.

First, let's consider the mechanism for rendering views in `React`. We can think about how `React` doesn't have templates, unlike the `template` part in `Vue`. This means that it's quite challenging to obtain the view we want to render, let alone performing analysis. So, how can we retrieve the view and then update the `DOM` structure in `Hooks`? Obviously, we just need to execute this `Hooks` once. No matter how many branches or conditions you define, I just need to execute it once to obtain the returned value and get the view. It's also because `React`'s view rendering is very flexible, thus we have to do it this way. `Vue` is not as flexible, but because of the existence of templates, it can make more optimizations. In fact, this is still a matter of trade-offs. However, that's not the main point of our discussion. Since we now understand the rendering mechanism of `React`, and we have given an example of a function being executed multiple times, let's give an example here of a component being executed multiple times:

```js
// https://codesandbox.io/s/react-closure-trap-jl9jos?file=/src/multi-count.tsx
import React, { useState } from "react";

const collect: (() => number)[] = [];

export const MultiCount: React.FC = () => {
  const [count, setCount] = useState(0);

  const click = () => {
    setCount(count + 1);
  };

  collect.push(() => count);

  const logCollect = () => {
    collect.forEach((fn) => console.log(fn()));
  };

  return (
    <div>
      <div>{count}</div>
      <button onClick={click}>count++</button>
      <button onClick={logCollect}>log {">>"} collect</button>
    </div>
  );
};
```

First, click the `count++` button three times. At this point, the content on our view is `3`. However, when we click the `log >> collect` button, we find that the content printed in the console is `0 1 2 3`. This is actually the same problem as the previous example, caused by the multiple executions of the closure `+` function. This is because in reality `Hooks` is just a function, and `React` gives it a special meaning through the built-in `use`, which allows it to access `Fiber` and bind data to nodes. So, since it is a function and will be re-executed when `setState` is called, the address of the `add` function before clicking the button and after clicking the button is different, because this function is actually redefined, only with the same name. Consequently, its generated static scope is different, potentially causing what's known as a closure trap.

Actually, most of the issues related to closure traps are due to delayed dependency updates, such as inappropriate definitions of dependencies in `useEffect` and `useCallback`, resulting in the function maintaining the scope defined during the previous component refresh, causing problems. For example, in the following example, the event dependency bound by our `useEffect` is `count`, but when we click `count++`, the function that `useEffect` should execute is not updated. Therefore, its internal function still retains the scope of the previous time, leading to issues.

```js
// https://codesandbox.io/s/react-closure-trap-jl9jos?file=/src/bind-event.tsx
import { useEffect, useRef, useState } from "react";

export const BindEventCount: React.FC = () => {
  const ref1 = useRef<HTMLButtonElement>(null);
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

  return (
    <div>
      {count}
      <div>
        <button onClick={add}>count++</button>
        <button ref={ref1}>log count 1</button>
      </div>
    </div>
  );
};
```

When we click the `count++` button multiple times and then click the `log count 1` button, we find that the console still outputs `0`. This is because our `useEffect` keeps the old function scope, and the `count` within that function scope is still `0`, so the printed value is obviously `0`. Similarly, `useCallback` may encounter similar issues. A simple solution to this problem is to include the `count` variable in the dependency array. When `count` changes, the `useEffect` will be re-executed, thus updating the function scope. However, this approach may not solve all problems. Excessive dependency on side effects may lead to a very lengthy function dependency, which could make the entire project increasingly difficult to maintain. For a discussion on event binding, you can refer to the article "Hooks and Event Binding."

So, is there a good way to solve this problem? We need our old friend `useRef`. `useRef` is a versatile tool for addressing closure issues and can store an immutable reference value. Imagine if we are only having problems because we are reading content from the old scope. If we could have an object that allows us to maintain a reference to the same object regardless of how many times the scope is updated, then simply retrieving this value after updates would solve the problem. In `React`, we can achieve this using `useRef` by maintaining the reference to an object to solve the aforementioned problem.

```js
// https://codesandbox.io/s/react-closure-trap-jl9jos?file=/src/use-ref.tsx
import { useEffect, useRef, useState } from "react";

export const RefCount: React.FC = () => {
  const ref1 = useRef<HTMLButtonElement>(null);
  const [count, setCount] = useState(0);
  const refCount = useRef<number>(count);

  const add = () => {
    setCount(count + 1);
  };

  refCount.current = count;
  useEffect(() => {
    const el = ref1.current;
    const handler = () => console.log(refCount.current);
    el?.addEventListener("click", handler);
    return () => {
      el?.removeEventListener("click", handler);
    };
  }, []);

  return (
    <div>
      {count}
      <div>
        <button onClick={add}>count++</button>
        <button ref={ref1}>log count 1</button>
      </div>
    </div>
  );
};
```

Similarly, when we click the `count++` button multiple times and then click the `log count 1` button, we find that the console outputs the most up-to-date `count` value rather than continuously maintaining `0`, as shown in the example above. This is achieved by maintaining the reference to the same object within `Hooks`. With `useRef`, we can encapsulate the custom `Hooks` to achieve related implementations. For example, if necessary, we can implement a `useRefState` to return both the `state` and `ref` together for specific usage. Furthermore, as shown in the `ahooks` implementation of `useMemoizedFn` below, the first `ref` ensures that we always reference the same function address, meaning the returned function always points to the same function. The second `ref` is used to save the currently passed function. Therefore, when a `re-render` occurs, we update the function each time, ensuring that we are always calling the most up-to-date function. Through these two `ref` objects, we can ensure two points: firstly, no matter how many times a `re-render` occurs, we always return the same function address; secondly, no matter how many times a `re-render` occurs, the function we are about to call is always the latest.

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
```

```javascript
const memoizedFn = useRef<PickFunction<T>>();
if (!memoizedFn.current) {
  memoizedFn.current = function (this, ...args) {
    return fnRef.current.apply(this, args);
  };
}

return memoizedFn.current as T;
}
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://juejin.cn/post/6844904193044512782
https://juejin.cn/post/7119839372593070094
http://www.ferecord.com/react-hooks-closure-traps-problem.html
```