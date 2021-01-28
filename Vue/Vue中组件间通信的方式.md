# Vue中组件间通信的方式
`Vue`中组件间通信包括父子组件、兄弟组件、隔代组件之间通信。

## props $emit
这种组件通信的方式是我们运用的非常多的一种，`props`以单向数据流的形式可以很好的完成父子组件的通信，所谓单向数据流，就是数据只能通过`props`由父组件流向子组件，而子组件并不能通过修改`props`传过来的数据修改父组件的相应状态，所有的`prop`都使得其父子`prop`之间形成了一个单向下行绑定，父级`prop`的更新会向下流动到子组件中，但是反过来则不行，这样会防止从子组件意外改变父级组件的状态，导致难以理解数据的流向而提高了项目维护难度。实际上如果传入一个基本数据类型给子组件，在子组件中修改这个值的话`Vue`中会出现警告，如果对于子组件传入一个引用类型的对象的话，在子组件中修改是不会出现任何提示的，这两种情况都属于改变了父子组件的单向数据流，是不符合可维护的设计方式的。  
正因为这个特性，而我们会有需要更改父组件值的需求，就有了对应的`$emit`，当我们在组件上定义了自定义事件，事件就可以由`vm.$emit`触发，回调函数会接收所有传入事件触发函数的额外参数，`$emit`实际上就是是用来触发当前实例上的事件，对此我们可以在父组件自定义一个处理接受变化状态的逻辑，然后在子组件中如若相关的状态改变时，就触发父组件的逻辑处理事件。

### 父组件向子组件传值
父组件向子组件传值通过`prop`传递值即可。

```html
<!-- 子组件 -->
<template>
    <div>

        <div>我是子组件，接收：{{ msg }}</div>

    </div>
</template>

<script>
    export default {
        name: "child",
        components: {},
        props: ["msg"],
        data: () => ({
            
        }),
        beforeCreate: function() {},
        created: function() {},
        filters: {},
        computed: {},
        methods: {}
    }
</script>

<style scoped>
 
</style>

```

```html
<!-- 父组件 -->
<template>
    <div>

        <child :msg="msg"></child>

    </div>
</template>

<script>
    import child from "./child";
    export default {
        components: { child },
        data: () => ({
            msg: "父组件 Msg"
        }),
        beforeCreate: function() {},
        created: function() {},
        filters: {},
        computed: {},
        methods: {}
    }
</script>

<style scoped>
    
</style>

```

### 子组件向父组件传值
子组件向父组件传值需要通过事件的触发，将更改值的行为传递到父组件去执行。

```html
<!-- 子组件 -->
<template>
    <div>

        <div>我是子组件，接收：{{ msg }}</div>
        <button @click="$emit('changeMsg', '子组件传值 Msg')">触发事件并传递值到父组件</button>

    </div>
</template>

<script>
    export default {
        name: "child",
        components: {},
        props: ["msg"],
        data: () => ({
            
        }),
        beforeCreate: function() {},
        created: function() {},
        filters: {},
        computed: {},
        methods: {}
    }
</script>

<style scoped>
 
</style>
```

```html
<!-- 父组件 -->
<template>
    <div>

        <child 
            :msg="msg"
            @changeMsg="changeMsg"
        ></child>

    </div>
</template>

<script>
    import child from "./child";
    export default {
        components: { child },
        data: () => ({
            msg: "父组件 Msg"
        }),
        beforeCreate: function() {},
        created: function() {},
        filters: {},
        computed: {},
        methods: {
            changeMsg: function(msg){
                this.msg = msg;
            }
        }
    }
</script>

<style scoped>
    
</style>
```

### v-model
`v-model`通常称为数据双向绑定，也可以称得上是一种父子组件间传值的方式，是当前组件与`input`等组件进行父子传值，其本质上就是一种语法糖，通过`props`以及`input`(默认情况下)的事件的`event`中携带的值完成，我们可以自行实现一个`v-model`。


```html
<template>
    <div>

        <div>{{msg}}</div>
        <input :value="msg" @input="msg = $event.target.value">

    </div>
</template>

<script>
    export default {
        data: () => ({
            msg: "Msg"
        }),
        beforeCreate: function() {},
        created: function() {},
        filters: {},
        computed: {},
        methods: {}
    }
</script>

<style scoped>
    
</style>
```

### sync修饰符
`sync`修饰符也可以称为一个语法糖，在`Vue 2.3`之后新的`.sync`修饰符所实现的已经不再像`Vue 1.0`那样是真正的双向绑定，而是和`v-model`类似，是一种语法糖的形式，也可以称为一种缩写的形式，在下面父组件两种写法是完全等同的。


```html
<!-- 子组件 -->
<template>
    <div>

        <div>我是子组件，接收：{{ msg }}</div>
        <button @click="$emit('update:msg', '子组件传值 Msg')">触发事件并传递值到父组件</button>

    </div>
</template>

<script>
    export default {
        name: "child",
        components: {},
        props: ["msg"],
        data: () => ({
            
        }),
        beforeCreate: function() {},
        created: function() {},
        filters: {},
        computed: {},
        methods: {}
    }
</script>

<style scoped>
 
</style>

```

```html
<!-- 父组件 -->
<template>
    <div>

        <child 
            :msg="msg1"
            @update:msg="msg1 = $event"
        ></child>
        
        <child
            :msg.sync="msg2"
        ></child>
        

    </div>
</template>

<script>
    import child from "./child";
    export default {
        components: { child },
        data: () => ({
            msg1: "父组件 Msg1",
            msg2: "父组件 Msg2",
        }),
        beforeCreate: function() {},
        created: function() {},
        filters: {},
        computed: {},
        methods: {
            changeMsg: function(msg){
                this.msg = msg;
            }
        }
    }
</script>

<style scoped>
    
</style>
```

## provide inject
类似于`React`的`Context API`，在父组件中通过`provider`来提供属性，然后在子组件中通过`inject`来注入变量，不论子组件有多深，只要调用了`inject`那么就可以注入在`provider`中提供的数据，而不是局限于只能从当前父组件的`prop`属性来获取数据，只要在父组件内的数据，子组件都可以调用。当然`Vue`中注明了`provide`和`inject`主要在开发高阶插件`/`组件库时使用，并不推荐用于普通应用程序代码中。

```html
<!-- 子组件 -->
<template>
    <div>
        <div>inject: {{msg}}</div>
    </div>
</template>

<script>
    export default {
        name: "child",
        inject: ["msg"],
        data: () => ({
            
        }),
        beforeCreate: function() {},
        created: function() {},
        filters: {},
        computed: {},
        methods: {}
    }
</script>

<style scoped>
 
</style>
```

```html
<template>
    <div>

        <child></child>

    </div>
</template>

<script>
    import child from "./child";
    export default {
        components: { child },
        data: () => ({

        }),
        provide: {
            msg: "provide msg"
        },
        beforeCreate: function() {},
        created: function() {},
        filters: {},
        computed: {},
        methods: {}
    }
</script>

<style scoped>
    
</style>
```

## $attrs $listeners
这种组件通信的方式适合直接的父子组件，假设此时我们有三个组件分别为`A`、`B`、`C`，父组件`A`下面有子组件`B`，父组件`B`下面有子组件`C`，这时如果组件`A`直接想传递数据给组件`C`那就不能直接传递了，只能是组件`A`通过`props`将数据传给组件`B`，然后组件`B`获取到组件`A`传递过来的数据后再通过`props`将数据传给组件`C`，当然这种方式是非常复杂的，无关组件中的逻辑业务增多了，代码维护也没变得困难，再加上如果嵌套的层级越多逻辑也复杂，无关代码越多，针对这样一个问题，`Vue 2.4`提供了`$attrs`和`$listeners`来实现能够直接让组件`A`直接传递消息给组件`C`。


```html
<!-- 子子组件 -->
<template>
    <div>

        

    </div>
</template>

<script>
    export default {
        name: "child-child",
        components: {},
        data: () => ({
            
        }),
        beforeCreate: function() {},
        created: function() {
            console.log(this.$attrs); // {param: 1, test: 2}
            console.log(this.$listeners); // {testEvent: ƒ}
        },
        filters: {},
        computed: {},
        methods: {}
    }
</script>

<style scoped>
 
</style>
```

```html
<!-- 子组件 -->
<template>
    <div>
        <!-- 直接将剩余的参数传递给子组件 -->
        <child-child v-bind="$attrs" v-on="$listeners"></child-child>
    </div>
</template>

<script>
    import childChild from "./child-child";
    export default {
        name: "child",
        components: { childChild },
        props: ["msg"], // 声明了接收名为msg的prop 此时在此组件的$attrs则不会再有msg参数
        data: () => ({
            
        }),
        inheritAttrs: false, // 默认设置为true也可 // 默认情况下true 父作用域的不被认作 props 的 attribute 绑定将会回退且作为普通的 HTML attribute 应用在子组件的根元素上。
        beforeCreate: function() {},
        created: function() {
            console.log(this.$attrs); // {param: 1, test: 2}
            console.log(this.$listeners); // {testEvent: ƒ}
        },
        filters: {},
        computed: {},
        methods: {}
    }
</script>

<style scoped>
 
</style>
```

```html
<!-- 父组件 -->
<template>
    <div>

        <child 
            :msg="msg"
            :param="1"
            :test="2"
            @testEvent="tips"
        ></child>
        
    </div>
</template>

<script>
    import child from "./child";
    export default {
        components: { child },
        data: () => ({
            msg: "Msg",
        }),
        beforeCreate: function() {},
        created: function() {},
        filters: {},
        computed: {},
        methods: {
            tips: function(...args){
                console.log(args);
            }
        }
    }
</script>

<style scoped>
    
</style>
```

## $children $parent
这种方式就比较直观了，直接操作父子组件的实例，`$parent`就是父组件的实例对象，而`$children`就是当前实例的直接子组件实例数组了，官方文档的说明是子实例可以用`this.$parent`访问父实例，子实例被推入父实例的`$children`数组中，节制地使用`$parent`和`$children`它们的主要目的是作为访问组件的应急方法，更推荐用`props`和`events`实现父子组件通信。此外在`Vue2`之后移除的`$dispatch`和`$broadcast`也可以通过`$children`与`$parent`进行实现，当然不推荐这样做，官方推荐的方式还是更多简明清晰的组件间通信和更好的状态管理方案如`Vuex`，实际上很多开源框架都还是自己实现了这种组件通信的方式，例如`Mint UI`、`Element UI`和`iView`等。

```html
<!-- 子组件 -->
<template>
    <div>
        
    </div>
</template>

<script>
    export default {
        name: "child",
        data: () => ({
            
        }),
        beforeCreate: function() {},
        mounted: function() {
            console.log(this.$parent); // VueComponent {_uid: 2, ...}
            console.log(this.$children); // []
        },
        filters: {},
        computed: {},
        methods: {}
    }
</script>

<style scoped>
 
</style>
```

```html
<!-- 父组件 -->
<template>
    <div>

        <child></child>

    </div>
</template>

<script>
    import child from "./child";
    export default {
        components: { child },
        data: () => ({

        }),
        beforeCreate: function() {},
        mounted: function() {
            console.log(this.$parent); // VueComponent {_uid: 1, ...}
            console.log(this.$children); // [VueComponent]
        },
        filters: {},
        computed: {},
        methods: {}
    }
</script>

<style scoped>
    
</style>
```

## EventBus
在项目规模不大的情况下，完全可以使用中央事件总线`EventBus` 的方式，`EventBus`可以比较完美地解决包括父子组件、兄弟组件、隔代组件之间通信，实际上就是一个观察者模式，观察者模式建立了一种对象与对象之间的依赖关系，一个对象发生改变时将自动通知其他对象，其他对象将相应做出反应。所以发生改变的对象称为观察目标，而被通知的对象称为观察者，一个观察目标可以对应多个观察者，而且这些观察者之间没有相互联系，可以根据需要增加和删除观察者，使得系统更易于扩展。首先我们需要实现一个订阅发布类，并作为全局对象挂载到`Vue.prototype`，作为`Vue`实例中可调用的全局对象使用，此外务必注意在组件销毁的时候卸载订阅的事件调用，否则会造成内存泄漏。

```javascript
// 实现一个PubSub模块
var PubSub = function() {
    this.handlers = {};
}

PubSub.prototype = {

    on: function(key, handler) { // 订阅
        if (!(key in this.handlers)) this.handlers[key] = [];
        this.handlers[key].push(handler);
    },

    off: function(key, handler) { // 卸载
        const index = this.handlers[key].findIndex(item => item === handler);
        if (index < 0) return false;
        if (this.handlers[key].length === 1) delete this.handlers[key];
        else this.handlers[key].splice(index, 1);
        return true;
    },

    commit: function(key, ...args) { // 触发
        if (!this.handlers[key]) return false;
        this.handlers[key].forEach(handler => handler.apply(this, args));
        return true;
    },

}

export { PubSub }
export default { PubSub }
```

```html
<!-- 子组件 -->
<template>
    <div>

        <div>{{msg}}</div>
        <child></child>

    </div>
</template>

<script>
    import child from "./child";
    export default {
        components: { child },
        data: () => ({
            msg: "init"
        }),
        beforeCreate: function() {},
        created: function() {
            this.eventBus.on("ChangeMsg", this.changeMsg);
        },
        beforeDestroy: function(){
            this.eventBus.off("ChangeMsg", this.changeMsg);
        },
        filters: {},
        computed: {},
        methods: {
            changeMsg: function(msg){
                this.msg = msg;
            }
        }
    }
</script>

<style scoped>
    
</style>
```

```html
<!-- 父组件 -->
<template>
    <div>

        <div>{{msg}}</div>
        <child></child>

    </div>
</template>

<script>
    import child from "./child";
    export default {
        components: { child },
        data: () => ({
            msg: "init"
        }),
        beforeCreate: function() {},
        created: function() {
            this.eventBus.on("ChangeMsg", this.changeMsg);
        },
        beforeDestroy: function(){
            this.eventBus.off("ChangeMsg", this.changeMsg);
        },
        filters: {},
        computed: {},
        methods: {
            changeMsg: function(msg){
                this.msg = msg;
            }
        }
    }
</script>

<style scoped>
    
</style>
```

## Vuex
`Vuex`是一个专为`Vue.js`应用程序开发的状态管理模式，其采用集中式存储管理应用的所有组件的状态，并以相应的规则保证状态以一种可预测的方式发生变化。  
每一个`Vuex`应用的核心就是`store`仓库，`store`基本上就是一个容器，它包含着你的应用中大部分的状态`state`。`Vuex`和单纯的全局对象有以下两点不同：

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
https://zhuanlan.zhihu.com/p/109700915
https://juejin.cn/post/6844903887162310669
https://juejin.cn/post/6844903784963899405
https://segmentfault.com/a/1190000022083517
https://github.com/yangtao2o/learn/issues/97
https://github.com/YangYmimi/read-vue/issues/12
```

