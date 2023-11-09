# Math Object in JavaScript

The `Math` object is a built-in object that has some mathematical constants and mathematical function methods. The `Math` object is used with the `Number` type and does not support `BigInt`.

## Description
`Math` is not a function object, meaning it's not a constructor. All properties and methods of `Math` are static. For example, the way to reference the constant representing the mathematical constant pi is `Math.PI`. The constants of `Math` are defined using full-precision floating point numbers in JavaScript. It should be noted that many of the functions in `Math` have a precision, and this precision is also different in different implementations. This means that different browsers will produce different results, and even the same `Js` engine may produce different results on different systems or architectures. Furthermore, the values returned by trigonometric functions `sin()`, `cos()`, `tan()`, `asin()`, `acos()`, `atan()`, and `atan2()` are in radians, not degrees. To convert, radians can be divided by `Math.PI / 180` to convert to degrees, and multiplying degrees by this number will convert them to radians.

```javascript
console.log(Math.PI); // 3.141592653589793
console.log(Math.abs(-1)); // 1
console.log(Math.pow(2, 3)); // 8
```

## Properties
* `Math.E`: Euler's constant, also known as the base of natural logarithms, approximately equal to `2.718`.
* `Math.LN2`: Natural logarithm of `2`, approximately equal to `0.693`.
* `Math.LN10`: Natural logarithm of `10`, approximately equal to `2.303`.
* `Math.LOG2E`: Logarithm of `E` to base `2`, approximately equal to `1.443`.
* `Math.LOG10E`: Logarithm of `E` to base `10`, approximately equal to `0.434`.
* `Math.PI`: The mathematical constant pi, approximately equal to `3.14159`, represents the ratio of the circumference of a circle to its diameter.
* `Math.SQRT1_2`: Square root of `½`, also the reciprocal of the square root of `2`, approximately equal to `0.707`.
* `Math.SQRT2`: Square root of `2`, approximately equal to `1.414`.

## Methods

### Math.abs()
`Math.abs(x)`  
The `Math.abs(x)` function returns the absolute value of the specified number `x`.

```javascript
console.log(Math.abs(-1)); // 1
```

### Math.acos()
`Math.acos(x)`  
`Math.acos()` returns the arccosine of a number.  
`∀x∊[-1;1], Math.acos(x) = arccos(x) = the unique y∊[0;π] such that cos(y) = x`

```javascript
console.log(Math.acos(-1)); // 3.141592653589793
```

### Math.acosh()
`Math.acosh(x)`  
`Math.acosh()` returns the hyperbolic arccosine of a number.  
`∀x≥1, Math.acosh(x) = arcosh(x) = the unique y≥0 such that cosh(y) = x`

```javascript
console.log(Math.acosh(1)); // 0
```

### Math.asin()
`Math.asin(x)`  
`Math.asin()` returns the arcsine of a number.  
`∀x∊[-1;1], Math.asin(x) = arcsin(x) = the unique y∊[- π/2 ; π/2 ] such that sin(y) = x`

```javascript
console.log(Math.asin(0)); // 0
```

### Math.asinh()
`Math.asinh(x)`  
`Math.asinh()` returns the hyperbolic arcsine of a number.  
`Math.asinh(x) = arsinh(x) = the unique y such that sinh(y) = x`

```javascript
console.log(Math.asinh(0)); // 0
```

### Math.atan()
`Math.atan(x)`  
`Math.atan()` returns the arctangent of a number.  
`Math.atan(x) = arctan(x) = the unique y∊[- π/2 ; π/2 ] such that tan(y) = x`

```javascript
console.log(Math.atan(0)); // 0
```

### Math.atanh()
`Math.atanh(x)`  
`Math.atanh()` returns the hyperbolic arctangent of a number.  
`∀x∊(-1,1), Math.atanh(x) = arctanh(x) = the unique y such that tanh(y) = x`

```javascript
console.log(Math.atanh(0)); // 0
```

### Math.atan2()
`Math.atan2(y, x)`  
`Math.atan2()` returns the angle (in radians) from the `x`-axis to a point `(x, y)` in the plane. It's the equivalent of `Math.atan2(y,x)`.

```javascript
console.log(Math.atan2(15, 90)); // 0.16514867741462683
```

### Math.cbrt()
`Math.cbrt(x)`  
`Math.cbrt()` returns the cube root of a number.

```javascript
console.log(Math.cbrt(27)); // 3
```

### Math.ceil()
`Math.ceil(x)`  
`Math.ceil()` returns the smallest integer greater than or equal to a given number, in other words, it rounds up.

```javascript
console.log(Math.ceil(6.6)); // 7
```

### Math.clz32()
`Math.clz32(x)`  
`Math.clz32()` returns the number of leading zero bits in the 32-bit binary representation of a number. For example, `1000000` in its 32-bit unsigned integer binary form is `00000000000011110100001001000000`, which has `12` leading zero bits, therefore `Math.clz32(1000000)` returns `12`.

```javascript
console.log(Math.clz32(10)); // 28
```

### Math.cos()
`Math.cos(x)`  
`Math.cos()` returns the cosine of a number.

```javascript
console.log(Math.clz32(10)); // 28
```

```markdown
### Math.cosh()
`Math.cosh(x)`   
The `Math.cosh()` function returns the hyperbolic cosine of a number.

```javascript
console.log(Math.cosh(0)); // 1
```

### Math.exp()
`Math.exp(x)`   
The `Math.exp()` function returns `e^x`, where `x` is the parameter and `e` is the base of the natural logarithms, approximately `2.718281828459045`.

```javascript
console.log(Math.exp(2)); // 7.38905609893065
```

### Math.expm1()
`Math.expm1(x)`  
The `Math.expm1()` function returns `e^x -1`, where `x` is the parameter and `e` is the base of the natural logarithms, approximately `2.718281828459045`.

```javascript
console.log(Math.expm1(2)); // 6.38905609893065
```

### Math.floor()
`Math.floor()` returns the largest integer less than or equal to a given number, i.e., it performs the floor operation.

```javascript
console.log(Math.floor(6.6)); // 6
```

### Math.fround()
`Math.fround(doubleFloat)`  
The `Math.fround()` function can convert any number to the nearest single precision floating point number. JavaScript internally uses `64`-bit double-precision numbers, which support high precision. However, there are situations when a `32`-bit floating point number is needed, such as when reading values from a `Float32Array`, which can lead to confusion. When comparing a `64`-bit floating point number and a `32`-bit floating point number, even if the two numbers are almost identical, the comparison fails. To solve this problem, `Math.fround()` can be used to convert a `64`-bit floating point number to a `32`-bit floating point number, internally in JavaScript, the number is still treated as a `64`-bit floating point number, but only the 23rd bit of the significand is rounded to even and the subsequent bits are set to `0`. If the number exceeds the range of a `32`-bit floating point number, it will return `Infinity` or `-Infinity`.

```javascript
// The number 1.5 can be accurately represented in the binary numbering system, so the values of the 32-bit and 64-bit versions are the same
console.log(Math.fround(1.5) === 1.5); // true
// However, the number 6.6 cannot be accurately represented in the binary numbering system, so the values of the 32-bit and 64-bit versions are different
console.log(Math.fround(6.6) === 6.6); // false
// In some cases with low precision, comparing two floating point numbers by converting them to 32-bit floating point numbers can solve the problem of incorrect results when comparing 64-bit floating point numbers
console.log(0.1 + 0.2 === 0.3);  //false
var equal = (v1, v2) =>  Math.fround(v1) === Math.fround(v2);
console.log(equal(0.1 + 0.2, 0.3)); // true
```

### Math.hypot()
`Math.hypot([value1[,value2, ...]])`  
The `Math.hypot()` function returns the square root of the sum of the squares of its arguments. This function is simpler and faster than `Math.sqrt()` as it only requires calling `Math.hypot(v1, v2)` or `Math.hypot(v1, v2, v3, v4, ...)`. It also avoids problems with excessively large magnitudes. In JavaScript, the largest double-precision floating point number is `Number.MAX_VALUE = 1.797...e+308`. If a calculated number is greater than approximately `1e154`, squaring it will result in `Infinity` and cause issues with the calculation's results.

```javascript
console.log(Math.hypot(3, 4)); // 5
```

### Math.imul()
`Math.imul(a, b)`  
The `Math.imul()` function converts two parameters to 32-bit integers, multiplies them together, and returns a 32-bit result, similar to the way 32-bit integers are multiplied in the C language.

```javascript
console.log(Math.imul(0xffffffff, 1)); // -1
```

### Math.log()
`Math.log(x)`  
The `Math.log()` function returns the natural logarithm of a number.  
`∀x>0, Math.log(x) = ln(x) = the unique y such that e^y = x`

```javascript
console.log(Math.log(Math.E)); // 1
```

### Math.log10()
`Math.log10(x)`  
The `Math.log10()` function returns the base `10` logarithm of a number.

```javascript
console.log(Math.log10(100)); // 2
```

### Math.log1p()
`Math.log1p(x)`  
The `Math.log1p()` function returns the natural logarithm of a number plus `1`, in other words, `log(x+1)`.

```javascript
console.log(Math.log1p(Math.E-1)); // 1
```
### Math.log2()
`Math.log2(x)`  
The `Math.log2()` function returns the base `2` logarithm of a number.

```javascript
console.log(Math.log2(8)); // 3
```

### Math.max()
`Math.max(value1[,value2, ...])`  
The `Math.max()` function returns the largest of a set of numbers.

```javascript
console.log(Math.max(1, 2, 3)); // 3

// Application in an array
console.log(Math.max.apply(null, [1, 2, 3])); // 3 // Utilizing the apply method for argument passing
console.log(Math.max(...[1, 2, 3])); // 3 // Utilizing the ES6 spread operator
```

### Math.min()
`Math.min([value1[,value2, ...]])`  
`Math.min()` returns the smallest of zero or more numbers.

```javascript
console.log(Math.min(1, 2, 3)); // 1

// Application in an array
console.log(Math.min.apply(null, [1, 2, 3])); // 1 // Utilizing the apply method for argument passing
console.log(Math.min(...[1, 2, 3])); // 1 // Utilizing the ES6 spread operator
```


### Math.pow()
`Math.pow(base, exponent)`  
The `Math.pow()` function returns the base raised to the exponent power, that is, `base^exponent`.

```javascript
console.log(Math.pow(2, 3)); // 8
```

### Math.random()
`Math.random()`  
The `Math.random()` function returns a floating-point, pseudo-random number between `0` (inclusive) and `1` (exclusive), meaning it can return any value from 0 up to but not including 1. It can be scaled to the desired range, allowing the initial seed for the random number generation algorithm to be chosen and the algorithm cannot be reset or chosen by the user.

```javascript
console.log(Math.random()); // 0.20022678953392647

function randomInt(min=0, max=1) { // Generate random integers
    return min + ~~((max-min)*Math.random()); // min <= random < max 
}
randomInt(1, 9); // 5
```

### Math.round()
`Math.round(x)`  
The `Math.round()` function returns the value of a number rounded to the nearest integer.

```javascript
console.log(Math.round(0.5)); // 1
```

### Math.sign()
`Math.sign(x)`  
The `Math.sign()` function returns the sign of a number, indicating whether the number is positive, negative, or zero. This function has five possible return values: `1, -1, 0, -0, NaN`, representing positive, negative, positive zero, negative zero, and `NaN` respectively.

```javascript
console.log(Math.sign(0.5)); // 1
```

### Math.sin()
`Math.sin(x)`  
The `Math.sin()` function returns the sine of a number.

```javascript
console.log(Math.sin(Math.PI / 2)); // 1
```

### Math.sinh()
`Math.sinh(x)`  
The `Math.sinh()` function returns the hyperbolic sine of a number.

```javascript
console.log(Math.sinh(0)); // 0
```

### Math.sqrt()
`Math.sqrt(x)`  
The `Math.sqrt()` function returns the square root of a number.  
`∀x≥0, Math.sqrt(x) = x = the unique y≥0 such that y^2 = x`

```javascript
console.log(Math.sqrt(9)); // 3
```

### Math.tan()
`Math.tan(x)`  
The `Math.tan()` method returns the tangent of a number.

```javascript
console.log(Math.tan(0)); // 0
```

### Math.tanh()
`Math.tanh(x)`  
The `Math.tanh()` function will return the hyperbolic tangent of a number.

```javascript
console.log(Math.tanh(0)); // 0
```

### Math.trunc()
`Math.trunc(value)`  
The `Math.trunc()` method will remove the decimal part of a number, leaving only the integer part.

```javascript
console.log(Math.trunc(1.1)); // 1
```

## Daily Challenge

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Math
```