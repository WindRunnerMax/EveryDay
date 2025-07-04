# 深入理解Js中的this
`JavaScript`作用域为静态作用域`static scope`，但是在`Js`中的`this`却是一个例外。`this`的指向问题就类似于动态作用域，其并不关心函数和作用域是如何声明以及在何处声明的，只关心它们从何处调用。`this`的指向在函数定义的时候是确定不了的，只有函数执行的时候才能确定`this`到底指向谁，当然实际上`this`的最终指向的是那个调用它的对象。

## 作用域
我们先来了解一下`JavaScript`的作用域，以便理解为什么说`this`更类似于动态作用域。通常来说，一段程序代码中所用到的名字并不总是有效或可用的，而限定这个名字的可用性的代码范围就是这个名字的作用域`scope`。当一个方法或成员被声明，他就拥有当前的执行上下文`context`环境，在有具体值的`context`中，表达式是可见也都能够被引用，如果一个变量或者其他表达式不在当前的作用域，则将无法使用。

作用域也可以根据代码层次分层，以便子作用域可以访问父作用域，通常是指沿着链式的作用域链查找，而不能从父作用域引用子作用域中的变量和引用。`JavaScript`作用域为静态作用域`static scope`，也可以称为词法作用域`lexical scope`。其主要特征在于，函数作用域中遇到既不是参数也不是函数内部定义的局部变量时，去函数定义时上下文中查。而与之相对应的是动态作用域`dynamic scope`则不同，其函数作用域中遇到既不是参数也不是函数内部定义的局部变量时，到函数调用时的上下文中去查。

```javascript
var a = 1;
var s = function(){
    console.log(a);
};

(function(){
    var a = 2;
    s(); // 1
})();
```

调用`s()`是打印的`a`为`1`，此为静态作用域，也就是声明时即规定作用域，而假如是动态作用域的话在此处会打印`2`。现在大部分语言都采用静态作用域，比如`C`、`C++`、`Java`、`PHP`、`Python`等等，具有动态作用域的语言有`Emacs Lisp`、`Common Lisp`、`Perl`等。 

### 全局作用域
直接声明在顶层的变量或方法就运行在全局作用域，借用函数的`[[Scopes]]`属性来查看作用域，`[[Scopes]]`是保存函数作用域链的对象，是函数的内部属性无法直接访问但是可以打印来查看。

```javascript
function s(){}
console.dir(s);
/*
  ...
  [[Scopes]]: Scopes[1]
    0: Global ...
*/
// 可以看见声明的s函数运行的上下文环境是全局作用域
```

### 函数作用域
当声明一个函数后，在函数内部声明的方法或者成员的运行环境就是此函数的函数作用域
```javascript
(function localContext(){
    var a = 1;
    function s(){ return a; }
    console.dir(s);
})();
/*
  ...
  [[Scopes]]: Scopes[2]
    0: Closure (localContext) {a: 1}
    1: Global ...
*/
// 可以看见声明的s函数运行的上下文环境是函数localContext的作用域，也可以称为局部作用域
```

### 块级作用域
代码块内如果存在`let`或者`const`，代码块会对这些命令声明的变量从块的开始就形成一个封闭作用域。

```javascript
{
    let a = 1;
    function s(){return a;}
    console.dir(s);
    /*
      ...
      [[Scopes]]: Scopes[2]
        0: Block {a: 1}
        1: Global ...
    */
}
// 可以看见声明的s函数运行的上下文环境是Block块级作用域，也是局部作用域
```

## 分析
我们在使用`this`之前有必要了解为什么在`JavaScript`中要有`this`这个设计，在这之前我们先举个小例子，通常我们使用`this`时可能会遇到的典型问题就类似于下面这样，虽然我们运行的都是同一个函数，但是执行的结果可能会不同。

```javascript
var obj = {
    name: 1,
    say: function() {
        return this.name;
    }
};

window.name = 2;
window.say = obj.say;

console.log(obj.say()); // 1
console.log(window.say()); // 2
```

产生这样的结果的原因就是因为使用了`this`关键字，前文已经提到了`this`必须要在运行时才能确定，在这里，对于`obj.say()`来说，`say()`运行的环境是`obj`对象，对于`window.say()`来说，`say()`运行的环境是`window`对象，所以两者运行的结果不同。  

此时我们就来了解一下，为什么`JavaScript`会有`this`这样一个设计，我们首先来了解一下`JavaScript`的内存结构中的堆栈，堆`heap`是动态分配的内存，大小不定也不会自动释放，栈`stack`为自动分配的内存空间，在代码执行过程中自动释放。`JavaScript`在栈内存中提供一个供`Js`代码执行的环境，关于作用域以及函数的调用都是栈内存中执行的。`Js`中基本数据类型`String`、`Number`、`Boolean`、`Null`、`Undefined`、`Symbol`，占用空间小且大小固定，值直接保存在栈内存中，是按值访问，对于`Object`引用类型，其指针放置于栈内存中，指向堆内存的实际地址，是通过引用访问。  

那么此时我们来看一下上边的示例，在内存中对于`obj`对象是存放在堆内存的，如果在对象中的属性值是个基本数据类型，那么其会跟这个对象存储在同一块内存区域，但是这个属性值同样可能是一个引用类型。那么对于`say`这个函数也是存在于堆内存中的，实际上在此处我们可以将其理解为这个函数的实际定义在一个内存区域(以一个匿名函数的形式存在)，而`obj`这个对象同样在其他的一个内存区域，`obj`通过`say`这个属性指向了这个匿名函数的内存地址，即`obj --say--> function`。

那么此时问题来了，由于这种内存结构，我们可以使任何变量对象等指向这个函数，所以在`JavaScript`的函数中是需要允许我们取得运行环境的值以供使用的。我们必须要有一种机制，能够在函数体内部获得当前的运行环境`context`，所以`this`就出现了，它的设计目的就是在函数体内部，指代函数当前的运行环境。

## 使用
我们需要记住，`this`是在运行时进行绑定的，并不是在定义时绑定，它的`context`取决于函数调用时的各种条件，简单来说`this`的绑定和函数声明的位置没有任何关系，只取决于函数的调用方式，再简单来说`this`永远指向调用者，但箭头函数除外，接下来我们介绍一下五种`this`的使用情况。

### 默认绑定
最常用的函数调用类型即独立函数调用，这个也是优先级最低的一个，此时`this`指向全局对象，注意如果使用严格模式`strict mode`，那么全局对象将无法使用默认绑定，因此`this`会变为`undefined`。

```javascript
var a = 1; //  变量声明到全局对象中
function f1() {
    return this.a;
}

function f2() {
    "use strict";
    return  this;
}

console.log(f1()); // 1 // 实际上是调用window.f1()而this永远指向调用者即window
console.log(f2()); // undefined // 实际上是调用 window.f2() 此时由于严格模式use strict所以在函数内部this为undefined
```

### 隐式绑定
对象属性引用链中只有最顶层或者说最后一层会影响`this`，同样也是`this`永远指向调用者，具体点说应该是指向最近的调用者，当然箭头函数除外，另外我们可能有意无意地创建间接引用的情况，这个情况下同样也适用于`this`指向调用者，在上文分析那部分使用的示例就属于间接引用的情况。

```javascript
function f() {
    console.log(this.a);
}
var obj1 = {
    a: 1,
    f: f
};
var obj2 = {
    a: 11,
    obj1: obj1
};
obj2.obj1.f(); // 1 // 最后一层调用者即obj1
```

```javascript
function f() {
    console.log(this.a);
}
var obj1 = {
    a: 1,
    f: f
};
var obj2 = {
    a: 11,
};
obj2.f = obj1.f; // 间接引用
obj2.f(); // 11 // 调用者即为obj2
```

### 显示绑定
如果我们想把某个函数强制在某个环境即对象上，那么就可以使用`apply`、`call`、`bind`强制绑定`this`去执行即可，每个`Function`对象都存在`apply()`、`call()`、`bind()`方法，其作用都是可以在特定的作用域中调用函数，等于设置函数体内`this`对象的值，以扩充函数赖以运行的作用域。此外需要注意使用`bind`绑定`this`的优先级是大于`apply`和`call`的，即使用`bind`绑定`this`后的函数使用`apply`和`call`是无法改变`this`指向的。

```javascript
window.name = "A"; // 挂载到window对象的name
document.name = "B"; // 挂载到document对象的name
var s = { // 自定义一个对象s
    name: "C"
}

var rollCall = {
    name: "Teacher",
    sayName: function(){
        console.log(this.name);
    }
}
rollCall.sayName(); // Teacher

// apply
rollCall.sayName.apply(); // A // 不传参默认绑定window
rollCall.sayName.apply(window); // A // 绑定window对象
rollCall.sayName.apply(document); // B // 绑定document对象
rollCall.sayName.apply(s); // C // 绑定自定义对象

// call
rollCall.sayName.call(); // A // 不传参默认绑定window
rollCall.sayName.call(window); // A // 绑定window对象
rollCall.sayName.call(document); // B // 绑定document对象
rollCall.sayName.call(s); // C // 绑定自定义对象

// bind // 最后一个()是为让其执行
rollCall.sayName.bind()(); //A // 不传参默认绑定window
rollCall.sayName.bind(window)(); //A // 绑定window对象
rollCall.sayName.bind(document)(); //B // 绑定document对象
rollCall.sayName.bind(s)(); // C // 绑定自定义对象
```

### new绑定
在`JavaScript`中`new`是一个语法糖，可以简化代码的编写，可以批量创建对象实例，在`new`的过程实际上进行了以下操作。

1. 创建一个空的简单`JavaScript`对象即`{}`。  
2. 链接该对象(即设置该对象的构造函数)到另一个对象。   
3. 将步骤`1`新创建的对象作为`this`的上下文`context`。  
4. 如果该函数没有返回对象，则返回步骤`1`创建的对象。  

```javascript
function _new(base,...args){
    var obj = {};
    obj.__proto__ = base.prototype;
    base.apply(obj, args);
    return obj;
}

function Funct(a) {
    this.a = a;
}
var f1 = new Funct(1);
console.log(f1.a); // 1

var f2 = _new(Funct, 1);
console.log(f2.a); // 1
```

### 箭头函数
箭头函数没有单独的`this`，在箭头函数的函数体中使用`this`时，会取得其上下文`context`环境中的`this`。箭头函数调用时并不会生成自身作用域下的`this`，它只会从自己的作用域链的上一层继承`this`。由于箭头函数没有自己的`this`指针，使用`apply`、`call`、`bind`仅能传递参数而不能动态改变箭头函数的`this`指向，另外箭头函数不能用作构造器，使用`new`实例化时会抛出异常。

```javascript
window.name = 1;
var obj = {
    name: 11,
    say: function(){
        const f1 = () => {
            return this.name;
        }
        console.log(f1()); // 11 // 直接调用者为window 但是由于箭头函数不绑定this所以取得context中的this即obj对象
        const f2 = function(){
            return this.name;
        }
        console.log(f2()); // 1 // 直接调用者为window 普通函数所以
        return this.name;
    }
}

console.log(obj.say()); // 11 // 直接调用者为obj 执行过程中的函数内context的this为obj对象
```

## 示例

```javascript
function s(){
    console.log(this);
}

// window中直接调用 // 非 use strict
s(); // Window // 等同于window.s()，调用者为window
// window是Window的一个实例 // window instanceof Window //true

// 新建对象s1
var s1 = {
    t1: function(){ // 测试this指向调用者
        console.log(this); // s1
        s(); // Window // 此次调用仍然相当 window.s()，调用者为window
    },
    t2: () => { // 测试箭头函数，this并未指向调用者
        console.log(this);
    },
    t3: { // 测试对象中的对象
      tt1: function() {
           console.log(this);
      }  
    },
    t4: { // 测试箭头函数以及非函数调用this并未指向调用者
      tt1: () => {
           console.log(this);
      }  
    },
    t5: function(){ // 测试函数调用时箭头函数的this的指向，其指向了上一层对象的调用者
        return {
            tt1: () => {
                console.log(this);
            }
        }
    }
}
s1.t1(); // s1对象 // 此处的调用者为 s1 所以打印对象为 s1
s1.t2(); // Window
s1.t3.tt1(); // s1.t3对象
s1.t4.tt1(); // Window
s1.t5().tt1(); // s1对象

```


## 每日一题

- https://github.com/WindRunnerMax/EveryDay

## 参考

- https://juejin.cn/post/6882527259584888845
- https://www.cnblogs.com/raind/p/10767622.html
- http://www.ruanyifeng.com/blog/2018/06/javascript-this.html
