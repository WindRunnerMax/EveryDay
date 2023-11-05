# useEffect与useLayoutEffect
`useEffect`与`useLayoutEffect`可以统称为`Effect Hook`，`Effect Hook`可以在函数组件中执行副作用操作，副作用是指函数或者表达式的行为依赖于外部环境，或者在这里可以理解为修改了某状态会对其他的状态造成影响，这个影响就是副作用,数据获取，设置订阅以及手动更改`React`组件中的`DOM`都属于副作用。

## useEffect
`useEffect Hook`可以看做 `componentDidMount`、`componentDidUpdate`和`componentWillUnmount`这三个生命周期函数的组合，但是使用多个`Effect`实现关注点分离，也就是说`useEffect`的粒度更低，可以将各个关注的位置分离处理副作用。  
既然是对`componentDidMount`、`componentDidUpdate`和`componentWillUnmount`这三个生命周期函数的组合，那么我们也可以使用`useEffect`将其分离，首先对于`componentDidMount`与`componentWillUnmount`，也就是想执行只运行一次的 `effect`(仅在组件挂载和卸载时执行)，由于不存在任何依赖，那么对于第二个参数就是一个空的数组。如果省略了第二个参数的话，那么在组件的初始化和更新都会执行，一般情况下是并不希望这样的，因为`Hooks`的设计，每次`setState`都会重新执行组件函数，这样的话副作用函数就会频繁执行，所以通常来说还是尽量不要省略第二个参数。回到生命周期，通常如果在组件建立时建立了一个定时器，那么我们希望在组件销毁的时候将定时器销毁来避免内存泄露，那么在`useEffect`中返回一个函数调用去关闭定时器即可，在这里我们的关注点可以集中在一起而不用再分开两个生命周期去写了。

```
import { useEffect, useState } from "react";
import "./styles.css";

export default function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log("Component is mounted");
    return () => console.log("Component is unmounted");
  }, []);

  useEffect(() => {
    console.log("Component is mounted or updated");
  })

  return (
    <div>
      <div>{count}</div>
      <button onClick={() => setCount(count + 1)}>count + 1</button>
    </div>
  );
}
```

对于`componentDidUpdate`，之前如果是写`class`组件实现相同的功能的话，就需要在这个生命周期中嵌入很多的逻辑，使用`useEffect`就可以将各个关注点分离，分别处理其副作用，当然如果依然需要解除诸如订阅或者定时器等，依旧可以返回一个处理函数来处理。

```
import { useEffect, useState } from "react";
import "./styles.css";

export default function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log("Count is updated");
    document.title = `count: ${count}`;
  }, [count]);

  return (
    <div>
      <div>{count}</div>
      <button onClick={() => setCount(count + 1)}>count + 1</button>
    </div>
  );
}
```

在文档中还指出请确保数组中包含了所有外部作用域中会随时间变化并且在`effect`中使用的变量，否则你的代码会引用到先前渲染中的旧变量。如果你传入了一个空数组`[]`，`effect`内部的`props`和`state`就会一直拥有其初始值。下面这个例子就会出现一个`bug`，在依赖数组中没有传递`count`，那么就会导致当`effect`执行时，创建的`effect`闭包会将`count`的值保存在该闭包当中，且初值为`0`，每隔一秒回调就会执行`setCount(0 + 1)`，因此`count`永远不会超过`1`，此时如果我们将`count`加入到依赖数组中便可解决这个问题。对于这个问题，`React`提供了一个`exhaustive-deps`的`ESLint`规则作为`eslint-plugin-react-hooks`包的一部分，它会帮助你找出无法一致地处理更新的组件。

```
import { useEffect, useState } from "react";
import "./styles.css";

export default function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1);
      console.log(count + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []); // `count` 没有被指定为依赖

  return (
    <div>
      <div>{count}</div>
      <button onClick={() => setCount(count + 1)}>count + 1</button>
    </div>
  );
}
```

看起来和`Vue`的`Watch`很像，但是又不尽然相同，语法上的区别主要就在于`useEffect`可以监控多个属性的变化，`Watch`不行，当然`Watch`可以通过间接的方式实现，但是思想方面是不同的，`Vue`是监听值的变化而`React`是用以处理副作用。提到这个的主要原因是因为之前写`Vue`较多，就老想着通过`Vue`的角度来类比`React`的各项实现，感觉这样有好处也有弊端，好处就是很快能够上手，坏处就是很容易钻牛角尖，或者很容易陷入一个围城。有位大佬说的挺好的，你需要把`Vue`忘掉再来学习`Hooks`，虽然并不绝对但也很有道理。  
当函数组件刷新渲染时，包含`useEffect`的组件整个运行过程如下：
* 触发组件重新渲染，通过改变组件`state`或者组件的父组件重新渲染，导致子节点渲染。
* 组件函数执行。
* 组件渲染后呈现到屏幕上。
* `useEffect hook`执行。

## useLayoutEffect
`useLayoutEffect`和`useEffect`很像，函数签名也是一样，唯一的不同点就是`useEffect`是异步执行，而`useLayoutEffect`是同步执行的。当函数组件刷新渲染时，包含`useLayoutEffect`的组件整个运行过程如下：
* 触发组件重新渲染，通过改变组件`state`或者组件的父组件重新渲染，导致子组件渲染。
* 组件函数执行。
* `useLayoutEffect hook`执行，`React`等待`useLayoutEffect`的函数执行完毕。
* 组件渲染后呈现到屏幕上。


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://zhuanlan.zhihu.com/p/348701319
https://zhuanlan.zhihu.com/p/259766064
https://segmentfault.com/a/1190000039087645
http://www.ptbird.cn/react-hoot-useEffect.html
https://react.docschina.org/docs/hooks-effect.html
https://pengfeixc.com/blog/605af93600f1525af762a725
https://react.docschina.org/docs/hooks-faq.html#is-it-safe-to-omit-functions-from-the-list-of-dependencies
```
