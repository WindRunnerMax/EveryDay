# defineProperty
`Object.defineProperty()`方法会直接在一个对象上定义一个新属性，或者修改一个对象的现有属性，并返回此对象，也就是说，该方法允许精确地添加或修改对象的属性。

## 语法
`Object.defineProperty(obj, prop, descriptor)`  
`obj`: 要定义属性的对象。  
`prop`: 要定义或修改的属性的名称或`Symbol`。  
`descriptor`: 要定义或修改的属性描述符。

## 属性描述符
对象里目前存在的属性描述符有两种主要形式：数据描述符和存取描述符。数据描述符是一个具有值的属性，该值可以是可写的，也可以是不可写的。存取描述符是由`getter`函数和`setter`函数所描述的属性。一个描述符只能是数据描述符和存取描述符这两者其中之一，不能同时是两者。

|属性描述符 | configurable | enumerable | value | writable | get | set |
|---|---|---|---|---|---|---|
|数据描述符 | 可以 | 可以 | 可以 | 可以 | 不可以 | 不可以 |
|存取描述符 | 可以 | 可以 | 不可以 | 不可以 | 可以 | 可以 |
如果一个描述符不具有`value`、`writable`、`get`和`set`中的任意一个键，那么它将被认为是一个数据描述符。如果一个描述符同时拥有`value`或`writable`和`get`或`set`键，则会产生一个异常。  
此外，这些选项不一定是自身属性，也要考虑继承来的属性。为了确认保留这些默认值，在设置之前，可能要冻结`Object.prototype`，明确指定所有的选项，或者通过`Object.create(null)`将 `__proto__`属性指向`null`。

### configurable
当且仅当该属性的`configurable`键值为`true`时，该属性的描述符才能够被改变，同时该属性也能从对应的对象上被删除，默认为`false`，默认值是指在使用`Object.defineProperty()`定义属性时的默认值。

```javascript
"use strict";
// 非严格模式下操作静默失败，即不报错也没有任何效果
// 严格模式下操作失败抛出异常

var obj = {};
Object.defineProperty(obj, "key", {
    configurable: true,
    value: 1
});
console.log(obj.key); // 1
Object.defineProperty(obj, "key", {
    enumerable: true // configurable为true时可以改变描述符
});
delete obj.key; // configurable为true时可以删除属性
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
    enumerable: true // configurable为false时不可以改变描述符 // Uncaught TypeError: Cannot redefine property: key
});
delete obj.key; // configurable为false时不可以删除属性 // Uncaught TypeError: Cannot delete property 'key' of #<Object>
console.log(obj.key); // undefined
```

### enumerable
当且仅当该属性的`enumerable`键值为`true`时，该属性才会出现在对象的枚举属性中，默认为 `false`。

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
该属性对应的值，可以是任何有效的`JavaScript`值，默认为`undefined`。
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
当且仅当该属性的`writable`键值为`true`时，属性的值，才能被赋值运算符改变，默认为 `false`。
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
    value: 11 // 可以通过redefine来改变值，注意configurable需要为true
});
console.log(obj.key); // 11
```

### get
属性的`getter`函数，如果没有`getter`，则为`undefined`。当访问该属性时，会调用此函数，执行时不传入任何参数，但是会传入`this`对象，由于继承关系，这里的`this`并不一定是定义该属性的对象。该函数的返回值会被用作属性的值，默认为`undefined`。
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
obj.x = 11; // 没有set方法 不能直接赋值 // Uncaught TypeError: Cannot set property x of #<Object> which has only a getter
```

### set
属性的`setter`函数，如果没有`setter`，则为`undefined`。当属性值被修改时，会调用此函数，该方法接收一个参数，且传入赋值时的`this`对象，从而进行赋值操作，默认为`undefined`。
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
        console.log("在赋值前可以进行其他操作");
        this.__x = x; 
    }
});
obj.x = 11;
```

## 相关

```
Js严格模式 https://github.com/WindrunnerMax/EveryDay/blob/master/JavaScript/Js%E4%B8%A5%E6%A0%BC%E6%A8%A1%E5%BC%8F.md
Js遍历对象 https://github.com/WindrunnerMax/EveryDay/blob/master/JavaScript/Js%E9%81%8D%E5%8E%86%E5%AF%B9%E8%B1%A1%E6%80%BB%E7%BB%93.md
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
```
