# React Lifecycle
The lifecycle of `React` can be broadly divided into three stages: mounting, updating, and unmounting, providing many hook functions at different stages of the lifecycle in `React`.

## Description
Here, we describe the lifecycle functions provided by using the `class` component. Each component contains its own lifecycle methods, and by overriding these methods, you can execute them at specific stages during runtime. Commonly used lifecycles include `constructor()`, `render()`, `componentDidMount()`, `componentDidUpdate()`, and `componentWillUnmount()`.

### Mounting Process
When a component instance is created and inserted into the `DOM`, the lifecycle call order is as follows:

* `constructor()`
* `static getDerivedStateFromProps()`
* `render()`
* `componentDidMount()`

The `componentWillMount()` lifecycle at this stage is deprecated and should be avoided in new code.

### Updating Process
When the component's `props` or `state` changes, an update is triggered, and the lifecycle call order for component update is as follows:

* `static getDerivedStateFromProps()`
* `shouldComponentUpdate()`
* `render()`
* `getSnapshotBeforeUpdate()`
* `componentDidUpdate()`

The `componentWillUpdate()` and `componentWillReceiveProps()` lifecycles at this stage are deprecated and should be avoided in new code.

### Unmounting Process
When the component is removed from the `DOM`, the lifecycle call order for component unmounting is as follows:

* `componentWillUnmount()`

### Error Handling
When errors are thrown during the rendering process, lifecycle, or in the constructor of a child component, the following methods are called:

* `static getDerivedStateFromError()`
* `componentDidCatch()`

## Lifecycles

### constructor()
Before a `React` component is mounted, its constructor is called. If you do not initialize `state` or bind methods, you do not need to implement a constructor for the `React` component. When implementing a constructor for a `React.Component` subclass, `super(props)` should be called before any other statements to avoid potential undefined errors with `this.props` in the constructor. 
The constructor in `React` is typically used for two purposes:
* Initializing internal `state` by assigning a value to `this.state`.
* Binding instance for event handling functions.

```javascript
constructor(props) {
    super(props);
}
```

### static getDerivedStateFromProps()
The `getDerivedStateFromProps` static method is called before the `render` method, and it is called during the initial mount and subsequent updates. It should return an object to update the `state`, and if it returns `null`, it will not update anything. This method does not have access to the component instance, but if necessary, the code can be reused between `getDerivedStateFromProps()` and other `class` methods by extracting pure functions of component `props` and state outside the `class`. Additionally, this method is triggered before every render, regardless of the reason.

```
static getDerivedStateFromProps(props, state) {}
```

### render()
The `render()` method is the only method that must be implemented in a `class` component. The `render()` function should be a pure function, meaning that it returns the same result each time it is called without modifying the component `state`, and it does not directly interact with the browser. If browser interaction is required, it should be done in `componentDidMount()` or other lifecycle methods to keep `render()` as a pure function. When `render` is called, it checks for changes in `this.props` and `this.state` and returns one of the following types:
* `React` elements, typically created with `JSX`, for example, `<div />` is rendered by `React` as a `DOM` node, `<MyComponent />` is rendered by `React` as a custom component, and both `<div />` and `<MyComponent />` are `React` elements.
* Arrays or `fragments`, allowing the `render` method to return multiple elements.
* `Portals`, to render child nodes into different `DOM` subtrees.
* Strings or number types, which are rendered as text nodes in the `DOM`.
* Boolean types or `null`, which do not render anything, mainly used to support the pattern `test && <Child />`, where `test` is a boolean type.

```javascript
render() {}
```

### componentDidMount()
`componentDidMount()` is called immediately after a component is mounted (i.e., inserted into the `DOM` tree). This is where initialization that depends on `DOM` nodes should go, such as instantiating requests to fetch data over the network. It's a good place to add subscriptions. If you add subscriptions, don't forget to unsubscribe in `componentWillUnmount()`.  
You can directly call `setState()` in `componentDidMount()`, which will trigger an additional render. However, this render occurs before the browser updates the screen, ensuring that the user won't see any intermediate states even if `render()` is called twice. Use this pattern carefully as it can lead to performance issues. Typically, `state` should be initialized in the `constructor()`. If your rendering depends on the size or position of `DOM` nodes, such as for implementing modals and tooltips, you can handle it this way.

```javascript
componentDidMount() {}
```

### shouldComponentUpdate()
When `props` or `state` change, `shouldComponentUpdate()` is called before rendering. By default, it returns `true`, and it won't be called for the initial render or when `forceUpdate()` is used. Based on the return value of `shouldComponentUpdate()`, the output of the `React` component is evaluated to determine if it's affected by the current `state` or `props`. By default, the component re-renders every time the `state` changes. In most cases, you should follow this default behavior.  
This method exists solely as a way to optimize performance. Do not rely on this method to prevent rendering, as it may lead to bugs. Consider using the built-in `PureComponent` component instead of manually writing `shouldComponentUpdate()`. `PureComponent` performs shallow comparisons of `props` and `state`, reducing the possibility of skipping necessary updates.  
If you do need to manually write this function, you can compare `this.props` with `nextProps` and `this.state` with `nextState`, and return `false` to let `React` skip the update. Note that returning `false` won't prevent child components from re-rendering when `state` changes. It is not recommended to perform deep comparisons or use `JSON.stringify()` in `shouldComponentUpdate()` as it severely impacts efficiency and can harm performance. Currently, if `shouldComponentUpdate()` returns `false`, `UNSAFE_componentWillUpdate()`, `render()`, and `componentDidUpdate()` will not be called. In the future, `React` may consider `shouldComponentUpdate()` as a hint rather than a strict directive, and returning `false` may still cause the component to re-render.

```javascript
shouldComponentUpdate(nextProps, nextState) {}
```

### getSnapshotBeforeUpdate()
`getSnapshotBeforeUpdate()` is called right before the most recent render output (committing to the `DOM` node). It allows the component to capture some information from the `DOM` before changes occur, such as scroll position. Any return value from this lifecycle will be passed as a parameter to `componentDidUpdate()`, and this method should return the value of a snapshot or `null`.  
While this usage is not common, it may be encountered in `UI` handling, such as when handling scroll positions in a chat thread in a special way.

```javascript
getSnapshotBeforeUpdate(prevProps, prevState) {}
```

### componentDidUpdate()
`componentDidUpdate()` is immediately called after an update, and it's not called during the initial render. After the component updates, you can perform `DOM` operations here. If you compare the `props` before and after the update, you can also choose to make network requests here (for example, only when the `props` have changed). If the return value of `shouldComponentUpdate()` is `false`, then `componentDidUpdate()` won't be called.  
You can also call `setState()` directly in `componentDidUpdate()`, but it must be wrapped in a conditional statement; otherwise, it will cause an infinite loop, triggering `componentDidUpdate()` endlessly. It also leads to additional re-rendering, though not visible to the user, it affects component performance.  
If the component implements the `getSnapshotBeforeUpdate()` lifecycle (which is uncommon), its return value will be passed as the third parameter `snapshot` to `componentDidUpdate()`. Otherwise, this parameter will be `undefined`.

```javascript
componentDidUpdate(prevProps, prevState, snapshot) {}
```

```html
    <head>
      <meta charset="UTF-8" />
      <title>React Lifecycle</title>
    </head>

    <body>
      <div id="root"></div>
    </body>
    <script src="https://unpkg.com/react@17/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script type="text/babel">

      class Clock extends React.Component {
        constructor(props) {
          super(props);
          this.state = { date: new Date() };
        }
        componentDidMount() {
          console.log("ComponentDidMount", this);
          console.log(this.props);
          console.log(this.state);
          console.log("");
          this.timer = setInterval(() => this.tick(), 1000);
        }
        componentWillUnmount() {
          console.log("ComponentWillUnmount", this);
          console.log(this.props);
          console.log(this.state);
          console.log("");
          clearInterval(this.timer);
        }
        tick() {
          this.setState({ date: new Date() });
        }
        render() {
          return (
            <div>
              <h1>{this.props.tips}</h1>
              <h2>Now: {this.state.date.toLocaleTimeString()}</h2>
            </div>
          );
        }
      }
```

```javascript
class App extends React.Component{
  constructor(props){
    super(props);
    this.state = { 
      showClock: true,
      tips: "Hello World!"
    }
  }
  componentDidUpdate(prevProps, prevState) {
    console.log("ComponentDidUpdate", this);
    console.log(this.props);
    console.log(this.state);
    console.log("");
  }
  updateTips() {
    this.setState((state, props) => ({
      tips: "React update"
    }));
  }
  changeDisplayClock() {
    this.setState((state, props) => ({
      showClock: !this.state.showClock
    }));
  }
  render() {
    return (
      <div>
        {this.state.showClock && <Clock tips={this.state.tips} />}
        <button onClick={() => this.updateTips()}>Update tips</button>
        <button onClick={() => this.changeDisplayClock()}>Change Display</button>
      </div>
    );
  }
}

var vm = ReactDOM.render(
  <App />,
  document.getElementById("root")
);
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.jianshu.com/p/b331d0e4b398
https://www.cnblogs.com/soyxiaobi/p/9559117.html
https://zh-hans.reactjs.org/docs/react-component.html
https://zh-hans.reactjs.org/docs/state-and-lifecycle.html
https://www.runoob.com/react/react-component-life-cycle.html
https://projects.wojtekmaj.pl/react-lifecycle-methods-diagram/
```