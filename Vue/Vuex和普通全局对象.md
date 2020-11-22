# Vuex和普通全局对象
在构建应用时，组件化与模块化开发以及多人开发各自组件的时候，不难保证各个组件都是唯一性的，多个组件共享状态肯定是存在的，而对多个共享状态进行维护是非常麻烦的，共享状态是谁都可以进行操作和修改的，这样就会导致所有对共享状态的操作都是不可预料的，所以就需要一个统一的管理进行维护。

## 描述
在大量的业务场景下，不同的模块组件之间确实需要共享数据，也需要对其进行修改操作。也就引发软件设计中的矛盾：模块组件之间需要共享数据和数据可能被任意修改导致不可预料的结果。为了解决其矛盾，软件设计上就提出了一种设计和架构思想，将全局状态进行统一的管理，并且需要获取、修改等操作必须按我设计的套路来，就好比马路上必须遵守的交通规则，右行斑马线就是只能右转一个道理，统一了对全局状态管理的唯一入口，使代码结构清晰、更利于维护。  
状态管理模式从软件设计的角度，就是以一种统一的约定和准则，对全局共享状态数据进行管理和操作的设计理念。你必须按照这种设计理念和架构来对你项目里共享状态数据进行`CRUD`。所以所谓的“状态管理模式”就是一种软件设计的一种架构模式。

## 全局对象
当`Vue`应用中原始`data`对象的实际来源——当访问数据对象时，一个`Vue`实例只是简单的代理访问，但是如果你有一处需要被多个实例间共享的状态，可以简单地通过维护一份数据也就是全局变量来实现共享。


```javascript
var global = {};

var vmA = new Vue({
    data: global
})

var vmB = new Vue({
    data: global
})
```

现在当`global`发生变更，`vmA`和`vmB`都将自动地更新它们的视图，子组件们的每个实例也会通过`this.$root.$data`去访问`global`。现在我们有了唯一的数据来源，但是调试将会变为非常麻烦。在任何时间以及我们应用中的任何部分，在任何数据改变后，都不会留下变更过的记录，这就导致了应用非常难以维护。  
为了解决这个问题，可以自行实现一个简单的`store`模式，所有`store`中`state`的变更，都应该放置在`store`自身的`action`中去管理。这种集中式状态管理能够被更容易地理解哪种类型的变更将会发生，以及它们是如何被触发，当错误出现时，我们现在也会有一个`log`记录`bug`之前发生了什么。

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
`Vuex`是一个专为`Vue.js`应用程序开发的状态管理模式，其采用集中式存储管理应用的所有组件的状态，并以相应的规则保证状态以一种可预测的方式发生变化。  
每一个`Vuex`应用的核心就是`store`仓库。`store`基本上就是一个容器，它包含着你的应用中大部分的状态`state`。`Vuex`和单纯的全局对象有以下两点不同：

* `Vuex`的状态存储是响应式的，当`Vue`组件从`store`中读取状态的时候，若`store`中的状态发生变化，那么相应的组件也会相应地得到高效更新。
* 不能直接改变`store`中的状态，改变`store`中的状态的唯一途径就是显式地提交`mutation`，这样使得我们可以方便地跟踪每一个状态的变化。

实际上我们可以得到更多使用`Vuex`的优点：
* 可以使用时间旅行功能。
* `Vuex`专做态管理，由一个统一的方法去修改数据，全部的修改都是可以追溯的。
* 在做日志搜集，埋点的时候，有`Vuex`更方便。
* `Vuex`不会造成全局变量的污染，同时解决了父组件与孙组件，以及兄弟组件之间通信的问题。

当然如果项目足够小，使用`Vuex`可能是繁琐冗余的。如果应用够简单，最好不要使用`Vuex`，上文中的一个简单的`store`模式就足够了。  
在下面例子中，我们通过提交`mutation`的方式，而非直接改变`store.state.count`，是因为我们想要更明确地追踪到状态的变化。这个简单的约定能够让你的意图更加明显，这样你在阅读代码的时候能更容易地解读应用内部的状态改变。此外这样也让我们有机会去实现一些能记录每次状态改变，保存状态快照的调试工具。

```javascript
import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

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

由于`store`中的状态是响应式的，在组件中调用`store`中的状态简单到仅需要在计算属性中返回即可。触发变化也仅仅是在组件的`methods`中提交`mutation`即可。

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



## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://vuex.vuejs.org/zh/
https://www.jianshu.com/p/d296df048a77
https://juejin.cn/post/6844903624137523213
https://segmentfault.com/q/1010000013196679
http://ysha.me/2018/09/04/%E7%90%86%E8%A7%A3vuex/
https://cn.vuejs.org/v2/guide/state-management.html
```

