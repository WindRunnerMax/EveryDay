# JavaScript Closures

Functions and their references to a lexical environment are bundled together to form a closure. In other words, **closures allow you to access the outer function's scope from within an inner function**. In JavaScript, closures are created each time a function is created. Essentially, closures act as a bridge that connects the internal and external parts of a function.

## Defining Closures
To define a closure, you first need a function to enclose an anonymous function. Closures require the use of local variables, as defining them with global variables would defeat the purpose of using closures. The outermost function defines a local scope to allow the definition of local variables that cannot be directly accessed from outside the function.

```JavaScript
function student(){
    var name = "Ming";
    var sayMyName = function(){ // sayMyName serves as an inner function, with the ability to access the variables in the parent function's scope, specifically 'student'
        console.log(name);
    }
    console.dir(sayMyName); // ... [[Scopes]]: Scopes[2] 0: Closure (student) {name: "Ming"} 1: Global ...
    return sayMyName; // the return statement allows external access to the closure, and it can be mounted onto the window object as well
}
var stu = student(); 
stu(); // Ming
```
As seen, the `name` variable defined within the function is not destroyed and can still be accessed from outside the function. By using closures, local variables can be kept in memory, thereby avoiding the use of global variables. Global variable pollution can lead to unpredictability in applications, as every module that can access them is likely to cause issues.

## Lexical Environment
Closures share the same function definition but hold different lexical environments.

```JavaScript
function student(name){
    var sayMyName = function(){
        console.log(name);
    }
    return sayMyName;
}
var stu1 = student("Ming"); 
var stu2 = student("Yang"); 
stu1(); // Ming
stu2(); // Yang
```

## Simulating Private Methods
In object-oriented languages like Java and PHP, it is possible to define private members that can only be accessed within the class and not by external classes. While JavaScript does not inherently support private members, they can be simulated using closures. Private methods not only serve to restrict access to the code but also provide powerful management of the global namespace, preventing non-core methods from cluttering the public interface of the code.

```JavaScript
function student(){
    var HP = 100;
    var addHP = function(){
        return ++HP;
    }
    var decHP = function(){
        return --HP;
    }
    return {
        addHP,
        decHP
    };
}
var stu = student();
console.log(stu.HP); // undefined, disallowed direct access
console.log(stu.addHP()); // 101
console.log(stu.decHP()); // 100
```

## Callback Mechanism
Closures in JavaScript provide support for the callback mechanism, where a closure is not released even if the function is not immediately called. In JavaScript, it is valid to pass a `callback` function as a parameter to other functions or to return it as a value for later use.

```javascript
function localContext(){
    var localVal = 1;
    var callback = function(){
        console.log(localVal); // ... [[Scopes]]: Scopes[2] 0: Closure (localContext) {localVal: 1} 1: Global ...
    }
    console.dir(callback);
    setTimeout(callback, 1000); // 1
}
localContext();
```
In this example, the `callback` function and its lexical environment form a closure. The variable `localVal = 1` within the lexical environment of the function `callback` is not immediately released when the callback function is passed and can still be used when the callback is executed, demonstrating how closures support the callback mechanism.

## Creating Closures in Loops
Prior to the introduction of the `let` keyword in ECMAScript 2015, only function scope and global scope were available, and functions could be nested within other functions to create local scopes. However, the `for` loop did not have a local scope, leading to a common problem of creating closures.

```JavaScript
function counter(){
    var arr = [];
    for(var i = 0 ; i < 3 ; ++i){
        arr[i] = function(){
            return i;
        }
    }
    return arr;
}

var coun = counter();
for(var i = 0 ; i < 3 ; ++i){
    console.log(coun[i]()); // 3 3 3
}
```
The output is `3 3 3`, instead of the expected `0 1 2`. This is because when these three closures are created within the loop, they share the same lexical scope. As `i` is declared using `var`, due to variable hoisting and function scope, when the closure functions are executed, the loop has already finished, and `i` has been assigned the value of `3`. As a result, it prints as `3 3 3`.

### Using an Anonymous Function to Create a New Function Scope to Solve the Issue

```JavaScript
function counter(){
    var arr = [];
    for(var i = 0 ; i < 3 ; ++i){
        (function(i){
            arr[i] = function(){
                return i;
            }
        })(i);
    }
    return arr;
}

var coun = counter();
for(var i = 0 ; i < 3 ; ++i){
    console.log(coun[i]()); // 0 1 2
}
```

### Using the `let` keyword
```JavaScript
function counter(){
    var arr = [];
    for(let i = 0 ; i < 3 ; ++i){
        arr[i] = function(){
            return i;
        }
    }
    return arr;
}

var coun = counter();
for(var i = 0 ; i < 3 ; ++i){
    console.log(coun[i]()); // 0 1 2
}
```

## Memory Leaks
Memory leaks refer to the situation where variables that are no longer in use (or accessible) still occupy memory space and cannot be reused.  
The variables referenced by closures should be needed and should not cause memory leaks. However, in the `JScript.dll` engine used in `IE8`, there are some issues causing memory leaks.  
For specific behaviors of closure memory reclamation in various engines, please refer to [this article](https://www.cnblogs.com/rubylouvre/p/3345294.html).

## Performance Considerations
It is not wise to create functions within other functions unless it is necessary for certain specific tasks, as closures have a negative impact on script performance in terms of processing speed and memory consumption.  
When creating new objects or classes, methods should usually be associated with the object's prototype rather than defined within the object's constructor. This is because doing so will cause the method to be reassigned each time the constructor is called.

## Question of the Day

```
https://github.com/WindrunnerMax/EveryDay
```

## References
```
https://zhuanlan.zhihu.com/p/22486908
https://www.cnblogs.com/Renyi-Fan/p/11590231.html
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Closures
```