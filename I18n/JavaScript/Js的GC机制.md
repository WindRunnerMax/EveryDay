# The Garbage Collection Mechanism in JavaScript

In the seven basic types of `Js`, the reference type `Object` occupies a large and variable memory space. Objects are actually stored in the heap memory and their pointers are stored in the stack memory. Access to objects is done by reference. Variables executed in the stack area are accessed by value. When the scope is destroyed, the variables are also destroyed. However, for heap area variables accessed by reference, even if they disappear from one scope, there may still be references in outer or other scopes, so they cannot be directly destroyed. At this point, it is necessary to calculate whether the heap variable belongs to a no longer needed variable and decide whether it needs to be reclaimed by memory. In `Js`, there are mainly two garbage collection algorithms: reference counting and mark-and-sweep.

## Reference Counting Algorithm
For the reference counting garbage collection algorithm, whether an object is no longer needed is simplified to whether there are any other variables or objects referencing it. If no reference points to the object, the garbage collection mechanism will reclaim the object. Here, the concept of objects not only specifically refers to `JavaScript` objects but also includes function scopes or global lexical scopes. The reference counting garbage collection algorithm is less commonly used, mainly in lower versions of `IE` browsers such as `IE6` and `IE7`.

```javascript
var obj = {
    a : {
        b: 11
    }
}
// At this point, two objects are created. One is referenced as the `a` property of the other, called object 1, and the other is referenced by the obj variable, called object 2.
// At this point, both objects have variables referenced and cannot be reclaimed.

var obj2 = obj;
// At this point, object 2 referenced by obj has been referenced by both obj and obj2 variables.

obj = null;
// The reference of obj to object 2 is released. At this point, object 2 still has a reference from obj2.

var a2 = obj2.a;
// Reference to object 1. At this point, object 1 has two references: a and a2.

obj2 = null;
// One reference to object 2 is released. At this point, the reference count of object 2 is 0 and it can be garbage collected.
// The reference to the a property of object 2 is released. At this point, object 1 only has a2 as a reference.

a2 = null;
// The reference of a2 to object 1 is released. At this point, object 1 can be garbage collected.
```

However, the reference counting garbage collection algorithm has a limitation. When objects are circularly referenced, it causes memory leaks, meaning that the reference counting garbage collection algorithm cannot handle objects with circular references.

```javascript
function funct() {
    var obj = {}; // Named as object 1, the reference count is 1 at this point
    var obj2 = {}; // Named as object 2, the reference count is 1 at this point
    obj.a = obj2; // obj's a property references obj2, so object 2's reference count is 2
    obj2.a = obj; // obj2's a property references obj, so object 1's reference count is 2
    return 1;
    // At this point, the obj and obj2 variables in the execution stack are destroyed, and the reference count of objects 1 and 2 is decreased by 1.
    // The reference count of object 1 is 1, and the reference count of object 2 is 1. Both objects will not be garbage collected.
}

funct();
// Two objects are created and referenced to each other, forming a loop. After they are called, they will leave the function scope. Thus, they are no longer needed and can be reclaimed. However, the reference counting algorithm considers that they both have at least one reference, so they will not be reclaimed.
```

## Mark-and-Sweep Algorithm
For the mark-and-sweep garbage collection algorithm, whether an object is no longer needed is defined as whether the object can be reached. This algorithm sets a root object, called `root`, in JavaScript, where the root is the global object. The garbage collector starts from the root, finds all the objects referenced from it, and then finds the objects referenced by these objects, and so on, continuously searching downward. Starting from the root, the garbage collector finds all reachable objects and collects all unreachable objects, thus solving the problem of circular references. All modern browsers use the mark-and-sweep garbage collection algorithm, and all improvements to the JavaScript garbage collection algorithm are based on improvements to the mark-and-sweep algorithm.
* When the garbage collector runs, it marks all variables stored in memory.
* Then, it removes the marks of variables in the runtime environment as well as the variables referenced by the variables in the environment.
* Afterward, the variables that still have marks are considered ready for deletion because they are no longer accessible in the runtime environment.
* Finally, the garbage collector completes the memory cleanup, destroys the marked values, and reclaims the memory space they occupied.

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.jianshu.com/p/18532079bc2a
https://segmentfault.com/a/1190000014383214
https://www.cnblogs.com/libin-1/p/6013490.html
https://www.oschina.net/question/253614_2216515
http://www.ruanyifeng.com/blog/2017/04/memory-leak.html
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Memory_Management
```