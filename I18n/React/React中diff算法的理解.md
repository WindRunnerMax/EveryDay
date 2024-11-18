# Understanding the `diff` algorithm in React
The `diff` algorithm is used to calculate the parts that have changed in the `Virtual DOM`, and then perform `DOM` operations on those parts without having to re-render the entire page. Rendering the entire `DOM` structure is very costly, requiring the browser to redraw and reflow the `DOM` structure. The `diff` algorithm allows the operations to only update the modified parts of the `DOM` structure instead of the entire `DOM`, minimizing the manipulation of the `DOM` structure and significantly reducing the scale of browser redraws and reflows.

## Virtual DOM
The basis of the `diff` algorithm is the `Virtual DOM`, which is a tree based on JavaScript objects. In `React`, it is usually compiled through `JSX`, and each node is referred to as a `VNode`, described using object properties. In reality, the `Virtual DOM` is an abstraction of the actual `DOM`, and it can ultimately be mapped to the real environment through rendering operations. In simple terms, the `Virtual DOM` is just a JavaScript object used to describe the entire document. When building a page in the browser, `DOM` nodes are needed to describe the entire document.

```html
<div class="root" name="root">
    <p>1</p>
    <div>11</div>
</div>
```

If we were to describe the above nodes and document using a JavaScript object, it would look similar to the following. Of course, this is not the object used to describe nodes in `React`. The source code for creating a `React` element in `React` can be found in `react/src/ReactElement.js`. The version used in the text is `16.10.2`.

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

In `React16`, a new architecture called `Fiber` was introduced. The core of `Fiber` is the implementation of a task scheduling algorithm based on priority and `requestIdleCallback`. The specifics of `Fiber` are beyond the scope of this article. In essence, the virtual `DOM` transitioned from a tree structure to a linked list structure. The original `VDOM` was a tree from top to bottom, traversed through depth-first recursion. However, this depth-first traversal had the major drawback of being non-interruptible. As a result, when dealing with `diff + patch` or mounting large nodes, it caused significant lag. In `React16`, the virtual `DOM` is no longer a simple tree from top to bottom, but rather a linked list structure of virtual `DOM`. Each node in the linked list is a `Fiber`, unlike the virtual `DOM` nodes prior to version `16`. Each `Fiber` node records a wealth of information so that the process of reaching a certain node can be interrupted. The `Fiber` approach splits the rendering/update process (recursive `diff`) into a series of small tasks, checking a small portion of the tree each time and seeing if there is time to continue to the next task. If there is, it proceeds; if not, it suspends itself until the main thread is not busy and then continues. During the `diff` phase, `Fiber` performs the following operations, effectively controlling the priority of task scheduling during the `diff` algorithm phase.
- Divide interruptible work into small tasks.
- Adjust the priority order, redo, and reuse the previous (incomplete) work being performed.
- Priority control during the `diff` phase of task scheduling.

### Comparison between manipulating Virtual DOM and real DOM
Here, a quote from You You ([2016-02-08](https://www.zhihu.com/question/31809713)) is directly referenced (at that time, Vue2.0 had not been released yet, and Vue2.0 was released around [2016-10-01](https://www.zhihu.com/question/31809713)). It is recommended to read the related question combined with the link and compare the examples in the question. In addition, the following responses are also very insightful.

### Native DOM Operations vs Encapsulation through Frameworks

This is a trade-off between performance and maintainability. The significance of frameworks lies in concealing the underlying DOM operations, enabling you to describe your intentions in a more declarative manner, thus making your code easier to maintain. No framework can perform DOM optimizations faster than manual optimization, as the framework's DOM manipulation layer must accommodate operations from any higher-level API. I can write manual optimizations faster than any framework for any benchmark, but what's the point? When building a real application, are you going to manually optimize every part? Clearly, that's not feasible for maintainability. The guarantee a framework provides is that under normal circumstances of not requiring manual optimization, it can still deliver acceptable performance.

### Misconception about React's Virtual DOM

React has never claimed to be faster than native DOM operations. React's basic mode of thinking is to re-render the entire application whenever there is a change. Without Virtual DOM, it's equivalent to directly resetting `innerHTML`. Many people fail to realize that in the scenario of all data within a large list being changed, resetting `innerHTML` is actually a reasonable operation. The real problem arises from the mindset of completely re-rendering the application. Even if only one line of data changes, it still necessitates resetting the entire `innerHTML`, resulting in significant wastage. Let's compare the rendering performance costs of `innerHTML vs Virtual DOM`:

- `innerHTML`: `render html string O(template size)` + re-creating all DOM elements `O(DOM size)`
- `Virtual DOM`: `render Virtual DOM + diff O(template size)` + necessary DOM updates `O(DOM change)`

It's evident that `Virtual DOM render + diff` are slower than rendering an HTML string, but it remains purely a JavaScript-level computation. In comparison to subsequent DOM operations, it's still significantly cheaper. It's clear that the total calculation load of `innerHTML`, regardless of JavaScript computation or DOM operations, is associated with the entire interface size. In `Virtual DOM`'s calculation load, only JavaScript computation is related to the interface size, while DOM operations are related to the data's change amount. As stated earlier, JavaScript computation is extremely inexpensive compared to DOM operations. This is why Virtual DOM is necessary: it ensures that `1)` regardless of the amount of data changes, the performance of each redraw is acceptable; `2)` you can still use a similar approach to `innerHTML` in writing your application.

### MVVM vs Virtual DOM

In comparison to React, other MVVM-style frameworks such as Angular, Knockout, Vue, and Avalon employ data binding: through Directive/Binding objects, they observe data changes and retain references to actual DOM elements, executing corresponding operations when data changes. The performance of MVVM also varies depending on the implementation principle of change detection: Angular's dirty checking incurs a fixed `O(watcher count)` cost for any change; Knockout/Vue/Avalon all use dependency collection, resulting in `O(change)` at both the JavaScript and DOM levels:

- Dirty checking: `scope digest O(watcher count)` + necessary DOM updates `O(DOM change)`
- Dependency collection: Re-collecting dependencies `O(data change)` + necessary DOM updates `O(DOM change)`

It's evident that Angular is most inefficient when it comes to the performance cost related to the watcher count for any minor change. However, when all data changes, Angular doesn't actually suffer. Dependency collection necessitates re-collecting dependencies during initialization and data changes, which is almost negligible for small updates but can incur some overhead in case of large data volumes. When rendering lists in MVVM, each row typically has its own ViewModel instance or a slightly more lightweight scope object utilizing prototype inheritance. However, this also comes with a certain cost, making the MVVM list rendering initialization almost inevitably slower than React. Creating ViewModel/scope instances is much more expensive compared to Virtual DOM, and a common issue in all MVVM implementations is how efficiently to reuse already created ViewModel instances and DOM elements when there is a change in the data source, especially when the data is entirely new objects. Without any optimization for reuse, MVVM essentially needs to destroy all previous instances, recreate all instances, and finally perform the rendering when there's new data. This is the reason why the Angular/Knockout implementations linked in the topic are relatively slower. In contrast, React's change detection, being at the DOM structure level, only requires unnecessary work if the final rendering result has changed, even if the data is completely new. By the way, when rendering a list in React, it also requires providing a special `key` prop, which essentially is the same as `track-by`.

#### Performance comparison also depends on the context
When comparing performance, it is important to differentiate between initial rendering, small data updates, and large data updates. In different scenarios, Virtual DOM, dirty checking MVVM, and data collection MVVM have different performances and optimization needs. In order to improve the performance of small data updates, Virtual DOM also needs targeted optimization, such as shouldComponentUpdate or immutable data.

* Initial rendering: Virtual DOM > Dirty checking >= Dependency collection.
* Small data updates: Dependency collection >> Virtual DOM + optimization > Dirty checking (cannot be optimized) > Virtual DOM without optimization.
* Large data updates: Dirty checking + optimization >= Dependency collection + optimization > Virtual DOM (cannot/unneeded to be optimized) >> MVVM without optimization.

Don't naively assume that Virtual DOM is faster; diffing is not free, and batching can also be done by MVVM. Moreover, when patching, native APIs are still needed. In my opinion, the real value of Virtual DOM has never been its performance, but rather: `1)` opening the door to a functional UI programming style; `2)` being able to render outside of the DOM, such as with ReactNative.

#### Conclusion
These comparisons are more for the reference of framework developers. Mainstream frameworks plus reasonable optimization are sufficient for the performance needs of the vast majority of applications. For special cases with extreme performance requirements, some maintainability should be sacrificed for manual optimizations, such as how the Atom editor abandoned React and opted for its own tile-based rendering in file rendering implementation; or on mobile devices where DOM-pooling virtual scrolling is needed, bypassing the built-in framework implementation to create a custom one.

## Diff Algorithm
React maintains a virtual DOM tree in memory. When data changes (state & props), it automatically updates the virtual DOM to obtain a new virtual DOM tree. Then, using the diff algorithm, it compares the old and new virtual DOM trees to find the smallest changed parts, adds these changes to a patch queue, and ultimately updates these patches to the actual DOM in batch.

### Time Complexity
First, a complete diff requires a time complexity of `O(n^3)`. This is a minimum edit distance problem. When comparing the minimum edit distance of strings, using a dynamic programming approach requires a time complexity of `O(mn)`. However, for DOM, being a tree structure, the time complexity of the minimum edit distance problem for tree structures has evolved from `O(m^3n^3)` to `O(n^3)` over more than 30 years. If interested in this issue, one can study the paper at `https://grfia.dlsi.ua.es/ml/algorithms/references/editsurvey_bille.pdf`.

Using a diff algorithm with a time complexity of `O(n^3)` to enhance efficiency is evidently not appropriate. If there are 1000 node elements, it will require a billion comparisons, making it an expensive algorithm. Therefore, some compromises must be made to speed up the process, through simplification strategies, reducing the time complexity to `O(n)`—although it's not the minimum edit distance, as a comprehensive consideration of edit distance and time performance, it is a good compromise.

### Diff Strategy
The `O(n)` time complexity mentioned above is achieved through certain strategies. The React documentation mentions two assumptions:
* Two different types of elements will produce different trees.
* By attaching the key attribute to the renderer, developers can indicate which child elements may be stable.

In simpler terms:
* Only compare at the same level. If there are movements across levels, those will be considered creation and deletion operations.
* For different types of elements, they are considered as creating new elements rather than recursively comparing their children.
* If it involves similar content like list elements, using keys can uniquely determine whether it’s moving, creating, or deleting operations.

After comparison, there are several scenarios, and corresponding operations are performed:
* Node added or removed -> add or remove new nodes.
* Attribute changed -> old attribute changed to new attribute.
* Text content changed -> old content changed to new content.
* Whether node tag or key has changed -> if changed, remove and create a new element.

### Analysis
When analyzing, we simply refer to some code that assists in `React`'s source code. The actual source code is very complex, and the referenced part is just a fragment to aid understanding. The `TAG` of the source code in this article is `16.10.2`.
The code related to `if (__DEV__) {...}` is actually written to provide a better developer experience. For instance, the friendly error reporting and rendering performance testing codes in `React` are all written within `if (__DEV__)`. During the production build, these codes will not be packaged, allowing us to freely provide code specifically for developers. One of `React's` best practices is to use a `development build` during development and a `production build` in the production environment. Therefore, we can actually skip this part of the code and focus on understanding the more core parts.
Our analysis of the `diff` algorithm starts from `reconcileChildren`. We won't delve into the parts related to `setState -> enqueueSetState(UpdateQueue) -> scheduleUpdate -> performWork -> workLoop -> beginWork -> finishClassComponent -> reconcileChildren` too much. It's worth noting that `beginWork` will perform `diff` on the `Fiber` one by one. This process is interruptible because before comparing the next `Fiber`, it checks whether there is enough remaining time in the frame. In the linked list, each node is a `Fiber`, rather than a virtual `DOM` node before version 16. Each `Fiber` adopts the `diff` strategy from `React16`. It uses an algorithm that starts comparing from the head of the linked list, which is a chain-based depth-first traversal. In other words, it has transformed from a tree structure to a linked list structure. In reality, it's similar to the priority task scheduling control done during the `diff` algorithm phase in version 15. Additionally, each `Fiber` has three main attributes as pointers to link the tree before and after: `child` acts as a structural pointer of the simulated tree structure; `effectTag` is an interesting marker used to record the type of `effect`, which refers to the way of operating on the `DOM`, such as modification, deletion, etc. It is used for the subsequent `commit` (similar to a database); `firstEffect`, `lastEffect`, and so on, are used to save the state of `effect` before and after the interruption, for restoring operations after the interruption, and `tag` is used for marking.
`reconcileChildren` actually implements the widely circulated `Virtual DOM diff` in the community, but in reality, it's just an entry function. If it's the initial rendering, with `current` being empty `null`, it creates a `Fiber` instance for the child nodes through `mountChildFibers`. If it's not the initial rendering, it calls `reconcileChildFibers` to perform `diff`, then produces an `effect list`.

```javascript
// react-reconciler/src/ReactChildFiber.js line 1246
export function reconcileChildren(
  current: Fiber | null,
  workInProgress: Fiber,
  nextChildren: any,
  renderExpirationTime: ExpirationTime,
) {
  if (current === null) { // Initial rendering creates a `Fiber` instance for child nodes
    workInProgress.child = mountChildFibers(
      workInProgress,
      null,
      nextChildren,
      renderExpirationTime,
    );
  } else { // Otherwise, calls `reconcileChildFibers` to perform `diff`
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren,
      renderExpirationTime,
    );
  }
}
```
Comparing `mountChildFibers` and `reconcileChildFibers`, it can be seen that they both come from the `ChildReconciler` factory function, and they just differ in the parameters passed. One of these parameters is called `shouldTrackSideEffects`, which is used to determine whether to add some `effectTag`, mainly for optimizing the initial rendering, as there are no update operations during the initial rendering. `ChildReconciler` is an extremely long factory (wrapper) function with many helper functions internally. The function it ultimately returns is called `reconcileChildFibers`, which implements the `reconciliation` of child `fiber` nodes.

```javascript
// react-reconciler/src/ReactChildFiber.js line 1370
export const reconcileChildFibers = ChildReconciler(true);
export const mountChildFibers = ChildReconciler(false);
```

```javascript
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

`reconcileChildFibers` is the main body of the `diff` part. The related operations are all in the `ChildReconciler` function. In this function, the related parameters, `returnFiber`, is the parent node of this layer that will be `diff`-ed, `currentFirstChild` is the first `Fiber` node in the current layer, and `newChild` is the `vdom` node to be updated (it may be a `TextNode`, a `ReactElement`, or an array), not a `Fiber` node. `expirationTime` is the expiration time, which is related to scheduling and has little to do with `diff`. Additionally, it is important to note that `reconcileChildFibers` is a layer structure of `reconcile(diff)`.

First, let's look at the `TextNode`'s `diff`, which is the simplest. There are two cases for `diff TextNode`:
* `currentFirstNode` is a `TextNode`.
* `currentFirstNode` is not a `TextNode`.

The reason for the two cases is to enable node reuse. In the first case, if `currentFirstNode` is a `TextNode`, it means that this node can be reused, which is very helpful for performance optimization. Since the new `child` has only one `TextNode`, after reusing the node, the remaining `aaa` node can be deleted, and then the `div`'s `child` can be added to `workInProgress`. `useFiber` is the method for reusing nodes, and `deleteRemainingChildren` is the method for deleting the remaining nodes, which starts from `currentFirstChild.sibling`.

```javascript
if (currentFirstChild !== null && currentFirstChild.tag === HostText) {
  // We already have an existing node so let's just update it and delete
  // the rest.
  deleteRemainingChildren(returnFiber, currentFirstChild.sibling); // delete the sibling
  const existing = useFiber(currentFirstChild, textContent, expirationTime);
  existing.return = returnFiber;
  return existing; // reuse
}
```
In the second case, if `xxx` is not a `TextNode`, it means that this node cannot be reused. Therefore, the remaining nodes are deleted starting from `currentFirstChild`. `createFiberFromText` is the method to create nodes based on `textContent`. Additionally, deleting nodes does not actually remove the nodes from the linked list, but instead sets a `delete` tag, which will be actually removed during the `commit` phase.

```javascript
// The existing first child is not a text node so we need to create one
// and delete the existing ones.
// Create a new Fiber node, and remove the old node and its siblings.
deleteRemainingChildren(returnFiber, currentFirstChild);
const created = createFiberFromText(
  textContent,
  returnFiber.mode,
  expirationTime,
);
```

Next is the `diff` of the `React Element`. This time, we are dealing with the scenario where the parent node of this node only has this node. Similar to the `TextNode` `diff` above, the approach is the same. First, look for reusable nodes, and if there are none, create a new one. The two assumptions mentioned earlier are used to determine if a node can be reused, namely whether the `key` and node types are the same. If they are the same, it is considered that the node has only changed its content, so there is no need to create a new node. If the node type is different, all the remaining nodes starting from the current node are deleted. When looking for reusable nodes, the focus is not only on whether the first node can be reused, but also continues to loop through the layer to find a reusable node with a matching `key` and `tag`. Additionally, deleting a node does not actually remove it from the linked list; it simply tags it with a `delete` tag, and it is only truly deleted when committed.

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
      deleteRemainingChildren(returnFiber, child.sibling); // If the current node has only one child, the old one with siblings needs to be deleted, which is redundant.
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
    deleteChild(returnFiber, child); // Start deleting from child
  }
  child = child.sibling; // Continue to find a reusable node from the child nodes
}
```

Next is the creation of nodes when no reusable node is found. The creation process for `Fragment` nodes and regular `Element` nodes differs because a `Fragment` is inherently a meaningless node; what it truly needs a `Fiber` for is its `children`, not itself. Therefore, `createFiberFromFragment` passes not the `element`, but `element.props.children`.

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

The `diff Array` is probably the most complex part of the `diff` process, and it has undergone many optimizations. Since the `Fiber` tree is a singly linked list structure without a data structure such as a child node array, there are no tail cursors available for simultaneous comparison at both ends. Therefore, the `React` algorithm is a simplified form of double-ended comparison, starting the comparison from the beginning. In `Vue 2.0`, the `diff` algorithm directly uses the double-ended comparison during `patch`.

The first consideration is to compare at the corresponding positions, which is a relatively straightforward approach. During the `diff` process, elements from the new and old arrays can be compared one by one based on their indices. If an element can be reused, it is removed from the old linked list. If it cannot be reused, other reusability strategies are then considered. The `newChildren` array at this point is a `VDOM` array, so it is wrapped as `newFiber` within the `updateSlot` function.


```javascript
// react-reconciler/src/ReactChildFiber.js line 756
function reconcileChildrenArray(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    newChildren: Array<*>,
    expirationTime: ExpirationTime,
  ): Fiber | null {
    // Translation:
    // This algorithm cannot be optimized through bidirectional search because we don't have reverse pointers on fibers. I want to see how far we can go with this model. If it's ultimately not worth the trade-off, we can add it later.
    // Even with bidirectional optimization, we want to optimize in scenarios with very few changes and force comparisons rather than lookups. It aims to explore the paths first in the forward mode and only resort to lookups when we notice that we need a lot of lookahead. This can't handle reversals and two-ended searches, but those are uncommon. Also, to make bidirectional optimization work on Iterables, we need to copy the entire collection.
    // In the first iteration, we only hit a bad case with each insert/move (adding all content to the map).
    // If you change this code, you also need to update reconcileChildrenIterator(), which uses the same algorithm.
    let oldFiber = currentFirstChild;
    let lastPlacedIndex = 0;
    let newIdx = 0;
    let nextOldFiber = null;
    // The first for loop compares one by one according to the index. When the new and old nodes do not match, exit the loop and record the exiting node and oldFiber node
    for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
      if (oldFiber.index > newIdx) { // Position mismatch
        nextOldFiber = oldFiber;  // The next old node to be compared
        oldFiber = null; // If newFiber is also null (cannot be reused), exit the current one-to-one comparison loop
      } else {
        nextOldFiber = oldFiber.sibling; // In normal circumstances, in order to loop in the next round, we get the sibling node and assign it to oldFiber
      }
      // If the node can be reused (matching key value), update and return the new node, otherwise return null, indicating that the node cannot be reused
      const newFiber = updateSlot( // Judge whether the node can be reused
        returnFiber,
        oldFiber,
        newChildren[newIdx],
        expirationTime,
      );
      // Node cannot be reused, break the loop
      if (newFiber === null) { 
        // TODO: This breaks on empty slots like null children. That's
        // unfortunate because it triggers the slow path all the time. We need
        // a better way to communicate whether this was a miss or null,
        // boolean, undefined, etc.
        if (oldFiber === null) {
          oldFiber = nextOldFiber; // Record the unreusable node and exit the comparison
        }
        break; // Exit the loop
      }
      if (shouldTrackSideEffects) {
        // If existing nodes are not reused, delete the existing nodes
        if (oldFiber && newFiber.alternate === null) {
          // We matched the slot, but we didn't reuse the existing fiber, so we
          // need to delete the existing child.
          deleteChild(returnFiber, oldFiber);
        }
      }
      // This traversal will mark the newly added nodes as inserted
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
      oldFiber = nextOldFiber;  // Reassign oldFiber to continue traversal
  }
```

The `updateSlot` method defines whether reuse is possible. For text nodes, if `key` is not `null`, the old node is not a `TextNode`, and the new node is a `TextNode`, then it returns `null` as it can't be reused. Otherwise, it can be reused, and the `updateTextNode` method is called. Note that the logic for initial rendering is included in `updateTextNode`. When initially rendered, a `TextNode` is inserted rather than reused.

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
      // For new nodes that are strings or numbers, they do not have keys,
      // so if the old node has a key, it cannot be reused and should return null.
      // If the old node's key is null, it means the old node is a text node and can be reused.
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

When `newChild` is an `Object`, it's similar to the `diff` of `ReactElement` except without the `while` loop. It determines whether it can be reused by checking if the `key` and the element type match. First, it's checked whether it's an object using `typeof newChild === object` && `newChild!== null`. It's important to include `!== null` since `typeof null` is also `object`. Then, it uses `$$typeof` to determine if it's a `REACT_ELEMENT_TYPE` or a `REACT_PORTAL_TYPE`, and calls different reuse logics accordingly. Also, since arrays are also `Object`, there's an array reuse logic inside this `if` statement.

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
      // Call updatePortal
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

Let's go back to the initial traversal. After we finish the traversal, there are two possible scenarios: either the old nodes have been traversed completely, or the new nodes have been traversed completely. If the new nodes have been traversed completely and there are no updates, this usually means that elements have been removed from the original array. In this case, we can simply remove the remaining old nodes. If the old nodes have been reused up in the first loop, and the new nodes are still present, it's very likely that new nodes have been added. In this case, we just need to create the remaining new nodes as `Fiber` directly.

```javascript
// react-reconciler/src/ReactChildFiber.js line 839
// Remove the remaining old nodes since the new nodes have been updated
if (newIdx === newChildren.length) {
  // We've reached the end of the new children. We can delete the rest.
  deleteRemainingChildren(returnFiber, oldFiber);
  return resultingFirstChild;
}

// Remove the remaining old nodes since the new nodes have been updated
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

Next, let's consider how to reuse nodes when they are moved, i.e., in cases where the same element exists in both the old and new arrays, but the positions are different. `React` places all the old array elements in a `Map` based on the `key` or `index`, and then iterates over the new array to quickly find whether there are reusable elements in the old array based on the `key` or `index`.

```javascript
// react-reconciler/src/ReactChildFiber.js line 872
// Add all children to a key map for quick lookups.
// Add the keys or indexes of existing nodes from oldFiber to the map.
const existingChildren = mapRemainingChildren(returnFiber, oldFiber);
```

### Translation

```js
// Keep scanning and use the map to restore deleted items as moves.
// When there are new nodes left to compare, go through the map of old nodes one by one using keys or indexes to see if they can be reused.
for (; newIdx < newChildren.length; newIdx++) {
  // Mainly check if the keys or indexes of the new and old nodes are the same, and then check if they can be reused.
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
        existingChildren.delete(  // Remove the key or index of the reused node from the map
          newFiber.key === null ? newIdx : newFiber.key,
        );
      }
    }
    lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
    // Add newFiber to the updated newFiber structure.
    if (previousNewFiber === null) {
      resultingFirstChild = newFiber;
    } else {
      previousNewFiber.sibling = newFiber;
    }
    previousNewFiber = newFiber;
  }
}

// react-reconciler/src/ReactChildFiber.js line 299
// Save the key or index of the old nodes and the old nodes in a map for quick retrieval by key or index
function mapRemainingChildren(
    returnFiber: Fiber,
    currentFirstChild: Fiber,
  ): Map<string | number, Fiber> {
    // Add the remaining children to a temporary map so that we can find them by keys quickly. Implicit (null) keys get added to this set with their index
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

At this point, the traversal of the new array is completed, which means the `diff` process for the same layer is completed. The entire process can be divided into three stages:
* The first traversal of the new array, comparing elements with the same index in the new and old arrays, using the `updateSlot` method to find reusable nodes, and exiting the loop when an unreusable node is found.
* After the first traversal, the process of deleting remaining old nodes and appending remaining new nodes. If the new nodes have been fully traversed, the remaining old nodes are batch deleted; if there are remaining new nodes after completing the traversal of old nodes, the new nodes are directly inserted.
* Put all the elements of the old array into a `Map` by `key` or `index`, and then traverse the new array, inserting the elements of the old array, which involves moving elements.

## Daily Challenge

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference
```

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