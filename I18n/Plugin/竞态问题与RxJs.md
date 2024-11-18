# Race Condition and RxJs
A race condition typically refers to a situation in multi-threaded programming where the same conditions result in unpredictable outcomes. Although `Js` is a single-threaded language, the introduction of asynchronous programming also gives rise to race conditions, which can usually be resolved using `RxJs`, making it easier to write asynchronous or callback-based code.

## Race Condition
As mentioned earlier, a race condition typically occurs in multi-threaded programming when multiple threads have read-modify operations on a shared variable, leading to erroneous results when one thread reads a shared variable and another changes it before the former completes its related operations. At least one thread in this scenario has an updating operation. If all threads are performing read operations, there are no race conditions. In general, at least the pattern of `thread1#load - thread2#update` is required. When one thread updates a shared variable, the other thread, whether reading or updating the variable, is susceptible to errors, either reading dirty data or missing update results. Typically, locking or atomic operations are used to eliminate the impact of race conditions.

Returning to `Js`, although it is a single-threaded language, race conditions can occur due to the introduction of asynchronous programming. For example, when making network requests, if we need to display data based on input `A` and pop up `B`, and based on input `B` and pop up `C`, it's important to note that the returned data needs to be obtained through network requests. Suppose we rapidly input `A` followed by `B`, and under the condition of a completely stable network, we can obtain the pop-ups `B`, `C` in the correct sequence. However, if there is network fluctuation and the packet returning `B` gets blocked while `C` arrives first, the resulting execution sequence may be `C`, `B`. This is just a matter of sequence. If, for example, we are searching for results and preferably want to display the search results for the last input, following the previous scenario, if we input `AB` in sequence, we expect to get `C` but could also end up with `B`.

```javascript
const fetch = text => {
    if (!text) return Promise.resolve("");
    const response = String.fromCharCode(text[text.length - 1].charCodeAt(0) + 1);
    return new Promise(resolve => {
        setTimeout(resolve, Math.random() * 1000, response);
    });
};

// Simulating rapid input of `A B`
// Output is alternately `B C` and `C B`
// If the values are not just printed but also written to the page, it results in display errors
fetch("A").then(console.log);
fetch("AB").then(console.log);
```

Typically, for these types of requirements, we would implement a debounce function during input, so the first input gets erased, thus avoiding rapid input race conditions. This approach aims to reduce the frequency to ensure ordered requests. However, it's important to use "as much as possible" as there's no guarantee of resolving race conditions caused by network issues even if the user pauses for `300ms`, which is the value set below. If the delay is set too long, it results in the user having to wait at least for `n ms` before a response, which does not provide a good user experience.

```javascript
const fetch = text => {
    if (!text) return Promise.resolve("");
    const response = String.fromCharCode(text[text.length - 1].charCodeAt(0) + 1);
    return new Promise(resolve => {
        setTimeout(resolve, Math.random() * 1000, response);
    });
};

const debounce = function (time, fn){
    let timer = null;
    return (...args) => {
        clearTimeout(timer);
        timer = null;
        timer = setTimeout(() => fn(...args), time);
    };
};

const request = param => {
    fetch(param).then(console.log);
};
const debouncedRequest = debounce(300, request);
debouncedRequest("A");
debouncedRequest("AB");
```

So what other solutions are there? Perhaps we can start with ensuring order. We can attach an identifier to the request, and after the request is returned, render based on the identifier. This requires a modification to our `fetch` function to also include the request parameters. Although this approach seems to completely resolve race conditions, it may not appear very elegant. Perfection-seeking individuals might find it a bit complicated, as the result of this code segment relies on the execution order of two asynchronous logics and requires additional code to control this execution order, usually referred to as a race hazard.

```javascript
const fetch = param => {
    if(!param) return Promise.resolve({param, response: ""});
    const response = String.fromCharCode(param[param.length - 1].charCodeAt(0) + 1);
    return new Promise(resolve => {
        setTimeout(resolve, Math.random() * 1000, {param, response});
    })
}

let tag = "";
const request = param => {
    tag = param;
    fetch(param).then((res) => {
        if(res.param === tag) console.log(res.response);
    });
}
request("A");
request("AB");
```

Of course, there are many other solutions to handle this problem. For example, when initiating a request after inputting, adding a global `loading` overlay to prevent users from continuing to input before the service responds. Or, when making a second request, cancel the previous request, similar to the function returned by `useEffect` to cancel the previous side effect.

As for the issue of request cancellation, it doesn't necessarily mean the server doesn't receive the data packet. It simply indicates that the browser stops handling the response to this request, or perhaps we directly locally ignore the server's response. In reality, for the most part, network fluctuations are relatively minor. When a request is initiated, the data packet has already been sent. If you perform a cancellation operation, for example, sending out a packet to inform the server to cancel the previous request, in most cases, this cancellation packet cannot catch up with the previously sent request data packet. By the time this data packet arrives, the server may have already processed it. Therefore, if this operation is used, it is basically an ineffective operation. Thus, request cancellation currently only means that the browser cancels processing the response to this request, and does not mean that the server truly doesn't receive the data.

## RxJs
`RxJs` is the abbreviation for `Reactive Extensions for JavaScript`, originating from `Reactive Extensions`. It is an application library for asynchronous programming based on observable data streams `Stream` combined with the observer and iterator patterns. `RxJs` is the implementation of `Reactive Extensions` in `JavaScript`. It is used to write asynchronous and event-based programs using observable sequences, and provides a core type `Observable`, as well as associated types `Observer`, `Schedulers`, `Subjects`, and array operation operators inspired by `[Array#extras]` such as `map`, `filter`, `reduce`, `every`, and so on. These array operators can handle asynchronous events as collections. `RxJs` has Chinese documentation at `https://cn.rx.js.org/manual/overview.html`, and you can visualize the effects by defining functions at `https://rxviz.com/`.

The basic concepts in `RxJs` for managing asynchronous events are:
* `Observable`: Represents a concept - a collection of future values or events that can be called.
* `Observer`: A collection of callback functions that knows how to listen to values provided by `Observable`.
* `Subscription`: Represents the execution of `Observable`, mainly used to cancel the execution of `Observable`.
* `Operators`: Functional programming style pure functions, using operators such as `map`, `filter`, `concat`, `flatMap`, and so on to handle collections.
* `Subject`: Similar to `EventEmitter`, it is the only way to push values or events to multiple `Observers`.
* `Schedulers`: Used to control concurrency and is the central coordinator, allowing us to coordinate calculations, such as `setTimeout`, `requestAnimationFrame`, among others.

Getting started with `RxJs` can be quite challenging, and the most direct experience is: when reading articles, everything is dazzling, but when writing code, you don't know anything. Here, we are only using `RxJs` to handle the problem we mentioned earlier. If you want to delve deeper, you should first take a look at the documentation.

Now, let's use `RxJs` to solve the initial problem. You can see that the code is very concise. Here we took a shortcut by directly exposing the `observer` of `Observable.create`. In practice, because it is event-triggered, it is usually more common to use `Observable.fromEvent` to bind events. In this demonstration, we need to trigger the event ourselves, which is `runner.next`. The most important point here is leveraging `switchMap`, which helps us manage the sequence on the stream, canceling the execution of the previous callback. In the example below, you can see that it only outputs `C`, achieving the desired effect.

```javascript
// This piece of code can be directly run in the console of `https://cn.rx.js.org/`
const fetch = text => {
    if(!text) return Promise.resolve("");
    const response = String.fromCharCode(text[text.length - 1].charCodeAt(0) + 1);
    return new Promise(resolve => {
        setTimeout(resolve, Math.random() * 1000, response);
    })
}

let runner;
const observable = Rx.Observable.create(observer => runner = observer);
observable
//   .debounceTime(300) // You can add debounce here
  .switchMap(param => fetch(param))
  .subscribe(console.log);

runner.next("A");
runner.next("AB");
```


## Daily Question
```
https://github.com/WindrunnerMax/EveryDay/
```

## Reference
```
https://cn.rx.js.org/
https://zhuanlan.zhihu.com/p/104024245
https://www.zhihu.com/question/324275662
https://juejin.cn/post/6910943445569765384
https://juejin.cn/post/6844904051046350862
https://juejin.cn/post/7098287689618685966
https://juejin.cn/post/6970710521104302110
```