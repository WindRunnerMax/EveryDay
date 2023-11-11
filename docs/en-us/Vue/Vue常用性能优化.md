# Common Vue Performance Optimization

Some common optimization methods of `Vue`, mainly the aspects to be paid attention to during the project building process.

## Code Optimization

### Avoid Responding to All Data
Don't put all data in `data`. The data in `data` will increase `getter` and `setter`, and collect `watcher`, which will occupy memory. For non-reactive data, we can directly define it on the instance.

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

### Functional Components
Functional components are components that do not contain state and instances. In simple terms, the components do not support reactivity and cannot refer to themselves through the `this` keyword. Because functional components do not have state, they do not need the extra initialization like the reactivity system in `Vue`, which can avoid performance consumption from related operations. Functional components are suitable for many scenarios:

* A simple display component, also known as a 'dumb' component. For example, `buttons`, `pills`, `tags`, `cards`, etc., and even entire pages that consist of static text, such as an `About` page.
* Higher-order components, which are used to receive a component as a parameter and return a wrapped component.
* Each item in a `v-for` loop is usually a good candidate.

### Differentiate between the Usage Scenarios of Computed and Watch
`computed` is a computed property that depends on other property values, and the value of `computed` is cached. The value of `computed` is recalculated only when the property values it depends on change.  
`watch` is more for observation, similar to a callback for monitoring certain data. The callback is executed whenever the monitored data changes.  
When we need to perform numerical calculations and depend on other data, we should use `computed` because we can take advantage of the caching feature of `computed` to avoid recalculating the value each time it is retrieved. When we need to perform asynchronous or resource-intensive operations when data changes, we should use `watch`. The `watch` option allows us to perform asynchronous operations, restrict the frequency of performing the operation, and set intermediate states before getting the final result.

### Add Key to v-for and Avoid Using v-if Simultaneously
* For `v-for` loops, each `item` must have a `key`, and it is recommended to use a unique `id` to identify the `item` instead of using the `index`. When iterating through the list data for rendering, setting a unique `key` value allows the `Vue.js` internal mechanism to locate the list data accurately, which facilitates the `diff` process when the `state` is updated.
* Avoid using `v-if` simultaneously with `v-for`. `v-for` has a higher priority than `v-if`. If the entire array needs to be iterated through every time, it will affect the speed.

### Differentiate between the Usage Scenarios of v-if and v-show
* Implementation: `v-if` dynamically adds or removes `DOM` elements from the `DOM` tree, while `v-show` controls visibility by setting the `display` style property of `DOM` elements.
* Compilation process: When switching with `v-if`, there is a local compilation and unmounting process, which appropriately destroys and rebuilds internal event listeners and child components during the switching process. `v-show` simply switches based on CSS.
* Compilation condition: `v-if` is lazy, so if the initial condition is false, nothing happens. It only starts the local compilation when the condition becomes true for the first time. `v-show` is compiled and cached under any condition, and the `DOM` element is preserved.
* Performance consumption: `v-if` has higher switching costs, while `v-show` has higher initial rendering costs.
* Usage scenarios: `v-if` is suitable for situations where the condition is unlikely to change, while `v-show` is suitable for frequently changing conditions.

### Long List Performance Optimization
`Vue` hijacks the data through `Object.defineProperty` to make the view respond to data changes. However, sometimes our components are purely for data display and will not change. In the case of displaying a large amount of data, this can significantly reduce the initialization time of the components. You can use the `Object.freeze` method to freeze an object, making it immutable. For the optimization of long lists that need to be modified, the two core aspects are segmentation and differentiation. The specific execution steps are: only render the data visible in the viewport, perform function throttling, reduce the resident `VNode` and `Vue` components, do not use the displayed child component `slot`, and manually create virtual `DOM` to sever the object reference.

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

### Lazy Loading Routes
`Vue` in a single-page application may have many routes, causing the files after being packaged using `webpack` to be large. When the user enters the homepage, there could be too many resources loaded, leading to a blank screen, which is not conducive to the user experience. If we can split the components corresponding to different routes into different code chunks, and then load the corresponding components only when the route is accessed, this would be more efficient. The methods used for lazy loading routes in `Vue` include `Vue` asynchronous components, dynamic `import`, and `require.ensure` provided by `webpack`, with dynamic `import` being the most commonly used method.

```javascript
{
  path: "/example",
  name: "example",
  // After packaging, each component generates a separate chunk file
  component: () => import("@/views/example.vue")
}
```

### Server-Side Rendering (SSR)
If optimization of the first screen loading speed and the first screen loading speed is crucial, then server-side rendering `SSR` is necessary. The use of server-side rendering `SSR` has its pros and cons and requires a decision as to whether it is truly needed.

#### Pros
* Better for `SEO`: Since search engine crawlers can directly view fully rendered pages, if `SEO` is crucial for the site and the page content is asynchronously obtained, then server-side rendering `SSR` may be required to solve this issue.
* Faster time to content: Especially for slow network conditions or slow-running devices, there is no need to wait for all `JavaScript` to be downloaded and executed. Users will see the fully rendered page more quickly, often resulting in a better user experience. Server-side rendering `SSR` is crucial for applications where time to content and conversion rates are directly related.

#### Cons
* Development constraints: Browser-specific code can only be used in certain lifecycle hooks, and some external libraries may require special handling to run in server-rendered applications.
* More requirements for build settings and deployment: Unlike fully static single-page applications `SPA` that can be deployed on any static file server, server-rendered applications usually require a `Node.js server` runtime environment.
* Higher server-side load: Rendering a complete application in `Node.js` will obviously consume more CPU resources than just serving static files, therefore, if high traffic use is expected, it is necessary to prepare for the appropriate server load and use caching strategies wisely.

### Using the `keep-alive` Component
When switching between components, you may want to maintain the state of these components to avoid performance issues caused by repeated re-rendering. When wrapping dynamic components with `<keep-alive>`, it caches inactive component instances instead of destroying them. Re-creating dynamic components is usually very useful, but in some cases, we prefer that the component instances of those tags are cached when they are first created. In this case, wrapping the component with `<keep-alive>` can cache the current component instance, keeping it in memory to preserve component state or avoid re-rendering. Similar to `<transition>`, it does not render a `DOM` element itself, and does not appear in the component's parent chain.

```html
<keep-alive>
    <component v-bind:is="currentComponent" class="tab"></component>
</keep-alive>
```

## Packaging Optimization

### Template Precompilation
When using template inside `DOM` or string templates inside `JavaScript`, the template will be compiled into rendering functions at runtime. This process is usually fast enough, but for performance-sensitive applications, it is best to avoid this practice. The simplest way to precompile templates is to use single-file components, and the related build settings will automatically preprocess them. Therefore, the built code already contains the compiled rendering functions instead of the original template string. If using `webpack` and prefer to separate `JavaScript` and template files, `vue-template-loader` can be used to convert template files into `JavaScript` rendering functions during the build process.

### Source Map
After the project is packaged, the code of multiple files in development is packaged into one file, and after compression, removing extra spaces, and `babel` compilation, the final compiled code will be used in the production environment. Therefore, the processed code will be vastly different from the source code. When there is a `bug`, we can only locate the position of the compressed code and cannot locate the code in the development environment. This is not conducive for developers to locate and debug issues. Therefore, the `sourceMap` appears to solve the issue of difficult debugging in the code. However, `sourceMap` needs to be turned off in the production environment.

### Configuring splitChunksPlugins
`Webpack` provides a built-in plugin `CommonsChunkPlugin` specifically for extracting common parts from multiple chunks, which is used to extract common code. `CommonsChunkPlugin` has been removed in versions 4.0 and later, and should be replaced with `SplitChunksPlugin`.

### Using treeShaking
`tree shaking` is a term commonly used to describe the removal of unused code from the `JavaScript` context, relying on the static structure features of the `ES2015` module system, such as `import` and `export`. This term and concept actually originated from the `ES2015` module bundling tool `rollup`.


### On-demand introduction of third-party plugins

In our projects, we often need to introduce third-party plugins. If we directly import the entire plugin, it will lead to a large project size. We can use `babel-plugin-component` to only import the required components, in order to reduce the project size. Let's take the introduction of the `element-ui` component library in the project as an example.

```json
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

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://zhuanlan.zhihu.com/p/121000054
https://www.jianshu.com/p/f372d0e3de80
https://juejin.im/post/6844903887787278349
https://juejin.im/post/6844904189999448071
https://www.lagou.com/lgeduarticle/22278.html
https://www.cnblogs.com/mmzuo-798/p/11778044.html
https://blog.csdn.net/gtlbtnq9mr3/article/details/104889927
```