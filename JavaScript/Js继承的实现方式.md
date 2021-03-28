# Js继承的实现方式
继承是面向对象软件技术当中的一个概念，与多态、封装共为面向对象的三个基本特征。继承可以使得子类具有父类的属性和方法或者重新定义、追加属性和方法等。


## 原型链继承
通过将子类的原型对象指向父类的实例，实现继承访问父类属性方法等。

```javascript
// 定义父类
function Parent(){
    this.name = "parent";
    this.say = function(){
        console.log(this.name);
    }
}
// 定义子类
function Child(){
    this.name = "child";
}
Child.prototype = new Parent(); // 将子类的原型对象指向父类的实例
Child.prototype.construce = Child; // 修复constructor使符合原型链规定
var child = new Child(); // 实例化子类
child.say(); // child // 此时子类能够访问父类的say方法，在查找name属性的时候首先在自身属性中查找成功所以不再向上查找，若子类没有name成员，则会打印parent
console.log(child instanceof Parent); // true // 判断child的构造函数Child的prototype对象是否在Parent的原型链上
```
### 特点
* 父类新增原型方法与属性，子类都能访问到。
* 非常纯粹的继承关系，实例是子类的实例，也是父类的实例。
* 子类实例可以继承父类构造函数属性和方法、父类原型属性和方法。


### 不足
* 无法实现多继承。
* 子类实例化时无法向父类的构造函数传参。
* 所有子类实例都会共享父类的原型对象中的属性。


## 构造函数继承
当子类构造函数被调用时，借助`call`或者`apply`调用父类构造方法实现对于`this`的拓展。

```javascript
// 定义父类
function Parent(from){
    this.name = "parent";
    this.say = function(){
        console.log(this.name);
    }
    this.from = from;
}
// 定义子类
function Child(from){
    Parent.call(this, from); // 调用父类构造函数并绑定this来拓展Child实例成员方法，可以传递参数
    this.name = "child";
}

var child = new Child("child"); // 实例化子类
child.say(); // child
console.log(child.from); // child
```

### 特点
* 子类实例不会共享父类属性方法。
* 实例化子类时可以向父类构造函数传参。
* 通过调用多个父类构造函数可以实现多继承。

### 不足
* 实例并不是父类的实例，只是子类的实例。
* 只继承了父类的构造函数的属性和方法，没有继承父类原型的属性和方法。
* 每个子类都有父类实例函数的副本，拷贝了父类函数而不是引用，影响性能。

## 实例继承
为父类实例增加成员与方法，作为实例返回。

```javascript
// 定义父类
function Parent(from){
    this.name = "parent";
    this.say = function(){
        console.log(this.name);
    }
    this.from = from;
}
// 定义子类
function Child(from){
    var instance = new Parent(from);
    instance.name = "child";
    return instance;
}

var child = new Child("child"); // 实例化子类
child.say(); // child
console.log(child.from); // child
```
### 特点
* 实例化子类时可以向父类构造函数传参。
* 子类的实例化方式可以为`new Child()`或直接调用`Child()`。

### 不足
* 不支持多继承。
* 实例是父类的实例，不是子类的实例。
* 同样也是将父类的成员与方法做了实例化拷贝。

## 拷贝继承
通过直接将父类的属性拷贝到子类的原型中实现继承。
```javascript
// 定义父类
function Parent(from){
    this.name = "parent";
    this.say = function(){
        console.log(this.name);
    }
    this.from = from;
}
// 定义子类
function Child(from){
    var instance = new Parent(from);
    for(let item in instance) Child.prototype[item] = instance[item];
    this.name = "child";
}

var child = new Child("child"); // 实例化子类
child.say(); // child
console.log(child.from); // child
```

### 特点
* 支持多继承。
* 实例化子类时可以向父类构造函数传参。

### 不足
* 无法获取父类不可枚举的方法。
* 同样也是将父类的成员与方法做了实例化并拷贝。

## 原型式继承
通过共享原型对象实现继承。
```javascript
// 定义父类
function Parent(){}
Parent.prototype.name = "parent";
Parent.prototype.say = function(){ console.log(this.name); }

// 定义子类
function Child(from){
    this.name = "child";
}

Child.prototype = Parent.prototype; // 共享原型
Child.prototype.construce = Child;

var child = new Child("child"); // 实例化子类
child.say(); // child
```

### 特点
* 实现了方法与属性的复用。
* 父类新增原型方法与属性，子类都能访问到。

### 不足
* 不能继承父构造函数的实例对象的成员。
* 所有子类实例都会共享父类的原型对象中的属性。

## 组合继承
组合原型链继承和借用构造函数继承，结合了两种模式的优点，传参和复用。
```javascript
// 定义父类
function Parent(from){
    this.name = "parent";
    this.say = function(){
        console.log(this.name);
    }
    this.from = from;
}
// 定义子类
function Child(from){
    Parent.call(this, from);
    this.name = "child";
}

Child.prototype = new Parent();
Child.prototype.construce = Child;

var child = new Child("child"); // 实例化子类
child.say(); // child
console.log(child.from); // child
```

### 特点
* 原型方法可以复用。
* 既是子类的实例，也是父类的实例。
* 实例化子类时可以向父类构造函数传参。
* 可以继承实例属性和方法，也可以继承原型属性和方法。

### 不足
* 调用了两次父类构造函数，生成了两份实例，子类的构造函数的拷贝会代替原型上的父类构造函数的实例。

## 寄生组合继承
通过寄生方式，砍掉父类的实例属性，在调用两次父类的构造的时候，就不会初始化两次实例方法和属性，避免的组合继承的缺点。
```javascript
// 定义父类
function Parent(from){
    this.name = "parent";
    this.say = function(){
        console.log(this.name);
    }
    this.from = from;
}
// 定义子类
function Child(from){
    Parent.call(this, from);
    this.name = "child";
}

var f = function(){}; // 创建一个没有实例方法的类
f.prototype = Parent.prototype; // 浅拷贝父类原型 
Child.prototype = new f(); // 实例化f，此时没有实例化方法调用，同时将原型链建立
Child.prototype.construce = Child;

var child = new Child("child"); // 实例化子类
child.say(); // child
console.log(child.from); // child
```
### 特点
* 比较完善。

### 不足
* 相对比较复杂。


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```


## 参考

```
https://www.jianshu.com/p/b76ddb68df0e
https://www.cnblogs.com/ranyonsue/p/11201730.html
https://www.cnblogs.com/humin/p/4556820.html#!comments
```
