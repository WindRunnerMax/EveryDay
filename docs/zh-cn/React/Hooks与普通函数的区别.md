# Hooks与普通函数的区别
在这里的`Hooks`具体指的是自定义`Hooks`，自定义的`Hooks`与我们定义的普通函数类似，都可以封装逻辑，以实现逻辑的复用。`Hooks`实际上是一种特殊的函数，而由于`Hooks`的特殊实现，他们之间也存在着一定的区别。


## 描述
在我开始学习`React Hooks`的时候，我就比较疑惑这个问题。首先看一下官方文档，在自定义`Hooks`的部分说明了，构建自己的`Hooks`可以让您将组件逻辑提取到可重用的函数中。如果仅仅是这样的话，那么我们也完全可以使用普通的函数来实现逻辑的复用，而没必要去使用`Hooks`了。    

当然在这里还是得先明确一点定义: 自定义`Hooks`就是很明确的定义了，其以`use`开头，内部可以调用其他的`Hooks`；在这里描述的的普通函数指的是我们平时写的抽离公共逻辑的函数，而不是在我们定义的普通函数中去调用其他`Hooks`这种方式。如果在普通函数中调用了其他`Hooks`，那么这个函数就不再是普通函数了，除了违反了`Hooks`的命名规则以外，那就完全是一个`Hooks`的定义了。  

实际上，`Coding`比较重要的两个概念是逻辑与数据，文档中提到的将组件逻辑提取到可重用的函数中，重要的是逻辑这两个字，而在两个组件中使用相同的自定义`Hooks`是不会共享`State`的。如果我们直接编写一个普通的函数，那么对于其数据是在所有调用者中共享的。因为其只是一个模块，当然前提是我们不会去`new`出一个新对象来保存状态，在这里只讨论最`plain`的调用方式，因为`Hooks`也是直接以非常`plain`的方式进行调用的。  
那么也就是说，如果我们使用`Hooks`的话，实际上由于可以调用`useState`、`useRef`等`Hooks`，从而获取了对于这个`Fiber`的访问方法，那么也就相当于我们可以将状态或者说数据存放于当前节点当中，而不是类似于普通函数在全局中共享。当然如果需要全局共享状态的话，状态管理方案是更好的选择，而不是全局变量。

## 示例
举一个例子，对于数据请求，我们通常会封装一个`request`函数，假如我们需要对这个函数做一层缓存，那么就会有逻辑与数据的复用，在逻辑方面我们抽离出的方法差距不大，而对于数据缓存复用方面在这里通过普通函数与自定义`Hooks`的实现便是不同的。

### 普通函数
在普通函数当中，其就是一个模块，因此其数据是在所有调用者中共享的，因此我们可以通过一个`Map`来存储数据，这样就可以实现数据的复用。在这里需要注意的是，如果我们的`url`需要实现在不同组件调用返回的数据不同的话，例如可能会有根据当前页面的`referer`请求头来决定返回数据的需求，那么这种全局共享的数据就不适用了，就需要多添加一个参数来区分不同的数据，这样就会导致逻辑与数据的耦合，因此这种方式不是很好。当然这也是基于特定需求的，在这里只是举一个例子，毕竟实际上适合的才是最好的。  

```js
const cache = new Map();
export fetch = (url) => {
  if (cache.has(url)) {
    return cache.get(url);
  }
  const promise = fetch(url);
  cache.set(url, promise);
  return promise;
}
```

### 自定义Hooks
在自定义`Hooks`当中，数据被锁定在了`Fiber`当中，也就是说数据的共享范围是在当前组件节点中，相对于全局状态共享来说粒度会更细一些。当然我们如果想直接在全局共享数据的话，这种方案就不合适了，可能还需要配合一个全局的状态管理才行。还是那句话，在这里只是举一个例子，毕竟实际上适合的才是最好的。  

```js
const useRequest = (url) => {
    const map = useRef(new Map());
    if (map.current.has(url)) {
        return map.current.get(url);
    }
    const promise = fetch(url);
    map.current.set(url, promise);
    return promise;
}
```

## 总结
简单总结一下两者的区别: 
* 官方提供的`Hooks`只应该在`React`函数组件/自定义`Hooks`内调用，而不应该在普通函数调用。
* 自定义`Hooks`能够调用诸如`useState`、`useRef`等，普通函数则不能。由此可以通过内置的`Hooks`获得`Fiber`的访问方式，可以实现在组件级别存储数据的方案等。
* 自定义`Hooks`需要以`use`开头，普通函数则没有这个限制。使用`use`开头并不是一个语法或者一个强制性的方案，更像是一个约定，就像是`GET`请求约定语义不携带`Body`一样，使用`use`开头的目的就是让`React`识别出来这是个`Hooks`，从而检查这些规则约束，通常也会使用`ESlint`配合`eslint-plugin-react-hooks`检查这些规则，从而提前避免错误的使用。

## 每日一题

- <https://github.com/WindRunnerMax/EveryDay>

## 参考

- <https://www.zhihu.com/question/491311403>
- <https://zh-hans.reactjs.org/docs/hooks-custom.html>
- <https://stackoverflow.com/questions/60133412/react-custom-hooks-vs-normal-functions-what-is-the-difference>
