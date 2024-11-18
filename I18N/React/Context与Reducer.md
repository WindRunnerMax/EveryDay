# Context and Reducer
`Context` is a cross-component communication solution provided by `React`. `useContext` and `useReducer` are part of the `Hooks API` introduced after `React 16.8`, and they can be used to manage global state as a lightweight alternative to `Redux`.

## useContext
`React Context` is suitable for communicating between parent and child components, as well as across multiple components. It provides a way to pass data between components without manually adding `props` at each level of the component tree. In a typical `React` application, data is passed from parent to child components via `props`. However, when the need for passing data becomes more complex, such as with theme and locale configurations, it becomes cumbersome. `Context` provides a way to share such values between components without explicitly passing `props` through each level of the component tree. For example, `React-Router` uses this method for data sharing, which explains why `<Router>` must be outside all `<Route>` components.

Of course, we should also discuss whether the use of `Context` is necessary. Using `Context` may introduce some performance issues because when the `Context` data updates, it causes all components consuming the `Context` and all the components in the child component tree to re-render. So, if we need to handle a structure with deep nesting, a possible approach is to render the component directly in the current component using the prepared `props` and then pass the component down directly.

```js
export const Page: React.FC<{
  user: { name: string; avatar: string };
}> = props => {
  const user = props.user;
  const Header = (
    <>
      <span>
        <img src={user.avatar}></img>
        <span>{user.name}</span>
      </span>
      <span>...</span>
    </>
  );
  const Body = <></>;
  const Footer = <></>;
  return (
    <>
      <Component header={Header} body={Body} footer={Footer}></Component>
    </>
  );
};
```
This form of control inversion for components reduces the number of `props` that need to be passed in the application, which can make the code cleaner in many scenarios and allows the root component to have more control. However, this approach is not suitable for every scenario. Moving the logic to higher levels of the component tree can make those higher-level components more complex and force the lower-level components to adapt to this form, which may not be what you want. In such cases, considering the use of `Context` becomes necessary.

Speaking of `Context`, it provides a model similar to a service provider and consumer. After creating a `Context` using `React.createContext`, data can be provided using `Context.Provider` and consumed using `Context.Consumer`. After `React 16.8`, `React` introduced `useContext` to consume `Context`. `useContext` takes a `Context` object and returns the current value of that `Context`.

```js
// https://codesandbox.io/s/react-context-reucer-q1ujix?file=/src/store/context.tsx
import React, { createContext } from "react";
export interface ContextProps {
  state: {
    count: number;
  };
}

const defaultContext: ContextProps = {
  state: {
    count: 1
  }
};

export const AppContext = createContext<ContextProps>(defaultContext);
export const AppProvider: React.FC = (props) => {
  const { children } = props;
  return (
    <AppContext.Provider value={defaultContext}>{children}</AppContext.Provider>
  );
};
```

```js
// https://codesandbox.io/s/react-context-reucer-q1ujix?file=/src/App.tsx
import React, { useContext } from "react";
import { AppContext, AppProvider } from "./store/context";

interface Props {}
```

```jsx
const Children: React.FC = () => {
  const context = useContext(AppContext);
  return <div>{context.state.count}</div>;
};

const App: React.FC<Props> = () => {
  return (
    <AppProvider>
      <Children />
    </AppProvider>
  );
};

export default App;
```

## useReducer
`useReducer` is an alternative to `useState`, similar to the way `Redux` is used. It accepts a `reducer` of the form `(state, action) => newState` and returns the current `state` as well as its associated `dispatch` method.

```jsx
const initialState = { count: 0 };
type State = typeof initialState;

const ACTION = {
  INCREMENT: "INCREMENT" as const,
  SET: "SET" as const,
};
type IncrementAction = {
  type: typeof ACTION.INCREMENT;
};
type SetAction = {
  type: typeof ACTION.SET;
  payload: number;
};
type Action = IncrementAction | SetAction;

function reducer(state: State, action: Action) {
  switch (action.type) {
    case ACTION.INCREMENT:
      return { count: state.count + 1 };
    case ACTION.SET:
      return { count: action.payload };
    default:
      throw new Error();
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <>
      Count: {state.count}
      <div>
        <button onClick={() => dispatch({ type: ACTION.INCREMENT })}>INCREMENT</button>
        <button onClick={() => dispatch({ type: ACTION.SET, payload: 10 })}>SET 10</button>
      </div>
    </>
  );
}
```

Or we can also use `useReducer` relatively simply, for example, implementing a `useForceUpdate`, of course, using `useState` is also possible.

```jsx
function useForceUpdate() {
  const [, forceUpdateByUseReducer] = useReducer<(x: number) => number>(x => x + 1, 0);
  const [, forceUpdateByUseState] = useState<Record<string, unknown>>({});

  return { forceUpdateByUseReducer, forceUpdateByUseState: () => forceUpdateByUseState({}) };
}
```

## useContext + useReducer
For state management tools, what we need most is to get and update the state, and be able to update the view when the state changes. Therefore, the combination of `useContext` and `useReducer` can completely achieve this functionality, which means we can use `useContext` and `useReducer` to implement a lightweight `redux`.

```jsx
// https://codesandbox.io/s/react-context-reducer-q1ujix?file=/src/store/reducer.ts
export const initialState = { count: 0 };
type State = typeof initialState;
```

```javascript
export const ACTION = {
  INCREMENT: "INCREMENT" as const,
  SET: "SET" as const
};
type IncrementAction = {
  type: typeof ACTION.INCREMENT;
};
type SetAction = {
  type: typeof ACTION.SET;
  payload: number;
};
export type Action = IncrementAction | SetAction;

export const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case ACTION.INCREMENT:
      return { count: state.count + 1 };
    case ACTION.SET:
      return { count: action.payload };
    default:
      throw new Error();
  }
};
```

```javascript
// https://codesandbox.io/s/react-context-reducer-q1ujix?file=/src/store/context.tsx
import React, { createContext, Dispatch, useReducer } from "react";
import { reducer, initialState, Action } from "./reducer";

export interface ContextProps {
  state: {
    count: number;
  };
  dispatch: Dispatch<Action>;
}

const defaultContext: ContextProps = {
  state: {
    count: 1
  },
  dispatch: () => void 0
};

export const AppContext = createContext<ContextProps>(defaultContext);
export const AppProvider: React.FC = (props) => {
  const { children } = props;
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};
```

```javascript
// https://codesandbox.io/s/react-context-reducer-q1ujix?file=/src/App.tsx
import React, { useContext } from "react";
import { AppContext, AppProvider } from "./store/context";
import { ACTION } from "./store/reducer";

interface Props {}

const Children: React.FC = () => {
  const { state, dispatch } = useContext(AppContext);
  return (
    <>
      Count: {state.count}
      <div>
        <button onClick={() => dispatch({ type: ACTION.INCREMENT })}>
          INCREMENT
        </button>
        <button onClick={() => dispatch({ type: ACTION.SET, payload: 10 })}>
          SET 10
        </button>
      </div>
    </>
  );
};

const App: React.FC<Props> = () => {
  return (
    <AppProvider>
      <Children />
    </AppProvider>
  );
};

export default App;
```

Using `Context` and `Reducer` directly for state management has its advantages. For example, this approach is lightweight and doesn't require the introduction of third-party libraries. However, there are certain issues that need to be addressed. When data changes, all components consuming the `Context` will need to re-render. Of course, `React` itself relies on multiple re-renders to update the `Virtual DOM`, and unless there are performance issues, this optimization space is not very obvious. We have certain optimization strategies for this issue as well:

- You can use or directly use something similar to `useContextSelector` to replace `useContext` in order to avoid unnecessary re-renders as much as possible, which is quite common in `Redux`.
- You can use the `React.memo` or `useMemo` approach to avoid unnecessary re-renders. Using `useImmerReducer` in combination can also alleviate the re-render issue to a certain extent.
- Splitting the `Context` of different contextual backgrounds to allow components to selectively subscribe to their own `Context`. In addition to splitting `Context` hierarchically based on usage scenarios, a best practice is to separate the variable and immutable `Context`, placing the immutable `Context` in the outer layer and the variable `Context` in the inner layer.

Furthermore, although we can directly use `Context` and `Reducer` to accomplish basic state management, we still have reasons to use `redux`:
- `redux` has the `useSelector` hook to precisely locate state variables within components for on-demand updates.
- `redux` has its own `redux-devtools` for debugging state, with features such as visual state tracking and time travel.
- `redux` provides a rich set of middleware, such as using `redux-thunk` for asynchronous operations and the official `redux-toolkit` toolset.

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://zhuanlan.zhihu.com/p/360242077
https://zhuanlan.zhihu.com/p/313983390
https://www.zhihu.com/question/24972880
https://www.zhihu.com/question/335901795
https://juejin.cn/post/6948333466668777502
https://juejin.cn/post/6973977847547297800
https://segmentfault.com/a/1190000042391689
https://segmentfault.com/a/1190000023747431
https://zh-hans.reactjs.org/docs/context.html#gatsby-focus-wrapper
https://stackoverflow.com/questions/67537701/react-topic-context-vs-redux
```