# valueOf and toString
`valueOf` and `toString` are methods on `Object.prototype`, and almost all objects in `Js` inherit from `Object`. Similarly, due to wrapper objects, almost all data types can call these two methods, except for instances such as `null`, `undefined`, and objects created with `Object.create(null)`. Typically, we don't actively call these two methods, but they are often secretly invoked during code execution, and they are selectively called in different situations.

## valueOf
`JavaScript` converts objects to primitive values by calling the `valueOf` method, and we rarely need to call the `valueOf` method ourselves. When an object with an expected primitive value is encountered, `JavaScript` will automatically call it. By default, the `valueOf` method is inherited by every object following `Object`. Each built-in core object will override this method to return the appropriate value, and if the object has no primitive value, `valueOf` will return the object itself.  
Many built-in objects in `JavaScript` rewrite this function to suit their specific needs. Therefore, the return value and return value type of the `valueOf` method for different types of objects may vary.

| Object | Return Value |
| --- | --- |
| `Array` | Returns the array object itself. |
| `Boolean` | Boolean value. |
| `Date` | The stored time is the number of milliseconds `UTC` from midnight on January 1, 1970. |
| `Function` | The function itself. |
| `Number` | Numeric value. |
| `Object` | By default returns the object itself. |
| `String` | String value. |

```javascript
var arr = [];
console.log(arr.valueOf() === arr); // true

var date = new Date();
console.log(date.valueOf()); // 1376838719230

var num =  1;
console.log(num.valueOf()); // 1

var bool = true;
console.log(bool.valueOf() === bool); // true

var newBool = new Boolean(true);
console.log(newBool.valueOf() === newBool); // false // The former is bool, the latter is object

function funct(){}
console.log(funct.valueOf() === funct); // true

var obj = {};
console.log(obj.valueOf() === obj); // true

var str = "";
console.log(str.valueOf() === str); // true

var newStr = new String("");
console.log(newStr.valueOf() === newStr); // false // The former is bool, the latter is object
```

As mentioned earlier, the `valueOf` method is often secretly called during the execution of `JavaScript`, and we can rewrite the `valueOf` method ourselves, even using `valueOf` and other methods in a very flexible way in `def.js` to achieve a `Ruby`-style class definition factory, implementing inheritance in the style of `Child << Parent`.

```javascript
class ValueOfTest{
    constructor(val){
        this.val = val;
    }
    valueOf(){
        return this.val;
    }
}

var v = new ValueOfTest(10);
console.log(v + 1); // 11
```

## toString
`JavaScript` returns a string representing the object by calling the `toString` method, and every object has a `toString` method. It is automatically called when the object is represented as a text value, or when an object is referenced in the expected string way. By default, the `toString()` method is inherited by every `Object` object, and if this method is not overridden in a custom object, `toString` returns`[object type]`, where `type` is the object's type.  
Many built-in objects in `JavaScript` rewrite this function to suit their specific needs. Therefore, the return value and return value type of the `toString` method for different types of objects may vary.

```markdown
| Object | Return Value |
| --- | --- |
| `Array` | A comma-separated string, such as `toString` of `[1,2]` returns `1,2`. |
| `Boolean` | The string form of a boolean value. |
| `Date` | A readable time string, for example `Tue Oct 27 2020 16:08:48 GMT+0800` (China Standard Time) |
| `Function` | The `Js` source code string declaring the function. |
| `Number` | The string form of a numerical value. |
| `Object` | The string `[object Object]`. |
| `String` | A string. |

```javascript
var arr = [1, 2, 3];
console.log(arr.toString()); // 1,2,3

var date = new Date();
console.log(date.toString()); // Tue Oct 27 2020 16:12:35 GMT+0800 (China Standard Time)

var num =  1;
console.log(num.toString()); // 1

var bool = true;
console.log(bool.toString()); // true

function funct(){ var a = 1; }
console.log(funct.toString()); // function funct(){ var a = 1; }

var obj = {a: 1};
console.log(obj.toString()); // [object Object]

var str = "1";
console.log(str.toString()); // 1
```

## Comparison

In `JavaScript`, under different circumstances, different methods are called to handle values. Typically, the `toString()` method is called first, while in the case of arithmetic operators, the `valueOf()` takes precedence over `toString()`. When the `valueOf()` method cannot perform the operation, the `toString()` method is called again.

```javascript
var v = {
    val: 10,
    valueOf: function(){
        console.log("valueOf");
        return this.val;
    },
    toString: function(){
        console.log("toString");
        return this.val;
    }
}

var obj = {"10": 1};

console.log(v); // {val: 10, valueOf: ƒ, toString: ƒ}
console.log(1+v); // valueOf // 11
console.log(obj[v]); // toString // 1
console.log("" + v); // valueOf // 10
console.log(String(v)); // toString // 10
console.log(Number(v)); // valueOf // 10
console.log(v == 10); // valueOf // true // Only in the case of == is it possible to call valueOf. In the case of ===, object and number cannot be equal.
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://github.com/tobytailor/def.js
https://juejin.im/post/6844903812117839879
https://juejin.im/post/6844903967097356302
https://cloud.tencent.com/developer/article/1495536
https://www.cnblogs.com/rubylouvre/archive/2010/10/01/1839748.html
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/valueOf
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/toString
```
