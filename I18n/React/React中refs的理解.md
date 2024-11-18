# Understanding `refs` in React
`Refs` offer a way to access `DOM` nodes or `React` elements created in the `render` method.

## Description
In a typical `React` data flow, `props` are the only way for a parent component to interact with a child component. To modify a child component, you need to re-render it with new `props`. However, in some cases, you may need to forcefully modify a child component outside of the typical data flow. The modified child component could be an instance of a `React` component or a `DOM` element, and `React` provides solutions for both of these scenarios.  
Avoid using `refs` to perform anything that can be achieved declaratively. Typically, do not rely on `refs` when `props` and `state` can be used. However, there are several scenarios where using `refs` is appropriate:
* Managing focus, text selection, or media playback.
* Triggering imperative animations.
* Integrating third-party `DOM` libraries.

## Usage
The `ref` property provided by `React` represents a reference to the actual instance of the component returned by `ReactDOM.render()`. It is important to differentiate between rendering a component and rendering a native `DOM` element. When rendering a component, the returned value is the component instance, while rendering a `DOM` element returns a specific `DOM` node. `React` provides three ways to use `ref`.

### String
The `ref` can be directly set as a string value, but this approach is not recommended and may not be supported in future versions of `React`. This is mainly due to some issues caused by using strings. For example, when `ref` is defined as a string, `React` needs to track the currently rendering component. During the reconciliation phase, the process of creating and updating `React Element`, the `ref` will be encapsulated as a closure function and will be executed during the commit phase. This may have some impact on `React` performance.

```jsx
class InputOne extends React.Component {
    componentDidMount() {
        this.refs.inputRef.value = 1;
    }
    render() {
        return <input ref="inputRef" />;
    }
}
```

### Callback
`React` allows adding a special property to any component, and the `ref` property accepts a callback function that is executed immediately when the component is loaded or unloaded.
* When adding the `ref` property to an `HTML` element, the `ref` callback receives the underlying `DOM` element as a parameter.
* When adding the `ref` property to a component, the `ref` callback receives the current component instance as a parameter.
* When the component is unmounted, `null` is passed in.
* The `ref` callback is executed before lifecycle callbacks such as `componentDidMount` or `componentDidUpdate`.

We often use `Callback Ref` in the form of an inline function, which is re-created on every render. Since `React` cleans up the old `ref` and sets a new one, it will be called twice during the update, first with `null`. If there is business logic in the `Callback`, it may cause errors. This can be avoided by defining the `Callback` as a class member function and then binding it.

```jsx
class InputTwo extends React.Component {
    componentDidMount() {
        this.inputRef.value = 2;
    }
    render() {
        return <input ref={(element) => this.inputRef = element} />;
    }
}
```

### API Creation
In `React v16.3`, the new `React.createRef` API was introduced through the `0017-new-create-ref` proposal. When the `ref` is passed to an element in the `render`, a reference to that node can be accessed in the `ref`'s `current` property. The value of the `ref` differs based on the type of node:
* When the `ref` property is used for an `HTML` element, the `ref` created using `React.createRef()` in the constructor receives the underlying `DOM` element as its `current` property.
* When the `ref` property is used for a custom `class` component, the `ref` object receives the mounting instance of the component as its `current` property.
* The `ref` property cannot be used on function components because they do not have instances.

Comparing `CreateRef` with `Callback Ref`, there is no overwhelming advantage; it is just meant to be a convenient feature. There may be a slight performance advantage with `CreateRef` as `Callback Ref` adopts the pattern of allocating `ref` in the closure function during the component render process, while `CreateRef` adopts the `Object Ref`.

```jsx
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



## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://zhuanlan.zhihu.com/p/40462264
https://www.jianshu.com/p/4e2357ea1ba1
https://juejin.cn/post/6844903809274085389
https://juejin.cn/post/6844904048882106375
https://segmentfault.com/a/1190000008665915
https://zh-hans.reactjs.org/docs/refs-and-the-dom.html
```