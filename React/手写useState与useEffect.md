# 手写useState与useEffect
`useState`与`useEffect`是驱动`React hooks`运行的基础，`useState`用于管理状态，`useEffect`用以处理副作用，通过手写简单的`useState`与`useEffect`来理解其运行原理。

## useState
一个简单的`useState`的使用如下。

```
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
当页面在首次渲染时会`render`渲染`<App />`函数组件，其实际上是调用`App()`方法，得到虚拟`DOM`元素，并将其渲染到浏览器页面上，当用户点击`button`按钮时会调用`addCount`方法，然后再进行一次`render`渲染`<App />`函数组件，其实际上还是调用了`App()`方法，得到一个新的虚拟`DOM`元素，然后`React`会执行`DOM diff`算法，将改变的部分更新到浏览器的页面上。也就是说，实际上每次`setCount`都会重新执行这个`App()`函数，这个可以通过`console.log("refresh")`那一行看到效果，每次点击按钮控制台都会打印`refresh`。  
那么问题来了，页面首次渲染和进行`+1`操作，都会调用`App()`函数去执行`const [count, setCount] = useState(0);`这行代码，那它是怎么做到在`+ +`操作后，第二次渲染时执行同样的代码，却不对变量`n`进行初始化也就是一直为`0`，而是拿到`n`的最新值。  
考虑到上边这个问题，我们可以简单实现一个`useMyState`函数，上边在`Hooks`为什么称为`Hooks`这个问题上提到了可以勾过来一个函数作用域的问题，那么我们也完全可以实现一个`Hooks`去勾过来一个作用域，简单来说就是在`useMyState`里边保存一个变量，也就是一个闭包里边保存了这个变量，然后这个变量保存了上次的值，再次调用的时候直接取出这个之前保存的值即可，`https://codesandbox.io/s/fancy-dust-kbd1i?file=/src/use-my-state-version-1.ts`。

```
// index.tsx
import { render } from "react-dom";
import App from "./App";

// 改造一下让其导出 让我们能够强行刷新`<App />`
export const forceRefresh = () => {
  console.log("Force fresh <App />");
  const rootElement = document.getElementById("root");
  render(<App />, rootElement);
};

forceRefresh();
```

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
```

```
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

可以在`code sandbox`中看到现在已经可以实现点击按钮进行`++`操作了，而不是无论怎么点击都是`0`，但是上边的情况太过于简单，因为只有一个`state`，如果使用多个变量，那就需要调用两次`useState`，我们就需要对其进行一下改进了，不然会造成多个变量存在一个`saveState`中，这样会产生冲突覆盖的问题，改进思路有两种:`1`把做成一个对象，比如`saveState = { n:0, m:0 }`，这种方式不太符合需求，因为在使用`useState`的时候只会传递一个初始值参数，不会传递名称; `2`把`saveState`做成一个数组，比如`saveState:[0, 0]`。实际上`React`中是通过类似单链表的形式来代替数组的，通过`next`按顺序串联所有的`hook`，使用数组也是一种类似的操作，因为两者都依赖于定义`Hooks`的顺序，`https://codesandbox.io/s/fancy-dust-kbd1i?file=/src/use-my-state-version-2.ts`。

```
// index.tsx
import { render } from "react-dom";
import App from "./App";

// 改造一下让其导出 让我们能够强行刷新`<App />`
export const forceRefresh = () => {
  console.log("Force fresh <App />");
  const rootElement = document.getElementById("root");
  render(<App />, rootElement);
};

forceRefresh();
```

```
// use-my-state-version-2.ts
import { forceRefresh } from "./index";

let saveState: any[] = [];
let index: number = 0;

export function useMyState<T>(state: T): [T, (newState: T) => void] {
  const curIndex = index;
  index++;
  saveState[curIndex] = saveState[curIndex] || state;
  const rtnState: T = saveState[curIndex];
  const setState = (newState: T): void => {
    saveState[curIndex] = newState;
    index = 0; // 必须在渲染前后将`index`值重置为`0` 不然就无法借助调用顺序确定`Hooks`了
    forceRefresh();
  };
  return [rtnState, setState];
}
```

```
// App.tsx
import { useMyState } from "./use-my-state-version-2";
import "./styles.css";

export default function App() {
  const [count1, setCount1] = useMyState(0);
  const [count2, setCount2] = useMyState(0);

  console.log("refresh");
  const addCount1 = () => setCount1(count1 + 1);
  const addCount2 = () => setCount2(count2 + 1);

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

可以看到已经可以实现在多个`State`下的独立的状态更新了，那么问题又又来了，`<App />`用了`saveState`和`index`，那其他组件用什么，也就是说多个组件如果解决每个组件独立的作用域，解决办法`1`每个组件都创建一个`saveState`和`index`，但是几个组件在一个文件中又会导致`saveState`、`index`冲突。解决办法`2`放在组件对应的虚拟节点对象上，`React`采用的也是这种方案，将`saveState`和`index`变量放在组件对应的虚拟节点对象`FiberNode`上，在`React`中具体实现`saveState`叫做`memoizedState`，实际上`React`中是通过类似单链表的形式来代替数组的，通过`next`按顺序串联所有的`hook`。  
可以看出`useState`是强依赖于定义的顺序的，`useState`数组中保存的顺序非常重要在执行函数组件的时候可以通过下标的自增获取对应的`state`值，由于是通过顺序获取的，这将会强制要求你不允许更改`useState`的顺序，例如使用条件判断是否执行`useState`这样会导致按顺序获取到的值与预期的值不同，这个问题也出现在了`React.useState`自己身上，因此`React`是不允许你使用条件判断去控制函数组件中的`useState`的顺序的，这会导致获取到的值混乱，类似于下边的代码则会抛出异常。

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

这里当然只是对于`useState`的简单实现，对于`React`真正的实现可以参考`packages/react-reconciler/src/ReactFiberHooks.js`，当前的`React`版本是`16.10.2`，也可以简略看一下相关的`type`。

```ts
type Hooks = {
  memoizedState: any, // 指向当前渲染节点`Fiber` 上一次完整更新之后的最终状态值
  baseState: any, // 初始化`initialState` 已经每次`dispatch`之后`newState`
  baseUpdate: Update<any> | null, // 当前需要更新的`Update` 每次更新完之后会赋值上一个`update` 方便`react`在渲染错误的边缘数据回溯
  queue: UpdateQueue<any> | null, // 缓存的更新队列 存储多次更新行为
  next: Hook | null, // `link`到下一个`hooks` 通过`next`串联所有`hooks`
}
```

## useEffect
一个简单的`useEffect`的使用如下。

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

同样，每次`addCount1`都会重新执行这个`App()`函数，每次点击按钮控制台都会打印`refresh`，在这里还通过`count1`变动的副作用来打印了`count1 -> effect ${count1}`，而点击`addCount2`却不会处罚副作用的打印，原因明显是我们只指定了`count1`的副作用，由此可见可以通过`useEffect`来实现更细粒度的副作用处理。  
在这里我们依旧延续上边`useState`的实现思路，将之前的数据存储起来，之后当函数执行的时候我们对比这其中的数据是否发生了变动，如果发生了变动，那么我们便执行该函数，当然我们还需要完成副作用清除的功能，`https://codesandbox.io/s/react-usestate-8v0li9?file=/src/use-my-effect.ts`。 


```
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

```
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

通过上边的实现，我们也可以通过将依赖与副作用清除函数存起来的方式，来实现`useEffect`，通过对比上一次传递的依赖值与当前传递的依赖值是否相同，来决定是否执行传递过来的函数，在这里由于我们无法得知这个`React.Fc`组件函数是在什么时候完成最后一个`Effect`，我们就需要手动来赋值这个标记的`index`为`0`。当然在`React`之中同样也是将`useEffect`挂载到了`Fiber`上来实现的，并且将所需要的依赖值存储在当前的`Fiber`的`memorizedState`中，通过实现的链表以及判断初次加载来实现了通过`next`按顺序串联所有的`hooks`，这样也就能知道究竟哪个是最后一个`Hooks`了，另外`useEffect`同样也是强依赖于定义的顺序的，能够让`React`对齐多次执行组件函数时的依赖。

## 自定义Hooks
我在初学`Hooks`的时候一直有一个疑问，对于`React Hooks`的使用与普通的函数调用区别究竟在哪里，当时我还对知乎的某个问题强答了一番。 

以我学了几天`React`的理解，自定义`Hooks`跟普通函数区别在于:
* `Hooks`只应该在`React`函数组件内调用，而不应该在普通函数调用。
* `Hooks`能够调用诸如`useState`、`useEffect`、`useContext`等，普通函数则不能。

由此觉得`Hooks`就像`mixin`，是在组件之间共享有状态和副作用的方式，所以应该是应该在函数组件中用到的与组件生命周期等相关的函数才能称为`Hooks`，而不仅仅是普通的`utils`函数。  
对于第一个问题，如果将其声明为`Hooks`但是并没有起到作为Hooks的功能，那么私认为不能称为`Hooks`，为避免混淆，还是建议在调用其他`Hooks`的时候再使用`use`标识。当然，诸如自己实现一个`useState`功能这种虽然并没有调用其他的`Hooks`，但是他与函数组件的功能强相关，肯定是属于`Hooks`的。  
对于第二个问题的话，其实必须使用`use`开头并不是一个语法或者一个强制性的方案， 以`use`开头其实更像是一个约定，就像是`GET`请求约定语义不携带`Body`一样， 其主要目的还是为了约束语法，如果你自己实现一个类似`useState`简单功能的话，就会了解到为什么不能够出现类似于`if (xxx) const [a, setA] = useState(0);`这样的代码了，`React`文档中明确说明了使用`Hooks`的规则，使用`use`开头的目的就是让`React`识别出来这是个`Hooks`，从而检查这些规则约束，通常也会使用`ESlint`配合`eslint-plugin-react-hooks`检查这些规则。

后来对于这个问题有了新的理解，如果定义一个真正的自定义`Hooks`的话，那么通常都会需要使用`useState`、`useEffect`等`Hooks`，就相当于自定义`Hooks`是由官方的`Hooks`组合而成的，而通过官方的这些`Hooks`来组合的话，就可以实现将数据挂载到节点上，也就是上边的实现提到的实际`memorizedState`都是在`Fiber`中的，而自行实现的函数例如上边的`Hooks`实现，是无法做到这一点的。也就是说我们通过自定义`Hooks`是通过来组合官方`Hooks`以及自己的逻辑来实现的对于节点内的一些状态或者其他方面的逻辑封装，而使用普通函数且采用类似于`Hooks`的语法的话则只能实现在全局的状态和逻辑的封装，简单来说就是提供了接口来让我们可以在节点上做逻辑的封装。  
有一个简单的例子，例如我们要封装一个`useUpdateEffect`来避免在函数组件在第一次挂载的时候就执行`effect`，在这里我们就应该采用`useRef`或者是`useState`而不是仅仅定义一个变量来存储状态值，`https://codesandbox.io/s/flamboyant-tu-21po2l?file=/src/App.tsx`。

```
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

```
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

```
// App.tsx
import { useState, useEffect } from "react";
import { useUpdateEffect } from "./use-update-effect-ref";
// import { useUpdateEffect } from "./use-update-effect-var";
import "./styles.css";

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

当我们切换`use-update-effect-ref`与`use-update-effect-var`的`useUpdateEffect`时，我们会发现当刷新页面时使用`use-update-effect-ref`将不会有值打印，而`use-update-effect-var`则会打印`count2 -> effect 0`，而在点击`Count1++`或者`Count2++`的效果都是正常的，说明`use-update-effect-ref`是能够我们想要的`useUpdateEffect`功能，而`use-update-effect-var`却因为变量值共享的问题而无法正确实现功能，当然我们也可以通过类似于数组的方式来解决这个问题，但是再具体到各个组件之间的共享上面，我们就无法在在类似于`Hooks`语法的基础上来实现了，必须手动注册一个闭包来完成类似的功能，而且类似于`useState`在`set`时刷新本组件以及子组件的方式，就必须借助`useState`来实现了。

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

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

