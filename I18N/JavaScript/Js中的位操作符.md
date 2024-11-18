# Bit operators in JavaScript
The number type of `JavaScript` is a double-precision `IEEE 754 64`-bit floating-point type, but in bitwise operations, bitwise operators are applied to `32`-bit numbers, and any numeric operation is converted to `32` bits, and the result is then converted to a `Js` number type.

## Description
All operands of bitwise operators are converted to two's complement signed `32`-bit integers. Conceptually, bitwise logical operators follow the following rules:
* Operands are converted into 32-bit integers, represented by bit sequences (`0` and `1`), with digits beyond `32` bits being discarded.
* Each bit of the first operand matches the corresponding bit of the second operand, with the first bit corresponding to the first bit, the second bit corresponding to the second bit, and so on.
* Bitwise operators apply to each pair of bits, resulting in new bit values.

### & Bitwise AND
For each bit, the result is `1` only if both corresponding bits of the two operands are `1`; otherwise, it's `0`. The truth table is as follows:

|a | b | a & b |
|---|---|---|
| 0 | 0 | 0 |
| 0 | 1 | 0 |
| 1 | 0 | 0 |
| 1 | 1 | 1 |

We can use the `&` operator to determine the parity of a number.

```javascript
console.log(7 & 1);    // 1
console.log(8 & 1) ;   // 0
```

### | Bitwise OR
For each bit, the result is `1` if at least one of the corresponding bits of the two operands is `1`; otherwise, it's `0`. The truth table is as follows:

|a | b | a \| b |
|---|---|---|
| 0 | 0 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 1 |

We can use the `|` operator to force the value to be an `int 32` or a `32`-bit integer type.

```javascript
console.log(11.11 | 0);      // 11
console.log("11.11" | 0);    // 11
console.log("-11.11" | 0);   // -11
console.log(1.23E2 | 0);     // 123
console.log([] | 0);         // 0
console.log(({}) | 0);       // 0
```

### ^ Bitwise XOR
For each bit, the result is `1` only if one and only one of the corresponding bits of the two operands is `1`; otherwise, it's `0`. The truth table is as follows:

|a | b | a ^ b |
|---|---|---|
| 0 | 0 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 0 |

We can use the `^` operator to swap numbers.

```javascript
let a = 7;
let b = 1;
a ^= b;
b ^= a;
a ^= b;
console.log(a);   // 1
console.log(b);   // 7

// It can also be done with an array
b = [a, a = b][0];

// And of course, destructuring assignment is even simpler
[a, b] = [b, a];
```

It can also be used to determine whether the signs of values are the same.

```javascript
let a = 1;
let b = 1;
console.log((a ^ b) >= 0);    // true
console.log((a ^ -b) >= 0);   // false
```

### ~ Bitwise NOT
For each bit, the bit is inverted, i.e., `0` becomes `1` and `1` becomes `0`. The truth table is as follows:

|a | ~ a |
|---|---|
| 0 | 1 |
| 1 | 0 |

We can use the `~` operator to force the value to be an `int 32` or a `32`-bit integer type.

```javascript
console.log(~~(11.11));      // 11
console.log(~~("11.11"));    // 11
console.log(~~("-11.11"));   // -11
console.log(~~(1.23E2));     // 123
console.log(~~([]));         // 0
console.log(~~({}));         // 0
```

### << Left Shift
Shifts the binary representation of a value to the left by `n (n < 32)` bits, filling the right with `0`.  
We can use the `<<` operator to perform integer `* 2^n` operations.

```javascript
console.log(11 << 2);         // 44
console.log(11.11 << 1);      // 22
console.log("11.11" << 1);    // 22
```

We can use the `<<` operator to force the value to be an `int 32` or a `32`-bit integer type.

```javascript
console.log(11.11 << 0);      // 11
console.log("11.11" << 0);    // 11
console.log("-11.11" << 0);   // -11
console.log(1.23E2 << 0);     // 123
console.log([] << 0);         // 0
console.log(({}) << 0);       // 0
```

### >> Signed Right Shift
Shifts the binary representation of a value to the right by `n (n < 32)` bits, discarding the bits that are shifted out.  
We can use the `<<` operator to perform integer `/ 2^n` operations.

```javascript
console.log(32 >> 2);         // 8
console.log(32.11 >> 1);      // 16
console.log("32.11" >> 1);    // 16
```

We can use the `>>` operator to force the value to be an `int 32` or a `32`-bit integer type.

```javascript
console.log(11.11 >> 0);      // 11
console.log("11.11" >> 0);    // 11
console.log("-11.11" >> 0);   // -11
console.log(1.23E2 >> 0);     // 123
console.log([] >> 0);         // 0
console.log(({}) >> 0);       // 0
```

### >>> Unsigned Right Shift
Shifts the binary representation of a value to the right by `n (n< 32)` bits, discarding the bits that are shifted out, and fills the left with `0`. Therefore, the result is always non-negative, even if zero bits are shifted to the right, so `>>>` is generally not used for negative number operations.  
We can use the `<<` operator to perform integer `/ 2^n` operations, noting that it is not used for negative number operations.

```javascript
console.log(32 >>> 2);         // 8
console.log(32.11 >>> 1);      // 16
console.log("32.11" >>> 1);    // 16
```

We can use the `>>` operator to force the value into a 32-bit integer, which is `32`, note that it is not used for negative number operations.

```javascript
console.log(11.11 >>> 0);      // 11
console.log("11.11" >>> 0);    // 11
console.log(1.23E2 >>> 0);     // 123
console.log(null >>> 0);       // 0
console.log([] >>> 0);         // 0
console.log(({}) >>> 0);       // 0
```


## Question of the Day

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://www.jianshu.com/p/6c3851ce83f7
https://www.cnblogs.com/mtl-key/p/13150674.html
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Bitwise_Operators
```