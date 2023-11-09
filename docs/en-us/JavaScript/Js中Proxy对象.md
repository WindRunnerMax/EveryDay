# Proxy Object in JavaScript

The `Proxy` object is used to define custom behaviors for fundamental operations, such as property lookup, assignment, enumeration, function invocation, etc.

## Syntax

```javascript
const proxy = new Proxy(target, handler);
```

* `target`: The target object to be wrapped with the `Proxy`, can be any type of object, including native arrays, functions, or even another proxy.
* `handler`: An object typically with functions as properties, where each function defines the behavior of the proxy `proxy` when executing various operations.

## Description
`Proxy` is used to modify the default behavior of certain operations. It can also be understood as placing a layer of interception in front of the target object, through which all external access must pass before it reaches the target object. Therefore, it provides a mechanism to filter and modify external access. The principle behind this term is "proxy," which refers to its ability to proxy certain operations, hence the term "proxyer" when translated.

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

`Object.defineProperty` is used to listen to properties, while `Proxy` listens to the entire object. By calling `new Proxy()`, you can create a proxy to replace another object known as the target. This proxy virtually represents the target object, so the proxy and the target object can be treated as the same object on the surface. The proxy allows the interception of low-level operations on the target object, capabilities that were previously internal to the JS engine. The interception behavior uses a function that can respond to specific operations. By using `Proxy` to proxy an object, we get an object that is almost identical to the object being proxied, and we can completely monitor this object at a low level.

```javascript
// Common interview question: Implement a===1&&a===2&&a===3 to be true

// Object.defineProperty defines a property
// It can achieve the requirements of the question
var  _a = 0;
Object.defineProperty(window, "a", {
    get:function(){
        return ++_a;
    }
})
console.log(a===1 && a===2 && a===3); // true

// Proxy proxies an object
// Therefore, the implementation does not exactly match the question requirements when called
// But it is still a valid implementation
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

## Methods

### Proxy.revocable()
`Proxy.revocable(target, handler)`  
The `Proxy.revocable()` method is used to create a revocable proxy object, which returns a revocable `Proxy` object containing the proxy object itself and its revoke method.

* `target`: The target object to be wrapped with the `Proxy`, can be any type of object, including native arrays, functions, or even another proxy object.
* `handler`: An object with properties that are a set of optional functions, defining the behavior of the proxy when the corresponding operation is executed.

The return value of this method is an object with the structure `{"proxy": proxy, "revoke": revoke}`. Once a proxy object is revoked, it becomes almost completely uncallable. Any callable operations on it will throw a `TypeError` exception. It's important to note that there are a total of 14 operations that are callable, while operations outside of these 14 will not throw an exception. Once revoked, the proxy object cannot be directly restored to its original state. Both the target object associated with it and the handler object may be subject to garbage collection. Repeating the revoke method `revoke()` will have no effect, nor will it throw an error.

```javascript
var revocable = Proxy.revocable({}, {
  get: function(target, key) {
    return `[[ ${key} ]]`;
  }
});
var proxy = revocable.proxy;
console.log(proxy.example); // [[ example ]]
revocable.revoke();
// console.log(proxy.example);  // Throws TypeError
// proxy.example = 1;           // Throws TypeError
// delete proxy.example;        // Throws TypeError
// typeof proxy                 // "object" because typeof is not a callable operation
```

## Handler Object Methods
The `handler` is an object that holds a set of specific properties and contains the traps of the `Proxy`. All traps are optional, and if a trap is not defined, the default behavior of the source object will be maintained.

* `handler.getPrototypeOf()`: A trap for the `Object.getPrototypeOf` method.
* `handler.setPrototypeOf()`: A trap for the `Object.setPrototypeOf` method.
* `handler.isExtensible()`: A trap for the `Object.isExtensible` method.
* `handler.preventExtensions()`: A trap for the `Object.preventExtensions` method.
* `handler.getOwnPropertyDescriptor()`: A trap for the `Object.getOwnPropertyDescriptor` method.
* `handler.defineProperty()`: A trap for the `Object.defineProperty` method.
* `handler.has()`: A trap for the `in` operator.
* `handler.get()`: A trap for property read operations.
* `handler.set()`: A trap for property set operations.
* `handler.deleteProperty()`: A trap for the `delete` operator.
* `handler.ownKeys()`: A trap for the `Reflect.ownKeys`, `Object.getOwnPropertyNames`, `Object.keys`, and `Object.getOwnPropertySymbols` methods.
* `handler.apply()`: A trap for function call operations.
* `handler.construct()`: A trap for the `new` operator.

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
```

```javascript
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

## Daily Quiz

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://juejin.im/post/6844903853867925517
https://www.cnblogs.com/kdcg/p/9145385.html
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy
```