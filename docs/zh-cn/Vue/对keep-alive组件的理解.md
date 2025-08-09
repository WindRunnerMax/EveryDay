# 对keep-alive组件的理解
当在组件之间切换的时候，有时会想保持这些组件的状态，以避免反复重渲染导致的性能等问题，使用`<keep-alive>`包裹动态组件时，会缓存不活动的组件实例，而不是销毁它们。

## 概述
重新创建动态组件的行为通常是非常有用的，但是在有些情况下我们更希望那些标签的组件实例能够被在它们第一次被创建的时候缓存下来，此时使用`<keep-alive>`包裹组件即可缓存当前组件实例，将组件缓存到内存，用于保留组件状态或避免重新渲染，和`<transition>`相似它，其自身不会渲染一个`DOM`元素，也不会出现在组件的父组件链中。

```html
<keep-alive>
    <component v-bind:is="currentComponent" class="tab"></component>
</keep-alive>
```

被`<keep-alive>`包含的组件不会被再次初始化，也就意味着不会重走生命周期函数，`<keep-alive>`保持了当前的组件的状态，在第一次创建的时候回正常触发其创建生命周期，但是由于组件其实并未销毁，所以不会触发组件的销毁生命周期，而当组件在`<keep-alive>`内被切换时，它的`activated`和`deactivated`这两个生命周期钩子函数将会被对应执行。

```javascript
export default {
    data: function() {
        return {
        
        }
    },
    activated: function(){
        console.log("activated");
    },
    deactivated: function(){
        console.log("deactivated");
    },
}
```

`<keep-alive>`可以接收`3`个属性做为参数进行匹配对应的组件进行缓存，匹配首先检查组件自身的`name`选项，如果`name`选项不可用，则匹配它的局部注册名称，即父组件`components`选项的键值，匿名组件不能被匹配，除了使用`<keep-alive>`的`props`控制组件缓存，通常还可以配合`vue-router`在定义时的`meta`属性以及在`template`定义的`<keep-alive>`进行组件的有条件的缓存控制。
* `include`: 包含的组件，可以为字符串，数组，以及正则表达式,只有匹配的组件会被缓存。
* `exclude`: 排除的组件，以为字符串，数组，以及正则表达式,任何匹配的组件都不会被缓存，当匹配条件同时在`include`与`exclude`存在时，以`exclude`优先级最高。
* `max`: 缓存组件的最大值，类型为字符或者数字,可以控制缓存组件的个数，一旦这个数字达到了，在新实例被创建之前，已缓存组件中最久没有被访问的实例会被销毁掉。

```html
<!-- 包含 逗号分隔字符串 -->
<keep-alive include="a,b">
    <component :is="show"></component>
</keep-alive>

<!-- 包含 正则表达式 使用v-bind -->
<keep-alive :include="/a|b/">
    <component :is="show"></component>
</keep-alive>

<!-- 包含 数组 使用v-bind -->
<keep-alive :include="['a', 'b']">
    <component :is="show"></component>
</keep-alive>

<!-- 排除 逗号分隔字符串 -->
<keep-alive exclude="a,b">
    <component :is="show"></component>
</keep-alive>

<!-- 最大缓存量 数字 -->
<keep-alive :max="10">
    <component :is="show"></component>
</keep-alive>
```

`<keep-alive>`是用在其一个直属的子组件被开关的情形，如果在其中有`v-for`则不会工作，如果有上述的多个条件性的子元素，`<keep-alive>`要求同时只有一个子元素被渲染，通俗点说，`<keep-alive>`最多同时只能存在一个子组件，在`<keep-alive>`的`render`函数中定义的是在渲染`<keep-alive>`内的组件时，`Vue`是取其第一个直属子组件来进行缓存。

```javascript
const vnode: VNode = getFirstComponentChild(this.$slots.default);
```

## 实现
`Vue`中`<keep-alive>`组件源码定义在`dev/src/core/components/keep-alive.js`，本次分析实现的`commit id`为`215f877`。  
在`<keep-alive>`初始化时的`created`阶段会初始化两个变量，分别为`cache`和`keys`，`mounted`阶段会对`include`和`exclude`变量的值做监测。

```javascript
export default {
    created () {
        this.cache = Object.create(null)
        this.keys = []
    },
    mounted () {
        this.$watch('include', val => {
            pruneCache(this, name => matches(val, name))
        })
        this.$watch('exclude', val => {
            pruneCache(this, name => !matches(val, name))
        })
    },
}
```
上边的`$watch`方法能够对参数的变化进行检测，如果`include`或者`exclude`的值发生变化，就会触发`pruneCache`函数，不过筛选的条件需要根据`matches`函数的返回值来决定，`matches`函数接收三种类型的参数`string`、`RegExp`、`Array`，用以决定是否进行缓存。

```javascript
function matches (pattern: string | RegExp | Array<string>, name: string): boolean {
    if (Array.isArray(pattern)) {
        return pattern.indexOf(name) > -1
    } else if (typeof pattern === 'string') {
        return pattern.split(',').indexOf(name) > -1
    } else if (isRegExp(pattern)) {
        return pattern.test(name)
    }
    /* istanbul ignore next */
    return false
}
```
`pruneCache`函数用以修建不符合条件的`key`值，每当过滤条件改变，都需要调用`pruneCacheEntry`方法从已有的缓存中修建不符合条件的`key`。

```javascript
function pruneCache (keepAliveInstance: any, filter: Function) {
    const { cache, keys, _vnode } = keepAliveInstance
    for (const key in cache) {
        const cachedNode: ?VNode = cache[key]
        if (cachedNode) {
            const name: ?string = getComponentName(cachedNode.componentOptions)
            if (name && !filter(name)) {
                pruneCacheEntry(cache, key, keys, _vnode)
            }
        }
    }
}

function pruneCacheEntry (
    cache: VNodeCache,
    key: string,
    keys: Array<string>,
    current?: VNode
) {
    const cached = cache[key]
    if (cached && (!current || cached.tag !== current.tag)) {
        cached.componentInstance.$destroy()
    }
    cache[key] = null
    remove(keys, key)
}
```

在每次渲染即`render`时，首先获取第一个子组件，之后便是获取子组件的配置信息，获取其信息，判断该组件在渲染之前是否符合过滤条件，不需要缓存的便直接返回该组件，符合条件的直接将该组件实例从缓存中取出，并调整该组件在`keys`数组中的位置，将其放置于最后，如果缓存中没有该组件，那么将其加入缓存，并且定义了`max`并且缓存组件数量如果超出`max`定义的值则将第一个缓存的`vnode`移除，之后返回组件并渲染。

```javascript
export default {
  render () {
    const slot = this.$slots.default
    const vnode: VNode = getFirstComponentChild(slot)
    const componentOptions: ?VNodeComponentOptions = vnode && vnode.componentOptions
    if (componentOptions) {
      // check pattern
      const name: ?string = getComponentName(componentOptions)
      const { include, exclude } = this
      if (
        // not included
        (include && (!name || !matches(include, name))) ||
        // excluded
        (exclude && name && matches(exclude, name))
      ) {
        return vnode
      }

      const { cache, keys } = this
      const key: ?string = vnode.key == null
        // same constructor may get registered as different local components
        // so cid alone is not enough (#3269)
        ? componentOptions.Ctor.cid + (componentOptions.tag ? `::${componentOptions.tag}` : '')
        : vnode.key
      if (cache[key]) {
        vnode.componentInstance = cache[key].componentInstance
        // make current key freshest
        remove(keys, key)
        keys.push(key)
      } else {
        cache[key] = vnode
        keys.push(key)
        // prune oldest entry
        if (this.max && keys.length > parseInt(this.max)) {
          pruneCacheEntry(cache, keys[0], keys, this._vnode)
        }
      }

      vnode.data.keepAlive = true
    }
    return vnode || (slot && slot[0])
  }
}
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://zhuanlan.zhihu.com/p/85120544
https://cn.vuejs.org/v2/api/#keep-alive
https://juejin.im/post/6844904082038063111
https://juejin.im/post/6844903919273918477
https://juejin.im/post/6844904099272458253
https://juejin.im/post/6844904160962281479
https://fullstackbb.com/vue/deep-into-keep-alive-in-vuejs/
https://blog.liuyunzhuge.com/2020/03/20/%E7%90%86%E8%A7%A3vue%E4%B8%ADkeep-alive%E7%BB%84%E4%BB%B6%E6%BA%90%E7%A0%81/
```
