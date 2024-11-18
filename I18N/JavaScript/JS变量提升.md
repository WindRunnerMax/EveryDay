# JavaScript Variable Hoisting

In `JavaScript`, variable declarations and function declarations are both hoisted to the top of the scope, with the priority in the following order: function declaration, variable declaration, variable assignment.

## Variable Hoisting

### Hoisting of var

```javascript
console.log(a); // undefined
var a = 1;
console.log(a); // 1
// console.log(b); // ReferenceError: b is not defined
```

To illustrate the difference between `a` and `b`, the undeclared variable `b` was printed, which resulted in a `ReferenceError` exception. Surprisingly, the same does not occur for `a`. In fact, the definition and assignment of `a` is similar to the following process, where the declaration of `a` is hoisted to the top of the scope and the assignment is executed afterwards.

```javascript
var a;
console.log(a); // undefined
a = 1;
console.log(a); // 1
```

### Hoisting of let/const

Both `let` and `const` have block-level scopes and exhibit similar behavior with regards to variable hoisting. In reality, there is disagreement on this matter, but the phrase `var/let hoisting` appears in the `ES6` documentation, indicating that according to the official documentation, `let` and `var` both have variable hoisting. A plausible interpretation is:

* The "creation" process of `let` is hoisted, but the initialization is not.
* Both the "creation" and "initialization" of `var` are hoisted.
* The "creation," "initialization," and "assignment" of `function` are all hoisted.

In `JS`, regardless of the form of declaration, `var`, `let`, `const`, `function`, `function*`, or `class`, hoisting occurs. However, declarations with `var`, `function`, and `function*` are initialized as `undefined` during hoisting, which is why accessing these variables does not result in a`ReferenceError` exception. On the other hand, variables declared with `let`, `const`, and `class` are not initialized after hoisting, and they enter a state known as the "temporal dead zone." Accessing these variables during this time throws a `ReferenceError` exception, making it seem like they were not hoisted. For further discussions on this matter, refer to the links below, especially the responses on `stackoverflow`.

```
https://www.jianshu.com/p/0f49c88cf169
https://blog.bitsrc.io/hoisting-in-modern-javascript-let-const-and-var-b290405adfda
https://stackoverflow.com/questions/31219420/are-variables-declared-with-let-or-const-not-hoisted-in-es6
```

## Function Declaration Hoisting

Function declarations hoist both the declaration and assignment, meaning that the entire function body is hoisted to the top of the scope.

```javascript
s(); // 1
function s(){
    console.log(1);
}
```

Function expressions only hoist the variable declaration and essentially hoist an anonymous function object and assign it to the variable.

```javascript
console.log(s); // undefined
var s = function s(){
    console.log(1);
}
console.log(s);  // f s(){console.log(1);}
```

Consequently, there exists a priority relationship between directly declared functions and function expressions.

```javascript
var s = function(){
    console.log(0);
}
function s(){
    console.log(1);
}
s(); // 0
```

## Priority

In `JS`, functions are first-class citizens. In the book "You Don't Know `JavaScript`" (Volume 1), on page 40, it is mentioned that functions are hoisted first and then variables. This means that within the same scope, function hoisting takes precedence over variable hoisting. In the `JS` engine, the priority of execution is function declaration, variable declaration, and variable assignment.

```javascript
function s(){ // function declaration
    console.log(1);
}

var s; // variable declaration

// The function `a` has already been declared, so the equivalent `var` declaration will be directly ignored
console.log(s); // f s(){...}  

s = function(){ // variable assignment
    console.log(0);
}

s(); // 0
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.jianshu.com/p/0f49c88cf169
https://www.cnblogs.com/echolun/p/7612142.html
https://www.cnblogs.com/miacara94/p/9173843.html
https://blog.csdn.net/qq_41893551/article/details/83011752
https://blog.bitsrc.io/hoisting-in-modern-javascript-let-const-and-var-b290405adfda
https://stackoverflow.com/questions/31219420/are-variables-declared-with-let-or-const-not-hoisted-in-es6
```