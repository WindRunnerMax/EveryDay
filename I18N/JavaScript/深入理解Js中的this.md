# Understanding this in JavaScript

The scope of `JavaScript` is `static`, but `this` in `Js` is an exception. The issue of what `this` refers to is more akin to `dynamic` scope, as it doesn't concern itself with how functions and scopes are declared or where, but rather with where they are called from. The reference of `this` cannot be determined when a function is defined, only when it is executed. In practice, `this` ultimately points to the object that calls it.

### Scope
First, let's understand the scope of `JavaScript` to grasp why `this` is more similar to dynamic scope. In a program, the names used may not always be valid or available, and the code scope that limits the availability of a name is its `scope`. When a method or member is declared, it has the current executable context. In a specific context where expressions are visible and can be referenced, if a variable or expression is not within the current scope, it cannot be used. Scopes can also be layered hierarchically based on the code hierarchy, allowing child scopes to access parent scopes.

`JavaScript` has a `static` scope, also known as `lexical` scope, where when encountering a variable not defined as a parameter or in the function's local scope, it looks up in the context of the function's definition. In contrast, `dynamic` scope functions look up in the context of the function call.

```javascript
var a = 1;
var s = function(){
    console.log(a);
};

(function(){
    var a = 2;
    s(); // 1
})();
```

Calling `s()` prints `a` as `1`, which is characteristic of `static` scope. If it was `dynamic` scope, it would have printed `2`. Most languages now use `static` scope, such as `C`, `C++`, `Java`, `PHP`, `Python`, etc., while languages with `dynamic` scope include `Emacs Lisp`, `Common Lisp`, and `Perl`.

### Global Scope
Variables or methods declared directly at the top level run in the global scope. By using the `[[Scopes]]` attribute of a function, we can access the scope chain, which stores the function's scope chain and is an internal property of the function that cannot be directly accessed, but can be viewed by printing.

```javascript
function s(){}
console.dir(s);
/*
  ...
  [[Scopes]]: Scopes[1]
    0: Global ...
*/
// We can see that the declared function s runs within the global scope context
```

### Function Scope
After declaring a function, the running environment for methods or members declared within the function is the function's function scope.

```javascript
(function localContext(){
    var a = 1;
    function s(){ return a; }
    console.dir(s);
})();
/*
  ...
  [[Scopes]]: Scopes[2]
    0: Closure (localContext) {a: 1}
    1: Global ...
*/
// We can see that the declared function s runs within the scope of the localContext function, also known as the local scope
```

### Block Scope
If `let` or `const` exists within a code block, a closed scope is formed from the beginning of the block for these declared variables.

```javascript
{
    let a = 1;
    function s(){ return a; }
    console.dir(s);
    /*
      ...
      [[Scopes]]: Scopes[2]
        0: Block {a: 1}
        1: Global ...
    */
}
// We can see that the declared function s runs within the Block block scope, also a local scope
```

## Analysis
Before using `this`, it's necessary to understand why `JavaScript` has this design. Before that, let's consider a small example. Typically, when using `this`, we may encounter a typical problem like the following, where even though we are running the same function, the result may differ.

```javascript
var obj = {
    name: 1,
    say: function() {
        return this.name;
    }
};

window.name = 2;
window.say = obj.say;

console.log(obj.say()); // 1
console.log(window.say()); // 2
```

The reason for such a result is because the `this` keyword is used. As mentioned earlier, the value of `this` must be determined at runtime. In the case of `obj.say()`, the environment in which `say()` is executed is the `obj` object, while for `window.say()`, the `say()` runs in the `window` object. So, the results of the two function calls are different.

Now, let's understand why JavaScript has such a design. First, let's understand the stack in the memory structure of JavaScript. The heap is a dynamically allocated memory with an indefinite size and no automatic release. The stack is an automatically allocated memory space that is automatically released during code execution. JavaScript provides an environment for executing Js code in the stack memory. Scope and function calls are all executed in the stack memory. In JavaScript, basic data types such as `String`, `Number`, `Boolean`, `Null`, `Undefined`, `Symbol` occupy small space with a fixed size, and their values are directly stored in the stack memory for value access. For reference data type `Object`, its pointer is placed in the stack memory, pointing to the actual address in the heap memory, and is accessed by reference.

Now let's look at the example above. In the memory, the `obj` object is stored in the heap memory. If the property value in the object is a basic data type, it will be stored in the same memory area as the object. However, this property value might also be a reference data type. For the `say` function, it also exists in the heap memory. In fact, in this case, we can understand that this function is actually defined in a memory area (exists in the form of an anonymous function), and the `obj` object also exists in another memory area. `obj` points to the memory address of this anonymous function through the `say` property: `obj --say--> function`. As a result of this memory structure, any variable object can be made to point to this function. Therefore, JavaScript functions need to allow us to access the value of the runtime environment, so we need a mechanism to obtain the current execution environment `context` within the body of the function. This is why `this` appears, and its design purpose is to represent the current execution environment of the function body.

## Usage
We need to remember that `this` is bound at runtime, not at the time of definition. Its `context` depends on various conditions when the function is called. Simply put, the binding of `this` has no relationship with the position of the function declaration; it only depends on the way the function is called. In simple terms, `this` always refers to the caller, except for arrow functions. Next, let's introduce the five usage scenarios of `this`.

### Default Binding
The most commonly used function call type is an independent function call, which has the lowest priority. In this case, `this` points to the global object. Note that if using strict mode, the global object will not be used for default binding, so `this` becomes `undefined`.

```javascript
var a = 1; // Variable declaration in the global object
function f1() {
    return this.a;
}

function f2() {
    "use strict";
    return  this;
}

console.log(f1()); // 1 // Actually calls window.f1(), so this always refers to the caller, i.e., window
console.log(f2()); // undefined // Actually calls window.f2(). Here, due to the strict mode, 'use strict', the value of this inside the function becomes undefined
```

### Implicit Binding
In an object property reference chain, only the top level or the last level affects `this`. Again, `this` always refers to the caller, more specifically, it points to the nearest caller. Of course, this rule does not apply to arrow functions. Additionally, we may intentionally or unintentionally create cases of indirect reference, where `this` also refers to the caller. The examples used in the preceding analysis belong to cases of indirect reference.

```javascript
function f() {
    console.log(this.a);
}
var obj1 = {
    a: 1,
    f: f
};
var obj2 = {
    a: 11,
    obj1: obj1
};
obj2.obj1.f(); // 1 // The last level caller is obj1
```

```javascript
function f() {
    console.log(this.a);
}
var obj1 = {
    a: 1,
    f: f
};
var obj2 = {
    a: 11,
};
obj2.f = obj1.f; // Indirect reference
obj2.f(); // 11 // The caller is obj2
```

### Explicit Binding
If we want to forcibly bind a function to a specific environment or object, we can use `apply`, `call`, or `bind` to bind `this` to execute. Each `Function` object has `apply()`, `call()`, and `bind()` methods, which can be used to call a function in a specific scope, effectively setting the value of the `this` object within the function. It is worth noting that using `bind` to bind `this` takes precedence over `apply` and `call`. After using `bind` to bind `this`, it is not possible to change the value of `this` using `apply` or `call`.

```javascript
window.name = "A"; // Mounted to window's name
document.name = "B"; // Mounted to document's name
var s = { // Custom an object s
    name: "C"
}

var rollCall = {
    name: "Teacher",
    sayName: function(){
        console.log(this.name);
    }
}
rollCall.sayName(); // Teacher

// apply
rollCall.sayName.apply(); // A // Default binding to window when no parameter is passed
rollCall.sayName.apply(window); // A // Binding to window object
rollCall.sayName.apply(document); // B // Binding to document object
rollCall.sayName.apply(s); // C // Binding to custom object

// call
rollCall.sayName.call(); // A // Default binding to window when no parameter is passed
rollCall.sayName.call(window); // A // Binding to window object
rollCall.sayName.call(document); // B // Binding to document object
rollCall.sayName.call(s); // C // Binding to custom object

// bind // The last () is for execution
rollCall.sayName.bind()(); //A // Default binding to window when no parameter is passed
rollCall.sayName.bind(window)(); //A // Binding to window object
rollCall.sayName.bind(document)(); //B // Binding to document object
rollCall.sayName.bind(s)(); // C // Binding to custom object
```

### New Binding
In JavaScript, `new` is a syntactic sugar that simplifies code writing and can be used to create object instances in batches. The following operations are actually performed in the process of `new`.
1. Create a simple JavaScript object, i.e. `{}`.
2. Link the object (i.e. set the object's constructor function) to another object.
3. Set the object created in step 1 as the context `this`.
4. If the function does not return an object, then return the object created in step 1.

```javascript
function _new(base, ...args){
    var obj = {};
    obj.__proto__ = base.prototype;
    base.apply(obj, args);
    return obj;
}

function Funct(a) {
    this.a = a;
}
var f1 = new Funct(1);
console.log(f1.a); // 1

var f2 = _new(Funct, 1);
console.log(f2.a); // 1
```

### Arrow Functions
Arrow functions do not have their own `this`. When using `this` in the function body of an arrow function, it will obtain the `this` in its context environment. When an arrow function is called, it does not generate its own scope for `this`; it only inherits `this` from the scope chain one level up. As arrow functions do not have their own `this` pointer, using `apply`, `call`, or `bind` can only pass arguments and cannot dynamically change the `this` binding of the arrow function. Additionally, arrow functions cannot be used as constructors and will throw an exception when instantiated with `new`.

```javascript
window.name = 1;
var obj = {
    name: 11,
    say: function(){
        const f1 = () => {
            return this.name;
        }
        console.log(f1()); // 11 // Direct caller is window, but as the arrow function does not bind this, it takes the this in the context, i.e. the obj object
        const f2 = function(){
            return this.name;
        }
        console.log(f2()); // 1 // Direct caller is window, so it is a normal function
        return this.name;
    }
}

console.log(obj.say()); // 11 // Direct caller is obj, and the this in the context during execution is the obj object
```

## Example

```javascript
function s(){
    console.log(this);
}

// Direct call in window // Non-strict mode
s(); // Window // Equivalent to window.s(), caller is window
// window is an instance of Window // window instanceof Window //true
```

```javascript
// Create a new object s1
var s1 = {
    t1: function(){ // Test the 'this' pointed to the caller
        console.log(this); // s1
        s(); // Window // This call is still equivalent to window.s(), the caller is window
    },
    t2: () => { // Test arrow function, 'this' does not point to the caller
        console.log(this);
    },
    t3: { // Test object inside an object
      tt1: function() {
           console.log(this);
      }  
    },
    t4: { // Test arrow function and non-function call, 'this' does not point to the caller
      tt1: () => {
           console.log(this);
      }  
    },
    t5: function(){ // Test the 'this' for arrow function when called inside a function, it points to the caller of the upper layer object
        return {
            tt1: () => {
                console.log(this);
            }
        }
    }
}
s1.t1(); // s1 object // The caller here is s1, so the printed object is s1
s1.t2(); // Window
s1.t3.tt1(); // s1.t3 object
s1.t4.tt1(); // Window
s1.t5().tt1(); // s1 object

```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://juejin.cn/post/6882527259584888845
https://www.cnblogs.com/raind/p/10767622.html
http://www.ruanyifeng.com/blog/2018/06/javascript-this.html
```