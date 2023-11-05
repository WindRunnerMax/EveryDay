# Js中\==与===
`JavaScript`中提供`==`相等运算符与`===`严格相等运算符，建议是只要变量的数据类型能够确定，一律使用`===`，各种类型的值的比较可以参考`Js`真值表

## ==相等运算符
`==`在判断相等时会进行隐式的类型转换， 其比较遵循一些原则，即先转换类型再比较。
* 如果有一个操作数是布尔值，则在比较相等性之前先将其转换为数值，即是调用`Number()`方法。
* 如果一个操作数是字符串，另一个是数值，在比较相等性之前先将字符串转换为数值，同样调用`Number()`方法。
* 如果一个操作数是对象，另一个操作数不是，则调用对象的`valueOf()`和`toString()`方法把对象转换成基础类型的值再比较，除`Date`对象外，会优先尝试使用`valueOf()`方法，用得到的基本类型按照前面的规则进行比较。
* 以及`null == undefined`，此外任何其他组合，都不相等。

```javascript
1 == true //true // Number Boolean
2 == true //false
1 == "1"  //true // Number String
[] == ""  //true // Object String
[] == false // true // Object Boolean
[] == 0   //true // Object Number
[] == {}  //false
[] == []  //false
{} == {}  //false
null == undefined //true
```
在使用的时候可能会出现一些问题。

```javascript
0 == "0"  //true
0 == []   //true
"0" == [] // false
```
如果是直接实现了`valueOf()`与`toString()`的方法，而不是调用原型链上的`Object.prototype.valueOf()`与`Object.prototype.toString()`方法，甚至能够产生异常。
```javascript
var obj = {valueOf: function(){ return {} }, toString: function(){ return {}}}
console.log(obj == 0) // Uncaught TypeError: Cannot convert object to primitive value
```

## ===严格相等运算符
`===`先判断类型再比较，类型不同直接不相等。  
`ES6`数据类型有`Number`、`String`、`Boolean`、 `Object`、`Symbol`、`null`和`undefined`。
```javascript
1 === true //false
1 === "1"  //false
[] === ""  //false
null === undefined //false
```

## if
`if()`也可以看作是一个单独的运算符类别。

```javascript
if(true) console.log("exec"); //exec
if(false) console.log("exec");
if(1) console.log("exec"); //exec
if(0) console.log("exec"); 
if(-1) console.log("exec"); //exec
if("true") console.log("exec"); //exec
if("1") console.log("exec"); //exec
if("0") console.log("exec"); //exec
if("") console.log("exec");
if(null) console.log("exec");
if(undefined) console.log("exec");
if("null") console.log("exec"); //exec
if("undefined") console.log("exec"); //exec
if([]) console.log("exec"); //exec
if({}) console.log("exec"); //exec
if([0]) console.log("exec"); //exec
if(NaN) console.log("exec");
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.zhihu.com/question/31442029
https://thomas-yang.me/projects/oh-my-dear-js/
https://dorey.github.io/JavaScript-Equality-Table/#three-equals
```
