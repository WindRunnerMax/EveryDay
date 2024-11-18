# VueRouter Navigation Guards

The navigation guards provided by `vue-router` are mainly used to guard the navigation by allowing or canceling it. Simply put, navigation guards are some hook functions during the routing process. Routing is a big process, with various smaller processes such as before, during, and after navigation, and there are hook functions in each process. These hook functions allow us to perform some operations during these processes, and that's what navigation guards are all about.

## Description
`vue-router` provides a set of hooks to trigger functions at different stages of routing. Navigation guards are divided into three main blocks: global guards, route-specific guards, and component guards. As the name suggests, global guards are triggered for all routes entering navigation and are divided into three stages: `beforeEach`, `beforeResolve`, and `afterEach`. Route-specific guards, as the name suggests, are only used in route definitions and route component objects, and have only one stage, `beforeEnter`. Component guards are triggered in the route content within the component, and they have three stages: `beforeRouteEnter`, `beforeRouteUpdate`, and `beforeRouteLeave`. Changes in parameters or queries do not trigger entering or leaving navigation guards. These changes can be handled by observing the `$route` object or using the component guard `beforeRouteUpdate`.

### Parameters
Navigation guards typically accept three parameters, but not all hook functions do so. Hook functions that do not accept relevant parameters will be specially noted.

* `to: Route`: The target route object to be entered, i.e., `this.$route` in the component.
* `from: Route`: The current route object about to leave navigation.
* `next: Function`: This method must be called to `resolve` the hook. It is important to ensure that the `next` function is strictly called once in any given navigation guard. It can be called more than once, but only when all logical paths do not overlap. Otherwise, the hook will never be resolved or may report an error. The effect of executing this function depends on the arguments passed to the `next` method.
  * `next()`: Proceed to the next hook in the pipeline. If all hooks have been executed, the navigation state will be confirmed as `confirmed`.
  * `next(false)`: Interrupt the current navigation. If the browser's URL changes, such as by user manual action or using the browser's back button, the URL will reset to the address corresponding to the `from` route.
  * `next("/")` or `next({ path: "/" })`: Redirect to a different address. The current navigation is interrupted, and then a new navigation is performed. Any location object can be passed to `next`, and options such as `replace: true` or `name: "home"` can be set, as well as any options used in `to prop` in `router-link` or `router.push`.
  * `next((vm) => {})`: `beforeRouteEnter` is the only guard that supports passing a callback to `next`. The callback receives the current component's `vm` as a parameter. For `beforeRouteUpdate` and `beforeRouteLeave`, `this` is already available, so passing a callback is unnecessary and not supported.
  * `next(error) (2.4.0+)`: If the argument passed to `next` is an `Error` instance, the navigation will be terminated, and the error will be passed to the callback registered with `router.onError()`.

## Global Guards
Global guards are used to monitor all routes and are typically built directly when defining routes.

### Global Before Guards
The global before guards are triggered when the route is just starting navigation and has not yet entered the corresponding component of the route. In simple terms, it is triggered earliest, but without any component or other loads at the time of triggering. This makes it ideal for implementing login-related logic. When a navigation is triggered, the global before guards are called in the order of creation. The guards are asynchronously resolved and executed, and the navigation remains in a waiting state until all guards are resolved.

```javascript
const router = new VueRouter({ /*...*/ })

router.beforeEach((to, from, next) => {
  // ... // if (...) next(); else next("/login");
})
```

### Global Resolve Guards
Starting from `2.5.0+`, you can use `router.beforeResolve` to register a global guard similar to `router.beforeEach`. The difference is that the resolve guard is called only after the navigation has been confirmed, and also after all in-component guards and asynchronous route components have been resolved.

```javascript
const router = new VueRouter({ /*...*/ })

router.beforeResolve((to, from, next) => {
  // ... 
})
```

### Global After Hooks
Register global after hooks. Unlike guards, these hooks do not accept the `next` function and do not change the navigation itself.

```javascript
const router = new VueRouter({ /*...*/ })

router.afterEach((to, from) => {
  // ... 
})
```

## Route-Specific Guards
Route-specific guards only have the `beforeEnter` stage, which is triggered when the current component's route is entered.

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

## Guard Inside Component
You can directly define navigation guards inside the route component.

### Before Route Enter
Triggered before entering the component, called before rendering the corresponding route of the component is `confirmed`, at this point, you cannot access the component instance `this` because the component instance has not been created before the guard is executed. However, you can access the component instance by passing a callback to `next`, which will be called when the navigation is confirmed, and pass the component instance as a parameter to the callback method, as mentioned in the previous parameter `next((vm)=>{})`.

```javascript
const Example = {
  template: `...`,
  beforeRouteEnter: function(to, from, next) {
    // ...
  }
}
```

### Before Route Update
The component update guard is used in dynamic routes. In dynamic routes, when switching routes, the same component is not re-rendered due to binding the same component. In order to re-render the content of the component, there are two methods. The first method is to use `watch`, which requires using the `props` syntax, and the other method is to define it in `beforeRouteUpdate`, which will listen for changes in dynamic routes. Therefore, you can obtain the data corresponding to the asynchronous dynamic route in this hook. For example, for a path with dynamic parameters like `/example/:id`, when switching between `/example/1` and `/example/2`, because the same `Example` component will be rendered, the component instance will be reused, and this hook will be called in this situation. In this hook function, you can access the component instance `this`.

```javascript
const Example = {
  template: `...`,
  beforeRouteUpdate: function(to, from, next) {
    // ...
  }
}
```

### Before Route Leave
Called when navigating away from the corresponding route of the component, you can access the component instance `this`. This leave guard is usually used to prevent users from leaving suddenly before saving the modifications. The navigation can be canceled by `next(false)`.

```javascript
const Example = {
  template: `...`,
  beforeRouteLeave: function(to, from, next) {
    // ...
  }
}
```

## Navigation Resolution Process
* Navigation trigger.
* Call `beforeRouteLeave` guard in the deactivated component.
* Call global `beforeEach` guard.
* Call `beforeRouteUpdate` guard in the reused component `2.2+`.
* Call `beforeEnter` in route configuration.
* Resolve async route components.
* Call `beforeRouteEnter` in the activated component.
* Call global `beforeResolve` guard `2.5+`.
* Navigation confirmed.
* Call global `afterEach` hook.
* Component lifecycle `beforeCreate`, `created`, `beforeMount`, `mounted`.
* Trigger `DOM` update.
* Call the callback function passed to `next` in the `beforeRouteEnter` guard, and the created component instance will be passed as an argument to the callback function.

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://zhuanlan.zhihu.com/p/54112006
https://juejin.im/post/6844903652272898056
https://segmentfault.com/a/1190000016571559
http://static.kancloud.cn/cyyspring/vuejs/941801
https://www.cnblogs.com/kzxiaotan/p/11676872.html
https://router.vuejs.org/zh/guide/advanced/navigation-guards.html
```