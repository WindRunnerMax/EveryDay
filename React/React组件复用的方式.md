# React组件复用的方式
现前端的工程化越发重要，虽然使用`Ctrl+C`与`Ctrl+V`同样能够完成需求，但是一旦面临修改那就是一项庞大的任务，于是减少代码的拷贝，增加封装复用能力，实现可维护、可复用的代码就变得尤为重要，在`React`中组件是代码复用的主要单元，基于组合的组件复用机制相当优雅，而对于更细粒度的逻辑(状态逻辑、行为逻辑等)，复用起来却不那么容易，很难把状态逻辑拆出来作为一个可复用的函数或组件，实际上在`Hooks`出现之前，都缺少一种简单直接的组件行为扩展方式，对于`Mixin`、`HOC`、`Render Props`都算是在既有(组件机制的)游戏规则下探索出来的上层模式，一直没有从根源上很好地解决组件间逻辑复用的问题，直到`Hooks`登上舞台，下面我们就来介绍一下`Mixin`、`HOC`、`Render Props`、`Hooks`四种组件间复用的方式。

## Mixin
当然`React`很久之前就不再建议使用`Mixin`作为复用的解决方案，但是现在依旧能通过`create-react-class`提供对`Mixin`的支持，此外注意在以`ES6`的`class`方式声明组件时是不支持`Mixin`的。  
`Mixins`允许多个`React`组件之间共享代码，它们非常类似于`Python`中的`mixins`或`PHP`中的`traits`，`Mixin`方案的出现源自一种`OOP`直觉，只在早期提供了`React.createClass() API`(`React v15.5.0`正式废弃，移至`create-react-class`)来定义组件，自然而然地，(类)继承就成了一种直觉性的尝试，而在`JavaScript`基于原型的扩展模式下，类似于继承的`Mixin`方案就成了一个不错的解决方案，`Mixin`主要用来解决生命周期逻辑和状态逻辑的复用问题，允许从外部扩展组件生命周期，在`Flux`等模式中尤为重要，但是在不断实践中也出现了很多缺陷:
* 组件与`Mixin`之间存在隐式依赖(`Mixin`经常依赖组件的特定方法，但在定义组件时并不知道这种依赖关系)。
* 多个`Mixin`之间可能产生冲突(比如定义了相同的`state`字段)。
* `Mixin`倾向于增加更多状态，这降低了应用的可预测性，导致复杂度剧增。
* 隐式依赖导致依赖关系不透明，维护成本和理解成本迅速攀升。
* 难以快速理解组件行为，需要全盘了解所有依赖`Mixin`的扩展行为，及其之间的相互影响
* 组件自身的方法和`state`字段不敢轻易删改，因为难以确定有没有`Mixin`依赖它。
* `Mixin`也难以维护，因为`Mixin`逻辑最后会被打平合并到一起，很难搞清楚一个`Mixin`的输入输出。

毫无疑问，这些问题是致命的，所以，`Reactv0.13.0`放弃了`Mixin`静态横切(类似于继承的复用)，转而走向`HOC`高阶组件(类似于组合的复用)。

### 示例
上古版本示例，一个通用的场景是`: `一个组件需要定期更新，用`setInterval()`做很容易，但当不需要它的时候取消定时器来节省内存是非常重要的，`React`提供生命周期方法来告知组件创建或销毁的时间，下面的`Mixin`，使用`setInterval()`并保证在组件销毁时清理定时器。

```
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
  mixins: [SetIntervalMixin], // 引用 mixin
  getInitialState: function() {
    return {seconds: 0};
  },
  componentDidMount: function() {
    this.setInterval(this.tick, 1000); // 调用 mixin 的方法
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
`Mixin`之后，`HOC`高阶组件担起重任，成为组件间逻辑复用的推荐方案，高阶组件从名字上就透漏出高级的气息，实际上这个概念应该是源自于`JavaScript`的高阶函数，高阶函数就是接受函数作为输入或者输出的函数，可以想到柯里化就是一种高阶函数，同样在`React`文档上也给出了高阶组件的定义，高阶组件是接收组件并返回新组件的函数。具体的意思就是`: `高阶组件可以看作`React`对装饰模式的一种实现，高阶组件就是一个函数，且该函数接受一个组件作为参数，并返回一个新的组件，他会返回一个增强的`React`组件，高阶组件可以让我们的代码更具有复用性，逻辑性与抽象性，可以对`render`方法进行劫持，也可以控制`props`与`state`等。  
对比`Mixin`与`HOC`，`Mixin`是一种混入的模式，在实际使用中`Mixin`的作用还是非常强大的，能够使得我们在多个组件中共用相同的方法，但同样也会给组件不断增加新的方法和属性，组件本身不仅可以感知，甚至需要做相关的处理(例如命名冲突、状态维护等)，一旦混入的模块变多时，整个组件就变的难以维护，`Mixin`可能会引入不可见的属性，例如在渲染组件中使用`Mixin`方法，给组件带来了不可见的属性`props`和状态`state`，并且`Mixin`可能会相互依赖，相互耦合，不利于代码维护，此外不同的`Mixin`中的方法可能会相互冲突。之前`React`官方建议使用`Mixin`用于解决横切关注点相关的问题，但由于使用`Mixin`可能会产生更多麻烦，所以官方现在推荐使用`HOC`。高阶组件`HOC`属于函数式编程`functional programming`思想，对于被包裹的组件时不会感知到高阶组件的存在，而高阶组件返回的组件会在原来的组件之上具有功能增强的效果，基于此`React`官方推荐使用高阶组件。   
`HOC`虽然没有那么多致命问题，但也存在一些小缺陷:
* 扩展性限制`: HOC`并不能完全替代`Mixin`，一些场景下，`Mixin`可以而`HOC`做不到，比如`PureRenderMixin`，因为`HOC`无法从外部访问子组件的`State`，同时通过`shouldComponentUpdate`滤掉不必要的更新，因此，`React`在支持`ES6Class`之后提供了`React.PureComponent`来解决这个问题。
* `Ref`传递问题`: Ref`被隔断，`Ref`的传递问题在层层包装下相当恼人，函数`Ref`能够缓解一部分(让`HOC`得以获知节点创建与销毁)，以致于后来有了`React.forwardRef API`。
* `WrapperHell: HOC`泛滥，出现`WrapperHell`(没有包一层解决不了的问题，如果有，那就包两层)，多层抽象同样增加了复杂度和理解成本，这是最关键的缺陷，而`HOC`模式下没有很好的解决办法。

### 示例
具体而言，高阶组件是参数为组件，返回值为新组件的函数，组件是将`props`转换为`UI`，而高阶组件是将组件转换为另一个组件。`HOC`在`React`的第三方库中很常见，例如`Redux`的`connect`和`Relay`的`createFragmentContainer`。

```
// 高阶组件定义
const higherOrderComponent = (WrappedComponent) => {
    return class EnhancedComponent extends React.Component {
        // ...
        render() {
          return <WrappedComponent {...this.props} />;
        }
  };
}

// 普通组件定义
class WrappedComponent extends React.Component{
    render(){
        //....
    }
}

// 返回被高阶组件包装过的增强组件
const EnhancedComponent = higherOrderComponent(WrappedComponent);
```

在这里要注意，不要试图以任何方式在`HOC`中修改组件原型，而应该使用组合的方式，通过将组件包装在容器组件中实现功能。通常情况下，实现高阶组件的方式有以下两种:

* 属性代理`Props Proxy`。
* 反向继承`Inheritance Inversion`。

#### 属性代理
例如我们可以为传入的组件增加一个存储中的`id`属性值，通过高阶组件我们就可以为这个组件新增一个`props`，当然我们也可以对在`JSX`中的`WrappedComponent`组件中`props`进行操作，注意不是操作传入的`WrappedComponent`类，我们不应该直接修改传入的组件，而可以在组合的过程中对其操作。

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

我们也可以利用高阶组件将新组件的状态装入到被包装组件中，例如我们可以使用高阶组件将非受控组件转化为受控组件。

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

或者我们的目的是将其使用其他组件包裹起来用以达成布局或者是样式的目的。

```
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

#### 反向继承
反向继承是指返回的组件去继承之前的组件，在反向继承中我们可以做非常多的操作，修改`state`、`props`甚至是翻转`Element Tree`，反向继承有一个重要的点，反向继承不能保证完整的子组件树被解析，也就是说解析的元素树中包含了组件(函数类型或者`Class`类型)，就不能再操作组件的子组件了。  
当我们使用反向继承实现高阶组件的时候可以通过渲染劫持来控制渲染，具体是指我们可以有意识地控制`WrappedComponent`的渲染过程，从而控制渲染控制的结果，例如我们可以根据部分参数去决定是否渲染组件。

```
const HOC = (WrappedComponent) => {
    return class EnhancedComponent extends WrappedComponent {
        render() {
            return this.props.isRender && super.render();  
        }
    }
}
```

甚至我们可以通过重写的方式劫持原组件的生命周期。

```
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

由于实际上是继承关系，我们可以去读取组件的`props`和`state`，如果有必要的话，甚至可以修改增加、修改和删除`props`和`state`，当然前提是修改带来的风险需要你自己来控制。在一些情况下，我们可能需要为高阶属性传入一些参数，那我们就可以通过柯里化的形式传入参数，配合高阶组件可以完成对组件的类似于闭包的操作。

```
const HOCFactoryFactory = (params) => {
    // 此处操作params
    return (WrappedComponent) => {
        return class EnhancedComponent extends WrappedComponent {
            render() {
                return params.isRender && this.props.isRender && super.render();
            }
        }
    }
}
```

### 注意
#### 不要改变原始组件
不要试图在`HOC`中修改组件原型，或以其他方式改变它。

```
function logProps(InputComponent) {
  InputComponent.prototype.componentDidUpdate = function(prevProps) {
    console.log("Current props: ", this.props);
    console.log("Previous props: ", prevProps);
  };
  // 返回原始的 input 组件，其已经被修改。
  return InputComponent;
}

// 每次调用 logProps 时，增强组件都会有 log 输出。
const EnhancedComponent = logProps(InputComponent);
```
这样做会产生一些不良后果，其一是输入组件再也无法像`HOC`增强之前那样使用了，更严重的是，如果你再用另一个同样会修改`componentDidUpdate`的`HOC`增强它，那么前面的`HOC`就会失效，同时这个`HOC`也无法应用于没有生命周期的函数组件。  
修改传入组件的`HOC`是一种糟糕的抽象方式，调用者必须知道他们是如何实现的，以避免与其他`HOC`发生冲突。`HOC`不应该修改传入组件，而应该使用组合的方式，通过将组件包装在容器组件中实现功能。

```
function logProps(WrappedComponent) {
  return class extends React.Component {
    componentDidUpdate(prevProps) {
      console.log("Current props: ", this.props);
      console.log("Previous props: ", prevProps);
    }
    render() {
      // 将 input 组件包装在容器中，而不对其进行修改，Nice!
      return <WrappedComponent {...this.props} />;
    }
  }
}
```

#### 过滤props 
`HOC`为组件添加特性，自身不应该大幅改变约定，`HOC`返回的组件与原组件应保持类似的接口。`HOC`应该透传与自身无关的`props`，大多数`HOC`都应该包含一个类似于下面的`render`方法。

```
render() {
  // 过滤掉额外的 props，且不要进行透传
  const { extraProp, ...passThroughProps } = this.props;

  // 将 props 注入到被包装的组件中。
  // 通常为 state 的值或者实例方法。
  const injectedProp = someStateOrInstanceMethod;

  // 将 props 传递给被包装组件
  return (
    <WrappedComponent
      injectedProp={injectedProp}
      {...passThroughProps}
    />
  );
}
```

#### 最大化可组合性
并不是所有的`HOC`都一样，有时候它仅接受一个参数，也就是被包裹的组件。

```
const NavbarWithRouter = withRouter(Navbar);
```

`HOC`通常可以接收多个参数，比如在`Relay`中`HOC`额外接收了一个配置对象用于指定组件的数据依赖。

```
const CommentWithRelay = Relay.createContainer(Comment, config);
```

最常见的`HOC`签名如下，`connect`是一个返回高阶组件的高阶函数。

```
// React Redux 的 `connect` 函数
const ConnectedComment = connect(commentSelector, commentActions)(CommentList);

// connect 是一个函数，它的返回值为另外一个函数。
const enhance = connect(commentListSelector, commentListActions);
// 返回值为 HOC，它会返回已经连接 Redux store 的组件
const ConnectedComment = enhance(CommentList);
```

这种形式可能看起来令人困惑或不必要，但它有一个有用的属性，像`connect`函数返回的单参数`HOC`具有签名`Component => Component`，输出类型与输入类型相同的函数很容易组合在一起。同样的属性也允许`connect`和其他`HOC`承担装饰器的角色。此外许多第三方库都提供了`compose`工具函数，包括`lodash`、`Redux`和`Ramda`。

```
const EnhancedComponent = withRouter(connect(commentSelector)(WrappedComponent))

// 你可以编写组合工具函数
// compose(f, g, h) 等同于 (...args) => f(g(h(...args)))
const enhance = compose(
  // 这些都是单参数的 HOC
  withRouter,
  connect(commentSelector)
)
const EnhancedComponent = enhance(WrappedComponent)
```

#### 不要在render方法中使用HOC
`React`的`diff`算法使用组件标识来确定它是应该更新现有子树还是将其丢弃并挂载新子树，如果从`render`返回的组件与前一个渲染中的组件相同`===`，则`React`通过将子树与新子树进行区分来递归更新子树，如果它们不相等，则完全卸载前一个子树。  
通常在使用的时候不需要考虑这点，但对`HOC`来说这一点很重要，因为这代表着你不应在组件的`render`方法中对一个组件应用`HOC`。

```
render() {
  // 每次调用 render 函数都会创建一个新的 EnhancedComponent
  // EnhancedComponent1 !== EnhancedComponent2
  const EnhancedComponent = enhance(MyComponent);
  // 这将导致子树每次渲染都会进行卸载，和重新挂载的操作！
  return <EnhancedComponent />;
}
```
这不仅仅是性能问题，重新挂载组件会导致该组件及其所有子组件的状态丢失，如果在组件之外创建`HOC`，这样一来组件只会创建一次。因此每次`render`时都会是同一个组件，一般来说，这跟你的预期表现是一致的。在极少数情况下，你需要动态调用`HOC`，你可以在组件的生命周期方法或其构造函数中进行调用。

#### 务必复制静态方法
有时在`React`组件上定义静态方法很有用，例如`Relay`容器暴露了一个静态方法`getFragment`以方便组合`GraphQL`片段。但是当你将`HOC`应用于组件时，原始组件将使用容器组件进行包装，这意味着新组件没有原始组件的任何静态方法。

```
// 定义静态函数
WrappedComponent.staticMethod = function() {/*...*/}
// 现在使用 HOC
const EnhancedComponent = enhance(WrappedComponent);

// 增强组件没有 staticMethod
typeof EnhancedComponent.staticMethod === "undefined" // true
```

为了解决这个问题，你可以在返回之前把这些方法拷贝到容器组件上。

```
function enhance(WrappedComponent) {
  class Enhance extends React.Component {/*...*/}
  // 必须准确知道应该拷贝哪些方法 :(
  Enhance.staticMethod = WrappedComponent.staticMethod;
  return Enhance;
}
```

但要这样做，你需要知道哪些方法应该被拷贝，你可以使用`hoist-non-react-statics`依赖自动拷贝所有非`React`静态方法。

```
import hoistNonReactStatic from "hoist-non-react-statics";
function enhance(WrappedComponent) {
  class Enhance extends React.Component {/*...*/}
  hoistNonReactStatic(Enhance, WrappedComponent);
  return Enhance;
}
```

除了导出组件，另一个可行的方案是再额外导出这个静态方法。

```
// 使用这种方式代替...
MyComponent.someFunction = someFunction;
export default MyComponent;

// ...单独导出该方法...
export { someFunction };

// ...并在要使用的组件中，import 它们
import MyComponent, { someFunction } from "./MyComponent.js";
```

#### Refs不会被传递
虽然高阶组件的约定是将所有`props`传递给被包装组件，但这对于`refs`并不适用，那是因为`ref`实际上并不是一个`prop`，就像`key`一样，它是由`React`专门处理的。如果将`ref`添加到`HOC`的返回组件中，则`ref`引用指向容器组件，而不是被包装组件，这个问题可以通过`React.forwardRef`这个`API`明确地将`refs`转发到内部的组件。。

```
function logProps(Component) {
  class LogProps extends React.Component {
    componentDidUpdate(prevProps) {
      console.log('old props:', prevProps);
      console.log('new props:', this.props);
    }

    render() {
      const {forwardedRef, ...rest} = this.props;

      // 将自定义的 prop 属性 “forwardedRef” 定义为 ref
      return <Component ref={forwardedRef} {...rest} />;
    }
  }

  // 注意 React.forwardRef 回调的第二个参数 “ref”。
  // 我们可以将其作为常规 prop 属性传递给 LogProps，例如 “forwardedRef”
  // 然后它就可以被挂载到被 LogProps 包裹的子组件上。
  return React.forwardRef((props, ref) => {
    return <LogProps {...props} forwardedRef={ref} />;
  });
}
```

## Render Props
与`HOC`一样，`Render Props`也是一直以来都存在的元老级模式，`render props`指在一种`React`组件之间使用一个值为函数的`props`共享代码的简单技术，具有`render props`的组件接收一个函数，该函数返回一个`React`元素并调用它而不是实现一个自己的渲染逻辑，`render props`是一个用于告知组件需要渲染什么内容的函数`props`，也是组件逻辑复用的一种实现方式，简单来说就是在被复用的组件中，通过一个名为`render`(属性名也可以不是`render`，只要值是一个函数即可)的`prop`属性，该属性是一个函数，这个函数接受一个对象并返回一个子组件，会将这个函数参数中的对象作为`props`传入给新生成的组件，而在使用调用者组件这里，只需要决定这个组件在哪里渲染以及该以何种逻辑渲染并传入相关对象即可。  
对比`HOC`与`Render Props`，技术上，二者都基于组件组合机制，`Render Props`拥有与`HOC `一样的扩展能力，称之为`Render Props`，并不是说只能用来复用渲染逻辑，而是表示在这种模式下，组件是通过`render`()组合起来的，类似于`HOC `模式下通过`Wrapper`的`render`()建立组合关系形式上，二者非常相像，同样都会产生一层`Wrapper`，而实际上`Render Props `与`HOC `甚至能够相互转换。  
同样，`Render Props`也会存在一些问题: 
* 数据流向更直观了，子孙组件可以很明确地看到数据来源，但本质上`Render Props`是基于闭包实现的，大量地用于组件的复用将不可避免地引入了`callback hell`问题。
* 丢失了组件的上下文，因此没有`this.props`属性，不能像`HOC`那样访问`this.props.children`。

### 示例

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
        <h1>请在此处移动鼠标</h1>
        <p>当前鼠标的位置是: x:{this.props.mouse.x} y:{this.props.mouse.y}</p>
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
代码复用的解决方案层出不穷，但是整体来说代码复用还是很复杂的，这其中很大一部分原因在于细粒度代码复用不应该与组件复用捆绑在一起，`HOC`、`Render Props `等基于组件组合的方案，相当于先把要复用的逻辑包装成组件，再利用组件复用机制实现逻辑复用，自然就受限于组件复用，因而出现扩展能力受限、`Ref `隔断、`Wrapper Hell`等问题，那么我们就需要有一种简单直接的代码复用方式，函数，将可复用逻辑抽离成函数应该是最直接、成本最低的代码复用方式，但对于状态逻辑，仍然需要通过一些抽象模式(如`Observable`)才能实现复用，这正是`Hooks`的思路，将函数作为最小的代码复用单元，同时内置一些模式以简化状态逻辑的复用。比起上面提到的其它方案，`Hooks`让组件内逻辑复用不再与组件复用捆绑在一起，是真正在从下层去尝试解决(组件间)细粒度逻辑的复用问题此外，这种声明式逻辑复用方案将组件间的显式数据流与组合思想进一步延伸到了组件内。  
档案`Hooks`也并非完美，只是就目前而言，其缺点如下: 
* 额外的学习成本，主要在于`Functional Component`与`Class Component`之间的比较上。
* 写法上有限制(不能出现在条件、循环中)，并且写法限制增加了重构成本。
* 破坏了`PureComponent`、`React.memo`浅比较的性能优化效果，为了取最新的`props`和`state`，每次`render`()都要重新创建事件处函数。
* 在闭包场景可能会引用到旧的`state`、`props`值。
* 内部实现上不直观，依赖一份可变的全局状态，不再那么`pure`。
* `React.memo`并不能完全替代`shouldComponentUpdate`(因为拿不到`state change`，只针对`props change`)。
* `useState API`设计上不太完美。

### 示例

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
  const {useState, useEffect} = React;

  function useMouseLocation(location){
    return (
      <>
        <h1>请在此处移动鼠标</h1>
        <p>当前鼠标的位置是: x:{location.x} y:{location.y}</p>
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





## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

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