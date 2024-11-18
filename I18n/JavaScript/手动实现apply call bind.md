# Manually Implementing apply, call, bind
Each `Function` object has `apply()`, `call()`, and `bind()` methods, which are used to call functions in a specific scope, effectively setting the value of the `this` object within the function body to extend the scope in which the function runs.

## apply
`funct.apply(thisArg, [argsArray])`  
`thisArg`: Required, the value of `this` to be used when the `funct` function is running. `this` may not be the actual value seen by the method. If this function is in non-strict mode, specifying `null` or `undefined` will automatically be replaced by a reference to the global object and primitive values will be wrapped.  
`argsArray`: Optional, pass an array-like object containing the arguments to be passed to the `funct` function. If the value of this parameter is `null` or `undefined`, it indicates that no arguments need to be passed.  
The implementation approach is similar to `Function.prototype.apply()`, by attaching the `_apply()` method to the `Function.prototype`, allowing function objects to directly call it. When calling `funct._apply()`, the `this` within the `_apply()` method refers to the `funct` object. This `funct` object is assigned to a property of the object to be bound, and the `funct` is then called using the object to be bound, thus achieving the `this` pointer pointing to the object to be bound. For handling the arguments, the `Spread` operator from `ES6` is used to expand the array and pass it as arguments.
```javascript
window.a = 1; // Define a global variable
var obj = {a: 2}; // Define an object for binding
var funct = function(b, c) { console.log(this.a,b,c); return 1; }; // Define a function to execute

funct(1, 2); // 1 1 2  // Direct execution, equivalent to window.funct(1, 2), this is bound to window
funct.apply(obj, [1, 2]); // 2 1 2 // Using apply to bind this to the obj object

Function.prototype._apply = function(base, args) { // Extend the Function prototype
    base = base || window; // If the bound object is null or undefined, it will be directed to window
    base.fn = this; // When _apply is called, this refers to the caller, which is the function object, and the function object is assigned to a property of the base object
    var result = base.fn(...args); // When calling base.fn, the this pointer within fn points to base, and the Spread operator is used to expand the parameters
    delete base.fn; // Delete the fn property of the base object
    return result; // Return the result
}

funct._apply(obj, [1, 2]); // 2 1 2 // this is bound to the obj object
```

## call
`funct.call(thisArg[, arg1[, arg2[, ...]]])`  
`thisArg`: Required, the value of `this` to be used when the `funct` function is running. `this` may not be the actual value seen by the method. If this function is in non-strict mode, specifying `null` or `undefined` will automatically be replaced by a reference to the global object and primitive values will be wrapped.  
`arg1, arg2, ...`: Optional, the specified list of arguments.  
The implementation approach is similar to `Function.prototype.call()`, by attaching the `_call()` method to the `Function.prototype`, allowing function objects to directly call it. When calling `funct._call()`, the `this` within the `_call()` method refers to the `funct` object. This `funct` object is assigned to a property of the object to be bound, and the `funct` is then called using the object to be bound, thus achieving the `this` pointer pointing to the object to be bound. For handling the arguments, the `Rest` operator from `ES6` is used to accept the remaining parameters, and the `Spread` operator from `ES6` is used to expand the array as arguments.
```javascript
window.a = 1; // Define a global variable
var obj = {a: 2}; // Define an object for binding
var funct = function(b, c) { console.log(this.a,b,c); return 1; }; // Define a function to execute

funct(1, 2); // 1 1 2  // Direct execution, equivalent to window.funct(1, 2), this is bound to window
funct.call(obj, 1, 2); // 2 1 2 // Using call to bind this to the obj object


```javascript
Function.prototype._call = function(base, ...args) { // Extension of the Function prototype to accept rest parameters using the Rest operator
    base = base || window; // When the passed binding object is null or undefined, it points to window
    base.fn = this; // The 'this' when _call is invoked points to the caller, which is the function object, and assigns the function object to a property of the base object
    var result = base.fn(...args); // When calling base.fn, the this pointer in fn points to the base, and the Spread operator is used to spread the parameters
    delete base.fn; // Removes the fn property from the base object
    return result; // Returns the result
}

funct._call(obj, 1, 2); // 2 1 2 // 'this' is bound to the obj object
```

## bind
`funct.bind(thisArg[, arg1[, arg2[, ...]]])`  
`thisArg`: Required, the value passed as the `this` parameter when calling the bound function, ignored if the bound function is constructed using the `new` operator, when provided as a callback, any primitive value passed as `thisArg` will be converted to an object, if the parameter list of the `bind` function is empty, or `thisArg` is null or undefined, the `this` of the execution scope will be considered the `thisArg` of the new function.  
`arg1, arg2, ...`: Optional, parameters that are preset into the parameter list of the bound function when the target function is called.  
The implementation approach is similar to `Function.prototype.bind()`. Similarly, the `_bind()` method is mounted on `Function.prototype`, allowing function objects to be called directly. By leveraging the lexical binding of `this` value with arrow functions, it returns a function with a specified `this`. If arrow functions are not used, the `this` value can also be assigned to a closed variable to construct a closure, followed by an implementation similar to the `apply` method to bind `this` to the specified object.
```javascript
window.a = 1; // Define a global variable
var obj = {a: 2} // Define an object for binding
var funct = function(b, c) { console.log(this.a,b,c); return 1; }; // Define a function for execution

funct(1, 2); // 1 1 2  // Direct execution, equivalent to window.funct(1, 2), 'this' is bound to window
var bindFunct = funct.bind(obj, 1, 2); // Use bind to bind 'this' to the obj object, the bind method returns a copy of the original function with the specified this value and initial parameters.
bindFunct(); // 2 1 2 

Function.prototype._bind = function(base, ...args1) { // Extension of the Function prototype to accept rest parameters using the Rest operator
    return (...args2) => { // An arrow function does not generate its own this in the lexical scope, it inherits the this from the previous layer of its own scope chain
        base = base || window; // When the passed binding object is null or undefined, it points to window
        base.fn = this; // The 'this' when invoking the arrow function points to the caller, which is the function object, and assigns the function object to a property of the base object
        var result = base.fn(...args1, ...args2); // When calling base.fn, the this pointer in fn points to the base, and the Spread operator is used to spread the parameters
        delete base.fn; // Removes the fn property from the base object
        return result; // Returns the result
    }
}

var _bindFunct = funct._bind(obj, 1, 2); // Bind the object
_bindFunct(); // 2 1 2 
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://www.jianshu.com/p/57a876fe66c8
```