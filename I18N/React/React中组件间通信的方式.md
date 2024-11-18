# Ways of Communicating Between Components in React

Communicating between components in `React` includes communication between parent and child components, sibling components, components separated by generations, and non-nested components.

## Props
`Props` are used for communication between parent and child components. `Props` can efficiently facilitate communication between parent and child components in a unidirectional data flow. Unidirectional data flow means that data can only flow from the parent component to the child component through `props`, and the child component cannot modify the data passed through `props` to change the corresponding state of the parent component. All `props` create a unidirectional downward binding between parent and child `props`. Updates to the parent `props` will flow down to the child components, but the reverse is not true. This prevents accidental changes in the state of the parent component from the child component, making it difficult to understand the flow of data and increasing the difficulty of project maintenance. In fact, if a basic data type is passed to the child component and the value is modified in the child component, `React` will throw an exception. If an object of a reference type is passed to the child component, modifying it in the child component will not prompt any message. However, both of these cases involve changing the unidirectional flow of data between parent and child components, which does not adhere to a maintainable design approach.  
We often need to change the values of the parent component. For this, we can customize a logic in the parent component to handle receiving state changes, and then trigger the parent component's logical processing event when the relevant state changes in the child component. In `React`, `props` can accept any input. At this point, we pass a function through `props` in the child component to trigger and pass the value to the parent component's instance for modifying the parent component's `state`.

```jsx
<!-- Child Component -->
import React from "react";

class Child extends React.PureComponent {
    render() {
        return (
            <>
                <div>Received value from the parent component: {this.props.msg}</div>
                <button onClick={() => this.props.changeMsg("Changed Msg")}>Modify the value of the parent component</button>
            </>
        )
    }
}

export default Child;
```

```jsx
<!-- Parent Component -->
import React from "react";
import Child from "./child";

class Parent extends React.PureComponent {

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
`React Context` is suitable for communication between parent and child components as well as components separated by generations. `React Context` provides a way to pass data between components in the component tree without manually adding `props` at each layer. In a `React` application, data is passed from top to bottom, i.e., from parent to child, through the `props` attribute. However, for some types of attributes, this approach is extremely cumbersome. These attributes are required by many components in the application. `Context` provides a way to share such values between components without explicitly passing `props` through the component tree. In fact, `React-Router` uses this method to pass data, which explains why `<Router>` is outside all `<Route>`s.  
Using `Context` is for sharing data that is global for a component tree. Simply put, in the parent component, data is provided through `Provider`, and then in the child components, the data defined in `Provider` is obtained through `Consumer`. Regardless of how deep the child component is, as long as `Provider` is used, the data provided in `Provider` can be obtained, instead of being limited to obtaining data from the `props` attribute of the current parent component. As long as the data defined in the parent component is in `Provider`, child components can access it. Of course, if you just want to avoid passing `props` layer by layer and the number of layers is not large, you can consider making a shallow copy of `props`, deleting the `props` that are no longer used in the subsequent components, and then using the spread operator, i.e., `{...handledProps}`, to spread them for transmission, achieving a similar operation to the `API` of `Vue`'s `$attrs` and `$listeners`.

```javascript
import React from "react";
```

```jsx
const createNamedContext = name => {
  const context = React.createContext();
  context.Provider.displayName = `${name}.Provider`;
  context.Consumer.displayName = `${name}.Consumer`;
  return context;
}

const context = /*#__PURE__*/ createNamedContext("Share");

export default context;
```

```jsx
<!-- Child component -->
import React from "react";
import ShareContext from "./ShareContext";

class Child extends React.PureComponent{
    render() {
        return (
            <>
                <ShareContext.Consumer>
                    { /* Render based on the context value */ }
                    {
                        value => <div>Shared Value: {value}</div>
                    }
                </ShareContext.Consumer>
            </>
        )
    }
}

export default Child;
```

```jsx
<!-- Parent component -->
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
`Refs` are suitable for communication between parent and child components. They provide a way to access `DOM` nodes or `React` elements created in the `render` method. In a typical `React` data flow, `props` are the only way for a parent component to interact with a child component. To modify a child component, you need to use new `props` to re-render it. However, in some cases, it's necessary to forcefully modify a child component outside the typical data flow. The modified child component can be an instance of a `React` component or a `DOM` element. When rendering a component, it returns the component instance, while rendering a `DOM` element, it returns the specific `DOM` node. The `ref` property provided by `React` represents a reference to the actual instance of the component, which is essentially the component instance returned by `ReactDOM.render()`. Additionally, it's important to avoid using `refs` for anything that can be achieved declaratively. Usually, if it can be accomplished using `props` and `state`, it's best to avoid relying on `refs`.

```jsx
<!-- Child component -->
import React from "react";

class Child extends React.PureComponent{

    render() {
        return (
            <>
                <div>Received value from the parent component: {this.props.msg}</div>
            </>
        )
    }
}

export default Child;
```

```jsx
<!-- Parent component -->
import React from "react";
import Child from "./child";

class Parent extends React.PureComponent{

    constructor(props){
        super(props);
        this.state = { msg: "Parent Msg" };
        this.child = React.createRef();
    }
```

```javascript
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
The `EventBus` can be used for component communication in any situation. In the case of small-scale projects, you can completely use the central event bus `EventBus`. It can perfectly solve communication between parent and child components, sibling components, and components that are not directly connected. In fact, it is an observer pattern. The observer pattern establishes a dependency relationship between objects, so when one object changes, it automatically notifies other objects, and they respond accordingly. Therefore, the object that changes is called the subject, while the notified object is called the observer. A subject can correspond to multiple observers, and these observers are not connected to each other. They can be added and removed as needed, making the system more easily extendable. First, we need to implement a publish-subscribe class to be exported as a singleton module. Each required component then imports it. Of course, it can also be used as a static cross-cutting concern mixin or use the `event` library. In addition, it is essential to unsubscribe from event calls when the component is destroyed, otherwise it will cause memory leaks.

```javascript
// event-bus.js
var PubSub = function() {
    this.handlers = {};
}

PubSub.prototype = {
    constructor: PubSub,
    on: function(key, handler) { // Subscribe
        if (!(key in this.handlers)) this.handlers[key] = [];
        if (!this.handlers[key].includes(handler)) {
             this.handlers[key].push(handler);
             return true;
        }
        return false;
    },

    once: function(key, handler) { // One-time subscription
        if (!(key in this.handlers)) this.handlers[key] = [];
        if (this.handlers[key].includes(handler)) return false;
        const onceHandler = (...args) => {
            handler.apply(this, args);
            this.off(key, onceHandler);
        }
        this.handlers[key].push(onceHandler);
        return true;
    },

    off: function(key, handler) { // Unsubscribe
        const index = this.handlers[key].findIndex(item => item === handler);
        if (index < 0) return false;
        if (this.handlers[key].length === 1) delete this.handlers[key];
        else this.handlers[key].splice(index, 1);
        return true;
    },

    commit: function(key, ...args) { // Trigger
        if (!this.handlers[key]) return false;
        console.log(key, "Execute");
        this.handlers[key].forEach(handler => handler.apply(this, args));
        return true;
    },
}

export default new PubSub();
```

```
<!-- Child component -->
import React from "react";
import eventBus from "./event-bus";

class Child extends React.PureComponent{
```

```javascript
render() {
    return (
        <>
            <div>Received value from the parent component: {this.props.msg}</div>
            <button onClick={() => eventBus.commit("ChangeMsg", "Changed Msg")}>Modify the value of the parent component</button>
        </>
    )
}
}

export default Child;
```

```
<!-- Parent component -->
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
`Redux` can also be used for inter-component communication in any scenario. `Redux` introduces a single data source `Store` to store state data. All components can modify the `Store` through `Action` and can also retrieve the latest state from the `Store`. By using `redux`, you can solve the shared state management of multiple components and communication between components.

```javascript
import { createStore } from "redux";

/**
* This is a reducer, a pure function of the form (state, action) => state.
* Describes how the action transforms the state into the next state.
*
* The form of the state depends on you, it can be a basic type, array, object,
* even data structures generated by Immutable.js. The only point is
* to return a completely new object when the state changes, rather than modifying the incoming parameters.
*
* The example below uses a `switch` statement and strings for comparison, but you can write a helper class
* to determine based on different conventions (such as method mapping), as long as it suits your project.
*/
function counter(state = 0, action) {
    switch (action.type) {
        case "INCREMENT": return state + 1;
        case "DECREMENT": return state - 1;
        default: return state;
  }
}

// Create a Redux store to store the application state.
// The API is { subscribe, dispatch, getState }.
let store = createStore(counter);

// You can manually subscribe to updates, or bind events to the view layer.
store.subscribe(() => console.log(store.getState()));

// The only way to change the internal state is to dispatch an action.
// actions can be serialized, logged and stored, and even executed later in a playback manner.
store.dispatch({ type: "INCREMENT" });
// 1
store.dispatch({ type: "INCREMENT" });
// 2
store.dispatch({ type: "DECREMENT" });
// 1
```


## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://zhuanlan.zhihu.com/p/76996552
https://www.jianshu.com/p/fb915d9c99c4
https://juejin.cn/post/6844903828945387528
https://segmentfault.com/a/1190000023585646
https://github.com/andyChenAn/frontEnd/issues/46
https://blog.csdn.net/weixin_42262436/article/details/88852369
```