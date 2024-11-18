
# defineProperty
The `Object.defineProperty()` method directly defines a new property on an object or modifies an existing property of an object, and returns the object. In other words, this method allows precise addition or modification of object properties.

## Syntax
`Object.defineProperty(obj, prop, descriptor)`  
`obj`: The object on which to define the property.  
`prop`: The name of the property to be defined or modified, or a `Symbol`.  
`descriptor`: The property descriptor to be defined or modified.

## Property Descriptor
There are two main forms of property descriptors in an object: data descriptors and accessor descriptors. A data descriptor is a property with a value, which can be writable or non-writable. An accessor descriptor is a property described by `getter` and `setter` functions. A descriptor can only be one of either a data descriptor or an accessor descriptor, it cannot be both at the same time.

|Property Descriptor | configurable | enumerable | value | writable | get | set |
|---|---|---|---|---|---|---|
|Data Descriptor | Yes | Yes | Yes | Yes | No | No |
|Accessor Descriptor | Yes | Yes | No | No | Yes | Yes |

If a descriptor does not have any of the keys `value`, `writable`, `get`, or `set`, then it will be considered as a data descriptor. If a descriptor has both `value` or `writable` and `get` or `set` keys, an exception will be thrown.  
In addition, these options may not necessarily be own properties, inherited properties should also be considered. To confirm the retention of these default values, it may be necessary to freeze `Object.prototype` before setting, explicitly specify all options, or use `Object.create(null)` to set the `__proto__` property to `null`.

### configurable
The property descriptor for a property can only be changed if the `configurable` key value is `true`, and the property can be deleted from the corresponding object as well, defaulting to `false` when defining a property using `Object.defineProperty()`.

```javascript
"use strict";
// In non-strict mode, silent failure occurs, no error is thrown, and there is no effect
// In strict mode, a failure will result in an exception being thrown

var obj = {};
Object.defineProperty(obj, "key", {
    configurable: true,
    value: 1
});
console.log(obj.key); // 1
Object.defineProperty(obj, "key", {
    enumerable: true // Descriptors can be changed when configurable is true
});
delete obj.key; // Property can be deleted when configurable is true
console.log(obj.key); // undefined
```

```javascript
"use strict";
var obj = {};
Object.defineProperty(obj, "key", {
    configurable: false,
    value: 1
});
console.log(obj.key); // 1
Object.defineProperty(obj, "key", {
    enumerable: true // Descriptors cannot be changed when configurable is false // Uncaught TypeError: Cannot redefine property: key
});
delete obj.key; // Property cannot be deleted when configurable is false // Uncaught TypeError: Cannot delete property 'key' of #<Object>
console.log(obj.key); // undefined
```

### enumerable
A property will only appear in the object's enumerable properties if the `enumerable` key value is `true`, defaulting to `false`.

```javascript
"use strict";
var obj = { a: 1 };
Object.defineProperty(obj, "key", {
    enumerable: true,
    value: 1
});
for(let item in obj) console.log(item, obj[item]); 
/* 
  a 1
  key 1
*/
```

```javascript
"use strict";
var obj = { a: 1 };
Object.defineProperty(obj, "key", {
    enumerable: false,
    value: 1
});
for(let item in obj) console.log(item, obj[item]); 
/* 
  a 1
*/
```

### value
The value corresponding to this property can be any valid `JavaScript` value, and its default is `undefined`.
```javascript
"use strict";
var obj = {};
Object.defineProperty(obj, "key", {
    value: 1
});
console.log(obj.key); // 1
```

```javascript
"use strict";
var obj = {};
Object.defineProperty(obj, "key", {});
console.log(obj.key); // undefined
```

### writable
The value of this property can only be changed by the assignment operator if the `writable` key is set to `true`, and its default is `false`.
```javascript
"use strict";
var obj = {};
Object.defineProperty(obj, "key", {
    value: 1,
    writable: true
});
console.log(obj.key); // 1
obj.key = 11;
console.log(obj.key); // 11
```

```javascript
"use strict";
var obj = {};
Object.defineProperty(obj, "key", {
    value: 1,
    writable: false,
    configurable: true
});
console.log(obj.key); // 1
obj.key = 11; // Uncaught TypeError: Cannot assign to read only property 'key' of object '#<Object>'
Object.defineProperty(obj, "key", {
    value: 11 // It's possible to change the value through redefinition, but remember that configurable needs to be true
});
console.log(obj.key); // 11
```

### get
The property's `getter` function, if not defined, is `undefined`. When accessing this property, this function is called, and it does not take any parameters at execution, but the `this` object is passed in. Due to inheritance, `this` may not necessarily refer to the object defining this property. The return value of this function is used as the property's value, and its default is `undefined`.
```javascript
"use strict";
var obj = { __x: 1 };
Object.defineProperty(obj, "x", {
    get: function(){ return this.__x; }
});
console.log(obj.x); // 1
```

```javascript
"use strict";
var obj = { __x: 1 };
Object.defineProperty(obj, "x", {
    get: function(){ return this.__x; }
});
console.log(obj.x); // 1
obj.x = 11; // Cannot directly assign a value without a set method // Uncaught TypeError: Cannot set property x of #<Object> which has only a getter
```

### set
The property's `setter` function, if not defined, is `undefined`. This function is called when the property value is modified. It receives a parameter and the `this` object at the time of assignment, enabling the assignment operation, and its default is `undefined`.
```javascript
"use strict";
var obj = { __x: 1 };
Object.defineProperty(obj, "x", {
    set: function(x){ this.__x = x; },
    get: function(){ return this.__x; }
});
obj.x = 11;
console.log(obj.x); // 11
```

```javascript
"use strict";
var obj = { __x: 1 };
Object.defineProperty(obj, "x", {
    set: function(x){ 
        console.log("Operations can be performed before assignment");
        this.__x = x; 
    }
});
obj.x = 11;
```

## Related

Strict mode in JavaScript: [link](https://github.com/WindrunnerMax/EveryDay/blob/master/JavaScript/Js%E4%B8%A5%E6%A0%BC%E6%A8%A1%E5%BC%8F.md)
Object traversal in JavaScript: [link](https://github.com/WindrunnerMax/EveryDay/blob/master/JavaScript/Js%E9%81%8D%E5%8E%86%E5%AF%B9%E8%B1%A1%E6%80%BB%E7%BB%93.md)

## Daily Topic

https://github.com/WindrunnerMax/EveryDay

## Reference
```
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
```