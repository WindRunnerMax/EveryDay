# Ways of component communication in Vue

In `Vue`, component communication includes communication between parent and child components, sibling components, cross-level components, and non-nested components.

## props $emit
`props $emit` is suitable for communication between parent and child components. This type of component communication is widely used. `props` can effectively achieve communication between parent and child components in the form of one-way data flow. In a one-way data flow, data can only flow from the parent component to the child component via `props`. The child component cannot modify the data passed through `props` to change the corresponding state of the parent component. All `props` create a one-way downward binding between parent and child components. Updates to parent `props` will flow down to the child components, but not vice versa. This prevents accidental changes in the parent component's state from the child component, making it difficult to understand the data flow and increasing project maintenance complexity. In fact, if a basic data type is passed to the child component and modified in the child component, `Vue` will display a warning. If a reference type object is passed to the child component, modifying it in the child component will not trigger any warning. However, both cases violate the one-way data flow between parent and child components and do not adhere to a maintainable design pattern. 

Due to this characteristic, there is a need to modify the parent component's values, which leads to the use of `$emit`. When we define custom events on a component, the event can be triggered by `vm.$emit`, and the callback function will receive any additional parameters passed to the event trigger function. In practice, `$emit` is used to trigger events on the current instance. We can define a logic in the parent component to handle the changes in state, and then trigger the parent component's logic event when the relevant state changes in the child component.

### Passing data from parent to child component
To pass data from the parent component to the child component, simply pass the value through `props`.

```html
<!-- Child component -->
<template>
    <div>
        <div>I'm a child component, receiving: {{ msg }}</div>
    </div>
</template>

<script>
    export default {
        name: "child",
        components: {},
        props: ["msg"],
        data: () => ({}),
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
<!-- Parent component -->
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
            msg: "Parent component Msg"
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

### Passing data from child to parent component
Passing data from child to parent component requires triggering an event to pass the behavior of modifying the value to the parent component.

```html
<!-- Child component -->
<template>
    <div>
        <div>I'm a child component, receiving: {{ msg }}</div>
        <button @click="$emit('changeMsg', 'Child component value Msg')">Trigger event and pass value to parent component</button>
    </div>
</template>

<script>
    export default {
        name: "child",
        components: {},
        props: ["msg"],
        data: () => ({}),
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
<!-- Parent component -->
<template>
    <div>
        <child 
            :msg="msg"
            @changeMsg="changeMsg"
        ></child>
    </div>
</template>

```html
<!-- Parent component -->
<template>
    <div>
        <child 
            :msg="msg1"
            @update:msg="value => msg1 = value"
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
            msg1: "Parent Component Msg1",
            msg2: "Parent Component Msg2"
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

### v-model
`v-model` is commonly known as two-way data binding and can also be regarded as a way of passing values between parent and child components. It's essentially a syntactic sugar, achieved through `props` and the value carried in the `event` of the `input` (by default), we can implement a custom `v-model` by ourselves.

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

### sync Modifier
The `sync` modifier can also be seen as a syntactic sugar. After `Vue 2.3`, the implementation of the new `.sync` modifier is no longer the true two-way binding as it was in `Vue 1.0`, but is similar to `v-model`, in the form of syntactic sugar, also known as an abbreviated form. The two ways of writing in the parent component below are completely equivalent.

```html
<!-- Child component -->
<template>
    <div>
        <div>I am the child component, receiving: {{ msg }}</div>
        <button @click="$emit('update:msg', 'Child Component Msg')">Trigger event and pass value to parent component</button>
    </div>
</template>

<script>
    export default {
        name: "child",
        components: {},
        props: ["msg"],
        data: () => ({}),
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
<script>
    import child from "./child";
    export default {
        components: { child },
        data: () => ({
            msg1: "Parent component Msg1",
            msg2: "Parent component Msg2",
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
`provide inject` is suitable for communication between parent and child components as well as cross-level components, similar to `React`'s `Context API`. In the parent component, use `provider` to provide properties, and then in the child component use `inject` to inject variables. No matter how deep the child component is, as long as `inject` is called, it can inject the data provided in the `provider`, instead of being limited to getting data only from the `props` property of the current parent component. Any data defined in the parent component's `provide` can be accessed by the child component. However, it is worth noting that `Vue` specifies that `provide` and `inject` are mainly used when developing high-order plugins or component libraries, and are not recommended for regular application code.

```html
<!-- Child component -->
<template>
    <div>
        <div>inject: {{msg}}</div>
    </div>
</template>

<script>
    export default {
        name: "child",
        inject: ["msg"],
        data: () => ({}),
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
        data: () => ({}),
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
`$attrs $listeners` is suitable for direct communication between parent and child components, and passing through `props` can achieve communication between cross-level components. For example, if we have three components named `A`, `B`, and `C`, and the parent component `A` has a child component `B`, and the parent component `B` has a child component `C`, then if the component `A` wants to pass data directly to component `C`, it cannot be done directly. It can only be done by component `A` passing data to component `B` through `props`, and then component `B` passing the data to component `C` through `props`. This approach is very complex, increases unrelated logic and makes code maintenance more difficult, especially when the nesting levels and complexity of the logic increase. To address this issue, `Vue 2.4` provides `$attrs` and `$listeners` to allow component `A` to directly pass messages to component `C`.
```

```html
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
<!-- Child Component -->
<template>
    <div>
        <!-- Directly pass the remaining parameters to the child component -->
        <child-child v-bind="$attrs" v-on="$listeners"></child-child>
    </div>
</template>

<script>
    import childChild from "./child-child";
    export default {
        name: "child",
        components: { childChild },
        props: ["msg"], // Declares to receive a prop named msg, so the msg parameter will no longer exist in this component's $attrs
        data: () => ({
            
        }),
        inheritAttrs: false, // Default true, can also be set to true // By default, if set to true, attributes in the parent scope that are not recognized as props will be applied as regular HTML attributes on the child component's root element.
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
<!-- Parent Component -->
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
`$children $parent` is used for communication between parent-child components and cross-level components. This approach is more intuitive as it directly manipulates the instances of parent and child components. `$parent` refers to the instance object of the parent component, while `$children` represents an array of the immediate child component instances of the current instance. According to the official documentation, child instances can access parent instances using `this.$parent`, and child instances are pushed into the parent instance's `$children` array. The main purpose of using `$parent` and `$children` is as an emergency method to access components. It is more recommended to use `props` and `events` to achieve communication between parent and child components. Also, after the removal of `$dispatch` and `$broadcast` in `Vue2`, they can still be implemented through `$children` and `$parent`, but this approach is not recommended. The official recommendation still inclines towards more concise and clear communication between components and better state management solutions such as `Vuex`. In fact, many open-source frameworks have implemented their own ways of component communication, such as `Mint UI`, `Element UI`, and `iView`.

```html
<!--Child Component-->
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
<!--Parent Component-->
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

## $refs
`$refs` is used for communication between parent and child components. `ref` is used to register reference information for elements or child components, and the reference information will be registered on the `$refs` object of the parent component. When used on a regular `DOM` element, the reference points to the `DOM` element, while when used on a child component, the reference points to the component instance. It is important to note that because `ref` itself is created as a rendering result, it cannot be accessed during the initial rendering when they do not yet exist. Additionally, `$refs` is not reactive and should therefore not be used for data binding in the template.

```html
<!--Child Component-->
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
<!--Parent Component-->
<template>
    <div>

        <child ref="child"></child>

    </div>
</template>

<script>
    import child from "./child";
    export default {
        components: { child },
        data: () => ({

```javascript
}),
beforeCreate: function() {},
created: function() {},
mounted: function(){
    console.log(this.$refs.child); // VueComponent {_uid: 3, ...}
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

The `EventBus` can be used for component communication in any situation, in the case of a small project, you can use the central event bus `EventBus`. It can be perfectly used to solve communication between parent and child components, sibling components, and components with distant relationships. In fact, it is an observer pattern, establishing a dependency relationship between objects. When an object changes, it will automatically notify other objects, and other objects will respond accordingly. So the object that changes is called the subject and the object being notified is called the observer. A subject can correspond to multiple observers, and these observers have no connection with each other. You can add or remove observers as needed, making the system easier to expand. First, we need to implement a subscribe-publisher class as a singleton module to be exported, and then mount it to `Vue.prototype` so that it can be used as a global object in `Vue` instances. Of course, it can also be a global static cross-section `Mixins`, or it can be imported in each required component. In addition, it is important to remember to unsubscribe the subscribed events when the component is destroyed, otherwise it may cause memory leaks.

```javascript
// Implement a PubSub module
var PubSub = function() {
    this.handlers = {};
}

PubSub.prototype = {
    constructor: PubSub,
    on: function(key, handler) { // Subscribe
        if(!(key in this.handlers)) this.handlers[key] = [];
        if(!this.handlers[key].includes(handler)) {
             this.handlers[key].push(handler);
             return true;
        }
        return false;
    },

    once: function(key, handler) { // One-time subscription
        if(!(key in this.handlers)) this.handlers[key] = [];
        if(this.handlers[key].includes(handler)) return false;
        const onceHandler = (...args) => {
            handler.apply(this, args);
            this.off(key, onceHandler);
        }
        this.handlers[key].push(onceHandler);
        return true;
    },

    off: function(key, handler) { // Unsubscribe
        const index = this.handlers[key].findIndex(item => item === handler);
        if (index < 0) return false;
        if (this.handlers[key].length === 1) delete this.handlers[key];
        else this.handlers[key].splice(index, 1);
        return true;
    },

    commit: function(key, ...args) { // Trigger
        if (!this.handlers[key]) return false;
        console.log(key, "Execute");
        this.handlers[key].forEach(handler => handler.apply(this, args));
        return true;
    },
}

export default new PubSub();
```

```html
<!-- Child Component -->
<template>
    <div>
        <div>{{msg}}</div>
        <child></child>
    </div>
</template>
```

```javascript
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
<!-- Parent component -->
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
`Vuex` is also suitable for component communication in any situation. `Vuex` is a state management pattern designed especially for Vue.js applications. It adopts a centralized state management for all the components in an application with rules to ensure that the state changes in a predictable way.  
The core of every `Vuex` application is the `store`, which is basically a container holding the application's state. `Vuex` is different from a plain global object in two ways:

* The state storage in `Vuex` is reactive. When a `Vue` component reads the state from the `store`, the component will efficiently be updated if the state in the `store` changes.
* The state in the `store` cannot be directly modified. The only way to change the state in the `store` is by explicitly committing a `mutation`, which makes it easy for us to track every state change.

In fact, we can get more advantages of using `Vuex`:
* Use of time travel feature.
* `Vuex` specializes in state management, using a unified method to modify data, and all modifications are traceable.
* When doing log collection and event tracking, `Vuex` is more convenient.
* `Vuex` does not cause global variable pollution and solves the communication problems between parent components and child components, as well as between sibling components.

Of course, if the project is small enough, using `Vuex` may be cumbersome and redundant. If the application is simple enough, it is best not to use `Vuex`, and a simple store mode as mentioned above is sufficient.  
In the example below, we are using the approach of committing a `mutation` instead of directly changing `store.state.count` because we want to track the state change more clearly. This simple convention makes your intentions more obvious, making it easier for you to interpret the internal state changes while reading the code. Additionally, this also gives us the opportunity to implement some debugging tools that can record every state change and save state snapshots.

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

Due to the reactive nature of the `store`'s state, accessing the state in components is as simple as returning it in computed properties. Triggering changes only requires committing `mutations` in the `methods` of components.

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
https://zhuanlan.zhihu.com/p/109700915
https://juejin.cn/post/6844903887162310669
https://juejin.cn/post/6844903784963899405
https://segmentfault.com/a/1190000022083517
https://github.com/yangtao2o/learn/issues/97
https://github.com/YangYmimi/read-vue/issues/12
```