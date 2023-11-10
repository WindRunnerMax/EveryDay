# Implementation of Js Inheritance

Inheritance is a concept in object-oriented software technology, which, along with polymorphism and encapsulation, constitutes the three basic characteristics of object-oriented programming. Inheritance allows a subclass to have the properties and methods of its parent class, or to redefine, append properties and methods, etc.

## Prototype Chain Inheritance
By setting the prototype object of the subclass to the instance of the parent class, inheritance of accessing parent class properties and methods is achieved.

```javascript
// Define the parent class
function Parent(){
    this.name = "parent";
    this.say = function(){
        console.log(this.name);
    }
}
// Define the child class
function Child(){
    this.name = "child";
}
Child.prototype = new Parent(); // Set the prototype object of the child class to the instance of the parent class
Child.prototype.constructor = Child; // Fix constructor to comply with the prototype chain rules
var child = new Child(); // Instantiate the child class
child.say(); // child // At this point, the subclass can access the parent class's say method. When looking for the name property, it first looks in its own properties and finds it, so it does not search upwards. If the subclass does not have the name member, it will print parent
console.log(child instanceof Parent); // true // Check if the Child constructor's prototype object is in the Parent's prototype chain
```
### Features
* Subclass can access newly added prototype methods and properties of the parent class.
* Pure inheritance relationship, where an instance is both an instance of the subclass and the parent class.
* Subclass instance can inherit parent class constructor properties and methods, as well as parent class prototype properties and methods.

### Limitations
* Unable to achieve multiple inheritance.
* Subclass instances cannot pass parameters to the parent class's constructor.
* All subclass instances will share the properties of the parent class's prototype object.

## Constructor Inheritance
When the subclass constructor is called, the parent class constructor is invoked using `call` or `apply` to extend `this`.

```javascript
// Define the parent class
function Parent(from){
    this.name = "parent";
    this.say = function(){
        console.log(this.name);
    }
    this.from = from;
}
// Define the child class
function Child(from){
    Parent.call(this, from); // Call the parent class constructor and bind 'this' to extend the Child instance members, and pass parameters
    this.name = "child";
}

var child = new Child("child"); // Instantiate the child class
child.say(); // child
console.log(child.from); // child
```

### Features
* Subclass instances do not share parent class properties and methods.
* When instantiating the subclass, parameters can be passed to the parent class constructor.
* Multiple inheritance can be achieved by calling multiple parent class constructors.

### Limitations
* The instance is not an instance of the parent class, only of the subclass.
* Only inherits the parent class's constructor properties and methods, not the parent class's prototype properties and methods.
* Each subclass has a copy of the parent class instance function, it copies the parent class function instead of referencing it, which affects performance.

## Instance Inheritance
Add members and methods to the parent class instance and return it as an instance.

```javascript
// Define the parent class
function Parent(from){
    this.name = "parent";
    this.say = function(){
        console.log(this.name);
    }
    this.from = from;
}
// Define the child class
function Child(from){
    var instance = new Parent(from);
    instance.name = "child";
    return instance;
}

var child = new Child("child"); // Instantiate the child class
child.say(); // child
console.log(child.from); // child
```
### Features
* Parameters can be passed to the parent class constructor when instantiating the subclass.
* The subclass can be instantiated with `new Child()` or directly called `Child()`.

### Limitations
* Does not support multiple inheritance.
* The instance is an instance of the parent class, not the subclass.
* Also involves instantiating and copying the parent class's members and methods.

## Copy Inheritance
Inherit from the parent class by directly copying the parent class's properties to the subclass's prototype.

```javascript
// Define the parent class
function Parent(from){
    this.name = "parent";
    this.say = function(){
        console.log(this.name);
    }
    this.from = from;
}
// Define the child class
function Child(from){
    var instance = new Parent(from);
    for(let item in instance) Child.prototype[item] = instance[item];
    this.name = "child";
}

var child = new Child("child"); // Instantiate the child class
child.say(); // child
console.log(child.from); // child
```

### Features
* Supports multiple inheritance.
* Parameters can be passed to the parent class constructor when instantiating the subclass.

### Limitations
* Unable to access non-enumerable methods of the parent class.
* Also involves instantiating and copying the parent class's members and methods.

## Prototypal Inheritance
Implement inheritance by sharing the prototype object.

```javascript
// Define the parent class
function Parent(){}
Parent.prototype.name = "parent";
Parent.prototype.say = function(){ console.log(this.name); }

// Define the child class
function Child(from){
    this.name = "child";
}

Child.prototype = Parent.prototype; // Share the prototype
Child.prototype.constructor = Child;

var child = new Child("child"); // Instantiate the child class
child.say(); // child
```

### Features
* Implements reuse of methods and properties.
* Subclass can access newly added prototype methods and properties of the parent class.

### Shortcomings
* The instance members of the parent constructor function cannot be inherited.
* All subclass instances will share the properties in the parent class's prototype object.

## Combination Inheritance
Combines prototype chain inheritance and constructor borrowing inheritance, combining the advantages of both patterns for parameter passing and reusability.
```javascript
// Define the parent class
function Parent(from){
    this.name = "parent";
    this.say = function(){
        console.log(this.name);
    }
    this.from = from;
}
// Define the child class
function Child(from){
    Parent.call(this, from);
    this.name = "child";
}

Child.prototype = new Parent();
Child.prototype.constructor = Child;

var child = new Child("child"); // Instantiate the child class
child.say(); // child
console.log(child.from); // child
```

### Features
* Prototype methods can be reused.
* Instances belong to both the subclass and the parent class.
* Parameter can be passed to the parent class constructor when instantiating the subclass.
* Can inherit instance properties and methods, as well as prototype properties and methods.

### Shortcomings
* Calls the parent class constructor twice, generating two instances, and the subclass's constructor copy will replace the instance of the parent class constructor on the prototype.

## Parasitic Combination Inheritance
By parasitic means, eliminate the instance properties of the parent class. When calling the parent class constructor twice, the initialization of instance methods and properties will not be repeated to avoid the shortcomings of combination inheritance.
```javascript
// Define the parent class
function Parent(from){
    this.name = "parent";
    this.say = function(){
        console.log(this.name);
    }
    this.from = from;
}
// Define the child class
function Child(from){
    Parent.call(this, from);
    this.name = "child";
}

var f = function(){}; // Create a class without instance methods
f.prototype = Parent.prototype; // Shallow copy the parent class prototype
Child.prototype = new f(); // Instantiate f, at this point no instance method is called, while establishing the prototype chain
Child.prototype.constructor = Child;

var child = new Child("child"); // Instantiate the child class
child.say(); // child
console.log(child.from); // child
```
### Features
* More comprehensive.

### Shortcomings
* Relatively more complex.

## Daily Exercise

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.jianshu.com/p/b76ddb68df0e
https://www.cnblogs.com/ranyonsue/p/11201730.html
https://www.cnblogs.com/humin/p/4556820.html#!comments
```