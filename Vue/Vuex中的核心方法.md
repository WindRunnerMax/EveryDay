# Vuex中的核心方法
`Vuex`是一个专为`Vue.js`应用程序开发的状态管理模式，其采用集中式存储管理应用的所有组件的状态，并以相应的规则保证状态以一种可预测的方式发生变化。每一个`Vuex`应用的核心就是`store`仓库，`store`基本上就是一个容器，它包含着你的应用中大部分的状态`state`。

## 概述
在大量的业务场景下，不同的模块组件之间确实需要共享数据，也需要对其进行修改操作。也就引发软件设计中的矛盾：模块组件之间需要共享数据和数据可能被任意修改导致不可预料的结果。为了解决其矛盾，软件设计上就提出了一种设计和架构思想，将全局状态进行统一的管理，并且需要获取、修改等操作必须按我设计的套路来，就好比马路上必须遵守的交通规则，右行斑马线就是只能右转一个道理，统一了对全局状态管理的唯一入口，使代码结构清晰、更利于维护。状态管理模式从软件设计的角度，就是以一种统一的约定和准则，对全局共享状态数据进行管理和操作的设计理念。你必须按照这种设计理念和架构来对你项目里共享状态数据进行`CRUD`，所以所谓的状态管理模式就是一种软件设计的一种架构模式。  
关于`Vuex`的五个核心概念，在这里可以简单地进行总结：
* `state`: 基本数据。
* `getters`: 从基本数据派生的数据。
* `mutations`: 提交更改数据的方法，同步操作。
* `actions`: 像一个装饰器，包裹`mutations`，使之可以异步。
* `modules`: 模块化`Vuex`。

## State
`Vuex`使用单一状态树，即用一个对象就包含了全部的状态数据，`state`作为构造器选项，定义了所有我们需要的基本状态参数，也就是说`state`便是唯一数据源`SSOT`，同样每个应用将仅仅包含一个`store`实例。单一状态树让我们能够直接地定位任一特定的状态片段，在调试的过程中也能轻易地取得整个当前应用状态的快照。此外单状态树和模块化并不冲突，我们仍然可以将状态和状态变更事件分布到各个子模块中。使用`Vuex`并不意味着你需要将所有的状态放入`Vuex`，虽然将所有的状态放到`Vuex`会使状态变化更显式和易调试，但也会使代码变得冗长和不直观，如果有些状态严格属于单个组件，最好还是作为组件的局部状态。

### 在Vue组件中获得Vuex状态
从`store`实例中读取状态最简单的方法就是在计算属性中返回某个状态，由于`Vuex`的状态存储是响应式的，所以在这里每当`store.state.count`变化的时候，都会重新求取计算属性，进行响应式更新。

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

### mapState辅助函数
`mapState`函数返回的是一个对象，当一个组件需要获取多个状态时候，将这些状态都声明为计算属性会有些重复和冗余，为了解决这个问题，我们可以使用`mapState`辅助函数帮助我们生成计算属性。

```javascript
// 在单独构建的版本中辅助函数为 Vuex.mapState
import { mapState } from "vuex";

export default {
    // ...
    computed: mapState({
      // 箭头函数
        count: state => state.count,

        // 传字符串参数 count 等同于 state => state.count
        countAlias: "count",

        // 使用 this
        countPlusLocalState: function(state) {
            return state.count + this.localCount;
        }
    })
    // ...
}
```

如果当前组件中还有局部计算属性需要定义，通常可以使用对象展开运算符`...`将此对象混入到外部对象中。

```javascript
import { mapState } from "vuex";

export default {
    // ...
    computed: {
        localComputed: function() { /* ... */ },
        // 使用对象展开运算符将此对象混入到外部对象中
        ...mapState({
          // ...
        })
        // ...
    }
    // ...
}
```

## Getter
`getters`即从`store`的`state`中派生出的状态，例如我们需要对列表进行过滤并计数，如果有多个组件需要用到某个属性，我们要么复制这个函数，或者抽取到一个共享函数然后在多处导入它，这两种方式无论哪种方式都不是很理想。而`Vuex`允许我们在`store`中定义`getter`(可以认为是`store`的计算属性)，就像计算属性一样`getter`的返回值会根据它的依赖被缓存起来，且只有当它的依赖值发生了改变才会被重新计算。

### 访问getters

`getters`接收`state`作为其第一个参数，接受其他`getters`作为第二个参数，如不需要则第二个参数可以省略，与`state`一样，我们也可以通过`Vue`的`Computed`获得`Vuex`的`getters`。

```javascript
const store = new Vuex.Store({
    state: {
        count:0
    }，
    getters: {
        // 单个参数
        countDouble: function(state){
            return state.count * 2
        },
        // 两个参数
        countDoubleAndDouble: function(state, getters) {
            return getters.countDouble * 2
        }
    }
})

const vm = new Vue({
    //..
    store,
    computed: {
        count: function(){
            return this.$store.state.count;
        },
        countDouble: function(){
            return this.$store.getters.countDouble;
        },
        countDoubleAndDouble: function(){
            return this.$store.getters.countDoubleAndDouble;
        }
    },
    //..
})
```

### mapGetters辅助函数
`mapGetters`辅助函数是将`store`中的`getters`映射到局部计算属性，与`state`类似。


```javascript
import { mapGetters } from "vuex";

export default {
    // ...
    computed: {
        // 使用对象展开运算符将 getters 混入 computed 对象中
        ...mapGetters([
            "countDouble",
            "CountDoubleAndDouble",
            //..
        ]),
        ...mapGetters({
            // 映射 this.double 为 store.getters.countDouble
            double: "countDouble"
        })
    }
    // ...
}
```

## Mutation
提交`mutation`是更改`Vuex`中的`store`中的状态的唯一方法，`mutation`必须是同步的，如果要异步需要使用`action`。

### 定义mutation
每个`mutation`都有一个字符串的事件类型`type`和一个回调函数`handler`，这个回调函数就是我们实际进行状态更改的地方，并且它会接受`state`作为第一个参数，提交载荷作为第二个参数(提交荷载在大多数情况下应该是一个对象)，提交荷载也可以省略的。

```javascript
const store = new Vuex.Store({
    state: {
        count: 1
    },
    mutations: {
        // 无提交荷载
        increment: function(state) {
            state.count++;
        },
        // 提交荷载
        incrementN: function(state, payload) {
            state.count += payload.n;
        }
     }
})
```
你不能直接调用一个`mutation handler`，这个选项更像是事件注册，当触发一个类型为`increment`的`mutation`时，调用此函数，要唤醒一个`mutation handler`，你需要以相应的`type`调用`store.commit`方法。

```javascript
//无提交荷载
this.$store.commit("increment");
//提交荷载
this.$store.commit("incrementN", { n: 100 });
```

### Mutations需遵守Vue的响应规则
既然`Vuex`的`store`中的状态是响应式的，那么当我们变更状态时，监视状态的`Vue`组件也会自动更新，这也意味着`Vuex`中的`mutation`也需要与使用`Vue`一样遵守一些注意事项：
* 最好提前在你的`store`中初始化好所有所需属性。
* 当需要在对象上添加新属性时，应该使用`Vue.set(obj, "newProp", 1)`, 或者以新对象替换老对象，例如`state.obj = { ...state.obj, newProp: 1 }`。

### Mutation必须是同步函数
一条重要的原则就是`mutation`必须是同步函数，假如我们正在`debug`一个`app`并且观察`devtool`中的`mutation`日志，每一条`mutation`被记录，`devtools`都需要捕捉到前一状态和后一状态的快照，然而如果在`mutation`中使用异步函数中的回调让这不可能完成，因为当`mutation`触发的时候，回调函数还没有被调用，`devtools`不知道什么时候回调函数实际上被调用，实质上任何在回调函数中进行的状态的改变都是不可追踪的。  
在`mutation`中混合异步调用会导致你的程序很难调试，当你调用了两个包含异步回调的`mutation`来改变状态，你无法知道什么时候回调和哪个先回调，这就是为什么要区分`Mutation`和`Action`这两个概念，在`Vuex`中，`mutation`都是同步事务，任何由提交的`key`导致的状态变更都应该在此刻完成。

### mapMutations辅助函数
与其他辅助函数类似，你可以在组件中使用`this.$store.commit("xxx")`提交`mutation`，或者使用`mapMutations`辅助函数将组件中的`methods`映射为`store.commit`调用。

```javascript
import { mapMutations } from "vuex";

export default {
    //..
    methods: {
        ...mapMutations([
            "increment" // 映射 this.increment() 为 this.$store.commit("increment")
        ]),
        ...mapMutations({
            add: "increment" // 映射 this.add() 为 this.$store.commit("increment")
        })
    }
    // ...
}
```

## Action
`Action`类似于`mutation`，不同在于`Action`提交的是`mutation`，而不是直接变更状态，而且`Action`可以包含任意异步操作。

### 注册actions
`Action`函数接受一个与`store`实例具有相同方法和属性的`context`对象，因此你可以调用`context.commit`提交一个`mutation`，或者通过`context.state`和`context.getters`来获取`state`和`getters`。

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

### 分发actions
`Action`通过`store.dispatch`方法触发，同样也支持以载荷方式和对象方式进行分发。

```javascript
// 分发
this.$store.dispatch("increment");

// 以载荷形式分发
store.dispatch("incrementN", { n: 10 });

// 以对象形式分发
store.dispatch({ type: "incrementN", n: 10 });
```

### mapActions辅助函数
使用`mapActions`辅助函数可以将组件的`methods`映射为`store.dispatch`调用。

```javascript
import { mapActions } from "vuex";

export default {
    //..
    methods: {
        ...mapActions([
            "incrementN" //映射 this.incrementN() 为 this.$store.dispatch("incrementN")
        ]),
        ...mapActions({
            add: "incrementN" //映射 this.add() 为 this.$store.dispatch("incrementN")
        })
    }
    // ...
}
```

### 组合Action
`Action`通常是异步的，在一些场景下我们需要组合`Action`用以处理更加复杂的异步流程，`store.dispatch`可以处理被触发的`action`的处理函数返回的`Promise`，并且`store.dispatch`仍旧返回`Promise`。一个`store.dispatch`在不同模块中可以触发多个`action`函数，在这种情况下，只有当所有触发函数完成后，返回的`Promise`才会执行。

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

// 在触发Actions时
// ...
store.dispatch("actionA").then(() => {
  // ...
})
// ...

// 在另外一个 action 中
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

// 使用 async/await
// 当然此时getData()和getOtherData()需要返回Promise
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
由于使用单一状态树，应用的所有状态会集中到一个比较大的对象，当应用变得非常复杂时，`store`对象就有可能变得相当臃肿，为了解决以上问题，`Vuex`允许我们将`store`分割成模块。

### 模块分割
当进行模块分割时，每个模块拥有自己的`state`、`mutation`、`action`、`getter`，甚至是嵌套子模块，即从上至下进行同样方式的分割。

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

store.state.a // -> moduleA 的状态
store.state.b // -> moduleB 的状态
```

### 模块的局部状态
对于模块内部的`mutation`和`getter`，接收的第一个参数是模块的局部状态，对于模块内部的`getter`，根节点状态会作为第三个参数。

```javascript
const moduleA = {
    state: { count: 0 },
    mutations: {
        increment: function(state) {
            // state 模块的局部状态
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

同样对于模块内部的`action`，局部状态通过`context.state`暴露出来，根节点状态则为`context.rootState`。

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

### 命名空间
默认情况下，模块内部的`action`、`mutation`和`getter`是注册在全局命名空间的——这样使得多个模块能够对同一`mutation`或`action`作出响应。如果希望你的模块具有更高的封装度和复用性，你可以通过添加`namespaced: true`的方式使其成为带命名空间的模块，当模块被注册后，它的所有`getter`、`action`及`mutation`都会自动根据模块注册的路径调整命名。

```javascript
const store = new Vuex.Store({
    modules: {
        account: {
            namespaced: true,

            // 模块内容(module assets)
            state: () => ({ ... }), // 模块内的状态已经是嵌套的了，使用 `namespaced` 属性不会对其产生影响
            getters: {
                isAdmin: function() { ... } // -> getters['account/isAdmin']
            },
            actions: {
                login: function() { ... } // -> dispatch('account/login')
            },
            mutations: {
                login: function() { ... } // -> commit('account/login')
            },

            // 嵌套模块
            modules: {
                // 继承父模块的命名空间
                myPage: {
                    state: () => ({ ... }),
                    getters: {
                        profile: function() { ... } // -> getters['account/profile']
                    }
                },
    
                // 进一步嵌套命名空间
                posts: {
                    namespaced: true,
    
                    state: () => ({ ... }),
                    getters: {
                        popular: function() { ... } // -> getters['account/posts/popular']
                    }
                }
            }
        }
    }
})
```
启用了命名空间的`getter`和`action`会收到局部化的`getter`，`dispatch`和`commit`。换言之，你在使用模块内容`module assets`时不需要在同一模块内额外添加空间名前缀，更改`namespaced`属性后不需要修改模块内的代码。  
如果你希望使用全局`state`和`getter`，`rootState`和`rootGetters`会作为第三和第四参数传入`getter`，也会通过`context`对象的属性传入`action`。若需要在全局命名空间内分发`action`或提交`mutation`，将`{ root: true }`作为第三参数传给`dispatch`或`commit`即可。

```javascript
modules: {
    foo: {
        namespaced: true,

        getters: {
            // 在这个模块的 getter 中，`getters` 被局部化了
            // 你可以使用 getter 的第四个参数来调用 `rootGetters`
            someGetter(state, getters, rootState, rootGetters) {
                getters.someOtherGetter // -> "foo/someOtherGetter"
                rootGetters.someOtherGetter // -> "someOtherGetter"
            },
            someOtherGetter: state => { /* ... */ }
        },

        actions: {
            // 在这个模块中， dispatch 和 commit 也被局部化了
            // 他们可以接受 `root` 属性以访问根 dispatch 或 commit
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

若需要在带命名空间的模块注册全局`action`，你可添加`root: true`，并将这个`action`的定义放在函数`handler`中。

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

当使用`mapState`、`mapGetters`、`mapActions`和`mapMutations`这些函数来绑定带命名空间的模块时，写起来可能比较繁琐，对于这种情况，你可以将模块的空间名称字符串作为第一个参数传递给上述函数，这样所有绑定都会自动将该模块作为上下文。或者你可以通过使用`createNamespacedHelpers`创建基于某个命名空间辅助函数。它返回一个对象，对象里有新的绑定在给定命名空间值上的组件绑定辅助函数

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
        // 在 `some/nested/module` 中查找
        ...mapState({
            a: state => state.a,
            b: state => state.b
        })
    },
    methods: {
        // 在 `some/nested/module` 中查找
        ...mapActions([
            "foo",
            "bar"
        ])
    }
}
// ...
```

## 模块动态注册
在`store`创建之后，你可以使用`store.registerModule`方法注册模块，之后就可以通过`store.state.myModule`和`store.state.nested.myModule`访问模块的状态。模块动态注册功能使得其他`Vue`插件可以通过在`store`中附加新模块的方式来使用`Vuex`管理状态。例如`vuex-router-sync`插件就是通过动态注册模块将`vue-router`和`vuex`结合在一起，实现应用的路由状态管理。你也可以使用`store.unregisterModule(moduleName)`来动态卸载模块，注意你不能使用此方法卸载静态模块，即创建`store`时声明的模块。此外你可以通过`store.hasModule(moduleName)`方法检查该模块是否已经被注册到`store`。

```javascript
import Vuex from "vuex";

const store = new Vuex.Store({ /* 选项 */ })

// 注册模块 `myModule`
store.registerModule("myModule", {
  // ...
})
// 注册嵌套模块 `nested/myModule`
store.registerModule(["nested", "myModule"], {
  // ...
})
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://vuex.vuejs.org/zh/
https://www.jianshu.com/p/1fdf9518cbdf
https://www.jianshu.com/p/29467543f77a
https://juejin.cn/post/6844903624137523213
https://segmentfault.com/a/1190000024371223
https://github.com/Hibop/Hibop.github.io/issues/45
```

