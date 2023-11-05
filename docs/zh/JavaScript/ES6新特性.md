# ES6新特性

ES6的常用新特性简介，全部特性可参阅 [Ecma-International](https://www.ecma-international.org/ecma-262/6.0/)
[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/New_in_JavaScript/ECMAScript_6_support_in_Mozilla)
[ES6入门](https://es6.ruanyifeng.com/)
[ES6 教程](https://www.runoob.com/w3cnote/es6-tutorial.html)

`ES6`全称`ECMAScript 6.0`，是`JavaScript`的下一个版本标准，`2015.06`发版。`ECMAScript`和 `JavaScript`的关系是，前者是后者的规格，后者是前者的一种实现。

## let 与 const
`ES2015(ES6)`新增加了两个重要的`JavaScript`关键字: `let`和`const`。  
`ES6`明确规定，代码块内如果存在`let`或者 `const`，代码块会对这些命令声明的变量从**块的开始**就形成一个**封闭作用域**。代码块内，在声明变量之前使用它会报错，称为**暂时性死区**。  
`ES6`的块级作用域必须有大括号，如果没有大括号，`JavaScript`引擎就认为不存在块级作用域。
* `for`循环计数器很适合用`let`。
* `let`和`const`只能声明一次，`var`可以声明多次。
* `var`会变量提升，`let`与`const`也存在变量提升但有所不同。
* `const`声明一个只读的常量，一旦声明，常量的值就不能改变。
* `const`和`let`在全局作用域中声明的变量不会挂载到`window`上。
* `let`和`const`声明的变量只在其声明所在的代码块内有效，形成块级作用域。
* `const`其实保证的不是变量的值不变，而是保证变量指向的内存地址所保存的数据不允许改动。对于基本数据类型`number`、`string` 、`boolean`等，值就保存在变量指向的那个内存地址，因此`const` 声明的简单类型变量等同于常量。而引用类型`object`，`array`，`function`等，变量指向的内存地址其实是保存了一个指向实际数据的指针，所以`const`只能保证指针是固定的，至于指针指向的数据结构变不变就无法控制了。

## 解构赋值
`ES6`允许按照一定模式，从数组和对象中提取值，对变量进行赋值，这被称为解构赋值。

```javascript
let [a, b, c] = [1, 2, 3]; // 基本
let [a, [[b], c]] = [1, [[2], 3]]; //嵌套
let [a, , b] = [1, 2, 3]; // 可忽略
let [a = 1, b] = []; // a = 1, b = undefined // 不完全解构
let [a, ...b] = [1, 2, 3]; // 剩余运算符
let [a, b, c, d, e] = 'hello'; // 字符串等
let { a, b } = { a: 'aaa', b: 'bbb' }; // 对象模型的解构 前后两个kay需对应
```

## Symbol
`ES6`引入了一种新的原始数据类型`Symbol`，表示独一无二的值，最大的用法是用来定义对象的唯一属性名。
`ES6`数据类型除了`Number`、`String`、`Boolean`、 `Object`、`null`和`undefined`，还新增了 `Symbol`。

```javascript
let s1 = Symbol("s");
let s2 = Symbol("s");
console.log(s1 === s2); //false
```


## Spread / Rest 操作符
`Spread`用于将数组作为参数直接传入函数。

```javascript
var s = ['1', '2', '3'];
function f(s1,s2,s3){
    console.log(`Hello ${s1},${s2},${s3}`); //ES6新增字符串中加入变量和表达式
}
f(...s); //Hello 1,2,3
```
`Rest`用于函数传参传递数组。

```javascript
function f(...args){
    console.log(args);
}
f(1,2,3,4,5); //[1, 2, 3, 4, 5]
```


## 箭头函数
`ES6`中，箭头函数就是函数的一种简写形式，使用括号包裹参数，跟随一个 `=>`，紧接着是函数体，特别需要注意的是箭头函数是继承当前上下文的`this`关键字。

```javascript
var add = (a, b) => a + b;
var show = a => console.log(a);
var test = (a,b,c) => {console.log(a,b,c);return a+b+c;}
add(1,1); //2
show(1); //1
test(1,1,1); //1 1 1
```

## 参数默认值

```javascript
function f(a = 1){
    console.log(a);
}
f(); //1
f(11); //11
```
## 字符串拓展
`ES6`之前判断字符串是否包含子串，用`indexOf`方法，`ES6`新增了子串的识别方法。
* `includes()` 返回布尔值，判断是否找到参数字符串。
* `startsWith()` 返回布尔值，判断参数字符串是否在原字符串的头部。
* `endsWith()` 返回布尔值，判断参数字符串是否在原字符串的尾部。
* `repeat()` 返回新的字符串，表示将字符串重复指定次数返回。
* `padStart()` 返回新的字符串，表示用参数字符串从头部补全原字符串。
* `padEnd()` 返回新的字符串，表示用参数字符串从尾部（右侧）补全原字符串。

## 数值拓展
* 二进制表示法新写法 前缀`0b`或`0B`，例如`console.log(0B11 === 3); //true`。
* 八进制表示法新写法 前缀`0o`或`0O`，例如`console.log(0O11 === 9); //true`。
* 常量`Number.EPSILON`，表示`1`与大于`1`的最小浮点数之间的差,值接近于 `2.2204460492503130808472633361816E-16`。
* `Number.MAX_SAFE_INTEGER` 表示在`JavaScript`中能够精确表示的最大安全整数。
* `Number.isFinite()` 用于检查一个数值是否为有限的`finite`，即不是`Infinity`。
* `Number.parseInt()` 逐步减少全局方法，用于全局变量的模块化,方法的行为没有发生改变。

## 数组拓展
* `Array.of()` 将参数中所有值作为元素形成数组。
* `Array.from()` 将类数组对象或可迭代对象转化为数组。
* `find()` 查找数组中符合条件的元素,若有多个符合条件的元素，则返回第一个元素。
* `findIndex()` 查找数组中符合条件的元素索引，若有多个符合条件的元素，则返回第一个元素索引。
* `fill()` 将一定范围索引的数组元素内容填充为单个指定的值。
* `copyWithin()` 将一定范围索引的数组元素修改为此数组另一指定范围索引的元素。
* `entries()` 遍历键值对。
* `keys()` 遍历键名。
* `values()` 遍历键值。
* `includes()` 数组是否包含指定值。
* `flat()` 嵌套数组转一维数组。
* `flatMap()` 先对数组中每个元素进行了处理，再对数组执行`flat()`方法。

## 迭代器
*  `Symbol.iterator` 一个统一的接口，它的作用是使各种数据结构可被便捷的访问。
*  `for of` 是 ES6 新引入的循环，用于替代 `for..in` 和 `forEach()`。

## 类
`ES6`提供了更接近传统语言的写法，引入了`class`这个概念，作为对象的模板。通过`class`关键字，可以定义类，与多数传统语言类似。不过，`ES6`的`class`不是新的对象继承模型，它只是原型链的语法糖表现形式。

```javascript
class Me {
  constructor() {
    console.log("constructor");
  }
  study() {
    console.log('study');
  }
}

console.log(typeof Me); //function
let me = new Me(); //constructor
me.study(); //study
```


## Promise 对象
`Promise`是异步编程的一种解决方案。   
从语法上说，Promise 是一个对象，从它可以获取异步操作的消息。  
`Promise`异步操作有三种状态：`pending`、`fulfilled`和`rejected`。除了异步操作的结果，任何其他操作都无法改变这个状态。  
`then`方法接收两个函数作为参数，第一个参数是`Promise`执行成功时的回调，第二个参数是 `Promise`执行失败时的回调，两个函数只会有一个被调用。
```javascript
const p1 = new Promise(function(resolve,reject){
    resolve('resolve');
}); 
const p2 = new Promise(function(resolve,reject){
    reject('reject');
});
p1.then(function(v){  
    console.log(v); //resolve
});
p2.then(function(v){ 
    console.log(v);
},
function(v){
    console.log(v); //reject
});
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```
