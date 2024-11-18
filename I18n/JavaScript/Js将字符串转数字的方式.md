# Ways to Convert a String to a Number in JavaScript
There are mainly three ways to convert a string to a number in JavaScript: conversion functions, type coercion, and weak implicit type conversion. These three conversion methods can be used in five different ways.

## parseInt()
`parseInt()` and `Number.parseInt()` are the most commonly used methods to convert a string to an integer value. `Number.parseInt()` was added as a static method after `ES6` to reduce the definition of global methods and is essentially the same as the global method `parseInt()`. Their rules are as follows:
* Ignore leading spaces in the string until the first non-space character is found.
* If the first non-space character is not a number or a plus/minus sign, then return `NaN`.
* If the first character is a number, continue parsing until a non-numeric character is found.
* If the first character is a number, various integer formats can be recognized.
* Accepts a second parameter, the radix to be used for the conversion.
* Decimal values are rounded down.

```javascript
console.log(Number.parseInt(true));        // NaN
console.log(Number.parseInt(false));       // NaN
console.log(Number.parseInt(null));        // NaN
console.log(Number.parseInt(undefined));   // NaN
console.log(Number.parseInt(NaN));         // NaN
console.log(Number.parseInt("   123"));    // 123
console.log(Number.parseInt(" ab123"));    // NaN
console.log(Number.parseInt(""));          // NaN
console.log(Number.parseInt(" 31avs"));    // 31
console.log(Number.parseInt("0xF"));       // 15
console.log(Number.parseInt("070"));       // es3->56 es5->70
console.log(Number.parseInt("A", 16));     // 10
console.log(Number.parseInt("A"));         // NaN
console.log(Number.parseInt("51.2"));      // 51
console.log(Number.parseInt("-51.2"));     // -51
```

## parseFloat()
`parseFloat()` and `Number.parseFloat()` are the most commonly used methods to convert a string to a floating-point number. `Number.parseFloat()` was added as a static method after `ES6` to reduce the definition of global methods and is essentially the same as the global method `parseFloat()`. Their conversion rules are as follows:
* Ignore leading spaces in the string until the first non-space character is found.
* If the first non-space character is not a number or a plus/minus sign, then return `NaN`.
* If the first character is a number, continue parsing until a non-numeric character is found.
* The first decimal point in the string is valid, while the second one is invalid.
* Only parse in base 10, does not accept a second parameter.

```javascript
console.log(Number.parseFloat(true));            // NaN
console.log(Number.parseFloat(false));           // NaN
console.log(Number.parseFloat(null));            // NaN
console.log(Number.parseFloat(undefined));       // NaN
console.log(Number.parseFloat(NaN));             // NaN
console.log(Number.parseFloat("123"));           // 123
console.log(Number.parseFloat("  123.1"));       // 123.1
console.log(Number.parseFloat("  ab123.1"));     // NaN
console.log(Number.parseFloat(""));              // NaN
console.log(Number.parseFloat("  123.3.4eqw"));  // 123.3
console.log(Number.parseFloat("0xF"));           // 0
```

## Number()
The `Number()` constructor returns a literal value, whereas using `new Number()` returns a number object. Their conversion rules are as follows:
* If it's a Boolean value, `true` and `false` will return `1` and `0`, respectively.
* If it's a number, it will simply be passed in and returned.
* If it's `null`, it returns `0`.
* If it's `undefined`, it returns `NaN`.
* If it's a string and the string is empty, it returns zero, ignoring leading zeroes.
* If it's a string and the string is an integer, it returns the integer, ignoring leading zeroes.
* If it's a string and the string is a floating-point number, it returns a floating-point number.
* If it's a string and the string is in hexadecimal, it will be converted to decimal and returned.
* For all other formats, it returns `NaN`.
* If it's an object, it calls the object's `valueOf` method and returns the value according to the previous rules. If it returns `NaN`, then it calls `toString()` and returns the value according to the previous rules.

```javascript
console.log(Number(true));        // 1
console.log(Number(false));       // 0
console.log(Number(null));        // 0
console.log(Number(undefined));   // NaN
console.log(Number(NaN));         // NaN
console.log(Number(""));          // 0
console.log(Number("123"));       // 123
console.log(Number("  123"));     // 123
console.log(Number("123.12"));    // 123.12
console.log(Number("0xF"));       // 15
```

### Bitwise Operations
Bitwise operations perform calculations directly on binary bits. They directly manipulate each individual bit, making them very low-level operations. The advantage is their extremely fast speed, but the downside is that they are not very intuitive. Bitwise operations only work on integers. If an operand is not an integer, it will be automatically converted to an integer before the operation. In JavaScript, many times, numbers are stored in the form of a 64-bit floating-point number internally, but when performing bitwise operations, they are treated as 32-bit signed integers, and the return value is also a 32-bit signed integer.

```javascript
// ~~
console.log(~~(true));        // 1
console.log(~~(false));       // 0
console.log(~~(null));        // 0
console.log(~~(undefined));   // 0
console.log(~~(NaN));         // 0
console.log(~~(""));          // 0
console.log(~~("123"));       // 123
console.log(~~("  123"));     // 123
console.log(~~("123.12"));    // 123
console.log(~~("0xF"));       // 15
// <<
console.log(true << 0);        // 1
console.log(false << 0);       // 0
console.log(null << 0);        // 0
console.log(undefined << 0);   // 0
console.log(NaN << 0);         // 0
console.log("" << 0);          // 0
console.log("123" << 0);       // 123
console.log("  123" << 0);     // 123
console.log("123.12" << 0);    // 123
console.log("0xF" << 0);       // 15
// >>
console.log(true >> 0);        // 1
console.log(false >> 0);       // 0
console.log(null >> 0);        // 0
console.log(undefined >> 0);   // 0
console.log(NaN >> 0);         // 0
console.log("" >> 0);          // 0
console.log("123" >> 0);       // 123
console.log("  123" >> 0);     // 123
console.log("123.12" >> 0);    // 123
console.log("0xF" >> 0);       // 15
```

### Unary Operators
Unary operators can implicitly convert strings into the desired types. Unlike other parsing methods, if the operand is `NaN`, the result will also be `NaN`. The `+` operator is commonly used because it is less prone to confusion.

```javascript
console.log(+(true));        // 1
console.log(+(false));       // 0
console.log(+(null));        // 0
console.log(+(undefined));   // NaN
console.log(+(NaN));         // NaN
console.log(+(""));          // 0
console.log(+("123"));       // 123
console.log(+("  123"));     // 123
console.log(+("123.12"));    // 123
console.log(+("0xF"));       // 15
```

### Daily Quiz

```
https://github.com/WindrunnerMax/EveryDay
```

### References

```
https://www.jianshu.com/p/7962deab3cea
https://juejin.im/post/6855129005897711624
https://blog.fundebug.com/2018/07/07/string-to-number/
```