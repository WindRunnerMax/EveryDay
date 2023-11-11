# Synchronous and Asynchronous Scenarios of setState

In `React`, the `state` is accessed through `this.state` and can be updated using the `this.setState()` method. When the `this.setState()` method is called, `React` will re-invoke the `render` method to re-render the UI. Compared to the psychological burden required when using `Hooks` to complete the component, using `setState` is the psychological burden required when using `class` to complete the component. Of course, the so-called psychological burden might be more appropriately called the necessary basic knowledge.

## Description
`setState` is asynchronous only in synthetic events and lifecycle hook functions, and it is synchronous in native events. Let's simplify this with an example of a `React Class TS`.

```typescript
import React from "react";
import "./styles.css";

interface Props {}
interface State {
  count1: number;
  count2: number;
  count3: number;
}
export default class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      count1: 0,
      count2: 0,
      count3: 0
    };
  }

  incrementAsync = () => {
    console.log("incrementAsync before setState", this.state.count1);
    this.setState({
      count1: this.state.count1 + 1
    });
    console.log("incrementAsync after setState", this.state.count1);
  };
  incrementSync = () => {
    setTimeout(() => {
      console.log("incrementSync before setState", this.state.count2);
      this.setState({
        count2: this.state.count2 + 1
      });
      console.log("incrementSync after setState", this.state.count2);
    }, 0);
  };
  incrementAsyncFn = () => {
    console.log("incrementAsyncFn before setState", this.state.count3);
    this.setState(
      {
        count3: this.state.count3 + 1
      },
      () => {
        console.log("incrementAsyncFn after.1 setState", this.state.count3);
      }
    );
    this.setState(state => {
      console.log("incrementAsyncFn after.2 setState", state.count3);
      return {count3: state.count3};
    });
  };
  render() {
    return (
      <div>
        <button onClick={this.incrementAsync}>Async</button>
        <button onClick={this.incrementSync}>Sync</button>
        <button onClick={this.incrementAsyncFn}>Async Function Arg</button>
      </div>
    );
  }
}
```

Clicking these three buttons will produce the following output:

```typescript
incrementAsync before setState 0
incrementAsync after setState 0
incrementSync before setState 0
incrementSync after setState 1
incrementAsyncFn before setState 0
incrementAsyncFn after.2 setState 1
incrementAsyncFn after.1 setState 1
```

First, let's look at the result of `incrementAsync`. Here we can see that after calling `setState` in the synthetic event, `this.state` cannot immediately obtain the latest value.  
As for the result of `incrementSync`, when called in a non-synthetic event, `this.state` can immediately obtain the latest value, for example, when using `addEventListener`, `setTimeout`, `setInterval`, etc.  
Regarding the two results of `incrementAsyncFn`, first, for the result `after.2`, the latest value of `this.state` can also be obtained. If you need to calculate a new value based on the current `state`, you can do so by passing a function rather than an object, as the `setState` call is batched. Therefore, using a function can allow for chained updates, provided that they are based on one another. That is to say, the value of the `setState` function passed as a function is dependent on the previous `setState`. In the case of `after.1`, the second parameter of the `setState` function is a callback function. This allows for obtaining the latest value after the batch update is completed. As `after.2` also belongs to the functions that need to be called for batch updating, `after.1` will be executed after `after.2`.

## Principle
The main reason why `React` implements asynchronous behavior for `setState` is primarily for performance considerations. The asynchronous nature of `setState` does not mean that it is implemented with asynchronous code internally. In fact, the execution process and code itself are synchronous. It's just that the order of calls to synthetic events and lifecycle hooks before batch updating, causes the inability to immediately obtain the updated value in the synthetic events and lifecycle hooks. This forms what is known as asynchronous behavior. In reality, whether batch updating is performed is determined by the value of its internal `isBatchingUpdates`.  
`setState` relies on synthetic events, where synthetic events refer to `React` not directly binding `click` and other events to the `DOM`, but using event bubbling to bubble up to the top-level `DOM`, similar to event delegation. `React` then encapsulates the events for formal handling and execution. Speaking of synthetic events, let's return to `setState`. The batch update optimization for `setState` is also based on synthetic events. It batches all `setState` calls. If there are multiple `setState` calls for the same value, the batch update strategy of `setState` will override them and take the final execution. If multiple different values are `setState` simultaneously, they will be merged and updated in the batch. In native events, the value is updated immediately.  
Batch updating is adopted simply to improve performance. Not using batch updating would result in re-rendering the component every time the data is updated. For example, let's say we repeatedly update a value within a method.

```javascript
this.setState({ msg: 1 });
this.setState({ msg: 2 });
this.setState({ msg: 3 });
```

In reality, what we really want is just the final update. That is to say, the first three updates are redundant. We only need to render after all states have been modified, which can reduce some performance overhead. Another example is changing `N` states; in fact, only one `setState` is needed to update the `DOM` to the latest state. Even if we update multiple values.

```javascript
this.setState({ msg: 1 });
this.setState({ age: 2 });
this.setState({ name: 3 });
```

Here, although we make three modifications to three different states, `React` needs to render only once. After the batch update of `setState`, the values are merged, and the entire component's `DOM` is updated to the latest state. The specific originating state of the `setState` is irrelevant.  
Now, there's another question. It's true that batch updating is beneficial for performance. For instance, if both `Child` and `Parent` call `setState`, we don't need to re-render `Child` twice. However, we might wonder why it can't be done similarly to `Vue`. In `Vue`, after the value is updated, the `setter` is triggered, and then the update is processed. The update process in `Vue` is also asynchronous, and it deduplicates and updates at all triggered `Watcher` updates before updating the view. That is to say, `Vue` immediately modifies the value and then updates the view. In comparison to `React`, why can't `setState` updates be written to `this.state` immediately, without waiting for the coordination to finish, all while still implementing batch processing.  
Any solution has trade-offs. For `Vue`, it hijacks the data's `setter` process and uses direct assignment with `=`. Following the assignment, updating the view is a natural process. If, similar to `React`, the value hasn't changed after `=`, it would be counterintuitive. Although `Vue` updates the view by hijacking the `setter`, it is not impossible to achieve what `React` does. This is a trade-off in the solution adopted by `Vue`, and of course, this is just one possible reason. Making trade-offs is essential. In reality, it requires a comparison with `React` to see that `Vue` naturally will have its own solution trade-offs. Ultimately, it's a matter of the framework's design philosophy. Regarding the aforementioned question about immediately writing `setState` updates to `this.state` within the context of batch processing and not waiting for coordination to finish, `dan` provided two reasons. In summary, please refer to the complete English version in the `github issue` in the references.

### Ensuring Consistency of Internal Data
Even if the `state` is updated synchronously, the `props` are not. Before re-rendering the parent component, the `props` cannot be known. If this operation is executed synchronously, the batch processing will disappear. Now, the objects `state`, `props`, and `refs` provided by `React` are internally consistent. This means that if only these objects are used, it can be ensured that they reference a fully coordinated tree, even if it is an old version of the tree. When using only `state`, the synchronous refresh mode will work.

```javascript
console.log(this.state.value); // 0
this.setState({ value: this.state.value + 1 });
console.log(this.state.value); // 1
this.setState({ value: this.state.value + 1 });
console.log(this.state.value); // 2
```

However, if it is necessary to lift this state to be shared among several components, and hence move it to the parent, which means that `props` are involved in passing values, then the synchronous `setState` mode will have issues. At this point, the `state` is lifted to the parent component and the value is passed to the child component using `props`.

```javascript
console.log(this.props.value); // 0
this.props.onIncrement();
console.log(this.props.value); // 0
this.props.onIncrement();
console.log(this.props.value); // 0
```

This is because in this solution, `this.state` will be refreshed immediately, while `this.props` will not. Besides, we cannot refresh `this.props` immediately without re-rendering the parent object, which means we would have to abandon the batching strategy. There are even more subtle situations that illustrate how this breaks consistency, such as mixing data from `props` that has not been refreshed with data from `state` that is suggested to be refreshed immediately to create a new state. In `React`, `this.state` and `this.props` are updated only after coordination and refresh, so you will see `0` printed both before and after refactoring. This ensures that lifting state is safe. In some cases, this may be inconvenient, especially for those from a more `OO` background who just want to change the state multiple times without considering how to represent a complete state update in one place. I can understand this, although I do believe that keeping the update of states centralized is clearer from a debugging perspective. In conclusion, the `React` model does not always produce the most concise code, but it is internally consistent and ensures that lifting state is safe.

### Enabling Concurrent Updates
Conceptually, the behavior of `React` is as if each component has an update queue. The premise of our discussion here on whether to refresh the `state` synchronously is that the default updating order follows a specific sequence, but updating components in the default order might change in future versions of `React`. For now, we have been discussing asynchronous rendering, and I admit that we have not explained well what that means, but that's the nature of development: you pursue an idea that seems promising in concept, but it's not until you've spent enough time that you truly understand its implications.
For this reason, it's a direction in which `React` is evolving. One way we've been explaining asynchronous rendering is that `React` can assign different priorities to `setState()` calls based on their source: event handlers, network responses, animations, etc. For example, if you're typing right now, the `TextBox` component needs real-time refresh, but when a message arrives while you're typing, it might delay rendering the message until a certain threshold, rather than causing lag in input due to blocking the thread. If we give certain updates a lower priority, we can split their rendering into small blocks of a few milliseconds, so users won't notice them. Asynchronous rendering is not just a performance optimization, we believe it's a fundamental transformation of what `React` can do. For example, consider navigating from one screen to another. Usually, a navigator is displayed while rendering the new screen, but if the navigation is fast enough, flashing and immediately hiding the navigator will degrade the user experience. What's worse is if multiple levels of components have different asynchronous dependencies, such as data, code, images, etc., you end up with a series of brief flashing navigators. Due to all the DOM reflows, this is both visually unpleasant and slows down your application in practice. If we start rendering the updated view in the background when you perform a simple `setState()` to present a different view, we can start rendering the new version of the view in the background. If you don't write any coordination code yourself, you can choose to show the navigator when the update takes longer than a certain threshold, otherwise let `React` seamlessly transform the entire new subtree's asynchronous dependencies into a satisfactory state. Note that this is only possible because `this.state` is not refreshed immediately. If it were, we wouldn't be able to start rendering the new version of the view in the background while the old version is still visible and interactive, and their independent state updates would conflict. 

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://www.jianshu.com/p/cc12e9a8052c
https://juejin.cn/post/6844903636749778958
https://zh-hans.reactjs.org/docs/faq-state.html
https://blog.csdn.net/zz_jesse/article/details/118282921
https://blog.csdn.net/weixin_44874595/article/details/104270057
https://github.com/facebook/react/issues/11527#issuecomment-360199710
```