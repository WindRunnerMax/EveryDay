# let与const
`ES2015(ES6)`新增加了两个重要的`JavaScript`关键字: `let`和`const`。

## 块级作用域
代码块内如果存在`let`或者`const`，代码块会对这些命令声明的变量从块的开始就形成一个封闭作用域。

```javascript
{
    let a = 1;
    var b = 2;
    function s(){return a;}
    console.dir(s);
    /*
      ...
      [[Scopes]]: Scopes[2]
        0: Block {a: 1}
        1: Global ...
    */
}
// 此处不能使用 a ，a 是块级作用域
// 此处可以使用 b , b 在此处是全局作用域
```
`[[Scopes]]`是保存函数作用域链的对象，是函数的内部属性无法直接访问，`[[Scopes]]`中可以看到出现了一个`Block`块级作用域，这使得`let`特别适合在`for`中使用，在`ECMAScript 2015`引入`let`关键字之前，只有函数作用域和全局作用域，函数作用域中又可以继续嵌套函数作用域，在`for`并未具备局部作用域，于是有一个常见的闭包创建问题。

```javascript
function counter(){
    var arr = [];
    for(var i = 0 ; i < 3 ; ++i){
        arr[i] = function(){
            return i;
        }
    }
    return arr;
}

var coun = counter();
for(var i = 0 ; i < 3 ; ++i){
    console.log(coun[i]()); // 3 3 3
}
```
可以看到运行输出是`3 3 3`，而并不是期望的`0 1 2`，原因是这三个闭包在循环中被创建的时候，共享了同一个词法作用域，这个作用域由于存在一个`i`由`var`声明，由于变量提升，具有函数作用域，当执行闭包函数的时候，由于循环早已执行完毕，`i`已经被赋值为`3`，所以打印为`3 3 3`，可以使用`let`关键字声明`i`来创建块级作用域解决这个问题

```javascript
function counter(){
    var arr = [];
    for(let i = 0 ; i < 3 ; ++i){
        arr[i] = function(){
            return i;
        }
    }
    return arr;
}

var coun = counter();
for(var i = 0 ; i < 3 ; ++i){
    console.log(coun[i]()); // 0 1 2
}
```
当然也可以使用匿名函数新建函数作用域来解决

```javascript
function counter(){
    var arr = [];
    for(var i = 0 ; i < 3 ; ++i){
        (function(i){
            arr[i] = function(){
                return i;
            }
        })(i);
    }
    return arr;
}

var coun = counter();
for(var i = 0 ; i < 3 ; ++i){
    console.log(coun[i]()); // 0 1 2
}
```
## 一次声明
同一作用域内`let`和`const`只能声明一次，`var`可以声明多次

```javascript
let a = 1;
let a = 1; //Uncaught SyntaxError: Identifier 'a' has already been declared

const b = 1;
const b = 1; //Uncaught SyntaxError: Identifier 'b' has already been declared
```

## 暂时性死区
当使用`let`与`const`生成块级作用域时，代码块会对这些命令声明的变量从块的开始就形成一个封闭作用域，代码块内，在声明变量之前使用它会报错，称为暂时性死区。

```javascript
{
    console.log(a); // Uncaught ReferenceError: Cannot access 'a' before initialization
    let a =1;
}
```

## 变量提升
`let`与`const`也存在变量提升，在`ES6`的文档中出现了`var/let hoisting`字样，也就是说官方文档说明`let`与`var`一样，都存在变量提升，但是与`var`的变量提升有所不同
```
let 的「创建」过程被提升了，但是初始化没有提升。  
var 的「创建」和「初始化」都被提升了。  
function 的「创建」「初始化」和「赋值」都被提升了。
```
在`stackoverflow`中比较有说服力的例子
```javascript
x = "global";
// function scope:
(function() {
    x; // not "global"

    var/let/… x;
}());
// block scope (not for `var`s):
{
    x; // not "global"

    let/const/… x;
}
```
`js`中无论哪种形式声明`var`,`let`,`const`,`function`,`function*`,`class`都会存在提升现象，不同的是，`var`,`function`,`function*`的声明会在提升时进行初始化赋值为 undefined，因此访问这些变量的时候，不会报`ReferenceError`异常，而使用`let`,`const`,`class`声明的变量，被提升后不会被初始化，这些变量所处的状态被称为`temporal dead zone`，此时如果访问这些变量会抛出`ReferenceError`异常，看上去就像没被提升一样。


```
https://blog.csdn.net/jolab/article/details/82466362
https://www.jianshu.com/p/0f49c88cf169
https://stackoverflow.com/questions/31219420/are-variables-declared-with-let-or-const-not-hoisted-in-es6
```

## window
在全局作用域中使用`var`直接声明变量或方法等会挂载到`window`对象上，`let`与`const`声明变量或方法等会保存在`Script`作用域中

```javascript
var a = 1;
let b = 2;
const c = 3;

console.log(window.a); // 1
console.log(window.b); // undefined
console.log(window.c); // undefined
```
```javascript
let a = 1;
{
    let b = 2;
     function s(){return a + b;}
     console.dir(s);
     /*
      ...
      [[Scopes]]: Scopes[3]
        0: Block {b: 2}
        1: Script {a: 1}
        2: Global ...
    */
}
```

## 初始化
`var`与`let`在声明时可以不赋初值，`const`必须赋初值
```javascript
var a;
let b;
const c; //Uncaught SyntaxError: Missing initializer in const declaration
```

## 只读常量
`const`用以声明一个只读常量，初始化后值不可再修改

```javascript
const a = 1;
a = 2; // Uncaught TypeError: Assignment to constant variable.
```
`const`其实保证的不是变量的值不变，而是保证变量指向的内存地址所保存的数据不允许改动。对于简单类型`number`、`string` 、`boolean`、`Symbol`，值就保存在变量指向的那个内存地址，因此`const` 声明的简单类型变量等同于常量。而复杂类型`object`，`array`，`function`，变量指向的内存地址其实是保存了一个指向实际数据的指针，所以`const`只能保证指针是固定的，至于指针指向的数据结构变不变就无法控制了。

```javascript
const a = {};
console.log(a); // {}
a.s = function(){}
console.log(a); // {s: ƒ}
```

## 相关

```
ES6新特性 https://github.com/WindrunnerMax/EveryDay/blob/master/JavaScript/ES6%E6%96%B0%E7%89%B9%E6%80%A7.md
Js变量提升 https://github.com/WindrunnerMax/EveryDay/blob/master/JavaScript/JS%E5%8F%98%E9%87%8F%E6%8F%90%E5%8D%87.md
```
