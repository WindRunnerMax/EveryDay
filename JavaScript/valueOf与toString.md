# valueOf与toString
`valueOf`和`toString`是`Object.prototype`上的方法，在`Js`几乎所有的对象都会继承自`Object`，同样由于包装对象的原因，几乎所有的数据类型都能够调用这两个方法，无法调用的有例如`null`、`undefined`以及`Object.create(null)`创建的对象等，通常我们一般不会主动调用这两个方法，而在代码执行的过程中这两个方法会经常被偷偷的调用，而且在不同的情况下会有选择的进行调用。

## valueOf
`JavaScript`通过调用`valueOf`方法将对象转换为原始值，我们很少需要自己调用`valueOf`方法，当遇到要预期的原始值的对象时，`JavaScript`会自动调用它。默认情况下，`valueOf`方法由`Object`后面的每个对象继承。每个内置的核心对象都会覆盖此方法以返回适当的值，如果对象没有原始值，则`valueOf`将返回对象本身。  
`JavaScript`的许多内置对象都重写了该函数，以实现更适合自身的功能需要。因此不同类型对象的`valueOf`方法的返回值和返回值类型均可能不同。

| 对象 | 返回值
| --- | --- | 
| `Array` | 返回数组对象本身。 | 
| `Boolean` | 布尔值。 | 
| `Date` | 存储的时间是从`1970`年`1`月`1`日午夜开始计的毫秒数`UTC`。 | 
| `Function` | 函数本身。 | 
| `Number` | 数字值。 | 
| `Object` | 默认情况下返回对象本身。 | 
| `String` | 字符串值。 | 

```javascript
var arr = [];
console.log(arr.valueOf() === arr); // true

var date = new Date();
console.log(date.valueOf()); // 1376838719230

var num =  1;
console.log(num.valueOf()); // 1

var bool = true;
console.log(bool.valueOf() === bool); // true

var newBool = new Boolean(true);
console.log(newBool.valueOf() === newBool); // false // 前者是bool 后者是object

function funct(){}
console.log(funct.valueOf() === funct); // true

var obj = {};
console.log(obj.valueOf() === obj); // true

var str = "";
console.log(str.valueOf() === str); // true

var newStr = new String("");
console.log(newStr.valueOf() === newStr); // false // 前者是bool 后者是object
```

前文提到过在`JavaScript`运行的过程中`valueOf`方法经常会被偷偷的调用，我们可以自行重写`valueOf`方法，在`def.js`中甚至相当灵活使用`valueOf`等方式实现了`Ruby`风格的类定义工厂，以`Child << Parent`的风格实现了继承。

```javascript
class ValueOfTest{
    constructor(val){
        this.val = val;
    }
    valueOf(){
        return this.val;
    }
}

var v = new ValueOfTest(10);
console.log(v + 1); // 11
```

## toString
`JavaScript`通过调用`toString`方法返回一个表示该对象的字符串，每个对象都有一个`toString`方法，当该对象被表示为一个文本值时，或者一个对象以预期的字符串方式引用时自动调用。默认情况下，`toString()`方法被每个`Object`对象继承，如果此方法在自定义对象中未被覆盖，`toString`返回`[object type]`，其中`type`是对象的类型。  
`JavaScript`的许多内置对象都重写了该函数，以实现更适合自身的功能需要。因此不同类型对象的`toString`方法的返回值和返回值类型均可能不同。

| 对象 | 返回值
| --- | --- | 
| `Array` | 以逗号分割的字符串，如`[1,2]`的`toString`返回值为`1,2`。 | 
| `Boolean` | 布尔值的字符串形式。 | 
| `Date` | 可读的时间字符串，例如`Tue Oct 27 2020 16:08:48 GMT+0800` (中国标准时间) | 
| `Function` | 声明函数的`Js`源代码字符串。 | 
| `Number` | 数字值的字符串形式。 | 
| `Object` | `[object Object]`字符串。 | 
| `String` | 字符串。 | 

```javascript
var arr = [1, 2, 3];
console.log(arr.toString()); // 1,2,3

var date = new Date();
console.log(date.toString()); // Tue Oct 27 2020 16:12:35 GMT+0800 (中国标准时间)

var num =  1;
console.log(num.toString()); // 1

var bool = true;
console.log(bool.toString()); // true

function funct(){ var a = 1; }
console.log(funct.toString()); // function funct(){ var a = 1; }

var obj = {a: 1};
console.log(obj.toString()); // [object Object]

var str = "1";
console.log(str.toString()); // 1
```

## 对比
`JavaScript`在不同情况下，会调用不同的方法去处理值，通常来说是会优先调用`toString()`方法，而有运算操作符的情况下`valueOf()`的优先级高于`toString()`，当调用`valueOf()`方法无法运算后还是会再调用`toString()`方法。

```javascript
var v = {
    val: 10,
    valueOf: function(){
        console.log("valueOf");
        return this.val;
    },
    toString: function(){
        console.log("toString");
        return this.val;
    }
}

var obj = {"10": 1};

console.log(v); // {val: 10, valueOf: ƒ, toString: ƒ}
console.log(1+v); // valueOf // 11
console.log(obj[v]); // toString // 1
console.log("" + v); // valueOf // 10
console.log(String(v)); // toString // 10
console.log(Number(v)); // valueOf // 10
console.log(v == 10); // valueOf // true // 只有在==的情况下才有可能调用valueOf 在===的情况下object与number不可能相等
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://github.com/tobytailor/def.js
https://juejin.im/post/6844903812117839879
https://juejin.im/post/6844903967097356302
https://cloud.tencent.com/developer/article/1495536
https://www.cnblogs.com/rubylouvre/archive/2010/10/01/1839748.html
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/valueOf
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/toString
```

