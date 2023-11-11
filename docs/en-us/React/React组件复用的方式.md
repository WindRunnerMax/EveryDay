# Ways to Reuse React Components

As frontend engineering becomes increasingly important, while using `Ctrl+C` and `Ctrl+V` can meet the requirements, it becomes a massive task when it comes to making modifications. Therefore, reducing code duplication and increasing encapsulation for reusability become particularly crucial. In `React`, components are the primary units for code reuse, and the component reuse mechanism based on composition is quite elegant. However, reusing more granular logic (such as state logic and behavior logic) is not that easy. It's difficult to extract the state logic as a reusable function or component. In fact, before the emergence of `Hooks`, there was a lack of a simple and direct way to extend component behavior. `Mixin`, `HOC`, and `Render Props` are considered higher-level patterns explored within the existing (component mechanism) game rules and have not effectively addressed the problem of logic reuse between components until the emergence of `Hooks`. Now, let's introduce the four ways of component reuse: `Mixin`, `HOC`, `Render Props`, and `Hooks`.

## Mixin
Of course, `React` has long ceased to recommend the use of `Mixin` as a solution for reuse. However, it is still possible to support `Mixin` through `create-react-class`. Additionally, when declaring components using the `class` approach in `ES6`, `Mixin` is not supported.

`Mixins` allow multiple `React` components to share code, similar to `mixins` in `Python` or `traits` in `PHP`. The emergence of the `Mixin` solution stems from an object-oriented programming intuition. Back in the early days, the `React.createClass()` API was introduced (officially deprecated in `React v15.5.0` and moved to `create-react-class`) to define components, and naturally, (class) inheritance became an intuitive attempt. Under the prototype-based extension pattern in `JavaScript`, the `Mixin` solution, similar to inheritance, became a good solution. `Mixin` is mainly used to solve the reuse problem of lifecycle logic and state logic, allowing the extension of component lifecycle from the outside, especially important in patterns like `Flux`. However, in practice, many defects have emerged:
* There are implicit dependencies between components and `Mixin` (Mixin often depends on specific methods of the component, but these dependency relationships are not known when defining the component).
* Conflicts may arise between multiple `Mixin` (e.g., defining the same `state` fields).
* `Mixin` tends to add more states, reducing application predictability and significantly increasing complexity.
* Implicit dependencies lead to opaque dependency relationships, rapidly increasing maintenance and understanding costs.
* Understanding component behavior is challenging as it requires a comprehensive understanding of all dependencies on `Mixin` and their mutual influence.
* Components' own methods and `state` fields are not easily modified due to the difficulty of determining whether `Mixin` depends on them.
* `Mixin` is also challenging to maintain because the logic of `Mixin` will eventually be flattened and merged together, making it difficult to understand the input and output of a `Mixin`.

Undoubtedly, these issues are fatal. Therefore, `React v0.13.0` abandoned the static cross-cutting of `Mixin` (similar to inheritance for reuse) and shifted to `HOC` (High Order Component) for reuse, which resembles composition.

### Example
In the ancient version, a common scenario is that a component needs regular updates. It's easy to do with `setInterval()`, but it's crucial to clear the timer when it's no longer needed to save memory. `React` provides lifecycle methods to inform when a component should be created or destroyed. The following `Mixin` uses `setInterval()` and ensures the timer is cleared when the component is destroyed.

```javascript
var SetIntervalMixin = {
  componentWillMount: function() {
    this.intervals = [];
  },
  setInterval: function() {
    this.intervals.push(setInterval.apply(null, arguments));
  },
  componentWillUnmount: function() {
    this.intervals.forEach(clearInterval);
  }
};

var TickTock = React.createClass({
  mixins: [SetIntervalMixin], // Using mixin
  getInitialState: function() {
    return {seconds: 0};
  },
  componentDidMount: function() {
    this.setInterval(this.tick, 1000); // Calling the method in the mixin
  },
  tick: function() {
    this.setState({seconds: this.state.seconds + 1});
  },
  render: function() {
    return (
      <p>
        React has been running for {this.state.seconds} seconds.
      </p>
    );
  }
});

ReactDOM.render(
  <TickTock />,
  document.getElementById("example")
);
```

## HOC
After `Mixin`, `HOC` a high-order component takes on the responsibility and becomes the recommended solution for logical reuse between components. The name "high-order component" reveals its advanced nature. In reality, this concept is derived from the high-order function in `JavaScript`. A high-order function is a function that takes a function as input or output. Currying is a type of high-order function. Similarly, the `React` documentation also provides the definition of high-order components, which are functions that receive components and return new components. Specifically, `HOC` can be regarded as an implementation of the decorator pattern by `React`. A high-order component is a function that accepts a component as a parameter and returns a new component. It will return an enhanced `React` component. High-order components can make our code more reusable, logical, and abstract, and can intercept the `render` method, as well as control `props` and `state`, among other things.

In comparison to `Mixin` and `HOC`, `Mixin` is a pattern of mixing. In actual use, the role of `Mixin` is still very powerful, enabling us to share the same methods among multiple components. However, it also continuously adds new methods and properties to the components. Components not only can perceive this, but may even need to do related processing (such as name conflicts, status maintenance, etc.). Once the number of mixed modules increases, the entire component becomes difficult to maintain. `Mixin` may introduce invisible properties, such as using `Mixin` methods in rendering components, which brings invisible attributes `props` and state `state` to the component. Additionally, `Mixin` may have mutual dependencies, mutual couplings, and is not conducive to code maintenance. Furthermore, methods from different `Mixin`s may conflict with each other. Previously, the `React` official recommendation was to use `Mixin` to solve cross-cutting concerns, however, using `Mixin` may cause more trouble, so the official now recommends using `HOC`. High-order component `HOC` belongs to the functional programming concept. The component being wrapped will not be aware of the existence of the high-order component, and the component returned by the high-order component will have an enhanced effect on the original component. Based on this, `React` officially recommends using high-order components.

Although `HOC` does not have as many fatal problems, it also has some small flaws:
* Limited extensibility: `HOC` cannot completely replace `Mixin`. In some scenarios, `Mixin` can do what `HOC` cannot, such as `PureRenderMixin`, because `HOC` cannot access the `State` of the child component from the outside, and filter out unnecessary updates through `shouldComponentUpdate`. Therefore, after supporting `ES6Class`, `React` introduced `React.PureComponent` to solve this problem.
* `Ref` passing problem: `Ref`s are isolated, and the passing problem of `Ref`s becomes quite annoying under multiple layers of wrapping. The function `Ref` can relieve some of these issues (letting `HOC` know about node creation and destruction), hence the later introduction of the `React.forwardRef API`.
* Wrapper Hell: Excessive use of `HOC` leads to "Wrapper Hell" (there's no problem that can't be solved by adding another layer, and if there is, then add two layers). Multiple layers of abstraction also increase complexity and understanding cost, which is the most critical flaw, and there is no good solution under the `HOC` pattern.

### Example
Specifically, a high-order component is a function that takes a component as a parameter and returns a new component. A component transforms `props` into UI, while a high-order component transforms a component into another component. `HOC` is very common in third-party libraries in `React`, such as `Redux`'s `connect` and `Relay`'s `createFragmentContainer`.

```
// High-order component definition
const higherOrderComponent = (WrappedComponent) => {
    return class EnhancedComponent extends React.Component {
        // ...
        render() {
          return <WrappedComponent {...this.props} />;
        }
  };
}

// Regular component definition
class WrappedComponent extends React.Component{
    render(){
        //....
    }
}

// Return the enhanced component wrapped by the high-order component
const EnhancedComponent = higherOrderComponent(WrappedComponent);
```

Here, it is important to note not to attempt to modify the component prototype in any way in the `HOC`, but rather to use a composition approach by implementing functionality through wrapping the component in a container component. Typically, there are two ways to implement a high-order component:
* Props Proxy.
* Inheritance Inversion.

#### Props Proxy
For example, we can add a storage `id` attribute value to the incoming component. Through a high-order component, we can add a new `props` to this component. Of course, we can also manipulate the `props` in the `JSX` of the `WrappedComponent` component. It is important to note that we should not directly modify the incoming component, but we can manipulate it in the process of composition.

```jsx
const HOC = (WrappedComponent, store) => {
    return class EnhancedComponent extends React.Component {
        render() {
            const newProps = {
                id: store.id
            }
            return <WrappedComponent
                {...this.props}
                {...newProps}
            />;
        }
    }
}
```

We can also use a higher-order component to inject the state of a new component into the wrapped component. For instance, we can use a higher-order component to convert an uncontrolled component into a controlled component.

```jsx
class WrappedComponent extends React.Component {
    render() {
        return <input name="name" />;
    }
}

const HOC = (WrappedComponent) => {
    return class EnhancedComponent extends React.Component {
        constructor(props) {
            super(props);
            this.state = { name: "" };
        }
        render() {
            const newProps = {
                value: this.state.name,
                onChange: e => this.setState({name: e.target.value}),
            }
            return <WrappedComponent 
                {...this.props} 
                {...newProps} 
            />;
        }
    }
}
```

Alternatively, we may want to wrap it with other components to achieve layout or styling purposes.

```jsx
const HOC = (WrappedComponent) => {
    return class EnhancedComponent extends React.Component {
        render() {
            return (
                <div className="layout">
                    <WrappedComponent  {...this.props} />
                </div>
            );
        }
    }
}
```

#### Reverse Inheritance
Reverse inheritance means that the returned component inherits from the previous component. In reverse inheritance, we can perform many operations, such as modifying `state`, `props`, or even reversing the `Element Tree`. A crucial point about reverse inheritance is that it cannot guarantee the complete rendering of the child component tree, which means that once the rendered element tree contains components (function types or `Class` types), further manipulation of the child components is not possible.  
When we use reverse inheritance to implement a higher-order component, we can control rendering through render interception, meaning that we can consciously control the rendering process of `WrappedComponent` to control the rendering result. For example, we can decide whether to render the component based on certain parameters.

```jsx
const HOC = (WrappedComponent) => {
    return class EnhancedComponent extends WrappedComponent {
        render() {
            return this.props.isRender && super.render();  
        }
    }
}
```

We can even intercept the original component's lifecycle through overriding.

```jsx
const HOC = (WrappedComponent) => {
    return class EnhancedComponent extends WrappedComponent {
        componentDidMount(){
          // ...
        }
        render() {
            return super.render();  
        }
    }
}
```

As it's essentially an inheritance relationship, we can access the component's `props` and `state`, and if necessary, even modify, add, or delete `props` and `state`, provided that you control the risks brought by the modifications. In some cases, when we may need to pass some parameters to the higher-order props, we can do so by currying the parameters, combined with higher-order components to achieve closure-like operations on the component.
```

```javascript
const HOCFactoryFactory = (params) => {
    // Perform operations on params here
    return (WrappedComponent) => {
        return class EnhancedComponent extends WrappedComponent {
            render() {
                return params.isRender && this.props.isRender && super.render();
            }
        }
    }
}
```

### Note
#### Do Not Modify the Original Component
Do not attempt to modify the component prototype within the `HOC` or alter it in any other way.

```javascript
function logProps(InputComponent) {
  InputComponent.prototype.componentDidUpdate = function(prevProps) {
    console.log("Current props: ", this.props);
    console.log("Previous props: ", prevProps);
  };
  // Return the original input component, which has already been modified.
  return InputComponent;
}

// Every time logProps is called, the enhanced component will have log output.
const EnhancedComponent = logProps(InputComponent);
```
Doing this will have some adverse consequences; one being that the input component can no longer be used as it was before being enhanced by the `HOC`. More critically, if you use another `HOC` that also modifies `componentDidUpdate`, the previous `HOC` will become ineffective, and this `HOC` will also not be applicable to function components without lifecycles. Modifying the `HOC` of the input component is a poor abstraction that requires callers to know how they are implemented in order to avoid conflicts with other `HOCs`. `HOCs` should not modify the input components; instead, they should use a composition approach by implementing functionality through wrapping the component in a container component.

```javascript
function logProps(WrappedComponent) {
  return class extends React.Component {
    componentDidUpdate(prevProps) {
      console.log("Current props: ", this.props);
      console.log("Previous props: ", prevProps);
    }
    render() {
      // Wrap the input component in a container without modifying it, Nice!
      return <WrappedComponent {...this.props} />;
    }
  }
}
```

#### Filter Props
`HOCs` add features to components and should not drastically change conventions. The component returned by the `HOC` should maintain a similar interface to the original component. Most `HOCs` should include a `render` method similar to the one below.

```javascript
render() {
  // Filter out extra props and do not pass them through
  const { extraProp, ...passThroughProps } = this.props;

  // Inject props into the wrapped component.
  // Usually the value of state or instance methods.
  const injectedProp = someStateOrInstanceMethod;

  // Pass the props to the wrapped component
  return (
    <WrappedComponent
      injectedProp={injectedProp}
      {...passThroughProps}
    />
  );
}
```

#### Maximize Composability
Not all `HOCs` are the same; sometimes they only accept one parameter, which is the component being wrapped.

```javascript
const NavbarWithRouter = withRouter(Navbar);
```

`HOCs` often can accept multiple parameters, for example, in `Relay`, the `HOC` additionally accepts a configuration object to specify the component's data dependencies.

```javascript
const CommentWithRelay = Relay.createContainer(Comment, config);
```

The most common `HOC` signature is as follows. `connect` is a higher-order function that returns a higher-order component.

```javascript
// The `connect` function of React Redux
const ConnectedComment = connect(commentSelector, commentActions)(CommentList);
```

```javascript
// The 'connect' is a function that returns another function.
const enhance = connect(commentListSelector, commentListActions);
// The return value is a HOC that will return a component already connected to the Redux store.
const ConnectedComment = enhance(CommentList);
```

This form may look confusing or unnecessary, but it has a useful property. A single-parameter HOC, like the one returned by the 'connect' function, has a signature of `Component => Component`, making it easy to combine functions with the same input and output types. This property also allows 'connect' and other HOCs to act as decorators. Furthermore, many third-party libraries provide a 'compose' utility function, including 'lodash', 'Redux', and 'Ramda'.

```javascript
const EnhancedComponent = withRouter(connect(commentSelector)(WrappedComponent))

// You can write composition utility functions
// compose(f, g, h) is equivalent to (...args) => f(g(h(...args)))
const enhance = compose(
  // All of these are single-parameter HOCs
  withRouter,
  connect(commentSelector)
)
const EnhancedComponent = enhance(WrappedComponent)
```

#### Avoid using HOCs in the render method
React's diffing algorithm uses component identities to determine whether to update an existing subtree or discard it and mount a new one. If the component returned from 'render' is the same `===` as the one in the previous render, React recursively updates the subtree. If they are not the same, the previous subtree is completely unmounted. While this is generally not something that needs to be worried about, for HOCs this is crucial because it means that you should not apply an HOC to a component in its 'render' method.

```javascript
render() {
  // Creating a new EnhancedComponent every time render is called
  // EnhancedComponent1 !== EnhancedComponent2
  const EnhancedComponent = enhance(MyComponent);
  // This will cause the subtree to be unmounted and remounted on every render!
  return <EnhancedComponent />;
}
```

This is not just a performance issue; remounting a component causes it and all its subcomponents to lose their state. If the HOC is created outside the component, it is created only once, so the same component is rendered every time, which is generally the expected behavior. In very rare cases where you need to call an HOC dynamically, it can be done in the component's lifecycle methods or its constructor.

#### Always copy static methods
Sometimes it's useful to define static methods on a React component, such as Relay containers exposing a static method 'getFragment' for composing GraphQL fragments. However, when you apply an HOC to a component, the original component is wrapped with the container component, meaning the new component does not have any of the original component's static methods.

```javascript
// Define a static function
WrappedComponent.staticMethod = function() {/*...*/}
// Now use the HOC
const EnhancedComponent = enhance(WrappedComponent);

// The enhanced component does not have staticMethod
typeof EnhancedComponent.staticMethod === "undefined" // true
```

To solve this, you can copy these methods onto the container component before returning it.

```javascript
function enhance(WrappedComponent) {
  class Enhance extends React.Component {/*...*/}
  // You must know exactly which methods to copy :(
  Enhance.staticMethod = WrappedComponent.staticMethod;
  return Enhance;
}
```

To simplify this, you can use the 'hoist-non-react-statics' dependency to automatically copy all non-React static methods.

```javascript
import hoistNonReactStatic from "hoist-non-react-statics";
function enhance(WrappedComponent) {
  class Enhance extends React.Component {/*...*/}
  hoistNonReactStatic(Enhance, WrappedComponent);
  return Enhance;
}
```

In addition to exporting the component, another feasible solution is to export the static method separately.

```javascript
// Use this approach instead...
MyComponent.someFunction = someFunction;
export default MyComponent;
```

```javascript
// ...Export the function separately...
export { someFunction };

// ...and in the component where you want to use it, import it
import MyComponent, { someFunction } from "./MyComponent.js";
```

#### Refs will not be passed
While the convention for higher-order components is to pass all `props` to the wrapped component, this does not apply to `refs` because `ref` is not actually a `prop`, just like `key`, it is specifically handled by `React`. If a `ref` is added to the returned component of a HOC, the `ref` will refer to the container component rather than the wrapped component. This problem can be addressed by using the `React.forwardRef` API to explicitly forward `refs` to the inner component.

```javascript
function logProps(Component) {
  class LogProps extends React.Component {
    componentDidUpdate(prevProps) {
      console.log('old props:', prevProps);
      console.log('new props:', this.props);
    }

    render() {
      const {forwardedRef, ...rest} = this.props;

      // Define the custom prop attribute "forwardedRef" as ref
      return <Component ref={forwardedRef} {...rest} />;
    }
  }

  // Note the second parameter "ref" of the React.forwardRef callback.
  // We can pass it as a regular prop attribute to LogProps, for example "forwardedRef",
  // and then it can be mounted to the child component wrapped by LogProps.
  return React.forwardRef((props, ref) => {
    return <LogProps {...props} forwardedRef={ref} />;
  });
}
```

## Render Props
Like HOCs, Render Props have been an ancient pattern that has been around for a long time. Render Props refers to a simple technique of sharing code between React components using a function with a value as props. Components with render props receive a function that returns a React element and call it instead of implementing their own rendering logic. Render Props are a way of informing a component about what content needs to be rendered, and it is also a way of reusing component logic. Simply put, in a component that needs to be reused, a prop attribute (the property name does not have to be "render", as long as the value is a function) called `render` is used. This attribute is a function that accepts an object and returns a child component. It will pass the object in the function argument as `props` to the newly generated component, and in the context of the calling component, it only needs to decide where to render this component and how to logically render it and pass in the relevant object.

Compared to HOCs and Render Props, technically, both are based on component composition mechanisms. Render Props have the same extension capability as HOCs, which is called Render Props. This does not mean that it can only be used to reuse rendering logic, but it means that in this pattern, components are combined using `render()`. Similar to the relationship established by the `render()` method of `Wrapper` in the HOC pattern, the two are very similar in form, and both will create an additional layer of `Wrapper`. In fact, Render Props and HOCs can even be interconverted.

Similarly, Render Props also have some issues:
- The flow of data becomes more straightforward, and descendant components can clearly see the source of the data, but fundamentally, Render Props is based on closures, and using it extensively for component reuse will inevitably introduce the "callback hell" problem.
- The context of the component is lost, so there is no `this.props` property, and it cannot access `this.props.children` like HOCs.

### Example

```html
<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8" />
    <title>React</title>
</head>
```

```html
<body>
    <div id="root"></div>
</body>
<script src="https://unpkg.com/react@17/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script type="text/babel">
class MouseTracker extends React.Component {
  constructor(props) {
    super(props);
    this.state = { x: 0,  y: 0, }
  }
  handleMouseMove = (event) => {
    this.setState({
      x: event.clientX,
      y: event.clientY
    });
  }
  render() {
    return (
      <div onMouseMove={this.handleMouseMove}>
        {this.props.render(this.state)} {/* Render Props */}
      </div>
    )
  }
}

class MouseLocation extends React.Component {
  render() {
    return (
      <>
        <h1>Move the mouse here</h1>
        <p>Current mouse position: x:{this.props.mouse.x} y:{this.props.mouse.y}</p>
      </>
    )
  }
}

ReactDOM.render(
  <MouseTracker render={mouse => <MouseLocation mouse={mouse} />}></MouseTracker>, 
  document.getElementById("root")
);
</script>

</html>
```

## Hooks
The solutions for code reuse are numerous, but overall code reuse is still quite complex. One of the main reasons for this lies in the fact that fine-grained code reuse should not be tied to component reuse. Solutions based on component composition such as `HOC` and `Render Props` first wrap the reusable logic into components, then use the component reuse mechanism to achieve logic reuse. Therefore, they are naturally limited by component reuse, leading to limited extensibility, `Ref` barriers, and "Wrapper Hell" issues. Therefore, we need a simple and direct way of code reuse, i.e., functions. Abstracting the reusable logic into functions should be the most direct and cost-effective way of code reuse. However, for state logic, some abstract patterns (such as `Observable`) are still needed to achieve reuse. This is exactly the idea behind `Hooks` – treating functions as the smallest unit of code reuse, while also incorporating some patterns to simplify the reuse of state logic. Compared to the other solutions mentioned above, `Hooks` decouple internal logic reuse from component reuse, which truly attempts to address the fine-grained logic reuse issue from the bottom layer (between components). Additionally, this declarative logic reuse approach further extends the explicit data flow between components and the composition idea to the inside of components.

Of course, `Hooks` are not perfect. However, for the time being, its drawbacks are as follows:
* Additional learning costs, mainly in the comparison between `Functional Component` and `Class Component`.
* Writing restrictions (cannot appear in conditions or loops), and the restriction on writing style increases the refactoring cost.
* It disrupts the performance optimization effects of `PureComponent` and `React.memo` shallow comparisons. To obtain the latest `props` and `state`, a new event handling function must be re-created for each `render`().
* In closure scenarios, it may reference old `state` and `props` values.
* The internal implementation is not straightforward, relying on a mutable global state, and no longer as "pure".
* `React.memo` cannot completely replace `shouldComponentUpdate` (since it cannot detect `state change`, only for `props change`).
* Imperfect design of `useState API`.

### Example

```
<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8" />
    <title>React</title>
</head>
```

```html
<body>
    <div id="root"></div>
</body>
<script src="https://unpkg.com/react@17/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script type="text/babel">
  const {useState, useEffect} = React;

  function useMouseLocation(location){
    return (
      <>
        <h1>Please move your mouse here</h1>
        <p>Current mouse position: x:{location.x} y:{location.y}</p>
      </>
    );
  }

  function MouseTracker(props){
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);

    function handleMouseMove(event){
        setX(event.clientX);
        setY(event.clientY);
    }
    return (
      <div onMouseMove={handleMouseMove}>
        {useMouseLocation({x, y})}
      </div>
    )
  }

  ReactDOM.render(
    <MouseTracker/>, 
    document.getElementById("root")
  );
</script>

</html>

```





## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://zhuanlan.zhihu.com/p/38136388
https://juejin.cn/post/6844903910470057997
https://juejin.cn/post/6844903850038525959
https://my.oschina.net/u/4663041/blog/4588963
https://zh-hans.reactjs.org/docs/hooks-intro.html
https://zh-hans.reactjs.org/docs/hooks-effect.html
https://react-cn.github.io/react/docs/reusable-components.html
http://www.ayqy.net/blog/react%E7%BB%84%E4%BB%B6%E9%97%B4%E9%80%BB%E8%BE%91%E5%A4%8D%E7%94%A8/
```