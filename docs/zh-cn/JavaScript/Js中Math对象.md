# Js中Math对象
`Math`是一个内置对象，它拥有一些数学常数属性和数学函数方法，`Math`用于`Number`类型，其不支持`BigInt`。

## 概述
`Math`不是一个函数对象，也就是说`Math`不是一个构造器，`Math`的所有属性与方法都是静态的，例如引用圆周率的写法是`Math.PI`，`Math`的常量是使用`JavaScript`中的全精度浮点数来定义的，需要注意的是，很多`Math`的函数都有一个精度，而且这个精度在不同实现中也是不相同的，这意味着不同的浏览器会给出不同的结果，甚至在不同的系统或架构下，相同的`Js`引擎也会给出不同的结果，另外三角函数`sin()`、`cos()`、`tan()`、`asin()`、`acos()`、`atan()`和`atan2()`返回的值是弧度而非角度。若要转换，弧度除以`Math.PI / 180`即可转换为角度，同理角度乘以这个数则能转换为弧度。

```javascript
console.log(Math.PI); // 3.141592653589793
console.log(Math.abs(-1)); // 1
console.log(Math.pow(2, 3)); // 8
```

## 属性
* `Math.E`: 欧拉常数，也是自然对数的底数，约等于`2.718`。
* `Math.LN2`: `2`的自然对数，约等于`0.693`。
* `Math.LN10`: `10`的自然对数，约等于`2.303`。
* `Math.LOG2E`: 以`2`为底的`E`的对数，约等于`1.443`。
* `Math.LOG10E`: 以`10`为底的`E`的对数，约等于`0.434`。
* `Math.PI`: 圆周率，一个圆的周长和直径之比，约等于`3.14159`。
* `Math.SQRT1_2`: `½`的平方根，同时也是`2`的平方根的倒数，约等于`0.707`。
* `Math.SQRT2`: `2`的平方根，约等于`1.414`。

## 方法

### Math.abs()
`Math.abs(x)`  
`Math.abs(x)`函数返回指定数字`x`的绝对值。

```javascript
console.log(Math.abs(-1)); // 1
```

### Math.acos()
`Math.acos(x)`  
`Math.acos()`返回一个数的反余弦值。  
`∀x∊[-1;1], Math.acos(x) = arccos(x) = the unique y∊[0;π] such that cos(y) = x`

```javascript
console.log(Math.acos(-1)); // 3.141592653589793
```

### Math.acosh()
`Math.acosh(x)`  
`Math.acosh()`函数返回一个数的反双曲余弦值。  
`∀x≥1, Math.acosh(x) = arcosh(x) = the unique y≥0 such that cosh(y) = x`

```javascript
console.log(Math.acosh(1)); // 0
```

### Math.asin()
`Math.asin(x)`  
`Math.asin()`方法返回一个数值的反正弦。  
`∀x∊[-1;1], Math.asin(x) = arcsin(x) = the unique y∊[- π/2 ; π/2 ] such that sin(y) = x`

```javascript
console.log(Math.asin(0)); // 0
```

### Math.asinh()
`Math.asinh(x)`  
`Math.asinh()`返回一个数值的反双曲正弦值。  
`Math.asinh(x) = arsinh(x) = the unique y such that sinh(y) = x`

```javascript
console.log(Math.asinh(0)); // 0
```

### Math.atan()
`Math.atan(x)`  
`Math.atan()`函数返回一个数值的反正切。  
`Math.atan(x) = arctan(x) = the unique y∊[- π/2 ; π/2 ] such that tan(y) = x`

```javascript
console.log(Math.atan(0)); // 0
```

### Math.atanh()
`Math.atanh(x)`  
`Math.atanh()`函数返回一个数值反双曲正切值。
`∀x∊(-1,1), Math.atanh(x) = arctanh(x) = the unique y such that tanh(y) = x`

```javascript
console.log(Math.atanh(0)); // 0
```

### Math.atan2()
`Math.atan2(y, x)`  
`Math.atan2()`返回从原点`(0,0)`到`(x,y)`点的线段与x轴正方向之间的平面角度(弧度值)，也就是`Math.atan2(y,x)`。

```javascript
console.log(Math.atan2(15, 90)); // 0.16514867741462683
```

### Math.cbrt()
`Math.cbrt(x)`  
`Math.cbrt()`函数返回任意数字的立方根。

```javascript
console.log(Math.cbrt(27)); // 3
```

### Math.ceil()
`Math.ceil(x)`  
`Math.ceil()`函数返回大于或等于一个给定数字的最小整数，即向上取整。

```javascript
console.log(Math.ceil(6.6)); // 7
```

### Math.clz32()
`Math.clz32(x)`  
`Math.clz32()`函数返回一个数字在转换成`32`无符号整形数字的二进制形式后,开头的`0`的个数, 比如`1000000`转换成`32`位无符号整形数字的二进制形式后是`00000000000011110100001001000000`，开头的`0`的个数是`12`个，则`Math.clz32(1000000)`返回`12`。

```javascript
console.log(Math.clz32(10)); // 28
```

### Math.cos()
`Math.cos(x)`  
`Math.cos()`函数返回一个数值的余弦值。  

```javascript
console.log(Math.clz32(10)); // 28
```

### Math.cosh()
`Math.cosh(x)`  
`Math.cosh()`函数返回数值的双曲余弦函数。

```javascript
console.log(Math.cosh(0)); // 1
```

### Math.exp()
`Math.exp(x)`  
`Math.exp()`函数返回`e^x`，`x`表示参数，`e`是自然对数的底数约`2.718281828459045`。

```javascript
console.log(Math.exp(2)); // 7.38905609893065
```

### Math.expm1()
`Math.expm1(x)`  
`Math.exp()`函数返回`e^x -1 `，`x`表示参数，`e`是自然对数的底数约`2.718281828459045`。

```javascript
console.log(Math.expm1(2)); // 6.38905609893065
```

### Math.floor()
`Math.floor()`返回小于或等于一个给定数字的最大整数，即向下取整。

```javascript
console.log(Math.floor(6.6)); // 6
```

### Math.fround()
`Math.fround(doubleFloat)`  
`Math.fround()`可以将任意的数字转换为离它最近的单精度浮点数形式的数字。`JavaScript`内部使用`64`位的双浮点数字，支持很高的精度。但是有时需要用`32`位浮点数字，比如从一个`Float32Array`读取值时，这时会产生混乱，检查一个`64`位浮点数和一个`32`位浮点数是否相等会失败，即使二个数字几乎一模一样，要解决这个问题，可以使用`Math.fround()`来将`64`位的浮点数转换为`32`位浮点数，在内部`JavaScript`继续把这个数字作为`64`位浮点数看待，仅仅是在尾数部分的第`23`位执行了舍入到偶的操作，并将后续的尾数位设置为`0`，如果数字超出`32`位浮点数的范围，则返回`Infinity`或`-Infinity`。

```javascript
// 数字1.5可以在二进制数字系统中精确表示，32位和64位的值相同
console.log(Math.fround(1.5) === 1.5); // true
// 数字6.6却无法在二进制数字系统中精确表示，所以32位和64位的值是不同的
console.log(Math.fround(6.6) === 6.6); // false
// 在某些精度不高的场合下，可以通过将二个浮点数转换成32位浮点数进行比较，以解决64位浮点数比较结果不正确的问题
console.log(0.1 + 0.2 === 0.3);  //false
var equal = (v1, v2) =>  Math.fround(v1) === Math.fround(v2);
console.log(equal(0.1 + 0.2, 0.3)); // true
```

### Math.hypot()
`Math.hypot([value1[,value2, ...]])`  
`Math.hypot()`函数返回所有参数的平方和的平方根。本函数比`Math.sqrt()`更简单也更快，只需要调用`Math.hypot(v1, v2)`或`Math.hypot(v1, v2, v3, v4, ...)`，其还避免了幅值过大的问题，`Js`中最大的双精度浮点数是`Number.MAX_VALUE = 1.797...e+308`，如果计算的数字比约`1e154`大，计算其平方值会返回`Infinity`，使计算的的结果出现问题。

```javascript
console.log(Math.hypot(3, 4)); // 5
```

### Math.imul()
`Math.imul(a, b)`  
`Math.imul()`函数将两个参数分别转换为`32`位整数，相乘后返回`32`位结果，类似`C`语言的`32`位整数相乘。

```javascript
console.log(Math.imul(0xffffffff, 1)); // -1
```

### Math.log()
`Math.log(x)`  
`Math.log()`函数返回一个数的自然对数。  
`∀x>0, Math.log(x) = ln(x) = the unique y such that e^y = x`

```javascript
console.log(Math.log(Math.E)); // 1
```

### Math.log10()
`Math.log10(x)`  
`Math.log10()`函数返回一个数字以`10`为底的对数。

```javascript
console.log(Math.log10(100)); // 2
```

### Math.log1p()
`Math.log1p(x)`  
`Math.log1p()`函数返回一个数字加`1`后的自然对数, 既`log(x+1)`。

```javascript
console.log(Math.log1p(Math.E-1)); // 1
```
### Math.log2()
`Math.log2(x)`   
`Math.log2()`函数返回一个数字以`2`为底的对数。

```javascript
console.log(Math.log2(8)); // 3
```

### Math.max()
`Math.max(value1[,value2, ...])`  
`Math.max()`函数返回一组数中的最大值。

```javascript
console.log(Math.max(1, 2, 3)); // 3

// 在数组中应用
console.log(Math.max.apply(null, [1, 2, 3])); // 3 // 利用了apply的传参特性
console.log(Math.max(...[1, 2, 3])); // 3 // 利用了 ES6 Spread 操作符
```

### Math.min()
`Math.min([value1[,value2, ...]])`   
`Math.min()`返回零个或更多个数值的最小值。

```javascript
console.log(Math.min(1, 2, 3)); // 1

// 在数组中应用
console.log(Math.min.apply(null, [1, 2, 3])); // 1 // 利用了apply的传参特性
console.log(Math.min(...[1, 2, 3])); // 1 // 利用了 ES6 Spread 操作符
```

### Math.pow()
`Math.pow(base, exponent)`  
`Math.pow()`函数返回基数`base`的指数`exponent`次幂，即`base^exponent`。

```javascript
console.log(Math.pow(2, 3)); // 8
```

### Math.random()
`Math.random()`  
`Math.random()`函数返回一个浮点数，伪随机数在范围从`0`到小于`1`，也就是说从`0`(包括`0`)往上，但是不包括`1`，然后可以缩放到所需的范围，实现将初始种子选择到随机数生成算法，其不能被用户选择或重置。

```javascript
console.log(Math.random()); // 0.20022678953392647

function randomInt(min=0, max=1) { // 生成随机整数
    return min + ~~((max-min)*Math.random()); // min <= random < max 
}
randomInt(1, 9); // 5
```

### Math.round()
`Math.round(x)`  
`Math.round()`函数返回一个数字四舍五入后最接近的整数。

```javascript
console.log(Math.round(0.5)); // 1
```

### Math.sign()
`Math.sign(x)`  
`Math.sign()`函数返回一个数字的符号, 指示数字是正数，负数还是零。此函数共有`5`种返回值, 分别是`1, -1, 0, -0, NaN`代表的各是正数，负数，正零，负零，`NaN`。

```javascript
console.log(Math.sign(0.5)); // 1
```

### Math.sin()
`Math.sin(x)`  
`Math.sin()`函数返回一个数值的正弦值。

```javascript
console.log(Math.sin(Math.PI / 2)); // 1
```

### Math.sinh()
`Math.sinh(x)`  
`Math.sinh()`函数返回一个数字的双曲正弦值。

```javascript
console.log(Math.sinh(0)); // 0
```

### Math.sqrt()
`Math.sqrt(x)`  
`Math.sqrt()`函数返回一个数的平方根。  
`∀x≥0, Math.sqrt(x) = x = the unique y≥0 such that y^2 = x`

```javascript
console.log(Math.sqrt(9)); // 3
```

### Math.tan()
`Math.tan(x)`  
`Math.tan()`方法返回一个数值的正切值。

```javascript
console.log(Math.tan(0)); // 0
```

### Math.tanh()
`Math.tanh(x)`  
`Math.tanh()`函数将会返回一个数的双曲正切函数值。

```javascript
console.log(Math.tanh(0)); // 0
```

### Math.trunc()
`Math.trunc(value)`  
`Math.trunc()`方法会将数字的小数部分去掉，只保留整数部分。

```javascript
console.log(Math.trunc(1.1)); // 1
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Math
```
