# Differences and Similarities between Mobx and Redux

`Mobx` and `Redux` are both solutions used to manage the state of `JavaScript` applications, providing the ability to store, modify, and update the state in a certain place, enabling decoupling between the state and components, allowing us to retrieve the state from one place, modify it in another place, and obtain the updated state in other places. They both adhere to the principle of a single data source, making it easier for us to infer the value and modification of the state. Of course, they don't necessarily have to be bound to `React`; they can also be used in framework libraries such as `AngularJs` and `VueJs`.

## Description
The author of `Redux` once said if you don't know if you need `Redux`, then you don't need it. Before determining whether to use `Mobx` or `Redux`, we first need to understand what problems they are meant to solve and whether we are currently facing these problems. Nowadays, front-end development usually involves building applications using components, which typically have their own internal state. However, as the application expands, the state maintained internally by the components will quickly become chaotic. As the application's functionality continues to expand, some common problems arise:

- One component often needs to share state with another component.
- One component needs to modify the state of another component.
- When the component hierarchy is too deep, passing state between components becomes complicated.
- When a child component updates a state, it may have multiple parent components, making it difficult to share with sibling components.

Continuing to use the method of lifting state to a parent component in such cases will be very complicated and as the number of components increases and the nesting level deepens, this complexity will only grow. Due to the plethora of associated states and the complexity of their transmission, it's easy for a component to inexplicably update or not update, leading to significant difficulty in troubleshooting. In other words, when the application expands to a certain extent, inferring the application state will become increasingly difficult, and the entire application will become a chaotic application with many state objects and mutual state modifications at the component level. In many cases, it's not necessary to bind state objects and their modification to certain components; instead, we can try to elevate them through the component tree to obtain and modify the state.

The current typical solution is to introduce a state management library, such as `Mobx` or `Redux`. Both are solutions used to manage the state of `JavaScript` applications, providing the ability to store, modify, and update the state in a certain place, enabling decoupling between the state and components, allowing us to retrieve the state from one place, modify it in another place, and obtain the updated state in other places. They both adhere to the principle of a single data source, making it easier for us to infer the value and modification of the state. Of course, they don't necessarily have to be bound to `React`; they can also be used in framework libraries such as `AngularJs` and `VueJs`. 

State management libraries such as `Redux` and `Mobx` generally have accompanying tools, for example, ones used in `React` such as `react-redux` and `mobx-react`, which allow your components to obtain state. Under normal circumstances, these components are known as container components or, more precisely, connected components. Typically, by making a component a connected component, you can obtain and modify the state anywhere in the component hierarchy.

As for the differences and similarities between `Mobx` and `Redux`, this is a question I encountered recently while looking for an internship. I created simple examples for `react mobx` and `react redux`, and the example code is available in [this link](https://codesandbox.io/s/react-ts-template-forked-88t6in).

### Mobx
`MobX` is a battle-tested library that simplifies and makes state management scalable through transparently applying functional reactive programming (TFRP). The underlying philosophy of `MobX` is simple: anything derived from the application's state should be obtained automatically; this includes UI, data serialization, and so on. The core focus is that `MobX` achieves simple, efficient, and scalable state management through reactive programming.

```
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

```
// src/counter-mobx.tsx
import React from "react";
import { observer } from "mobx-react";
import store from "./mobx-store/store";
```

```tsx
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
Redux saves the entire application's state in a single constant state tree or object, which cannot be directly altered. When some data changes, a new object is created. The strict unidirectional data flow is the core design of the Redux architecture.

```typescript
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

```tsx
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

## Commonalities
* To resolve the chaotic state management and ineffective synchronization issues, both libraries establish unified state management for applications.
* Each state has only one reliable data source, usually provided through actions for updating the state.
* They both have libraries for managing state and components, such as `react-redux` and `mobx-react`.

## Differences

### Functional and Object-Oriented
* `Redux` follows the principles of functional programming (FP) and ideally uses immutable data. Immutable objects cannot be directly assigned, which effectively avoids issues related to incorrect assignments. For example, a reducer in `Redux` is a pure function that always outputs the same result for the same input.
* `Mobx` approaches the problem more from an object-oriented programming (OOP) and reactive programming perspective. In terms of data, `Mobx` maintains a single reference throughout, allowing its components to achieve precise updates. It encapsulates states as observable objects, enabling automatic updates upon state changes.

### Store Management Approach
* In `Redux` applications, the entire application state is typically stored in a single object tree within a unique store.
* On the other hand, `Mobx` tends to partition the application state into modules and manages them in multiple independent stores.

### Data Storage Format
* `Redux` defaults to storing data in regular JavaScript objects, requiring manual tracking of all state object changes.
* `Mobx` uses observable objects, often achieved through the `observable` functionality, allowing data changes to be observed. It transforms properties into getters/setters, triggering automatic responses upon data changes.

### Immutability vs. Mutability
* `Redux` state objects are usually immutable (Immutable), meaning that we cannot directly manipulate state objects and must instead return a new state object based on the original one.
* `Mobx` state objects are typically mutable (Mutable) and can be updated directly with new values.

### State Debugging
* `Redux` provides development tools for time-travel debugging, offering easier debugging due to pure functions and fewer abstractions.
* Debugging in `Mobx` involves more abstractions and encapsulation, making it relatively challenging and yielding results that are harder to predict.

## Conclusion
Both `Mobx` and `Redux` are excellent libraries, and there is no right or wrong choice in using them. It's a matter of suitability. Some may prefer `Redux` for its ability to reduce code duplication, while others may favor `Mobx` for its responsiveness, allowing fewer lines of code. In some cases, both state management libraries may coexist and manage different modules' states separately.

## Daily Prompt

```
https://github.com/WindrunnerMax/EveryDay
```

## References
```

```
https://cn.mobx.js.org/
https://www.redux.org.cn/docs/react-redux/
https://juejin.cn/post/6844903977553756168
https://juejin.cn/post/6924572729886638088
https://segmentfault.com/a/1190000011148981
https://www.cnblogs.com/tommymarc/p/15768138.html
https://blog.csdn.net/leelxp/article/details/108450518
https://blog.csdn.net/Ed7zgeE9X/article/details/121896197
https://yangleiup.github.io/accumulate/redux%E4%B8%8Emobx%E5%8C%BA%E5%88%AB.html
https://medium.com/@pie6k/better-way-to-create-type-safe-redux-actions-and-reducers-with-typescript-45386808c103
```