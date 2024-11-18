# Higher Order Components in React

The Higher Order Component (HOC) is an advanced technique used in React for reusing component logic. HOC itself is not part of the React API, but rather a design pattern based on the compositional nature of React.

## Description
The name "Higher Order Component" itself exudes an air of sophistication, and in fact, this concept should be derived from higher-order functions in JavaScript. A higher-order function is a function that takes a function as input or returns a function as output. Currying can be thought of as a kind of higher-order function. Similarly, the React documentation also provides a definition of higher-order components, which are functions that accept a component and return a new component.

```
A higher-order component is a function that takes a component and returns a new component.
```

Specifically, a higher-order component is a function whose parameter is a component and whose return value is a new component. While a component transforms `props` into UI, a higher-order component transforms a component into another component. HOCs are common in third-party libraries for React, such as the `connect` function in Redux and the `createFragmentContainer` function in Relay.

```
// Higher Order Component Definition
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

// Returns the enhanced component wrapped by the higher-order component
const EnhancedComponent = higherOrderComponent(WrappedComponent);
```

It's important to note that you should not attempt to modify the component prototype in any way within the HOC. Instead, you should use a compositional approach by wrapping the component in a container component to implement functionality. Generally, there are two typical ways to implement a higher-order component:

- Props Proxy
- Inheritance Inversion

### Props Proxy
For example, we can add a `id` property value from a store to the incoming component using a higher-order component. This allows us to add new props to the component. Of course, we can also manipulate the `props` in the `WrappedComponent` component in JSX, but it's important to note that we shouldn't directly modify the passed-in `WrappedComponent` class. Instead, we can manipulate it in the process of composition.

```
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

We can also use a higher-order component to inject the state of the new component into the wrapped component. For example, we can use a higher-order component to convert an uncontrolled component into a controlled component.

```
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

Perhaps our goal is to wrap it with other components to achieve layout or style purposes.

```javascript
const HOC = (WrappedComponent) => {
    return class EnhancedComponent extends React.Component {
        render() {
            return (
                <div class="layout">
                    <WrappedComponent  {...this.props} />
                </div>
            );
        }
    }
}
```

### Reverse Inheritance
Reverse inheritance means that the returned component inherits from the previous component. In reverse inheritance, we can do a lot of operations, such as modifying `state`, `props`, or even flipping the `Element Tree`. The important point of reverse inheritance is that it cannot guarantee that the entire subtree of child components is resolved. This means that if the resolved element tree contains components (function type or `Class` type), we cannot manipulate the child components of the components.

When we use reverse inheritance to implement higher-order components, we can control rendering through rendering interception. Specifically, we can consciously control the rendering process of `WrappedComponent`, thereby controlling the result of rendering control. For example, we can decide whether to render the component based on certain parameters.

```javascript
const HOC = (WrappedComponent) => {
    return class EnhancedComponent extends WrappedComponent {
        render() {
            return this.props.isRender && super.render();  
        }
    }
}
```

We can even intercept the original component's lifecycle through overriding.

```javascript
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

Since it is actually an inheritance relationship, we can read the component's `props` and `state`, and if necessary, even add, modify, or delete `props` and `state`. Of course, you need to control the risks brought by the modifications yourself. In some cases, we may need to pass some parameters to the higher-order attribute, and we can do so by passing parameters in a curried form, combined with higher-order components to achieve similar closure-like operations on components.

```javascript
const HOCFactoryFactory = (params) => {
    // Operations on params here
    return (WrappedComponent) => {
        return class EnhancedComponent extends WrappedComponent {
            render() {
                return params.isRender && this.props.isRender && super.render();
            }
        }
    }
}
```

## HOC and Mixin
Both `Mixin` and `HOC` can be used to address cross-cutting concerns.  
`Mixin` is a mixed-in pattern. In practical use, the role of `Mixin` is still very powerful. It allows us to share the same methods among multiple components, but it also continuously adds new methods and properties to the components. The component itself not only perceives it but even needs to deal with it (such as naming conflicts, state maintenance, etc.). When the number of mixed-in modules increases, the entire component becomes difficult to maintain. `Mixin` may introduce invisible properties, such as using `Mixin` methods in rendering components, which introduces invisible properties `props` and state `state` to the component. Additionally, `Mixin` may depend on each other, couple with each other, and is not conducive to code maintenance. In addition, methods in different `Mixin`s may conflict with each other. Previously, the `React` official recommendation was to use `Mixin` to address cross-cutting concerns, but because using `Mixin` may cause more trouble, the official now recommends using `HOC`.  
Higher-order component `HOC` belongs to the functional programming thought. The wrapped component does not perceive the existence of the higher-order component, and the component returned by the higher-order component has enhanced functionality above the original component. Based on this, `React` officially recommends using higher-order components.

## Caution

### Do Not Change the Original Component
Do not attempt to modify the component prototype in the `HOC`, or change it in any other way.

```javascript
function logProps(InputComponent) {
  InputComponent.prototype.componentDidUpdate = function(prevProps) {
    console.log("Current props: ", this.props);
    console.log("Previous props: ", prevProps);
  };
  // Return the original input component, which has been modified.
  return InputComponent;
}

// Every time logProps is called, the enhanced component will have log output.
const EnhancedComponent = logProps(InputComponent);
```
This can lead to some undesirable consequences; one is that the input component can no longer be used like it was before being enhanced with an HOC. Even worse, if you use another HOC that also modifies componentDidUpdate, the previous HOC will become ineffective, and this HOC will also be unable to be applied to function components without lifecycles.

Modifying the passed-in component in an HOC is a poor abstraction, as callers must know how they are implemented to avoid conflicts with other HOCs. HOCs should not modify the passed-in component but should use composition by implementing functionality through wrapping the component in a container component.

```javascript
function logProps(WrappedComponent) {
  return class extends React.Component {
    componentDidUpdate(prevProps) {
      console.log("Current props: ", this.props);
      console.log("Previous props: ", prevProps);
    }
    render() {
      // Wrap the input component in a container without modifying it, nice!
      return <WrappedComponent {...this.props} />;
    }
  }
}
```

### Filter Props
HOCs add features to the component and should not significantly alter the convention. The component returned by the HOC should maintain a similar interface to the original component. Most HOCs should include a `render` method similar to the one below.

```javascript
render() {
  // Filter out extra props and do not pass them through
  const { extraProp, ...passThroughProps } = this.props;

  // Inject props into the wrapped component.
  // Usually the value of state or instance method.
  const injectedProp = someStateOrInstanceMethod;

  // Pass props to the wrapped component
  return (
    <WrappedComponent
      injectedProp={injectedProp}
      {...passThroughProps}
    />
  );
}
```

### Maximize Composability
Not all HOCs are alike; sometimes it only accepts one parameter, which is the wrapped component.

```javascript
const NavbarWithRouter = withRouter(Navbar);
```

HOCs can often accept multiple parameters, such as in `Relay`, where HOC also receives a configuration object to specify the component's data dependency.

```javascript
const CommentWithRelay = Relay.createContainer(Comment, config);
```

The most common HOC signature is as follows. `connect` is a higher-order function that returns a higher-order component.

```javascript
// The `connect` function of React Redux
const ConnectedComment = connect(commentSelector, commentActions)(CommentList);

// connect is a function that returns another function.
const enhance = connect(commentListSelector, commentListActions);
// The return value is an HOC that will return a component already connected to the Redux store
const ConnectedComment = enhance(CommentList);
```

This form may seem confusing or unnecessary, but it has a useful property. Single-argument HOCs returned by functions have a signature of `Component => Component`, making it easy to combine functions with output types similar to input types. This property also allows `connect` and other HOCs to take on the role of decorators. Furthermore, many third-party libraries provide a `compose` utility function, including `lodash`, `Redux`, and `Ramda`.

```javascript
const EnhancedComponent = withRouter(connect(commentSelector)(WrappedComponent))
```

```javascript
// You can write composed utility functions
// compose(f, g, h) is equivalent to (...args) => f(g(h(...args)))
const enhance = compose(
  // These are all single-argument HOCs
  withRouter,
  connect(commentSelector)
)
const EnhancedComponent = enhance(WrappedComponent)
```

### Avoid using HOCs inside render method
`React`'s `diff` algorithm uses component identifiers to determine whether to update an existing subtree or discard it and mount a new subtree. If the component returned from `render` is the same `===` as the one in the previous render, `React` recursively updates the subtree by distinguishing between the old and the new one. If they are not equal, it completely unmounts the previous subtree. Normally you don't have to worry about this, but for HOCs, this is very important because it means that you shouldn't apply an HOC to a component within the component's `render` method.

```javascript
render() {
  // Every call to the render function creates a new EnhancedComponent
  // EnhancedComponent1 !== EnhancedComponent2
  const EnhancedComponent = enhance(MyComponent);
  // This will cause the subtree to be unmounted and remounted on every render!
  return <EnhancedComponent />;
}
```

This is not just a performance issue, remounting a component will cause the component and all of its children to lose their state. If the HOC is created outside of the component, then the component is only created once. So every time it's rendered, it's the same component. Normally, this is what you'd expect. In a few cases when you need to, you can dynamically call an HOC within the lifecycle methods of the component or in its constructor.

### Always copy static methods
Sometimes defining static methods on a `React` component can be useful, for example, a `Relay` container exposes a static method `getFragment` to ease composing `GraphQL` fragments. But when you apply an HOC to a component, the original component is wrapped by the container component, which means the new component doesn't have any of the original component's static methods.

```javascript
// Define static method
WrappedComponent.staticMethod = function() {/*...*/}
// Now use the HOC
const EnhancedComponent = enhance(WrappedComponent);

// Enhanced component doesn’t have staticMethod
typeof EnhancedComponent.staticMethod === "undefined" // true
```

To solve this issue, you can copy these methods onto the container component before returning it.

```javascript
function enhance(WrappedComponent) {
  class Enhance extends React.Component {/*...*/}
  // You must know exactly which methods to copy :(
  Enhance.staticMethod = WrappedComponent.staticMethod;
  return Enhance;
}
```

To do this, you need to know which methods should be copied, and you can use the `hoist-non-react-statics` dependency to automatically copy all non-`React` static methods.

```javascript
import hoistNonReactStatic from "hoist-non-react-statics";
function enhance(WrappedComponent) {
  class Enhance extends React.Component {/*...*/}
  hoistNonReactStatic(Enhance, WrappedComponent);
  return Enhance;
}
```

Another viable solution, besides exporting the component, is to separately export the static methods.

```javascript
// Use this approach instead...
MyComponent.someFunction = someFunction;
export default MyComponent;

// ...and separately export the method...
export { someFunction };

// ...and in the component where you want to use it, import them
import MyComponent, { someFunction } from "./MyComponent.js";
```

### Refs are not passed down
Although the convention with higher-order components is to pass all props to the wrapped component, this does not apply to refs because `ref` is not actually a `prop`, it's handled specifically by `React`. If a ref is added to the returned component of an HOC, the ref will refer to the container component instead of the wrapped component. This issue can be addressed by explicitly forwarding the refs to the inner component using the `React.forwardRef` API.


```javascript
function logProps(Component) {
  class LogProps extends React.Component {
    componentDidUpdate(prevProps) {
      console.log('old props:', prevProps);
      console.log('new props:', this.props);
    }

    render() {
      const {forwardedRef, ...rest} = this.props;

      // Define the custom prop "forwardedRef" as ref
      return <Component ref={forwardedRef} {...rest} />;
    }
  }

  // Note the second argument "ref" in the React.forwardRef callback.
  // We can pass it as a regular prop to LogProps, for example "forwardedRef",
  // and then it can be mounted on the child component wrapped by LogProps.
  return React.forwardRef((props, ref) => {
    return <LogProps {...props} forwardedRef={ref} />;
  });
}
```

## Example

```html
<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8" />
    <title>React</title>
</head>

<body>
    <div id="root"></div>
</body>
<script src="https://unpkg.com/react@17/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script type="text/babel">
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

    const EnhancedComponent = HOC(WrappedComponent);

    const HOC2 = (WrappedComponent) => {
        return class EnhancedComponent extends WrappedComponent {
            render() {
                return this.props.isRender && super.render();  
            }
        }
    }

    const EnhancedComponent2 = HOC2(WrappedComponent);

    var vm = ReactDOM.render(
        <>
            <EnhancedComponent />
            <EnhancedComponent2 isRender={true} />
        </>,
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
https://juejin.cn/post/6844903477798256647
https://juejin.cn/post/6844904050236850184
https://zh-hans.reactjs.org/docs/higher-order-components.htm
```