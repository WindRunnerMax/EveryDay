# Analysis of `computed` in Vue

In `Vue`, `computed` is a calculated property. It dynamically displays the new calculation result based on the data it depends on. Although using expressions in `{{}}` templates is very convenient, they were designed for simple operations. Putting too much logic in the template will make it heavy and difficult to maintain. Therefore, for any complex logic, computed properties should be used. Computed properties are based on reactive dependencies of data and are cached. They are only re-evaluated when the relevant reactive dependencies change. This means that as long as the data on which the computed property depends has not changed, accessing the computed property multiple times will immediately return the previous computed result without having to execute the function again. Of course, if you do not want to use caching, you can use a method instead and return the value. `computed` properties are very suitable for scenarios where one data is influenced by multiple data and data preprocessing is needed.

## Description
`computed` properties can define two types of parameters: `{ [key: string]: Function | { get: Function, set: Function } }`. Computed properties are directly defined in the `Vue` instance, and the `this` context for all `getters` and `setters` is automatically bound to the `Vue` instance. In addition, if an arrow function is used for a computed property, `this` will not point to the instance of this component, but you can still access the instance as the first parameter of the function. The result of the computed property will be cached, and it will only be recalculated when the dependent reactive `property` changes. Note that if a dependency, such as a non-reactive `property`, is outside the scope of this instance, the computed property will not be updated. In fact, `computed` will have its own `watcher`, with an internal `dirty` switch to decide whether the value of `computed` needs to be recalculated or reused directly.

```html
<!DOCTYPE html>
<html>
<head>
    <title>Vue</title>
</head>
<body>
    <div id="app"></div>
</body>
<script src="https://cdn.bootcss.com/vue/2.4.2/vue.js"></script>
<script type="text/javascript">
    var vm = new Vue({
        el: "#app",
        data: {
            a: 1,
            b: 2
        },
        template:`
            <div>
                <div>{{multiplication}}</div>
                <div>{{multiplication}}</div>
                <div>{{multiplication}}</div>
                <div>{{multiplicationArrow}}</div>
                <button @click="updateSetting">updateSetting</button>
            </div>
        `,
        computed:{
            multiplication: function(){
                console.log("a * b"); // Only printed once initially, the return value is cached
                return this.a * this.b;
            },
            multiplicationArrow: vm => vm.a * vm.b * 3, // Arrow function can access the current instance by passing in the parameter
            setting: {
                get: function(){
                    console.log("a * b * 6");
                    return this.a * this.b * 6;
                },
                set: function(v){
                    console.log(`${v} -> a`);
                    this.a = v;
                }
            }
        },
        methods:{
            updateSetting: function(){ // After clicking the button
                console.log(this.setting); // 12
                this.setting = 3; // 3 -> a
                console.log(this.setting); // 36
            }
        },

    })
</script>
</html>
```

## Analysis
Firstly, the bidirectional binding in `Vue` is implemented through `Object.defineProperty()`. The bidirectional data binding in `Vue` can be divided into the following three main parts:
* `Observer`: The main job here is to recursively monitor all properties on the object. When the property value changes, it triggers the corresponding `Watcher`.
* `Watcher`: Observes the data and executes the corresponding callback when the monitored data value is modified, updating the template content in `Vue`.
* `Dep`: Acts as a bridge between `Observer` and `Watcher`. Each `Observer` corresponds to a `Dep`, which internally maintains an array, saving the `Watcher` related to that `Observer`.

The implementation of `Vue` source code is quite complex, dealing with various compatibility issues, exceptions, and conditional branches. The article analyzes the core code part after simplification, with important parts commented. The commit id is `0664cb0`.
Firstly, in `dev/src/core/instance/state.js`, the initialization of `computed` and the implementation of the `initComputed` function are defined. As of now, the `computed` implementation of `SSR` server-side rendering is not considered.

```javascript
// dev/src/core/instance/state.js line 47
export function initState (vm: Component) {
  vm._watchers = []
  const opts = vm.$options // Get options defined by the component
  if (opts.props) initProps(vm, opts.props)
  if (opts.methods) initMethods(vm, opts.methods)
  if (opts.data) {
    initData(vm)
  } else {
    observe(vm._data = {}, true /* asRootData */)
  }
  if (opts.computed) initComputed(vm, opts.computed) // Initialize if computed properties are defined
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
  }
}

// dev/src/core/instance/state.js line 169
function initComputed (vm: Component, computed: Object) {
  // $flow-disable-line
  const watchers = vm._computedWatchers = Object.create(null) // Create an object without a prototype chain
  // computed properties are just getters during SSR
  const isSSR = isServerRendering()

  for (const key in computed) {
    const userDef = computed[key] // Get the definition of the computed property key
    const getter = typeof userDef === 'function' ? userDef : userDef.get // Since computed properties accept two types of parameters, this judgment is used to obtain the getter
    if (process.env.NODE_ENV !== 'production' && getter == null) {
      warn(
        `Getter is missing for computed property "${key}".`,
        vm
      )
    }

    if (!isSSR) {
      // create internal watcher for the computed property.
      // Generates computed watcher(vm, getter, noop, { lazy: true })
      watchers[key] = new Watcher( // Create a watcher and message subscriber dep for the computed property
        vm,
        getter || noop,
        noop,
        computedWatcherOptions
      )
    }
```

```javascript
// component-defined computed properties are already defined on the
// component prototype. We only need to define computed properties defined
// at instantiation here.
if (!(key in vm)) { // Check for duplicate properties
  defineComputed(vm, key, userDef) // Define property
} else if (process.env.NODE_ENV !== 'production') {
  if (key in vm.$data) {
    warn(`The computed property "${key}" is already defined in data.`, vm)
  } else if (vm.$options.props && key in vm.$options.props) {
    warn(`The computed property "${key}" is already defined as a prop.`, vm)
  }
}
}

```

`defineComputed` takes three parameters: the `vm` instance, the `key` of the computed property, and the `userDef` definition of the computed property. The property descriptor `sharedPropertyDefinition` is initially defined and then overwritten after multiple checks such as `userDef` and `shouldCache`, and then the property is defined through `Object.defineProperty(target, key, sharedPropertyDefinition)`.

```javascript
// dev/src/core/instance/state.js line 31
const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}

// dev/src/core/instance/state.js line 210
export function defineComputed (
  target: any,
  key: string,
  userDef: Object | Function
) {
  const shouldCache = !isServerRendering()
  if (typeof userDef === 'function') {
    sharedPropertyDefinition.get = shouldCache
      ? createComputedGetter(key)
      : createGetterInvoker(userDef)
    sharedPropertyDefinition.set = noop
  } else {
    sharedPropertyDefinition.get = userDef.get
      ? shouldCache && userDef.cache !== false
        ? createComputedGetter(key)
        : createGetterInvoker(userDef.get)
      : noop
    sharedPropertyDefinition.set = userDef.set || noop
  }
  if (process.env.NODE_ENV !== 'production' &&
      sharedPropertyDefinition.set === noop) {
    sharedPropertyDefinition.set = function () {
      warn(
        `Computed property "${key}" was assigned to but it has no setter.`,
        this
      )
    }
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}
```

```javascript
/**
The property descriptor after rewriting roughly appears as follows in a certain conditional branch
sharedPropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: function computedGetter () {
      const watcher = this._computedWatchers && this._computedWatchers[key]
      if (watcher) {
        if (watcher.dirty) {
          watcher.evaluate()
        }
        if (Dep.target) {
          watcher.depend()
        }
        return watcher.value
      }
    },
    set: userDef.set || noop
 } 
When the computed property is called, the get accessor function is executed, associating with the watcher object, then executing watcher.depend() to collect dependencies and watcher.evaluate() to calculate the value.
*/
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://cn.vuejs.org/v2/api/#computed
https://juejin.im/post/6844903678533451783
https://juejin.im/post/6844903873925087239
https://cn.vuejs.org/v2/guide/computed.html
https://zheyaoa.github.io/2019/09/07/computed/
https://www.cnblogs.com/tugenhua0707/p/11760466.html
```