# Hooks中的useState
`React`的数据是自顶向下单向流动的，即从父组件到子组件中，组件的数据存储在`props`和`state`中，实际上在任何应用中，数据都是必不可少的，我们需要直接的改变页面上一块的区域来使得视图的刷新，或者间接地改变其他地方的数据，在`React`中就使用`props`和`state`两个属性存储数据。`state`的主要作用是用于组件保存、控制、修改自己的可变状态，`state`在组件内部初始化，可以被组件自身修改，而外部不能访问也不能修改，可以认为`state`是一个局部的、只能被组件自身控制的数据源，而对于`React`函数组件，`useState`即是用来管理自身状态`hooks`函数。


## Hooks
对于`React Hooks`这个`Hooks`的意思，阮一峰大佬解释说，`React Hooks`的意思是，组件尽量写成纯函数，如果需要外部功能和副作用，就用钩子把外部代码钩进来，`React Hooks`就是那些钩子。我觉得这个解释非常到位了，拿`useState`来说，在写函数组件的时候是将这个函数勾过来使用，而在这个函数内部是保存着一些内部的作用域变量的，也就是常说的闭包，所以`Hooks`也可以理解为将另一个作用域变量以及函数逻辑勾过来在当前作用域使用。  
对于为什么要用`React Hooks`，总结来说还是为了组件复用，特别在更加细粒度的组件复用方面`React Hooks`表现更好。在`React`中代码复用的解决方案层出不穷，但是整体来说代码复用还是很复杂的，这其中很大一部分原因在于细粒度代码复用不应该与组件复用捆绑在一起，`HOC`、`Render Props `等基于组件组合的方案，相当于先把要复用的逻辑包装成组件，再利用组件复用机制实现逻辑复用，自然就受限于组件复用，因而出现扩展能力受限、`Ref `隔断、`Wrapper Hell`等问题，那么我们就需要有一种简单直接的代码复用方式，函数，将可复用逻辑抽离成函数应该是最直接、成本最低的代码复用方式，但对于状态逻辑，仍然需要通过一些抽象模式(如`Observable`)才能实现复用，这正是`Hooks`的思路，将函数作为最小的代码复用单元，同时内置一些模式以简化状态逻辑的复用。比起上面提到的其它方案，`Hooks`让组件内逻辑复用不再与组件复用捆绑在一起，是真正在从下层去尝试解决(组件间)细粒度逻辑的复用问题此外，这种声明式逻辑复用方案将组件间的显式数据流与组合思想进一步延伸到了组件内。  

对于使用`React Hooks`的动机，官方解释如下：  
`Hooks`解决了我们在过去五年来编写和维护`react`遇到的各种看似不相关的问题，不论你是否正在学习`react`，每天都在使用它，甚至是你只是在使用一些与`React`具有相似组件模型的框架，你或多或少都会注意到这些问题。  
跨组件复用含状态的逻辑`stateful logic`十分困难:   
`React`没有提供一种将复用行为绑定`attach`到组件的方法，比如将其连接到`store`，类似`redux`这类状态管理库的`connect`方法，如果您已经使用`React`一段时间，您可能熟悉通过`render props`和`higher-order`高阶组件等模式，来试图解决这些问题，但是这些模式要求您在使用它们时重构组件，这可能很麻烦并且使代码难以为继，使用`Hooks`，您可以从组件中提取有状态的逻辑，以便可以独立测试并重复使用，如果你在`React DevTools`中看到一个典型的`React`应用程序，你可能会发现一个由包含` providers, consumers`消费者，`higher-order`高阶组件，`render props`和其他抽象层的组件组成的包装器地狱，虽然我们可以在`DevTools`中过滤它们，但这反应出一个更深层次的问题：`React`需要一个更好的原生方法来共享`stateful logic`。使用`Hooks`，你可以把含有`state`的逻辑从组件中提取抽象出来，以便于独立测试和复用，同时，`Hooks`允许您在不更改组件结构的情况下重用有状态的逻辑，这样就可以轻松地在许多组件之间或与社区共享`Hook`。  
复杂的组件变得难以理解:    
我们往往不得不维护一个在开始十分简单，但却慢慢演变成了一个无法管理的`stateful logic`含有`state`逻辑的混乱的和一堆含有副作用的组件，随着开发的深入它们会变得越来越大、越来越混乱，各种逻辑在组件中散落的到处都是，每个生命周期钩子中都包含了一堆互不相关的逻辑。比如，我们的组件可能会在`componentDidMount`和`componentDidUpdate`中执行一些数据拉取的工作，但是在相同的`componentDidMount`方法可能还包含一些无关逻辑，比如设置事件监听(之后需要在`componentWillUnmount`中清除)，一起更改的相互关联的代码被拆分，但完全不相关的代码最终组合在一个方法中，这使得引入错误和不一致变得太容易了，最终的结果是强相关的代码被分离，反而是不相关的代码被组合在了一起，这显然会轻易的导致`bug`和异常，在许多情况下，我们也不太可能将这些组件分解成更小的组件，因为`stateful logic`到处都是，测试他们也很困难，这也是为什么很多人喜欢将`React`和状态管理的库组合使用的原因之一，但是这通常会引入太多的抽象，要求您在不同的文件之间跳转，并使得重用组件变得更加困难，为此，`Hooks`允许您根据相关的部分(例如设置订阅或获取数据)将一个组件拆分为更小的函数，而不是基于生命周期方法强制拆分，您还可以选择使用`reducer`管理组件的本地状态，以使其更具可预测性。  
难以理解的`class`:   
除了代码复用和代码管理会遇到困难外，我们还发现`class`是学习`React`的一大屏障，你必须去理解`JavaScript`中`this`的工作方式，这与其他语言存在巨大差异，还不能忘记绑定事件处理器，没有稳定的语法提案，这些代码非常冗余，大家可以很好地理解`props`、` state`和自顶向下的数据流，但对`class`却一筹莫展，即便在有经验的`React`开发者之间，对于函数组件与`class`组件的差异也存在分歧，甚至还要区分两种组件的使用场景，另外，`React`已经发布五年了，我们希望它能在下一个五年也与时俱进，就像`Svelte`、`Angular`、`Glimmer`等其它的库展示的那样，组件预编译会带来巨大的潜力，尤其是在它不局限于模板的时候。最近，我们一直在使用`Prepack`来试验`component folding`，也取得了初步成效，但是我们发现使用`class`组件会无意中鼓励开发者使用一些让优化措施无效的方案，`class`也给目前的工具带来了一些问题，例如，`class`不能很好的压缩，并且会使热重载出现不稳定的情况，因此，我们想提供一个使代码更易于优化的`API`，为了解决这些问题，`Hook`使你在非`class`的情况下可以使用更多的`React`特性，从概念上讲，`React`组件一直更像是函数，而`Hook`则拥抱了函数，同时也没有牺牲`React`的精神原则，`Hook`提供了问题的解决方案，无需学习复杂的函数式或响应式编程技术。

## useState
最简单的`useState`的使用如下`https://codesandbox.io/s/fancy-dust-kbd1i?file=/src/App.tsx`。

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
当页面在首次渲染时会`render`渲染`<App />`函数组件，其实际上是调用`App()`方法，得到虚拟`DOM`元素，并将其渲染到浏览器页面上，当用户点击`button`按钮时会调用`addCount`方法，然后再进行一次`render`渲染`<App />`函数组件，其实际上还是调用了`App()`方法并传递了`props`参数，得到一个新的虚拟`DOM`元素，然后`React`会执行`DOM diff`算法，将改变的部分更新到浏览器的页面上。也就是说，实际上每次`setCount`都会重新执行这个`App()`函数，这个可以通过`console.log("refresh")`那一行看到效果，每次点击按钮控制台都会打印`refresh`。  
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

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://juejin.cn/post/6963559556366467102
https://juejin.cn/post/6944908787375734791
https://juejin.cn/post/6844903990958784526
https://juejin.cn/post/6865473218414247944
https://juejin.cn/post/6844903999083118606
https://github.com/brickspert/blog/issues/26
https://react.docschina.org/docs/hooks-state.html
https://jelly.jd.com/article/61aed4a97f05d46ce6b791f4
https://blog.csdn.net/Marker__/article/details/105593118
https://www.ruanyifeng.com/blog/2019/09/react-hooks.html
https://react.docschina.org/docs/hooks-faq.html#how-does-react-associate-hook-calls-with-components
```
