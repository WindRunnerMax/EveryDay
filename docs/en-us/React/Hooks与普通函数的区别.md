# The Difference Between Hooks and Ordinary Functions
The term "Hooks" here specifically refers to custom "Hooks". Custom "Hooks" are similar to the ordinary functions we define in that they can encapsulate logic to achieve logic reuse. Hooks are actually a special type of function, and due to their special implementation, there are certain differences between them.

## Description
When I started learning about React Hooks, I was quite puzzled by this question. First, let's take a look at the official documentation. In the section on custom Hooks, it is explained that building your own Hooks allows you to extract component logic into reusable functions. If that's all there is to it, then we could just as well use ordinary functions to achieve logic reuse without the need to use Hooks.  
Of course, it's important to first clarify one definition here: custom "Hooks" are very specifically defined, they start with "use" and can call other "Hooks" internally. When referring to ordinary functions in this context, we mean the functions we usually write to extract common logic, not the approach of calling other "Hooks" within the functions we define. If other "Hooks" are called within an ordinary function, then that function is no longer an ordinary function. Besides violating the naming convention for "Hooks", it becomes a complete definition of a "Hooks".  
Essentially, the most important concepts in coding are logic and data. When the documentation mentions extracting component logic into reusable functions, the emphasis is on the word "logic". However, using the same custom "Hooks" in two components does not share the "State". If we simply write an ordinary function, its data is shared among all callers, because it is just a module. Of course, the premise is that we don't create a new object to hold the state. Here we are only discussing the most basic way of calling, because Hooks are also called in a very plain manner.  
So, if we use Hooks, we can call useState, useRef, and other Hooks, which provides access to the "Fiber", effectively allowing us to store the state or data within the current node, rather than sharing it globally as with ordinary functions. Of course, if global state sharing is needed, a state management solution is a better choice, rather than global variables.

## Example
Let's take an example of a data request. We usually encapsulate a "request" function. If we need to add a cache layer to this function, then there is logic and data reuse. The difference between the implementation of logic and data caching reuse in ordinary functions and custom "Hooks" is evident here.

### Ordinary Function
In an ordinary function, it acts as a module, so its data is shared among all callers. Therefore, we can use a Map to store the data, achieving data reuse. It's important to note that if our "url" needs to return different data when called by different components, for example, based on the "referer" request header to determine the data to be returned, then this kind of globally shared data is not suitable. It will be necessary to add an additional parameter to distinguish the different data, resulting in a coupling of logic and data, which is not ideal. Of course, this is based on specific requirements. Here we are just giving an example, as in actuality, what's most suitable is best.  

```js
const cache = new Map();
export fetch = (url) => {
  if (cache.has(url)) {
    return cache.get(url);
  }
  const promise = fetch(url);
  cache.set(url, promise);
  return promise;
}
```

### Custom Hooks
In custom "Hooks", data is locked within the "Fiber", meaning that the scope of data sharing is within the current component node. Relative to global state sharing, the granularity is finer. Of course, if we want to directly share data globally, this approach is not suitable, and a global state management might be necessary. Still, as mentioned earlier, this is just an example, and what's most suitable in actuality is best.  

```js
const useRequest = (url) => {
    const map = useRef(new Map());
    if (map.current.has(url)) {
        return map.current.get(url);
    }
    const promise = fetch(url);
    map.current.set(url, promise);
    return promise;
}
```

## Summary
To summarize the differences between the two:
* The Hooks provided by the official source should only be called within React function components/custom Hooks, and not in ordinary function calls.
* Custom Hooks can utilize built-in Hooks such as useState, useRef, etc., whereas normal functions cannot. This allows access to the "Fiber" via the built-in Hooks and enables data storage at the component level.
* Custom Hooks must be prefixed with "use", whereas this is not a requirement for ordinary functions. Using "use" is not a syntax or mandatory practice, it's more of a convention, similar to the semantics of "GET" requests not carrying a "Body". The purpose of using "use" at the beginning is to let React recognize this as a Hook, thus checking these rules and constraints. Usually, it is recommended to use ESLint in conjunction with eslint-plugin-react-hooks to check these rules and avoid incorrect use in advance.

## Daily Quiz

```markdown
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.zhihu.com/question/491311403
https://zh-hans.reactjs.org/docs/hooks-custom.html
https://stackoverflow.com/questions/60133412/react-custom-hooks-vs-normal-functions-what-is-the-difference
```