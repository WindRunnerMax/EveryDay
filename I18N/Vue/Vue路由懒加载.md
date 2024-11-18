# Vue Route Lazy Loading

For a Single Page Application (`SPA`), when building, the `JavaScript` package can become very large, affecting page load speed. The components corresponding to different routes are split into different code blocks. Then, when a route is accessed, the corresponding component is loaded, which is called route lazy loading.

## Implementation

### Vue Asynchronous Components

`Vue` allows you to define your components using a factory function. This factory function will asynchronously resolve your component definition. `Vue` will only trigger this factory function when the component needs to be rendered, and will cache the result for future re-rendering.

```javascript
Vue.component("async-example", function (resolve, reject) {
  setTimeout(function() {
    // Pass the component definition to the `resolve` callback
    resolve({
      template: "<div>I am async!</div>"
    })
  }, 1000)
})
```

This factory function will receive a `resolve` callback. This callback function will be called when you receive the component definition from the server, and `reject(reason)` can also be called to indicate a failed load. The `setTimeout` here is just used to demonstrate the asynchronous transfer of component definition. Combining asynchronous components with `webpack`'s `code-splitting` functionality can achieve lazy loading of components.

```javascript
Vue.component("async-webpack-example", function (resolve) {
  // This special `require` syntax will instruct webpack
  // to automatically split your build code into multiple bundles,
  // which will be loaded via Ajax requests
  require(["./my-async-component"], resolve)
})
```

You can also return a `Promise` in the factory function, combining `webpack 2` and `ES2015` syntax.

```javascript
Vue.component(
  "async-webpack-example",
  // This dynamic import will return a `Promise` object.
  () => import("./my-async-component")
)
```

In fact, in the configuration of `Vue-Router`, you can directly combine `Vue`'s asynchronous components with `Webpack`'s code-splitting feature to achieve lazy loading of route components, with each component generating a separate `js` file after packaging.

```javascript
{
  path: "/example",
  name: "example",
  // After packaging, each component generates a separate chunk file
  component: resolve => require(["@/views/example.vue"], resolve)
}
```

### Dynamic Import

In `Webpack2`, you can use dynamic `import` syntax to define code split points. This method is also recommended by the official. If using `Babel`, you need to add the `syntax-dynamic-import` plugin to allow `Babel` to correctly parse the syntax.

```javascript
// Default: package each component into a separate js file
const example = () => import("@/views/example.vue")
```

Sometimes, we may want to package all components under a certain route in the same asynchronous chunk. You need to use a special comment syntax to provide a `chunk name` when using `webpack > 2.4`.

```javascript
const example1 = () => import(/* webpackChunkName: "Example" */ "@/views/example1.vue");
const example2 = () => import(/* webpackChunkName: "Example" */ "@/views/example2.vue");
```

In fact, in the configuration of `Vue-Router`, you can directly define lazy loading.

```javascript
{
  path: "/example",
  name: "example",
  // After packaging, each component generates a separate chunk file
  component: () => import("@/views/example.vue")
}
```

### `require.ensure` provided by webpack

Using `webpack`'s `require.ensure` can also achieve on-demand loading, and specifying the same `chunkName` for multiple routes will also merge and package them into a single `js` file.

```javascript
// require.ensure(dependencies: String[], callback: function(require), chunkName: String)
{
    path: "/example1",
    name: "example1",
    component: resolve => require.ensure([], () => resolve(require("@/views/example1.vue")), "Example")
},
{
    path: "/example2",
    name: "example2",
    component: resolve => require.ensure([], () => resolve(require("@/views/example2.vue")), "Example")
}
```





## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://zhuanlan.zhihu.com/p/46843949
https://www.jianshu.com/p/c27b1640a01b
https://juejin.im/post/6844904025746309127
https://juejin.im/post/6844904013842874376
https://segmentfault.com/a/1190000011519350
https://cn.vuejs.org/v2/guide/components-dynamic-async.html
https://router.vuejs.org/zh/guide/advanced/lazy-loading.htm
```