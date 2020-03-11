# JavaScript闭包

闭包就是能够读取其他函数内部变量的，函数也就是说，**闭包可以让你从内部函数访问外部函数作用域**。在`JavaScript`，函数在每次创建时生成闭包。在本质上，闭包是将函数内部和函数外部连接起来的桥梁。

## 定义闭包
为了定义一个闭包，首先需要一个函数来套一个匿名函数。闭包是需要使用局部变量的，定义使用全局变量就失去了使用闭包的意义，最外层定义的函数可实现局部作用域从而定义局部变量，函数外部无法直接访问内部定义的变量。

```JavaScript
function student(){
    var name = "Ming";
    var sayMyName = function(){
        console.log(name);
    }
    return sayMyName; // return是为了让外部能访问闭包，挂载到window对象也可以
}
var stu = student(); 
stu(); // Ming
```
可以看到定义在函数内部的`name`变量并没有被销毁，我们仍然可以在外部使用函数访问这个局部变量，使用闭包，可以把局部变量驻留在内存中，从而避免使用全局变量。全局变量污染会导致应用程序不可预测性，每个模块都可调用必将引来灾难。

## 词法环境
闭包共享相同的函数定义，但是保存了不同的词法环境`lexical environment`。

```JavaScript
function student(name){
    var sayMyName = function(){
        console.log(name);
    }
    return sayMyName;
}
var stu1 = student("Ming"); 
var stu2 = student("Yang"); 
stu1(); // Ming
stu2(); // Yang
```

## 模拟私有方法
在面向对象的语言中，例如`Java`、`PHP`等，都是支持定义私有成员的，即只有类内部能够访问，而无法被外部类访问。`JavaScript`并未原生支持定义私有成员，但是可以使用闭包来模拟实现，私有方法不仅仅有利于限制对代码的访问，还提供了管理全局命名空间的强大能力，避免非核心的方法弄乱了代码的公共接口部分。

```JavaScript
function student(){
    var HP = 100;
    var addHP = function(){
        return ++HP;
    }
    var decHP = function(){
        return --HP;
    }
    return {
        addHP,
        decHP
    };
}
var stu = student();
console.log(stu.HP); // undefined 不允许直接访问
console.log(stu.addHP()); // 101
console.log(stu.decHP()); // 100
```

## 作用域链机制
在`ECMAScript 2015`引入`let`关键字之前，只有函数作用域和全局作用域，函数作用域中又可以继续嵌套函数作用域，在`for`并未具备局部作用域，于是有一个常见的闭包创建问题。

```JavaScript
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
可以看到运行输出是`3 3 3`，而并不是期望的`0 1 2`，原因是这三个闭包在循环中被创建的时候，共享了同一个词法作用域，这个作用域由于存在一个`i`由`var`声明，由于变量提升，具有函数作用域，当执行闭包函数的时候，由于循环早已执行完毕，`i`已经被赋值为`3`，所以打印为`3 3 3`

### 匿名函数新建函数作用域来解决

```JavaScript
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

### 使用let关键字
```JavaScript
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

## 内存泄漏
内存泄露是指你用不到（访问不到）的变量，依然占据着内存空间，不能被再次利用起来。  
闭包引用的变量应该是需要使用的，不应该属于内存泄漏，但是在`IE8`浏览器中`JScript.dll`引擎使用会出现一些问题，造成内存泄漏。  
对于各种引擎闭包内存回收具体的表现参阅 [这篇文章](https://www.cnblogs.com/rubylouvre/p/3345294.html)

## 性能考量
如果不是某些特定任务需要使用闭包，在其它函数中创建函数是不明智的，因为闭包在处理速度和内存消耗方面对脚本性能具有负面影响。  
在创建新的对象或者类时，方法通常应该关联于对象的原型，而不是定义到对象的构造器中。原因是这将导致每次构造器被调用时，方法都会被重新赋值一次。