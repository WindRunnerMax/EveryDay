# Js中Symbol对象
`ES6`引入了一种新的基本数据类型`Symbol`，表示独一无二的值，最大的用法是用来定义对象的唯一属性名，`Symbol()`函数会返回`symbol`类型的值，该类型具有静态属性和静态方法，其静态属性会暴露几个内建的成员对象，它的静态方法会暴露全局的`symbol`注册，且类似于内建对象类，但作为构造函数来说它并不完整，因为它不支持语法`new Symbol()`。每个从`Symbol()`返回的`symbol`值都是唯一的，一个`symbol`值能作为对象属性的标识符。

## 描述
对于每一个`Symbol`的值都是不相等的，所以`Symbol`作为对象的属性名，可以保证属性不重名。该数据类型通常被用作一个对象属性的键值，例如当想使对象属性的键为私有值时。`symbol`类型的键存在于各种内置的`JavaScript`对象中，同样自定义类也可以这样创建私有成员。`symbol`数据类型具有非常明确的目的，并且因为其功能性单一的优点而突出，一个`symbol`实例可以被赋值到一个左值变量，还可以通过标识符检查类型，这就是其全部特性。一个具有数据类型`symbol`的值可以被称为符号类型值，在`JavaScript`运行时环境中，一个符号类型值可以通过调用函数`Symbol()`创建，这个函数动态地生成了一个匿名，唯一的值。`Symbol`类型唯一合理的用法是用变量存储`symbol`的值，然后使用存储的值创建对象属性。

```javascript
let s = Symbol();
let s1 = Symbol("s");
let s2 = Symbol("s");
console.log(s === s1); //false
console.log(s1 === s2); //false

let obj = {};
let prop = Symbol();
obj[prop] = 1;
console.log(obj[prop]); // 1
console.log(Object.keys(obj)); // []
console.log(Object.getOwnPropertySymbols(obj)); // [Symbol()]
console.log(Reflect.ownKeys(obj)); // [Symbol()]
```

## 属性
* `Symbol.length`: 长度属性，值为`0`。
* `Symbol.prototype`: `symbol`构造函数的原型。
* `Symbol.iterator`: 返回一个对象默认迭代器的方法，被`for...of`使用。
* `Symbol.match`: 用于对字符串进行匹配的方法，也用于确定一个对象是否可以作为正则表达式使用，被`String.prototype.match()`使用。
* `Symbol.replace`: 替换匹配字符串的子串的方法，被`String.prototype.replace()`使用。
* `Symbol.search`: 返回一个字符串中与正则表达式相匹配的索引的方法，被`String.prototype.search()`使用。
* `Symbol.split`: 在匹配正则表达式的索引处拆分一个字符串的方法，被`String.prototype.split()`使用。
* `Symbol.hasInstance`: 确定一个构造器对象识别的对象是否为它的实例的方法，被`instanceof`使用。
* `Symbol.isConcatSpreadable`: 布尔值，表明一个对象是否应该`flattened`为它的数组元素，被`Array.prototype.concat()`使用。
* `Symbol.unscopables`: 拥有和继承属性名的一个对象的值被排除在与环境绑定的相关对象外。
* `Symbol.species`: 一个用于创建派生对象的构造器函数。
* `Symbol.toPrimitive`: 一个将对象转化为基本数据类型的方法。
* `Symbol.toStringTag`: 用于对象的默认描述的字符串值，被`Object.prototype.toString()`使用。

## 方法

### Symbol.for()
`Symbol.for(key)`  
`Symbol.for(key)`方法会根据给定的键`key`，来从运行时的`symbol`注册表中找到对应的`symbol`，如果找到了就返回它，否则就新建一个与该键关联的`symbol`，并放入全局`symbol`注册表中。和`Symbol()`不同的是，用`Symbol.for()`方法创建的的`symbol`会被放入一个全局`symbol`注册表中。当然`Symbol.for()`并不是每次都会创建一个新的`symbol`，它会首先检查给定的`key`是否已经在注册表中了。假如是则会直接返回上次存储的那个，否则它会再新建一个。
* `key`: 一个字符串，作为`symbol`注册表中与某`symbol`关联的键，同时也会作为该`symbol`的描述。

```javascript
var s1 = Symbol.for();
var s2 = Symbol.for("s");
var s3 = Symbol.for();
var s4 = Symbol.for("s");
console.log(s1 === s3); // true
console.log(s2 === s4); // true
```

### Symbol.keyFor()
`Symbol.keyFor(sym)`  
`Symbol.keyFor(sym)`方法用来获取全局`symbol`注册表中与某个`symbol`关联的键，如果全局注册表中查找到该`symbol`，则返回该`symbol`的`key`值，返回值为字符串类型，否则返回`undefined`。
* `sym`: 必选参数，需要查找键值的某个`Symbol`。 

```javascript
var s1 = Symbol();
var s2 = Symbol.for("s");
var key1 = Symbol.keyFor(s1);
var key2 = Symbol.keyFor(s2);
console.log(key1); // undefined
console.log(key2); // s
```

### Symbol.prototype.toString()
`symbol.toString()`  
`toString()`方法返回当前`symbol`对象的字符串表示，`Symbol`对象拥有自己的`toString`方法，因而遮蔽了原型链上的`Object.prototype.toString()`，`symbol`原始值不能转换为字符串，所以只能先转换成它的包装对象，再调用`toString()`方法。

```javascript
var s = Symbol.for("s");
console.log(s.toString()); // Symbol(s)
console.log(Object(Symbol("s")).toString()); // Symbol(s)
```

### Symbol.prototype.valueOf()
`symbol.valueOf()`  
`valueOf()`方法返回当前`symbol`对象所包含的`symbol`原始值。在`JavaScript`中，虽然大多数类型的对象在某些操作下都会自动的隐式调用自身的`valueOf()`方法或者`toString()`方法来将自己转换成一个原始值，但`symbol`对象不会这么干，`symbol`对象无法隐式转换成对应的原始值。

```javascript
var s = Symbol.for("s");
console.log(s.valueOf()); // Symbol(s)
```

### Symbol.prototype\[@@toPrimitive\]
`Symbol()[Symbol.toPrimitive](hint)`  
`[@@toPrimitive]()`方法可将`Symbol`对象转换为原始值，`hint`参数未被使用。


```javascript
var s = Symbol.for("s");
console.log(s[Symbol.toPrimitive]()); // Symbol(s)
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.runoob.com/w3cnote/es6-symbol.html
https://developer.mozilla.org/zh-CN/docs/Glossary/Symbol
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol
```
