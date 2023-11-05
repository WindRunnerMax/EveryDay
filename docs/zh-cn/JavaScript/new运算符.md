# new运算符

在`JavaScript`中`new`是一个语法糖，可以简化代码的编写，可以批量创建对象实例。  
语法糖`Syntactic sugar`，指计算机语言中添加的某种语法，这种语法对语言的功能并没有影响，但是更方便程序员使用。通常来说使用语法糖能够增加程序的可读性，从而减少程序代码出错的机会。  

## 实例
假如我们不使用`new`，来初始化创建10个`student`对象实例。

```javascript
var stuGroup = [];
for(let i=0;i<10;++i){
    var obj = {
        name: i,
        hp: 100,
        mp: 1000,
        power: 100,
        defense: 100
    }
    stuGroup.push(obj);
}
console.log(stuGroup);
```
此时得到了`10`个初始化的`student`对象实例，假如使用`new`关键字可以简化操作，还可以使用原型链来共享属性等操作。

```javascript
function Student(i){
    this.name = i;
    this.hp = 100;
    this.mp = 1000;
    this.power = 100,
    this.defense = 100;
}
Student.prototype.from = "sdust";
var stuGroup = [];
for(let i=0;i<10;++i){
    stuGroup.push(new Student(i));
}
console.log(stuGroup);
```

## new运算符的操作
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
function Student(i){
    this.name = i;
    this.hp = 100;
    this.mp = 1000;
    this.power = 100,
    this.defense = 100;
}
Student.prototype.from = "sdust";
var stuGroup = [];
for(let i=0;i<10;++i){
    stuGroup.push(_new(Student,i));
}
console.log(stuGroup);
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
原型与原型链
https://github.com/WindrunnerMax/EveryDay/blob/master/JavaScript/%E5%8E%9F%E5%9E%8B%E4%B8%8E%E5%8E%9F%E5%9E%8B%E9%93%BE.md
apply、call、bind
https://github.com/WindrunnerMax/EveryDay/blob/master/JavaScript/apply%E3%80%81call%E3%80%81bind.md
```