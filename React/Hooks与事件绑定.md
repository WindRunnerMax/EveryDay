# Hooks与事件绑定
在`React`中，我们经常需要为组件添加事件处理函数，例如处理表单提交、处理点击事件等。通常情况下，我们需要在类组件中使用`this`关键字来绑定事件处理函数的上下文，以便在函数中使用组件的实例属性和方法。`React Hooks`是`React 16.8`引入的一个新特性，其出现让`React`的函数组件也能够拥有状态和生命周期方法。`Hooks`的优势在于可以让我们在不编写类组件的情况下，复用状态逻辑和副作用代码，`Hooks`的一个常见用途是处理事件绑定。

## 概述
在`React`中使用类组件时，我们可能会被大量的`this`所困扰，例如`this.props`、`this.state`以及调用类中的函数等。此外，在定义事件处理函数时，通常需要使用`bind`方法来绑定函数的上下文，以确保在函数中可以正确地访问组件实例的属性和方法，虽然我们可以使用箭头函数来减少`bind`，但是还是使用`this`语法还是没跑了。

那么在使用`Hooks`的时候，可以避免使用类组件中的`this`关键字，因为`Hooks`是以函数的形式来组织组件逻辑的，我们通常只需要定义一个普通函数组件，并在函数组件中使用`useState`、`useEffect`等`Hooks`来管理组件状态和副作用，在处理事件绑定的时候，我们也只需要将定义的事件处理函数传入`JSX`就好了，也不需要`this`也不需要`bind`。

那么问题来了，这个问题真的这么简单吗，我们经常会听到类似于`Hooks`的心智负担很重的问题，从我们当前要讨论的事件绑定的角度上，那么心智负担就主要表现在`useEffect`和`useCallback`以及依赖数组上。其实类比来看，类组件类似于引入了`this`和`bind`的心智负担，而`Hooks`解决了类组件的心智负担，又引入了新的心智负担，但是其实换个角度来看，所谓的心智负担也只是需要接受的新知识而已。

我们需要了解`React`推出新的设计，新的组件模型，当我们掌握了之后那就不会再被称为心智负担了，而应该叫做语法，当然其实叫做负担也不是没有道理的，因为很容易在不小心的情况下出现隐患。那么接下来我们就来讨论下`Hooks`与事件绑定的相关问题，所有示例代码都在`https://codesandbox.io/s/react-ts-template-forked-z8o7sv`。

## 事件绑定
使用`Hooks`进行普通的合成事件绑定是一件很轻松的事情，在这个例子中，我们使用了普通的合成事件`onClick`来监听按钮的点击事件，并在点击时调用了`add`函数来更新`count`状态变量的值，这样每次点击按钮时，`count`就会加`1`。

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
这个例子看起来非常简单，我们就不再过多解释了，其实从另一个角度想一下，这不是很类似于原生的`DOM0`事件流模型，每个对象只能绑定一个`DOM`事件的话，就不需要像`DOM2`事件流模型一样还得保持原来的处理函数引用才能进行卸载操作，否则是卸载不了的，如果不能保持引用的地址是相同的，那就会造成无限的绑定，进而造成内存泄漏，如果是`DOM0`的话，我们只需要覆盖即可，而不需要去保持之前的函数引用。实际上我们接下来要说的一些心智负担，就与引用地址息息相关。

另外有一点我们需要明确一下，当我们点击了这个`count`按钮，`React`帮我们做了什么。其实对于当前这个`<CounterNormal />`组件而言，当我们点击了按钮，那么肯定就是需要刷新视图，`React`的策略是会重新执行这个函数，由此来获得返回的`JSX`，然后就是常说的`diff`等流程，最后才会去渲染，只不过我们目前关注的重点就是这个函数组件的重新执行。

`Hooks`实际上无非就是个函数，`React`通过内置的`use`为函数赋予了特殊的意义，使得其能够访问`Fiber`从而做到数据与节点相互绑定，那么既然是一个函数，并且在`setState`的时候还会重新执行，那么在重新执行的时候，点击按钮之前的`add`函数地址与点击按钮之后的`add`函数地址是不同的，因为这个函数实际上是被重新定义了一遍，只不过名字相同而已，从而其生成的静态作用域是不同的，那么这样便可能会造成所谓的闭包陷阱，接下来我们就来继续探讨相关的问题。

## 原生事件绑定
虽然`React`为我们提供了合成事件，但是在实际开发中因为各种各样的原因我们无法避免的会用到原生的事件绑定，例如`ReactDOM`的`Portal`传送门，其是遵循合成事件的事件流而不是`DOM`的事件流，比如将这个组件直接挂在`document.body`下，那么事件可能并不符合看起来`DOM`结构应该遵循的事件流，这可能不符合我们的预期，此时可能就需要进行原生的事件绑定了。此外，很多库可能都会有类似`addEventListener`的事件绑定，那么同样的此时也需要在合适的时机去添加和解除事件的绑定。由此，我们来看下边这个原生事件绑定的例子：

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

在这个例子中，我们分别对`ref1`与`ref2`两个`button`进行了原生事件绑定，其中`ref1`的事件绑定是在组件挂载的时候进行的，而`ref2`的事件绑定是在`count`发生变化的时候进行的，看起来代码上只有依赖数组`[]`和`[count]`的区别，但实际的效果上差别就很大了。在上边在线的`CodeSandbox`中我们首先点击三次`count++`这个按钮，然后分别点击`log count 1`按钮和`log count 2`按钮，那么输出会是如下的内容：

```js
0 // log count 1
3 // log count 2
```

此时我们可以看出，页面上的`count`值明明是`3`，但是我们点击`log count 1`按钮的时候，输出的值却是`0`，只有点击`log count 2`按钮的时候，输出的值才是`3`，那么点击`log count 1`的输出肯定是不符合我们的预期的。那么为什么会出现这个情况呢，其实这就是所谓的`React Hooks`闭包陷阱了，其实我们上边也说了为什么会发生这个问题，我们再重新看一下，`Hooks`实际上无非就是个函数，`React`通过内置的`use`为函数赋予了特殊的意义，使得其能够访问`Fiber`从而做到数据与节点相互绑定。

那么既然是一个函数，并且在`setState`的时候还会重新执行，那么在重新执行的时候，点击按钮之前的`add`函数地址与点击按钮之后的`add`函数地址是不同的，因为这个函数实际上是被重新定义了一遍，只不过名字相同而已，从而其生成的静态作用域是不同的，那么在新的函数执行时，假设我们不去更新新的函数，也就是不更新函数作用域的话，那么就会保持上次的`count`引用，就会导致打印了第一次绑定的数据。  

那么同样的，`useEffect`也是一个函数，我们那么我们定义的事件绑定那个函数也其实就是`useEffect`的参数而已，在`state`发生改变的时候，这个函数虽然也被重新定义，但是由于我们的第二个参数即依赖数组的关系，其数组内的值在两次`render`之后是相同的，所以`useEffect`就不会去触发这个副作用的执行。

那么实际上在`log count 1`中，因为依赖数组是空的`[]`，两次`render`或者说两次执行依次比较数组内的值没有发生变化，那么便不会触发副作用函数的执行；那么在`log count 2`中，因为依赖的数组是`[count]`，在两次`render`之后依次比较其值发现是发生了变化的，那么就会执行上次副作用函数的返回值，在这里就是清理副作用的函数`removeEventListener`，然后再执行传进来的新的副作用函数`addEventListener`。另外实际上也就是因为`React`需要返回一个清理副作用的函数，所以第一个函数不能直接用`async`装饰，否则执行副作用之后返回的就是一个`Promise`对象而不是直接可执行的副作用清理函数了。

## useCallback
在上边的场景中，我们通过为`useEffect`添加依赖数组的方式似乎解决了这个问题，但是设想一个场景，如果一个函数需要被多个地方引入，也就是说类似于我们上一个示例中的`handler`函数，如果我们需要在多个位置引用这个函数，那么我们就不能像上一个例子一样直接定义在`useEffect`的第一个参数中。那么如果定义在外部，这个函数每次`re-render`就会被重新定义，那么就会导致`useEffect`的依赖数组发生变化，进而就会导致副作用函数的重新执行，显然这样也是不符合我们的预期的。

此时就需要将这个函数的地址保持为唯一的，那么就需要`useCallback`这个`Hook`了，当使用`React`中的`useCallback Hook`时，其将返回一个`memoized`记忆化的回调函数，这个回调函数只有在其依赖项发生变化时才会重新创建，否则就会被缓存以便在后续的渲染中复用。通过这种方式可以帮助我们在`React`组件中优化性能，因为其可以防止不必要的重渲染，当将这个`memoized`回调函数传递给子组件时，就可以避免在每次渲染时重新创它，这样可以提高性能并减少内存的使用。由此，我们来看下边这个使用`useCallback`进行事件绑定的例子：

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

在这个例子中我们的`logCount1`没有`useCallback`包裹，每次`re-render`都会重新定义，此时`useEffect`也没有定义数组，所以在`re-render`时并没有再去执行新的事件绑定。那么对于`logCount2`而言，我们使用了`useCallback`包裹，那么每次`re-render`时，由于依赖数组是`[count]`的存在，因为`count`发生了变化`useCallback`返回的函数的地址也改变了，在这里如果有很多的状态的话，其他的状态改变了，`count`不变的话，那么这里的`logCount2`便不会改变。

当然在这里我们只有`count`这一个状态，所以在`re-render`时，`useEffect`的依赖数组发生了变化，所以会重新执行事件绑定。在上边在线的`CodeSandbox`中我们首先点击三次`count++`这个按钮，然后分别点击`log count 1`按钮和`log count 2`按钮，那么输出会是如下的内容：

```js
0 // log count 1
3 // log count 2
```

那么实际上我们可以看出来，在这里如果的`log count 1`与原生事件绑定例子中的`log count 1`一样，都因为没有及时更新而保持了上一次`render`的静态作用域，导致了输出`0`，而由于`log count 2`及时更新了作用域，所以正确输出了`3`，实际上这个例子并不全，我们可以很明显的发现实际上应该有其他种情况的，我们同样先点击`count++`三次，然后再分情况看输出:

* `logCount`函数不用`useCallback`包装。
  * `useEffect`依赖数组为`[]`: 输出`0`。
  * `useEffect`依赖数组为`[count]`: 输出`3`。
  * `useEffect`依赖数组为`[logCount]`: 输出`3`。
* `logCount`函数使用`useCallback`包装，依赖为`[]`。
  * `useEffect`依赖数组为`[]`: 输出`0`。
  * `useEffect`依赖数组为`[count]`: 输出`0`。
  * `useEffect`依赖数组为`[logCount]`: 输出`0`。
* `logCount`函数使用`useCallback`包装，依赖为`[count]`。
  * `useEffect`依赖数组为`[]`: 输出`0`。
  * `useEffect`依赖数组为`[count]`: 输出`3`。
  * `useEffect`依赖数组为`[logCount]`: 输出`3`。

虽然看起来情况这么多，但是实际上如果接入了`react-hooks/exhaustive-deps`规则的话，发现其实际上是会建议我们使用`3.3`这个方法来处理依赖的，这也是最标准的解决方案，其他的方案要不就是存在不必要的函数重定义，要不就是存在应该重定义但是依然存在旧的函数作用域引用的情况，其实由此看来`React`的心智负担确实是有些重的，而且`useCallback`能够完全解决问题吗，实际上并没有，我们可以接着往下聊聊`useCallback`的缺陷。

## useMemoizedFn
同样的，我们继续来看一个例子，这个例子可能相对比较复杂，因为会有一个比较长的依赖传递，然后导致看起来比较麻烦。另外实际上这个例子也不能说`useCallback`是有问题的，只能说是会有相当重的心智负担。

```js
const getTextInfo = useCallback(() => { // 获取一段数据
  return [text.length, dep.length];
}, [text, dep]);

const post = useCallback(() => { // 发送数据
  const [textLen, depLen] = getTextInfo();
  postEvent({ textLen, depLen });
}, [getTextInfo, postEvent]);

useEffect(() => {
  post();
}, [dep, post]);
```
在这个例子中，我们希望达到的目标是仅当`dep`发生改变的时候，触发`post`函数，从而将数据进行发送，在这里我们完全按照了`react-hooks/exhaustive-deps`的规则去定义了函数。那么看起来似乎并没有什么问题，但是当我们实际去应用的时候，会发现当`text`这个状态发生变化的时候，同样会触发这个`post`函数的执行，这是个并不明显的问题，如果`text`这个状态改变的频率很低的话，甚至在回归的过程中都可能无法发现这个问题。此外，可以看到这个依赖的链路已经很长了，如果函数在复杂一些，那复杂性越来越高，整个状态就会变的特别难以维护。

那么如何解决这个问题呢，一个可行的办法是我们可以将函数定义在`useRef`上，那么这样的话我们就可以一直拿到最新的函数定义了，实际效果与直接定义一个函数调用无异，只不过不会受到`react-hooks/exhaustive-deps`规则的困扰了。那么实际上我们并没有减缓复杂性，只是将复杂性转移到了`useRef`上，这样的话我们就需要去维护这个`useRef`的值，这样的话就会带来一些额外的心智负担。

```js
const post = useRef(() => void 0);

post.current = () => {
  postEvent({ textLen, depLen });
}

useEffect(() => {
  post.current();
}, [dep]);
```

那么既然我们可以依靠`useRef`来解决这个问题，我们是不是可以将其封装为一个自定义的`Hooks`呢，然后因为实际上我们并没有办法阻止函数的创建，那么我们就使用两个`ref`，第一个`ref`保证永远是同一个引用，也就是说返回的函数永远指向同一个函数地址。第二个`ref`用来保存当前传入的函数，这样发生`re-render`的时候每次创建新的函数我们都将其更新，也就是说我们即将调用的永远都是最新的那个函数。

这样通过两个`ref`我们就可以保证两点，第一点是无论发生多少次`re-render`，我们返回的都是同一个函数地址，第二点是无论发生了多少次`re-render`，我们即将调用的函数都是最新的。由此，我们就来看下`ahooks`是如何实现的`useMemoizedFn`。

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

那么使用的时候就很简单了，可以看到我们使用`useMemoizedFn`时是不需要依赖数组的，并且虽然我们在`useEffect`中定义了`post`函数的依赖，但是由于我们上边保证了第一点，那么这个在这个组件被完全卸载之前，这个依赖的函数地址是不会变的。

由此我们就可以保证只可能由于`dep`发生的改变才会触发`useEffect`，而且我们保证的第二点，可以让我们在`re-render`之后拿到的都是最新的函数作用域，也就是`textLen`和`depLen`是能够保证是最新的，不会存在拿到了旧的函数作用域里边值的问题。

```js
const post = useMemoizedFn(() => {
  postEvent({ textLen, depLen });
});

useEffect(() => {
  post.current();
}, [dep, post]);
```

## 每日一题

- <https://github.com/WindRunnerMax/EveryDay>

## 参考

- <https://juejin.cn/post/7194368992025247804>
- <https://juejin.cn/post/7098137024204374030>
- <https://react.dev/reference/react/useCallback>

