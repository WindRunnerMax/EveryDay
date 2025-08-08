# Understanding Virtual DOM in Vue
`Virtual DOM` is a tree based on JavaScript objects, where each node is called `VNode`, and is used to describe nodes through object properties. Essentially, it is an abstraction layer over the real DOM, which can ultimately be mapped to the actual environment through rendering operations. In simple terms, `Virtual DOM` is just a JavaScript object used to describe the entire document.

## Description
When building a web page in a browser, it is necessary to use DOM nodes to describe the entire document.

```html
<div class="root" name="root">
    <p>1</p>
    <div>11</div>
</div>
```

If the above nodes and document are described using JavaScript objects, it would look something like the following. Of course, this is not the object used to describe nodes in Vue. In Vue, an object used to describe a node includes a large number of properties, such as `tag`, `data`, `children`, `text`, `elm`, `ns`, `context`, `key`, `componentOptions`, `componentInstance`, `parent`, `raw`, `isStatic`, `isRootInsert`, `isComment`, `isCloned`, etc. For specific properties, please refer to the `Vue` source code in `/dev/src/core/vdom/vnode.js`.

```javascript
{
    type: "tag",
    tagName: "div",
    attr: {
        className: "root",
        name: "root"
    },
    parent: null,
    children: [{
        type: "tag",
        tagName: "p",
        attr: {},
        parent: {} /* reference to the parent node */, 
        children: [{
            type: "text",
            tagName: "text",
            parent: {} /* reference to the parent node */, 
            content: "1"
        }]
    },{
        type: "tag",
        tagName: "div",
        attr: {},
        parent: {} /* reference to the parent node */, 
        children: [{
            type: "text",
            tagName: "text",
            parent: {} /* reference to the parent node */, 
            content: "11"
        }]
    }]
}
```

In `Vue`, the HTML nodes and component nodes defined in the `template` are first parsed to prepare for the `render` process. During the parsing process, functions such as `_c()` and `_v()` are generated and used as `renderHelpers` for creating nodes. The `_v()` function is used to create text nodes, while the `_c()` function is used to create `VNode` nodes. This function is actually the `_createElement()` function defined in Vue. To determine whether to create a normal node or a component node, refer to the `Vue` source code in `/dev/src/core/vdom/create-element.js` and `/dev/src/core/vdom/create-element.js`. Once parsing is complete, the `render` function is generated. When the `render` function is executed, it returns a virtual `DOM` tree composed of `VNode` nodes. Each node in the tree stores the information needed for rendering. Subsequently, the tree is rendered to the real DOM using the `diff` algorithm and the `createElm` or `patchVnode` process in the `patch` process.

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

## Purpose
The process of rendering real `DOM` is quite expensive. For example, when a certain data or attribute is modified, directly rendering it to the real `DOM` may cause the entire `DOM` tree to be redrawn and reflowed. The `diff` algorithm can update only the modified part of the `DOM` structure without updating the entire `DOM`. It is important to note that the speed of manipulating the `DOM` structure is not slow; rather, the performance overhead primarily lies in the browser's redraw and reflow operations.  
When using the `diff` algorithm for partial updates, it is necessary to compare the differences between the old `DOM` structure and the new `DOM` structure. At this point, `VNode` is needed to describe the entire `DOM` structure. First, generate a `Virtual DOM` based on the real `DOM`. When the data of a node in the `Virtual DOM` changes, a new `VNode` is generated. Then, compare the `newVNode` and `oldVNode` to find the differences and perform `patch` modifications on the real `DOM`, and then assign the old `Virtual DOM` to the new `Virtual DOM`.  
In simple terms, the purpose of creating a `Virtual DOM` is to reduce the operation on the entire `DOM`, track how to change the real `DOM` by creating a `Virtual DOM`, and achieve more efficient node updates.  
Using `Virtual DOM` also has some disadvantages: more code, larger volume, and increased memory usage. The cost of using virtual `DOM` for small, single `DOM` modifications is actually higher. However, overall, the advantages of using `Virtual DOM` far outweigh the disadvantages.

## Daily Question
```
https://github.com/WindrunnerMax/EveryDay
```

## References
```
https://juejin.im/post/6844903607913938951
https://segmentfault.com/a/1190000018211084
https://github.com/lihongxun945/myblog/issues/32
https://cloud.tencent.com/developer/article/1004551
https://www.cnblogs.com/fundebug/p/vue-virtual-dom.html
https://blog.csdn.net/u010692018/article/details/78799335/
```