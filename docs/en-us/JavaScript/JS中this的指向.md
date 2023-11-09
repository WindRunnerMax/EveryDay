# Understanding 'this' in JavaScript

The reference of `this` cannot be determined when a function is defined. It is only established when the function is executed; in fact, `this` ultimately refers to the object that calls it.

## Example
Defining a function and an object, and then calling them. Note that only when the function is called does `this` point to the caller, except for arrow functions.
```javascript
function s(){
    console.log(this);
}

// Direct call in window // Not use strict
s(); // Window // Equivalent to window.s(), the caller is window
// window is an instance of Window // window instanceof Window // true

// Create a new object s1
var s1 = {
    t1: function(){ // testing the reference of this to the caller
        console.log(this); // s1
        s(); // Window // This call still equivalent to window.s(), and the caller is window
    },
    t2: () => { // testing arrow function, where this does not point to the caller
        console.log(this);
    },
    t3: { // testing an object inside an object
        tt1: function() {
            console.log(this);
        }
    },
    t4: { // testing arrow function and non-function call where this does not point to the caller
        tt1: () => {
            console.log(this);
        }
    },
    t5: function(){ // testing the reference of this when a function calls an arrow function, which points to the caller of the parent object
        return {
            tt1: () => {
                console.log(this);
            }
        }
    }
}
s1.t1(); // s1 object // the caller here is s1, so the printed object is s1
s1.t2(); // Window
s1.t3.tt1(); // s1.t3 object
s1.t4.tt1(); // Window
s1.t5().tt1(); // s1 object
```
A special case: calling the same method but getting different `this` references. It is important to note that `this` ultimately refers to the object that calls it.

```javascript
var s1 = {
    t1: function(){
        console.log(this);
    }
}
s1.t1(); // s1 object
var p = s1.t1;
p(); // Window

// It is important to note that when the method is assigned to p, calling it directly yields Window as the this reference
// This case is not actually special, because a function is also an object, and in this case, p is assigned a function
console.log(p); // ƒ (){console.log(this);}
// This function is called by window, and therefore, this points to window
```

## Changing the reference of 'this'

```
Using apply, call, and bind can change the reference of this. For more information, refer to
https://github.com/WindrunnerMax/EveryDay/blob/master/JavaScript/apply%E3%80%81call%E3%80%81bind.md
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference
```
http://www.ruanyifeng.com/blog/2018/06/javascript-this.html
```