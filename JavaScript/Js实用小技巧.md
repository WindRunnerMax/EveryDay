# Js实用小技巧
这是一份`Js`实用小技巧，也可以是一份`Js`挨打小技巧，下面的一系列操作虽然能够在一定程度上使代码更加简洁，但是在缺少注释的情况下会降低可读性，所以需要谨慎使用这些黑魔法。


## 位元算

### 取整

```javascript
console.log(~~(11.11));     // 11
console.log(11.11 >> 0);    // 11
console.log(11.11 << 0);    // 11
console.log(11.11 | 0);     // 11
console.log(11.11 >>> 0);   // 11 // 注意 >>> 不可对负数取整
```

### 判断奇偶

```javascript
console.log(7 & 1);    // 1
console.log(8 & 1) ;   // 0
```

### 转换布尔值

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

### 移位运算

```javascript
console.log(16 >> 1);      // 8
console.log(16 << 2);      // 64
console.log(1 >>> 1);      // 2

```

### 进行值交换

```javascript
let a = 7;
let b = 1;
a ^= b;
b ^= a;
a ^= b;
console.log(a);   // 1
console.log(b);   // 7

// 也可以借助数组
b = [a, a = b][0];

// 当然解构赋值更简单
[a, b] = [b, a];
```

### 判断符号是否相同

```javascript
let a = 1;
let b = 1;
console.log((a ^ b) >= 0);    // true
console.log((a ^ -b) >= 0);   // false
```

### 检查数字是否不相等

```javascript
let a = 111;
if(a ^ 111) console.log("Not equal");
if(a !== 111) console.log("Not equal");
if(a ^ 11111) console.log("Not equal"); // Not equal
```

### 判断是否2的整数幂

```javascript
const check = n => !(n & (n - 1));
console.log(check(7)); // false
console.log(check(8)); // true
```

### 条件语句

```javascript
let bool = true;
if(bool) console.log(1); // 1
console.log(bool && console.log(1)); // 1
```

### 四舍五入取整

```javascript
const round = n => n + 0.5 * (n > 0 ? 1 : -1) | 0;
console.log(round(0));     // 0
console.log(round(1.1));   // 1
console.log(round(1.6));   // 2
console.log(round(-1.1));  // -1
console.log(round(-1.6));  // -2
```

## 字符串

### 取随机字符串

```javascript
console.log(Math.random().toString(16).slice(2)); // c21f331e6ce2b
```

### 重复字符串

```javascript
const repeat = (n, str) => Array(n+1).join(str);
console.log(repeat(5, "ab")); // ababababab
console.log("ab".repeat(5));  // ababababab // ES6
```

### 创建链接

```javascript
console.log("Google".link("www.google.com")); // <a href="www.google.com">Google</a>
```

## 其他

### 正确处理异常的方法

```javascript
try {
    // something
} catch (e) {
    window.location.href = "http://stackoverflow.com/search?q=[js]+" +  e.message;
}
```

### 优雅地证明自己NB

```javascript
console.log(([][[]]+[])[+!![]]+([]+{})[!+[]+!![]]);
```

### 可以替代undefined的操作

```javascript
console.log(void 0);   // undefined
console.log(""._);     // undefined
console.log(1.._);     // undefined
console.log(0[0]);     // undefined
```

### 替代Infinity

```javascript
console.log([-1/0, 1/0]); // [-Infinity, Infinity]
```

### 清空数组

```javascript
let arr = [1];
arr.length = 0;
console.log(arr); // []
```

### 快速判断IE8以下的浏览器

```javascript
var isIE8 = !+"1";
console.log(isIE8); // false // Chrome 87
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://zhuanlan.zhihu.com/p/150556186
https://zhuanlan.zhihu.com/p/262533240
https://github.com/jed/140bytes/wiki/Byte-saving-techniques
```

