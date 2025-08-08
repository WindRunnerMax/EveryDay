# Mobx与Redux的异同
`Mobx`与`Redux`都是用来管理`JavaScript`应用的状态的解决方案，用以提供在某个地方保存状态、修改状态和更新状态，使我们的应用在状态与组件上解耦，我们可以从一个地方获得状态，在另一个地方修改，在其他地方得到他们更新后的状态。他们都遵循单一数据源的原则，这让我们更容易推断状态的值和状态的修改。当然他们并不一定要跟`React`绑定在一起，它们也可以在`AngularJs`和`VueJs`这些框架库里使用。

## 概述
`Redux`作者说过，如果你不知道是否需要`Redux`，那就是不需要。在判断是否需要使用`Mobx`与`Redux`之前，我们首先需要知道他们究竟是要解决什么问题，以及当前是否遇到了这个问题。如今前端通常是要用组件`components`来构建一个应用，而组件中通常有自己的内部状态即`state`，但是随着应用越来越膨胀，组件自己内部维护的状态在膨胀的应用中很快会变得混乱。随着应用功能的不断拓展，通常会出现一些问题: 

* 一个组件通常需要和另一个组件共享状态。
* 一个组件需要改变另一个组件的状态。
* 组件层级太深，需要共享状态时状态要层层传递。
* 子组件更新一个状态，可能有多个父组件，兄弟组件共用，实现困难。

这种情况下继续使用提取状态到父组件的方法你会发现很复杂，而且随着组件增多，嵌套层级加深，这个复杂度也越来越高。因为关联的状态多，传递复杂，很容易出现像某个组件莫名其妙的更新或者不更新的情况，异常排查也会困难重重。也就是说当应用膨胀到一定程度时，推算应用的状态将会变得越来越困难，此时整个应用就会变成一个有很多状态对象并且在组件层级上互相修改状态的混乱应用。在很多情况下，状态对象和状态的修改并没有必要绑定在一些组件上，我们可以尝试将其提升，通过组件树来得到与修改状态。   

目前通常的解决方案是引入状态管理库，比如`Mobx`或`Redux`，`Mobx`与`Redux`都是用来管理`JavaScript`应用的状态的解决方案，用以提供在某个地方保存状态、修改状态和更新状态，使我们的应用在状态与组件上解耦，我们可以从一个地方获得状态，在另一个地方修改，在其他地方得到他们更新后的状态。他们都遵循单一数据源的原则，这让我们更容易推断状态的值和状态的修改。当然他们并不一定要跟`React`绑定在一起，它们也可以在`AngularJs`和`VueJs`这些框架库里使用。  

像`Redux`和`Mobx`这类状态管理库一般都有附带的工具，例如在`React`中使用的有`react-redux`和`mobx-react`，他们使你的组件能够获得状态，一般情况下，这些组件被叫做容器组件`container components`，或者说的更加确切的话，就是连接组件`connected components`。通常只要将组件作为连接组件，就可以在组件层级的任何地方得到和更改状态。  

对于`Mobx`与`Redux`的异同这个问题，是我最近在找实习的时候遇到的，分别为`react mobx`与`react redux`作简单的示例，文中的示例代码都在`https://codesandbox.io/s/react-ts-template-forked-88t6in`中。

### Mobx
`MobX`是一个经过战火洗礼的库，他通过透明的函数响应式编程`transparently applying functional reactive programming - TFRP`使得状态管理变得简单和可扩展。`MobX`背后的哲学很简单: 任何源自应用状态的东西都应该自动地获得，其中包括`UI`、数据序列化等等，核心重点就是: `MobX`通过响应式编程实现简单高效，可扩展的状态管理。

```js
// src/mobx-store/store.ts
import { observable, action, makeAutoObservable } from "mobx";

class Store {
  constructor() {
    makeAutoObservable(this);
  }

  @observable
  state = {
    count: 1
  };

  @action
  setCount = (value: number) => {
    this.state.count = value;
  };

  @action
  setCountIncrement = () => {
    this.state.count++;
  };
}

export default new Store();
```

```js
// src/counter-mobx.tsx
import React from "react";
import { observer } from "mobx-react";
import store from "./mobx-store/store";

const CountMobx: React.FC = () => {
  return (
    <div>
      <div>{store.state.count}</div>
      <button onClick={() => store.setCount(1)}>Set Count value 1</button>
      <button onClick={store.setCountIncrement}>Set Count Increment</button>
    </div>
  );
};

export default observer(CountMobx);
```

### Redux
`Redux`用一个单独的常量状态树或者叫作对象保存这一整个应用的状态，这个对象不能直接被改变，当一些数据变化了，一个新的对象就会被创建，严格的单向数据流是`Redux`架构的设计核心。

```js
// src/redux-store/store.ts
import { createStore } from "redux";

const defaultState: State = {
  count: 1
};

export const actions = {
  SET_COUNT: "SET_COUNT" as const,
  SET_COUNT_INCREMENT: "SET_COUNT_INCREMENT" as const
};

const reducer = (state: State = defaultState, action: Actions): State => {
  const { type } = action;
  switch (type) {
    case actions.SET_COUNT: {
      return { ...state, count: action.payload };
    }
    case actions.SET_COUNT_INCREMENT: {
      return { ...state, count: state.count + 1 };
    }
    default:
      return state;
  }
};
export const store = createStore(reducer, defaultState);

export interface State {
  count: number;
}
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

type SET_COUNT_INCREMENT = {
  type: typeof actions.SET_COUNT_INCREMENT;
  payload: void;
};
type SET_COUNT = {
  type: typeof actions.SET_COUNT;
  payload: number;
};
export type Actions = SET_COUNT_INCREMENT | SET_COUNT;
```

```
// src/counter-redux.tsx
import React from "react";
import { AppDispatch, actions, State } from "./redux-store/store";
import { useSelector, useDispatch } from "react-redux";

const CountRedux: React.FC = () => {
  const count = useSelector((state: State) => state.count);
  const dispatch = useDispatch() as AppDispatch;
  return (
    <div>
      <div>{count}</div>
      <button onClick={() => dispatch({ type: actions.SET_COUNT, payload: 1 })}>
        Set Count value 1
      </button>
      <button
        onClick={() =>
          dispatch({ type: actions.SET_COUNT_INCREMENT, payload: void 0 })
        }
      >
        Set Count Increment
      </button>
    </div>
  );
};

export default CountRedux;
```

```js
// src/App.tsx
import React from "react";
import "./styles.css";
import CountMobx from "./counter-mobx";
import CountRedux from "./counter-redux";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "./redux-store/store";

const App: React.FC = () => {
  return (
    <div>
      <div>======Mobx======</div>
      <CountMobx />
      <br />
      <div>======Redux======</div>
      <ReduxProvider store={store}>
        <CountRedux />
      </ReduxProvider>
    </div>
  );
};

export default App;
```

## 相同点
* 为了解决状态管理混乱，无法有效的同步的问题，统一管理应用状态。
* 一个状态只有一个可信的数据源，通常是以`action`的方式提供更新状态的途径。
* 都带有状态与组件的链接管理库，例如`react-redux`、`mobx-react`。

## 不同点

### 函数式和面向对象
* `Redux`更多的是遵循函数式编程`Functional Programming, FP`思想，从数据上来说`Redux`理想的是`immutable`，`immutable`对象是不可直接赋值的对象,它可以有效的避免错误赋值的问题，例如`reducer`就是一个纯函数，对于相同的输入总是输出相同的结果。    
* `Mobx`则更多从面相对象`Object Oriented Programming, OOP`与响应式编程`Reactive Programming`角度考虑问题，从数据上说`Mobx`从始至终都是一份引用，这样可以使的`Mobx`的组件可以做到精准更新，将状态包装成可观察对象，一旦状态对象变更，就能自动获得更新。

### store管理方式
* 在`Redux`应用中通常将整个应用的`state`被储存在一棵`object tree`中，并且这个`object tree`只存在于唯一一个`store`中。      
* 在`Mobx`则通常按模块将应用状态划分，在多个独立的`store`中管理。

### 储存数据形式
* `Redux`默认以`JavaScript`原生对象形式存储数据，这也就使得`Redux`需要手动追踪所有状态对象的变更。  
* 在`Mobx`使用可观察对象，通常是使用`observable`让数据的变化可以被观察，通过把属性转化成`getter/setter`来实现，当数据变更时将自动触发监听响应。

### 不可变和可变
* `Redux`状态对象通常是不可变的`Immutable`，复制代码我们不能直接操作状态对象，而总是在原来状态对象基础上返回一个新的状态对象。
* `Mobx`状态对象通常是可变的`Mutable`，可以直接使用新值更新状态对象。

### 状态调试
* `Redux`提供进行时间回溯的开发工具，同时纯函数以及更少的抽象，让调试变得更加容易。
* `Mobx`中有更多的抽象和封装，调试会相对比较困难，同时结果也相对难以预测。

## 总结
`Mobx`与`Redux`都是非常棒的两个库，使用上没有对错，只有合适不合适，只是可能需要在使用之前做好调研工作。或许有人需要减少编写的代码行数，那么就可能会提到`Redux`有太多的样板代码，而应该使用`Mobx`，可以减少`xxx`行代码。又或许有人需要更加明确的处理对象的变更，那么就可能感觉放弃`Mobx`的响应式魔法，而使用`Redux`去通过纯 `JavaScript`来推断与调试。又或许两个状态管理库并不冲突，可以同时存在，分别管理不同的模块的状态。



## 每日一题

- <https://github.com/WindRunnerMax/EveryDay>

## 参考

- <https://cn.mobx.js.org/>
- <https://www.redux.org.cn/docs/react-redux/>
- <https://juejin.cn/post/6844903977553756168>
- <https://juejin.cn/post/6924572729886638088>
- <https://segmentfault.com/a/1190000011148981>
- <https://www.cnblogs.com/tommymarc/p/15768138.html>
- <https://blog.csdn.net/leelxp/article/details/108450518>
- <https://blog.csdn.net/Ed7zgeE9X/article/details/121896197>
- <https://yangleiup.github.io/accumulate/redux%E4%B8%8Emobx%E5%8C%BA%E5%88%AB.html>
- <https://medium.com/@pie6k/better-way-to-create-type-safe-redux-actions-and-reducers-with-typescript-45386808c103>
