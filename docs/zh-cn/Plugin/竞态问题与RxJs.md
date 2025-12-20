# 竞态问题与RxJs
竞态问题通常指的是在多线程的编程中，输入了相同的条件，但是会输出不确定的结果的情况。虽然`Js`是单线程语言，但由于引入了异步编程，所以也会存在竞态的问题，而使用`RxJs`通常就可以解决这个问题，其使得编写异步或基于回调的代码更容易。

## 竞态问题
前边提到了竞态问题通常指的是在多线程的编程中，输入了相同的条件，但是会输出不确定的结果的情况。发生这种情况的主要原因是，当多个线程都对一个共享变量有读取-修改的操作时，在某个线程读取共享变量之后，进行相关操作的时候，别的线程把这个变量给改了，从而导致结果出现了错误。在这里的多个线程中，起码有一个线程有更新操作，如果所有的线程都是读操作，那么就不存在什么竞态条件。

总体来说，最低是需要`thread1#load - thread2#update`这种的模式，当其中一个线程进行更新共享变量操作的时候，另一个线程不管是读取变量还是更新变量都容易出现错误，要么读取脏数据，要么丢失更新结果，通常会使用加锁或者原子操作的方式来消除竞态的影响。 

回到`Js`当中，虽然`Js`是单线程语言，但由于引入了异步编程，所以也会存在竞态的问题。举一个简单的例子，我们经常会发起网络请求，假如我们此时需要发起网络请求展示数据，输入`A`时弹出`B`，输入`B`时弹出`C`，要注意返回的数据都是需要通过网络发起请求来得到的，假设此时我们快速的输入了`A`又快速输入了`B`，如果网络完全没有波动的情况下，我们就可以正常按照顺序得到`B`、`C`的弹窗。

但是如果网络波动了呢，假设由于返回`B`的数据包正常在路上阻塞了，而`C`先返回来了，那么最后得到的执行顺序可能就是`C`、`B`的弹窗了。在这里只是一个顺序问题，如果我们做搜索的时候，更加希望的是展示输入的最后的值的搜索结果，那么按照上边的例，我们希望得到最后输入的那个字母的下一个字母，也就是顺序输入`AB`希望得到`C`，但是却也有可能得到`B`。

```javascript
const fetch = text => {
    if(!text) return Promise.resolve("");
    const response = String.fromCharCode(text[text.length - 1].charCodeAt(0) + 1);
    return new Promise(resolve => {
        setTimeout(resolve, Math.random() * 1000, response);
    })
}

// 模拟快速输入`A B`
// 输出时而 `B C` 时而 `C B`
// 如果不是打印而是将值写到页面上 那么页面显示就出现错误了 
fetch("A").then(console.log);
fetch("AB").then(console.log);
```

通常来说，对于这类需求，我们会在输入的时候加一个防抖函数，这样的话第一个输入就会被抹掉，这样在这里就不会造成快速输入的竞态问题了，这是属于从降低频率入手，尽量确保请求的有序。为什么说尽量呢，因为如果用户中间停顿了`300ms`也就是下边设置的值之后，再进行输入的话，依旧无法确保解决网络的原因造成的竞态问题，如果你把这个延时设置的非常大的话，那么就会造成用户最少等待`n ms`才能响应，用户体验并不好。

```javascript
const fetch = text => {
    if(!text) return Promise.resolve("");
    const response = String.fromCharCode(text[text.length - 1].charCodeAt(0) + 1);
    return new Promise(resolve => {
        setTimeout(resolve, Math.random() * 1000, response);
    })
}

const d = function(time, fn){
    let timer = null;
    return (...args) => {
        clearTimeout(timer);
        timer = null;
        timer = setTimeout(() => fn(...args), time);
    }
}

const request = param => {
    fetch(param).then(console.log);
}
const debouncedRequest = d(300, request);
debouncedRequest("A");
debouncedRequest("AB");
```

那么还有什么办法呢，或许我们也可以从确保顺序入手，请求携带一个标识，请求返回后根据标识判断是否渲染，这样的话就需要改动一下我们的`fetch`，把请求的参数也一并带上返回。这样看起来是完全解决了竞态的问题，但是似乎看起来并不是非常的漂亮，追求完美的同学可能会眉头一皱，觉得事情并不简单，这一段代码的执行结果依赖两个异步逻辑的彼此的执行顺序，而需要我们编写其他的代码去控制这个执行顺序，这个问题通常称作竞态危害。

```javascript
const fetch = param => {
    if(!param) return Promise.resolve({param, response: ""});
    const response = String.fromCharCode(param[param.length - 1].charCodeAt(0) + 1);
    return new Promise(resolve => {
        setTimeout(resolve, Math.random() * 1000, {param, response});
    })
}

let tag = "";
const request = param => {
    tag = param;
    fetch(param).then((res) => {
        if(res.param === tag) console.log(res.response);
    });
}
request("A");
request("AB");
```

当然还有很多其他的方案可以处理这个问题，例如输入节流输入后开始请求的时候加一个全局的`loading`遮罩层，来阻止服务响应之前用户继续输入，或者在进行第二次请求的时候，取消前一次的请求，类似于`useEffect`返回的函数，取消上次的副作用。  

对于请求取消的这个问题，并不是真的服务端收不到数据包了，只是说浏览器不处理这次请求的响应了，或者干脆我们自己直接本地不处理服务端的响应了。其实也很好理解，大部分情况下网络波动实际上是比较小的，当发起请求的时候数据包已经出去了，当进行取消操作的时候，假如我们的取消操作是发出去了一个包用来告诉服务器取消前一个请求，这个取消数据包大部分情况下是不能追上之前发出去的请求数据包的。

等这个数据包到的时候服务器都可能已经处理完了，所以实际上如果采用这个操作的话基本是个无效操作，由此现在的请求取消只是说浏览器取消了对于这个请求的响应处理而已，并不是服务器真的收不到数据了。

## RxJs
`RxJs`是`Reactive Extensions for JavaScript`的缩写，起源于`Reactive Extensions`，是一个基于可观测数据流`Stream`结合观察者模式和迭代器模式的一种异步编程的应用库，`RxJs`是`Reactive Extensions`在`JavaScript`上的实现。

其通过使用`Observable`序列来编写异步和基于事件的程序，提供了一个核心类型`Observable`，附属类型`Observer`、`Schedulers`、`Subjects`和受`[Array#extras]`启发的操作符`map`、`filter`、`reduce`、`every`等等，这些数组操作符可以把异步事件作为集合来处理。`RxJs`有中文文档`https://cn.rx.js.org/manual/overview.html`，可以定义函数在`https://rxviz.com/`中看到可视化的效果。    

在`RxJs`中用来解决异步事件管理的的基本概念是:    

* `Observable`: 可观察对象，表示一个概念，这个概念是一个可调用的未来值或事件的集合。
* `Observer`: 观察者，一个回调函数的集合，它知道如何去监听由`Observable`提供的值。
* `Subscription`: 订阅，表示`Observable`的执行，主要用于取消`Observable`的执行。
* `Operators`: 操作符，采用函数式编程风格的纯函数`pure function`，使用像`map`、`filter`、`concat`、`flatMap`等这样的操作符来处理集合。
* `Subject`: 主体，相当于`EventEmitter`，并且是将值或事件多路推送给多个`Observer`的唯一方式。
* `Schedulers`: 调度器，用来控制并发并且是中央集权的调度员，允许我们在发生计算时进行协调，例如`setTimeout`或`requestAnimationFrame`或其他。

`RxJs`上手还是比较费劲的，最直接的感受还是: 一看文章天花乱坠，一写代码啥也不会。在这里也仅仅是使用`RxJs`来处理上边我们提出的问题，要是想深入使用的话可以先看看文档。     

那么我们就用`RxJs`来解决一下最初的那个问题，可以看到代码非常简洁，在这里我们取了个巧，直接将`Observable.create`的`observer`暴露了出来，实际上因为是事件触发的，通常都会使用`Observable.fromEvent`来绑定事件，在这里演示我们是需要自己触发的事件了，也就是`runner.next`，这里最重要的一点就是借助了`switchMap`，他帮助我们管理了在流上的顺序，取消了上次回调的执行。在下边这个示例中，可以看到其只输出了`C`，达到了我们想要的效果。

```javascript
// 这块代码可以在`https://cn.rx.js.org/`的控制台直接运行
const fetch = text => {
    if(!text) return Promise.resolve("");
    const response = String.fromCharCode(text[text.length - 1].charCodeAt(0) + 1);
    return new Promise(resolve => {
        setTimeout(resolve, Math.random() * 1000, response);
    })
}

let runner;
const observable = Rx.Observable.create(observer => runner = observer);
observable
//   .debounceTime(300) // 可以加入防抖
  .switchMap(param => fetch(param))
  .subscribe(console.log);

runner.next("A");
runner.next("AB");
```


## 每日一题

- <https://github.com/WindRunnerMax/EveryDay/>

## 参考

- <https://cn.rx.js.org/>
- <https://zhuanlan.zhihu.com/p/104024245>
- <https://www.zhihu.com/question/324275662>
- <https://juejin.cn/post/6910943445569765384>
- <https://juejin.cn/post/6844904051046350862>
- <https://juejin.cn/post/7098287689618685966>
- <https://juejin.cn/post/6970710521104302110>
