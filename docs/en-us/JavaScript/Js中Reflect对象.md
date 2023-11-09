# The Reflect Object in JavaScript

`Reflect` is a built-in object in `JavaScript` starting from `ES6`, providing methods for intercepting `JavaScript` operations, these methods are basically similar to the methods in the `handlers` of the `Proxy` object.

## Description
`Reflect` is not a constructor function, so it cannot be called with the `new` operator or as a function like the `Math` object. All properties and methods of the `Reflect` object are static. In fact, the `Reflect` object is a new `API` provided by `ES6` for manipulating objects, and the main purposes of this `API` design are:
* Move some language-internal methods of the `Object` object to the `Reflect` object, by which these internal methods can be accessed through `Reflect`, such as the `Object.defineProperty` method.
* Modify the results returned by certain `Object` methods, for example, the `Object.defineProperty(obj, name, desc)` method throws an exception when it fails to define a property, while the `Reflect.defineProperty(obj, name, desc)` method returns `false` when the operation fails.
* Turn all operations of `Object` into function behaviors, for example, the imperative `name in obj` and `delete obj[name]` of `Object` are equivalent to `Reflect.has(obj, name)` and `Reflect.deleteProperty(obj, name)`.
* Correspond the methods of the `Reflect` object one by one with the methods of the `Proxy` object, as long as a method can be defined on the `Proxy` object, `Reflect` can also find it.

## Methods

### Reflect.apply()
`Reflect.apply(target, thisArgument, argumentsList)`  
The static method `Reflect.apply()` invokes the target function with a specified `this` value and arguments, similar to `Function.prototype.apply()`.

* `target`: The target function.
* `thisArgument`: The `this` object to be used when the target function is called.
* `argumentsList`: An array-like object containing the arguments to be passed to the target function when it is called.
* `return`: The result of calling the given function with the specified `this` value and arguments.

```javascript
var obj = {name: "11"};
function target(a, b){
    console.log(this.name);
    console.log(a, b);
}
Reflect.apply(target, obj, [1, 2]); // 11 // 1 2
```

### Reflect.construct()
`Reflect.construct(target, argumentsList[, newTarget])`  
The behavior of the `Reflect.construct()` method is similar to using the `new` operator to construct a function, which is equivalent to executing `new target(...args)`.

* `target`: The target constructor function to be called.
* `argumentsList`: An array-like object of arguments to be passed when the target constructor function is called.
* `newTarget`: Optional, the constructor object that will be the prototype for the newly created object, with default value as `target`.

```javascript
function Target(a, b){
    console.log(a, b);
}
var instance = Reflect.construct(Target, [1, 2]); // 1 2
console.log(instance instanceof Target); // true
```

### Reflect.defineProperty()
`Reflect.defineProperty(target, propertyKey, attributes)`  
The `Reflect.defineProperty()` method is almost equivalent to the `Object.defineProperty()` method, with the only difference being that it returns a `Boolean` value.

* `target`: The target object.
* `propertyKey`: The name of the property to be defined or modified.
* `attributes`: The property descriptor to be defined or modified.
* `return`: A `Boolean` value indicating whether the property was successfully defined.

```javascript
var obj = {_name: 11};
var success = Reflect.defineProperty(obj, "name", {
    get:function(){
        console.log("getter");
        return obj._name;
    }
})
console.log(success); // true
console.log(obj.name); // getter // 11
```

### Reflect.deleteProperty()
`Reflect.deleteProperty(target, propertyKey)`  
The `Reflect.deleteProperty()` method allows for the deletion of properties, similar to the `delete operator`, but it is a function.

* `target`: The target object from which to delete the property.
* `propertyKey`: The name of the property to be deleted.
* `return`: A `Boolean` value indicating whether the property was successfully deleted.

```javascript
var obj = {name: 11};
var success = Reflect.deleteProperty(obj, "name");
console.log(success); // true
console.log(obj.name); // undefined
```

### Reflect.get()
`Reflect.get(target, propertyKey[, receiver])`  
The `Reflect.get()` method is similar to reading a property from the object `target[propertyKey]`, but it is invoked using a function.

* `target`: The target object from which to retrieve the value.
* `propertyKey`: The key of the value to be retrieved.
* `receiver`: If a `getter` is specified in the `target` object, then `receiver` is the `this` value when the `getter` is called.
* `return`: The value of the property.

```javascript
var obj = {name: 11};
var name = Reflect.get(obj, "name");
console.log(name); // 11
```

### Reflect.getOwnPropertyDescriptor()
The method `Reflect.getOwnPropertyDescriptor()` is similar to the `Object.getOwnPropertyDescriptor()` method. It returns the property descriptor of the given property if it exists in the object, otherwise it returns `undefined`.

* `target`: The target object to search for the property.
* `propertyKey`: The name of the property for which to get the property descriptor.

```javascript
var obj = {name: 11};
var des = Reflect.getOwnPropertyDescriptor(obj, "name");
console.log(des); // {value: 11, writable: true, enumerable: true, configurable: true}
```

### Reflect.getPrototypeOf()
The method `Reflect.getPrototypeOf()` is almost identical to the `Object.getPrototypeOf()` method, both of which return the prototype of the specified object, that is, the value of the internal `[[Prototype]]` property.

* `target`: The target object from which to get the prototype.
* `return`: The prototype of the given object. If the given object does not inherit properties, it returns `null`.

```javascript
var obj = {name: 11};
var proto = Reflect.getPrototypeOf(obj);
console.log(proto === Object.prototype); // true
```

### Reflect.has()
The method `Reflect.has()` is similar to the `in` operator, but it is performed through a function execution.

* `target`: The target object.
* `propertyKey`: The property name to check for existence in the target object.
* `return`: Returns a `Boolean` object indicating whether the property exists.

```javascript
var obj = {name: 11};
var exist = Reflect.has(obj, "name");
console.log(exist); // true
```

### Reflect.isExtensible()
The method `Reflect.isExtensible()` determines whether an object is extensible, i.e., whether new properties can be added, similar to the `Object.isExtensible()` method.

* `target`: The object to check for extensibility.
* `return`: Returns a `Boolean` value indicating whether the object is extensible.

```javascript
var obj = {name: 11};
var extensible = Reflect.isExtensible(obj);
console.log(extensible); // true
```

### Reflect.ownKeys()
The method `Reflect.ownKeys()` returns an array of the target object's own property keys.

* `target`: The target object to get its own property keys from.
* `return`: Returns an `Array` consisting of the own property keys of the target object.

```javascript
var obj = {name: 11};
var keys = Reflect.ownKeys(obj);
console.log(keys); // ["name"]
```

### Reflect.preventExtensions()
The method `Reflect.preventExtensions()` prevents new properties from being added to the object, effectively preventing future extensions to the object, similar to `Object.preventExtensions()`.

* `target`: The target object to prevent extensions on.
* `return`: Returns a `Boolean` value indicating whether the target object was successfully set to not be extensible.

```javascript
var obj = {name: 11};
Reflect.preventExtensions(obj);
console.log(Reflect.isExtensible(obj)); // false
```

### Reflect.set()
The method `Reflect.set()` sets a property on an object.

* `target`: The target object on which to set the property.
* `propertyKey`: The name of the property to set.
* `value`: The value to set.
* `receiver`: If a `setter` is encountered, the `receiver` is the `this` value when the `setter` is called.
* `return`: Returns a `Boolean` value indicating whether the property was successfully set.

```javascript
var obj = {name: 1};
Reflect.set(obj, "name", 11);
console.log(Reflect.get(obj, "name")); // 11
```

### Reflect.setPrototypeOf()
The method `Reflect.setPrototypeOf()` is the same as the `Object.setPrototypeOf()` method, except for the return type. It sets the prototype of an object, i.e., the internal `[[Prototype]]` property, to another object or `null`. It returns `true` if the operation is successful, otherwise `false`.

* `target`: The target object on which to set the prototype.
* `prototype`: The new prototype of the object, either an object or `null`.
* `return`: Returns a `Boolean` value indicating whether the prototype has been successfully set.

```javascript
var obj = {};
var proto = {name: 11};
Reflect.setPrototypeOf(obj, proto);
console.log(proto === Reflect.getPrototypeOf(obj)); // true
```

## Comparison

```markdown
| `Method Name` | `Object` | `Reflect` |
| --- | --- | --- |
| `defineProperty()` | `Object.defineProperty()` returns the object passed to the function. If the property is not successfully defined on the object, it returns `TypeError`. | If the property is successfully defined on the object, `Reflect.defineProperty()` returns `true`, otherwise it returns `false`. |
| `defineProperties()` | `Object.defineProperties()` returns the object passed to the function. If the properties are not successfully defined on the object, it returns `TypeError`. | `N/A` |
| `set()` | `N/A` | If the property is successfully set on the object, `Reflect.set()` returns `true`, otherwise it returns `false`. If the target is not an `Object`, it throws `TypeError`. |
| `get()` | `N/A` | `Reflect.get()` returns the value of the property. If the target is not an `Object`, it throws `TypeError`. |
| `deleteProperty()` | `N/A` | If the property is deleted from the object, `Reflect.deleteProperty()` returns `true`, otherwise it returns `false`. |
| `getOwnPropertyDescriptor()` | Returns the property descriptor of the given property if `Object.getOwnPropertyDescriptor()` exists on the provided object parameter, otherwise it returns `undefined`. | If the given property exists on the object, `Reflect.getOwnPropertyDescriptor()` returns the property descriptor of the given property. If it doesn't exist, it returns `undefined`. If anything other than an object (primitive value) is passed as the first parameter, it throws `TypeError`. |
| `getOwnPropertyDescriptors()` | `Object.getOwnPropertyDescriptors()` returns an object containing the property descriptors of each property of the passed object. If the passed object does not have owned property descriptors, it returns an empty object. | `N/A` |
| `getPrototypeOf()` | `Object.getPrototypeOf()` returns the prototype of the given object. If there's no inherited prototype, it returns `null`. It throws `TypeError` for non-objects in `ES5`. | `Reflect.getPrototypeOf()` returns the prototype of the given object. If there's no inherited prototype, it returns `null`, and it throws `TypeError` for non-objects. |
| `setPrototypeOf()` | If the prototype of the object is successfully set, `Object.setPrototypeOf()` returns the object itself. If the set prototype is not an `Object` or `null`, or the prototype of the modified object is not extensible, it throws `TypeError`. | If the prototype is successfully set on the object, `Reflect.setPrototypeOf()` returns `true`, otherwise it returns `false` (including whether the prototype is not extensible). If the target is not an `Object`, or the set prototype is not an `Object` or `null`, it throws `TypeError`. |
| `isExtensible()` | If the object is extensible, `Object.isExtensible()` returns `true`, otherwise it returns `false`. If the first parameter is not an object, it throws `TypeError` in `ES5`, and in `ES2015`, it will be coerced to a non-extensible plain object and return `false`. | If the object is extensible, `Reflect.isExtensible()` returns `true`, otherwise it returns `false`. If the first parameter is not an object, it throws `TypeError`. |
| `preventExtensions()` | `Object.preventExtensions()` returns the object that has been made non-extensible. If the parameter is not an object, it throws `TypeError` in `ES5`, and in `ES2015`, if the parameter is a non-extensible plain object, it returns the object itself. | If the object has become non-extensible, `Reflect.preventExtensions()` returns `true`, otherwise it returns `false`. If the parameter is not an object, it throws `TypeError`. |
| `keys()` | `Object.keys()` returns an array of strings that map to the target object's own (enumerable) property keys. If the target is not an object, it throws `TypeError` in `ES5`, but coerces non-object targets to objects in `ES2015`. | `N/A` |
| `ownKeys()` | `N/A` | `Reflect.ownKeys()` returns an array of property names that map to the target object's own property keys. If the target is not an `Object`, it throws `TypeError`. |

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect
```
