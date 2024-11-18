# apply(), call(), bind()

Every `Function` object has the `apply()`, `call()`, and `bind()` methods. Their function is to call functions within a specific scope, effectively setting the value of the `this` object inside the function body to extend the scope upon which the function relies for execution.

## Usage
`apply()`, `call()`, and `bind()` can all change the `this` reference of a function object.

```javascript
window.name = "A"; // attached to the window object's name
document.name = "B"; // attached to the document object's name
var s = { // custom object s
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
rollCall.sayName.apply(); // A // default binds to window when no arguments are passed
rollCall.sayName.apply(window); // A // binds to the window object
rollCall.sayName.apply(document); // B // binds to the document object
rollCall.sayName.apply(s); // C // binds to the custom object

// call
rollCall.sayName.call(); // A // default binds to window when no arguments are passed
rollCall.sayName.call(window); // A // binds to the window object
rollCall.sayName.call(document); // B // binds to the document object
rollCall.sayName.call(s); // C // binds to the custom object

// bind // the last () is to execute it
rollCall.sayName.bind()(); //A // default binds to window when no arguments are passed
rollCall.sayName.bind(window)(); //A // binds to the window object
rollCall.sayName.bind(document)(); //B // binds to the document object
rollCall.sayName.bind(s)(); // C // binds to the custom object
```
## Differences
Although `apply()`, `call()`, and `bind()` can all change the `this` pointer, their usage differs.

```javascript
// apply and call have different ways of passing arguments
window.name = "Teacher";
var rollCall = {
    sayAllName: function(...args){
        console.log(this.name);
        args.forEach((v) => console.log(v));
    }
}

// apply passes the arguments as an array
rollCall.sayAllName.apply(window,["A","B","C"]); // Teacher A B C

// call passes the arguments directly, separated by commas
rollCall.sayAllName.call(window,"A","B","C"); // Teacher A B C

// bind only binds the object and does not execute immediately; it returns a function, with arguments passed in a way similar to call
var convertThis = rollCall.sayAllName.bind(window,"A","B","C"); 
convertThis(); // Teacher A B C
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```