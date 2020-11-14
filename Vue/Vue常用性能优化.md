# Vue常用性能优化
`Vue`常用的一些优化方式，主要是在构建项目过程需要注意的方面。

## 编码优化

### 避免响应所有数据
不要将所有的数据都放到`data`中，`data`中的数据都会增加`getter`和`setter`，并且会收集`watcher`，这样还占内存，不需要响应式的数据我们可以直接定义在实例上。

```html
<template>
    <view>

    </view>
</template>

<script>
    export default {
        components: {},
        data: () => ({
            
        }),
        beforeCreate: function(){
            this.timer = null;
        }
    }
</script>

<style scoped>
</style>
```

### 函数式组件
函数组是一个不包含状态和实例的组件，简单的说，就是组件不支持响应式，并且不能通过`this`关键字引用自己。因为函数式组件没有状态，所以它们不需要像`Vue`的响应式系统一样需要经过额外的初始化，这样就可以避免相关操作带来的性能消耗。当然函数式组件仍然会对相应的变化做出响应式改变，比如新传入新的`props`，但是在组件本身中，它无法知道数据何时发生了更改，因为它不维护自己的状态。很多场景非常适合使用函数式组件：

* 一个简单的展示组件，也就是所谓的`dumb`组件。例如`buttons`、`pills`、`tags`、`cards`等，甚至整个页面都是静态文本，比如`About`页面。
* 高阶组件，即用于接收一个组件作为参数，返回一个被包装过的组件。
* `v-for`循环中的每项通常都是很好的候选项。

### 区分computed和watch使用场景
`computed`是计算属性，依赖其它属性值，并且`computed`的值有缓存，只有它依赖的属性值发生改变，下一次获取`computed`的值时才会重新计算`computed`的值。  
`watch`更多的是观察的作用，类似于某些数据的监听回调，每当监听的数据变化时都会执行回调进行后续操作。  
当我们需要进行数值计算，并且依赖于其它数据时，应该使用`computed`，因为可以利用`computed`的缓存特性，避免每次获取值时，都要重新计算。当我们需要在数据变化时执行异步或开销较大的操作时，应该使用`watch`，使用`watch`选项允许我们执行异步操作，限制我们执行该操作的频率，并在我们得到最终结果前，设置中间状态。

### v-for添加key且避免同时使用v-if
* `v-for`遍历必须为`item`添加`key`，且尽量不要使用`index`而要使用唯一`id`去标识`item`，在列表数据进行遍历渲染时，设置唯一`key`值方便`Vue.js`内部机制精准找到该条列表数据，当`state`更新时，新的状态值和旧的状态值对比，较快地定位到`diff`。
* `v-for`遍历避免同时使用`v-if`，`v-for`比`v-if`优先级高，如果每一次都需要遍历整个数组，将会影响速度。

### 区分v-if与v-show使用场景
* 实现方式: `v-if`是动态的向`DOM`树内添加或者删除`DOM`元素，`v-show`是通过设置`DOM`元素的`display`样式属性控制显隐。
* 编译过程: `v-if`切换有一个局部编译卸载的过程，切换过程中合适地销毁和重建内部的事件监听和子组件，`v-show`只是简单的基于`CSS`切换。
* 编译条件: `v-if`是惰性的，如果初始条件为假，则什么也不做，只有在条件第一次变为真时才开始局部编译， `v-show`是在任何条件下都被编译，然后被缓存，而且`DOM`元素保留。
* 性能消耗: `v-if`有更高的切换消耗，`v-show`有更高的初始渲染消耗。
* 使用场景: `v-if`适合条件不太可能改变的情况，`v-show`适合条件频繁切换的情况。

### 长列表性能优化
`Vue`会通过`Object.defineProperty`对数据进行劫持，来实现视图响应数据的变化，然而有些时候我们的组件就是纯粹的数据展示，不会有任何改变，我们就不需要`Vue`来劫持我们的数据，在大量数据展示的情况下，这能够很明显的减少组件初始化的时间，可以通过`Object.freeze`方法来冻结一个对象，一旦被冻结的对象就再也不能被修改了。对于需要修改的长列表的优化大列表两个核心，一个分段一个区分，具体执行分为：仅渲染视窗可见的数据、进行函数节流、 减少驻留的`VNode`和`Vue`组件，不使用显示的子组件`slot`方式，改为手动创建虚拟`DOM`来切断对象引用。

```javascript
export default {
  data: () => ({
      users: {}
  }),
  async created() {
      const users = await axios.get("/api/users");
      this.users = Object.freeze(users);
  }
};
```

### 路由懒加载
`Vue`是单页面应用，可能会有很多的路由引入，这样使用`webpcak`打包后的文件很大，当进入首页时，加载的资源过多，页面会出现白屏的情况，不利于用户体验。如果我们能把不同路由对应的组件分割成不同的代码块，然后当路由被访问的时候才加载对应的组件，这样就更加高效。对于`Vue`路由懒加载的方式有`Vue`异步组件、动态`import`、`webpack`提供的`require.ensure`，最常用的就是动态`import`的方式。

```javascript
{
  path: "/example",
  name: "example",
  //打包后，每个组件单独生成一个chunk文件
  component: () => import("@/views/example.vue")
}
```

### 服务端渲染SSR
如果需要优化首屏加载速度并且首屏加载速度是至关重要的点，那么就需要服务端渲染`SSR`，服务端渲染`SSR`其实是优缺点并行的，需要合理决定是否真的需要服务端渲染。

#### 优点
* 更好的`SEO`，由于搜索引擎爬虫抓取工具可以直接查看完全渲染的页面，如果`SEO`对站点至关重要，而页面又是异步获取内容，则可能需要服务器端渲染`SSR`解决此问题。
* 更快的内容到达时间`time-to-content`，特别是对于缓慢的网络情况或运行缓慢的设备，无需等待所有的`JavaScript`都完成下载并执行，用户将会更快速地看到完整渲染的页面，通常可以产生更好的用户体验，并且对于那些内容到达时间`time-to-content`与转化率直接相关的应用程序而言，服务器端渲染`SSR`至关重要。

#### 缺点

* 开发条件所限，浏览器特定的代码，只能在某些生命周期钩子函数`lifecycle hook`中使用，一些外部扩展库`external library`可能需要特殊处理，才能在服务器渲染应用程序中运行。
* 涉及构建设置和部署的更多要求，与可以部署在任何静态文件服务器上的完全静态单页面应用程序`SPA`不同，服务器渲染应用程序，通常需要处于`Node.js server`运行环境。
* 更大的服务器端负载，在`Node.js`中渲染完整的应用程序，显然会比仅仅提供静态文件的`server`更加大量占用`CPU`资源`CPU-intensive`-`CPU`密集型，因此如果预料在高流量环境`high traffic`下使用，需要准备相应的服务器负载，并明智地采用缓存策略。

### 使用keep-alive组件
当在组件之间切换的时候，有时会想保持这些组件的状态，以避免反复重渲染导致的性能等问题，使用`<keep-alive>`包裹动态组件时，会缓存不活动的组件实例，而不是销毁它们。重新创建动态组件的行为通常是非常有用的，但是在有些情况下我们更希望那些标签的组件实例能够被在它们第一次被创建的时候缓存下来，此时使用`<keep-alive>`包裹组件即可缓存当前组件实例，将组件缓存到内存，用于保留组件状态或避免重新渲染，和`<transition>`相似它，其自身不会渲染一个`DOM`元素，也不会出现在组件的父组件链中。


```html
<keep-alive>
    <component v-bind:is="currentComponent" class="tab"></component>
</keep-alive>
```

## 打包优化

### 模板预编译
当使用`DOM`内模板或`JavaScript`内的字符串模板时，模板会在运行时被编译为渲染函数，通常情况下这个过程已经足够快了，但对性能敏感的应用还是最好避免这种用法。预编译模板最简单的方式就是使用单文件组件——相关的构建设置会自动把预编译处理好，所以构建好的代码已经包含了编译出来的渲染函数而不是原始的模板字符串。如果使用`webpack`，并且喜欢分离`JavaScript`和模板文件，可以使用`vue-template-loader`，其可以在构建过程中把模板文件转换成为`JavaScript`渲染函数。

### SourceMap
在项目进行打包后，会将开发中的多个文件代码打包到一个文件中，并且经过压缩、去掉多余的空格、`babel`编译化后，最终将编译得到的代码会用于线上环境，那么这样处理后的代码和源代码会有很大的差别，当有`bug`的时候，我们只能定位到压缩处理后的代码位置，无法定位到开发环境中的代码，对于开发来说不好调式定位问题，因此`sourceMap`出现了，它就是为了解决不好调式代码问题的，在线上环境则需要关闭`sourceMap`。

### 配置splitChunksPlugins
`Webpack`内置了专门用于提取多个`Chunk`中的公共部分的插件`CommonsChunkPlugin`，是用于提取公共代码的工具，`CommonsChunkPlugin`于`4.0`及以后被移除，使用`SplitChunksPlugin`替代。

### 使用treeShaking
`tree shaking`是一个术语，通常用于描述移除`JavaScript`上下文中的未引用代码`dead-code`，其依赖于`ES2015`模块系统中的静态结构特性，例如`import`和`export`，这个术语和概念实际上是兴起于`ES2015`模块打包工具`rollup`。

### 第三方插件的按需引入
我们在项目中经常会需要引入第三方插件，如果我们直接引入整个插件，会导致项目的体积太大，我们可以借助`babel-plugin-component`，然后可以只引入需要的组件，以达到减小项目体积的目的，以项目中引入`element-ui`组件库为例。

```
{
  "presets": [["es2015", { "modules": false }]],
  "plugins": [
    [
      "component",
      {
        "libraryName": "element-ui",
        "styleLibraryName": "theme-chalk"
      }
    ]
  ]
}

```

```javascript
import Vue from 'vue';
import { Button, Select } from 'element-ui';

Vue.use(Button)
Vue.use(Select)
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://zhuanlan.zhihu.com/p/121000054
https://www.jianshu.com/p/f372d0e3de80
https://juejin.im/post/6844903887787278349
https://juejin.im/post/6844904189999448071
https://www.lagou.com/lgeduarticle/22278.html
https://www.cnblogs.com/mmzuo-798/p/11778044.html
https://blog.csdn.net/gtlbtnq9mr3/article/details/104889927
```

