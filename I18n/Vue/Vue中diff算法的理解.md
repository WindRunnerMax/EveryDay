# Understanding the Diff Algorithm in Vue

The `diff` algorithm is used to calculate the changed parts in the `Virtual DOM`, and then perform `DOM` operations on those parts without having to re-render the entire page. Rendering the entire `DOM` structure is a costly process, as it requires the browser to repaint and reflow the `DOM` structure. The `diff` algorithm allows the operation process to update only the modified part of the `DOM` structure without updating the entire `DOM`. This minimizes the operations on the `DOM` structure and reduces the scale of browser repaint and reflow to the greatest extent.

## Virtual DOM
The basis of the `diff` algorithm is the `Virtual DOM`, which is a tree based on JavaScript objects. Each node is called a `VNode`, described using object properties. In essence, it is an abstraction of the real `DOM`. Ultimately, this tree can be mapped to the real environment through rendering operations. Simply put, the `Virtual DOM` is a JavaScript object used to describe the entire document.  
When constructing a page in the browser, `DOM` nodes are used to describe the entire document.

```html
<div class="root" name="root">
    <p>1</p>
    <div>11</div>
</div>
```

If we use JavaScript objects to describe the above nodes and document, it would be similar to the following structure. Of course, this is not the object used to describe nodes in Vue. In Vue, the object used to describe a node includes many properties such as `tag`, `data`, `children`, `text`, `elm`, `ns`, `context`, `key`, `componentOptions`, `componentInstance`, `parent`, `raw`, `isStatic`, `isRootInsert`, `isComment`, `isCloned`, etc. For specific properties, you can refer to the Vue source code in `/dev/src/core/vdom/vnode.js`.

```javascript
{
    type: "tag",
    tagName: "div",
    attr: {
        className: "root"
        name: "root"
    },
    parent: null,
    children: [{
        type: "tag",
        tagName: "p",
        attr: {},
        parent: {} /* Reference to the parent node */, 
        children: [{
            type: "text",
            tagName: "text",
            parent: {} /* Reference to the parent node */, 
            content: "1"
        }]
    },{
        type: "tag",
        tagName: "div",
        attr: {},
        parent: {} /* Reference to the parent node */, 
        children: [{
            type: "text",
            tagName: "text",
            parent: {} /* Reference to the parent node */, 
            content: "11"
        }]
    }]
}
```

When using the `diff` algorithm for partial updates, it is necessary to compare the differences between the old `DOM` structure and the new `DOM` structure. At this point, `VNode` is used to describe the entire `DOM` structure. First, a `Virtual DOM` is generated based on the real `DOM`. When the data of a `VNode` changes, a new `VNode` is created. Then, a comparison is made between `newVNode` and `oldVNode`. Any differences found are then patched into the corresponding real `DOM` nodes through the `elm` property of `VNode`, after which the old `Virtual DOM` is replaced with the new `Virtual DOM`.

## Diff Algorithm
When data changes, the `set` method will call `Dep.notify` to notify all subscribers (`Watcher`) of the data update. Subscribers will then call `patch` to compare and render the corresponding parts to the real `DOM` structure.

### Time Complexity
A complete `diff` requires a time complexity of `O(n^3)`. This is a minimum edit distance problem. When comparing the minimum edit distance of strings using a dynamic programming approach, the required time complexity is `O(mn)`. However, for a `DOM`, which is a tree structure, the time complexity of the minimum edit distance problem has evolved from `O(m^3n^3)` to `O(n^3)` over more than 30 years of development. If interested, one can research the paper at `https://grfia.dlsi.ua.es/ml/algorithms/references/editsurvey_bille.pdf`.  
It is obviously inappropriate for the `diff` algorithm, which was originally introduced to improve efficiency, to have a time complexity of `O(n^3`. With 1,000 nodes, for example, it would require a billion comparisons, making it an expensive algorithm. Therefore, some compromises must be made to speed up the process. By simplifying the comparisons through some strategies, the time complexity is reduced to `O(n)`. Although it is not the minimum edit distance, this compromise between edit distance and time performance is a good solution.

### Diff Strategy

The `O(n)` time complexity mentioned above is achieved through a certain strategy. `React` mentions two assumptions, which also apply in `Vue`:
- Different types of elements will result in different trees.
- With the `key` property attached to the renderer, developers can indicate which child elements might be stable.

In simpler terms:
- Only perform comparison at the same level. If there are moves across levels, they are considered as creation and deletion operations.
- If the elements are of different types, it is considered as creating a new element, rather than recursively comparing their children.
- For list elements and similar content, the `key` can uniquely determine whether it's a move, create, or delete operation.

Several scenarios may arise after comparison, and corresponding operations can be carried out:
- The node is added or removed `→` add or remove a new node.
- The attributes are changed `→` change old attributes to new attributes.
- The text content is changed `→` change the old content to the new content.
- Whether the node `tag` or `key` is changed `→` if changed, remove and create a new element.

### Analysis

The `diff` algorithm implementation in the `Vue` source code is in the `dev/src/core/vdom/patch.js` file. However, the implementation in the `Vue` source code is quite complex. The article analyzes the core part of the code after being simplified, with the commit ID being `43b98fe`.

When the `patch` method is called, it checks whether it's a `VNode`. The `isRealElement` actually judges whether it is a real `DOM` based on the existence of the `nodeType`. A `VNode` does not have this field. If it's not a real `DOM` element and the two nodes are the same, then it will enter the `if` block, call `patchVnode` to perform `diff` on the `children` to determine how to update.

```javascript
// line 714
const isRealElement = isDef(oldVnode.nodeType)
if (!isRealElement && sameVnode(oldVnode, vnode)) {
    // patch existing root node
    patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly)
}else{
    // ...
}
```

Next, let's look at the `sameVnode` method to determine what counts as the same node.
```javascript
// line 35
function sameVnode (a, b) {
  return (
    a.key === b.key && (
      (
        a.tag === b.tag &&
        a.isComment === b.isComment &&
        isDef(a.data) === isDef(b.data) &&
        sameInputType(a, b)
      ) || (
        isTrue(a.isAsyncPlaceholder) &&
        a.asyncFactory === b.asyncFactory &&
        isUndef(b.asyncFactory.error)
      )
    )
  )
}
```
The main criteria for judgment here are:
- The `key` must be the same, or both being `undefined` also counts as the same.
- The tags of the `DOM` elements must be the same.

If the above conditions are met, then it is deemed as the same `VNode`, and the `patchVnode` operation can proceed. Otherwise, it is considered as a completely new `VNode`, and the `createElm` will be executed after the above judgment.

In summary, after entering `patch`, there are two branches that can be taken. If it's the first time to `patch`, i.e., when the component is first mounted, or if it is found that the elements have different tags, then it is considered as different elements, and a new `DOM` element is directly created through `createElm` to replace the old one. Otherwise, for the existing `DOM` elements, update is performed through `patchVnode` to optimize performance by conditionally updating. This way, the first principle in the strategy is implemented, i.e., different types of elements will result in different trees. Once two different element types are found, the old one is deleted and a new one is created, rather than recursively comparing them.
After recognizing these as the same `VNode`, it is necessary to compare and update the differences of the current element, as well as recursively compare the `children`, which is implemented in the `patchVnode` method.

```javascript
// line 501
function patchVnode (oldVnode, vnode, insertedVnodeQueue, removeOnly) {
    // ...
    if (isDef(data) && isPatchable(vnode)) {
      for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode)
      if (isDef(i = data.hook) && isDef(i = i.update)) i(oldVnode, vnode)
    }
    //...
}
```
`cbs.update` is mainly used to update `attributes`. The `cbs` here actually comes from `hooks`. `hooks` is defined on line `33` as follows: `const hooks = ['create', 'activate', 'update', 'remove', 'destroy']`. It is used to perform corresponding operations at various stages of `VNode` update. `cbs.update` contains the following callbacks: `updateAttrs`, `updateClass`, `updateDOMListeners`, `updateDOMProps`, `updateStyle`, `update`, `updateDirectives`, which are mainly used to update some related `attributes` of the current node.  
Then, the child nodes need to be updated, which is divided into two cases:
* If the child is not a `textNode`, it needs to be processed in three different cases.
* If the current child is a `textNode`, updating the `text` directly is sufficient.

Three cases for children as `VNode`:
* There are new children without old children, create new ones directly.
* There are old children without new children, remove the old ones directly.
* Both new and old children exist, then call `updateChildren`.

```javascript
if (isUndef(vnode.text)) {
  if (isDef(oldCh) && isDef(ch)) {
    if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
  } else if (isDef(ch)) {
    if (process.env.NODE_ENV !== 'production') {
      checkDuplicateKeys(ch)
    }
    if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
    addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
  } else if (isDef(oldCh)) {
    removeVnodes(oldCh, 0, oldCh.length - 1)
  } else if (isDef(oldVnode.text)) {
    nodeOps.setTextContent(elm, '')
  }
} else if (oldVnode.text !== vnode.text) {
  nodeOps.setTextContent(elm, vnode.text)
}
```

When both old and new children exist, then `updateChildren` method is called. For each child node, we still have these possibilities:
* Updated node
* Deleted node
* Added node
* Moved node

`updateChildren` is the core algorithm of `diff`, and its source code implementation is as follows.

```javascript
// line 404
function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
    let oldStartIdx = 0;
    let newStartIdx = 0;
    let oldEndIdx = oldCh.length - 1;
    let oldStartVnode = oldCh[0];
    let oldEndVnode = oldCh[oldEndIdx];
    let newEndIdx = newCh.length - 1;
    let newStartVnode = newCh[0];
    let newEndVnode = newCh[newEndIdx];
    let oldKeyToIdx, idxInOld, vnodeToMove, refElm;

    // The removeOnly flag is exclusively used by <transition-group>
    // to ensure that removed elements remain in the correct relative positions
    // during leaving transitions.
    const canMove = !removeOnly;

    if (process.env.NODE_ENV !== 'production') {
        checkDuplicateKeys(newCh);
    }

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
        if (isUndef(oldStartVnode)) {
            oldStartVnode = oldCh[++oldStartIdx]; // The Vnode has been moved left.
        } else if (isUndef(oldEndVnode)) {
            oldEndVnode = oldCh[--oldEndIdx];
        } else if (sameVnode(oldStartVnode, newStartVnode)) {
            patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
            oldStartVnode = oldCh[++oldStartIdx];
            newStartVnode = newCh[++newStartIdx];
        } else if (sameVnode(oldEndVnode, newEndVnode)) {
            patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
            oldEndVnode = oldCh[--oldEndIdx];
            newEndVnode = newCh[--newEndIdx];
        } else if (sameVnode(oldStartVnode, newEndVnode)) { // The Vnode moved right.
            patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
            canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm));
            oldStartVnode = oldCh[++oldStartIdx];
            newEndVnode = newCh[--newEndIdx];
        } else if (sameVnode(oldEndVnode, newStartVnode)) { // The Vnode moved left.
            patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
            canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
            oldEndVnode = oldCh[--oldEndIdx];
            newStartVnode = newCh[++newStartIdx];
        } else {
            if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
            idxInOld = isDef(newStartVnode.key) ? oldKeyToIdx[newStartVnode.key] : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);
            if (isUndef(idxInOld)) { // New element
                createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
            } else {
                vnodeToMove = oldCh[idxInOld];
                if (sameVnode(vnodeToMove, newStartVnode)) {
                    patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
                    oldCh[idxInOld] = undefined;
                    canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm);
                } else {
                    // The same key but different element. Treat as a new element.
                    createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
                }
            }
            newStartVnode = newCh[++newStartIdx];
        }
    }
    if (oldStartIdx > oldEndIdx) {
        refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
        addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
    } else if (newStartIdx > newEndIdx) {
        removeVnodes(oldCh, oldStartIdx, oldEndIdx);
    }
}
```

Its `children` two arrays `new` and `old` separately used a pointer at the beginning, four pointers in total. Because the pointer only traversed the array once, the time complexity is `O(n)`. Let's illustrate the `diff` process with a simple example.

```
old VNode: a(oldStartIdx) b c d e f(oldEndIdx)
new VNode: b(newStartIdx) f g(newEndIdx)
DOM Node:  a b c d e f
```

First, the pointers are compared with each other, four types of comparisons, which are `oldStartIdx` and `newStartIdx`, `oldStartIdx` and `newEndIdx`, `oldEndIdx` and `newStartIdx`, and `oldEndIdx` and `newEndIdx`. If there is no equal, the process continues. At this point, there are two possibilities, with and without a `key`. Without a `key`, a new `DOM Node` is directly created and inserted before `a(oldStartIdx)`. Assuming that a `key` exists here, with the `key`, take the `key` value of `newStartIdx` and go to `old VNode` to find it, record the current `oldKeyToIdx`, then adjust the `VNode`, move `b` to before `a`, then find the node value corresponding to `oldKeyToIdx` in `old VNode` and set it as `undefined`, `newStartIdx` pointer moves towards the middle, i.e., `++newStartIdx`.

```
old VNode: a(oldStartIdx) undefined c d e f(oldEndIdx)
new VNode: b f(newStartIdx) g(newEndIdx)
DOM Node:  b a c d e f
```

The loop continues, at this time comparing `oldStartIdx` and `newStartIdx`, `oldStartIdx` and `newEndIdx`, `oldEndIdx` and `newStartIdx`, `oldEndIdx` and `newEndIdx`, it is found that `newStartIdx` is the same as `oldEndIdx`, so move `f` in the `DOM Node` to before `a` in the `DOM Node`, at this point, `newStartIdx` and `oldEndIdx` pointers move towards the middle, i.e., `++newStartIdx` and `--oldEndIdx`.

```
old VNode: a(oldStartIdx) undefined c d e(oldEndIdx) f
new VNode: b f g(newStartIdx)(newEndIdx)
DOM Node:  b f a c d e
```

The loop continues, at this time comparing `oldStartIdx` and `newStartIdx`, `oldStartIdx` and `newEndIdx`, `oldEndIdx` and `newStartIdx`, `oldEndIdx` and `newEndIdx`. There are no same circumstances found. Take the `key` value of `newStartIdx`, go to `old VNode` to find it, no same value is found, so create a node directly and insert it before `a(oldStartIdx)` in the `DOM Node`, `newStartIdx` pointer moves towards the middle, i.e., `++newStartIdx`.

```
old VNode: a(oldStartIdx) undefined c d e(oldEndIdx) f
new VNode: b f g(newEndIdx) (newStartIdx)
DOM Node:  b f g a c d e
```

At this point, the loop ends, there are two choices:
* If `oldStartldx > oldEndldx`, it means the old nodes have been traversed, and there are more new nodes, so these extra new nodes need to be created and added to the real `DOM Node`.
* If `newStartldx >newEndldx`, it means the new nodes have been traversed, and there are more old nodes, so these extra old nodes need to be removed from the real `DOM Node`.

At this point, we meet Scenario Two, so it is necessary to remove the nodes in the range `[oldStartldx, oldEndldx]` from the real `DOM Node`. According to the aforementioned content, it is necessary to delete the four nodes `a c d e`, and thus the `diff` is completed.

```
old VNode: a(oldStartIdx) undefined c d e(oldEndIdx) f
new VNode: b f g(newEndIdx) (newStartIdx)
DOM Node:  b f g
```
After the `diff` is completed, the `new VNode` is used as the `old VNode` for the next `diff`. Additionally, about the component `diff`, the component-level `diff` algorithm is relatively simple. If the nodes are different, create and replace, if the nodes are the same, update their child nodes. Lastly, `createElm` is called to create real `DOM` elements based on `VNode`. If it is a component, `createComponent` will return `true`, so the subsequent operation will not be performed, and if it is not a component, the node creation work will be performed, and the child nodes will be recursively created.

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```plaintext
- [GitHub - How to become a more professional programmer?](https://github.com/aooy/blog/issues/2)
- [Zhihu - What are the best resources for learning JavaScript?](https://www.zhihu.com/question/66851503)
- [Juejin - Mastering the art of React Hooks](https://juejin.im/post/6844903607913938951)
- [Juejin - The future of web development: WebAssembly](https://juejin.im/post/6844903592483094535)
- [React Documentation - Understanding Reconciliation in React](https://reactjs.org/docs/reconciliation.html)
- [Cnblogs - Deep dive into the new features of ES2020](https://www.cnblogs.com/lilicat/p/13448827.html)
- [Cnblogs - How to optimize the performance of React applications](https://www.cnblogs.com/lilicat/p/13448915.html)
- [GitHub - Detailed analysis of the React Fiber architecture](https://github.com/lihongxun945/myblog/issues/33)
- [Cnblogs - An in-depth look at JavaScript event loop](https://www.cnblogs.com/xujiazheng/p/12101764.html)
- [CSDN Blog - Exploring the possibilities of GraphQL](https://blog.csdn.net/dongcehao/article/details/106987886)
- [CSDN Blog - Best practices for structuring a Redux application](https://blog.csdn.net/qq2276031/article/details/106407647)
- [GitHub - Exploring different ways to optimize website performance](https://github.com/Advanced-Frontend/Daily-Interview-Question/issues/151)
- [LeetCode - Solution to the "Edit Distance" problem](https://leetcode-cn.com/problems/edit-distance/solution/bian-ji-ju-chi-by-leetcode-solution/)
```