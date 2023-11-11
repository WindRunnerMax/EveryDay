# Vue Parent-Child Component Lifecycle

A `Vue` instance needs to go through a series of processes such as creation, data initialization, template compilation, `DOM` mounting, rendering, updating, rendering, and unmounting. This process is the lifecycle of `Vue`, and it provides hook functions such as `beforeCreate`, `created`, `beforeMount`, `mounted`, `beforeUpdate`, `updated`, `beforeDestroy`, and `destroyed`. When parent and child components are nested, each has its own independent hook functions.

## Description

### Creation Process
The creation process mainly involves four hook functions: `beforeCreate`, `created`, `beforeMount`, and `mounted`.

```
Parent beforeCreate -> Parent Created -> Parent BeforeMount -> Child BeforeCreate -> Child Created -> Child BeforeMount -> Child Mounted -> Parent Mounted
```

### Update Process
The update process mainly involves two hook functions: `beforeUpdate` and `updated`, and lifecycle comparison only occurs when there is data transmission between parent and child components.

```
Parent BeforeUpdate -> Child BeforeUpdate -> Child Updated -> Parent Updated
```

### Destruction Process
The destruction process mainly involves two hook functions: `beforeDestroy` and `destroyed`. In this example, calling `vm.$destroy()` directly destroys the entire instance to achieve the purpose of destroying parent and child components.

```
Parent BeforeDestroy -> Child BeforeDestroy -> Child Destroyed -> Parent Destroyed
```

### Example
```html
<!DOCTYPE html>
<html>

<head>
    <title>Vue Parent-Child Component Lifecycle</title>
</head>
```

```html
<body>
    <div id="app"></div>
</body>
<script src="https://cdn.bootcss.com/vue/2.4.2/vue.js"></script>
<script type="text/javascript">
    Vue.component("counter", {
        props: {
            count: { 
                type: Number,
                default: 0
            },
        },
        beforeCreate: function() {
            console.log("Child", "BeforeCreate");
        },
        created: function() {
            console.log("Child", "Created");
        },
        beforeMount: function() {
            console.log("Child", "BeforeMount");
        },
        mounted: function() {
            console.log("Child", "Mounted");
        },
        beforeUpdate: function() {
            console.log("Child", "BeforeUpdate");
        },
        updated: function() {
            console.log("Child","Updated");
        },
        beforeDestroy: function() {
            console.log("Child", "BeforeDestroy");
        },
        destroyed: function() {
            console.log("Child", "Destroyed");
        },
        template: `
            <div>
                <div>{{count}}</div>
            </div>
        `
    })
    var vm = new Vue({
        el: '#app',
        data: function(){
            return {
                count: 1
            }
        },
        beforeCreate: function() {
            console.log("Parent", "BeforeCreate");
        },
        created: function() {
            console.log("Parent", "Created");
        },
        beforeMount: function() {
            console.log("Parent", "BeforeMount");
        },
        mounted: function() {
            console.log("Parent", "Mounted");
        },
        beforeUpdate: function() {
            console.log("Parent", "BeforeUpdate");
        },
        updated: function() {
            console.log("Parent", "Updated");
        },
        beforeDestroy: function() {
            console.log("Parent", "BeforeDestroy");
        },
        destroyed: function() {
            console.log("Parent", "Destroyed");
        },
        template: `
            <div>
                <counter :count="count"></counter> 
                <button @click="count++">++</button> 
            </div>
        `
    })
</script>
</html>
```

## Lifecycle
`Vue` lifecycle hook function example, where `this.msg` is initially assigned `Vue Lifecycle`, and is assigned `Vue Update` during the update process.

### beforeCreate
The process from the creation of the `Vue` instance to the execution of the `beforeCreate` hook mainly involves some initialization operations, such as the initialization of component events and lifecycle hooks. When this lifecycle hook is executed, the component is not yet mounted, and `data`, `methods`, etc. are not yet bound. This phase can mainly be used to perform operations unrelated to `Vue` data, such as displaying a `loading` indicator.

```javascript
console.log("beforeCreate");
console.log(this.$el); //undefined
console.log(this.$data); //undefined 
console.log(this.msg); // undefined
console.log("--------------------");
```

### created
The process from `beforeCreate` to `created` mainly involves configuring data binding, mounting computed properties and methods, and defining `watch/event` callbacks. When this lifecycle hook is executed, the component is not yet mounted to the `DOM`, and the property `$el` is still `undefined`, but it is already possible to start accessing `data` and `methods`, although the page has not been rendered yet. In this stage, it is usually used to initiate an `XHR` request.

```javascript
console.log("created");
console.log(this.$el); //undefined
console.log(this.$data); //{__ob__: Observer} 
console.log(this.msg); // Vue Lifecycle
console.log("--------------------");
```

### beforeMount
The process from `created` to `beforeMount` mainly involves parsing the page template, resolving the page's data and directives in memory. When the page is fully parsed, the page template exists in memory. When this lifecycle hook is executed, `$el` is created, but the page exists only in memory and has not yet been rendered to the `DOM`.

```javascript
console.log("beforeMount");
console.log(this.$el); //<div id="app">...</div>
console.log(this.$data); // {__ob__: Observer}
console.log(this.msg); // Vue Lifecycle
console.log("--------------------");
```

### mounted
The process from `beforeMount` to `mounted` involves rendering the page from memory to the `DOM`. When this lifecycle hook is executed, the page has already been rendered, and the component has completed the last hook of the creation stage and is about to enter the running stage. Additionally, regarding the priority of the rendered page template, it is `render` function `>` `template` property `>` external `HTML`.

```javascript
console.log("mounted");
console.log(this.$el); //<div id="app">...</div>
console.log(this.$data); //{__ob__: Observer} 
console.log(this.msg); // Vue Lifecycle
console.log("--------------------");
```

### beforeUpdate
When data is updated, the `beforeUpdate` hook is called. At this point, the data in the `Vue` instance is already up to date, but the data in the page is still old. At this time, further state changes can be made without triggering an additional re-rendering process. In the example above, adding a `debugger` breakpoint allows you to observe that the data in the `Vue` instance is already up to date, but the data on the page is still old.

```javascript
// this.msg = "Vue Update";
console.log("beforeUpdate");
console.log(this.$el); //<div id="app">...</div>
console.log(this.$data); //{__ob__: Observer} 
console.log(this.msg); // Vue Update
console.log("--------------------");
```

### updated
When data is updated and the `DOM` is rendered, the `updated` hook is called. At this point, the component's `DOM` has been updated, and operations dependent on the `DOM` can be performed.

```javascript
// this.msg = "Vue Update";
console.log("updated");
console.log(this.$el); //<div id="app">...</div>
console.log(this.$data); //{__ob__: Observer} 
console.log(this.msg); // Vue Update
console.log("--------------------");
```

### beforeDestroy
The `beforeDestroy` hook is called before the `Vue` instance is destroyed, and at this time the instance is still fully available.

```javascript
// this.$destroy();
console.log("beforeDestroy");
console.log(this.$el); //<div id="app">...</div>
console.log(this.$data); //{__ob__: Observer} 
console.log(this.msg); // Vue Update
console.log("--------------------");
```

### destroyed
The `destroyed` hook is called after the `Vue` instance is destroyed. At this time, all things bound to the `Vue` instance will be unbound, all event listeners will be removed, all child instances will be destroyed, and the component will be unusable. `Data` and `methods` will also be unusable. Even if the instance's properties are changed, the page's `DOM` will not be re-rendered.

```javascript
// this.$destroy();
console.log("destroyed");
console.log(this.$el); //<div id="app">...</div>
console.log(this.$data); //{__ob__: Observer} 
console.log(this.msg); // Vue Update
console.log("--------------------");
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://segmentfault.com/a/1190000011381906
https://www.cnblogs.com/yuliangbin/p/9348156.html
https://www.cnblogs.com/zmyxixihaha/p/10714217.html
```