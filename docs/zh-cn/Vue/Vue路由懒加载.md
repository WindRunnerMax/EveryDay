# Vue路由懒加载
对于`SPA`单页应用，当打包构建时，`JavaScript`包会变得非常大，影响页面加载速度，将不同路由对应的组件分割成不同的代码块，然后当路由被访问的时候才加载对应组件，这就是路由的懒加载。

## 实现方式

### Vue异步组件
`Vue`允许以一个工厂函数的方式定义你的组件，这个工厂函数会异步解析你的组件定义。`Vue`只有在这个组件需要被渲染的时候才会触发该工厂函数，且会把结果缓存起来供未来重渲染。

```javascript
Vue.component("async-example", function (resolve, reject) {
  setTimeout(function() {
    // 向 `resolve` 回调传递组件定义
    resolve({
      template: "<div>I am async!</div>"
    })
  }, 1000)
})
```

这个工厂函数会收到一个`resolve`回调，这个回调函数会在你从服务器得到组件定义的时候被调用，当然也可以调用`reject(reason)`来表示加载失败，此处的`setTimeout`仅是用来演示异步传递组件定义用。将异步组件和`webpack`的`code-splitting`功能一起配合使用可以达到懒加载组件的效果。

```javascript
Vue.component("async-webpack-example", function (resolve) {
  // 这个特殊的 `require` 语法将会告诉 webpack
  // 自动将你的构建代码切割成多个包，这些包
  // 会通过 Ajax 请求加载
  require(["./my-async-component"], resolve)
})
```

也可以在工厂函数中返回一个`Promise`，把`webpack 2`和`ES2015`语法加在一起。

```javascript
Vue.component(
  "async-webpack-example",
  // 这个动态导入会返回一个 `Promise` 对象。
  () => import("./my-async-component")
)
```

事实上我们在`Vue-Router`的配置上可以直接结合`Vue`的异步组件和`Webpack`的代码分割功能可以实现路由组件的懒加载，打包后每一个组件生成一个`js`文件。

```javascript
{
  path: "/example",
  name: "example",
  //打包后，每个组件单独生成一个chunk文件
  component: reslove => require(["@/views/example.vue"], resolve)
}
```

### 动态import
在`Webpack2`中，可以使用动态`import`语法来定义代码分块点`split point`，官方也是推荐使用这种方法，如果使用的是`Bable`，需要添加`syntax-dynamic-import`插件， 才能使`Babel`可以正确的解析语法。

```javascript
//默认将每个组件，单独打包成一个js文件
const example = () => import("@/views/example.vue")
```

有时我们想把某个路由下的所有组件都打包在同一个异步块`chunk`中，需要使用命名`chunk`一个特殊的注释语法来提供`chunk name`，需要`webpack > 2.4`。

```javascript
const example1 = () => import(/* webpackChunkName: "Example" */ "@/views/example1.vue");
const example2 = () => import(/* webpackChunkName: "Example" */ "@/views/example2.vue");
```

事实上我们在`Vue-Router`的配置上可以直接定义懒加载。

```javascript
{
  path: "/example",
  name: "example",
  //打包后，每个组件单独生成一个chunk文件
  component: () => import("@/views/example.vue")
}
```


### webpack提供的require.ensure
使用`webpack`的`require.ensure`，也可以实现按需加载，同样多个路由指定相同的`chunkName`也会合并打包成一个`js`文件。

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





## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://zhuanlan.zhihu.com/p/46843949
https://www.jianshu.com/p/c27b1640a01b
https://juejin.im/post/6844904025746309127
https://juejin.im/post/6844904013842874376
https://segmentfault.com/a/1190000011519350
https://cn.vuejs.org/v2/guide/components-dynamic-async.html
https://router.vuejs.org/zh/guide/advanced/lazy-loading.htm
```
