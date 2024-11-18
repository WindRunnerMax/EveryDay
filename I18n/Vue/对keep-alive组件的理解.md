# Understanding of the keep-alive component

When switching between components, sometimes you want to maintain the state of these components to avoid performance issues caused by repeated re-rendering. When wrapping dynamic components with `<keep-alive>`, inactive component instances will be cached instead of destroyed.

## Description
Recreating dynamic components is often very useful, but in some cases we prefer to cache instances of those components when they are first created. In this case, wrapping the component with `<keep-alive>` can cache the current component instance, storing the component in memory for preserving its state or avoiding re-rendering. Similar to `<transition>`, it does not render a `DOM` element itself and does not appear in the parent component chain.

```html
<keep-alive>
    <component v-bind:is="currentComponent" class="tab"></component>
</keep-alive>
```

Components contained within `<keep-alive>` will not be reinitialized, meaning that their lifecycle hooks will not be triggered again. `<keep-alive>` maintains the current component's state and will trigger its creation lifecycle normally the first time it is created. However, since the component is not actually destroyed, the destruction lifecycle of the component will not be triggered. When the component is toggled within `<keep-alive>`, its `activated` and `deactivated` lifecycle hooks will be executed accordingly.

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

`<keep-alive>` can receive `3` attributes as parameters to match corresponding components for caching. First, it checks the component's own `name` option. If the `name` option is not available, it matches its locally registered name, which is the key of the parent component's `components` option. Anonymous components cannot be matched. In addition to using `<keep-alive>`'s `props` to control component caching, it is usually combined with the `meta` property defined in `vue-router` and the `<keep-alive>` defined in the `template` for conditional caching control of components.
* `include`: Components to be included, which can be a string, array, or regular expression. Only the matched components will be cached.
* `exclude`: Components to be excluded, which can be a string, array, or regular expression. No matched components will be cached. When matching conditions exist in both `include` and `exclude`, `exclude` takes the highest priority.
* `max`: The maximum number of cached components, which can be a string or number. It controls the number of cached components. Once this number is reached, the least recently accessed instance among the cached components will be destroyed before a new instance is created.

```html
<!-- Include comma-separated strings -->
<keep-alive include="a,b">
    <component :is="show"></component>
</keep-alive>

<!-- Include regular expression using v-bind -->
<keep-alive :include="/a|b/">
    <component :is="show"></component>
</keep-alive>

<!-- Include array using v-bind -->
<keep-alive :include="['a', 'b']">
    <component :is="show"></component>
</keep-alive>

<!-- Exclude comma-separated strings -->
<keep-alive exclude="a,b">
    <component :is="show"></component>
</keep-alive>

<!-- Maximum cache size (number) -->
<keep-alive :max="10">
    <component :is="show"></component>
</keep-alive>
```

`<keep-alive>` is used in a scenario where one of its immediate child components is being toggled. If there is a `v-for` inside, it will not work. If there are multiple conditional child elements as described above, `<keep-alive>` requires that only one child element is rendered at the same time. In simple terms, `<keep-alive>` can only have one child component at most, and in the `render` function of `<keep-alive>`, when rendering the components within `<keep-alive>`, `Vue` takes the first immediate child component for caching.

```javascript
const vnode: VNode = getFirstComponentChild(this.$slots.default);
```


## Implementation
The source code of the `<keep-alive>` component in `Vue` is defined in `dev/src/core/components/keep-alive.js`. The `commit id` for this analysis implementation is `215f877`.
During the initialization of `<keep-alive>`, in the `created` phase, two variables are initialized: `cache` and `keys`. In the `mounted` phase, the values of the `include` and `exclude` variables are monitored. 

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
The `$watch` method above can detect changes in parameters. If the values of `include` or `exclude` change, the `pruneCache` function is triggered. However, the filtering conditions need to be determined based on the return value of the `matches` function. The `matches` function accepts three types of parameters: `string`, `RegExp`, and `Array`, to determine whether caching should occur.

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
The `pruneCache` function is used to prune the `key` values that do not meet the conditions. Whenever the filter condition changes, the `pruneCacheEntry` method must be called to prune the `key` that does not meet the conditions from the existing cache.

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

During each rendering or `render`, the first child component is obtained first, followed by obtaining the configuration information of the child component. Its information is obtained, and it is determined whether the component meets the filtering conditions before rendering. If it does not need to be cached, the component is directly returned. If it meets the conditions, the instance of the component is directly taken from the cache, and its position in the `keys` array is adjusted to place it at the end. If the component is not in the cache, it is added to the cache. If `max` is defined, and the number of cached components exceeds the value defined by `max`, the first cached `vnode` is removed. Then the component is returned and rendered.

```javascript
export default {
  render () {
    const slot = this.$slots.default
    const vnode = getFirstComponentChild(slot)
    const componentOptions = vnode && vnode.componentOptions
    if (componentOptions) {
      const name = getComponentName(componentOptions)
      const { include, exclude } = this
      if (
        (include && (!name || !matches(include, name))) ||
        (exclude && name && matches(exclude, name))
      ) {
        return vnode
      }

      const { cache, keys } = this
      const key = vnode.key == null
        ? componentOptions.Ctor.cid + (componentOptions.tag ? `::${componentOptions.tag}` : '')
        : vnode.key
      if (cache[key]) {
        vnode.componentInstance = cache[key].componentInstance
        remove(keys, key)
        keys.push(key)
      } else {
        cache[key] = vnode
        keys.push(key)
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

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

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