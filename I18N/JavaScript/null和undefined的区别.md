# The Difference Between `null` and `undefined`

In `Js`, `null` and `undefined` are two basic data types that can be used to represent the concept of "nothing." However, there are differences in semantic expression and practical use.

## Description
In most computer languages, there is only one value to represent "nothing," for example, `C` and `C++` use `NULL`, `Java` and `PHP` use `null`, `Python` uses `None`, and `lua` and `Ruby` use `nil`. However, in `Js`, there are two basic data types, `null` and `undefined`, to represent "nothing." In many cases, `null` and `undefined` are almost equivalent, for example, in an `if` statement, both will be automatically converted to `false`.

```javascript
var _null = null;
var _undefined = undefined;

if(!_null && !_undefined) console.log("true && true"); // true && true
```

The `==` operator considers `null` and `undefined` to be equal, but the `===` operator considers them to be unequal.

```javascript
console.log(null == undefined); // true
console.log(null === undefined); // false
```

Using `null` and `undefined` to represent "nothing" is due to a historical legacy. Originally, when designing `Js`, only `null` was set as the value to represent "nothing." According to the tradition of `C` language, `NULL` was designed to be automatically converted to `0`. However, the designer of `JavaScript`, `Brendan Eich`, felt that this was not enough. Initially, when designing `Js`, it was thought that `null` was an `Object`, which is why `typeof(null) === object`. Although there have been proposals to change the type of `null` to `typeof(null) === null`, it was rejected because it would cause problems with a large number of old `Js` scripts. `Brendan Eich` believed that the value representing "nothing" should not be an object, and if `null` was automatically converted to `0`, errors would be harder to detect. Therefore, `Brendan Eich` designed another data type, `undefined`. 
Although `null` and `undefined` have a high degree of similarity, they need to be distinguished in terms of semantics and practical use. `undefined` indicates that the value does not exist, while `null` indicates that a value has been defined as "empty." Therefore, it is reasonable to set a value to `null`, for example, `obj.v = null;`. However, setting a value to `undefined` is unreasonable because it has already been actively declared, and setting it to `undefined` means it is undefined.

## Differences

* `null` is an object representing "nothing," `Number(null) === 0`, while `undefined` is a primitive value representing "nothing," `Number(undefined) === NaN`.
* `null` indicates that a value has been defined, but this value is empty.
   * As a function parameter, it indicates that the function's parameter is not an object.
   * As the end of the object prototype chain `Object.getPrototypeOf(Object.prototype)`.
* `undefined` indicates that the value is not defined.
   * A variable has been declared but not assigned, represented as `undefined`.
   * When a function is called and the expected argument is not provided, the parameter value is represented as `undefined`.
   * The property of an object that has not been assigned a value is represented as `undefined`.
   * A function without a return value defaults to `undefined`.

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.cnblogs.com/sunyang-001/p/10792894.html
http://www.ruanyifeng.com/blog/2014/03/undefined-vs-null.html
https://blog.csdn.net/weixin_39713762/article/details/93807832
```