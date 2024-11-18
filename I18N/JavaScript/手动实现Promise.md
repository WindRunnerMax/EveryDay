# Manually Implementing Promise
`JavaScript` is a single-threaded language that achieves asynchronous operations by maintaining an execution stack and task queue. `setTimeout` and `Ajax` are typical examples of asynchronous operations, and `Promise` is a solution for asynchronous operations, used to represent the eventual completion or failure of an asynchronous operation, along with its result value.

## Syntax

```javascript
new Promise( function(resolve, reject) { /* executor */
    // Execution code that needs to specify the positions of the resolve and reject callbacks
});
```

The `executor` is a function with two parameters: `resolve` and `reject`. When the `Promise` constructor is called, the `executor` function is immediately executed, with the `resolve` and `reject` functions passed as parameters to the `executor`. When the `resolve` and `reject` functions are called, they respectively change the promise's state to fulfilled or rejected. The `executor` typically performs some asynchronous operations internally, and once the asynchronous operation is completed, either the `resolve` function is called to change the promise's state to fulfilled, or the `reject` function is called to change the promise's state to rejected. If an error is thrown within the `executor` function, the `promise` state is rejected, and the return value of the `executor` function is ignored.

### States
In essence, a `Promise` is a state machine, specifically a finite-state machine, where the output can be explicitly calculated based on the current input and state.
```
pending: Initial state, neither fulfilled nor rejected.
fulfilled: Indicates successful completion of the operation.
rejected: Indicates operation failure.
```

A `Promise` object only changes state from `pending` to either `fulfilled` or `rejected`. Once in the `fulfilled` or `rejected` state, the status does not change.

## Implementation

```javascript
// Define the _Promise constructor function
function _Promise(fn) {
    this.status = "pending"; // Define the property to store the status // Give the initial status as pending
    this.value = null; // value of resolve
    this.reason = null; // reason of reject
    this.onFulfilled = []; // Store the first callback function registered in the then method
    this.onReject = []; // Store the second callback function registered in the then method
    
    var handler = funct => { // Event handling function
        if(typeof(funct) === "function") { // Only execute if it's a function
            if(this.status === "fulfilled") funct(this.value); // Execute and pass the value
            if(this.status === "rejected") funct(this.reason); // Execute and pass the reason
        }
    }
    
    // Implement the resolve callback
    var resolve = value => { // Using arrow function mainly to bind the this keyword
        this.status = "fulfilled"; // Set the status
        this.value = value; // Get the result
        if(value instanceof _Promise){ // Check if the returned value is an instance of Promise
            value.onFulfilled = this.onFulfilled; // If yes, then chain call it
            return value;
        } 
        setTimeout(() => { // Use setTimeout to place the callback function in the task queue, not blocking the main thread, execute asynchronously. In reality, the promise's callback is placed in the microqueue, while the setTimeout's callback is placed in the macroqueue
            try {
                this.onFulfilled.forEach(handler); // Hand over to the event handler
            }catch (e){
                console.error(`Error in promise: ${e}`); // Print the exception
                reject(e); // Reject
            }
        }, 0)
    }
    
    // Implement rejected
    var reject = reason => { // Using arrow function mainly to bind the this keyword
        this.status = "rejected"; // Set the status
        this.reason = reason; // Get the result
        setTimeout(() => { // Place it in the task queue
            try {
                this.onReject.forEach(handler); // Hand over to the event handler
            }catch (e){
                console.error(`Error in promise: ${e}`); // Print the exception
            }
        }, 0)
    }
    
    fn(resolve, reject); // Execute
}

// Define then
// value receives the result from the upper layer, function handles its own logic, and return it to the lower layer
_Promise.prototype.then = function(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v; // Convert to a function
    onRejected = typeof onRejected === 'function' ? onRejected : r => r; // Convert to a function
    return new _Promise((resolve, reject) => { // Return a new _Promise
        this.onFulfilled.push((value) => { // Place the callback function on onFulfilled
            resolve(onFulfilled(value)); // Execute and pass it
        });
        this.onReject.push((value) => { // Place the callback function on onReject
            reject(onRejected(value)); // Execute and pass it
        });
    })
}
```

```javascript
// Test
var promise = new _Promise(function(resolve,reject){
     var rand = Math.random() * 2;
      setTimeout(function(){
         if(rand < 1) resolve(rand);
         else reject(rand);
     },1000)
})
promise.then((rand) => {
    console.log("resolve",rand); // callback for resolve
}, (rand) => {
    console.log("reject",rand); // callback for reject
}).then(function(){ // continue after resolve
    return new _Promise(function(resolve,reject){
     var rand = Math.random() * 2;
      setTimeout(function(){
         resolve(rand);
     },1000)
})
}).then(function(num){ // continue after resolve
    console.log(num,"continue execution and receive parameter");
    return 1;
}).then(function(num){
    console.log(num,"continue execution and receive parameter");
})

/*
  The implemented _Promise is relatively simple
  The actual Promise used is more complex, with considerations for various situations
  In the example, only the Promise constructor and then are implemented. In practice, there are also implementations for catch, Promise.all, Promise.race, Promise.resolve, Promise.reject, etc.
 */
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```


## References

```
https://zhuanlan.zhihu.com/p/47434856
https://www.jianshu.com/p/27735abb91eb
https://segmentfault.com/a/1190000013170460
```