# Vue3.0新特性
`Vue3.0`的设计目标可以概括为体积更小、速度更快、加强`TypeScript`支持、加强`API`设计一致性、提高自身可维护性、开放更多底层功能。

## 概述
从`Vue2`到`Vue3`在一些比较重要的方面的详细对比。

### 生命周期的变化
* `Vue2 -> Vue3`
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

在这里主要是增加了`setup`这个生命周期，而其他的生命周期都是以`API`的形式调用，实际上随着`Composition API`的引入，我们访问这些钩子函数的方式已经改变，我们所有的生命周期都应该写在`setup`中，此方法我们应该实现大多数组件代码，并处理响应式，生命周期钩子函数等。

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

### 使用proxy代替defineProperty
`Vue2`是通过数据劫持的方式来实现响应式的，其中最核心的方法便是通过`Object.defineProperty()`来实现对属性的劫持，该方法允许精确地添加或修改对象的属性，对数据添加属性描述符中的`getter`与`setter`存取描述符实现劫持。`Vue2`之所以只能兼容到`IE8`主要就是因为`defineProperty`无法兼容`IE8`，其他浏览器也会存在轻微兼容问题。

```javascript
var obj = { __x: 1 };
Object.defineProperty(obj, "x", {
    set: function(x){ console.log("watch"); this.__x = x; },
    get: function(){ return this.__x; }
});
obj.x = 11; // watch
console.log(obj.x); // 11
```
`Vue3`使用`Proxy`实现数据劫持，`Object.defineProperty`只能监听属性，而`Proxy`能监听整个对象，通过调用`new Proxy()`，可以创建一个代理用来替代另一个对象被称为目标，这个代理对目标对象进行了虚拟，因此该代理与该目标对象表面上可以被当作同一个对象来对待。代理允许拦截在目标对象上的底层操作，而这原本是`Js`引擎的内部能力，拦截行为使用了一个能够响应特定操作的函数，即通过`Proxy`去对一个对象进行代理之后，我们将得到一个和被代理对象几乎完全一样的对象，并且可以从底层实现对这个对象进行完全的监控。`Proxy`对象是`ES6`引入的新特性，`Vue3`放弃使用了`Object.defineProperty`，而选择了使用更快的原生`Proxy`，即是在兼容性方面更偏向于现代浏览器。

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

### diff算法的提升
`diff`算法的基础是`Virtual DOM`，`Virtual DOM`是一棵以`JavaScript`对象作为基础的树，每一个节点称为`VNode`，用对象属性来描述节点，实际上它是一层对真实`DOM`的抽象，最终可以通过渲染操作使这棵树映射到真实环境上，简单来说`Virtual DOM`就是一个`Js`对象，用以描述整个文档。  
`Vue2`框架通过深度递归遍历新旧两个虚拟`DOM`树，并比较每个节点上的每个属性，来确定实际`DOM`的哪些部分需要更新，由于现代`JavaScript`引擎执行的高级优化，这种有点暴力的算法通常非常快速，但是`DOM`的更新仍然涉及许多不必要的`CPU`工作。  
在这里引用尤大的描述，为了实现这一点，编译器和运行时需要协同工作：编译器分析模板并生成带有优化提示的代码，而运行时尽可能获取提示并采用快速路径，这里有三个主要的优化：
* 首先，在`DOM`树级别，我们注意到，在没有动态改变节点结构的模板指令(例如`v-if`和`v-for`)的情况下，节点结构保持完全静态，如果我们将一个模板分成由这些结构指令分隔的嵌套块，则每个块中的节点结构将再次完全静态，当我们更新块中的节点时，我们不再需要递归遍历`DOM`树，该块内的动态绑定可以在一个平面数组中跟踪，这种优化通过将需要执行的树遍历量减少一个数量级来规避虚拟`DOM`的大部分开销。
* 其次，编译器积极地检测模板中的静态节点、子树甚至数据对象，并在生成的代码中将它们提升到渲染函数之外，这样可以避免在每次渲染时重新创建这些对象，从而大大提高内存使用率并减少垃圾回收的频率。
* 第三，在元素级别，编译器还根据需要执行的更新类型，为每个具有动态绑定的元素生成一个优化标志，例如具有动态类绑定和许多静态属性的元素将收到一个标志，提示只需要进行类检查，运行时将获取这些提示并采用专用的快速路径。

### TypeScript的支持
`Vue2`中使用的都是`Js`，其本身并没有类型系统这个概念，现如今`TypeScript`异常火爆，对于规模很大的项目，没有类型声明，后期维护和代码的阅读都是头疼的事情，虽然`Vue2`实际上也是可以使用`TS`的，但是支持并不算特别完美，此外`Vue2`的源码也是使用`Facebook`的`Flow`做类型检查。  
最终`Vue3`借鉴了`React Hook`实现了更自由的编程方式，提出了`Composition API`，`Composition API`不需要通过指定一长串选项来定义组件，而是允许用户像编写函数一样自由地表达、组合和重用有状态的组件逻辑，同时提供出色的`TypeScript`支持。

### 打包体积变化
`Vue2`官方说明运行时打包`23k`，但这只是没安装依赖的时候，随着依赖包和框架特性的增多，有时候不必要的，未使用的代码文件都被打包了进去，所以后期项目大了，打包文件会特别多还很大。  
在`Vue3`中，通过将大多数全局`API`和内部帮助程序移动到`JavaScript`的`module.exports`属性上实现这一点，这允许现代模式下的`module bundler`能够静态地分析模块依赖关系，并删除与未使用的`module.exports`属性相关的代码，模板编译器还生成了对`Tree Shaking`摇树优化友好的代码，只有在模板中实际使用某个特性时，该代码才导入该特性的帮助程序，尽管增加了许多新特性，但`Vue3`被压缩后的基线大小约为`10KB`，不到`Vue2`的一半。

## 非兼容变更
`Vue3`相对于`Vue2`的非兼容的变更概括，详情可以查阅`https://v3.cn.vuejs.org/guide/migration/introduction.html`。

### 全局API
* 全局`Vue API`已更改为使用应用程序实例。
* 全局和内部`API`已经被重构为可`tree-shakable`。

### 模板指令
* 组件上`v-model`用法已更改，替换`v-bind.sync`。
* `<template v-for>`和非`v-for`节点上`key`用法已更改。
* 在同一元素上使用的`v-if`和`v-for`优先级已更改。
* `v-bind="object"`现在排序敏感。
* `v-on:event.native`修饰符已移除。
* `v-for`中的`ref`不再注册`ref`数组。

### 组件
* 只能使用普通函数创建功能组件。
* `functional`属性在`SFC`单文件组件`<template>`和`functional`组件选项被抛弃。
* 异步组件现在需要`defineAsyncComponent`方法来创建。
* 组件事件现在需要在`emits`选项中声明。

### 渲染函数
* 渲染函数`API`改变。
* `$scopedSlots property`已删除，所有插槽都通过`$slots`作为函数暴露。
* `$listeners`被移除或整合到`$attrs`。
* `$attrs`现在包含`class and style attribute`。

### 自定义元素
* 自定义元素白名单现在已经在编译时执行。
* 对特殊的`is prop`的使用只严格限制在被保留的`<component>`标记中。

### 其他小改变
* `destroyed`生命周期选项被重命名为`unmounted`。
* `beforeDestroy`生命周期选项被重命名为`beforeUnmount`。
* `default prop`工厂函数不再可以访问`this`上下文。
* 自定义指令`API`已更改为与组件生命周期一致。
* `data`选项应始终被声明为一个函数。
* 来自`mixin`的`data`选项现在为浅合并。
* `Attribute`强制策略已更改。
* 一些过渡`class`被重命名。
* `<TransitionGroup>`不再默认渲染包裹元素。
* 当侦听一个数组时，只有当数组被替换时，回调才会触发，如果需要在变更时触发，则需要指定`deep`选项。
* 没有特殊指令的标记`v-if/else-if/else`、`v-for`、`v-slot`的`<template>`现在被视为普通元素，并将生成原生的`<template>`元素，而不是渲染其内部内容。
* 在`Vue2`中，应用根容器的`outerHTML`将替换为根组件模板，如果根组件没有模板/渲染选项，则最终编译为模板，`Vue3`现在使用应用容器的`innerHTML`，这意味着容器本身不再被视为模板的一部分。

### 移除API
* `keyCode`支持作为`v-on`的修饰符。
* `$on`、`$off`和`$once`实例方法
* 过滤器方法，建议用计算属性或方法代替过滤器。
* 内联模板`attribute`。
* `$children`实例`property`。
* `$destroy`实例方法，用户不应再手动管理单个`Vue`组件的生命周期。

## 示例
`Vue3`的组件简单示例，可查看在线示例`https://codesandbox.io/s/c1437?file=/src/App.vue`。

```html
<template>
  <div>
    <div>{{ msg }}</div>
    <div>count: {{ count }}</div>
    <div>double-count: {{ doubleCount }}</div>
    <button @click="multCount(3)">count => count*3</button>
  </div>
</template>

<script>
import { onMounted, reactive, computed } from "vue";
export default {
  name: "App",
  components: {},
  setup: () => {
    /* 定义data */
    const data = reactive({
      msg: "Hello World",
      count: 1,
    });

    /* 处理生命周期 */
    onMounted(() => {
      console.log("Mounted");
    });

    /* 处理computed */
    const computeds = {
      doubleCount: computed(() => data.count * 2),
    };

    /* 定义methods */
    const methods = {
      multCount: function (n) {
        data.count = data.count * n;
      },
    };

    /* 返回数据 */
    return Object.assign(data, computeds, methods);
  },
};
</script>

<style>
</style>
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://zhuanlan.zhihu.com/p/92143274
https://www.jianshu.com/p/9d3ddaec9134
https://zhuanlan.zhihu.com/p/257044300
https://juejin.cn/post/6867123074148335624
https://juejin.cn/post/6892295955844956167
https://segmentfault.com/a/1190000024580501
https://v3.cn.vuejs.org/guide/migration/introduction.html
```