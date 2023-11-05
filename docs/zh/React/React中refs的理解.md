# React中refs的理解
`Refs`提供了一种方式，允许我们访问`DOM`节点或在`render`方法中创建的`React`元素。

## 描述
在典型的`React`数据流中，`props`是父组件与子组件交互的唯一方式，要修改一个子组件，你需要使用新的`props`来重新渲染它，但是在某些情况下，你需要在典型数据流之外强制修改子组件，被修改的子组件可能是一个`React`组件的实例，也可能是一个`DOM`元素，对于这两种情况`React`都提供了解决办法。  
避免使用`refs`来做任何可以通过声明式实现来完成的事情，通常在可以使用`props`与`state`的情况下勿依赖`refs`，下面是几个适合使用`refs`的情况:
* 管理焦点、文本选择或媒体播放。
* 触发强制动画。
* 集成第三方`DOM`库。

## 使用
`React`提供的这个`ref`属性，表示为对组件真正实例的引用，其实就是`ReactDOM.render()`返回的组件实例，需要区分一下渲染组件与渲染原生`DOM`元素，渲染组件时返回的是组件实例，而渲染`DOM`元素时，返回是具体的`DOM`节点，`React`的`ref`有`3`种用法。

### 字符串
`ref`可以直接设置为字符串值，这种方式基本不推荐使用，或者在未来的`React`版本中不会再支持该方式。这主要是因为使用字符串导致的一些问题，例如当`ref`定义为`string`时，需要`React`追踪当前正在渲染的组件，在`reconciliation`阶段，`React Element`创建和更新的过程中，`ref`会被封装为一个闭包函数，等待`commit`阶段被执行，这会对`React`的性能产生一些影响等。


```
class InputOne extends React.Component {
    componentDidMount() {
        this.refs.inputRef.value = 1;
      }
    render() {
        return <input ref="inputRef" />;
    }
}
```

### 回调
`React`支持给任意组件添加特殊属性，`ref`属性接受一个回调函数，其在组件被加载或卸载时会立即执行。
* 当给`HTML`元素添加`ref`属性时，`ref`回调接收了底层的`DOM`元素作为参数。
* 当给组件添加`ref`属性时，`ref`回调接收当前组件实例作为参数。
* 当组件卸载的时候，会传入`null`。
* `ref`回调会在`componentDidMount`或`componentDidUpdate`等生命周期回调之前执行。

`Callback Ref`我们通常会使用内联函数的形式，那么每次渲染都会重新创建，由于`React`会清理旧的`ref`然后设置新的，因此更新期间会调用两次，第一次为`null`，如果在`Callback`中带有业务逻辑的话，可能会出错，可以通过将`Callback`定义成类成员函数并进行绑定的方式避免。

```
class InputTwo extends React.Component {
    componentDidMount() {
        this.inputRef.value = 2;
      }
    render() {
        return <input ref={(element) =>this.inputRef = element} />;
    }
}
```

### API创建
在`React v16.3`中经`0017-new-create-ref`提案引入了新的`React.createRef`的`API`，当`ref`被传递给`render`中的元素时，对该节点的引用可以在`ref`的`current`属性中被访问，`ref`的值根据节点的类型而有所不同：
* 当`ref`属性用于`HTML`元素时，构造函数中使用`React.createRef()`创建的`ref`接收底层`DOM`元素作为其`current`属性。
* 当`ref`属性用于自定义`class`组件时，`ref`对象接收组件的挂载实例作为其`current`属性。
* 不能在函数组件上使用`ref`属性，因为他们没有实例。

对比新的`CreateRef`与`Callback Ref`，并没有压倒性的优势，只是希望成为一个便捷的特性，在性能上会会有微小的优势，`Callback Ref`采用了组件`Render`过程中在闭包函数中分配`ref`的模式，而`CreateRef`则采用了`Object Ref`。

```
class InputThree extends React.Component {
    constructor(props) {
        super(props);
        this.inputRef = React.createRef();
    }
    componentDidMount() {
        this.inputRef.current.value = 3;
    }
    render() {
        return <input ref={this.inputRef} />;
    }
}
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
    class InputOne extends React.Component {
        componentDidMount() {
            this.refs.inputRef.value = 1;
          }
        render() {
            return <input ref="inputRef" />;
        }
    }

    class InputTwo extends React.Component {
        componentDidMount() {
            this.inputRef.value = 2;
          }
        render() {
            return <input ref={(element) =>this.inputRef = element} />;
        }
    }

    class InputThree extends React.Component {
        constructor(props) {
            super(props);
            this.inputRef = React.createRef();
        }
        componentDidMount() {
            this.inputRef.current.value = 3;
        }
        render() {
            return <input ref={this.inputRef} />;
        }
    }
    

    var vm = ReactDOM.render(
        <>
            <InputOne />
            <InputTwo />
            <InputThree />
        </>,
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
https://zhuanlan.zhihu.com/p/40462264
https://www.jianshu.com/p/4e2357ea1ba1
https://juejin.cn/post/6844903809274085389
https://juejin.cn/post/6844904048882106375
https://segmentfault.com/a/1190000008665915
https://zh-hans.reactjs.org/docs/refs-and-the-dom.html
```

