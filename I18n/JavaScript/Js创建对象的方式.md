# Ways to create objects in JavaScript
The way `Js` create objects, here objects refer not only to the built-in `Object` object in `Js`, but also to objects in a more general sense in object-oriented programming.

## Literal way
Object literal is a shorthand form of object definition, which can simplify the process of creating objects with a large number of properties.

```javascript
var obj = {
    a: 1,
    b: function(){
        return this.a;
    }
}
console.log(obj); // {a: 1, b: ƒ}
```

In `ES6`, when using literals to create objects, you can also use the `Spread` operator and destructuring assignment.

```javascript
var o1 = {a: 1, b: 11}
var o2 = {c: 111, d: 1111}

var o3 = {...o1, ...o2}
var {a, b} = {a: 1, b: 2}

console.log(o3); // {a: 1, b: 11, c: 111, d: 1111}
console.log(a, b); // 1 2
```

## Object constructor function
Creating objects using the `Object` constructor function is the same as using literals, but internal members need to be specified separately.

```javascript
var obj = new Object();
obj.a = 1;
obj.b = function(){
    return this.a;
}
console.log(obj); // {a: 1, b: ƒ}
```

## Object.create
The `Object.create()` method creates a new object using an existing object to provide the `__proto__` of the newly created object.

```javascript
var obj = Object.create(null); // create an object with no prototype chain
var obj = Object.create(Object.prototype); // equivalent to new Object()
obj.a = 1;
obj.b = function(){
    return this.a;
}
console.log(obj); // {a: 1, b: ƒ}
```

## Factory pattern
Constructing object-creating factories, calling them generates objects, which can reduce redundant code and code redundancy.

```javascript
function factory(){
    var o = new Object();
    o.a = 1;
    o.b = function(){
        return this.a;
    }
    return o;
}
var obj = factory();
console.log(obj); // {a: 1, b: ƒ}
```

## Constructor function
Using the `new` keyword can simplify the operation of creating objects with the same property values and also explicitly obtain the object type.

```javascript
function _object(){
    this.a = 1;
    this.b = function(){
        return this.a;
    }
}
var obj = new _object();
console.log(obj); // _object {a: 1, b: ƒ}
console.log(obj instanceof _object); // true
```

## Prototype pattern
Using the prototype to create objects allows all object instances to share the properties and methods it contains.

```javascript
function _object(){}
_object.prototype.a = 1;
_object.prototype.b = function(){
    return this.a;
}
var obj = new _object();
console.log(obj); // _object {}
console.log(obj.a); // 1
console.log(obj.b()); // 1
console.log(obj instanceof _object); // true
```

## Constructor and prototype combination
The combination of constructor and prototype patterns can solve the problem of not being able to pass parameters in the prototype pattern, as well as the inability to share instance methods in the constructor pattern.

```javascript
function _object(){
    this.a = 1;
}
_object.prototype.b = function(){
    return this.a;
}
var obj = new _object();
console.log(obj); // _object {a: 1}
console.log(obj.a); // 1
console.log(obj.b()); // 1
console.log(obj instanceof _object); // true
```

## Daily question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://juejin.im/post/5b150fcf518825139b18de11
https://juejin.im/entry/58291447128fe1005cd41c52
https://www.cnblogs.com/shirliey/p/11696412.html
```