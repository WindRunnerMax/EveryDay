# Vue中虚拟DOM的理解
`Virtual DOM`是一棵以`JavaScript`对象作为基础的树，每一个节点称为`VNode`，用对象属性来描述节点，实际上它是一层对真实`DOM`的抽象，最终可以通过渲染操作使这棵树映射到真实环境上，简单来说`Virtual DOM`就是一个`Js`对象，用以描述整个文档。

## 描述
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

在`Vue`中首先会解析`template`中定义的`HTML`节点以及组件节点，为`render`作准备，在解析的过程中会生成`_c()`、`_v()`等函数，其作为`renderHelpers`用以创建节点，`_v()`函数就是用以创建文本节点，而`_c()`函数就是用以创建`VNode`节点的，这个函数其实就是`Vue`中定义的`_createElement()`函数，通过这个函数来确定创建的是普通节点还是组件节点，具体可以在`Vue`源码中`/dev/src/core/vdom/create-element.js`以及`/dev/src/core/vdom/create-element.js`查阅，当解析完成之后，便能够生成`render`函数，而当`render`函数执行后便返回了`VNode`节点组成的虚拟`DOM`树，树中的每一颗节点都会存储渲染的时候需要的信息，之后便是通过`diff`算法以及`patch`过程的`createElm`或`patchVnode`渲染到真实`DOM`。

```javascript
if (typeof tag === 'string') {
let Ctor
ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag)
if (config.isReservedTag(tag)) {
  // platform built-in elements
  if (process.env.NODE_ENV !== 'production' && isDef(data) && isDef(data.nativeOn)) {
    warn(
      `The .native modifier for v-on is only valid on components but it was used on <${tag}>.`,
      context
    )
  }
  vnode = new VNode(
    config.parsePlatformTagName(tag), data, children,
    undefined, undefined, context
  )
} else if ((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
  // component
  vnode = createComponent(Ctor, data, context, children, tag)
} else {
  // unknown or unlisted namespaced elements
  // check at runtime because it may get assigned a namespace when its
  // parent normalizes children
  vnode = new VNode(
    tag, data, children,
    undefined, undefined, context
  )
}
} else {
// direct component options / constructor
vnode = createComponent(tag, data, context, children)
}
```

## 作用
渲染真实`DOM`的过程中开销是很大的，例如当有时候修改了某个数据或者属性，如果直接渲染到真实`DOM`上可能会引起整个`DOM`树的重绘与回流，而`diff`算法能够只更新修改的那部分`DOM`结构而不更新整个`DOM`，这里需要说明的是操作`DOM`结构的速度并不慢，而性能消耗主要是在浏览器重绘与回流的操作上。  
当选用`diff`算法进行部分更新的时候就需要比较旧`DOM`结构与新`DOM`结构的不同，此时就需要`VNode`来描述整个`DOM`结构，首先根据真实`DOM`生成`Virtual DOM`，当`Virtual DOM`某个节点的数据改变后会生成一个新的`Vnode`，然后通过`newVNode`和`oldVNode`进行对比，发现有不同之处便进行`patch`修改于真实`DOM`，然后使旧的`Virtual DOM`赋值为新的`Virtual DOM`。  
简单来说建立`Virtual DOM`的目的是减少对于整个`DOM`的操作，通过建立`Virtual DOM`来追踪如何改变真实`DOM`，从而实现更高效地更新节点。  
使用`Virtual DOM`同样也是有部分缺点，代码更多，体积更大，内存占用增大，对于小量的单一的`DOM`修改使用虚拟`DOM`成本反而更高，但是整体来说，使用`Virtual DOM`是优点远大于缺点的。

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://juejin.im/post/6844903607913938951
https://segmentfault.com/a/1190000018211084
https://github.com/lihongxun945/myblog/issues/32
https://cloud.tencent.com/developer/article/1004551
https://www.cnblogs.com/fundebug/p/vue-virtual-dom.html
https://blog.csdn.net/u010692018/article/details/78799335/
```
