# Three Watchers in Vue
In `Vue`, you could say there are three kinds of `watchers`. The first is the `render watcher`, which is defined when the `data` function is defined. The second is the `computed watcher`, which is maintained internally in the `computed` function as a `watcher`, to decide whether the value of `computed` needs to be recalculated or reused based on its internal `dirty` flag. The third is the `watcher API`, which is the `watch` property of the custom export object defined by the user. In reality, they are all implemented using the `class Watcher` class.

## Description
`Vue.js`'s data reactivity typically applies to the following scenarios:

* Data change -> View referencing the data changes.
* Data change -> Computed property based on the data changes -> View referencing the computed property changes.
* Data change -> Execution of developer-registered `watch` callback functions.

These three scenarios correspond to three types of `watchers`:

* The `render watcher` responsible for view updates.
* The `computed watcher` responsible for updating computed properties.
* The user-registered ordinary `watcher API`.

### Render Watcher
In the `render watcher`, reactivity implies that when a value in the data changes, the rendered content in the view needs to change accordingly. Here, there is a connection between the view rendering and the property value. Vue's reactivity can be simplified into the following three parts:

* `Observer`: Its main task is to recursively watch all properties of an object. When a property value changes, it triggers the corresponding `Watcher`.
* `Watcher`: When the watched data value is modified, it executes the corresponding callback function, updating the template content in Vue.
* `Dep`: It acts as a bridge between `Observer` and `Watcher`. Each `Observer` corresponds to a `Dep`, which internally maintains an array, saving the related `Watcher` for that `Observer`.

Implementing a very simple `Demo` based on the above three parts is straightforward. However, the actual asynchronous nature and numerous optimizations in Vue make the data update on the page very complex.

Firstly, implement the `Dep` method, which acts as the bridge between `Observer` and `Watcher`. In simple terms, it is an event bus for the observer pattern, responsible for receiving `watcher` instances and saving them. The `subscribers` array is used to save the events to be triggered, the `addSub` method is used to add events, and the `notify` method is used to trigger the events.

```javascript
function __dep(){
    this.subscribers = [];
    this.addSub = function(watcher){
        if(__dep.target && !this.subscribers.includes(__dep.target) ) this.subscribers.push(watcher);
    }
    this.notifyAll = function(){
        this.subscribers.forEach( watcher => watcher.update());
    }
}
```

The `Observer` method is to intercept the data by using `Object.defineProperty` to redefine the properties. Note that a property descriptor can only be a data descriptor or an accessor descriptor, but not both simultaneously. In this small `Demo`, using `getter` and `setter` operates on the locally defined `value` variable. It primarily utilizes the block-level scope of `let` to define the `value` local variable and utilizes the closure principle to implement the `getter` and `setter` operations on `value`. Each data binding has its own `dep` instance, using this bus to save the related `Watcher` for that property and trigger it during data update in the `set`.


```javascript
function __observe(obj){
    for(let item in obj){
        let dep = new __dep();
        let value = obj[item];
        if (Object.prototype.toString.call(value) === "[object Object]") __observe(value);
        Object.defineProperty(obj, item, {
            configurable: true,
            enumerable: true,
            get: function reactiveGetter() {
                if(__dep.target) dep.addSub(__dep.target);
                return value;
            },
            set: function reactiveSetter(newVal) {
                if (value === newVal) return value;
                value = newVal;
                dep.notifyAll();
            }
        });
    }
    return obj;
}
```

`Watcher` method takes a callback function as a parameter, used to perform operations after data changes, usually used for template rendering. The `update` method is the method executed after the data change, and `activeRun` is the operation executed when binding for the first time. Regarding the `__dep.target` in this operation, its main purpose is to associate the data related to executing the callback function with `sub`. For example, if `msg` is used in the callback function, then when `activeRun` is executed, `__dep.target` will point to `this`, and then when `fn()` is executed, it will access `msg`, thus triggering the `get()` for `msg`. In `get`, it checks whether `__dep.target` is empty. When `__dep.target` is not empty, as mentioned earlier, each property will have its own `dep` instance, at this point `__dep.target` joins the `subscribers` of its own instance. After execution, `__dep.target` is set to `null`. This process repeats for all relevant properties, binding them to the `watcher`. When a relevant property is `set`, it triggers the `update` of various `watchers` and then performs rendering and other operations.
```javascript
function __watcher(fn){
    this.update = function(){
        fn();
    }
    
    this.activeRun = function(){
        __dep.target = this;
        fn();
        __dep.target = null;
    }
    this.activeRun();
}
```

This is an example code of the above small `Demo`. The `__proxy` function not mentioned earlier is mainly used to directly proxy the properties in `vm.$data` to the `vm` object. The first of the two `watcher`s is for logging and viewing data, and the second is a very simple template engine rendering done earlier, to demonstrate that data changes trigger page data re-rendering. In this `Demo`, open the console and enter `vm.msg = 11;` to trigger a data change on the page, or add a line `console.log(dep);` at line `40` to view the `watcher` bound to each property.

```html
<!DOCTYPE html>
<html>
<head>
    <title>Data Binding</title>
</head>
<body>
    <div id="app">
        <div>{{msg}}</div>
        <div>{{date}}</div>
    </div> 
</body>
<script type="text/javascript">

    var Mvvm = function(config) {
        this.$el = config.el;
        this.__root = document.querySelector(this.$el);
        this.__originHTML = this.__root.innerHTML;
```

```javascript
function __dep(){
    this.subscribers = [];
    this.addSub = function(watcher){
        if(__dep.target && !this.subscribers.includes(__dep.target) ) this.subscribers.push(watcher);
    }
    this.notifyAll = function(){
        this.subscribers.forEach( watcher => watcher.update());
    }
}


function __observe(obj){
    for(let item in obj){
        let dep = new __dep();
        let value = obj[item];
        if (Object.prototype.toString.call(value) === "[object Object]") __observe(value);
        Object.defineProperty(obj, item, {
            configurable: true,
            enumerable: true,
            get: function reactiveGetter() {
                if(__dep.target) dep.addSub(__dep.target);
                return value;
            },
            set: function reactiveSetter(newVal) {
                if (value === newVal) return value;
                value = newVal;
                dep.notifyAll();
            }
        });
    }
    return obj;
}

this.$data = __observe(config.data);

function __proxy (target) {
    for(let item in target){
        Object.defineProperty(this, item, {
            configurable: true,
            enumerable: true,
            get: function proxyGetter() {
                return this.$data[item];
            },
            set: function proxySetter(newVal) {
                this.$data[item] = newVal;
            }
        });
    }
}

__proxy.call(this, config.data);

function __watcher(fn){
    this.update = function(){
        fn();
    }
    
    this.activeRun = function(){
        __dep.target = this;
        fn();
        __dep.target = null;
    }
    this.activeRun();
}

new __watcher(() => {
    console.log(this.msg, this.date);
})
```

```javascript
new __watcher(() => {
    var html = String(this.__originHTML || '').replace(/"/g, '\\"').replace(/\s+|\r|\t|\n/g, ' ')
        .replace(/\{\{(.)*?\}\}/g, function (value) {
            return value.replace("{{", '"+(').replace("}}", ')+"');
        });
    html = `var targetHTML = "${html}";return targetHTML;`;
    var parsedHTML = new Function(...Object.keys(this.$data), html)(...Object.values(this.$data));
    this.__root.innerHTML = parsedHTML;
});
}

var vm = new Mvvm({
    el: "#app",
    data: {
        msg: "1",
        date: new Date(),
        obj: {
            a: 1,
            b: 11
        }
    }
});
</script>
</html>
```

### computed watcher
The `computed` function maintains a `watcher` internally and decides whether the value of `computed` needs to be recalculated or directly reused based on its internal `dirty` switch. In `Vue`, `computed` is a calculated property that dynamically displays a new calculated result based on the data it depends on. While using expressions in double curly braces `{{}}` within templates is convenient, they are designed for simple calculations. Placing too much logic in templates can make them heavy and difficult to maintain, so for any complex logic, computed properties should be used. Computed properties are cached based on reactive dependencies. They are only re-evaluated when the related reactive dependencies change. This means that as long as the data a computed property depends on has not changed, accessing the computed property multiple times will immediately return the previous calculation result without having to execute the function again. However, if you do not want to use caching, simply use a method property and return the value. Computed properties are very suitable for use when one piece of data is affected by multiple pieces of data and when data needs to be preprocessed. 
Computed properties can be defined with two types of parameters: `{ [key: string]: Function | { get: Function, set: Function } }`. Computed properties are defined directly in the Vue instance, and all `getter` and `setter` contexts are automatically bound to the Vue instance. Additionally, if an arrow function is used for a computed property, `this` will not be bound to the instance of the component. However, you can still access the instance as the first parameter of the function. The result of a computed property is cached and will only be recalculated when the dependent reactive property changes. Note that if a dependency, such as a non-reactive property, is outside the scope of the instance, the computed property will not be updated.

```html
<!DOCTYPE html>
<html>
<head>
    <title>Vue</title>
</head>
<body>
    <div id="app"></div>
</body>
<script src="https://cdn.bootcss.com/vue/2.4.2/vue.js"></script>
<script type="text/javascript">
    var vm = new Vue({
        el: "#app",
        data: {
            a: 1,
            b: 2
        },
        template:`
            <div>
                <div>{{multiplication}}</div>
                <div>{{multiplication}}</div>
                <div>{{multiplication}}</div>
                <div>{{multiplicationArrow}}</div>
                <button @click="updateSetting">updateSetting</button>
            </div>
        `,
        computed:{
            multiplication: function(){
                console.log("a * b"); // It only prints once at the beginning and the return value is cached.
                return this.a * this.b;
            },
            multiplicationArrow: vm => vm.a * vm.b * 3, // An arrow function can get the current instance by the parameters passed in.
            setting: {
                get: function(){
                    console.log("a * b * 6");
                    return this.a * this.b * 6;
                },
                set: function(v){
                    console.log(`${v} -> a`);
                    this.a = v;
                }
            }
        },
        methods:{
            updateSetting: function(){ // After clicking the button
                console.log(this.setting); // 12
                this.setting = 3; // 3 -> a
                console.log(this.setting); // 36
            }
        },

    })
</script>
</html>
```
 
### watcher api
In the `watch api`, you can define the `deep` and `immediate` properties, which represent deep watching and executing the callback immediately upon the initial binding, respectively. In the `render watch`, each item in the array is not directly watched due to the trade-off between performance and effectiveness. However, using `deep` will allow you to monitor it. Of course, in `Vue3`, using `Proxy` eliminates this problem. This was originally an internal capability of the JavaScript engine, intercepting behavior using a function that can respond to specific operations. By using `Proxy` to proxy an object, we will get an object that is almost identical to the original object and can be completely monitored from the ground up.  
For the `watch api`, the type is `{ [key: string]: string | Function | Object | Array }`, which is an object where the keys are the expressions to be observed and the values are the corresponding callback functions. The values can also be method names or objects containing options. The `Vue` instance will call `$watch()` when instantiated, iterating through each `property` of the `watch` object.  
Arrow functions should not be used to define watcher functions, for example, `searchQuery: newValue => this.updateAutocomplete(newValue)`. The reason being that arrow functions bind to the parent scope context, so `this` will not point to the `Vue` instance as expected, and `this.updateAutocomplete` will be undefined.


```html
<!DOCTYPE html>
<html>
<head>
    <title>Vue</title>
</head>
<body>
    <div id="app"></div>
</body>
<script src="https://cdn.bootcss.com/vue/2.4.2/vue.js"></script>
<script type="text/javascript">
    var vm = new Vue({
        el: "#app",
        data: {
            a: 1,
            b: 2,
            c: 3,
            d: {
                e: 4,
            },
            f: {
                g: 5
            }
        },
        template:`
            <div>
                <div>a: {{a}}</div>
                <div>b: {{b}}</div>
                <div>c: {{c}}</div>
                <div>d.e: {{d.e}}</div>
                <div>f.g: {{f.g}}</div>
                <button @click="updateA">updateA</button>
                <button @click="updateB">updateB</button>
                <button @click="updateC">updateC</button>
                <button @click="updateDE">updateDE</button>
                <button @click="updateFG">updateFG</button>
            </div>
        `,
        watch: {
            a: function(n, o){ // Normal watcher
                console.log("a", o, "->", n);
            },
            b: { // Can specify the immediate attribute
                handler: function(n, o){
                    console.log("b", o, "->", n);
                },
                immediate: true
            },
            c: [ // Execute one by one
                function handler(n, o){
                    console.log("c1", o, "->", n);
                },{
                    handler: function(n, o){
                        console.log("c2", o, "->", n);
                    },
                    immediate: true
                }
            ],
            d: {
                handler: function(n, o){ // Internal property value changes do not trigger this
                    console.log("d.e1", o, "->", n);
                },
            },
            "d.e": { // Can specify the value of internal property
                handler: function(n, o){
                    console.log("d.e2", o, "->", n);
                }
            },
            f: { // Deep binding of internal properties
                handler: function(n){
                    console.log("f.g", n.g);
                },
                deep: true
            }
        },
        methods:{
            updateA: function(){
                this.a = this.a * 2;
            },
            updateB: function(){
                this.b = this.b * 2;
            },
            updateC: function(){
                this.c = this.c * 2;
            },
            updateDE: function(){
                this.d.e = this.d.e * 2;
            },
            updateFG: function(){
                this.f.g = this.f.g * 2;
            }
        },
```

```html
    })
</script>
</html>
```



## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://cn.vuejs.org/v2/api/#watch
https://www.jianshu.com/p/0f00c58309b1
https://juejin.cn/post/6844904128435470350
https://juejin.cn/post/6844904128435453966
https://juejin.cn/post/6844903600737484808
https://segmentfault.com/a/1190000023196603
https://blog.csdn.net/qq_32682301/article/details/105408261
```