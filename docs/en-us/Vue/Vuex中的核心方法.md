# Core Methods in Vuex
`Vuex` is a state management pattern designed specifically for `Vue.js` applications. It adopts a centralized state management system for all components in the application, ensuring that the state changes in a predictable manner according to corresponding rules. The core of every `Vuex` application is the `store`, which is essentially a container that holds the majority of the application's `state`.

## Description
In many business scenarios, different modular components indeed need to share data and perform modifications on it. This raises a contradiction in software design: the need for data sharing among modular components and the possibility of unpredictable results due to arbitrary data modifications. To resolve this contradiction, a design and architectural concept has been proposed in software design, which involves the unified management of global state and the requirement to follow a specific set of rules for operations such as accessing and modifying it. It's similar to the traffic rules that must be obeyed on the road, such as making a right turn on a zebra crossing. This concept provides a unified entry point for global state management, making the code structure clear and more maintainable. From the perspective of software design, the state management pattern is an architectural pattern that encapsulates global shared state data based on unified conventions and rules. You must conform to this design concept and architecture when performing `CRUD` operations on shared state data in your project. Therefore, the so-called state management pattern is a kind of architectural pattern in software design.

The five core concepts of `Vuex` can be summarized as follows:
- `state`: Basic data.
- `getters`: Derived data from the basic data.
- `mutations`: Methods for committing data changes, synchronous operations.
- `actions`: Similar to a decorator, wrapping `mutations` to make them asynchronous.
- `modules`: Modularizing `Vuex`.

## State
`Vuex` uses a single state tree, which means that all the state data is contained in a single object. The `state` is defined as a constructor option, which defines all the basic state parameters we need. In other words, the `state` is the single source of truth (`SSOT`), and each application will only contain one `store` instance. The single state tree allows us to directly locate any specific state segment and easily obtain a snapshot of the entire current application state during debugging. Additionally, the single state tree does not conflict with modularization, as we can still distribute the state and state change events to different sub-modules. Using `Vuex` does not mean that you need to put all the state into `Vuex`. Although putting all the state into `Vuex` makes state changes more explicit and easy to debug, it will also make the code lengthy and less intuitive. If some states strictly belong to a single component, it's best to keep them as the component's local state.

### Accessing Vuex State in Vue Components
The simplest way to read the state from the `store` instance is to return a specific state in a computed property. Since the state storage in `Vuex` is reactive, whenever `store.state.count` changes, the computed property will be recalculated, triggering a reactive update.

```javascript
const store = new Vuex.Store({
    state: {
        count: 0
    }
})
const vm = new Vue({
    //..
    store,
    computed: {
        count: function(){
            return this.$store.state.count;
        }
    },
    //..
})
```

### mapState Helper Function
The `mapState` function returns an object. When a component needs to access multiple states, declaring these states as computed properties may lead to redundancy. To address this issue, we can use the `mapState` helper function to generate computed properties.

```javascript
// In the standalone build, the helper function is Vuex.mapState
import { mapState } from "vuex";

export default {
    // ...
    computed: mapState({
      // Arrow function
        count: state => state.count,

        // Passing a string parameter count is equivalent to state => state.count
        countAlias: "count",

        // Using this
        countPlusLocalState: function(state) {
            return state.count + this.localCount;
        }
    })
    // ...
}
```

If there are also local computed properties in the current component that need to be defined, they can typically be mixed into an external object using the object spread operator `...`.

```javascript
import { mapState } from "vuex";

export default {
    // ...
    computed: {
        localComputed: function() { /* ... */ },
        // Mix this object into the external object using the object spread operator
        ...mapState({
          // ...
        })
        // ...
    }
    // ...
}
```

## Getter
`Getters` are the states derived from the `state` of the `store`. For example, we may need to filter and count the list, and if multiple components need a certain property, we would either need to copy the function for each or extract a shared function and import it in many places, neither of which is ideal. However, `Vuex` allows us to define `getters` in the `store` (similar to computed properties in components). Just like computed properties, the return value of a `getter` will be cached based on its dependencies and will only be recalculated when its dependencies change.

### Accessing Getters

`Getters` receive `state` as their first argument and accept other `getters` as the second argument. If not needed, the second argument can be omitted. Similar to `state`, we can also access `Vuex`'s `getters` through `Vue`'s `Computed`.

```javascript
const store = new Vuex.Store({
    state: {
        count: 0
    },
    getters: {
        // Single argument
        countDouble: function(state) {
            return state.count * 2
        },
        // Two arguments
        countDoubleAndDouble: function(state, getters) {
            return getters.countDouble * 2
        }
    }
})

const vm = new Vue({
    //..
    store,
    computed: {
        count: function() {
            return this.$store.state.count;
        },
        countDouble: function() {
            return this.$store.getters.countDouble;
        },
        countDoubleAndDouble: function() {
            return this.$store.getters.countDoubleAndDouble;
        }
    },
    //..
})
```

### `mapGetters` Helper Function
The `mapGetters` helper function maps the `getters` in the `store` to local computed properties, similar to `state`.

```javascript
import { mapGetters } from "vuex";

export default {
    // ...
    computed: {
        // Use spread operator to mix getters into the computed object
        ...mapGetters([
            "countDouble",
            "CountDoubleAndDouble",
            //..
        ]),
        ...mapGetters({
            // Map this.double to store.getters.countDouble
            double: "countDouble"
        })
    }
    // ...
}
```

## Mutation
Committing a `mutation` is the only way to change the state in the `Vuex` store, and `mutation` must be synchronous; for asynchronous changes, `actions` must be used.

### Defining a Mutation
Each `mutation` has a string event type `type` and a callback function `handler`. The callback function is where we actually make the state changes, and it takes `state` as the first argument and the payload as the second argument (the payload should mostly be an object and can also be omitted).

```javascript
const store = new Vuex.Store({
    state: {
        count: 1
    },
    mutations: {
        // Without payload
        increment: function(state) {
            state.count++;
        },
        // With payload
        incrementN: function(state, payload) {
            state.count += payload.n;
        }
    }
})
```

You cannot directly call a `mutation handler`. This option is more like event registration. To invoke a `mutation handler`, you need to call the `store.commit` method with the corresponding `type`.

```javascript
// No payload
this.$store.commit("increment");
// With payload
this.$store.commit("incrementN", { n: 100 });
```

### Mutations must comply with Vue's responsive rules
Since the states in the `Vuex` store are responsive, when we change the state, the monitoring `Vue` components will automatically update. This also means that the `mutation` in `Vuex` needs to follow some considerations just like using `Vue`:
* It's best to initialize all required properties in your `store` in advance.
* When you need to add a new property to an object, you should use `Vue.set(obj, "newProp", 1)`, or replace the old object with a new one, for example `state.obj = { ...state.obj, newProp: 1 }`.

### Mutations must be synchronous functions
An important principle is that mutations must be synchronous functions. If we are debugging an app and observing the mutation log in `devtools`, each mutation is recorded and `devtools` needs to capture snapshots of the previous and next states. However, if asynchronous functions are used in the mutation, it makes this impossible because when the mutation is triggered, the callback function has not been called yet, and `devtools` doesn't know when the callback function is actually called. In essence, any state changes made in the callback function are untraceable.  
Mixing asynchronous calls in mutations will make your program difficult to debug. When you call two mutations containing asynchronous callbacks to change the state, you can't know when the callbacks will be called and which one will be called first. This is why the concepts of `Mutation` and `Action` need to be distinguished. In `Vuex`, mutations are synchronous transactions, and any state changes caused by the committed keys should be completed at that moment.

### mapMutations helper function
Similar to other helper functions, you can use `this.$store.commit("xxx")` to commit a mutation in the component, or use the `mapMutations` helper function to map component methods to `store.commit` calls.

```javascript
import { mapMutations } from "vuex";

export default {
    //..
    methods: {
        ...mapMutations([
            "increment" // Maps this.increment() to this.$store.commit("increment")
        ]),
        ...mapMutations({
            add: "increment" // Maps this.add() to this.$store.commit("increment")
        })
    }
    // ...
}
```

## Action
`Action` is similar to `mutation`, the difference being that `Action` commits a `mutation` rather than directly changing the state, and `Action` can contain any asynchronous operation.

### Registering actions
The `Action` function accepts a `context` object with the same methods and properties as the `store` instance, so you can call `context.commit` to commit a `mutation`, or use `context.state` and `context.getters` to access the `state` and `getters`.

```javascript
const store = new Vuex.Store({
    state: {
        count: 0
    },
    mutations: {
        increment: function(state) {
            state.count++;
        }
    },
    actions: {
        increment: function(context) {
            setInterval(() => context.commit("increment"), 1000);
        }
    }
})
```

### Dispatching actions
`Action` is triggered through the `store.dispatch` method, and also supports dispatching with payloads and objects.

```javascript
// Dispatching
this.$store.dispatch("increment");

// Dispatching with payload
store.dispatch("incrementN", { n: 10 });

// Dispatching with object
store.dispatch({ type: "incrementN", n: 10 });
```

### mapActions helper function
Using the `mapActions` helper function can map the component's methods to `store.dispatch` calls.

```javascript
import { mapActions } from "vuex";
```

```javascript
export default {
    //..
    methods: {
        ...mapActions([
            "incrementN" // Maps this.incrementN() to this.$store.dispatch("incrementN")
        ]),
        ...mapActions({
            add: "incrementN" // Maps this.add() to this.$store.dispatch("incrementN")
        })
    }
    // ...
}
```

### Combining Actions
`Actions` are usually asynchronous, and in some scenarios, we need to combine `Actions` to handle more complex asynchronous processes. `store.dispatch` can handle the `Promise` returned by the triggered `action` handling function, and `store.dispatch` still returns a `Promise`. One `store.dispatch` can trigger multiple `action` functions in different modules. In this case, the returned `Promise` will only be executed after all the triggered functions are completed.

```javascript
// ...
actions: {
    actionA: function({ commit }) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                commit("someMutation");
                resolve();
            }, 1000)
        })
    }
}
// ...

// When triggering Actions
// ...
store.dispatch("actionA").then(() => {
  // ...
})
// ...

// In another action
// ...
actions: {
    // ...
    actionB: function({ dispatch, commit }) {
        return dispatch("actionA").then(() => {
            commit("someOtherMutation");
        })
    }
}
// ...

// Using async/await
// Of course, getData() and getOtherData() need to return a Promise at this time
actions: {
    actionA: async function({ commit }) {
        commit("gotData", await getData());
    },
    actionB: async function({ dispatch, commit }) {
        await dispatch("actionA");
        commit("gotOtherData", await getOtherData());
    }
}
// ...
```

## Module
Due to the use of a single state tree, all application states are concentrated into a relatively large object. When the application becomes very complex, the `store` object may become quite bulky. To solve the above issue, Vuex allows us to divide the `store` into modules.

### Module Separation
When performing module separation, each module has its own `state`, `mutation`, `action`, `getter`, and even nested sub-modules, i.e., the same way of division from top to bottom.

```javascript
const moduleA = {
    state: () => ({ /* ... */ }),
    mutations: { /* ... */ },
    actions: { /* ... */ },
    getters: { /* ... */ }
}

const moduleB = {
    state: () => ({ /* ... */ }),
    mutations: { /* ... */ },
    actions: { /* ... */ }
}

const store = new Vuex.Store({
    modules: {
        a: moduleA,
        b: moduleB
    }
})

store.state.a // -> moduleA's state
store.state.b // -> moduleB's state
```

### Module Local States
For the `mutation` and `getter` within the module, the first parameter received is the module's local state, and for the `getter` within the module, the root state will be the third parameter.


```javascript
const moduleA = {
    state: { count: 0 },
    mutations: {
        increment: function(state) {
            // state module's local state
            state.count++;
        }
    },
    getters: {
        doubleCount: function(state) {
            return state.count * 2
        },
        sumWithRootCount: function(state, getters, rootState) {
            return state.count + rootState.count;
        }
    }
}
```

Similarly, for the `action` inside the module, the local state is exposed through `context.state`, while the root state is `context.rootState`.

```javascript
const moduleA = {
    // ...
    actions: {
        incrementIfOddOnRootSum: function({ state, commit, rootState }) {
            if ((state.count + rootState.count) % 2 === 1) {
                commit("increment");
            }
        }
    }
}
```

### Namespacing
By default, `action`, `mutation`, and `getter` inside the module are registered in the global namespace, allowing multiple modules to respond to the same `mutation` or `action`. If you want your module to have higher encapsulation and reusability, you can make it a namespaced module by adding `namespaced: true`. Once the module is registered, all its `getter`, `action`, and `mutation` will automatically adjust their names based on the path of the module registration.

```javascript
const store = new Vuex.Store({
    modules: {
        account: {
            namespaced: true,

            // module assets
            state: () => ({ ... }), // The state inside the module is already nested, so using the `namespaced` property will not affect it
            getters: {
                isAdmin: function() { ... } // -> getters['account/isAdmin']
            },
            actions: {
                login: function() { ... } // -> dispatch('account/login')
            },
            mutations: {
                login: function() { ... } // -> commit('account/login')
            },
```

```javascript
// Nested Modules
modules: {
    // Inherit the namespace of the parent module
    myPage: {
        state: () => ({ ... }),
        getters: {
            profile: function() { ... } // -> getters['account/profile']
        }
    },

    // Further nested namespace
    posts: {
        namespaced: true,

        state: () => ({ ... }),
        getters: {
            popular: function() { ... } // -> getters['account/posts/popular']
        }
    }
}
}
```
Enabled namespaced `getter` and `action` will receive localized `getter`, `dispatch`, and `commit`. In other words, when using module assets, you do not need to add a namespace prefix within the same module, and you do not need to modify the code inside the module after changing the `namespaced` attribute.  
If you want to use global `state` and `getter`, `rootState` and `rootGetters` will be passed as the third and fourth arguments to the `getter`, and also passed through the properties of the `context` object to `action`. If you need to dispatch an `action` or commit a `mutation` in the global namespace, pass `{ root: true }` as the third parameter to `dispatch` or `commit`.

```javascript
modules: {
    foo: {
        namespaced: true,

        getters: {
            // In the getter of this module, `getters` has been localized
            // You can use the fourth parameter of the getter to call `rootGetters`
            someGetter(state, getters, rootState, rootGetters) {
                getters.someOtherGetter // -> "foo/someOtherGetter"
                rootGetters.someOtherGetter // -> "someOtherGetter"
            },
            someOtherGetter: state => { /* ... */ }
        },

        actions: {
            // In this module, dispatch and commit are also localized
            // They can accept the `root` property to access root dispatch or commit
            someAction({ dispatch, commit, getters, rootGetters }) {
                getters.someGetter // -> "foo/someGetter"
                rootGetters.someGetter // -> "someGetter"

                dispatch("someOtherAction") // -> "foo/someOtherAction"
                dispatch("someOtherAction", null, { root: true }) // -> "someOtherAction"

                commit("someMutation") // -> "foo/someMutation"
                commit("someMutation", null, { root: true }) // -> "someMutation"
            },
            someOtherAction(ctx, payload) { /* ... */ }
        }
    }
}
```

If you need to register a global `action` in a namespaced module, you can add `root: true` and place the definition of this `action` as a function `handler`.

```javascript
{
    actions: {
        someOtherAction({ dispatch }) {
            dispatch("someAction")
        }
    },
    modules: {
        foo: {
            namespaced: true,

            actions: {
                someAction: {
                    root: true,
                    handler(namespacedContext, payload) { /* ... */ } // -> "someAction"
                }
            }
        }
    }
}
```

When using `mapState`, `mapGetters`, `mapActions`, and `mapMutations` functions to bind namespaced modules, it may be cumbersome to write. In such cases, you can pass the module's namespace string as the first argument to the above functions, so that all bindings automatically use the module as the context. Alternatively, you can create namespace-specific helper functions by using `createNamespacedHelpers`. It returns an object containing component binding helper functions based on the given namespace value.

```javascript
// ...
computed: {
        ...mapState({
            a: state => state.some.nested.module.a,
            b: state => state.some.nested.module.b
        })
    },
    methods: {
        ...mapActions([
            "some/nested/module/foo", // -> this["some/nested/module/foo"]()
            "some/nested/module/bar" // -> this["some/nested/module/bar"]()
        ])
    }
// ...

// ...
computed: {
        ...mapState("some/nested/module", {
            a: state => state.a,
            b: state => state.b
        })
    },
    methods: {
        ...mapActions("some/nested/module", [
            "foo", // -> this.foo()
            "bar" // -> this.bar()
        ])
    }
// ...

// ...
import { createNamespacedHelpers } from "vuex"
const { mapState, mapActions } = createNamespacedHelpers("some/nested/module")
export default {
    computed: {
        // Look up in `some/nested/module`
        ...mapState({
            a: state => state.a,
            b: state => state.b
        })
    },
    methods: {
        // Look up in `some/nested/module`
        ...mapActions([
            "foo",
            "bar"
        ])
    }
}
// ...
```

## Module Dynamic Registration
After creating the `store`, you can use the `store.registerModule` method to register modules. Then, you can access the module's state through `store.state.myModule` and `store.state.nested.myModule`. The module dynamic registration feature allows other `Vue` plugins to use Vuex to manage state by attaching new modules to the store. For example, the `vuex-router-sync` plugin combines `vue-router` and `vuex` by dynamically registering modules to manage the application's routing state. You can also use `store.unregisterModule(moduleName)` to dynamically unload modules. Note that you cannot use this method to unload static modules, i.e., modules declared when creating the store. Additionally, you can use the `store.hasModule(moduleName)` method to check if the module has already been registered with the store.

```javascript
import Vuex from "vuex";

const store = new Vuex.Store({ /* options */ })
```

```javascript
// Register module `myModule`
store.registerModule("myModule", {
  // ...
})
// Register nested module `nested/myModule`
store.registerModule(["nested", "myModule"], {
  // ...
})
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://vuex.vuejs.org/zh/
https://www.jianshu.com/p/1fdf9518cbdf
https://www.jianshu.com/p/29467543f77a
https://juejin.cn/post/6844903624137523213
https://segmentfault.com/a/1190000024371223
https://github.com/Hibop/Hibop.github.io/issues/45
```