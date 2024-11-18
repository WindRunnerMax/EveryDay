# Vuex and Ordinary Global Objects
When building applications, it is not difficult to ensure the uniqueness of each component in modular development and development by multiple people. It is inevitable that multiple components will share states, and maintaining multiple shared states is very troublesome. Anyone can operate and modify shared states, which leads to unpredictable operations on shared states. Therefore, a unified management is needed for maintenance.

## Description
In many business scenarios, different module components do need to share data and also need to be modified. This gives rise to a contradiction in software design: module components need to share data and the data may be modified arbitrarily, leading to unpredictable results. To solve this contradiction, a design and architectural concept is proposed in software design, which manages the global state uniformly and requires operations such as retrieval and modification to be done in a specific way, much like following the traffic rules on the road; just as one can only turn right at the right-turn zebra crossing, it provides a unified entry for managing global state, making the code structure clear and easier to maintain.  
From the perspective of software design, the state management pattern is a design pattern that manages and operates globally shared state data based on a unified convention and rule. You must follow this design concept and architecture to perform `CRUD` on the shared state data in your project, so the so-called state management pattern is a design pattern in software design.

## Global Objects
When the actual source of the original `data` object in a `Vue` application is accessed, a `Vue` instance simply acts as a proxy for access. However, if there is a state that needs to be shared among multiple instances, it can be achieved simply by maintaining a global variable.  

```javascript
var global = {};

var vmA = new Vue({
    data: global
})

var vmB = new Vue({
    data: global
})
```

Now, when `global` is changed, both `vmA` and `vmB` will automatically update their views, and each instance of child components will also access `global` through `this.$root.$data`. We now have a single data source, but debugging will become very troublesome. At any time and in any part of our application, after any data change, there will be no record of the changes, making the application very difficult to maintain.  
To solve this problem, you can implement a simple `store` pattern. All changes to the `state` in the `store` should be managed in the `store`'s own `action`. This centralized state management makes it easier to understand which type of changes will occur and how they will be triggered, and when errors occur, we will also have a log recording of what happened before the `bug` occurred.

```javascript
var store = {
    debug: true,
    state: {
        message: "Hello!"
    },
    setMessageAction: function(val) {
        if(this.debug) console.log("setMessageAction triggered with", newValue);
        this.state.message = val;
    },
    clearMessageAction: function() {
        if(this.debug) console.log("clearMessageAction triggered");
        this.state.message = "";
    }
}
```

## Vuex
`Vuex` is a state management pattern specially designed for `Vue.js` applications. It uses a centralized storage to manage the states of all components in the application and ensures that states change in a predictable way according to corresponding rules.  
The core of every `Vuex` application is the `store` – basically a container that holds most of the application's `state`. `Vuex` differs from simple global objects in the following two ways:

* The state storage in `Vuex` is responsive. When a `Vue` component reads the state from the `store`, if the state in the `store` changes, the corresponding component will be efficiently updated.
* You cannot directly change the state in the `store`. The only way to change the state in the `store` is to explicitly commit a `mutation`. This enables us to easily track the changes of each state.

In fact, we can get more advantages of using `Vuex`:
* It provides a time-traveling feature.
* `Vuex` specializes in state management. All data modifications are done through a unified method and are traceable.
* It is more convenient to do log collection and tracking with `Vuex`.
* `Vuex` does not pollute global variables and solves the communication problems between parent components and child components, as well as between sibling components.

Of course, if the project is small enough, using `Vuex` may be cumbersome and redundant. If the application is simple enough, it is best not to use `Vuex` – a simple `store` pattern as mentioned above would be sufficient.  
In the example below, we use the approach of submitting `mutation` instead of directly changing `store.state.count` because we want to more clearly track the changes in the state. This simple convention makes your intention more obvious, making it easier for you to interpret the changes in the application's internal state as you read the code. In addition, this approach also gives us the opportunity to implement some debugging tools that can record each state change and save state snapshots.

```javascript
import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);
```

```javascript
const store = new Vuex.Store({
    state: {
        count: 0
    },
    mutations: {
        increment: function(state) {
            state.count++;
        }
    }
})

store.commit("increment");
console.log(store.state.count); // 1
```

Because the state in `store` is reactive, accessing the state in the `store` within a component is as simple as returning it in a computed property. Triggering a change is as simple as committing a `mutation` within the component's `methods`.

```javascript
import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);


const store = new Vuex.Store({
    state: {
        count: 0
    },
    mutations: {
        increment: state => state.count++,
        decrement: state => state.count--
    }
})

new Vue({
    el: "#app",
    store,  
    computed: {
        count: function() {
            return this.$store.state.count;
        }
    },
     methods: {
        increment: function() {
            this.$store.commit("increment");
        },
        decrement: function() {
            this.$store.commit("decrement");
        }
    }
})
```



## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://vuex.vuejs.org/zh/
https://www.jianshu.com/p/d296df048a77
https://juejin.cn/post/6844903624137523213
https://segmentfault.com/q/1010000013196679
http://ysha.me/2018/09/04/%E7%90%86%E8%A7%A3vuex/
https://cn.vuejs.org/v2/guide/state-management.html
```