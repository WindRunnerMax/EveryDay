# React生命周期
`React`的生命周期从广义上分为挂载、渲染、卸载三个阶段，在`React`的整个生命周期中提供很多钩子函数在生命周期的不同时刻调用。

## 概述
此处描述的是使用`class`类组件提供的生命周期函数，每个组件都包含自己的生命周期方法，通过重写这些方法，可以在运行过程中特定的阶段执行这些方法，常用的生命周期有`constructor()`、`render()`、`componentDidMount()`、`componentDidUpdate()`、`componentWillUnmount()`。

### 挂载过程
当组件实例被创建并插入`DOM`中时，其生命周期调用顺序如下：

* `constructor()`
* `static getDerivedStateFromProps()`
* `render()`
* `componentDidMount()`

在这个阶段的`componentWillMount()`生命周期即将过时，在新代码中应该避免使用。

### 更新过程
当组件的`props`或`state`发生变化时会触发更新，组件更新的生命周期调用顺序如下：

* `static getDerivedStateFromProps()`
* `shouldComponentUpdate()`
* `render()`
* `getSnapshotBeforeUpdate()`
* `componentDidUpdate()`

在这个阶段的`componentWillUpdate()`、`componentWillReceiveProps()`生命周期即将过时，在新代码中应该避免使用。

### 卸载过程
当组件从`DOM`中移除时，组件更新的生命周期调用顺序如下：

* `componentWillUnmount()`

### 错误处理
当渲染过程，生命周期，或子组件的构造函数中抛出错误时，会调用如下方法：

* `static getDerivedStateFromError()`
* `componentDidCatch()`

## 生命周期

### constructor()
在`React`组件挂载之前，会调用它的构造函数，如果不初始化`state`或不进行方法绑定，则不需要为`React`组件实现构造函数。在为`React.Component`子类实现构造函数时，应在其他语句之前前调用`super(props)`，否则`this.props`在构造函数中可能会出现未定义的错误。
通常在`React`中构造函数仅用于以下两种情况：
* 通过给`this.state`赋值对象来初始化内部`state`。
* 为事件处理函数绑定实例。

```javascript
constructor(props) {
    super(props);
}
```

### static getDerivedStateFromProps()
`getDerivedStateFromProps`静态方法会在调用`render`方法之前调用，并且在初始挂载及后续更新时都会被调用，它应返回一个对象来更新`state`，如果返回`null`则不更新任何内容。此方法无权访问组件实例，如果确实需要，可以通过提取组件`props`的纯函数及`class`之外的状态，在`getDerivedStateFromProps()`和其他`class`方法之间重用代码。此外，不管原因是什么，都会在每次渲染前触发此方法。

```
static getDerivedStateFromProps(props, state) {}
```

### render()
`render()`方法是`class`组件中唯一必须实现的方法，`render()`函数应该为纯函数，这意味着在不修改组件`state`的情况下，每次调用时都返回相同的结果，并且它不会直接与浏览器交互。如需与浏览器进行交互，请在`componentDidMount()`或其他生命周期方法中执行操作，保持`render()`为纯函数。当`render`被调用时，它会检查`this.props`和`this.state`的变化并返回以下类型之一：
* `React`元素，通常通过`JSX`创建，例如`<div />`会被`React`渲染为`DOM`节点，`<MyComponent />`会被`React`渲染为自定义组件，无论是`<div />`还是`<MyComponent />`均为`React`元素。
* 数组或`fragments`，使得`render`方法可以返回多个元素。
* `Portals`，可以渲染子节点到不同的`DOM`子树中。
* 字符串或数值类型，它们在`DOM`中会被渲染为文本节点。
* 布尔类型或`null`，什么都不渲染，主要用于支持返回`test && <Child />`的模式，其中`test`为布尔类型。


```javascript
render() {}
```

### componentDidMount()
`componentDidMount()`会在组件挂载后(即插入`DOM`树后)立即调用，依赖于`DOM`节点的初始化应该放在这里，如需通过网络请求获取数据，此处是实例化请求的好地方。这个方法是比较适合添加订阅的地方，如果添加了订阅，请不要忘记在`componentWillUnmount()`里取消订阅。  
你可以在`componentDidMount()`里直接调用`setState()`，它将触发额外渲染，但此渲染会发生在浏览器更新屏幕之前，如此保证了即使在`render()`两次调用的情况下，用户也不会看到中间状态，请谨慎使用该模式，因为它会导致性能问题。通常应该在`constructor()`中初始化`state`，如果你的渲染依赖于`DOM`节点的大小或位置，比如实现`modals`和`tooltips`等情况下，你可以使用此方式处理。


```javascript
componentDidMount() {}
```

### shouldComponentUpdate()
当`props`或`state`发生变化时，`shouldComponentUpdate()`会在渲染执行之前被调用，返回值默认为`true`，首次渲染或使用`forceUpdate()`时不会调用该方法。根据`shouldComponentUpdate()`的返回值，判断`React`组件的输出是否受当前`state`或`props`更改的影响。默认行为是`state`每次发生变化组件都会重新渲染，大部分情况下，你应该遵循默认行为。  
此方法仅作为性能优化的方式而存在，不要企图依靠此方法来阻止渲染，因为这可能会产生`bug`，你应该考虑使用内置的`PureComponent`组件，而不是手动编写`shouldComponentUpdate()`，`PureComponent`会对`props`和`state`进行浅层比较，并减少了跳过必要更新的可能性。  
如果你一定要手动编写此函数，可以将`this.props`与`nextProps`以及`this.state`与`nextState`进行比较，并返回`false`以告知`React`可以跳过更新。请注意，返回`false`并不会阻止子组件在`state`更改时重新渲染。不建议在`shouldComponentUpdate()`中进行深层比较或使用`JSON.stringify()`，这样非常影响效率，且会损害性能。目前如果`shouldComponentUpdate()`返回`false`，则不会调用`UNSAFE_componentWillUpdate()`，`render()`和`componentDidUpdate()`。后续版本`React`可能会将`shouldComponentUpdate`视为提示而不是严格的指令，并且当返回`false`时仍可能导致组件重新渲染。

```javascript
shouldComponentUpdate(nextProps, nextState) {}
```

### getSnapshotBeforeUpdate()
`getSnapshotBeforeUpdate()`在最近一次渲染输出(提交到`DOM`节点)之前调用，它使得组件能在发生更改之前从`DOM`中捕获一些信息(例如滚动位置)，此生命周期的任何返回值将作为参数传递给`componentDidUpdate()`，该方法应返回`snapshot`的值或`null`。  
此用法并不常见，但它可能出现在`UI`处理中，如需要以特殊方式处理滚动位置的聊天线程等。

```javascript
getSnapshotBeforeUpdate(prevProps, prevState) {}
```

### componentDidUpdate()
`componentDidUpdate()`会在更新后会被立即调用，首次渲染不会执行此方法。当组件更新后，可以在此处对`DOM`进行操作，如果你对更新前后的`props`进行了比较，也可以选择在此处进行网络请求(例如，当`props`未发生变化时，则不会执行网络请求。如果`shouldComponentUpdate()`返回值为`false`，则不会调用`componentDidUpdate()`。  
你也可以在`componentDidUpdate()`中直接调用`setState()`，但请注意它必须被包裹在一个条件语句里，否则会导致死循环，因为他将无限次触发`componentDidUpdate()`。它还会导致额外的重新渲染，虽然用户不可见，但会影响组件性能。  
如果组件实现了`getSnapshotBeforeUpdate()`生命周期(不常用)，则它的返回值将作为`componentDidUpdate()`的第三个参数`snapshot`参数传递，否则此参数将为`undefined`。

```javascript
componentDidUpdate(prevProps, prevState, snapshot) {}
```

### componentWillUnmount()
`componentWillUnmount()`会在组件卸载及销毁之前直接调用，在此方法中执行必要的清理操作，例如清除`timer`、取消网络请求或清除在`componentDidMount()`中创建的订阅等。  
`componentWillUnmount()`中不应调用`setState()`，因为该组件将永远不会重新渲染，组件实例卸载后，将永远不会再挂载它。

```javascript
componentWillUnmount() {}
```

### static getDerivedStateFromError()
此生命周期会在后代组件抛出错误后被调用，它将抛出的错误作为参数，并返回一个值以更新`state`。`getDerivedStateFromError()`会在渲染阶段调用，因此不允许出现副作用，如遇此类情况，请改用`componentDidCatch()`。

```javascript
static getDerivedStateFromError(error) {}
```

### componentDidCatch()
此生命周期在后代组件抛出错误后被调用，`componentDidCatch()`会在提交阶段被调用，因此允许执行副作用，它应该用于记录错误之类的情况它接收两个参数：
* `error`: 抛出的错误。
* `info`: 带有`componentStack key`的对象，其中包含有关组件引发错误的栈信息。

```javascript
componentDidCatch(error, info) {}
```


## 示例
`React`组件的常用生命周期示例。

```html
<!DOCTYPE html>
<html>

<head>
  <meta charset="UTF-8" />
  <title>React生命周期</title>
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
          <button onClick={() => this.updateTips()}>更新tips</button>
          <button onClick={() => this.changeDisplayClock()}>改变显隐</button>
        </div>
      );
    }
  }

  var vm = ReactDOM.render(
    <App />,
    document.getElementById("root")
  );
</script>

</html>
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.jianshu.com/p/b331d0e4b398
https://www.cnblogs.com/soyxiaobi/p/9559117.html
https://zh-hans.reactjs.org/docs/react-component.html
https://zh-hans.reactjs.org/docs/state-and-lifecycle.html
https://www.runoob.com/react/react-component-life-cycle.html
https://projects.wojtekmaj.pl/react-lifecycle-methods-diagram/
```

