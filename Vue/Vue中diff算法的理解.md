# Vue中diff算法的理解
`diff`算法用来计算出`Virtual DOM`中改变的部分，然后针对该部分进行`DOM`操作，而不用重新渲染整个页面，渲染整个`DOM`结构的过程中开销是很大的，需要浏览器对`DOM`结构进行重绘与回流，而`diff`算法能够使得操作过程中只更新修改的那部分`DOM`结构而不更新整个`DOM`，这样能够最小化操作`DOM`结构，能够最大程度上减少浏览器重绘与回流的规模。

## 虚拟DOM
`diff`算法的基础是`Virtual DOM`，`Virtual DOM`是一棵以`JavaScript`对象作为基础的树，每一个节点称为`VNode`，用对象属性来描述节点，实际上它是一层对真实`DOM`的抽象，最终可以通过渲染操作使这棵树映射到真实环境上，简单来说`Virtual DOM`就是一个`Js`对象，用以描述整个文档。  
在浏览器中构建页面时需要使用`DOM`节点描述整个文档。

```html
<div class="root" name="root">
    <p>1</p>
    <div>11</div>
</div>
```

如果使用`Js`对象去描述上述的节点以及文档，那么便类似于下面的样子，当然这不是`Vue`中用以描述节点的对象，`Vue`中用以描述一个节点的对象包括大量属性，例如`tag`、`data`、`children`、`text`、`elm`、`ns`、`context`、`key`、`componentOptions`、`componentInstance`、`parent`、`raw`、`isStatic`、`isRootInsert`、`isComment`、`isCloned`等等，具体的属性可以参阅`Vue`源码的`/dev/src/core/vdom/vnode.js`。

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
        parent: {} /* 父节点的引用 */, 
        children: [{
            type: "text",
            tagName: "text",
            parent: {} /* 父节点的引用 */, 
            content: "1"
        }]
    },{
        type: "tag",
        tagName: "div",
        attr: {},
        parent: {} /* 父节点的引用 */, 
        children: [{
            type: "text",
            tagName: "text",
            parent: {} /* 父节点的引用 */, 
            content: "11"
        }]
    }]
}
```
当选用`diff`算法进行部分更新的时候就需要比较旧`DOM`结构与新`DOM`结构的不同，此时就需要`VNode`来描述整个`DOM`结构，首先根据真实`DOM`生成`Virtual DOM`，当`Virtual DOM`某个节点的数据改变后会生成一个新的`Vnode`，然后通过`newVNode`和`oldVNode`进行对比，发现有不同之处便通过在`VNode`中`elm`属性相对应的真实`DOM`节点进行`patch`修改于真实`DOM`，然后使旧的`Virtual DOM`赋值为新的`Virtual DOM`。 

## diff算法
当数据发生改变时，`set`方法会让调用`Dep.notify`通知所有订阅者`Watcher`数据发生更新，订阅者就会调用`patch`进行比较，然后将相应的部分渲染到真实`DOM`结构。  

### 时间复杂度
首先进行一次完整的`diff`需要`O(n^3)`的时间复杂度，这是一个最小编辑距离的问题，在比较字符串的最小编辑距离时使用动态规划的方案需要的时间复杂度是`O(mn)`，但是对于`DOM`来说是一个树形结构，而树形结构的最小编辑距离问题的时间复杂度在`30`多年的演进中从`O(m^3n^3)`演进到了`O(n^3)`，关于这个问题如果有兴趣的话可以研究一下论文`https://grfia.dlsi.ua.es/ml/algorithms/references/editsurvey_bille.pdf`。   
对于原本想要提高效率而引入的`diff`算法使用`O(n^3)`的时间复杂度显然是不太合适的，如果有`1000`个节点元素将需要进行十亿次比较，这是一个昂贵的算法，所以必须有一些妥协来加快速度，对比较通过一些策略进行简化，将时间复杂度缩小到`O(n)`，虽然并不是最小编辑距离，但是作为编辑距离与时间性能的折中是一个比较好的解决方案。

### diff策略
上边提到的`O(n)`时间复杂度是通过一定策略进行的，`React`中提到了两个假设，在`Vue`中同样适用：
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
实现`diff`算法的部分在`Vue`源码中的`dev/src/core/vdom/patch.js`文件中，不过`Vue`源码的实现比较复杂，文章分析比较核心的代码部分，精简过后的最小化版本，`commit id`为`43b98fe`。  
在调用`patch`方法时，会判断是否是`VNode`，`isRealElement`其实就是根据有没有`nodeType`来判断是不是真实`DOM`，`VNode`是不存在这个字段的，如果不是真实`DOM`元素，并且这两个节点是相同的，那就就会进入这个`if`内部，调用`patchVnode`对`children`进行`diff`以决定该如何更新。

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

接下来看一下`sameVnode`方法，判断如何算是相同节点。
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
这里的判断条件其实主要是两个：
* `key`必须相同，如果都是`undefined`则也是相同的。
* `DOM`元素的标签必须相同。

如果满足以上条件，那么就认为是相同的`VNode`，因此就可以进行`patchVnode`操作，如果不是就认为是完全新的一个`VNode`，就会在上边的判断后执行下面的`createElm`。  
梳理一下逻辑，当进入`patch`之后有两种分支可以走，如果是第一次`patch`，即组件第一次挂载的时候，或者发现元素的标签不相同了，那么就认为是不同的元素，直接进行`createElm` 创建新的`DOM`元素进行替换，否则，就是对已存在的`DOM`元素进行更新，那么通过`patchVnode`进行`diff`，有条件的更新以提升性能，这样其实就实现了策略中原则的第一条，即两个不同类型的元素将产生不同的树，只要发现两个元素的类型不同，我们直接删除旧的并创建一个新的，而不是去递归比较。  
在认为这是两个相同的`VNode`之后，就需要比较并更新当前元素的差异，以及递归比较`children`，在`patchVnode`方法中实现了这两部分。

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
`cbs.update`主要是用来更新`attributes`的，这里的`cbs`其实是从`hooks`中来的，`hooks`在`33`行有如下定义，`const hooks = ['create', 'activate', 'update', 'remove', 'destroy']`，其是在`VNode`更新的各个阶段进行相应的操作，这里`cbs.update`包含如下几个回调：`updateAttributes`、`updateClass`、`updateDOMListeners`、`updateDOMProps`、`updateStyle`、`update`、`updateDirectives`，其主要都是更新当前结点的一些相关`attributes`。  
之后需要更新孩子节点，这时候分两种情况：
* 如果孩子不是`textNode`，那么需要再分三种情况处理。
* 如果当前孩子是`textNode`那么直接更新`text`即可。

对孩子是`VNode`的三种情况：
* 有新孩子无旧孩子，直接创建新的。
* 有旧孩子无新孩子，直接删除旧的。
* 新旧孩子都有，那么调用`updateChildren`。

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

当新旧孩子都存在，那么便调用`updateChildren`方法，对于每一个孩子节点，我们依然有这么几种可能：
* 更新了节点
* 删除了节点
* 增加了节点
* 移动了节点

`updateChildren`是`diff`的核心算法，源代码实现如下。
```javascript
// line 404
function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
    let oldStartIdx = 0
    let newStartIdx = 0
    let oldEndIdx = oldCh.length - 1
    let oldStartVnode = oldCh[0]
    let oldEndVnode = oldCh[oldEndIdx]
    let newEndIdx = newCh.length - 1
    let newStartVnode = newCh[0]
    let newEndVnode = newCh[newEndIdx]
    let oldKeyToIdx, idxInOld, vnodeToMove, refElm
    
    // removeOnly is a special flag used only by <transition-group>
    // to ensure removed elements stay in correct relative positions
    // during leaving transitions
    const canMove = !removeOnly
    
    if (process.env.NODE_ENV !== 'production') {
      checkDuplicateKeys(newCh)
    }
    
    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx] // Vnode has been moved left
      } else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx]
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
        oldStartVnode = oldCh[++oldStartIdx]
        newStartVnode = newCh[++newStartIdx]
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx)
        oldEndVnode = oldCh[--oldEndIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx)
        canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm))
        oldStartVnode = oldCh[++oldStartIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
        canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
        oldEndVnode = oldCh[--oldEndIdx]
        newStartVnode = newCh[++newStartIdx]
      } else {
        if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
        idxInOld = isDef(newStartVnode.key)
          ? oldKeyToIdx[newStartVnode.key]
          : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx)
        if (isUndef(idxInOld)) { // New element
          createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
        } else {
          vnodeToMove = oldCh[idxInOld]
          if (sameVnode(vnodeToMove, newStartVnode)) {
            patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
            oldCh[idxInOld] = undefined
            canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm)
          } else {
            // same key but different element. treat as new element
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
          }
        }
        newStartVnode = newCh[++newStartIdx]
      }
    }
    if (oldStartIdx > oldEndIdx) {
      refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm
      addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue)
    } else if (newStartIdx > newEndIdx) {
      removeVnodes(oldCh, oldStartIdx, oldEndIdx)
    }
}
```

其对新旧两个`children`数组分别在首位各用了一个指针，总共四个指针，由于指针仅仅对数组进行了一次遍历，因此时间复杂度是`O(n)`，举个简单例子说明`diff`过程。

```
old VNode: a(oldStartIdx) b c d e f(oldEndIdx)
new VNode: b(newStartIdx) f g(newEndIdx)
DOM Node:  a b c d e f
```

首先指针相互比较，即四种对比，分别为`oldStartIdx`和`newStartIdx`、`oldStartIdx`和`newEndIdx`、`oldEndIdx`和`newStartIdx`、`oldEndIdx`和`newEndIdx`，如果没有相等的则继续。此时分为两种情况，有`key`和无`key`，无`key`则直接创建新的`DOM Node`插入到`a(oldStartIdx)`之前，此处认为`key`存在，有`key`的话取`newStartIdx`的`key`值，到`old VNode`去找，记录此时的`oldKeyToIdx`，随即调整`VNode`，将`b`移动到`a`之前，然后找到`old VNode`中`oldKeyToIdx`对应的节点值设置为`undefined`，`newStartIdx`指针向中间靠拢，即`++newStartIdx`。

```
old VNode: a(oldStartIdx) undefined c d e f(oldEndIdx)
new VNode: b f(newStartIdx) g(newEndIdx)
DOM Node:  b a c d e f
```

循环继续，此时对比`oldStartIdx`和`newStartIdx`、`oldStartIdx`和`newEndIdx`、`oldEndIdx`和`newStartIdx`、`oldEndIdx`和`newEndIdx`，发现`newStartIdx`与`oldEndIdx`相同，将`DOM Node`中的`f`进行移动调整到`DOM Node`中的`a(oldStartIdx)`之前，此时`newStartIdx`与`oldEndIdx`指针向中间靠拢，即`++newStartIdx`与`--oldEndIdx`。

```
old VNode: a(oldStartIdx) undefined c d e(oldEndIdx) f
new VNode: b f g(newStartIdx)(newEndIdx)
DOM Node:  b f a c d e
```
循环继续，此时对比`oldStartIdx`和`newStartIdx`、`oldStartIdx`和`newEndIdx`、`oldEndIdx`和`newStartIdx`、`oldEndIdx`和`newEndIdx`，并没有相同的情况，取`newStartIdx`的`key`值，到`old VNode`去找，没有发现相同的值，则直接创建一个节点插入到`DOM Node`中的`a(oldStartIdx)`之前，`newStartIdx`指针向中间靠拢，即`++newStartIdx`。

```
old VNode: a(oldStartIdx) undefined c d e(oldEndIdx) f
new VNode: b f g(newEndIdx) (newStartIdx)
DOM Node:  b f g a c d e
```

此时循环结束，有两个选择：
* 如果`oldStartldx > oldEndldx`，说明老节点遍历完成了，新的节点比较多，所以多出 来的这些新节点，需要创建出来并添加到真实`DOM Node`后面。
* 如果`newStartldx >newEndldx`，说明新节点遍历完成了，老的节点比较多，所以多 出来的这些老节点，需要从真实`DOM Node`中删除这些节点。

此时我们符合场景二，所以需要从真实`DOM Node`中删除`[oldStartldx，oldEndldx]`区间 中的`Node`节点，根据上述内容，即需要删除`a c d e`四个节点，至此`diff`完成。
```
old VNode: a(oldStartIdx) undefined c d e(oldEndIdx) f
new VNode: b f g(newEndIdx) (newStartIdx)
DOM Node:  b f g
```
`diff`完成之后便是将`new VNode`作为`old VNode`以便下次`diff`时使用，此外关于组件的`diff`，组件级别的`diff`算法比较简单，节点不相同就进行创建和替换，节点相同的话就会对其子节点进行更新，最后关于调用`createElm`来根据`VNode`创建真实的`DOM`元素，如果是一个组件，那么 `createComponent`会返回`true`，因此不会进行接下来的操作，如果不是组件，会进行节点创建工作，并会递归对孩子创建节点。


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://github.com/aooy/blog/issues/2
https://www.zhihu.com/question/66851503
https://juejin.im/post/6844903607913938951
https://juejin.im/post/6844903592483094535
https://reactjs.org/docs/reconciliation.html
https://www.cnblogs.com/lilicat/p/13448827.html
https://www.cnblogs.com/lilicat/p/13448915.html
https://github.com/lihongxun945/myblog/issues/33
https://www.cnblogs.com/xujiazheng/p/12101764.html
https://blog.csdn.net/dongcehao/article/details/106987886
https://blog.csdn.net/qq2276031/article/details/106407647
https://github.com/Advanced-Frontend/Daily-Interview-Question/issues/151
https://leetcode-cn.com/problems/edit-distance/solution/bian-ji-ju-chi-by-leetcode-solution/
```
