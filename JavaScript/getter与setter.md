# getter与setter
`getter`是一个获取某个属性的值的方法，`setter`是一个设定某个属性的值的方法。

## 概述
* 通过`getter`与`setter`可以实现数据取值与赋值的拦截操作，当想监控某个值的变化的时候，通过`getter`与`setter`即可实现监听，而不需要找到并修改每一个操作这个值的代码。
* 有时需要允许访问返回动态计算值的属性，或者需要反映内部变量的状态，而不需要使用显式方法调用，可以使用`getter`与`setter`来实现。
* 尽管可以结合使用`getter`和`setter`来创建一个伪属性，但是不能将`getter`与`setter`绑定到一个属性并且该属性实际上具有一个值。

## 字面量声明
可以直接通过字面值创建对象时声明`get`与`set`方法。

```javascript
var obj  = {
    __x:1,
    get x(){
        console.log("取值操作");
        return this.__x;
    },
    set x(v){
        console.log("赋值操作，例如更新视图");
        this.__x=v;
    }
}
console.log(obj.x); // 1
obj.x = 11;
console.log(obj.x); // 11
/*
  定义__x是以双下划线开头的，是不希望直接访问的属性
  当然可以直接使用obj.__x对属性进行赋值与取值操作，但这样就失去了get与set的意义
 */
/*
  另外关于描述中的第三点，不能将getter与setter绑定到一个属性并且该属性实际上具有一个值，否则会无限递归堆栈溢出产生异常
  var obj  = {
      x:1,
      get x(){
          return this.x;
      },
      set x(v){
          this.x=v;
      }
  }
  console.log(obj.x); // Uncaught RangeError: Maximum call stack size exceeded
/*
```

## Object.defineProperty
使用`Object.defineProperty()`精确地添加或修改对象的属性。
```javascript
var obj  = {
    __x:1
}
Object.defineProperty(obj, "x", {
    get: function(){
        console.log("取值操作");
        return this.__x;
    },
    set: function(v){
        console.log("赋值操作，例如更新视图");
        this.__x=v;
    }
});
console.log(obj.x); // 1
obj.x = 11;
console.log(obj.x); // 11
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```