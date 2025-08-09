# React组件的state和props
`React`的数据是自顶向下单向流动的，即从父组件到子组件中，组件的数据存储在`props`和`state`中。实际上在任何应用中，数据都是必不可少的，我们需要直接的改变页面上一块的区域来使得视图的刷新，或者间接地改变其他地方的数据，在`React`中就使用`props`和`state`两个属性存储数据。

## 概述
`state`的主要作用是用于组件保存、控制、修改自己的可变状态。`state`在组件内部初始化，可以被组件自身修改，而外部不能访问也不能修改，可以认为`state`是一个局部的、只能被组件自身控制的数据源，`state`中状态可以通过`this.setState`方法进行更新，`setState`会导致组件的重新渲染。  
`props`的主要作用是让使用该组件的父组件可以传入参数来配置该组件，它是外部传进来的配置参数，组件内部无法控制也无法修改，除非外部组件主动传入新的`props`，否则组件的`props`永远保持不变。  
`state`和`props`都可以决定组件的行为和显示形态，一个组件的`state`中的数据可以通过`props`传给子组件，一个组件可以使用外部传入的`props`来初始化自己的`state`，但是它们的职责其实非常明晰分明，`state`是让组件控制自己的状态，`props`是让外部对组件自己进行配置。简单来说`props`是传递给组件的(类似于函数的形参)，而`state`是在组件内被组件自己管理的(类似于在一个函数内声明的变量)。  
一个清晰的原则是尽量少地用`state`，尽量多地用`props`，没有`state`的组件叫无状态组件`stateless component`，设置了`state`的叫做有状态组件`stateful component`。因为状态会带来管理的复杂性，我们尽量多地写无状态组件，尽量少地写有状态的组件，这样会降低代码维护的难度，也会在一定程度上增强组件的可复用性。

## props
`React`的核心思想就是组件化思想，页面会被切分成一些独立的、可复用的组件。组件从概念上看就是一个函数，可以接受一个参数作为输入值，这个参数就是`props`，所以可以把`props`理解为从外部传入组件内部的数据，由于`React`是单向数据流，所以`props`基本上也就是从服父级组件向子组件传递的数据。  
假设我们现在需要实现一个列表，我们把列表中的行当做一个组件，也就是有这样两个组件`<ItemList/>`和`<Item/>`。列表`ItemList`组件的数据我们就暂时先假设是放在一个`data`变量中，然后通过`map`函数返回一个每一项都是`<Item item={数据}/>`的数组，也就是说这里其实包含了`data.length`个`<Item/>`组件，数据通过在组件上自定义一个参数传递。之后在`Item`组件内部是使用`this.props`来获取传递到该组件的所有数据，它是一个对象其中包含了所有对这个组件的配置，现在只包含了一个`item`属性，所以通过`this.props.item`来获取即可。


```
// Item组件
class Item extends React.Component{
  render(){
    return (
      <li>{this.props.item}</li>
    )
  }
}

// ItemList组件
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
`props`经常被用作渲染组件和初始化状态，当一个组件被实例化之后，它的`props`是只读的，不可改变的。如果`props`在渲染过程中可以被改变，会导致这个组件显示的形态变得不可预测，只有通过父组件重新渲染的方式才可以把新的`props`传入组件中。也就是说`props`是一个从外部传进组件的参数，主要作为就是从父组件向子组件传递数据，它具有可读性和不变性，只能通过外部组件主动传入新的`props`来重新渲染子组件，否则子组件的`props`以及展现形式不会改变。  
在组件中，我们也可以为`props`中的参数设置一个`defaultProps`，并且制定它的类型。

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

不同的验证器类型如下。

```javascript
import PropTypes from "prop-types";

MyComponent.propTypes = {
  // JS原始类型，这些全部默认是可选的
  optionalArray: PropTypes.array,
  optionalBool: PropTypes.bool,
  optionalFunc: PropTypes.func,
  optionalNumber: PropTypes.number,
  optionalObject: PropTypes.object,
  optionalString: PropTypes.string,
  optionalSymbol: PropTypes.symbol,

  // 可以直接渲染的任何东西，可以是数字、字符串、元素或数组
  optionalNode: PropTypes.node,

  // React元素
  optionalElement: PropTypes.element,

  // 指定是某个类的实例
  optionalMessage: PropTypes.instanceOf(Message),

  // 可以是多个值中的一个
  optionalEnum: PropTypes.oneOf(["News", "Photos"]),

  // 可以是多种类型中的一个
  optionalUnion: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.instanceOf(Message)
  ]),

  // 只能是某种类型的数组
  optionalArrayOf: PropTypes.arrayOf(PropTypes.number),

  // 具有特定类型属性值的对象
  optionalObjectOf: PropTypes.objectOf(PropTypes.number),

  // 具有相同属性值的对象
  optionalObjectWithShape: PropTypes.shape({
    color: PropTypes.string,
    fontSize: PropTypes.number
  }),

  // 必选条件，可以配合其他验证器，以确保在没有提供属性的情况下发出警告
  requiredFunc: PropTypes.func.isRequired,

  // 必选条件，提供的属性可以为任意类型
  requiredAny: PropTypes.any.isRequired,

  // 自定义 oneOfType 验证器。如果提供的属性值不匹配的它应该抛出一个异常
  // 注意：不能使用 console.warn 和 throw
  customProp: function(props, propName, componentName) {
    if (!/matcher/.test(props[propName])) {
      return new Error("Not Match");
    }
  },

  // 自定义 arrayOf 或者 objectOf 验证器。
  // 它会调用每个数组或者对象的key，参数前两个是对象它本身和当前key
  // 注意：不能使用 console.warn  和 throw
  customArrayProp: PropTypes.arrayOf(function(propValue, key, componentName, location, propFullName) {
    if (!/matcher/.test(propValue[key])) {
      return new Error("Not Match");
    }
  })
};
```

## state
一个组件的显示形态可以由数据状态和外部参数所决定，外部参数也就是`props`，而数据状态就是`state`。`state`的主要作用是用于组件保存、控制以及修改自己的状态，它只能在`constructor`中初始化，它算是组件的私有属性，不可通过外部访问和修改，只能通过组件内部的`this.setState`来修改，修改`state`属性会导致组件的重新渲染。简单来说就是在组件初始化的时候，通过`this.state`给组件设定一个初始的`state`，在第一次`render`的时候就会用这个数据来渲染组件。

```
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

`state`不同于`props`的一点是，`state`是可以被改变的。不过不可以直接通过`this.state= values;`的方式来修改，而需要通过`this.setState()`方法来修改`state`。例如我们经常会通过异步操作来获取数据，我们需要在`didMount`生命周期阶段来执行异步操作。

```
componentDidMount(){
  fetch("url")
    .then(response => response.json())
    .then((data) => {
      this.setState({itemList:item});  
    }
}
```

当我们调用`this.setState`方法时，`React`会更新组件的数据状态`state`，并且重新调用`render`方法，也就是会对组件进行重新渲染。`setState`接受一个对象或者函数作为第一个参数，只需要传入需要更新的部分即可，`setState`还可以接受第二个参数，它是一个函数，会在`setState`调用完成并且组件开始重新渲染时被调用，可以用来监听渲染完成。

```
this.setState({ tips: "data update" });
this.setState({ tips: "data update" }, () => console.log("finished"));
```


## 示例

```
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



## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://github.com/axuebin/react-blog/issues/8
https://zh-hans.reactjs.org/docs/faq-state.html
http://huziketang.mangojuice.top/books/react/lesson12
```

