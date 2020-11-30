# Js中的逻辑运算符
`JavaScript`中有三个逻辑运算符，`&&`与、`||`或、`!`非，虽然他们被称为逻辑运算符，但这些运算符却可以被应用于任意类型的值而不仅仅是布尔值，他们的结果也同样可以是任意类型。

## 描述
如果一个值可以被转换为`true`，那么这个值就是所谓的`truthy`，如果可以被转换为`false`，那么这个值就是所谓的`falsy`。会被转换为`false`的表达式有: `null`、`NaN`、`0`、空字符串、`undefined`。  
尽管`&&`和`||`运算符能够使用非布尔值的操作数，但它们依然可以被看作是布尔操作符，因为它们的返回值总是能够被转换为布尔值，如果要显式地将它们的返回值或者表达式转换为布尔值，可以使用双重非运算符即`!!`或者`Boolean`构造函数。
* `&&`: `AND`，逻辑与，`expr1 && expr2`，若`expr1`可转换为`true`则返回`expr2`，否则返回`expr1`。
* `||`: `OR`，逻辑或，`expr1 || expr2`，若`expr1`可转换为`true`则返回`expr1`，否则返回`expr2`。
* `!`: `NOT`，逻辑非，`!expr`，若`expr`可转换为`true`则返回`false`，否则返回`true`。

### 短路计算
由于逻辑表达式的运算顺序是从左到右，是适用于短路计算的规则的，短路意味着下面表达式中的`expr`部分不会被执行，因此`expr`的任何副作用都不会生效。造成这种现象的原因是，整个表达式的值在第一个操作数被计算后已经确定了。
* `(some falsy expression) && (expr)`短路计算的结果为假。
* `(some truthy expression) || (expr)`短路计算的结果为真。

## 逻辑与&&

### 示例

```javascript
console.log(true  && true);        // true
console.log(true  && false);       // false
console.log(false && true);        // false
console.log(false && (3 === 4));   // false
console.log("Cat" && "Dog");       // "Dog"
console.log(false && "Cat");       // false
console.log("Cat" && false);       // false
console.log(""    && false);       // ""
console.log(false && "");          // false
```

### 寻找第一个falsy的值
`&&`逻辑与运算符的一个很重要的用法就是寻找第一个`falsy`的值，并利用短路运算可以避免一些异常。

```javascript
// 寻找第一个falsy的值
var val0 = 0, val1 = 1, val2 = 2;
var result = val1 && val2 && val0;
console.log(result); // 0

// 配合短路运算
var f0 = () => {
    console.log("Call f0");
    return 0;
}
var f1 = () => {
    console.log("Call f1");
    return 1;
}
var f2 = () => {
    console.log("Call f2");
    return 2;
}
var result = f1() && f0() && f2(); // Call f1 // Call f0 // f2未被调用
console.log(result); // 0

// 避免一些异常
var obj = {f: void 0}
// obj.f(); // Uncaught TypeError: obj.f is not a function
obj && obj.f && obj.f(); // 未抛出异常 // 当有一段链式调用时这很有用
obj?.f?.(); //当然使用ES2020的?.操作符也可以
```

## 逻辑或||

### 示例

```javascript
console.log(true || true);         // true
console.log(false || true);        // true
console.log(true || false);        // true
console.log(false || (3 === 4));   // false
console.log("Cat" || "Dog");       // "Cat"
console.log(false || "Cat");       // "Cat"
console.log("Cat" || false);       // "Cat"
console.log("" || false);          // false
console.log(false || "");          // ""
```

### 寻找第一个truthy的值
`||`逻辑或运算符的一个很重要的用法就是寻找第一个`truthy`的值，这个操作的使用频率非常高，通常用来赋值默认值。

```javascript
// 寻找第一个truthy的值
var val0 = 0, val1 = 1, val2 = 2;
var result = val0 || val1 || val2;
console.log(result); // 1

// 设定默认值
var v1 = void 0;
var result = val0 || 1;
console.log(result); // 1
```

## 逻辑非!

### 示例

```javascript
console.log(!true);    // false
console.log(!false);   // true
console.log(!"");      // true
console.log(!"Cat");   // false
```

### 强制转换类型
使用双重非运算符能够显式地将任意值强制转换为其对应的布尔值，这种转换是基于被转换值的`truthyness`和`falsyness`的。

```javascript
console.log(!!true);                   // true
console.log(!!{});                     // true // 任何对象都是truthy的
console.log(!!(new Boolean(false)));   // true // 此为对象而不是字面量
console.log(!!false);                  // false
console.log(!!"");                     // false
console.log(!!Boolean(false));         // false // 调用构造函数生成字面量
```



## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://juejin.cn/post/6844903991139123208
https://www.cnblogs.com/yf2196717/p/10867864.html
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Logical_Operators
```

