# Js中Number对象
`JavaScript`的`Number`对象是经过封装从而能够处理数字值的对象，`Number`对象由`Number()`构造器以及字面量声明的值在转化为包装对象时创建，`JavaScript`的`Number`类型为双精度`IEEE 754 64`位浮点类型。

## 描述
创建一个数字可以通过字面量的方式，通过字面量创建的数字变量在调用方法的时候能够自动转化为临时的包装对象，从而能够调用其构造函数的原型中的方法，也可以利用`Number`对象生成数值对象，，`JavaScript`的`Number`类型为双精度`IEEE 754 64`位浮点类型，如果是索引数字例如`Array.length`则是`32`位单精度，此外当`JavaScript`遇到一个数值时，其会首先尝试按整数处理数值，如果可以作为整数处理就使用有符号`32`位整型处理，如果数值不能作为整数或者超出有符号整型范围，就把数值保存为`64`位的`IEEE 754`浮点数。

```javascript
var a = 1;
var b = Number("1");
var c = new Number("1");
console.log(a); // 1
console.log(b); // 1
console.log(c); // Number {1}
console.log(a instanceof Number); // false
console.log(b instanceof Number); // false
console.log(c instanceof Number); // true
var arr = new Array(Math.pow(2,32)-1); // 4294967295 // [0 - 4294967294]
console.log(Number.MAX_SAFE_INTEGER); // 9007199254740991
console.log(Number("a")); // NaN // NaN !== NaN
console.log(Number("1.1")); // 1.1
console.log(Number("0x11")); // 17
console.log(Number("0b11")); // 3
console.log(Number("0o11"));  // 9
console.log(Number("Infinity")); // Infinity
```

## 属性
* `Number.EPSILON`: 两个可表示`representable`数之间的最小间隔。
* `Number.MAX_SAFE_INTEGER`: `JavaScript`中最大的安全整数`2^53 - 1`。
* `Number.MAX_VALUE`: 能表示的最大正数，最小的负数是`-MAX_VALUE`。
* `Number.MIN_SAFE_INTEGER`: `JavaScript`中最小的安全整数`-(2^53 - 1)`.
* `Number.MIN_VALUE`: 能表示的最小正数即最接近`0`的正数，实际上不会变成`0`，最大的负数是`-MIN_VALUE`。
* `Number.NaN`: 特殊的非数字值。
* `Number.NEGATIVE_INFINITY`: 特殊的负无穷大值，在溢出时返回该值。
* `Number.POSITIVE_INFINITY`: 特殊的正无穷大值，在溢出时返回该值。
* `Number.prototype`: `Number`对象上允许的额外属性。

## 方法

### Number.isNaN()
`Number.isNaN(value)`  
`Number.isNaN()`方法确定传递的值是否为`NaN`，并且检查其类型是否为`Number`，其是原来的全局`isNaN()`的更稳妥的版本。

```javascript
console.log(Number.isNaN(NaN)); // true // NaN !== NaN
console.log(Number.isNaN(Number("1"))); // false
console.log(Number.isNaN(Number("a"))); // true
```

### Number.isFinite()
`Number.isFinite(value)`  
`Number.isFinite()`方法用来检测传入的参数是否是一个有穷数。

```javascript
console.log(Number.isFinite(NaN)); // false
console.log(Number.isFinite("1")); // false // 全局方法 isFinite("1") 返回 true
console.log(Number.isFinite(1 / 0)); // false
console.log(Number.isFinite(0 / 0)); // false
console.log(Number.isFinite(0.1 + 0.1)); // true
console.log(Number.isFinite(Infinity)); // false
```

### Number.isInteger()
`Number.isInteger(value)`  
`Number.isInteger()`方法用来判断给定的参数是否为整数。

```javascript
console.log(Number.isInteger(NaN)); // false
console.log(Number.isInteger("1")); // false 
console.log(Number.isInteger(1)); // true
```

### Number.isSafeInteger()
`Number.isSafeInteger(testValue)`  
`Number.isSafeInteger()`方法用来判断传入的参数值是否是一个安全整数`safe integer`。一个安全整数是一个符合下面条件的整数：
* 可以准确地表示为一个`IEEE-754`双精度数字。
* 其`IEEE-754`表示不能是舍入任何其他整数以适应`IEEE-754`表示的结果。

例如，`2^53 - 1`是一个安全整数，它能被精确表示，在任何`IEEE-754`舍入模式`rounding mode`下，没有其他整数舍入结果为该整数。作为对比，`2^53`就不是一个安全整数，它能够使用`IEEE-754`表示，但是`2^53 + 1`不能使用`IEEE-754`直接表示，在就近舍入`round-to-nearest`和向零舍入中，会被舍入为 `2^53`。安全整数范围为`-(2^53 - 1)`到`2^53 - 1`之间的整数，包含`-(2^53 - 1)`和`2^53 - 1`。

```javascript
console.log(Number.isSafeInteger(NaN)); // false
console.log(Number.isSafeInteger(1)); // true 
console.log(Number.isSafeInteger(1.1)); // false 
console.log(Number.isSafeInteger("1")); // false 
console.log(Number.isSafeInteger(Math.pow(2, 53))); // false 
console.log(Number.isSafeInteger(Math.pow(2, 53) - 1)); // true 
console.log(Number.isSafeInteger(Infinity)); // false
```

### Number.parseFloat()
`Number.parseFloat(string)`  
`Number.parseFloat()`方法可以把一个字符串解析成浮点数，如果无法被解析成浮点数，则返回`NaN`，该方法与全局的`parseFloat()`函数相同，并且处于`ECMAScript 6`规范中，用于全局变量的模块化。

```javascript
console.log(Number.parseFloat(NaN)); // NaN
console.log(Number.parseFloat("1.1")); // 1.1 
console.log(Number.parseFloat(Infinity)); // Infinity 
```

### Number.parseInt()
`Number.parseInt(string[, radix])`  
`Number.parseInt()`方法依据指定基数即参数`radix`的值，把字符串解析成整数，如果无法被解析成整数，则返回`NaN`，该方法与全局的`parseInt()`函数相同，并且处于`ECMAScript 6`规范中，用于全局变量的模块化。

```javascript
console.log(Number.parseInt(NaN)); // NaN
console.log(Number.parseInt("1.1")); // 1
console.log(Number.parseInt("11")); // 11
console.log(Number.parseInt("11", 2)); // 3
console.log(Number.parseInt("11", 3)); // 4
console.log(Number.parseInt("11", 8)); // 9
console.log(Number.parseInt("11", 16)); // 17
console.log(Number.parseInt(Infinity)); // NaN 
```

### Number.prototype.toExponential()
`numObj.toExponential(fractionDigits)`  
`toExponential()`方法以指数表示法返回该数值字符串表示形式。参数`fractionDigits`可选，其为一个整数用来指定小数点后有几位数字，默认情况下用尽可能多的位数来显示数字。返回一个用幂的形式 (科学记数法) 来表示`Number`对象的字符串，小数点后以`fractionDigits`提供的值来四舍五入，如果`fractionDigits`参数被忽略了，小数点后的将尽可能用最多的位数来表示该数值，对数值字面量使用`toExponential()`方法，且该数值没有小数点和指数时，应该在该数值与该方法之间隔开一个空格，以避免点号被解释为一个小数点，也可以使用两个点号调用该方法。如果一个数值的小数位数多余`fractionDigits`参数所提供的，则该数值将会在`fractionDigits`指定的小数位数处四舍五入。

```javascript
var num = new Number(100.1);
console.log(num.toExponential()); // 1.001e+2
```

### Number.prototype.toFixed()
`numObj.toFixed(digits)`  
`toFixed()`方法使用定点表示法来格式化一个数值，该数值在必要时进行四舍五入，另外在必要时会用`0`来填充小数部分。参数`digits`是小数点后数字的个数，介于`0`到`20`(包括)之间，实现环境可能支持更大范围，如果忽略该参数，则默认为`0`。

```javascript
var num = new Number(1.1);
console.log(num.toFixed(6)); // 1.100000
```

### Number.prototype.toLocaleString()
`numObj.toLocaleString([locales [, options]])`  
`toLocaleString()`方法返回这个数字在特定语言环境下的表示字符串。新的`locales`和`options`参数让应用程序可以指定要进行格式转换的语言，并且定制函数的行为。在旧的实现中，会忽略`locales`和`options`参数，使用的语言环境和返回的字符串的形式完全取决于实现方式。

```javascript
var num = new Number(1.1);
console.log(num.toLocaleString()); // 1.1
```

### Number.prototype.toPrecision()
`numObj.toPrecision(precision)`  
`toPrecision()`方法以指定的精度返回该数值对象的字符串表示。参数`precision`可选，一个用来指定有效数个数的整数。

```javascript
var num = new Number(1.1);
console.log(num.toPrecision(6)); // 1.100000
```

### Number.prototype.toString()
`numObj.toString([radix])`  
`toString()`方法返回指定`Number`对象的字符串表示形式。参数`radix`指定要用于数字到字符串的转换的基数(从`2`到`36`)，如果未指定`radix`参数，则默认值为`10`。

```javascript
var num = new Number(10);
console.log(num.toString(2)); // 1010
```

### Number.prototype.valueOf()
`numObj.valueOf()`  
`valueOf()`方法返回一个被`Number`对象包装的原始值。

```javascript
var num = new Number(10);
console.log(num.valueOf()); // 10
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.boatsky.com/blog/26
https://segmentfault.com/a/1190000000407658
https://blog.csdn.net/abcdu1/article/details/75095781
https://en.wikipedia.org/wiki/Floating-point_arithmetic
https://blog.csdn.net/weixin_43675244/article/details/89518309
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Number
```
