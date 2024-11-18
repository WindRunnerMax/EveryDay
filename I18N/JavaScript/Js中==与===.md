# Equality Operators `==` and `===` in JavaScript

In `JavaScript`, there are two equality operators: `==` for loose equality and `===` for strict equality. It is recommended to use `===` whenever the data type of the variables can be determined. Various types of value comparisons can be referred to using the truth table for `JavaScript`.

## The `==` Loose Equality Operator

The `==` operator performs implicit type conversion when comparing equality. It follows some principles:
* If one operand is a boolean value, it is first converted to a number before the comparison, essentially using the `Number()` method.
* If one operand is a string and the other is a number, the string is first converted to a number using the `Number()` method before the comparison.
* If one operand is an object and the other is not, the object is converted to a primitive value using the `valueOf()` and `toString()` methods to compare. Except for `Date` objects, the `valueOf()` method is preferred, and the obtained primitive type is compared according to the previous rules.
* In addition, `null == undefined` evaluates to `true`; any other combinations do not result in equality.

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
There may be some unexpected behavior when using it.

```javascript
0 == "0"  //true
0 == []   //true
"0" == [] // false
```
If the `valueOf()` and `toString()` methods are directly implemented, instead of the ones on the prototype chain (`Object.prototype.valueOf()` and `Object.prototype.toString()`), it may even result in an exception.
```javascript
var obj = {valueOf: function(){ return {} }, toString: function(){ return {}}}
console.log(obj == 0) // Uncaught TypeError: Cannot convert object to primitive value
```

## The `===` Strict Equality Operator

The `===` operator first checks the type and then compares. If the types are different, they are not considered equal.  
The data types in `ES6` are `Number`, `String`, `Boolean`, `Object`, `Symbol`, `null`, and `undefined`.

```javascript
1 === true //false
1 === "1"  //false
[] === ""  //false
null === undefined //false
```

## The `if` Statement

The `if()` statement can also be seen as a separate category of operators.

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

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.zhihu.com/question/31442029
https://thomas-yang.me/projects/oh-my-dear-js/
https://dorey.github.io/JavaScript-Equality-Table/#three-equals
```