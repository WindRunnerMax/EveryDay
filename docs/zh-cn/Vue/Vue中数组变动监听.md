# Vue中数组变动监听
`Vue`的通过数据劫持的方式实现数据的双向绑定，即使用`Object.defineProperty()`来实现对属性的劫持，但是`Object.defineProperty()`中的`setter`是无法直接实现数组中值的改变的劫持行为的，想要实现对于数组下标直接访问的劫持需要使用索引对每一个值进行劫持，但是在`Vue`中考虑性能问题并未采用这种方式，所以需要特殊处理数组的变动。

## 描述
`Vue`是通过数据劫持的方式来实现数据双向数据绑定的，其中最核心的方法便是通过`Object.defineProperty()`来实现对属性的劫持，该方法允许精确地添加或修改对象的属性，对数据添加属性描述符中的`getter`与`setter`存取描述符实现劫持。

```javascript
var obj = { __x: 1 };
Object.defineProperty(obj, "x", {
    set: function(x){ console.log("watch"); this.__x = x; },
    get: function(){ return this.__x; }
});
obj.x = 11; // watch
console.log(obj.x); // 11
```

而如果当劫持的值为数组且直接根据下标处理数组中的值时，`Object.defineProperty()`中的`setter`是无法直接实现数组中值的改变的劫持行为的，所以需要特殊处理数组的变动，当然我们可以对于数组中每一个值进行循环然后通过索引同样使用`Object.defineProperty()`进行劫持，但是在`Vue`中尤大解释说是由于性能代价和获得的用户体验收益不成正比，所以并没有使用这种方式使下标访问实现响应式，具体可以参阅`github`中`Vue`源码的`#8562`。

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
// 通过下标对每一个值进行劫持
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


在`Vue`中对于数据是经过特殊处理的，对于下标直接访问的修改同样是不能触发`setter`，但是对于`push`等方法都进行了重写。

```html
<!DOCTYPE html>
<html>
<head>
    <title>Vue中数组变动监听</title>
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

在`Vue`中具体的重写方案是通过原型链来完成的，具体是通过`Object.create`方法创建一个新对象，使用传入的对象来作为新创建的对象的`__proto__`，之后对于特定的方法去拦截对数组的操作，从而实现对操作数组这个行为的监听。

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

## 处理方法


### 重赋值
`Object.defineProperty()`方法无法劫持对于数组值下标方式访问的值的改变，这样的话就需要避免这种访问，可以采用修改后再赋值的方式，也可以采用数组中的一些方法去形成一个新数组，数组中不改变原数组并返回一个新数组的方法有`slice`、`concat`等方法以及`spread`操作符，当然也可以使用`map`方法生成新数组，此外在`Vue`中由于重写了`splice`方法，也可以使用`splice`方法进行视图的更新。


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
`Vue3.0`使用`Proxy`实现数据劫持，`Object.defineProperty`只能监听属性，而`Proxy`能监听整个对象，通过调用`new Proxy()`，可以创建一个代理用来替代另一个对象被称为目标，这个代理对目标对象进行了虚拟，因此该代理与该目标对象表面上可以被当作同一个对象来对待。代理允许拦截在目标对象上的底层操作，而这原本是`Js`引擎的内部能力，拦截行为使用了一个能够响应特定操作的函数，即通过`Proxy`去对一个对象进行代理之后，我们将得到一个和被代理对象几乎完全一样的对象，并且可以从底层实现对这个对象进行完全的监控。

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



## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

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
