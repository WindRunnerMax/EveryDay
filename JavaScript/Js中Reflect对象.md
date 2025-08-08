# Js中Reflect对象
`Reflect`是`ES6`起`JavaScript`内置的对象，提供拦截`JavaScript`操作的方法，这些方法与`Proxy`对象的`handlers`中的方法基本相同。

## 概述
`Reflect`并非一个构造函数，所以不能通过`new`运算符对其进行调用，或者将`Reflect`对象作为一个函数来调用，就像`Math`对象一样，`Reflect`对象的所有属性和方法都是静态的。  
实际上`Reflect`对象是`ES6`为操作对象而提供的新`API`，而这个`API`设计的目的主要有：
* 将`Object`对象的一些属于语言内部的方法放到`Reflect`对象上，从`Reflect`上能拿到语言内部的方法，例如`Object.defineProperty`方法。
* 修改某些`Object`方法返回的结果，例如`Object.defineProperty(obj, name, desc)`方法在无法定义属性的时候会抛出异常，而`Reflect.defineProperty(obj, name, desc)`方法在操作失败时则会返回`false`。
* 让`Object`的操作都变成函数行为，例如`Object`的命令式`name in obj`和`delete obj[name]`与`Reflect.has(obj, name)`、`Reflect.deleteProperty(obj, name)`相等。
* 使`Reflect`对象的方法与`Proxy`对象的方法一一对应，只要`Proxy`对象上能够定义的`handlers`方法`Reflect`也能找到。

## 方法

### Reflect.apply()
`Reflect.apply(target, thisArgument, argumentsList)`  
静态方法`Reflect.apply()`通过指定的参数列表发起对目标`target`函数的调用，和`Function.prototype.apply()`功能类似。

* `target`: 目标函数。
* `thisArgument`: `target`函数调用时绑定的`this`对象。
* `argumentsList`: `target`函数调用时传入的实参列表，该参数应该是一个类数组的对象。
* `return`: 返回值是调用完带着指定参数和`this`值的给定的函数后返回的结果。

```javascript
var obj = {name: "11"};
function target(a, b){
    console.log(this.name);
    console.log(a, b);
}
Reflect.apply(target, obj, [1, 2]); // 11 // 1 2
```

### Reflect.construct()
`Reflect.construct(target, argumentsList[, newTarget])`  
`Reflect.construct()`方法的行为像`new`操作符构造函数，相当于运行`new target(...args)`。  

* `target`: 被运行的目标构造函数。
* `argumentsList`: 类数组对象，目标构造函数调用时的参数。
* `newTarget`: 可选，作为新创建对象的原型对象的`constructor`属性，默认值为`target`。

```javascript
function Target(a, b){
    console.log(a, b);
}
var instance = Reflect.construct(Target, [1, 2]); // 1 2
console.log(instance instanceof Target); // true
```

### Reflect.defineProperty()
`Reflect.defineProperty(target, propertyKey, attributes)`  
方法`Reflect.defineProperty()`基本等同于`Object.defineProperty()`方法，唯一不同是返回`Boolean`值。

* `target`: 目标对象。
* `propertyKey`: 要定义或修改的属性的名称。
* `attributes`: 要定义或修改的属性的描述。
* `return`: 返回`Boolean`值指示了属性是否被成功定义。

```javascript
var obj = {_name: 11};
var success = Reflect.defineProperty(obj, "name", {
    get:function(){
        console.log("getter");
        return obj._name;
    }
})
console.log(success); // true
console.log(obj.name); // getter // 11
```

### Reflect.deleteProperty()
`Reflect.deleteProperty(target, propertyKey)`  
方法`Reflect.deleteProperty()`允许用于删除属性，类似于`delete operator`，但它是一个函数。

* `target`: 删除属性的目标对象。
* `propertyKey`: 需要删除的属性的名称。
* `return`: 返回`Boolean`值表明该属性是否被成功删除。

```javascript
var obj = {name: 11};
var success = Reflect.deleteProperty(obj, "name");
console.log(success); // true
console.log(obj.name); // undefined
```

### Reflect.get()
`Reflect.get(target, propertyKey[, receiver])`  
`Reflect.get()`方法与从对象`target[propertyKey]`中读取属性类似，但它是通过一个函数执行来操作的。

* `target`: 需要取值的目标对象
* `propertyKey`: 需要获取的值的键值
* `receiver`: 如果`target`对象中指定了`getter`，`receiver`则为`getter`调用时的`this`值。
* `return`: 返回属性的值。

```javascript
var obj = {name: 11};
var name = Reflect.get(obj, "name");
console.log(name); // 11
```

### Reflect.getOwnPropertyDescriptor()
`Reflect.getOwnPropertyDescriptor(target, propertyKey)`  
方法`Reflect.getOwnPropertyDescriptor()`与`Object.getOwnPropertyDescriptor()`方法相似，如果在对象中存在，则返回给定的属性的属性描述符，否则返回`undefined`。 

* `target`: 需要寻找属性的目标对象。
* `propertyKey`: 获取自己的属性描述符的属性的名称。

```javascript
var obj = {name: 11};
var des = Reflect.getOwnPropertyDescriptor(obj, "name");
console.log(des); // {value: 11, writable: true, enumerable: true, configurable: true}
```

### Reflect.getPrototypeOf()
`Reflect.getPrototypeOf(target)`  
方法`Reflect.getPrototypeOf()`与`Object.getPrototypeOf()`方法几乎相同，都是返回指定对象的原型，即内部的`[[Prototype]]`属性的值。

* `target`: 获取原型的目标对象。
* `return`: 给定对象的原型，如果给定对象没有继承的属性，则返回`null`。

```javascript
var obj = {name: 11};
var proto = Reflect.getPrototypeOf(obj);
console.log(proto === Object.prototype); // true
```

### Reflect.has()
`Reflect.has(target, propertyKey)`  
方法`Reflect.has()`作用与`in`操作符类似，但它是通过一个函数执行来操作的。

* `target`: 目标对象.
* `propertyKey`: 属性名，需要检查目标对象是否存在此属性。
* `return`: 返回一个`Boolean`类型的对象指示是否存在此属性。

```javascript
var obj = {name: 11};
var exist = Reflect.has(obj, "name");
console.log(exist); // true
```

### Reflect.isExtensible()
`Reflect.isExtensible(target)`  
方法`Reflect.isExtensible()`判断一个对象是否可扩展，即是否能够添加新的属性，与`Object.isExtensible()`方法相似。

* `target`: 检查是否可扩展的目标对象。
* `return`: 返回一个`Boolean`值表明该对象是否可扩展。

```javascript
var obj = {name: 11};
var extensible = Reflect.isExtensible(obj);
console.log(extensible); // true
```

### Reflect.ownKeys()
`Reflect.ownKeys(target)`  
方法`Reflect.ownKeys()`返回一个由目标对象自身的属性键组成的数组。

* `target`: 获取自身属性键的目标对象。
* `return`: 返回由目标对象的自身属性键组成的`Array`。 

```javascript
var obj = {name: 11};
var keys = Reflect.ownKeys(obj);
console.log(keys); // ["name"]
```

### Reflect.preventExtensions()
`Reflect.preventExtensions(target)`  
方法`Reflect.preventExtensions()`方法阻止新属性添加到对象，防止将来对对象的扩展被添加到对象中，该方法与`Object.preventExtensions()`相似。

* `target`: 阻止扩展的目标对象。
* `return`: 返回一个`Boolean`值表明目标对象是否成功被设置为不可扩展。

```javascript
var obj = {name: 11};
Reflect.preventExtensions(obj);
console.log(Reflect.isExtensible(obj)); // false
```

### Reflect.set()
`Reflect.set(target, propertyKey, value[, receiver])`  
方法`Reflect.set()`是在一个对象上设置一个属性。

* `target`: 设置属性的目标对象。
* `propertyKey`: 设置的属性的名称。
* `value`: 设置的值。
* `receiver`: 如果遇到`setter`，`receiver`则为`setter`调用时的`this`值。
* `return`: 返回一个`Boolean`值表明是否成功设置属性。

```javascript
var obj = {name: 1};
Reflect.set(obj, "name", 11);
console.log(Reflect.get(obj, "name")); // 11
```

### Reflect.setPrototypeOf()
`Reflect.setPrototypeOf(target, prototype)`  
除了返回类型以外，方法`Reflect.setPrototypeOf()`与`Object.setPrototypeOf()`方法是一样的，它可设置对象的原型即内部的`[[Prototype]]`属性，为另一个对象或`null`，如果操作成功返回`true`，否则返回`false`。

* `target`: 设置原型的目标对象。
* `prototype`: 对象的新原型，为一个对象或`null`。
* `return`: 返回一个`Boolean`值表明是否原型已经成功设置。

```javascript
var obj = {};
var proto = {name: 11};
Reflect.setPrototypeOf(obj, proto);
console.log(proto === Reflect.getPrototypeOf(obj)); // true
```

## 对比

| `Method Name` | `Object` | `Reflect` |
| --- | --- | --- |
`defineProperty()` | `Object.defineProperty()`返回传递给函数的对象，如果未在对象上成功定义属性，则返回`TypeError`。 | 如果在对象上定义了属性，则`Reflect.defineProperty()`返回`true`，否则返回`false`。 |
| `defineProperties()` | `Object.defineProperties()` 返回传递给函数的对象。如果未在对象上成功定义属性，则返回`TypeError`。 | `N/A` |
| `set()` | `N/A` | 如果在对象上成功设置了属性，则`Reflect.set()`返回`true`，否则返回`false`。如果目标不是`Object`，则抛出`TypeError` |
| `get()` | `N/A` | `Reflect.get()`返回属性的值。如果目标不是`Object`，则抛出`TypeError`。 |
| `deleteProperty()` | `N/A` | 如果属性从对象中删除，则`Reflect.deleteProperty()`返回`true`，否则返回`false`。 |
| `getOwnPropertyDescriptor()` | 如果传入的对象参数上存在`Object.getOwnPropertyDescriptor()` ，则会返回给定属性的属性描述符，如果不存在，则返回`undefined`。 | 如果给定属性存在于对象上，则`Reflect.getOwnPropertyDescriptor()`返回给定属性的属性描述符。如果不存在则返回`undefined`，如果传入除对象(原始值)以外的任何东西作为第一个参数，则返回`TypeError` |
| `getOwnPropertyDescriptors()` | `Object.getOwnPropertyDescriptors()`返回一个对象，其中包含每个传入对象的属性描述符。如果传入的对象没有拥有的属性描述符，则返回一个空对象。 | `N/A` |
| `getPrototypeOf()` | `Object.getPrototypeOf()`返回给定对象的原型。如果没有继承的原型，则返回`null`。在`ES5`中为非对象抛出`TypeError`。 | `Reflect.getPrototypeOf()`返回给定对象的原型。如果没有继承的原型，则返回`null`，并为非对象抛出`TypeError`。 |
| `setPrototypeOf()` | 如果对象的原型设置成功，则`Object.setPrototypeOf()`返回对象本身。如果设置的原型不是`Object`或`null`，或者被修改的对象的原型不可扩展，则抛出`TypeError`。 | 如果在对象上成功设置了原型，则`Reflect.setPrototypeOf()`返回`true`，否则返回`false`(包括原型是否不可扩展)。如果传入的目标不是`Object`，或者设置的原型不是`Object`或`null`，则抛出`TypeError`。 |
| `isExtensible()` | 如果对象是可扩展的，则`Object.isExtensible()`返回`true`，否则返回`false`，如果第一个参数不是对象，则在`ES5`中抛出`TypeError`，在`ES2015`中，它将被强制为不可扩展的普通对象并返回`false`。 | 如果对象是可扩展的，则`Reflect.isExtensible()`返回`true`，否则返回`false`。如果第一个参数不是对象，则抛出`TypeError`。 |
| `preventExtensions()` | `Object.preventExtensions()`返回被设为不可扩展的对象，如果参数不是对象，则在`ES5`中抛出`TypeError`，在`ES2015`中，参数如为不可扩展的普通对象，然后返回对象本身。 | 如果对象已变得不可扩展，则`Reflect.preventExtensions()` 返回`true`，否则返回`false`。如果参数不是对象，则抛出`TypeError`。 |
| `keys()` | `Object.keys()`返回一个字符串数组，该字符串映射到目标对象自己的(可枚举)属性键。如果目标不是对象，则在`ES5`中抛出`TypeError`，但将非对象目标强制为`ES2015`中的对象 | `N/A` |
| `ownKeys()` | `N/A` | `Reflect.ownKeys()`返回一个属性名称数组，该属性名称映射到目标对象自己的属性键，如果目标不是`Object`，则抛出`TypeError`。 |



## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect
```

