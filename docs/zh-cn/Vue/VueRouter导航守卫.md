# VueRouter导航守卫
`vue-router`提供的导航守卫主要用来通过跳转或取消的方式守卫导航，简单来说导航守卫就是路由跳转过程中的一些钩子函数，路由跳转是一个大的过程，这个大的过程分为跳转前中后等等细小的过程，而在每一个过程中都有钩子函数，这些钩子函数能使我们在这些过程中进行一些操作，这就是导航守卫。

## 概述
`vue-router`一套钩子来触发路由在不同阶段触发的函数，导航守卫分成三大块：全局守卫、路由独享守卫和组件内守卫。全局守卫顾名思义所有路由在进入跳转的时候都会触发，整个全局路由分为三个阶段依次是`beforeEach`、`beforeResolve`、`afterEach`。路由独享守卫顾名思义只在定义路由和路由组件中的对象中使用，其只有一个阶段`beforeEnter`。组件内守卫是只在组件中触发的路由内容，其有三个阶段依次是`beforeRouteEnter`、`beforeRouteUpdate`、`beforeRouteLeave`。参数或查询的改变并不会触发进入或离开的导航守卫，可以通过观察`$route`对象来应对这些变化，或使用`beforeRouteUpdate`的组件内守卫。

### 参数
通常导航守卫接收三个参数，当然并不是所有钩子函数都是如此，不接收相关参数的钩子函数会特别说明。

* `to: Route`: 即将要进入的目标路由对象，即组件内的`this.$route`。
* `from: Route`: 当前导航正要离开的路由对象。
* `next: Function`: 一定要调用该方法来`resolve`这个钩子，需要确保`next`函数在任何给定的导航守卫中都被严格调用一次，其可以出现多于一次，但是只能在所有的逻辑路径都不重叠的情况下，否则钩子永远都不会被解析或报错，此函数执行效果依赖`next`方法的调用参数。
  * `next()`: 进行管道中的下一个钩子，如果全部钩子执行完了，则导航的状态就是确认`confirmed`的。
  * `next(false)`: 中断当前的导航，如果浏览器的`URL`改变了，例如用户手动或者浏览器后退按钮，那么`URL`地址会重置到`from`路由对应的地址。
   * `next("/")`或者`next({ path: "/" })`: 跳转到一个不同的地址，当前的导航被中断，然后进行一个新的导航，可以向`next`传递任位置对象，且允许设置诸如`replace: true`、`name: "home"`之类的选项以及任何用在`router-link`的`to prop`或`router.push`中的选项。
   * `next((vm)=>{})`: `beforeRouteEnter`是支持给`next`传递回调的唯一守卫，回调内接收的参数为当前组件的`vm`，对于`beforeRouteUpdate`和`beforeRouteLeave`来说，`this`已经可用了，所以无需也不支持传递回调。
   * `next(error) (2.4.0+)`: 如果传入`next`的参数是一个`Error`实例，则导航会被终止且该错误会被传递给`router.onError()`注册过的回调。

## 全局守卫
全局守卫是用来监测所有的路由，通常直接在定义路由时构建。

### 全局前置守卫
全局前置守卫在路由刚开始导航且还未进入路由对应的组件中时触发，简单来说即最早触发，但是触发时候没有任何组件等加载，正因为如此适合做登陆判断逻辑。当一个导航触发时，全局前置守卫按照创建顺序调用，守卫是异步解析执行，此时导航在所有守卫`resolve`完之前一直处于等待中。

```javascript
const router = new VueRouter({ /*...*/ })

router.beforeEach((to, from, next) => {
  // ... // if (...) next(); else next("/login");
})
```

### 全局解析守卫
在`2.5.0+`可以使用`router.beforeResolve`注册一个全局守卫，这和`router.beforeEach`类似，区别是在导航被确认之前，同时在所有组件内守卫和异步路由组件被解析之后，解析守卫才被调用。

```javascript
const router = new VueRouter({ /*...*/ })

router.beforeResolve((to, from, next) => {
  // ... 
})
```

### 全局后置钩子
注册全局后置钩子，和守卫不同的是，这些钩子不会接受`next`函数也不会改变导航本身。

```javascript
const router = new VueRouter({ /*...*/ })

router.afterEach((to, from) => {
  // ... 
})
```

## 路由独享守卫
路由独享守卫中只有`beforeEnter`阶段，是当前组件路由进入的时候触发的阶段。

```javascript
const router = new VueRouter({
  routes: [{
      path: "/example",
      component: Example,
      beforeEnter: (to, from, next) => {
        // ...
      }
    }]
})
```

## 组件内的守卫
可以在路由组件内直接定义导航守卫。

### 组件前置守卫
在还没有进入该组件之前触发，在渲染该组件的对应路由被`confirm`前调用，此时不能获取组件实例 `this`，因为当守卫执行前，组件实例还没被创建，但是可以通过传一个回调给`next`来访问组件实例，在导航被确认的时候执行回调，并且把组件实例作为回调方法的参数，即上文参数中提到的`next((vm)=>{})`。

```javascript
const Example = {
  template: `...`,
  beforeRouteEnter: function(to, from, next) {
    // ...
  }
}
```

### 组件更新守卫
组件更新守卫在动态路由中使用，由于动态路由中切换路由的时候，由于绑定的是同一个组件因此在不会在重新渲染，但是为了可以让组件中的内容重新渲染，有两种方法第一种使用`watch`监听，这种需要使用`props`写法，另一种就是在`beforeRouteUpdate`中定义，其会监听到动态路由的改变，因此可以在这个钩子中获取异步动态路由对应的数据，举例来说，对于一个带有动态参数的路径`/example/:id`，在`/example/1`和`/example/2`之间跳转的时候，由于会渲染同样的`Example`组件，因此组件实例会被复用，而这个钩子就会在这个情况下被调用，在这个钩子函数中可以访问组件实例 `this`。

```javascript
const Example = {
  template: `...`,
  beforeRouteUpdate: function(to, from, next) {
    // ...
  }
}
```

### 组件离开守卫
导航离开该组件的对应路由时调用，可以访问组件实例`this`，这个离开守卫通常用来禁止用户在还未保存修改前突然离开，该导航可以通过`next(false)`来取消。

```javascript
const Example = {
  template: `...`,
  beforeRouteLeave: function(to, from, next) {
    // ...
  }
}
```

## 导航解析流程
* 导航被触发。
* 在失活的组件里调用`beforeRouteLeave`守卫。
* 调用全局的`beforeEach`守卫。
* 在重用的组件里调用`beforeRouteUpdate`守卫`2.2+`。
* 在路由配置里调用`beforeEnter`。
* 解析异步路由组件。
* 在被激活的组件里调用`beforeRouteEnter`。
* 调用全局的`beforeResolve`守卫`2.5+`。
* 导航被确认。
* 调用全局的`afterEach`钩子。
* 组件生命周期`beforeCreate`、`created`、`beforeMount`、`mounted`。
* 触发`DOM`更新。
* 调用`beforeRouteEnter`守卫中传给`next`的回调函数，创建好的组件实例会作为回调函数的参数传入。

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://zhuanlan.zhihu.com/p/54112006
https://juejin.im/post/6844903652272898056
https://segmentfault.com/a/1190000016571559
http://static.kancloud.cn/cyyspring/vuejs/941801
https://www.cnblogs.com/kzxiaotan/p/11676872.html
https://router.vuejs.org/zh/guide/advanced/navigation-guards.html
```

