# The Number Object in JavaScript

The `Number` object in `JavaScript` is an encapsulated object that can handle numerical values. The `Number` object is created by the `Number()` constructor and the values declared in literals when converted to wrapped objects. The `Number` type in `JavaScript` is a double-precision `IEEE 754 64`-bit floating point type.

## Description
Creating a number can be done through the literal method. Variables that are created using the literal method can be automatically converted into temporary wrapped objects when calling methods, allowing them to call methods in their constructor's prototype. Moreover, the `Number` object can be used to generate numerical objects in `JavaScript`. The `Number` type in `JavaScript` is a double-precision `IEEE 754 64`-bit floating point type. If it is an indexed number, for example `Array.length`, it is a 32-bit single precision. Additionally, when `JavaScript` encounters a number, it will first attempt to treat the number as an integer. If it can be treated as an integer, it will use a signed 32-bit integer to process it. If the number cannot be treated as an integer or exceeds the range of signed integers, the number is saved as a 64-bit `IEEE 754` floating point number.

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

## Properties
* `Number.EPSILON`: The smallest interval between two representable numbers.
* `Number.MAX_SAFE_INTEGER`: The largest safe integer in `JavaScript`, being `2^53 - 1`.
* `Number.MAX_VALUE`: The maximum positive number that can be represented; the minimum negative number is `-MAX_VALUE`.
* `Number.MIN_SAFE_INTEGER`: The smallest safe integer in `JavaScript`, being `-(2^53 - 1)`.
* `Number.MIN_VALUE`: The smallest positive number that can be represented, the closest number to `0` without actually becoming `0`; the largest negative number is `-MIN_VALUE`.
* `Number.NaN`: A special non-numerical value.
* `Number.NEGATIVE_INFINITY`: A special negative infinity value, returned in case of overflow.
* `Number.POSITIVE_INFINITY`: A special positive infinity value, returned in case of overflow.
* `Number.prototype`: Additional properties allowed on the `Number` object.

## Methods

### Number.isNaN()
`Number.isNaN(value)`  
The `Number.isNaN()` method determines whether the passed value is `NaN` and checks if its type is a `Number`. This method is a more reliable version of the original global `isNaN()`.

```javascript
console.log(Number.isNaN(NaN)); // true // NaN !== NaN
console.log(Number.isNaN(Number("1"))); // false
console.log(Number.isNaN(Number("a"))); // true
```

### Number.isFinite()
`Number.isFinite(value)`  
The `Number.isFinite()` method is used to check whether the passed parameter is a finite number.

```javascript
console.log(Number.isFinite(NaN)); // false
console.log(Number.isFinite("1")); // false // The global method isFinite("1") returns true
console.log(Number.isFinite(1 / 0)); // false
console.log(Number.isFinite(0 / 0)); // false
console.log(Number.isFinite(0.1 + 0.1)); // true
console.log(Number.isFinite(Infinity)); // false
```

### Number.isInteger()
`Number.isInteger(value)`  
The `Number.isInteger()` method is used to determine whether the given parameter is an integer.

```javascript
console.log(Number.isInteger(NaN)); // false
console.log(Number.isInteger("1")); // false 
console.log(Number.isInteger(1)); // true
```

### Number.isSafeInteger()
`Number.isSafeInteger(testValue)`  
The `Number.isSafeInteger()` method is used to determine if the passed parameter value is a safe integer. A safe integer fulfills the following conditions:
* It can be accurately represented as an `IEEE-754` double-precision number.
* Its `IEEE-754` representation cannot be rounded to any other integer to fit the `IEEE-754` representation result.

For example, `2^53 - 1` is a safe integer as it can be accurately represented, and in any `IEEE-754` rounding mode, no other integer rounds to this number. In contrast, `2^53` is not a safe integer as while it can be represented using `IEEE-754`, `2^53 + 1` cannot be directly represented using `IEEE-754` and in round-to-nearest and round-towards-zero, it would be rounded to `2^53`. Safe integer range is between `-(2^53 - 1)` and `2^53 - 1`, including `-(2^53 - 1)` and `2^53 - 1`.

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
The `Number.parseFloat()` method parses a string argument and returns a floating point number. If the string cannot be parsed into a number, it returns `NaN`. This method is the same as the global `parseFloat()` function and is part of the `ECMAScript 6` standard, used for modularization of global variables.

```javascript
console.log(Number.parseFloat(NaN)); // NaN
console.log(Number.parseFloat("1.1")); // 1.1 
console.log(Number.parseFloat(Infinity)); // Infinity 
```

### Number.parseInt()
`Number.parseInt(string[, radix])`  
The `Number.parseInt()` method parses a string argument into an integer based on the specified radix value passed as the `radix` parameter. If the string cannot be parsed into an integer, it returns `NaN`. This method is the same as the global `parseInt()` function and is part of the `ECMAScript 6` standard, used for modularization of global variables.

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
The `toExponential()` method returns a string representing the number in exponential notation. The optional parameter `fractionDigits` is an integer used to specify the number of digits after the decimal point. By default, it displays as many digits as possible. It returns a string representing the `Number` object in exponential form, rounding to the specified number of digits after the decimal point specified by `fractionDigits`. If the `fractionDigits` parameter is omitted, the number will be displayed with as many digits as possible. When using the `toExponential()` method on a numeric literal that does not have a decimal point or exponent, there should be a space between the number and the method to avoid the period being interpreted as a decimal point, or two period symbols can be used to call the method. If a number has more decimal places than the `fractionDigits` parameter provided, the number will be rounded at the decimal place specified by `fractionDigits`.

```javascript
var num = new Number(100.1);
console.log(num.toExponential()); // 1.001e+2
```

### Number.prototype.toFixed()
`numObj.toFixed(digits)`  
The `toFixed()` method formats a number using fixed-point notation, rounding the number when necessary and padding with zeros as needed in the decimal part. The `digits` parameter specifies the number of digits after the decimal point, between `0` and `20` (inclusive). The implementation environment may support a larger range. If this parameter is omitted, it defaults to `0`.

```javascript
var num = new Number(1.1);
console.log(num.toFixed(6)); // 1.100000
```

### Number.prototype.toLocaleString()
`numObj.toLocaleString([locales [, options]])`  
The `toLocaleString()` method returns a string representing the number in the specific language environment. The new `locales` and `options` parameters allow applications to specify the language for the format conversion and customize the function's behavior. In older implementations, the `locales` and `options` parameters are ignored, and the language environment used and the form of the returned string depend entirely on the implementation.

```javascript
var num = new Number(1.1);
console.log(num.toLocaleString()); // 1.1
```

### Number.prototype.toPrecision()
`numObj.toPrecision(precision)`  
The `toPrecision()` method returns a string representing the number object with the specified precision. The optional `precision` parameter is an integer specifying the number of significant digits.

```javascript
var num = new Number(1.1);
console.log(num.toPrecision(6)); // 1.100000
```

### Number.prototype.toString()
`numObj.toString([radix])`  
The `toString()` method returns the string representation of the specified `Number` object. The `radix` parameter specifies the radix (from `2` to `36`) to be used for the number-to-string conversion. If the `radix` parameter is not specified, the default value is `10`.

```javascript
var num = new Number(10);
console.log(num.toString(2)); // 1010
```

### Number.prototype.valueOf()

The `numObj.valueOf()` method returns the primitive value wrapped by the `Number` object.

```javascript
var num = new Number(10);
console.log(num.valueOf()); // 10
```

## Every Day Topic

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.boatsky.com/blog/26
https://juejin.cn/post/6880143057930190855
https://segmentfault.com/a/1190000000407658
https://blog.csdn.net/abcdu1/article/details/75095781
https://en.wikipedia.org/wiki/Floating-point_arithmetic
https://blog.csdn.net/weixin_43675244/article/details/89518309
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Number
```