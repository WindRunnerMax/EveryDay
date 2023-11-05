# apply()、call()、bind()

每个`Function`对象都存在`apply()`、`call()`、`bind()`方法，其作用都是可以在特定的作用域中调用函数，等于设置函数体内`this`对象的值，以扩充函数赖以运行的作用域。

## 使用
`apply()`、`call()`、`bind()`都能改变函数对象的`this`指向。

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
## 区别
虽然`apply()`、`call()`、`bind()`都能够达到改变`this`指针的目的，但是其使用还是有区别的。

```javascript
// apply与call传参方式不同
window.name = "Teacher";
var rollCall = {
    sayAllName: function(...args){
        console.log(this.name);
        args.forEach((v) => console.log(v));
    }
}

// apply 将参数作为一个数组传递
rollCall.sayAllName.apply(window,["A","B","C"]); // Teacher A B C

// call 将参数直接传递，使用逗号分隔
rollCall.sayAllName.call(window,"A","B","C"); // Teacher A B C

// bind 仅将对象绑定，并不立即执行，其返回值是一个函数，传参方式与 call 相同
var convertThis = rollCall.sayAllName.bind(window,"A","B","C"); 
convertThis(); // Teacher A B C
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```
