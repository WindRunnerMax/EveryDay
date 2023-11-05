# Vue中computed分析
在`Vue`中`computed`是计算属性，其会根据所依赖的数据动态显示新的计算结果，虽然使用`{{}}`模板内的表达式非常便利，但是设计它们的初衷是用于简单运算的，在模板中放入太多的逻辑会让模板过重且难以维护，所以对于任何复杂逻辑，都应当使用计算属性。计算属性是基于数据的响应式依赖进行缓存的，只在相关响应式依赖发生改变时它们才会重新求值，也就是说只要计算属性依赖的数据还没有发生改变，多次访问计算属性会立即返回之前的计算结果，而不必再次执行函数，当然如果不希望使用缓存可以使用方法属性并返回值即可，`computed`计算属性非常适用于一个数据受多个数据影响以及需要对数据进行预处理的条件下使用。  

## 描述
`computed`计算属性可以定义两种方式的参数，`{ [key: string]: Function | { get: Function, set: Function } }`，计算属性直接定义在`Vue`实例中，所有`getter`和`setter`的`this`上下文自动地绑定为`Vue`实例，此外如果为一个计算属性使用了箭头函数，则`this`不会指向这个组件的实例，不过仍然可以将其实例作为函数的第一个参数来访问，计算属性的结果会被缓存，除非依赖的响应式`property`变化才会重新计算，注意如果某个依赖例如非响应式`property`在该实例范畴之外，则计算属性是不会被更新的。事实上`computed`会拥有自己的`watcher`，其内部有个属性`dirty`开关来决定`computed`的值是需要重新计算还是直接复用之前的值。

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
                console.log("a * b"); // 初始只打印一次 返回值被缓存
                return this.a * this.b;
            },
            multiplicationArrow: vm => vm.a * vm.b * 3, // 箭头函数可以通过传入的参数获取当前实例
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
            updateSetting: function(){ // 点击按钮后
                console.log(this.setting); // 12
                this.setting = 3; // 3 -> a
                console.log(this.setting); // 36
            }
        },

    })
</script>
</html>
```

## 分析
首先在`Vue`中完成双向绑定是通过`Object.defineProperty()`实现的，`Vue`的双向数据绑定，简单点来说分为以下三个部分：
* `Observer`: 这里的主要工作是递归地监听对象上的所有属性，在属性值改变的时候，触发相应的`Watcher`。
* `Watcher`: 观察者，当监听的数据值修改时，执行响应的回调函数，在`Vue`里面的更新模板内容。
* `Dep`: 链接`Observer`和`Watcher`的桥梁，每一个`Observer`对应一个`Dep`，它内部维护一个数组，保存与该`Observer`相关的`Watcher`。

`Vue`源码的实现比较复杂，会处理各种兼容问题与异常以及各种条件分支，文章分析比较核心的代码部分，精简过后的版本，重要部分做出注释，`commit id`为`0664cb0`。  
首先在`dev/src/core/instance/state.js`中定义了初始化`computed`以及`initComputed`函数的实现，现在暂不考虑`SSR`服务端渲染的`computed`实现。

```javascript
// dev/src/core/instance/state.js line 47
export function initState (vm: Component) {
  vm._watchers = []
  const opts = vm.$options // 获取组件定义的选项
  if (opts.props) initProps(vm, opts.props)
  if (opts.methods) initMethods(vm, opts.methods)
  if (opts.data) {
    initData(vm)
  } else {
    observe(vm._data = {}, true /* asRootData */)
  }
  if (opts.computed) initComputed(vm, opts.computed) // 定义computed属性则进行初始化
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
  }
}

// dev/src/core/instance/state.js line 169
function initComputed (vm: Component, computed: Object) {
  // $flow-disable-line
  const watchers = vm._computedWatchers = Object.create(null) // 创建一个没有原型链指向的对象
  // computed properties are just getters during SSR
  const isSSR = isServerRendering()

  for (const key in computed) {
    const userDef = computed[key] // 获取计算属性的key值定义
    const getter = typeof userDef === 'function' ? userDef : userDef.get // 由于计算属性接受两种类型的参数 此处判断用以获取getter
    if (process.env.NODE_ENV !== 'production' && getter == null) {
      warn(
        `Getter is missing for computed property "${key}".`,
        vm
      )
    }

    if (!isSSR) {
      // create internal watcher for the computed property.
      // 生成computed watcher(vm, getter, noop, { lazy: true })
      watchers[key] = new Watcher( // 计算属性创建观察者watcher和消息订阅器dep
        vm,
        getter || noop,
        noop,
        computedWatcherOptions
      )
    }

    // component-defined computed properties are already defined on the
    // component prototype. We only need to define computed properties defined
    // at instantiation here.
    if (!(key in vm)) { // 检查重名属性
      defineComputed(vm, key, userDef) // 定义属性
    } else if (process.env.NODE_ENV !== 'production') {
      if (key in vm.$data) {
        warn(`The computed property "${key}" is already defined in data.`, vm)
      } else if (vm.$options.props && key in vm.$options.props) {
        warn(`The computed property "${key}" is already defined as a prop.`, vm)
      }
    }
  }
}
```

`defineComputed`传入了三个参数，`vm`实例、计算属性的`key`以及`userDef`计算属性的定义，属性描述符`sharedPropertyDefinition`在初始化定义之后经过`userDef`和`shouldCache`等多重判断后被重写，进而通过`Object.defineProperty(target, key, sharedPropertyDefinition)`进行属性的定义。

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

/**
 经过重写之后的属性描述符在某条件分支大致呈现如下
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
 当计算属性被调用时便会执行 get 访问函数，从而关联上观察者对象 watcher 然后执行 wather.depend() 收集依赖和 watcher.evaluate() 计算求值。
*/
```




## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://cn.vuejs.org/v2/api/#computed
https://juejin.im/post/6844903678533451783
https://juejin.im/post/6844903873925087239
https://cn.vuejs.org/v2/guide/computed.html
https://zheyaoa.github.io/2019/09/07/computed/
https://www.cnblogs.com/tugenhua0707/p/11760466.html
```
