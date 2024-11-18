# State and Props of React Components
Data in `React` flows in a one-way direction from top to bottom, that is, from the parent component to the child component. The component's data is stored in `props` and `state`. In any application, data is indispensable. We need to directly change a section of the page to refresh the view, or indirectly modify data in other places. In `React`, we use the `props` and `state` attributes to store data.

## Description
The main purpose of `state` is to allow the component to save, control, and modify its mutable state. `state` is initialized within the component and can be modified by the component itself, and cannot be accessed or modified externally. `state` can be thought of as a local data source that can only be controlled by the component itself. The state can be updated using the `this.setState` method, which triggers the component to re-render.  
The main purpose of `props` is to allow the parent component using the component to pass parameters to configure the component. It is a configuration parameter passed in from the outside, and cannot be controlled or modified internally. The component's `props` will remain unchanged unless new `props` are actively passed from the external component.  
Both `state` and `props` can determine the behavior and display of the component. Data from a component's `state` can be passed to a child component through `props`. A component can use externally passed `props` to initialize its own `state`. However, their responsibilities are very clear: `state` allows the component to control its own state, while `props` allows external configuration of the component. In simple terms, `props` are passed to the component (similar to function parameters), while `state` is managed by the component itself internally (similar to a variable declared within a function).  
A clear principle is to use `state` as little as possible and `props` as much as possible. A component without `state` is called a stateless component, while one with `state` is called a stateful component. Because state brings management complexity, we should write more stateless components and fewer stateful components, which will lower the difficulty of code maintenance and enhance component reusability to some extent.

## Props
The core idea of `React` is the componentization concept, where the page is divided into independent and reusable components. Conceptually, a component is a function that can accept a parameter as an input, and this parameter is the `props`. Therefore, `props` can be understood as data passed from the outside to the inside of the component. As `React` follows a one-way data flow, `props` is basically data passed from a parent component to a child component.  
Suppose we need to implement a list, where each row in the list is a component. This means we have two components, `<ItemList/>` and `<Item/>`. For the `ItemList` component, we temporarily assume that the list's data is stored in a `data` variable, and then use the `map` function to return an array, where each item is `<Item item={data}/>`. Essentially, this includes `data.length` `<Item/>` components, and data is passed to the component as a custom parameter. Inside the `Item` component, `this.props` is used to access all the data passed to it as an object. Currently, it only includes an `item` property, so it can be accessed using `this.props.item`.

```
// Item component
class Item extends React.Component{
  render(){
    return (
      <li>{this.props.item}</li>
    )
  }
}

// ItemList component
class ItemList extends React.Component{
  render(){
    const data = [1, 2, 3, 4, 5, 6];
    const itemList = data.map((v, i) => <Item item={v} key={i}/>);
    return (
      <ul>{itemList}</ul>
    )
  }
}
```
`props` are often used for rendering components and initializing state. Once a component is instantiated, its `props` are read-only and cannot be changed. If `props` can be changed during the rendering process, it will lead to an unpredictable appearance of the component. New `props` can only be passed into the component through the parent component's re-rendering process. In other words, `props` are parameters passed into the component from the outside and primarily act as a means to transfer data from the parent component to the child component. They are both readable and immutable, and new `props` can only be passed in by the parent component to re-render the child component, otherwise the child component's `props` and display will not change.  
In a component, we can also set a `defaultProps` for the parameters in `props`, and specify their types.

```
import PropTypes from "prop-types";

class Hello extends React.Component{
  constructor(props){
    super(props);
  }
  render() {
    return (
      <div>{this.props.tips}</div>
    );
  }
}

Hello.propTypes = {
  tips: PropTypes.string
};
```

The different validator types are as follows.

```javascript
import PropTypes from "prop-types";
```

```js
MyComponent.propTypes = {
  // Original JavaScript types, all of these are optional by default
  optionalArray: PropTypes.array,
  optionalBool: PropTypes.bool,
  optionalFunc: PropTypes.func,
  optionalNumber: PropTypes.number,
  optionalObject: PropTypes.object,
  optionalString: PropTypes.string,
  optionalSymbol: PropTypes.symbol,

  // Anything that can be directly rendered, such as numbers, strings, elements, or arrays
  optionalNode: PropTypes.node,

  // React element
  optionalElement: PropTypes.element,

  // Specifies the instance of a certain class
  optionalMessage: PropTypes.instanceOf(Message),

  // Can be one of multiple values
  optionalEnum: PropTypes.oneOf(["News", "Photos"]),

  // Can be one of multiple types
  optionalUnion: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.instanceOf(Message)
  ]),

  // Only an array of a certain type
  optionalArrayOf: PropTypes.arrayOf(PropTypes.number),

  // Object with specific type property values
  optionalObjectOf: PropTypes.objectOf(PropTypes.number),

  // Object with the same property values
  optionalObjectWithShape: PropTypes.shape({
    color: PropTypes.string,
    fontSize: PropTypes.number
  }),

  // Required condition can be combined with other validators to ensure a warning is issued when the property is not provided
  requiredFunc: PropTypes.func.isRequired,

  // Required condition, the provided property can be of any type
  requiredAny: PropTypes.any.isRequired,

  // Custom oneOfType validator. If the provided property value does not match it, it should throw an exception
  // Note: do not use console.warn and throw
  customProp: function(props, propName, componentName) {
    if (!/matcher/.test(props[propName])) {
      return new Error("Not Match");
    }
  },

  // Custom arrayOf or objectOf validator.
  // It will call each key of the array or object, and the first two parameters are the object itself and the current key
  // Note: do not use console.warn and throw
  customArrayProp: PropTypes.arrayOf(function(propValue, key, componentName, location, propFullName) {
    if (!/matcher/.test(propValue[key])) {
      return new Error("Not Match");
    }
  })
};

## State
The display of a component can be determined by data state and external parameters, which are `props`, and the data state is `state`. The main purpose of `state` is to save, control, and modify the state of the component. It can only be initialized in the `constructor` and is considered a private property of the component, not accessible or modifiable externally, only through `this.setState` within the component. Modifying the `state` property will cause the component to re-render. In simple terms, when the component is initialized, we use `this.state` to set an initial `state` for the component, which will be used to render the component during the first `render`.

```jsx
class Hello extends React.Component{
  constructor(props){
    super(props);
    this.state = { 
      tips: "Hello World!"
    }
  }
  render() {
    return (
      <div>{this.state.tips}</div>
    );
  }
}
```

One difference between `state` and `props` is that `state` can be changed. However, it cannot be directly modified using `this.state= values;` and needs to be modified using the `this.setState()` method. For example, we often need to perform asynchronous operations to fetch data, which should be executed in the `didMount` lifecycle stage.
```

```javascript
componentDidMount(){
  fetch("url")
    .then(response => response.json())
    .then((data) => {
      this.setState({itemList:data});  
    }
}
```

When we call the `this.setState` method, `React` updates the component's data state `state` and re-invokes the `render` method, which means the component will be re-rendered. `setState` accepts an object or a function as the first parameter, and only the part that needs to be updated needs to be passed in. `setState` can also accept a second parameter, which is a function that will be called when `setState` is completed and the component starts to re-render, and can be used to monitor the completion of rendering.

```javascript
this.setState({ tips: "data update" });
this.setState({ tips: "data update" }, () => console.log("finished"));
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
  class Item extends React.Component{
    render(){
      return (
        <li>{this.props.item}</li>
      )
    }
  }

  class ItemList extends React.Component{
      render(){
        const data = [1, 2, 3, 4, 5, 6];
        const itemList = data.map((v, i) => <Item item={v} key={i}/>);
        return (
          <ul>{itemList}</ul>
      )
    }
  }

  class Hello extends React.Component{
    constructor(props){
      super(props);
      this.state = { 
        tips: "Hello World!"
      }
    }
    render() {
      return (
        <div>{this.state.tips}</div>
      );
    }
  }

  class App extends React.Component{
    render() {
      return (
        <div>
            <Hello />
            <ItemList />
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



## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://github.com/axuebin/react-blog/issues/8
https://zh-hans.reactjs.org/docs/faq-state.html
http://huziketang.mangojuice.top/books/react/lesson12
```