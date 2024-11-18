# New Features of Vue 3.0
The design goals of `Vue 3.0` can be summarized as smaller size, faster speed, enhanced `TypeScript` support, improved `API` design consistency, increased maintainability, and more open underlying features.

## Description
A detailed comparison of some important aspects from `Vue 2` to `Vue 3`.

### Changes in Lifecycle
* `Vue 2 -> Vue 3`
* `beforeCreate -> setup`
* `created -> setup`
* `beforeMount -> onBeforeMount`
* `mounted -> onMounted`
* `beforeUpdate -> onBeforeUpdate`
* `updated -> onUpdated`
* `beforeDestroy -> onBeforeUnmount`
* `destroyed -> onUnmounted`
* `activated -> onActivated`
* `deactivated -> onDeactivated`
* `errorCaptured -> onErrorCaptured`
* `renderTracked -> onRenderTracked`
* `renderTriggered -> onRenderTriggered`

The main change here is the addition of the `setup` lifecycle, while the other lifecycles are called in the form of `API`. In fact, with the introduction of the `Composition API`, the way we access these hooks has changed. All of our lifecycles should be written in `setup`, which should be implemented in most component codes and handle reactivity and lifecycle hook functions.

```javascript
import { onBeforeMount, 
    onMounted, 
    onBeforeUpdate, 
    onUpdated, 
    onBeforeUnmount, 
    onUnmounted, 
    onActivated, 
    onDeactivated, 
    onErrorCaptured, 
    onRenderTracked,  
    onRenderTriggered
} from "vue";

export default {
    setup() {
        onBeforeMount(() => {
            // ... 
        })
        onMounted(() => {
            // ... 
        })
        onBeforeUpdate(() => {
            // ... 
        })
        onUpdated(() => {
            // ... 
        })
        onBeforeUnmount(() => {
            // ... 
        })
        onUnmounted(() => {
            // ... 
        })
        onActivated(() => {
            // ... 
        })
        onDeactivated(() => {
            // ... 
        })
        onErrorCaptured(() => {
            // ... 
        })
        onRenderTracked(() => {
            // ... 
        })
        onRenderTriggered(() => {
            // ... 
        })
    }
}
```

### Using Proxy Instead of defineProperty
`Vue 2` achieves reactivity through data interception, with the core method being `Object.defineProperty()` to intercept properties. This method allows precise addition or modification of object properties using property descriptors with `getter` and `setter` access descriptors to achieve interception. The reason why `Vue 2` can only be compatible with `IE8` is mainly because `defineProperty` is not compatible with `IE8`, and there are also slight compatibility issues with other browsers.

```javascript
var obj = { __x: 1 };
Object.defineProperty(obj, "x", {
    set: function(x){ console.log("watch"); this.__x = x; },
    get: function(){ return this.__x; }
});
obj.x = 11; // watch
console.log(obj.x); // 11
```
`Vue3` uses `Proxy` to achieve data interception. `Object.defineProperty` can only monitor properties, while `Proxy` can monitor the entire object. By calling `new Proxy()`, a proxy can be created to replace another object known as the target. This proxy virtually represents the target object, so the proxy and the target object can be treated as the same object. The proxy allows intercepting low-level operations on the target object, which was originally an internal capability of the JavaScript engine. The interception behavior uses a function that can respond to specific operations. After a object is proxied through `Proxy`, we will have an object that is almost identical to the original object. We can fully monitor this object at a low level. The `Proxy` object is a new feature introduced in ES6. `Vue3` has abandoned the use of `Object.defineProperty` in favor of the faster native `Proxy`, which leans more towards modern browsers in terms of compatibility.

```javascript
var target = {a: 1};
var proxy = new Proxy(target, {
    set: function(target, key, value, receiver){ 
        console.log("watch");
        return Reflect.set(target, key, value, receiver);
    },
    get: function(target, key, receiver){ 
        return target[key];
    }
});
proxy.a = 11; // watch
console.log(target); // { a: 11 }
```

### Improvement of the diff algorithm
The foundation of the `diff` algorithm is the `Virtual DOM`. The `Virtual DOM` is a tree based on JavaScript objects, with each node called a `VNode`, using object properties to describe the nodes. In practice, it is an abstraction of the real DOM, which can ultimately be rendered to the real environment through rendering operations. In simple terms, the `Virtual DOM` is a JavaScript object used to describe the entire document.  
In `Vue2`, the framework traverses the new and old virtual DOM trees through deep recursion and compares each attribute on each node to determine which parts of the actual DOM need to be updated. Due to advanced optimizations performed by modern JavaScript engines, this somewhat brute force algorithm is usually very fast. However, DOM updates still involve many unnecessary CPU work.  
In the words of Evan You, in order to achieve this, the compiler and runtime need to work together: the compiler analyzes the template and generates code with optimization hints, and the runtime tries to obtain these hints as much as possible and adopts the fast path. There are three main optimizations here:
* First, at the DOM tree level, we notice that in the absence of template directives that dynamically change node structure (such as `v-if` and `v-for`), the node structure remains completely static. If we divide a template into nested blocks separated by these structural directives, the node structure in each block will once again be completely static. When we update nodes in a block, we no longer need to recursively traverse the DOM tree. Dynamic bindings within the block can be tracked in a flat array. This optimization reduces the amount of tree traversal needed by an order of magnitude, thus mitigating much of the overhead of the virtual DOM.
* Secondly, the compiler actively detects static nodes, subtree, or even data objects in the template, and elevates them outside of the rendered function in the generated code. This avoids recreating these objects on every render, greatly improving memory usage and reducing the frequency of garbage collection.
* Thirdly, at the element level, the compiler also generates an optimization flag for each element with dynamic bindings based on the type of update required. For example, an element with dynamic class bindings and many static properties will receive a flag indicating that only a class check is needed. The runtime will obtain these hints and adopt specialized fast paths.

### TypeScript support
In `Vue2`, only JavaScript is used, and it does not have the concept of a type system. Nowadays, `TypeScript` is extremely popular. For large-scale projects, the lack of type declarations makes maintenance and code reading a headache. Although it is actually possible to use `TS` in `Vue2`, the support is not particularly perfect. Additionally, `Vue2`'s source code also uses `Facebook`'s `Flow` for type checking.  
Ultimately, `Vue3` drew inspiration from `React Hook` to create a more flexible programming style, and introduced the `Composition API`, which does not require defining components through a long list of options, but allows users to freely express, combine, and reuse stateful component logic just like writing functions, while providing excellent TypeScript support.

### Changes in Package Size

The official documentation of `Vue2` stated that the runtime package was `23k`, but that was only when there were no dependencies installed. As more dependencies and framework features were added, sometimes unnecessary and unused code files were still being included in the package. Therefore, as the project grew larger, the packaged files would become numerous and large.

In `Vue3`, this was addressed by moving most of the global `API` and internal helpers to the `module.exports` property in `JavaScript`. This allowed modern mode `module bundlers` to statically analyze module dependencies and remove code related to unused `module.exports` properties. The template compiler also generated code optimized for `Tree Shaking`, meaning that helper functions for a feature were only imported when the feature was actually used in the template. Despite the addition of many new features, the baseline size of compressed `Vue3` was approximately `10KB`, which was less than half the size of `Vue2`.

## Non-Compatible Changes

The non-compatible changes in `Vue3` compared to `Vue2` can be summarized, for details please refer to [Vue 3 Migration Guide](https://v3.cn.vuejs.org/guide/migration/introduction.html).

### Global API

* The global `Vue API` has been changed to use the application instance.
* Global and internal `API` have been refactored to be `tree-shakable`.

### Template Directives

* The usage of `v-model` on components has been changed to replace `v-bind.sync`.
* Usage of `key` on `<template v-for>` and non-`v-for` nodes has been changed.
* Priority of `v-if` and `v-for` used on the same element has been changed.
* `v-bind="object"` is now order-sensitive.
* The `v-on:event.native` modifier has been removed.
* `ref` in `v-for` no longer registers a `ref` array.

### Components

* Functional components can only be created using normal functions.
* The `functional` attribute in SFC single-file components `<template>` and `functional` component options has been deprecated.
* Asynchronous components now require the `defineAsyncComponent` method for creation.
* Component events now need to be declared in the `emits` option.

### Render Functions

* Render function API has been changed.
* The `$scopedSlots property` has been removed, and all slots are exposed as functions through `$slots`.
* `$listeners` have been removed or integrated into `$attrs`.
* `$attrs` now includes `class and style attribute`.

### Custom Elements

* The whitelist for custom elements is now executed at compile time.
* Strict limitations on the use of special `is prop` are now limited to the reserved `<component>` tag.

### Other Minor Changes

* The `destroyed` lifecycle option has been renamed to `unmounted`.
* The `beforeDestroy` lifecycle option has been renamed to `beforeUnmount`.
* The `default prop` factory function can no longer access the `this` context.
* Custom directive `API` has been changed to be consistent with component lifecycle.
* The `data` option should always be declared as a function.
* `data` options from mixins are now shallow merged.
* `Attribute` coercion strategy has been changed.
* Some transition `class` have been renamed.
* `<TransitionGroup>` no longer defaults to rendering the wrapping element.
* When listening to an array, callbacks are only triggered when the array is replaced; to trigger on changes, the `deep` option needs to be specified.
* Markups without special directives such as `v-if/else-if/else`, `v-for`, `v-slot` on `<template>` are now treated as normal elements and will generate native `<template>` elements, rather than rendering their internal content.
* In `Vue2`, the `outerHTML` of the root container of the application will be replaced by the root component's template. If the root component does not have a template/render option, it will ultimately compile into a template. In `Vue3`, the `innerHTML` of the application container is now used, which means the container itself is no longer considered part of the template.

### Removed API

* `keyCode` support as a modifier for `v-on`.
* `$on`, `$off`, and `$once` instance methods.
* Filter methods, it is recommended to use computed properties or methods instead of filters.
* Inline template `attribute`.
* `$children` instance `property`.
* `$destroy` instance method, users should no longer manually manage the lifecycle of individual `Vue` components.

## Example
A simple example of a `Vue3` component can be viewed in the online example at [CodeSandbox](https://codesandbox.io/s/c1437?file=/src/App.vue).

```html
<template>
  <div>
    <div>{{ msg }}</div>
    <div>count: {{ count }}</div>
    <div>double-count: {{ doubleCount }}</div>
    <button @click="multCount(3)">count => count*3</button>
  </div>
</template>
```

```javascript
import { onMounted, reactive, computed } from "vue";
export default {
  name: "App",
  components: {},
  setup: () => {
    /* Define data */
    const data = reactive({
      msg: "Hello World",
      count: 1,
    });

    /* Handle lifecycle */
    onMounted(() => {
      console.log("Mounted");
    });

    /* Handle computed */
    const computeds = {
      doubleCount: computed(() => data.count * 2),
    };

    /* Define methods */
    const methods = {
      multCount: function (n) {
        data.count = data.count * n;
      },
    };

    /* Return data */
    return Object.assign(data, computeds, methods);
  },
};
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://zhuanlan.zhihu.com/p/92143274
https://www.jianshu.com/p/9d3ddaec9134
https://zhuanlan.zhihu.com/p/257044300
https://juejin.cn/post/6867123074148335624
https://juejin.cn/post/6892295955844956167
https://segmentfault.com/a/1190000024580501
https://v3.cn.vuejs.org/guide/migration/introduction.html
```