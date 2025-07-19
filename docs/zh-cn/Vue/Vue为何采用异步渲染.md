
# Vue为何采用异步渲染
`Vue`在更新`DOM`时是异步执行的，只要侦听到数据变化，`Vue`将开启一个队列，并缓冲在同一事件循环中发生的所有数据变更，如果同一个`watcher`被多次触发，只会被推入到队列中一次，这种在缓冲时去除重复数据对于避免不必要的计算和`DOM`操作是非常重要的。然后，在下一个的事件循环`tick`中，`Vue`刷新队列并执行实际(已去重的)工作，`Vue`在内部对异步队列尝试使用原生的`Promise.then`、`MutationObserver`和`setImmediate`，如果执行环境不支持，则会采用`setTimeout(fn, 0)`代替。


## 描述
对于`Vue`为何采用异步渲染，简单来说就是为了提升性能，因为不采用异步更新，在每次更新数据都会对当前组件进行重新渲染，为了性能考虑，`Vue`会在本轮数据更新后，再去异步更新视图，举个例子，让我们在一个方法内重复更新一个值。

```javascript
this.msg = 1;
this.msg = 2;
this.msg = 3;
```

事实上，我们真正想要的其实只是最后一次更新而已，也就是说前三次`DOM`更新都是可以省略的，我们只需要等所有状态都修改好了之后再进行渲染就可以减少一些性能损耗。 

对于渲染方面的问题是很明确的，最终只渲染一次肯定比修改之后即渲染所耗费的性能少，在这里我们还需要考虑一下异步更新队列的相关问题，假设我们现在是进行了相关处理使得每次更新数据只进行一次真实`DOM`渲染，来让我们考虑异步更新队列的性能优化。  

假设这里是同步更新队列，`this.msg=1`，大致会发生这些事: `msg`值更新 `->` 触发`setter` `->` 触发`Watcher`的`update` `->` 重新调用 `render` `->` 生成新的`vdom -> dom-diff -> dom`更新。这里的`dom`更新并不是渲染(即布局、绘制、合成等一系列步骤)，而是更新内存中的`DOM`树结构，之后再运行`this.msg=2`，再重复上述步骤，之后的第`3`次更新同样会触发相同的流程。等开始渲染的时候，最新的`DOM`树中确实只会存在更新完成`3`，从这里来看，前`2`次对`msg`的操作以及`Vue`内部对它的处理都是无用的操作，可以进行优化处理。 

如果是异步更新队列，会是下面的情况，运行`this.msg=1`，并不是立即进行上面的流程，而是将对`msg`有依赖的`Watcher`都保存在队列中。该队列可能这样`[Watcher1, Watcher2...]`，当运行`this.msg=2`后，同样是将对`msg`有依赖的`Watcher`保存到队列中，`Vue`内部会做去重判断，这次操作后，可以认为队列数据没有发生变化，第`3`次更新也是上面的过程。当然，你不可能只对`msg`有操作，你可能对该组件中的另一个属性也有操作，比如`this.otherMsg=othermessage`，同样会把对`otherMsg`有依赖的`Watcher`添加到异步更新队列中。

因为有重复判断操作，这个`Watcher`也只会在队列中存在一次，本次异步任务执行结束后，会进入下一个任务执行流程。其实就是遍历异步更新队列中的每一个`Watcher`，触发其`update`，然后进行重新调用`render` `->` `new vdom` `->` `dom-diff` `->` `dom`更新等流程。但是这种方式和同步更新队列相比，不管操作多少次`msg`，` Vue`在内部只会进行一次重新调用真实更新流程。所以，对于异步更新队列不是节省了渲染成本，而是节省了`Vue`内部计算及`DOM`树操作的成本，不管采用哪种方式，渲染确实只有一次。  

此外，组件内部实际使用`VirtualDOM`进行渲染，也就是说，组件内部其实是不关心哪个状态发生了变化，它只需要计算一次就可以得知哪些节点需要更新，也就是说，如果更改了`N`个状态，其实只需要发送一个信号就可以将`DOM`更新到最新，如果我们更新多个值。  

```javascript
this.msg = 1;
this.age = 2;
this.name = 3;
```
此处我们分三次修改了三种状态，但其实`Vue`只会渲染一次，因为`VIrtualDOM`只需要一次就可以将整个组件的`DOM`更新到最新，它根本不会关心这个更新的信号到底是从哪个具体的状态发出来的。  

而为了达到这个目的，我们需要将渲染操作推迟到所有的状态都修改完成，为了做到这一点只需要将渲染操作推迟到本轮事件循环的最后或者下一轮事件循环。也就是说，只需要在本轮事件循环的最后，等前面更新状态的语句都执行完之后，执行一次渲染操作，它就可以无视前面各种更新状态的语法，无论前面写了多少条更新状态的语句，只在最后渲染一次就可以了。  

将渲染推迟到本轮事件循环的最后执行渲染的时机会比推迟到下一轮快很多，所以`Vue`优先将渲染操作推迟到本轮事件循环的最后，如果执行环境不支持会降级到下一轮，`Vue`的变化侦测机制(`setter`)决定了它必然会在每次状态发生变化时都会发出渲染的信号。但`Vue`会在收到信号之后检查队列中是否已经存在这个任务，保证队列中不会有重复，如果队列中不存在则将渲染操作添加到队列中，之后通过异步的方式延迟执行队列中的所有渲染的操作并清空队列。当同一轮事件循环中反复修改状态时，并不会反复向队列中添加相同的渲染操作，所以我们在使用`Vue`时，修改状态后更新`DOM`都是异步的。 

当数据变化后会调用`notify`方法，将`watcher`遍历，调用`update`方法通知`watcher`进行更新，这时候`watcher`并不会立即去执行，在`update`中会调用`queueWatcher`方法将`watcher`放到了一个队列里，在`queueWatcher`会根据`watcher`的进行去重，若多个属性依赖一个`watcher`，则如果队列中没有该`watcher`就会将该`watcher`添加到队列中。然后便会在`$nextTick`方法的执行队列中加入一个`flushSchedulerQueue`方法(这个方法将会触发在缓冲队列的所有回调的执行)，之后将`$nextTick`方法的回调加入`$nextTick`方法中维护的执行队列，`flushSchedulerQueue`中开始会触发一个`before`的方法，其实就是`beforeUpdate`，然后`watcher.run()`才开始真正执行`watcher`，执行完页面就渲染完成，更新完成后会调用`updated`钩子。

## $nextTick
在上文中谈到了对于`Vue`为何采用异步渲染，假如此时我们有一个需求，需要在页面渲染完成后取得页面的`DOM`元素，而由于渲染是异步的，我们不能直接在定义的方法中同步取得这个值的，于是就有了`vm.$nextTick`方法。`Vue`中`$nextTick`方法将回调延迟到下次`DOM`更新循环之后执行，也就是在下次`DOM`更新循环结束之后执行延迟回调，在修改数据之后立即使用这个方法，能够获取更新后的`DOM`。简单来说就是当数据更新时，在`DOM`中渲染完成后，执行回调函数。  

通过一个简单的例子来演示`$nextTick`方法的作用，首先需要知道`Vue`在更新`DOM`时是异步执行的，也就是说在更新数据时其不会阻塞代码的执行，直到执行栈中代码执行结束之后，才开始执行异步任务队列的代码。所以在数据更新时，组件不会立即渲染，此时在获取到`DOM`结构后取得的值依然是旧的值，而在`$nextTick`方法中设定的回调函数会在组件渲染完成之后执行，取得`DOM`结构后取得的值便是新的值。

```html
<!DOCTYPE html>
<html>
<head>
    <title>Vue</title>
</head>
<body>
    <div id="app"></div>
</body>
<script src="https://cdn.bootcss.com/vue/2.4.2/vue.js"></script>
<script type="text/javascript">
    var vm = new Vue({
        el: '#app',
        data: {
            msg: 'Vue'
        },
        template:`
            <div>
                <div ref="msgElement">{{msg}}</div>
                <button @click="updateMsg">updateMsg</button>
            </div>
        `,
        methods:{
            updateMsg: function(){
                this.msg = "Update";
                console.log("DOM未更新：", this.$refs.msgElement.innerHTML)
                this.$nextTick(() => {
                    console.log("DOM已更新：", this.$refs.msgElement.innerHTML)
                })
            }
        },
        
    })
</script>
</html>
```

## 异步机制
官方文档中说明，`Vue`在更新`DOM`时是异步执行的，只要侦听到数据变化，`Vue`将开启一个队列，并缓冲在同一事件循环中发生的所有数据变更，如果同一个`watcher`被多次触发，只会被推入到队列中一次。这种在缓冲时去除重复数据对于避免不必要的计算和`DOM`操作是非常重要的。然后，在下一个的事件循环`tick`中，`Vue`刷新队列并执行实际工作。`Vue`在内部对异步队列尝试使用原生的`Promise.then`、`MutationObserver`和`setImmediate`，如果执行环境不支持，则会采用 `setTimeout(fn, 0)`代替。  

`Js`是单线程的，其引入了同步阻塞与异步非阻塞的执行模式，在`Js`异步模式中维护了一个`Event Loop`，`Event Loop`是一个执行模型，在不同的地方有不同的实现，浏览器和`NodeJS`基于不同的技术实现了各自的`Event Loop`。浏览器的`Event Loop`是在`HTML5`的规范中明确定义，`NodeJS`的`Event Loop`是基于`libuv`实现的。  

在浏览器中的`Event Loop`由执行栈`Execution Stack`、后台线程`Background Threads`、宏队列`Macrotask Queue`、微队列`Microtask Queue`组成。  

* 执行栈就是在主线程执行同步任务的数据结构，函数调用形成了一个由若干帧组成的栈。  
* 后台线程就是浏览器实现对于`setTimeout`、`setInterval`、`XMLHttpRequest`等等的执行线程。
* 宏队列，一些异步任务的回调会依次进入宏队列，等待后续被调用，包括`setTimeout`、`setInterval`、`setImmediate(Node)`、`requestAnimationFrame`、`UI rendering`、`I/O`等操作。
* 微队列，另一些异步任务的回调会依次进入微队列，等待后续调用，包括`Promise`、`process.nextTick(Node)`、`Object.observe`、`MutationObserver`等操作。  

当`JS`执行时，进行如下流程: 
1. 首先将执行栈中代码同步执行，将这些代码中异步任务加入后台线程中。
2. 执行栈中的同步代码执行完毕后，执行栈清空，并开始扫描微队列。
3. 取出微队列队首任务，放入执行栈中执行，此时微队列是进行了出队操作。
4. 当执行栈执行完成后，继续出队微队列任务并执行，直到微队列任务全部执行完毕。
5. 最后一个微队列任务出队并进入执行栈后微队列中任务为空，当执行栈任务完成后，开始扫面微队列为空，继续扫描宏队列任务，宏队列出队，放入执行栈中执行，执行完毕后继续扫描微队列为空则扫描宏队列，出队执行。
6. 不断往复`...`。

### 实例

```javascript
// Step 1
console.log(1);

// Step 2
setTimeout(() => {
  console.log(2);
  Promise.resolve().then(() => {
    console.log(3);
  });
}, 0);

// Step 3
new Promise((resolve, reject) => {
  console.log(4);
  resolve();
}).then(() => {
  console.log(5);
})

// Step 4
setTimeout(() => {
  console.log(6);
}, 0);

// Step 5
console.log(7);

// Step N
// ...

// Result
/*
  1
  4
  7
  5
  2
  3
  6
*/
```

**Step 1**
```javascript
// 执行栈 console
// 微队列 []
// 宏队列 []
console.log(1); // 1
```

**Step 2**
```javascript
// 执行栈 setTimeout
// 微队列 []
// 宏队列 [setTimeout1]
setTimeout(() => {
  console.log(2);
  Promise.resolve().then(() => {
    console.log(3);
  });
}, 0);
```

**Step 3**
```javascript
// 执行栈 Promise
// 微队列 [then1]
// 宏队列 [setTimeout1]
new Promise((resolve, reject) => {
  console.log(4); // 4 // Promise是个函数对象，此处是同步执行的 // 执行栈 Promise console
  resolve();
}).then(() => {
  console.log(5);
})
```

**Step 4**
```javascript
// 执行栈 setTimeout
// 微队列 [then1]
// 宏队列 [setTimeout1 setTimeout2]
setTimeout(() => {
  console.log(6);
}, 0);
```

**Step 5**
```javascript
// 执行栈 console
// 微队列 [then1]
// 宏队列 [setTimeout1 setTimeout2]
console.log(7); // 7
```

**Step 6**
```javascript
// 执行栈 then1
// 微队列 []
// 宏队列 [setTimeout1 setTimeout2]
console.log(5); // 5
```

**Step 7**
```javascript
// 执行栈 setTimeout1
// 微队列 [then2]
// 宏队列 [setTimeout2]
console.log(2); // 2
Promise.resolve().then(() => {
    console.log(3);
});
```

**Step 8**
```javascript
// 执行栈 then2
// 微队列 []
// 宏队列 [setTimeout2]
console.log(3); // 3
```

**Step 9**
```javascript
// 执行栈 setTimeout2
// 微队列 []
// 宏队列 []
console.log(6); // 6
```


### 分析
在了解异步任务的执行队列后，回到中`$nextTick`方法，当用户数据更新时，`Vue`将会维护一个缓冲队列。对于所有的更新数据将要进行的组件渲染与`DOM`操作进行一定的策略处理后加入缓冲队列，然后便会在`$nextTick`方法的执行队列中加入一个`flushSchedulerQueue`方法(这个方法将会触发在缓冲队列的所有回调的执行)，然后将`$nextTick`方法的回调加入`$nextTick`方法中维护的执行队列。

在异步挂载的执行队列触发时就会首先会首先执行`flushSchedulerQueue`方法来处理`DOM`渲染的任务，然后再去执行`$nextTick`方法构建的任务，这样就可以实现在`$nextTick`方法中取得已渲染完成的`DOM`结构。在测试的过程中发现了一个很有意思的现象，在上述例子中的加入两个按钮，在点击`updateMsg`按钮的结果是`3 2 1`，点击`updateMsgTest`按钮的运行结果是`2 3 1`。


```html
<!DOCTYPE html>
<html>
<head>
    <title>Vue</title>
</head>
<body>
    <div id="app"></div>
</body>
<script src="https://cdn.bootcss.com/vue/2.4.2/vue.js"></script>
<script type="text/javascript">
    var vm = new Vue({
        el: '#app',
        data: {
            msg: 'Vue'
        },
        template:`
            <div>
                <div ref="msgElement">{{msg}}</div>
                <button @click="updateMsg">updateMsg</button>
                <button @click="updateMsgTest">updateMsgTest</button>
            </div>
        `,
        methods:{
            updateMsg: function(){
                this.msg = "Update";
                setTimeout(() => console.log(1))
                Promise.resolve().then(() => console.log(2))
                this.$nextTick(() => {
                    console.log(3)
                })
            },
            updateMsgTest: function(){
                setTimeout(() => console.log(1))
                Promise.resolve().then(() => console.log(2))
                this.$nextTick(() => {
                    console.log(3)
                })
            }
        },
        
    })
</script>
</html>
```
这里假设运行环境中`Promise`对象是完全支持的，那么使用`setTimeout`是宏队列在最后执行这个是没有异议的，但是使用`$nextTick`方法以及自行定义的`Promise`实例是有执行顺序的问题的，虽然都是微队列任务，但是在`Vue`中具体实现的原因导致了执行顺序可能会有所不同。首先直接看一下`$nextTick`方法的源码，关键地方添加了注释，请注意这是`Vue2.4.2`版本的源码，在后期`$nextTick`方法可能有所变更。

```javascript
/**
 * Defer a task to execute it asynchronously.
 */
var nextTick = (function () {
  // 闭包 内部变量
  var callbacks = []; // 执行队列
  var pending = false; // 标识，用以判断在某个事件循环中是否为第一次加入，第一次加入的时候才触发异步执行的队列挂载
  var timerFunc; // 以何种方法执行挂载异步执行队列，这里假设Promise是完全支持的

  function nextTickHandler () { // 异步挂载的执行任务，触发时就已经正式准备开始执行异步任务了
    pending = false; // 标识置false
    var copies = callbacks.slice(0); // 创建副本
    callbacks.length = 0; // 执行队列置空
    for (var i = 0; i < copies.length; i++) {
      copies[i](); // 执行
    }
  }

  // the nextTick behavior leverages the microtask queue, which can be accessed
  // via either native Promise.then or MutationObserver.
  // MutationObserver has wider support, however it is seriously bugged in
  // UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. It
  // completely stops working after triggering a few times... so, if native
  // Promise is available, we will use it:
  /* istanbul ignore if */
  if (typeof Promise !== 'undefined' && isNative(Promise)) {
    var p = Promise.resolve();
    var logError = function (err) { console.error(err); };
    timerFunc = function () {
      p.then(nextTickHandler).catch(logError); // 挂载异步任务队列
      // in problematic UIWebViews, Promise.then doesn't completely break, but
      // it can get stuck in a weird state where callbacks are pushed into the
      // microtask queue but the queue isn't being flushed, until the browser
      // needs to do some other work, e.g. handle a timer. Therefore we can
      // "force" the microtask queue to be flushed by adding an empty timer.
      if (isIOS) { setTimeout(noop); }
    };
  } else if (typeof MutationObserver !== 'undefined' && (
    isNative(MutationObserver) ||
    // PhantomJS and iOS 7.x
    MutationObserver.toString() === '[object MutationObserverConstructor]'
  )) {
    // use MutationObserver where native Promise is not available,
    // e.g. PhantomJS IE11, iOS7, Android 4.4
    var counter = 1;
    var observer = new MutationObserver(nextTickHandler);
    var textNode = document.createTextNode(String(counter));
    observer.observe(textNode, {
      characterData: true
    });
    timerFunc = function () {
      counter = (counter + 1) % 2;
      textNode.data = String(counter);
    };
  } else {
    // fallback to setTimeout
    /* istanbul ignore next */
    timerFunc = function () {
      setTimeout(nextTickHandler, 0);
    };
  }

  return function queueNextTick (cb, ctx) { // nextTick方法真正导出的方法
    var _resolve;
    callbacks.push(function () { // 添加到执行队列中 并加入异常处理
      if (cb) {
        try {
          cb.call(ctx);
        } catch (e) {
          handleError(e, ctx, 'nextTick');
        }
      } else if (_resolve) {
        _resolve(ctx);
      }
    });
    //判断在当前事件循环中是否为第一次加入，若是第一次加入则置标识为true并执行timerFunc函数用以挂载执行队列到Promise
    // 这个标识在执行队列中的任务将要执行时便置为false并创建执行队列的副本去运行执行队列中的任务，参见nextTickHandler函数的实现
    // 在当前事件循环中置标识true并挂载，然后再次调用nextTick方法时只是将任务加入到执行队列中，直到挂载的异步任务触发，便置标识为false然后执行任务，再次调用nextTick方法时就是同样的执行方式然后不断如此往复
    if (!pending) { 
      pending = true;
      timerFunc();
    }
    if (!cb && typeof Promise !== 'undefined') {
      return new Promise(function (resolve, reject) {
        _resolve = resolve;
      })
    }
  }
})();
```

回到刚才提出的问题上，在更新`DOM`操作时会先触发`$nextTick`方法的回调，解决这个问题的关键在于谁先将异步任务挂载到`Promise`对象上。  

首先对有数据更新的`updateMsg`按钮触发的方法进行`debug`，断点设置在`Vue.js`的`715`行，版本为`2.4.2`，在查看调用栈以及传入的参数时可以观察到第一次执行`$nextTick`方法的其实是由于数据更新而调用的`nextTick(flushSchedulerQueue);`语句，也就是说在执行`this.msg = "Update";`的时候就已经触发了第一次的`$nextTick`方法。

此时在`$nextTick`方法中的任务队列会首先将`flushSchedulerQueue`方法加入队列并挂载`$nextTick`方法的执行队列到`Promise`对象上，然后才是自行自定义的`Promise.resolve().then(() => console.log(2))`语句的挂载，当执行微任务队列中的任务时，首先会执行第一个挂载到`Promise`的任务，此时这个任务是运行执行队列。这个队列中有两个方法，首先会运行`flushSchedulerQueue`方法去触发组件的`DOM`渲染操作，然后再执行`console.log(3)`，然后执行第二个微队列的任务也就是`() => console.log(2)`，此时微任务队列清空，然后再去宏任务队列执行`console.log(1)`。  

接下来对于没有数据更新的`updateMsgTest`按钮触发的方法进行`debug`，断点设置在同样的位置，此时没有数据更新，那么第一次触发`$nextTick`方法的是自行定义的回调函数，那么此时`$nextTick`方法的执行队列才会被挂载到`Promise`对象上。很显然在此之前自行定义的输出`2`的`Promise`回调已经被挂载，那么对于这个按钮绑定的方法的执行流程便是首先执行`console.log(2)`，然后执行`$nextTick`方法闭包的执行队列，此时执行队列中只有一个回调函数`console.log(3)`，此时微任务队列清空，然后再去宏任务队列执行`console.log(1)`。  

简单来说就是谁先挂载`Promise`对象的问题，在调用`$nextTick`方法时就会将其闭包内部维护的执行队列挂载到`Promise`对象，在数据更新时`Vue`内部首先就会执行`$nextTick`方法，之后便将执行队列挂载到了`Promise`对象上。其实在明白`Js`的`Event Loop`模型后，将数据更新也看做一个`$nextTick`方法的调用，并且明白`$nextTick`方法会一次性执行所有推入的回调，就可以明白其执行顺序的问题了，下面是一个关于`$nextTick`方法的最小化的`DEMO`。


```javascript
var nextTick = (function(){

    var pending = false;
    const callback = [];
    var p = Promise.resolve();

    var handler = function(){
        pending = true;
        callback.forEach(fn => fn());
    }

    var timerFunc = function(){
        p.then(handler);
    }

    return function queueNextTick(fn){
        callback.push(() => fn());
        if(!pending){
            pending = true;
            timerFunc();
        }
    }

})();


(function(){
    nextTick(() => console.log("触发DOM渲染队列的方法")); // 注释 / 取消注释 来查看效果
    setTimeout(() => console.log(1))
    Promise.resolve().then(() => console.log(2))
    nextTick(() => {
        console.log(3)
    })
})();
```


## 每日一题

- <https://github.com/WindRunnerMax/EveryDay>

## 参考

- <https://zhuanlan.zhihu.com/p/29631893>
- <https://github.com/berwin/Blog/issues/22>
- <https://juejin.cn/post/6899822303022956552>
- <https://segmentfault.com/a/1190000015698196>
- <https://cn.vuejs.org/v2/guide/reactivity.html>
- <https://blog.csdn.net/weixin_46396187/article/details/107462329>
