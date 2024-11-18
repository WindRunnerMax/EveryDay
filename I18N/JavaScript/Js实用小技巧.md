
# Practical Js Tips
This is a set of practical `Js` tips, it could also be considered a list of `Js` little tricks. Although the following series of operations can make the code more concise to some extent, it will reduce readability in the absence of comments. Therefore, these black magic tricks should be used with caution.

## Bitwise Operation

### Integer Round

```javascript
console.log(~~(11.11));     // 11
console.log(11.11 >> 0);    // 11
console.log(11.11 << 0);    // 11
console.log(11.11 | 0);     // 11
console.log(11.11 >>> 0);   // 11 // Be aware that >>> cannot be used for rounding negative numbers
```

### Odd or Even Judgment

```javascript
console.log(7 & 1);    // 1
console.log(8 & 1) ;   // 0
```

### Boolean Conversion

```javascript
console.log(!!7);               // true
console.log(!!0);               // false
console.log(!!-1);              // true
console.log(!!0.71);            // true
console.log(!!"");              // false
console.log(!![]);              // true
console.log(!!{});              // true
console.log(!!null);            // false
console.log(!!undefined);       // false
```

### Bitwise Shift Operation

```javascript
console.log(16 >> 1);      // 8
console.log(16 << 2);      // 64
console.log(1 >>> 1);      // 2
```

### Value Exchange

```javascript
let a = 7;
let b = 1;
a ^= b;
b ^= a;
a ^= b;
console.log(a);   // 1
console.log(b);   // 7

// It can also be done with arrays
b = [a, a = b][0];

// Of course, destructuring assignment is simpler
[a, b] = [b, a];
```

### Determine if the Signs are the Same

```javascript
let a = 1;
let b = 1;
console.log((a ^ b) >= 0);    // true
console.log((a ^ -b) >= 0);   // false
```

### Check if Numbers are Not Equal

```javascript
let a = 111;
if(a ^ 111) console.log("Not equal");
if(a !== 111) console.log("Not equal");
if(a ^ 11111) console.log("Not equal"); // Not equal
```

### Determine if it's a Power of 2

```javascript
const check = n => !(n & (n - 1));
console.log(check(7)); // false
console.log(check(8)); // true
```

### Conditional Statements

```javascript
let bool = true;
if(bool) console.log(1); // 1
console.log(bool && console.log(1)); // 1
```

### Integer Round to Nearest

```javascript
const round = n => n + 0.5 * (n > 0 ? 1 : -1) | 0;
console.log(round(0));     // 0
console.log(round(1.1));   // 1
console.log(round(1.6));   // 2
console.log(round(-1.1));  // -1
console.log(round(-1.6));  // -2
```

## Strings

### Generate Random Strings

```javascript
console.log(Math.random().toString(16).slice(2)); // c21f331e6ce2b
```

### Repeat Strings

```javascript
const repeat = (n, str) => Array(n+1).join(str);
console.log(repeat(5, "ab")); // ababababab
console.log("ab".repeat(5));  // ababababab // ES6
```

### Create Links

```javascript
console.log("Google".link("www.google.com")); // <a href="www.google.com">Google</a>
```

## Miscellaneous

### Properly Handle Exceptions

```javascript
try {
    // something
} catch (e) {
    window.location.href = "http://stackoverflow.com/search?q=[js]+" +  e.message;
}
```

### Elegant Way to Prove Your Excellence

```javascript
console.log(([][[]]+[])[+!![]]+([]+{})[!+[]+!![]]);
```

### Operations that can substitute undefined

```javascript
console.log(void 0);   // undefined
console.log(""._);     // undefined
console.log(1.._);     // undefined
console.log(0[0]);     // undefined
```

### Substitute for Infinity

```javascript
console.log([-1/0, 1/0]); // [-Infinity, Infinity]
```

### Clear an Array

```javascript
let arr = [1];
arr.length = 0;
console.log(arr); // []
```

### Quickly Determine if it's a browser below IE8

```javascript
var isIE8 = !+"1";
console.log(isIE8); // false // Chrome 87
```


## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://zhuanlan.zhihu.com/p/150556186
https://zhuanlan.zhihu.com/p/262533240
https://github.com/jed/140bytes/wiki/Byte-saving-techniques
```