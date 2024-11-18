# Logical Operators in JavaScript

There are three logical operators in `JavaScript`: `&&` (and), `||` (or), and `!` (not). Although they are called logical operators, these operators can be applied to any type of value, not just boolean values, and their results can also be of any type.

## Description
If a value can be converted to `true`, then it is called `truthy`; if it can be converted to `false`, then it is called `falsy`. Expressions that will be converted to `false` include: `null`, `NaN`, `0`, empty string, and `undefined`. Although the `&&` and `||` operators can use non-boolean operands, they can still be considered as boolean operators because their return values can always be converted to boolean. If you want to explicitly convert their return value or expression to a boolean value, you can use the double negation operator `!!` or the `Boolean` constructor.
* `&&`: `AND`, logical AND, `expr1 && expr2`, returns `expr2` if `expr1` can be converted to `true`, otherwise returns `expr1`.
* `||`: `OR`, logical OR, `expr1 || expr2`, returns `expr1` if `expr1` can be converted to `true`, otherwise returns `expr2`.
* `!`: `NOT`, logical NOT, `!expr`, returns `false` if `expr` can be converted to `true`, otherwise returns `true`.

### Short-circuit Evaluation
Due to the fact that logical expressions are evaluated from left to right, the rule of short-circuit evaluation applies. Short-circuit means that the `expr` part in the following expressions will not be executed, so any side effects of `expr` will not take effect. The reason for this is that the value of the entire expression has already been determined after the first operand is evaluated.
* `(some falsy expression) && (expr)` short-circuits to false.
* `(some truthy expression) || (expr)` short-circuits to true.

## Logical AND `&&`

### Examples

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

### Finding the First Falsy Value
A very important use of the `&&` logical AND operator is to find the first `falsy` value, and short-circuiting can avoid some exceptions.

```javascript
// Finding the first falsy value
var val0 = 0, val1 = 1, val2 = 2;
var result = val1 && val2 && val0;
console.log(result); // 0

// Using short-circuiting
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
var result = f1() && f0() && f2(); // Call f1 // Call f0 // f2 not called
console.log(result); // 0

// Avoiding some exceptions
var obj = {f: void 0}
// obj.f(); // Uncaught TypeError: obj.f is not a function
obj && obj.f && obj.f(); // No exception thrown // Very useful in a chain of function calls
obj?.f?.(); // Of course, you can also use the ?. operator in ES2020
```

## Logical OR `||`

### Examples

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

### Finding the First Truthy Value
A very important use of the `||` logical OR operator is to find the first `truthy` value, and this operation is used very frequently, usually used to assign default values.

```javascript
// Finding the first truthy value
var val0 = 0, val1 = 1, val2 = 2;
var result = val0 || val1 || val2;
console.log(result); // 1

// Setting default values
var v1 = void 0;
var result = val0 || 1;
console.log(result); // 1
```

## Logical NOT `!`

### Examples

```javascript
console.log(!true);    // false
console.log(!false);   // true
console.log(!"");      // true
console.log(!"Cat");   // false
```

### Type Coercion
Using the double negation operator can explicitly convert any value to its corresponding boolean value, and this conversion is based on the `truthyness` and `falsyness` of the value being converted.

```javascript
console.log(!!true);                   // true
console.log(!!{});                     // true // Any object is truthy
console.log(!!(new Boolean(false)));   // true // This is an object rather than a literal
console.log(!!false);                  // false
console.log(!!"");                     // false
console.log(!!Boolean(false));         // false // Calling the constructor to generate a literal
```



## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://juejin.cn/post/6844903991139123208
https://www.cnblogs.com/yf2196717/p/10867864.html
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Logical_Operators
```