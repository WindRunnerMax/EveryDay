# React中diff算法的理解
`diff`算法用来计算出`Virtual DOM`中改变的部分，然后针对该部分进行`DOM`操作，而不用重新渲染整个页面，渲染整个`DOM`结构的过程中开销是很大的，需要浏览器对`DOM`结构进行重绘与回流，而`diff`算法能够使得操作过程中只更新修改的那部分`DOM`结构而不更新整个`DOM`，这样能够最小化操作`DOM`结构，能够最大程度上减少浏览器重绘与回流的规模。

## 虚拟DOM
`diff`算法的基础是`Virtual DOM`，`Virtual DOM`是一棵以`JavaScript`对象作为基础的树，在`React`中通常是通过`JSX`编译而成的，每一个节点称为`VNode`，用对象属性来描述节点，实际上它是一层对真实`DOM`的抽象，最终可以通过渲染操作使这棵树映射到真实环境上，简单来说`Virtual DOM`就是一个`Js`对象，用以描述整个文档。  
在浏览器中构建页面时需要使用`DOM`节点描述整个文档。

```html
<div class="root" name="root">
    <p>1</p>
    <div>11</div>
</div>
```

如果使用`Js`对象去描述上述的节点以及文档，那么便类似于下面的样子，当然这不是`React`中用以描述节点的对象，`React`中创建一个`React`元素的相关源码在`react/src/ReactElement.js`中，文中的`React`版本是`16.10.2`。

```javascript
{
    type: "div",
    props: {
        className: "root"
        name: "root",
        children: [{
            type: "p",
            props: {
                children: [{
                    type: "text",
                    props: {
                        text: "1"
                    }
                    
                }]
            }    
        },{
            type: "div",
            props: {
                children: [{
                    type: "text",
                    props: {
                        text: "11"
                    }
                }]
            }
        }]
    }
}
```

实际上在`React16`中启用了全新的架构`Fiber`，`Fiber`核心是实现了一个基于优先级和`requestIdleCallback`的循环任务调度算法，相关问题不在文章中讨论，相关的问题大致在于虚拟`DOM`由树结构转变成链表结构，原来的`VDOM`是一颗由上至下的树，通过深度优先遍历，层层递归直下，然而这个深度优先遍历最大的毛病在于不可中断，因此我们在`diff + patch`又或者是`Mount`巨大节点的时候，会造成较大的卡顿，`React16`的`VDOM`不再是一颗由上至下那么简单的树，而是链表形式的虚拟`DOM`，链表的每一个节点是`Fiber`，而不是在`16`之前的虚拟`DOM`节点，每个`Fiber`节点记录着诸多信息，以便走到某个节点的时候中断，`Fiber`的思路是把渲染/更新过程(递归`diff`)拆分成一系列小任务，每次检查树上的一小部分，做完看是否还有时间继续下一个任务，有的话继续，没有的话把自己挂起，主线程不忙的时候再继续。`Fiber`在`diff`阶段，做了如下的操作，实际相当于在`15`的`diff`算法阶段，做了优先级的任务调度控制。
* 把可中断的工作拆分成小任务。
* 对正在做的工作调整优先次序、重做、复用上次(未完成)工作。
* `diff`阶段任务调度优先级控制。

### 操作虚拟DOM与操作原生DOM的比较
在这里直接引用了尤大的话(`2016-02-08`年的回答，此时`Vue2.0`还未发布，`Vue2.0`于`2016-10-01`左右发布，`Vue2.0`才加入虚拟`DOM`)，相关链接为`https://www.zhihu.com/question/31809713`，建议结合链接中的问题阅读，也可以看看问题中比较的示例，另外下面的回答也都非常的精髓。

#### 原生 DOM 操作 vs 通过框架封装操作
这是一个性能`vs`可维护性的取舍，框架的意义在于为你掩盖底层的`DOM`操作，让你用更声明式的方式来描述你的目的，从而让你的代码更容易维护，没有任何框架可以比纯手动的优化`DOM`操作更快，因为框架的`DOM`操作层需要应对任何上层`API`可能产生的操作，它的实现必须是普适的，针对任何一个`benchmark`，我都可以写出比任何框架更快的手动优化，但是那有什么意义呢?在构建一个实际应用的时候，你难道为每一个地方都去做手动优化吗?出于可维护性的考虑，这显然不可能，框架给你的保证是，你在不需要手动优化的情况下，我依然可以给你提供过得去的性能。

#### 对 React 的 Virtual DOM 的误解
`React`从来没有说过`React`比原生操作`DOM`快，`React`的基本思维模式是每次有变动就整个重新渲染整个应用，如果没有`Virtual DOM`，简单来想就是直接重置`innerHTML`，很多人都没有意识到，在一个大型列表所有数据都变了的情况下，重置`innerHTML`其实是一个还算合理的操作，真正的问题是在全部重新渲染的思维模式下，即使只有一行数据变了，它也需要重置整个`innerHTML`，这时候显然就有大量的浪费。  
我们可以比较一下`innerHTML vs Virtual DOM`的重绘性能消耗：
* `innerHTML`: `render html string O(template size)` + 重新创建所有`DOM`元素`O(DOM size)`
* `Virtual DOM`: `render Virtual DOM + diff O(template size)` + 必要的`DOM`更新`O(DOM change)`。

`Virtual DOM render + diff`显然比渲染`html`字符串要慢，但是!它依然是纯`js`层面的计算，比起后面的`DOM`操作来说，依然便宜了太多，可以看到，`innerHTML`的总计算量不管是`js`计算还是`DOM`操作都是和整个界面的大小相关，但`Virtual DOM`的计算量里面，只有`js`计算和界面大小相关，`DOM`操作是和数据的变动量相关的，前面说了，和`DOM`操作比起来，`js`计算是极其便宜的，这才是为什么要有`Virtual DOM:`它保证了 `1)`不管你的数据变化多少，每次重绘的性能都可以接受; `2)`你依然可以用类似`innerHTML`的思路去写你的应用。

#### MVVM vs Virtual DOM
相比起`React`，其他`MVVM`系框架比如`Angular, Knockout`以及`Vue`、`Avalon`采用的都是数据绑定`:`通过`Directive/Binding`对象，观察数据变化并保留对实际`DOM`元素的引用，当有数据变化时进行对应的操作，`MVVM`的变化检查是数据层面的，而`React`的检查是`DOM`结构层面的，`MVVM`的性能也根据变动检测的实现原理有所不同: `Angular`的脏检查使得任何变动都有固定的`O(watcher count)`的代价; `Knockout/Vue/Avalon`都采用了依赖收集，在`js`和`DOM`层面都是`O(change)`:
* 脏检查：`scope digest O(watcher count)` + 必要`DOM`更新`O(DOM change)`。
* 依赖收集：重新收集依赖`O(data change)` + 必要`DOM`更新 `O(DOM change)`。

可以看到，`Angular`最不效率的地方在于任何小变动都有的和`watcher`数量相关的性能代价，但是!当所有数据都变了的时候，`Angular`其实并不吃亏，依赖收集在初始化和数据变化的时候都需要重新收集依赖，这个代价在小量更新的时候几乎可以忽略，但在数据量庞大的时候也会产生一定的消耗。  
`MVVM`渲染列表的时候，由于每一行都有自己的数据作用域，所以通常都是每一行有一个对应的`ViewModel`实例，或者是一个稍微轻量一些的利用原型继承的`scope`对象，但也有一定的代价，所以`MVVM`列表渲染的初始化几乎一定比`React`慢，因为创建`ViewModel / scope`实例比起`Virtual DOM`来说要昂贵很多，这里所有`MVVM`实现的一个共同问题就是在列表渲染的数据源变动时，尤其是当数据是全新的对象时，如何有效地复用已经创建的`ViewModel`实例和`DOM`元素，假如没有任何复用方面的优化，由于数据是全新的，`MVVM`实际上需要销毁之前的所有实例，重新创建所有实例，最后再进行一次渲染!这就是为什么题目里链接的`angular/knockout`实现都相对比较慢，相比之下，`React`的变动检查由于是`DOM`结构层面的，即使是全新的数据，只要最后渲染结果没变，那么就不需要做无用功。  
顺道说一句，`React`渲染列表的时候也需要提供`key`这个特殊`prop`，本质上和`track-by`是一回事。

#### 性能比较也要看场合
在比较性能的时候，要分清楚初始渲染、小量数据更新、大量数据更新这些不同的场合，`Virtual DOM`、脏检查`MVVM`、数据收集`MVVM`在不同场合各有不同的表现和不同的优化需求，`Virtual DOM`为了提升小量数据更新时的性能，也需要针对性的优化，比如`shouldComponentUpdate`或是`immutable data`。

* 初始渲染：`Virtual DOM` > 脏检查 >= 依赖收集。
* 小量数据更新：依赖收集 >> `Virtual DOM` + 优化 > 脏检查(无法优化) > `Virtual DOM`无优化。
* 大量数据更新：脏检查 + 优化 >= 依赖收集 + 优化 > `Virtual DOM`(无法/无需优化) >> `MVVM`无优化。

不要天真地以为`Virtual DOM`就是快，`diff`不是免费的，`batching`么`MVVM`也能做，而且最终`patch`的时候还不是要用原生`API`，在我看来`Virtual DOM`真正的价值从来都不是性能，而是它 `1)`为函数式的`UI`编程方式打开了大门; `2)`可以渲染到`DOM`以外的`backend`，比如`ReactNative`。

#### 总结
以上这些比较，更多的是对于框架开发研究者提供一些参考，主流的框架`+`合理的优化，足以应对绝大部分应用的性能需求，如果是对性能有极致需求的特殊情况，其实应该牺牲一些可维护性采取手动优化`:`比如`Atom`编辑器在文件渲染的实现上放弃了`React`而采用了自己实现的`tile-based rendering`; 又比如在移动端需要`DOM-pooling`的虚拟滚动，不需要考虑顺序变化，可以绕过框架的内置实现自己搞一个。

## diff算法
`React`在内存中维护一颗虚拟`DOM`树，当数据发生改变时(`state & props`)，会自动的更新虚拟`DOM`，获得一个新的虚拟`DOM`树，然后通过`Diff`算法，比较新旧虚拟`DOM`树，找出最小的有变化的部分，将这个变化的部分`Patch`加入队列，最终批量的更新这些`Patch`到实际的`DOM`中。

### 时间复杂度
首先进行一次完整的`diff`需要`O(n^3)`的时间复杂度，这是一个最小编辑距离的问题，在比较字符串的最小编辑距离时使用动态规划的方案需要的时间复杂度是`O(mn)`，但是对于`DOM`来说是一个树形结构，而树形结构的最小编辑距离问题的时间复杂度在`30`多年的演进中从`O(m^3n^3)`演进到了`O(n^3)`，关于这个问题如果有兴趣的话可以研究一下论文`https://grfia.dlsi.ua.es/ml/algorithms/references/editsurvey_bille.pdf`。   
对于原本想要提高效率而引入的`diff`算法使用`O(n^3)`的时间复杂度显然是不太合适的，如果有`1000`个节点元素将需要进行十亿次比较，这是一个昂贵的算法，所以必须有一些妥协来加快速度，对比较通过一些策略进行简化，将时间复杂度缩小到`O(n)`，虽然并不是最小编辑距离，但是作为编辑距离与时间性能的综合考量是一个比较好的解决方案，是一种比较好的折中方案。

### diff策略
上边提到的`O(n)`时间复杂度是通过一定策略进行的，`React`文档中提到了两个假设：
* 两个不同类型的元素将产生不同的树。
* 通过渲染器附带`key`属性，开发者可以示意哪些子元素可能是稳定的。

通俗点说就是：
* 只进行统一层级的比较，如果跨层级的移动则视为创建和删除操作。
* 如果是不同类型的元素，则认为是创建了新的元素，而不会递归比较他们的孩子。
* 如果是列表元素等比较相似的内容，可以通过`key`来唯一确定是移动还是创建或删除操作。

比较后会出现几种情况，然后进行相应的操作：
* 此节点被添加或移除`->`添加或移除新的节点。
* 属性被改变`->`旧属性改为新属性。
* 文本内容被改变`->`旧内容改为新内容。
* 节点`tag`或`key`是否改变`->`改变则移除后创建新元素。

### 分析
在分析时会简单引用一下在`React`的源码，起辅助作用的代码，实际源码是很复杂的，引用的是一部分片段帮助理解，本文的源码`TAG`为`16.10.2`。  
关于`if (__DEV__){...}`相关代码实际上是为更好的开发者体验而编写的，`React`中的友好的报错，`render`性能测试等等代码都是写在`if (__DEV__)`中的，在`production build`的时候，这些代码不会被打包，因此我们可以毫无顾虑的提供专为开发者服务的代码，`React`的最佳实践之一就是在开发时使用`development build`，在生产环境使用`production build`，所以我们实际上可以先跳过这部分代码，专注于理解较为核心的部分。  
我们分析`diff`算法是从`reconcileChildren`开始的，之前从` setState -> enqueueSetState(UpdateQueue) -> scheduleUpdate -> performWork -> workLoop -> beginWork -> finishClassComponent -> reconcileChildren`相关的部分就不过多介绍了，需要注意的是`beginWork`会将一个一个的`Fiber`来进行`diff`，期间是可中断的，因为每次执行下一个`Fiber`的比对时，都会先判断这一帧剩余的时间是否充足，链表的每一个节点是`Fiber`，而不是在`16`之前的虚拟`DOM`节点，每一个`Fiber`都有`React16`的`diff`策略采用从链表头部开始比较的算法，是链式的深度优先遍历，即已经从树形结构变成了链表结构，实际相当于在`15`的`diff`算法阶段，做了优先级的任务调度控制。此外，每个`Fiber`都会有一个`child`、`sibling`、`return`三大属性作为链接树前后的指针；`child`作为模拟树结构的结构指针；`effectTag`一个很有意思的标记，用于记录`effect`的类型，`effect`指的就是对`DOM`操作的方式，比如修改，删除等操作，用于到后面进行`commit`(类似数据库)；`firstEffect`、`lastEffect`等玩意是用来保存中断前后`effect`的状态，用户中断后恢复之前的操作以及`tag`用于标记。  
`reconcileChildren`实现的就是江湖上广为流传的`Virtul DOM diff`，其实际上只是一个入口函数，如果首次渲染，`current`空`null`，就通过`mountChildFibers`创建子节点的`Fiber`实例，如果不是首次渲染，就调用`reconcileChildFibers`去做`diff`，然后得出`effect list`。  

```javascript
// react-reconciler/src/ReactChildFiber.js line 1246
export function reconcileChildren(
  current: Fiber | null,
  workInProgress: Fiber,
  nextChildren: any,
  renderExpirationTime: ExpirationTime,
) {
  if (current === null) { // 首次渲染 创建子节点的`Fiber`实例
    workInProgress.child = mountChildFibers(
      workInProgress,
      null,
      nextChildren,
      renderExpirationTime,
    );
  } else { // 否则调用`reconcileChildFibers`去做`diff`
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren,
      renderExpirationTime,
    );
  }
}
```
对比一下`mountChildFibers`和`reconcileChildFibers`有什么区别，可以看出他们都是通过`ChildReconciler`工厂函数来的，只是传递的参数不同而已，这个参数叫`shouldTrackSideEffects`，他的作用是判断是否要增加一些`effectTag`，主要是用来优化初次渲染的，因为初次渲染没有更新操作。`ChildReconciler`是一个超级长的工厂(包装)函数，内部有很多`helper`函数，最终返回的函数叫`reconcileChildFibers`，这个函数实现了对子`fiber`节点的`reconciliation`。

```javascript
// react-reconciler/src/ReactChildFiber.js line 1370
export const reconcileChildFibers = ChildReconciler(true);
export const mountChildFibers = ChildReconciler(false);

function ChildReconciler(shouldTrackSideEffects) { 
  // ...
  function deleteChild(){
      // ...
  }
  function useFiber(){
      // ...
  }
  function placeChild(){
      // ...
  }
  function placeSingleChild(){
      // ...
  }
  function updateTextNode(){
      // ...
  }
  function updateElement(){
      // ...
  }
  function updatePortal(){
      // ...
  }
  function updateFragment(){
      // ...
  }
  function createChild(){
      // ...
  }
  function updateSlot(){
      // ...
  }
  function updateFromMap(){
      // ...
  }
  function warnOnInvalidKey(){
      // ...
  }
  function reconcileChildrenArray(){
      // ...
  }
  function reconcileChildrenIterator(){
      // ...
  }
  function reconcileSingleTextNode(){
      // ...
  }
  function reconcileSingleElement(){
      // ...
  }
  function reconcileSinglePortal(){
      // ...
  }
  function reconcileChildFibers(){
      // ...
  }
  return reconcileChildFibers;
}
```

`reconcileChildFibers`就是`diff`部分的主体代码，相关操作都在`ChildReconciler`函数中，在这个函数中相关参数，`returnFiber`是即将`diff`的这层的父节点，`currentFirstChild`是当前层的第一个`Fiber`节点，`newChild`是即将更新的`vdom`节点(可能是`TextNode`、可能是`ReactElement`，可能是数组)，不是`Fiber`节点。`expirationTime`是过期时间，这个参数是跟调度有关系的，跟`diff`没有太大关系，另外需要注意的是，`reconcileChildFibers` 是`reconcile(diff)`的一层结构。   

首先看`TextNode`的`diff`，他是最简单的，对于`diff TextNode`会有两种情况：
* `currentFirstNode`是`TextNode`。
* `currentFirstNode`不是`TextNode`。

分两种情况原因就是为了复用节点，第一种情况，`xxx`是一个`TextNode`，那么就代表这这个节点可以复用，有复用的节点，对性能优化很有帮助，既然新的`child`只有一个`TextNode`，那么复用节点之后，就把剩下的`aaa`节点就可以删掉了，那么`div`的`child`就可以添加到`workInProgress`中去了。`useFiber`就是复用节点的方法，`deleteRemainingChildren`就是删除剩余节点的方法，这里是从`currentFirstChild.sibling`开始删除的。

```javascript
if (currentFirstChild !== null && currentFirstChild.tag === HostText) {
  // We already have an existing node so let's just update it and delete
  // the rest.
  deleteRemainingChildren(returnFiber, currentFirstChild.sibling); // 删除兄弟
  const existing = useFiber(currentFirstChild, textContent, expirationTime);
  existing.return = returnFiber;
  return existing; // 复用
}
```
第二种情况，`xxx`不是一个`TextNode`，那么就代表这个节点不能复用，所以就从`currentFirstChild`开始删掉剩余的节点，其中`createFiberFromText`就是根据`textContent`来创建节点的方法，此外删除节点不会真的从链表里面把节点删除，只是打一个`delete`的`tag`，当`commit`的时候才会真正的去删除。

```javascript
// The existing first child is not a text node so we need to create one
// and delete the existing ones.
// 创建新的Fiber节点，将旧的节点和旧节点的兄弟都删除 
deleteRemainingChildren(returnFiber, currentFirstChild);
const created = createFiberFromText(
  textContent,
  returnFiber.mode,
  expirationTime,
);
```

接下来是`React Element`的`diff`，此时我们处理的是该节点的父节点只有此节点一个节点的情况，与上面`TextNode`的`diff`类似，他们的思路是一致的，先找有没有可以复用的节点，如果没有就另外创建一个。此时会用到上边的两个假设用以判断节点是否可以复用，即`key`是否相同，节点类型是否相同，如果以上相同，则可以认为这个节点只是变化了内容，不需要创建新的节点，可以复用的。如果节点的类型不相同，就将节点从当前节点开始把剩余的都删除。在查找可复用节点的时候，其并不是只专注于第一个节点是否可复用，而是继续在该层中循环找到一个可以复用的节点，最顶层的`while`以及底部的`child = child.sibling;`是为了继续从子节点中找到一个`key`与`tag`相同的可复用节点，另外删除节点不会真的从链表里面把节点删除，只是打一个`delete`的`tag`，当`commit`的时候才会真正的去删除。

```javascript
// react-reconciler/src/ReactChildFiber.js line 1132
const key = element.key;
let child = currentFirstChild;
while (child !== null) {
  // TODO: If key === null and child.key === null, then this only applies to
  // the first item in the list.
  if (child.key === key) {
    if (
      child.tag === Fragment
        ? element.type === REACT_FRAGMENT_TYPE
        : child.elementType === element.type ||
          // Keep this check inline so it only runs on the false path:
          (__DEV__
            ? isCompatibleFamilyForHotReloading(child, element)
            : false)
    ) {
      deleteRemainingChildren(returnFiber, child.sibling); // 因为当前节点是只有一个节点，而老的如果是有兄弟节点是要删除的，是多余的
      const existing = useFiber(
        child,
        element.type === REACT_FRAGMENT_TYPE
          ? element.props.children
          : element.props,
        expirationTime,
      );
      existing.ref = coerceRef(returnFiber, child, element);
      existing.return = returnFiber;
      // ...
      return existing;
    } else {
      deleteRemainingChildren(returnFiber, child);
      break;
    }
  } else {
    deleteChild(returnFiber, child); // 从child开始delete
  }
  child = child.sibling; // 继续从子节点中找到一个可复用的节点
}
```

接下来就是没有找到可以复用的节点因而去创建节点了，对于`Fragment`节点和一般的`Element`节点创建的方式不同，因为`Fragment`本来就是一个无意义的节点，他真正需要创建`Fiber`的是它的`children`，而不是它自己，所以`createFiberFromFragment`传递的不是`element`，而是`element.props.children`。

```javascript
// react-reconciler/src/ReactChildFiber.js line 1178
if (element.type === REACT_FRAGMENT_TYPE) {
  const created = createFiberFromFragment(
    element.props.children,
    returnFiber.mode,
    expirationTime,
    element.key,
  );
  created.return = returnFiber;
  return created;
} else {
  const created = createFiberFromElement(
    element,
    returnFiber.mode,
    expirationTime,
  );
  created.ref = coerceRef(returnFiber, currentFirstChild, element);
  created.return = returnFiber;
  return created;
}
```

`diff Array`算是`diff`中最复杂的一部分了，做了很多的优化，因为`Fiber`树是单链表结构，没有子节点数组这样的数据结构，也就没有可以供两端同时比较的尾部游标，所以`React`的这个算法是一个简化的双端比较法，只从头部开始比较，在`Vue2.0`中的`diff`算法在`patch`时则是直接使用的双端比较法实现的。  
首先考虑相同位置进行对比，这个是比较容易想到的一种方式，即在做`diff`的时候就可以从新旧的数组中按照索引一一对比，如果可以复用，就把这个节点从老的链表里面删除，不能复用的话再进行其他的复用策略。此时的`newChildren`数组是一个`VDOM`数组，所以在这里使用`updateSlot`包装成`newFiber`。


```javascript
// react-reconciler/src/ReactChildFiber.js line 756
function reconcileChildrenArray(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    newChildren: Array<*>,
    expirationTime: ExpirationTime,
  ): Fiber | null {
    // 机翻注释
    // 这个算法不能通过两端搜索来优化，因为我们在光纤上没有反向指针。我想看看我们能用这个模型走多远。如果最终不值得权衡，我们可以稍后再添加。
    // 即使是双端优化，我们也希望在很少有变化的情况下进行优化，并强制进行比较，而不是去寻找地图。它想探索在前进模式下首先到达那条路径，并且只有当我们注意到我们需要很多向前看的时候才去地图。这不能处理反转以及两个结束的搜索，但这是不寻常的。此外，要使两端优化在Iterables上工作，我们需要复制整个集合。
    // 在第一次迭代中，我们只需在每次插入/移动时都碰到坏情况（将所有内容添加到映射中）。
    // 如果更改此代码，还需要更新reconcileChildrenIterator()，它使用相同的算法。
    let oldFiber = currentFirstChild;
    let lastPlacedIndex = 0;
    let newIdx = 0;
    let nextOldFiber = null;
     // 第一个for循环，按照index一一对比，当新老节点不一致时退出循环并且记录退出时的节点及oldFiber节点
    for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
      if (oldFiber.index > newIdx) { // 位置不匹配
        nextOldFiber = oldFiber;  // 下一个即将对比的旧节点
        oldFiber = null; // 如果newFiber也为null(不能复用)就退出当前一一对比的for循环
      } else {
        nextOldFiber = oldFiber.sibling; //正常的情况下 为了下轮循环，拿到兄弟节点下面赋值给oldFiber
      }
      // //如果节点可以复用(key值匹配)，就更新并且返回新节点，否则返回为null，代表节点不可以复用
      const newFiber = updateSlot( // 判断是否可以复用节点
        returnFiber,
        oldFiber,
        newChildren[newIdx],
        expirationTime,
      );
      // 节点无法复用 跳出循环
      if (newFiber === null) { 
        // TODO: This breaks on empty slots like null children. That's
        // unfortunate because it triggers the slow path all the time. We need
        // a better way to communicate whether this was a miss or null,
        // boolean, undefined, etc.
        if (oldFiber === null) {
          oldFiber = nextOldFiber; // 记录不可以复用的节点并且退出对比
        }
        break; // 退出循环
      }
      if (shouldTrackSideEffects) {
        // 没有复用已经存在的节点，就删除掉已经存在的节点
        if (oldFiber && newFiber.alternate === null) {
          // We matched the slot, but we didn't reuse the existing fiber, so we
          // need to delete the existing child.
          deleteChild(returnFiber, oldFiber);
        }
      }
      // 本次遍历会给新增的节点打 插入的标记
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
      if (previousNewFiber === null) {
        // TODO: Move out of the loop. This only happens for the first run.
        resultingFirstChild = newFiber;
      } else {
        // TODO: Defer siblings if we're not at the right index for this slot.
        // I.e. if we had null values before, then we want to defer this
        // for each null value. However, we also don't want to call updateSlot
        // with the previous one.
        previousNewFiber.sibling = newFiber;
      }
      previousNewFiber = newFiber;
      oldFiber = nextOldFiber;  // 重新给 oldFiber 赋值继续遍历
  }
```


在`updateSlot`方法中定义了判断是否可以复用，对于文本节点,如果`key`不为`null`，那么就代表老节点不是`TextNode`，而新节点又是`TextNode`，所以返回`null`，不能复用，反之则可以复用，调用`updateTextNode`方法，注意`updateTextNode`里面包含了首次渲染的时候的逻辑，首次渲染的时候回插入一个`TextNode`，而不是复用。

```javascript
// react-reconciler/src/ReactChildFiber.js line 544
function updateSlot(
    returnFiber: Fiber,
    oldFiber: Fiber | null,
    newChild: any,
    expirationTime: ExpirationTime,
  ): Fiber | null {
    // Update the fiber if the keys match, otherwise return null.

    const key = oldFiber !== null ? oldFiber.key : null;

    if (typeof newChild === 'string' || typeof newChild === 'number') {
      // 对于新的节点如果是 string 或者 number，那么都是没有 key 的，
      // 所有如果老的节点有 key 的话，就不能复用，直接返回 null。
      // 老的节点 key 为 null 的话，代表老的节点是文本节点，就可以复用
      if (key !== null) {
        return null;
      }
      return updateTextNode(
        returnFiber,
        oldFiber,
        '' + newChild,
        expirationTime,
      );
    }

    // ...

    return null;
}
```

`newChild`是`Object`的时候基本上与`ReactElement`的`diff`类似，只是没有`while`了，判断`key`和元素的类型是否相等来判断是否可以复用。首先判断是否是对象，用的是`typeof newChild === object`&&`newChild!== null`，注意要加`!== null`，因为`typeof null`也是`object`，然后通过`$$typeof`判断是`REACT_ELEMENT_TYPE`还是`REACT_PORTAL_TYPE`，分别调用不同的复用逻辑，然后由于数组也是`Object`，所以这个`if`里面也有数组的复用逻辑。

```javascript
// react-reconciler/src/ReactChildFiber.js line 569
if (typeof newChild === 'object' && newChild !== null) {
  switch (newChild.$$typeof) {
    case REACT_ELEMENT_TYPE: { // ReactElement 
      if (newChild.key === key) {
        if (newChild.type === REACT_FRAGMENT_TYPE) {
          return updateFragment(
            returnFiber,
            oldFiber,
            newChild.props.children,
            expirationTime,
            key,
          );
        }
        return updateElement(
          returnFiber,
          oldFiber,
          newChild,
          expirationTime,
        );
      } else {
        return null;
      }
    }
    case REACT_PORTAL_TYPE: {
      // 调用 updatePortal
      // ...
    }
  }

  if (isArray(newChild) || getIteratorFn(newChild)) {
    if (key !== null) {
      return null;
    }

    return updateFragment(
      returnFiber,
      oldFiber,
      newChild,
      expirationTime,
      null,
    );
  }
}
```

让我们回到最初的遍历，当我们遍历完成了之后，就会有两种情况，即老节点已经遍历完毕，或者新节点已经遍历完毕，如果此时我们新节点已经遍历完毕，也就是没有要更新的了，这种情况一般就是从原来的数组里面删除了元素，那么直接把剩下的老节点删除了就行了。如果老的节点在第一次循环的时候就被复用完了，新的节点还有，很有可能就是新增了节点的情况，那么这个时候只需要根据把剩余新的节点直接创建`Fiber`就行了。

```javascript
// react-reconciler/src/ReactChildFiber.js line 839
// 新节点已经更新完成，删除多余的老节点
if (newIdx === newChildren.length) {
  // We've reached the end of the new children. We can delete the rest.
  deleteRemainingChildren(returnFiber, oldFiber);
  return resultingFirstChild;
}

// 新节点已经更新完成，删除多余的老节点
if (oldFiber === null) {
  // If we don't have any more existing children we can choose a fast path
  // since the rest will all be insertions.
  for (; newIdx < newChildren.length; newIdx++) {
    const newFiber = createChild(
      returnFiber,
      newChildren[newIdx],
      expirationTime,
    );
    if (newFiber === null) {
      continue;
    }
    lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
    if (previousNewFiber === null) {
      // TODO: Move out of the loop. This only happens for the first run.
      resultingFirstChild = newFiber;
    } else {
      previousNewFiber.sibling = newFiber;
    }
    previousNewFiber = newFiber;
  }
  return resultingFirstChild;
}
```

接下来考虑移动的情况如何进行节点复用，即如果老的数组和新的数组里面都有这个元素，而且位置不相同这种情况下的复用，`React`把所有老数组元素按`key`或者是`index`放`Map`里，然后遍历新数组，根据新数组的`key`或者`index`快速找到老数组里面是否有可复用的，元素有`key`就`Map`的键就存`key`，没有`key`就存`index`。

```javascript
// react-reconciler/src/ReactChildFiber.js line 872
// Add all children to a key map for quick lookups.
// 从oldFiber开始将已经存在的节点的key或者index添加到map结构中
const existingChildren = mapRemainingChildren(returnFiber, oldFiber);

// Keep scanning and use the map to restore deleted items as moves.
// 剩余没有对比的新节点，到旧节点的map中通过key或者index一一对比查看是否可以复用。
for (; newIdx < newChildren.length; newIdx++) {
  // 主要查看新旧节点的key或者index是否有相同的，然后再查看是否可以复用。
  const newFiber = updateFromMap(
    existingChildren,
    returnFiber,
    newIdx,
    newChildren[newIdx],
    expirationTime,
  );
  if (newFiber !== null) {
    if (shouldTrackSideEffects) {
      if (newFiber.alternate !== null) {
        // The new fiber is a work in progress, but if there exists a
        // current, that means that we reused the fiber. We need to delete
        // it from the child list so that we don't add it to the deletion
        // list.
        existingChildren.delete(  // 在map中删除掉已经复用的节点的key或者index
          newFiber.key === null ? newIdx : newFiber.key,
        );
      }
    }
    lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
    // 添加newFiber到更新过的newFiber结构中。
    if (previousNewFiber === null) {
      resultingFirstChild = newFiber;
    } else {
      previousNewFiber.sibling = newFiber;
    }
    previousNewFiber = newFiber;
  }
}

// react-reconciler/src/ReactChildFiber.js line 299
// 将旧节点的key或者index，旧节点保存到map结构中，方便通过key或者index获取
function mapRemainingChildren(
    returnFiber: Fiber,
    currentFirstChild: Fiber,
  ): Map<string | number, Fiber> {
    // Add the remaining children to a temporary map so that we can find them by
    // keys quickly. Implicit (null) keys get added to this set with their index
    // instead.
    const existingChildren: Map<string | number, Fiber> = new Map();

    let existingChild = currentFirstChild;
    while (existingChild !== null) {
      if (existingChild.key !== null) {
        existingChildren.set(existingChild.key, existingChild);
      } else {
        existingChildren.set(existingChild.index, existingChild);
      }
      existingChild = existingChild.sibling;
    }
    return existingChildren;
  }
```

至此新数组遍历完毕，也就是同一层的`diff`过程完毕，我们可以把整个过程分为三个阶段:
* 第一遍历新数组，新老数组相同`index`进行对比，通过`updateSlot`方法找到可以复用的节点，直到找到不可以复用的节点就退出循环。
* 第一遍历完之后，删除剩余的老节点，追加剩余的新节点的过程，如果是新节点已遍历完成，就将剩余的老节点批量删除`;`如果是老节点遍历完成仍有新节点剩余，则将新节点直接插入。
* 把所有老数组元素按`key`或`index`放`Map`里，然后遍历新数组，插入老数组的元素，这是移动的情况。

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://zhuanlan.zhihu.com/p/89363990
https://zhuanlan.zhihu.com/p/137251397
https://github.com/sisterAn/blog/issues/22
https://github.com/hujiulong/blog/issues/6
https://juejin.cn/post/6844904165026562056
https://www.cnblogs.com/forcheng/p/13246874.html
https://zh-hans.reactjs.org/docs/reconciliation.html
https://zxc0328.github.io/2017/09/28/react-16-source/
https://blog.csdn.net/halations/article/details/109284050
https://blog.csdn.net/susuzhe123/article/details/107890118
https://github.com/Advanced-Frontend/Daily-Interview-Question/issues/47
https://github.com/jianjiachenghub/react-deeplearn/blob/master/%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0/React16%E6%BA%90%E7%A0%81%E8%A7%A3%E6%9E%906-Fiber%E9%93%BE%E5%BC%8Fdiff%E7%AE%97%E6%B3%95.md
```
