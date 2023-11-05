# Js中Proxy对象
`Proxy`对象用于定义基本操作的自定义行为，例如属性查找、赋值、枚举、函数调用等。

## 语法

```javascript
const proxy = new Proxy(target, handler);
```

* `target`: 要使用`Proxy`包装的目标对象，可以是任何类型的对象，包括原生数组，函数，甚至另一个代理。
* `handler`: 一个通常以函数作为属性的对象，各属性中的函数分别定义了在执行各种操作时代理`proxy`的行为。

## 描述
`Proxy`用于修改某些操作的默认行为，也可以理解为在目标对象之前架设一层拦截，外部所有的访问都必须先通过这层拦截，因此提供了一种机制，可以对外部的访问进行过滤和修改。这个词的原理为代理，在这里可以表示由它来代理某些操作，译为代理器。  

```javascript
var target = {a: 1};
var proxy = new Proxy(target, {
    set: function(target, key, value, receiver){ 
        console.log("watch");
        return Reflect.set(target, key, value, receiver);
    },
    get: function(target, key, receiver){ 
        return target[key];
    }
});
proxy.a = 11; // watch
console.log(target); // {a: 11}
```

`Object.defineProperty`是用于监听属性，而`Proxy`是监听整个对象，通过调用`new Proxy()`，可以创建一个代理用来替代另一个对象被称为目标，这个代理对目标对象进行了虚拟，因此该代理与该目标对象表面上可以被当作同一个对象来对待。代理允许拦截在目标对象上的底层操作，而这原本是`Js`引擎的内部能力，拦截行为使用了一个能够响应特定操作的函数，即通过`Proxy`去对一个对象进行代理之后，我们将得到一个和被代理对象几乎完全一样的对象，并且可以从底层实现对这个对象进行完全的监控。

```javascript
// 常见的一道面试题 实现 a===1&&a===2&&a===3 为true

// Object.defineProperty 定义的是属性
// 可以实现对于题目的要求
var  _a = 0;
Object.defineProperty(window, "a", {
    get:function(){
        return ++_a;
    }
})
console.log(a===1 && a===2 && a===3); // true

// proxy 代理的是对象 
// 因此在调用时实际与题目要求并不太相符
// 但同样也是一种实现方式
var _a = 0;
var proxy = new Proxy(window, {
    set: function(target, key, value, receiver){ 
        return Reflect.set(target, key, value, receiver);
    },
    get: function(target, key, receiver){
        if(key === "a") return ++_a;
        else return window[key];
    }
});
console.log(proxy.a===1 && proxy.a===2 && proxy.a===3); //true
```

## 方法

### Proxy.revocable()
`Proxy.revocable(target, handler)`  
`Proxy.revocable()`方法可以用来创建一个可撤销的代理对象，其返回一个包含了代理对象本身和它的撤销方法的可撤销`Proxy`对象。

* `target`: 将用`Proxy`封装的目标对象，可以是任何类型的对象，包括原生数组，函数，甚至可以是另外一个代理对象。
* `handler`: 一个对象，其属性是一批可选的函数，这些函数定义了对应的操作被执行时代理的行为。

该方法的返回值是一个对象，其结构为`{"proxy": proxy, "revoke": revoke}`，一旦某个代理对象被撤销，它将变得几乎完全不可调用，在它身上执行任何的可代理操作都会抛出`TypeError`异常，注意可代理操作一共有`14`种，执行这`14`种操作以外的操作不会抛出异常。一旦被撤销，这个代理对象便不可能被直接恢复到原来的状态，同时和它关联的目标对象以及处理器对象都有可能被垃圾回收掉。再次调用撤销方法`revoke()`则不会有任何效果，但也不会报错。

```javascript
var revocable = Proxy.revocable({}, {
  get: function(target, key) {
    return `[[ ${key} ]]`;
  }
});
var proxy = revocable.proxy;
console.log(proxy.example); // [[ example ]]
revocable.revoke();
// console.log(proxy.example);  // 抛出 TypeError
// proxy.example = 1;           // 抛出 TypeError
// delete proxy.example;        // 抛出 TypeError
// typeof proxy                 // "object"，因为 typeof 不属于可代理操作
```

## handler对象方法
`handler`对象是一个容纳一批特定属性的占位符对象，它包含有`Proxy`的各个捕获器`trap`。所有的捕捉器是可选的，如果没有定义某个捕捉器，那么就会保留源对象的默认行为。

* `handler.getPrototypeOf()`: `Object.getPrototypeOf`方法的捕捉器。
* `handler.setPrototypeOf()`: `Object.setPrototypeOf`方法的捕捉器。
* `handler.isExtensible()`: `Object.isExtensible`方法的捕捉器。
* `handler.preventExtensions()`: `Object.preventExtensions`方法的捕捉器。
* `handler.getOwnPropertyDescriptor()`: `Object.getOwnPropertyDescriptor`方法的捕捉器。
* `handler.defineProperty()`: `Object.defineProperty`方法的捕捉器。
* `handler.has()`: `in`操作符的捕捉器。
* `handler.get()`: 属性读取操作的捕捉器。
* `handler.set()`: 属性设置操作的捕捉器。
* `handler.deleteProperty()`: `delete`操作符的捕捉器。
* `handler.ownKeys()`: `Reflect.ownKeys`、`Object.getOwnPropertyNames`、`Object.keys`、`Object.getOwnPropertySymbols`方法的捕捉器。
* `handler.apply()`: 函数调用操作的捕捉器。
* `handler.construct()`: `new`操作符的捕捉器。


```javascript
var target = {
    a: 1,
    f: function(...args){
        console.log(...args);
    }
};
var proxy = new Proxy(target, {
    getPrototypeOf: function(target) {
        console.log("getPrototypeOf");
        return Object.getPrototypeOf(target);
    },
    setPrototypeOf: function(target, prototype) {
        console.log("setPrototypeOf");
        return Object.setPrototypeOf(target, prototype);
    },        
    isExtensible: function(target) {
        console.log("isExtensible");
        return Object.isExtensible(target);
    },
    preventExtensions: function(target) {
        console.log("preventExtensions");
        return Object.preventExtensions(target);
    },
    getOwnPropertyDescriptor: function(target, prop) {
        console.log("getOwnPropertyDescriptor");
        return Object.getOwnPropertyDescriptor(target, prop);
    },
    defineProperty: function(target, prop, descriptor) {
        console.log("defineProperty");
        return Object.defineProperty(target, prop, descriptor);
    },
    has: function(target, prop) {
        console.log("has");
        return prop in target;
    },
    get: function(target, prop, receiver) {
        console.log("get");
        return target[prop];
    },
    set: function(target, prop, value, receiver) {
        console.log("set");
        target[prop] = value;
        return true;
    },
    deleteProperty: function(target, property) {
        console.log("deleteProperty");
        delete target[property];
        return true;
    },
    ownKeys: function(target) {
        console.log("ownKeys");
        return Reflect.ownKeys(target);
    }
})


var proxyF = new Proxy(target.f, {
    construct: function(target, argumentsList, newTarget) {
        console.log("construct");
        return new target(...argumentsList);
    },
    apply: function(target, thisArg, argumentsList) {
        console.log("apply");
        return target.apply(thisArg, argumentsList);
    },

})

const _prototype = {test: 1};
Object.setPrototypeOf(proxy, _prototype); // setPrototypeOf
console.log(Object.getPrototypeOf(proxy)); // getPrototypeOf // { test: 1 }

Object.preventExtensions(proxy); // preventExtensions
console.log(Object.isExtensible(proxy)); // isExtensible // false

Object.defineProperty(proxy, "a", {configurable: true}); // defineProperty
console.log(Object.getOwnPropertyDescriptor(proxy, "a")); // getOwnPropertyDescriptor // { value: 1, writable: true, enumerable: true, configurable: true }

proxy.a = 11; // set
console.log(proxy.a); // get // 11

console.log(Object.keys(proxy)); // ownKeys getOwnPropertyDescriptor getOwnPropertyDescriptor // [ 'a', 'f' ]
delete proxy.a; // deleteProperty
console.log("a" in proxy); // has // false

proxyF(1, 2, 3); // apply 1 2 3
new proxyF(1, 2, 3); // construct 1 2 3
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://juejin.im/post/6844903853867925517
https://www.cnblogs.com/kdcg/p/9145385.html
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy
```

