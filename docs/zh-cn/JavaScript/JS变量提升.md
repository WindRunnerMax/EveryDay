# JavaScript变量提升

在`JavaScript`中变量声明与函数声明都会被提升到作用域顶部，优先级依次为: 函数声明 变量声明 变量赋值。

## 变量提升

### var的变量提升

```javascript
console.log(a); // undefined
var a = 1;
console.log(a); // 1
// console.log(b); // ReferenceError: b is not defined
```

为了显示`a`与`b`的区别，打印了一下未声明的变量`b`，其抛出了一个`ReferenceError`异常，而`a`并未抛出异常，其实对`a`的定义并赋值类似于以下的操作，将`a`的声明提升到作用域最顶端，然后再执行赋值操作。


```javascript
var a;
console.log(a); // undefined
a = 1;
console.log(a); // 1
```

### let/const的变量提升
`let`与`const`都具有块级作用域，对于变量提升的相关问题的表现是相同的。实际上关于这个问题目前有所分歧，但在`ES6`的文档中出现了`var/let hoisting`字样，也就是说官方文档说明`let`与`var`一样，都存在变量提升，我觉得能够接受的说法是:

* `let`的「创建」过程被提升了，但是初始化没有提升。  
* `var`的「创建」和「初始化」都被提升了。  
* `function`的「创建」「初始化」和「赋值」都被提升了。

`JS`中无论哪种形式声明`var`、`let`、`const`、`function`、`function*`、`class`都会存在提升现象，不同的是`var`,`function`,`function*`的声明会在提升时进行初始化赋值为`undefined`，因此访问这些变量的时候，不会报`ReferenceError`异常，而使用`let`,`const`,`class`声明的变量，被提升后不会被初始化，这些变量所处的状态被称为`temporal dead zone`，此时如果访问这些变量会抛出`ReferenceError`异常，看上去就像没被提升一样。关于这个问题的讨论，可以参考下边的链接，尤其是在`stackoverflow`中的回答。

```
https://www.jianshu.com/p/0f49c88cf169
https://blog.bitsrc.io/hoisting-in-modern-javascript-let-const-and-var-b290405adfda
https://stackoverflow.com/questions/31219420/are-variables-declared-with-let-or-const-not-hoisted-in-es6
```

## 函数声明提升

函数声明会将声明与赋值都提前，也就是整个函数体都会被提升到作用域顶部。

```javascript
s(); // 1
function s(){
    console.log(1);
}
```

函数表达式只会提升变量的声明，本质上是变量提升并将一个匿名函数对象赋值给变量。

```javascript
console.log(s); // undefined
var s = function s(){
    console.log(1);
}
console.log(s);  // f s(){console.log(1);}
```

由此来看，直接进行函数声明与函数表达式声明的函数之间就存在一个优先级关系。

```javascript
var s = function(){
    console.log(0);
}
function s(){
    console.log(1);
}
s(); // 0
```

## 优先级

在`JS`中函数是第一等公民，在《你不知道的`JavaScript`》(上卷)一书的第`40`页中写到，函数会首先被提升，然后才是变量。也就是说，同一作用域下提升，函数会在更前面。即在`JS`引擎的执行的优先级是函数声明、变量声明、变量赋值。


```javascript
function s(){ //函数声明
    console.log(1);
}

var s; // 变量声明

// 函数已声明`a` 相同的变量名`var`声明会被直接忽略
console.log(s); // f s(){...}  

s = function(){ // 变量赋值
    console.log(0);
}

s(); // 0
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.jianshu.com/p/0f49c88cf169
https://www.cnblogs.com/echolun/p/7612142.html
https://www.cnblogs.com/miacara94/p/9173843.html
https://blog.csdn.net/qq_41893551/article/details/83011752
https://blog.bitsrc.io/hoisting-in-modern-javascript-let-const-and-var-b290405adfda
https://stackoverflow.com/questions/31219420/are-variables-declared-with-let-or-const-not-hoisted-in-es6
```
