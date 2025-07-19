# setState同步异步场景
`React`通过`this.state`来访问`state`，通过`this.setState()`方法来更新`state`，当`this.setState()`方法被调用的时候，`React`会重新调用`render`方法来重新渲染`UI`。相比较于在使用`Hooks`完成组件下所需要的心智负担，`setState`就是在使用`class`完成组件下所需要的心智负担，当然所谓的心智负担也许叫做所必须的基础知识更加合适一些。

## 描述
`setState`只在合成事件和生命周期钩子函数中是异步的，而在原生事件中都是同步的，简单实现一个`React Class TS`例子。

```js
import React from "react";
import "./styles.css";

interface Props{}
interface State{
  count1: number;
  count2: number;
  count3: number;
}
export default class App extends React.Component<Props, State>{
  constructor(props: Props){
    super(props);
    this.state = {
      count1: 0,
      count2: 0,
      count3: 0
    }
  }
  
  incrementAsync = () => {
    console.log("incrementAsync before setState", this.state.count1);
    this.setState({
      count1: this.state.count1 + 1
    });
    console.log("incrementAsync after setState", this.state.count1);
  }
  incrementSync = () => {
    setTimeout(() => {
      console.log("incrementSync before setState", this.state.count2);
      this.setState({
        count2: this.state.count2 + 1
      });
      console.log("incrementSync after setState", this.state.count2);
    },0);
  }
  incrementAsyncFn = () => {
    console.log("incrementAsyncFn before setState", this.state.count3);
    this.setState({
        count3: this.state.count3 + 1
        },
        () => {
            console.log("incrementAsyncFn after.1 setState", this.state.count3);
        }
    );
    this.setState(state => {
      console.log("incrementAsyncFn after.2 setState", state.count3);
      return {count3: state.count3}
    });
  }
  render(){
    return <div>
      <button onClick={this.incrementAsync}>异步</button>
      <button onClick={this.incrementSync}>同步</button>
      <button onClick={this.incrementAsyncFn}>异步函数参数</button>
    </div>
  }
}
```

以此点击三个按钮的话，可以得到以下输出。

```
incrementAsync before setState 0
incrementAsync after setState 0
incrementSync before setState 0
incrementSync after setState 1
incrementAsyncFn before setState 0
incrementAsyncFn after.2 setState 1
incrementAsyncFn after.1 setState 1
```

首先看`incrementAsync`的结果，在这里我们可以看出，在合成事件调用`setState`之后，`this.state`是无法立即得到最新的值。  
对于`incrementSync`的结果，在非合成事件的调用时，`this.state`是可以立即得到最新的值的，例如使用`addEventListener`、`setTimeout`、`setInterval`等。  

对于`incrementAsyncFn`的两个结果，首先来说`after.2`的结果，对于`this.state`也是可以得到最新的值的，如果你需要基于当前的`state`来计算出新的值，那么就可以通过传递一个函数，而不是一个对象的方式来实现。因为`setState`的调用是分批的，所以通过传递函数可以链式地进行更新，当然前提是需要确保它们是一个建立在另一个之上的。也就是说传递函数的`setState`的值是依赖于上次一的`SetState`的，对于`after.1`的结果，`setState`函数的第二个参数是一个回调函数，在`setState`批量更新完成后可以拿到最新的值，而`after.2`也是属于批量更新需要调用的函数，所以`after.1`会在`after.2`后执行。

## 原理
`React`将其实现为异步的动机主要是性能的考量，`setState`的异步并不是说内部由异步代码实现，其实本身执行的过程和代码都是同步的，只是合成事件和生命周期钩子函数的调用顺序在批处理更新之前，导致在合成事件和生命周期钩子函数中没法立马拿到更新后的值，形式了所谓的异步，实际上是否进行批处理是由其内部的`isBatchingUpdates`的值来决定的。 

`setState`依赖于合成事件，合成事件指的是`React`并不是将`click`等事件直接绑定在`DOM`上面，而是采用事件冒泡的形式冒泡到顶层`DOM`上，类似于事件委托，然后`React`将事件封装给正式的函数处理运行和处理。说完了合成事件再回到`setState`，`setState`的批量更新优化也是建立在合成事件上的，其会将所有的`setState`进行批处理，如果对同一个值进行多次 `setState`，`setState`的批量更新策略会对其进行覆盖，取最后一次的执行，如果是同时`setState`多个不同的值，在更新时也会对其进行合并批量更新，而在原生事件中，值会立即进行更新。  

采用批量更新，简单来说就是为了提升性能，因为不采用批量更新，在每次更新数据都会对组件进行重新渲染，举个例子，让我们在一个方法内重复更新一个值。

```javascript
this.setState({ msg: 1 });
this.setState({ msg: 2 });
this.setState({ msg: 3 });
```
事实上，我们真正想要的其实只是最后一次更新而已，也就是说前三次更新都是可以省略的，我们只需要等所有状态都修改好了之后再进行渲染就可以减少一些性能损耗。还有一个例子，如果更改了`N`个状态，其实只需要一次`setState`就可以将`DOM`更新到最新，如果我们更新多个值。    

```javascript
this.setState({ msg: 1 });
this.setState({ age: 2 });
this.setState({ name: 3 });
```

此处我们分三次修改了三种状态，但其实`React`只需要渲染一次，在`setState`批处理之后会将其合并，并进行一次`re-render`就可以将整个组件的`DOM`更新到最新，根本不需要关心这个`setState`到底是从哪个具体的状态发出来的。

那么还有一个问题，首先我们可以认同进行批处理更新对我们的性能是有益的，例如`Child`和`Parent`都调用`setState`，我们不需要重新渲染`Child`两次。但是此时我们可能会想到一个问题，为什么不能如同`Vue`一样，`Vue`是在值更新之后触发`setter`然后进行更新，更新的过程同样也是采用异步渲染，也会将所有触发`Watcher`的`update`进行去重合并再去更新视图，也就是说`Vue`是立即修改了值，而后再去更新视图的。也就是说，相比较于`React`，为什么不能在同样做批处理的情况下，立即将`setState`更新写入`this.state`而不等待协调结束。   

任何一种解决方案都有权衡，对于`Vue`来说因为其是通过劫持了数据的`setter`过程，在使用的也是直接使用`=`直接赋值的，而在赋值之后进行视图的更新也是一个自然的过程，如果类似于`React`一样在`=`之后这个值依然没有变化，在直觉上是非常不符合常理的。虽然`Vue`是通过劫持`setter`实现的视图更新，但是做到如同`React`一样并不是不可能的，这是`Vue`采用的解决方案上的权衡，当然这只是可能的一个理由。说是问题的权衡，实际上还是需要对比`React`来看，对于`React`中要处理的问题，`Vue`自然会有自己解决方案的权衡，归根到底还是框架的设计哲学的问题。对于上面提出的在同样做批处理的情况下，立即将`setState`更新写入`this.state`而不等待协调结束的这个问题，`dan`给予了两个理由，在此简作总结，完整的英文版本还请看参考中的`github issue`。  

### 保证内部数据统一
即使`state`是同步更新的，但`props`是不会的，在重新渲染父组件之前，无法知道`props`，如果同步执行此操作，批处理就会消失。现在`React`提供的对象`state`、`props`、`refs`在内部是一致的。这意味着如果只使用这些对象，则可以保证它们引用完全协调的树，即使它是该树的旧版本。当仅使用`state`时，同步刷新的模式将起作用。

```javascript
console.log(this.state.value); // 0
this.setState({ value: this.state.value + 1 });
console.log(this.state.value); // 1
this.setState({ value: this.state.value + 1 });
console.log(this.state.value); // 2
```

但是，假设需要提升此状态以在几个组件之间共享，因此将其移动到父级，也就是说有`props`参与到了传值，那么同步`setState`模式就会有问题，此时将`state`提升到了父组件，利用`props`将值传导子组件。

```javascript
console.log(this.props.value); // 0
this.props.onIncrement();
console.log(this.props.value); // 0
this.props.onIncrement();
console.log(this.props.value); // 0
```

这是因为在这个解决方案中，`this.state`会立即刷新，而`this.props`不会，而且我们不能在不重新渲染父对象的情况下立即刷新`this.props`，这意味着我们将不得不放弃批处理的策略。还有更微妙的情况说明这如何破坏一致性的，例如这种方案正在混合来自`props`尚未刷新和`state`建议立即刷新的数据以创建新状态。在`React`中，`this.state`和`this.props`都只在协调和刷新之后更新，所以你会在`refactoring`之前和之后看到`0`被打印出来。

这使得提升状态安全。在某些情况下这可能会带来不便，特别是对于来自更多`OO`背景的人来说，他们只想多次改变状态，而不是考虑如何在一个地方表示完整的状态更新，我可以理解这一点，尽管我确实认为从调试的角度来看，保持状态更新的集中更加清晰。总而言之，`React`模型并不总是会产生最简洁的代码，但它在内部是一致的，并确保提升状态是安全的。

### 启用并发更新
从概念上讲`React`的行为就好像每个组件都有一个更新队列，我们在这里讨论是否同步刷新`state`有一个前提那就是我们默认更新节点是遵循特定的顺序的，但是按默认顺序更新组件在以后的`react`中可能就变了。对于现在我们一直在谈论的异步渲染，我承认我们在传达这意味着什么方面做得不是很好，但这就是研发的本质：你追求一个在概念上看起来很有前途的想法，但只有在花了足够的时间之后才能真正理解它的含义。  

对于这个理由，是`React`发展的一个方向。我们一直在解释异步渲染的一种方式是`React`可以根据`setState()`调用的来源分配不同的优先级：事件处理程序、网络响应、动画等。例如你现在正在打字，那么`TextBox`组件需要实时的刷新，但是当你在输入的时候，来了一个信息，这个时候可能让信息的渲染延迟到某个阈值，而不是因为阻塞线程而让输入卡顿。如果我们让某些更新具有较低优先级，我们可以将它们的渲染分成几毫秒的小块，这样用户就不会注意到它们。异步`rendering`不仅仅是性能上的优化，我们认为这是`React`组件模型可以做什么的根本性转变。

例如，考虑从一个屏幕导航到另一个屏幕的情况，通常会在渲染新屏幕时显示一个导航器，但是如果导航速度足够快，闪烁并立即隐藏导航器会导致用户体验下降，更糟糕的是如果有多个级别的组件具有不同的异步依赖项例如数据、代码、图像等，您最终会得到一连串短暂闪烁的导航器。由于所有的`DOM`重排，这既在视觉上令人不快，又使您的应用程序在实践中变慢。如果当您执行一个简单的`setState()`来呈现不同的视图时，我们可以开始在后台呈现更新后的视图。如果您自己不编写任何协调代码，您可以选择在更新时间超过某个阈值时显示导航器，否则当整个新子树的异步依赖项是时让`React`执行无缝转换使满意。请注意，这只是可能的，因为`this.state`不会立即刷新，如果它被立即刷新，我们将无法开始在后台渲染视图的新版本，而旧版本仍然可见且可交互，他们独立的状态更新会发生冲突。


## 每日一题

- <https://github.com/WindrunnerMax/EveryDay>

## 参考

- <https://www.jianshu.com/p/cc12e9a8052c>
- <https://juejin.cn/post/6844903636749778958>
- <https://zh-hans.reactjs.org/docs/faq-state.html>
- <https://blog.csdn.net/zz_jesse/article/details/118282921>
- <https://blog.csdn.net/weixin_44874595/article/details/104270057>
- <https://github.com/facebook/react/issues/11527#issuecomment-360199710>
