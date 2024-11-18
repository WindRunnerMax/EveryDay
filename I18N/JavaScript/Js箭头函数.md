
# JavaScript Arrow Functions

Arrow functions are a new syntax added in `ES6` that provide a more concise way of writing functions, similar to anonymous functions, and simplify function definition.

## Full syntax
The full syntax is similar to an anonymous function, omitting the `function` keyword.
```javascript
var s = (a,b) => {
    console.log(a, b); // 1 2
    return a + b;
}
s(1,2);
```
```javascript
// Equivalent to
var s = function(a,b) {
    console.log(a, b); // 1 2
    return a + b;
}
s(1,2);
```

## Omitting parentheses
When there is only **one** parameter, parentheses can be omitted. It is not possible to omit parentheses when there are no parameters or when there are more than two parameters.
```javascript
var s = a => {
    console.log(a); // 1
    return a + a;
}
s(1);
```
```javascript
// Equivalent to
var s = function(a) {
    console.log(a); // 1
    return a + a;
}
s(1);
```

## Omitting braces
When the function body has only one line of code, `{}` can be omitted, and the value of this line will be automatically returned.
```javascript
var cmp = (a, b) => a - b;
var a = [5, 4, 3, 2, 1];
var sortedArr = a.sort(cmp);
console.log(sortedArr); // [1, 2, 3, 4, 5]
```
```javascript
// Equivalent to
var cmp = function(a, b) { return a - b; };
var a = [5, 4, 3, 2, 1];
var sortedArr = a.sort(cmp);
console.log(sortedArr); // [1, 2, 3, 4, 5]
```

## Omitting parentheses and braces
When both of the above conditions are met, parentheses and braces can be omitted altogether.
```javascript
var s = a => a * 2;
console.log(s(1)); // 2
```
```javascript
// Equivalent to
var s = function(a) { return a * 2; }
console.log(s(1)); // 2
```

## Returning object literals
When returning an object, it is important to wrap it in `()`; otherwise, the `{}` of the object will be interpreted as the beginning and ending of the arrow function's body by the browser.
```javascript
var s = a => ({"a": a * 2});
console.log(s(1)); // {a: 2}
```
```javascript
// Equivalent to
var s = function(a) { return {"a": a * 2}; }
console.log(s(1)); // {a: 2}
```

## No separate `this`
Arrow functions do not have a separate `this`. When `this` is used in the function body of an arrow function, it will access the `this` of its surrounding context. Arrow functions do not create their own `this` when called; it only inherits `this` from the level of its scope chain. Since arrow functions do not have their own `this` pointer, using `apply`, `call`, or `bind` can only pass arguments but cannot dynamically change the `this` pointer of the arrow function.

```javascript
var obj = {
    s1: () => {
        console.log(this);
    },
    s2: function(){
        console.log(this);
    }
}

obj.s1(); // Window ...
obj.s2(); // {s1: ƒ, s2: ƒ}

/*
When called, the running environment is the Window, and as s1 is an arrow function, it does not change its `this` pointer, so it points to the Window.
s2 is a regular function and can change its `this` pointer, so it points to the caller.
*/
```

```javascript
var contextObj = {
    e: function() {
        var obj = {
            s1: () => {
                console.log(this);
            },
            s2: function(){
                console.log(this);
            }
        }
        
        obj.s1(); // {e: ƒ}
        obj.s2(); // {s1: ƒ, s2: ƒ}
    }
}
contextObj.e();
/*
When called, the running environment is the contextObj object, and as s1 is an arrow function, it does not change its `this` pointer, so it points to the contextObj object.
s2 is a regular function and can change its `this` pointer, so it points to the caller.
*/
```

Utilizing the `this` pointing feature of arrow functions can solve some problems, such as the common issue of `this` pointing in callback functions.

```javascript
// Common issue of the `this` pointing in callback functions
var a = 1;
var obj = {
    a: 2,
    run: function(){
        var callback = function(){
            console.log(this.a);
        }
        setTimeout(callback,1000); // 1 // The `this` of the callback points to the Window
    }
}
obj.run();
```

To solve this issue, the `this` value can be assigned to an enclosed variable.

```javascript
var a = 1;
var obj = {
    a: 2,
    run: function(){
        var that = this;
        var callback = function(){
            console.log(that.a);
        }
        setTimeout(callback,1000); // 2
    }
}
obj.run();
```

Alternatively, `bind` can be used to bind the `this` during function execution.

```javascript
var a = 1;
var obj = {
    a: 2,
    run: function(){
        var callback = function(){
            console.log(this.a);
        }
        setTimeout(callback.bind(this),1000); // 2
    }
}
obj.run();
```

By using arrow functions, you can directly write callback functions without changing the `this` reference. Arrow functions do not create their own `this`; instead, they inherit the `this` from their lexical enclosing scope.

```javascript
var a = 1;
var obj = {
    a: 2,
    run: function(){
        var callback = () => {
            console.log(this.a);
        }
        setTimeout(callback,1000); // 2
    }
}
obj.run();
```

## Not Binding `arguments`
Arrow functions do not bind the `arguments` object. When referencing `arguments` within an arrow function, it refers to the `arguments` of the enclosing scope, and does not create its own 'this' and 'arguments' within its own scope.

```javascript
function s(a,b){
    console.log(...arguments); // 1 2
    var ss1 = (c) => {
        console.log(...arguments); // 1 2
    }
    var ss2 = function(c){
        console.log(...arguments); // 3
    }
    ss1(3);
    ss2(3);
}
s(1, 2);
```

## Cannot be Used as Constructors
Arrow functions cannot be used as constructors and will throw an exception when instantiating with `new`.

```javascript
var s = () => {};
new s(); // Uncaught TypeError: s is not a constructor
```

## No Prototype Property
Arrow functions do not have a `prototype` property.

```javascript
var s = () => {};
console.log(s.prototype); // undefined
```

## Cannot Be Used as Function Generators
Arrow functions cannot be used as generators. The `yield` keyword typically cannot be used inside arrow functions, unless it is nested within a function that allows it.


## Daily Question
```
https://github.com/WindrunnerMax/EveryDay
```


## Reference
```
https://segmentfault.com/a/1190000010159725
https://www.runoob.com/w3cnote/es6-function.html
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/Arrow_functions
```