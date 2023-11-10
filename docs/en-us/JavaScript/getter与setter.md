# Getter and Setter

A `getter` is a method that retrieves the value of a particular property, while a `setter` is a method that sets the value of a specific property.

## Description
* Through `getter` and `setter`, interception operations for data retrieval and assignment can be implemented. When you want to monitor the change of a value, you can achieve this through `getter` and `setter` without having to find and modify every piece of code that operates this value.
* Sometimes it is necessary to allow access to properties that return dynamically calculated values or reflect the state of internal variables without the need for explicit method calls, which can be achieved using `getter` and `setter`.
* Although `getter` and `setter` can be combined to create a pseudo-property, it is not possible to bind `getter` and `setter` to a property that actually has a value.

## Literal Declaration
You can directly declare `get` and `set` methods when creating objects through literals.

```javascript
var obj  = {
    __x:1,
    get x(){
        console.log("Retrieval operation");
        return this.__x;
    },
    set x(v){
        console.log("Assignment operation, such as updating the view");
        this.__x=v;
    }
}
console.log(obj.x); // 1
obj.x = 11;
console.log(obj.x); // 11
/*
  Defining __x with a double underscore at the beginning indicates a property that is not intended to be accessed directly
  Of course, you can directly use obj.__x for property assignment and retrieval operations, but this would defeat the purpose of get and set
 */
/*
  In addition, as mentioned in the third point of the description, it is not possible to bind a getter and setter to a property that actually has a value, otherwise it will result in an infinite recursion and stack overflow, causing an exception
  var obj  = {
      x:1,
      get x(){
          return this.x;
      },
      set x(v){
          this.x=v;
      }
  }
  console.log(obj.x); // Uncaught RangeError: Maximum call stack size exceeded
/*
```

## Object.defineProperty
Use `Object.defineProperty()` to precisely add or modify an object's properties.
```javascript
var obj  = {
    __x:1
}
Object.defineProperty(obj, "x", {
    get: function(){
        console.log("Retrieval operation");
        return this.__x;
    },
    set: function(v){
        console.log("Assignment operation, such as updating the view");
        this.__x=v;
    }
});
console.log(obj.x); // 1
obj.x = 11;
console.log(obj.x); // 11
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```