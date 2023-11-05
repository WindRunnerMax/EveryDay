# Js将字符串转数字的方式
`Js`字符串转换数字方方式主要有三类：转换函数、强制类型转换、弱类型隐式类型转换，利用这三类转换的方式可以有`5`种转换的方法。

## parseInt()
`parseInt()`和`Number.parseInt()`是最常用的转换字符串为整数数值的方法，其中`Number.parseInt()`是`ES6`之后为了减少全局方法的定义才增加的静态方法，实质与全局方法`parseInt()`相同，他们的规则如下：
* 忽略字符串前面的空格，直至找到第一个非空字符。
* 如果第一个非空字符不是数字或者是正负号则返回`NaN`。
* 如果第一个是数字字符一直解析到一个非数字字符。
* 如果第一个是数字字符，能识别出各种整数格式。
* 接受第二个参数，即转换时使用的基数。
* 小数向下取整。

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
`parseFloat()`和`Number.parseFloat()`是最常用的转换字符串为浮点数数值的方法，其中`Number.parseFloat()`是`ES6`之后为了减少全局方法的定义才增加的静态方法，实质与全局方法`parseFloat()`相同，他们的转换规则如下：
* 忽略字符串前面的空格，直至找到第一个非空字符。
* 如果第一个非空字符不是数字或者是正负号则返回`NaN`。
* 如果第一个是数字字符一直解析到一个非数字字符。
* 字符串中第一个小数点是有效的第二个小数点是无效的。
* 只解析`10`进制，不接受第二个参数。

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
`Number()`构造函数会返回一个字面量值，而使用`new Number()`则会返回一个数字对象，他们的转换规则如下：
* 如果是`Boolean`值，`true`和`false`分别返回`1`或`0`。
* 如果是数字，只是单纯的传入和返回。
* 如果是`null`，则返回`0`。
* 如果是`undefined`返回`NaN`。
* 如果是字符串且字符串为空则返回零，忽略前导零。
* 如果是字符串且字符串为整数则返回整数，忽略前导零。
* 如果是字符串且字符串为浮点数则返回浮点数。
* 如果是字符串且字符串为`16`进制，转为`10`进制返回。
* 除以上格式返回`NaN`。
* 如果是对象，则调用对象的`valueOf`，按照前面的规则返回值，如果返回`NaN`，再调用`toString()`，按照前面的规则返回值。

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

## 位运算
位运算是直接对二进制位进行计算，它直接处理每一个比特位，是非常底层的运算，好处是速度极快，缺点是很不直观。位运算只对整数起作用，如果一个运算数不是整数，会自动转为整数后再运行。在`JavaScript`内部，很多时候数值都是以`64`位浮点数的形式储存，但是做位运算的时候，是以`32`位带符号的整数进行运算的，并且返回值也是一个`32`位带符号的整数。

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

## 一元运算符
一元运算符可以将字符串进行隐式的类型转换，与其它的解析方式不同，如果是一个`NaN`值，那么返回的也是`NaN`，通常使用`+`操作符，因为这个方式不容易混淆。

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


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.jianshu.com/p/7962deab3cea
https://juejin.im/post/6855129005897711624
https://blog.fundebug.com/2018/07/07/string-to-number/
```