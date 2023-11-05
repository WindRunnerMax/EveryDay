# Context与Reducer
`Context`是`React`提供的一种跨组件的通信方案，`useContext`与`useReducer`是在`React 16.8`之后提供的`Hooks API`，我们可以通过`useContext`与`useReducer`来完成全局状态管理例如`Redux`的轻量级替代方案。

## useContext
`React Context`适用于父子组件以及隔代组件通信，`React Context`提供了一个无需为每层组件手动添加`props`就能在组件树间进行数据传递的方法。一般情况下在`React`应用中数据是通过`props`属性自上而下即由父及子进行传递的，而一旦需要传递的层次过多，那么便会特别麻烦，例如主题配置`theme`、地区配置`locale`等等。`Context`提供了一种在组件之间共享此类值的方式，而不必显式地通过组件树的逐层传递`props`。例如`React-Router`就是使用这种方式传递数据，这也解释了为什么`<Router>`要在所有`<Route`>的外面。  
当然在这里我们还是要额外讨论下是不是需要使用`Context`，使用`Context`可能会带来一些性能问题，因为当`Context`数据更新时，会导致所有消费`Context`的组件以及子组件树中的所有组件都发生`re-render`。那么，如果我们需要类似于多层嵌套的结构，应该去如何处理，一种方法是我们直接在当前组件使用已经准备好的`props`渲染好组件，再直接将组件传递下去。

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
这种对组件的控制反转减少了在应用中要传递的`props`数量，这在很多场景下可以使得代码更加干净，使得根组件可以有更多的把控。但是这并不适用于每一个场景，这种将逻辑提升到组件树的更高层次来处理，会使得这些高层组件变得更复杂，并且会强行将低层组件适应这样的形式，这可能不会是你想要的。这样的话，就需要考虑使用`Context`了。  
说回`Context`，`Context`提供了类似于服务提供者与消费者模型，在通过`React.createContext`创建`Context`后，可以通过`Context.Provider`来提供数据，最后通过`Context.Consumer`来消费数据。在`React 16.8`之后，`React`提供了`useContext`来消费`Context`，`useContext`接收一个`Context`对象并返回该`Context`的当前值。  

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
`useReducer`是`useState`的替代方案，类似于`Redux`的使用方法，其接收一个形如`(state, action) => newState`的`reducer`，并返回当前的`state`以及与其配套的`dispatch`方法。

```js
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

或者我们也可以相对简单地去使用`useReducer`，例如实现一个`useForceUpdate`，当然使用`useState`实现也是可以的。

```js
function useForceUpdate() {
  const [, forceUpdateByUseReducer] = useReducer<(x: number) => number>(x => x + 1, 0);
  const [, forceUpdateByUseState] = useState<Record<string, unknown>>({});

  return { forceUpdateByUseReducer, forceUpdateByUseState: () => forceUpdateByUseState({}) };
}
```

## useContext + useReducer
对于状态管理工具而言，我们需要的最基础的就是状态获取与状态更新，并且能够在状态更新的时候更新视图，那么`useContext`与`useReducer`的组合则完全可以实现这个功能，也就是说，我们可以使用`useContext`与`useReducer`来实现一个轻量级的`redux`。

```js
// https://codesandbox.io/s/react-context-reducer-q1ujix?file=/src/store/reducer.ts
export const initialState = { count: 0 };
type State = typeof initialState;

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

```js
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

```js
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

我们直接使用`Context`与`Reducer`来完成状态管理是具有一定优势的，例如这种实现方式比较轻量，且不需要引入第三方库等。当然，也有一定的问题需要去解决，当数据变更时，所有消费`Context`的组件都会需要去渲染，当然`React`本身就是以多次的`re-render`来完成的`Virtual DOM`比较由此进行视图更新，在不出现性能问题的情况下这个优化空间并不是很明显，对于这个问题我们也有一定的优化策略：
* 可以完成或者直接使用类似于`useContextSelector`代替`useContext`来尽量避免不必要的`re-render`，这方面在`Redux`中使用还是比较多的。
* 可以使用`React.memo`或者`useMemo`的方案来避免不必要的`re-render`，通过配合`useImmerReducer`也可以在一定程度上缓解`re-render`问题。
* 对于不同上下文背景的`Context`进行拆分，用来做到组件按需选用订阅自己的`Context`。此外除了层级式按使用场景拆分`Context`，一个最佳实践是将多变的和不变的`Context`分开，让不变的`Context`在外层，多变的`Context`在内层。

此外，虽然我们可以直接使用`Context`与`Reducer`来完成基本的状态管理，我们依然也有着必须使用`redux`的理由:
* `redux`拥有`useSelector`这个`Hooks`来精确定位组件中的状态变量，来实现按需更新。
* `redux`拥有独立的`redux-devtools`工具来进行状态的调试，拥有可视化的状态跟踪、时间回溯等功能。
* `redux`拥有丰富的中间件，例如使用`redux-thunk`来进行异步操作，`redux-toolkit`官方的工具集等。

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

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


