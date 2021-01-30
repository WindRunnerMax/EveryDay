# React中组件间通信的方式
`React`中组件间通信包括父子组件、兄弟组件、隔代组件、非嵌套组件之间通信。

## Props
`props`适用于父子组件的通信，`props`以单向数据流的形式可以很好的完成父子组件的通信，所谓单向数据流，就是数据只能通过`props`由父组件流向子组件，而子组件并不能通过修改`props`传过来的数据修改父组件的相应状态，所有的`props`都使得其父子`props`之间形成了一个单向下行绑定，父级`props`的更新会向下流动到子组件中，但是反过来则不行，这样会防止从子组件意外改变父级组件的状态，导致难以理解数据的流向而提高了项目维护难度。实际上如果传入一个基本数据类型给子组件，在子组件中修改这个值的话`React`中会抛出异常，如果对于子组件传入一个引用类型的对象的话，在子组件中修改是不会出现任何提示的，但这两种情况都属于改变了父子组件的单向数据流，是不符合可维护的设计方式的。  
我们通常会有需要更改父组件值的需求，对此我们可以在父组件自定义一个处理接受变化状态的逻辑，然后在子组件中如若相关的状态改变时，就触发父组件的逻辑处理事件，在`React`中`props`是能够接受任意的入参，此时我们通过`props`传递一个函数在子组件触发并且传递值到父组件的实例去修改父组件的`state`。

```
<!-- 子组件 -->
import React from "react";

class Child extends React.PureComponent{
    render() {
        return (
            <>
                <div>接收父组件的值: {this.props.msg}</div>
                <button onClick={() => this.props.changeMsg("Changed Msg")}>修改父组件的值</button>
            </>
        )
    }
}

export default Child;
```

```
<!-- 父组件 -->
import React from "react";
import Child from "./child";

class Parent extends React.PureComponent{

    constructor(props){
        super(props);
        this.state = { msg: "Parent Msg" };
    }

    changeMsg = (msg) => {
        this.setState({ msg });
    }

    render() {
        return (
            <div>
                <Child msg={this.state.msg} changeMsg={this.changeMsg} />
            </div>
        )
    }
}

export default Parent;
```

## Context
`React Context`适用于父子组件以及隔代组件通信，`React Context`提供了一个无需为每层组件手动添加`props`就能在组件树间进行数据传递的方法。在`React`应用中数据是通过`props`属性自上而下即由父及子进行传递的，但这种做法对于某些类型的属性而言是极其繁琐的，这些属性是应用程序中许多组件都需要的，`Context`提供了一种在组件之间共享此类值的方式，而不必显式地通过组件树的逐层传递`props`，实际上`React-Router`就是使用这种方式传递数据，这也解释了为什么`<Router>`要在所有`<Route`>的外面。。  
使用`Context`是为了共享那些对于一个组件树而言是全局的数据，简单来说就是在父组件中通过`Provider`来提供数据，然后在子组件中通过`Consumer`来取得`Provider`定义的数据，不论子组件有多深，只要使用了`Provider`那么就可以取得在`Provider`中提供的数据，而不是局限于只能从当前父组件的`props`属性来获取数据，只要在父组件内定义的`Provider`数据，子组件都可以调用。当然如果只是想避免层层传递`props`且传递的层数不多的情况下，可以考虑将`props`进行一个浅拷贝之后将之后组件中不再使用的`props`删除后利用`Spread`操作符即`{...handledProps}`将其展开进行传递，实现类似于`Vue`的`$attrs`与`$listeners`的`API`操作。

```javascript
import React from "react";

const createNamedContext = name => {
  const context = React.createContext();
  context.Provider.displayName = `${name}.Provider`;
  context.Consumer.displayName = `${name}.Consumer`;
  return context;
}

const context = /*#__PURE__*/ createNamedContext("Share");

export default context;
```

```
<!-- 子组件 -->
import React from "react";
import ShareContext from "./ShareContext";

class Child extends React.PureComponent{
    render() {
        return (
            <>
                <ShareContext.Consumer>
                    { /* 基于 context 值进行渲染 */ }
                    {
                        value => <div>SharedValue: {value}</div>
                    }
                </ShareContext.Consumer>
            </>
        )
    }
}

export default Child;
```

```
<!-- 父组件 -->
import React from "react";
import Child from "./child";
import ShareContext from "./ShareContext";

class Parent extends React.PureComponent{

    constructor(props){
        super(props);
        this.state = { msg: "Parent Msg" };
    }

    render() {
        return (
            <div>
                <ShareContext.Provider
                    value={100}
                >
                    <Child msg={this.state.msg} />
                </ShareContext.Provider>
            </div>
        )
    }
}

export default Parent;
```

## Refs
`Refs`适用于父子组件的通信，`Refs`提供了一种方式，允许我们访问`DOM`节点或在`render`方法中创建的`React`元素，在典型的`React`数据流中，`props`是父组件与子组件交互的唯一方式，要修改一个子组件，你需要使用新的`props`来重新渲染它，但是在某些情况下，需要在典型数据流之外强制修改子组件，被修改的子组件可能是一个`React`组件的实例，也可能是一个`DOM`元素，渲染组件时返回的是组件实例，而渲染`DOM`元素时返回是具体的`DOM`节点，`React`提供的这个`ref`属性，表示为对组件真正实例的引用，其实就是`ReactDOM.render()`返回的组件实例。此外需要注意避免使用`refs`来做任何可以通过声明式实现来完成的事情，通常在可以使用`props`与`state`的情况下勿依赖`refs`。

```
<!-- 子组件 -->
import React from "react";

class Child extends React.PureComponent{

    render() {
        return (
            <>
                <div>接收父组件的值: {this.props.msg}</div>
            </>
        )
    }
}

export default Child;
```

```
<!-- 父组件 -->
import React from "react";
import Child from "./child";

class Parent extends React.PureComponent{

    constructor(props){
        super(props);
        this.state = { msg: "Parent Msg" };
        this.child = React.createRef();
    }

    componentDidMount(){
        console.log(this.child.current); // Child {props: {…}, context: {…}, ...}
    }

    render() {
        return (
            <div>
                <Child msg={this.state.msg} ref={this.child} />
            </div>
        )
    }
}

export default Parent;
```

## EventBus
`EventBus`可以适用于任何情况的组件通信，在项目规模不大的情况下，完全可以使用中央事件总线`EventBus` 的方式，`EventBus`可以比较完美地解决包括父子组件、兄弟组件、隔代组件之间通信，实际上就是一个观察者模式，观察者模式建立了一种对象与对象之间的依赖关系，一个对象发生改变时将自动通知其他对象，其他对象将相应做出反应。所以发生改变的对象称为观察目标，而被通知的对象称为观察者，一个观察目标可以对应多个观察者，而且这些观察者之间没有相互联系，可以根据需要增加和删除观察者，使得系统更易于扩展。首先我们需要实现一个订阅发布类作为单例模块导出，每个需要的组件再进行`import`，当然作为`Mixins`全局静态横切也可以，或者使用`event`库，此外务必注意在组件销毁的时候卸载订阅的事件调用，否则会造成内存泄漏。

```javascript
// event-bus.js
var PubSub = function() {
    this.handlers = {};
}

PubSub.prototype = {
    constructor: PubSub,
    on: function(key, handler) { // 订阅
        if(!(key in this.handlers)) this.handlers[key] = [];
        if(!this.handlers[key].includes(handler)) {
             this.handlers[key].push(handler);
             return true;
        }
        return false;
    },

    once: function(key, handler) { // 一次性订阅
        if(!(key in this.handlers)) this.handlers[key] = [];
        if(this.handlers[key].includes(handler)) return false;
        const onceHandler = (...args) => {
            handler.apply(this, args);
            this.off(key, onceHandler);
        }
        this.handlers[key].push(onceHandler);
        return true;
    },

    off: function(key, handler) { // 卸载
        const index = this.handlers[key].findIndex(item => item === handler);
        if (index < 0) return false;
        if (this.handlers[key].length === 1) delete this.handlers[key];
        else this.handlers[key].splice(index, 1);
        return true;
    },

    commit: function(key, ...args) { // 触发
        if (!this.handlers[key]) return false;
        console.log(key, "Execute");
        this.handlers[key].forEach(handler => handler.apply(this, args));
        return true;
    },

}

export default new PubSub();
```

```
<!-- 子组件 -->
import React from "react";
import eventBus from "./event-bus";


class Child extends React.PureComponent{

    render() {
        return (
            <>
                <div>接收父组件的值: {this.props.msg}</div>
                <button onClick={() => eventBus.commit("ChangeMsg", "Changed Msg")}>修改父组件的值</button>
            </>
        )
    }
}

export default Child;
```

```
<!-- 父组件 -->
import React from "react";
import Child from "./child";
import eventBus from "./event-bus";

class Parent extends React.PureComponent{

    constructor(props){
        super(props);
        this.state = { msg: "Parent Msg" };
        this.child = React.createRef();
    }

    changeMsg = (msg) => {
        this.setState({ msg });
    }

    componentDidMount(){
        eventBus.on("ChangeMsg", this.changeMsg);
    }

    componentWillUnmount(){
        eventBus.off("ChangeMsg", this.changeMsg);

    }

    render() {
        return (
            <div>
                <Child msg={this.state.msg} ref={this.child} />
            </div>
        )
    }
}

export default Parent;
```


## Redux
`Redux`同样可以适用于任何情况的组件通信，`Redux`中提出了单一数据源`Store`用来存储状态数据，所有的组件都可以通过`Action`修改`Store`，也可以从`Store`中获取最新状态，使用了`redux`就可以解决多个组件的共享状态管理以及组件之间的通信问题。

```javascript
import { createStore } from "redux";

/**
 * 这是一个 reducer，形式为 (state, action) => state 的纯函数。
 * 描述了 action 如何把 state 转变成下一个 state。
 *
 * state 的形式取决于你，可以是基本类型、数组、对象、
 * 甚至是 Immutable.js 生成的数据结构。惟一的要点是
 * 当 state 变化时需要返回全新的对象，而不是修改传入的参数。
 *
 * 下面例子使用 `switch` 语句和字符串来做判断，但你可以写帮助类(helper)
 * 根据不同的约定（如方法映射）来判断，只要适用你的项目即可。
 */
function counter(state = 0, action) {
  switch (action.type) {
  case "INCREMENT":
    return state + 1;
  case "DECREMENT":
    return state - 1;
  default:
    return state;
  }
}

// 创建 Redux store 来存放应用的状态。
// API 是 { subscribe, dispatch, getState }。
let store = createStore(counter);

// 可以手动订阅更新，也可以事件绑定到视图层。
store.subscribe(() => console.log(store.getState())
);

// 改变内部 state 惟一方法是 dispatch 一个 action。
// action 可以被序列化，用日记记录和储存下来，后期还可以以回放的方式执行
store.dispatch({ type: "INCREMENT" });
// 1
store.dispatch({ type: "INCREMENT" });
// 2
store.dispatch({ type: "DECREMENT" });
// 1
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://zhuanlan.zhihu.com/p/76996552
https://www.jianshu.com/p/fb915d9c99c4
https://juejin.cn/post/6844903828945387528
https://segmentfault.com/a/1190000023585646
https://github.com/andyChenAn/frontEnd/issues/46
https://blog.csdn.net/weixin_42262436/article/details/88852369
```

