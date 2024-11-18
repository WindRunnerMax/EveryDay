# Vue Array Change Monitoring
Vue implements two-way data binding through data hijacking, using `Object.defineProperty()` to hijack properties. However, the `setter` in `Object.defineProperty()` cannot directly monitor changes in array values. To monitor direct access to array indexes, each value needs to be hijacked. However, due to performance considerations, Vue does not adopt this approach, hence the need for special handling of array changes. 

## Description
Vue achieves two-way data binding through data hijacking, with the core method being `Object.defineProperty()`, which allows precise addition or modification of object properties. The `getter` and `setter` descriptor in the property descriptor is used for hijacking. 

```javascript
var obj = { __x: 1 };
Object.defineProperty(obj, "x", {
    set: function(x){ console.log("watch"); this.__x = x; },
    get: function(){ return this.__x; }
});
obj.x = 11; // watch
console.log(obj.x); // 11
```

When hijacking is applied to an array and values in the array are directly accessed by index, the `setter` in `Object.defineProperty()` cannot directly monitor changes in the array values. Therefore, special handling of array changes is required. While it's possible to loop through each value in the array and use `Object.defineProperty()` to hijack them by index, Vue's creator, Evan You, explained that due to the performance cost not being proportional to the user experience benefits, this method was not used to make index access responsive. Specific details can be found in the Vue source code on `GitHub` in issue `#8562`.

```javascript
var obj = { __x: [1, 2, 3] };
Object.defineProperty(obj, "x", {
    set: function(x){ console.log("watch"); this.__x = x; },
    get: function(){ return this.__x; }
});
obj.x[0] = 11;
console.log(obj.x); // [11, 2, 3]
obj.x = [1, 2, 3, 4, 5, 6]; // watch
console.log(obj.x); // [1, 2, 3, 4, 5, 6]
obj.x.push(7);
console.log(obj.x); // [1, 2, 3, 4, 5, 6, 7]
```

```javascript
// Hijacking each value by index
var obj = { __x: [1, 2, 3] };
Object.defineProperty(obj, "x", {
    set: function(x){ console.log("watch"); this.__x = x; },
    get: function(){ return this.__x; }
});
obj.x.forEach((v, i) => {
    Object.defineProperty(obj.x, i,{
        set:function(x) { console.log("watch"); v = x; },
        get: function(){ return v; }
    })
})
obj.x[0] = 11; // watch
console.log(obj.x); // [11, 2, 3]
```


In Vue, data undergoes special processing, and direct index access modifications also do not trigger the `setter`, but methods like `push` have been overridden for this purpose.

```html
<!DOCTYPE html>
<html>
<head>
    <title>Listening for Array Changes in Vue</title>
</head>
<body>
    <div id="app"></div>
</body>
<script src="https://cdn.bootcss.com/vue/2.4.2/vue.js"></script>
<script type="text/javascript">
    var vm = new Vue({
        el: '#app',
        data: {
            msg: [1, 2, 3]
        },
        template:`
            <div>
                <div v-for="item in msg" :key="item">{{item}}</div>
                <button @click="subscript">subscript</button>
                <button @click="push">push</button>
            </div>
        `,
        methods:{
            subscript: function(){
                this.msg[0] = 11;
                console.log(this.msg); // [11, 2, 3, __ob__: Observer]
            },
            push: function(){
                this.msg.push(4, 5, 6);
                console.log(this.msg); // [1, 2, 3, 4, 5, 6, __ob__: Observer]
            }
        }
    })
</script>
</html>
```

The specific override solution in `Vue` is completed through the prototype chain. Specifically, a new object is created using the `Object.create` method, using the passed object as the `__proto__` of the newly created object, and then intercepting operations on the array with specific methods to achieve the monitoring of array operations.

```javascript
// dev/src/core/observer/array.js
/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

import { def } from '../util/index'

const arrayProto = Array.prototype
export const arrayMethods = Object.create(arrayProto)

const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

/**
 * Intercept mutating methods and emit events
 */
methodsToPatch.forEach(function (method) {
  // cache original method
  const original = arrayProto[method]
  def(arrayMethods, method, function mutator (...args) {
    const result = original.apply(this, args)
    const ob = this.__ob__
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    if (inserted) ob.observeArray(inserted)
    // notify change
    ob.dep.notify()
    return result
  })
})
```

## Handling Method

### Reassignment
The `Object.defineProperty()` method cannot intercept changes to the values accessed through array index, so it is necessary to avoid this kind of access. You can use the method of modifying the value and then assigning it, or you can use some methods in the array to form a new array. Methods that do not change the original array and return a new array include `slice`, `concat`, and the spread operator. Of course, you can also use the `map` method to generate a new array. In addition, in `Vue`, because the `splice` method has been rewritten, you can also use the `splice` method to update the view.

```javascript
var obj = { __x: [1, 2, 3] };
Object.defineProperty(obj, "x", {
    set: function(x){ console.log("watch"); this.__x = x; },
    get: function(){ return this.__x; }
});

obj.x[0] = 11;
obj.x = obj.x; // watch
console.log(obj.x); // [11, 2, 3]

obj.x[0] = 111;
obj.x = [].concat(obj.x); // watch
console.log(obj.x); // [111, 2, 3]

obj.x[0] = 1111;
obj.x = obj.x.slice(); // watch
console.log(obj.x); // [1111, 2, 3]

obj.x[0] = 11111;
obj.x = obj.x.splice(0, obj.x.length); // watch
console.log(obj.x); // [11111, 2, 3]
```

### Proxy
`Vue 3.0` uses `Proxy` to achieve data interception. `Object.defineProperty` can only monitor properties, while `Proxy` can monitor the entire object. By calling `new Proxy()`, a proxy can be created to replace another object, which is called the target. This proxy virtually represents the target object, so the proxy and the target object can be treated as the same object on the surface. The proxy allows intercepting low-level operations on the target object, which is originally an internal ability of the `Js` engine. The interception behavior uses a function that can respond to specific operations. By using `Proxy` to proxy an object, we will get an object that is almost identical to the object being proxied and can completely monitor this object from a low level.

```javascript
var target = [1, 2, 3];
var proxy = new Proxy(target, {
    set: function(target, key, value, receiver){ 
        console.log("watch");
        return Reflect.set(target, key, value, receiver);
    },
    get: function(target, key, receiver){ 
        return target[key];
    }
});
proxy[0] = 11; // watch
console.log(target); // [11, 2, 3]
```



## Daily Topic

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://zhuanlan.zhihu.com/p/50547367
https://github.com/vuejs/vue/issues/8562
https://juejin.im/post/6844903699425263629
https://juejin.im/post/6844903597591773198
https://segmentfault.com/a/1190000015783546
https://cloud.tencent.com/developer/article/1607061
https://www.cnblogs.com/tugenhua0707/p/11754291.html
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy
```