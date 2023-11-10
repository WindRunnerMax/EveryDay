# Stacks in JavaScript
Heap is dynamically allocated memory, its size is not fixed and it is not automatically released. Stack is a memory space allocated automatically, and it is automatically released during the execution of the code.

## Stack Area
In the stack memory, an environment for the execution of `Js` code is provided. Scope and function calls are all executed in the stack memory.  
In `Js`, basic data types `String`, `Number`, `Boolean`, `Null`, `Undefined`, `Symbol` occupy small space and have fixed size. Their values are directly saved in the stack memory and are accessed by value. For the reference type `Object`, its pointer is placed in the stack memory, pointing to the actual address in the heap memory, and it is accessed by reference.  
Regarding the call stack, every time a function is called, the interpreter adds the function to the call stack and starts executing it. If a function currently executing in the call stack calls another function, the new function will also be added to the call stack. Once this function is called, it will be executed immediately. After the current function finishes execution, the interpreter removes it from the call stack and continues executing the remaining code in the current execution environment. When the allocated call stack space is fully occupied, it will cause a stack overflow error.

```javascript
// Console Debugging
var a = 1;
function s(){
    var b = 11;
    debugger; // Breakpoint
}
function ss(){
    s();
}
ss();
/*
...
Call Stack
> s (VM383:4)
  ss (VM383:7)
  (anonymous) (VM383:9)
Scope
  Local
    b: 11
    this: Window
  Global Window
    ...
...
*/
```

## Heap Area
Variables of the reference type `Object` occupy a large and unfixed space. The actual objects are stored in the heap memory and the pointers to the objects are stored in the stack memory. Access to objects is done by reference in the heap area, and the memory in the heap area is not automatically released as the program runs. This requires the implementation of garbage collection mechanism `GC`. It's important to note that in `Js`, there is no manual memory release function like `free()` in `C` to release memory in the heap area. All heap memory recycling needs to be implemented through `Js` garbage collection mechanism.  
Variables executed in the stack area are accessed by value, and when their scope is destroyed, the variables are also destroyed. However, for the heap area variables accessed by reference, even after a scope disappears, there may still be references in an outer scope or other scopes, and they cannot be directly destroyed. In such cases, it is necessary to calculate whether the heap area variable is no longer needed through an algorithm and then decide whether memory needs to be recycled. In `Js`, there are mainly two garbage collection algorithms: reference counting and mark-and-sweep.

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.zhihu.com/question/42231657
https://segmentfault.com/a/1190000009693516
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Memory_Management
```