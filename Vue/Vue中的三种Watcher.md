# Vue中的三种Watcher
`Vue`可以说存在三种`watcher`，第一种是在定义`data`函数时定义数据的`render watcher`，这种形式最为常见。第二种是`computed watcher`，是`computed`函数在自身内部维护的一个`watcher`，配合其内部的属性`dirty`开关来决定`computed`的值是需要重新计算还是直接复用之前的值。第三种就是`watcher api`了，就是用户自定义的`export`导出对象的`watch`属性，当然实际上他们都是通过`class Watcher`类来实现的。

## 概述
`Vue.js`的数据响应式，通常有以下的的场景：

* 数据变`->`使用数据的视图变。
* 数据变`->`使用数据的计算属性变`->`使用计算属性的视图变。
* 数据变`->`开发者主动注册的`watch`回调函数执行。

三个场景，对应三种`watcher`：

* 负责视图更新的`render watcher`。
* 执行计算属性更新的`computed watcher`。
* 用户注册的普通`watcher api`。

### Render Watcher
在`render watcher`中，响应式就意味着，当数据中的值改变时，在视图上的渲染内容也需要跟着改变，在这里就需要一个视图渲染与属性值之间的联系，`Vue`中的响应式，简单点来说分为以下三个部分：

* `Observer`: 这里的主要工作是递归地监听对象上的所有属性，在属性值改变的时候，触发相应的`Watcher`。
* `Watcher`: 观察者，当监听的数据值修改时，执行响应的回调函数，在`Vue`里面的更新模板内容。
* `Dep`: 链接`Observer`和`Watcher`的桥梁，每一个`Observer`对应一个`Dep`，它内部维护一个数组，保存与该`Observer`相关的`Watcher`。

根据上面的三部分实现一个功能非常简单的`Demo`，实际`Vue`中的数据在页面的更新是异步的，且存在大量优化，实际非常复杂。  
首先实现`Dep`方法，这是链接`Observer`和`Watcher`的桥梁，简单来说，就是一个监听者模式的事件总线，负责接收`watcher`并保存。其中`subscribers`数组用以保存将要触发的事件，`addSub`方法用以添加事件，`notify`方法用以触发事件。

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

`Observer`方法就是将数据进行劫持，使用`Object.defineProperty`对属性进行重定义，注意一个属性描述符只能是数据描述符和存取描述符这两者其中之一，不能同时是两者，所以在这个小`Demo`中使用`getter`与`setter`操作的的是定义的`value`局部变量，主要是利用了`let`的块级作用域定义`value`局部变量并利用闭包的原理实现了`getter`与`setter`操作`value`，对于每个数据绑定时都有一个自己的`dep`实例，利用这个总线来保存关于这个属性的`Watcher`，并在`set`更新数据的时候触发。

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

`Watcher`方法传入一个回调函数，用以执行数据变更后的操作，一般是用来进行模板的渲染，`update`方法就是在数据变更后执行的方法，`activeRun`是首次进行绑定时执行的操作，关于这个操作中的`__dep.target`，他的主要目的是将执行回调函数相关的数据进行`sub`，例如在回调函数中用到了`msg`，那么在执行这个`activeRun`的时候`__dep.target`就会指向`this`，然后执行`fn()`的时候会取得`msg`，此时就会触发`msg`的`get()`，而`get`中会判断这个`__dep.target`是不是空，此时这个`__dep.target`不为空。

上文提到了每个属性都会有一个自己的`dep`实例，此时这个`__dep.target`便加入自身实例的`subscribers`，在执行完之后，便将`__dep.target`设置为`null`，重复这个过程将所有的相关属性与`watcher`进行了绑定，在相关属性进行`set`时，就会触发各个`watcher`的`update`然后执行渲染等操作。

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

这是上述的小`Demo`的代码示例，其中上文没有提到的`__proxy`函数主要是为了将`vm.$data`中的属性直接代理到`vm`对象上，两个`watcher`中第一个是为了打印并查看数据，第二个是之前做的一个非常简单的模板引擎的渲染，为了演示数据变更使得页面数据重新渲染。在这个`Demo`下打开控制台，输入`vm.msg = 11;`即可触发页面的数据更改，也可以通过在`40`行添加一行`console.log(dep);`来查看每个属性的`dep`绑定的`watcher`。

```html
<!DOCTYPE html>
<html>
<head>
    <title>数据绑定</title>
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

        new __watcher(() => {
            var html = String(this.__originHTML||'').replace(/"/g,'\\"').replace(/\s+|\r|\t|\n/g, ' ')
            .replace(/\{\{(.)*?\}\}/g, function(value){ 
                return  value.replace("{{",'"+(').replace("}}",')+"');
            })
            html = `var targetHTML = "${html}";return targetHTML;`;
            var parsedHTML = new Function(...Object.keys(this.$data), html)(...Object.values(this.$data));
            this.__root.innerHTML = parsedHTML;
        })

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
    })

</script>
</html>
```


### Computed Watcher
`computed`函数在自身内部维护的一个`watcher`，配合其内部的属性`dirty`开关来决定`computed`的值是需要重新计算还是直接复用之前的值。  
在`Vue`中`computed`是计算属性，其会根据所依赖的数据动态显示新的计算结果，虽然使用`{{}}`模板内的表达式非常便利，但是设计它们的初衷是用于简单运算的，在模板中放入太多的逻辑会让模板过重且难以维护，所以对于任何复杂逻辑，都应当使用计算属性。计算属性是基于数据的响应式依赖进行缓存的，只在相关响应式依赖发生改变时它们才会重新求值，也就是说只要计算属性依赖的数据还没有发生改变，多次访问计算属性会立即返回之前的计算结果，而不必再次执行函数，当然如果不希望使用缓存可以使用方法属性并返回值即可，`computed`计算属性非常适用于一个数据受多个数据影响以及需要对数据进行预处理的条件下使用。  

`computed`计算属性可以定义两种方式的参数，`{ [key: string]: Function | { get: Function, set: Function } }`，计算属性直接定义在`Vue`实例中，所有`getter`和`setter`的`this`上下文自动地绑定为`Vue`实例，此外如果为一个计算属性使用了箭头函数，则`this`不会指向这个组件的实例，不过仍然可以将其实例作为函数的第一个参数来访问，计算属性的结果会被缓存，除非依赖的响应式`property`变化才会重新计算，注意如果某个依赖例如非响应式`property`在该实例范畴之外，则计算属性是不会被更新的。

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
                console.log("a * b"); // 初始只打印一次 返回值被缓存
                return this.a * this.b;
            },
            multiplicationArrow: vm => vm.a * vm.b * 3, // 箭头函数可以通过传入的参数获取当前实例
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
            updateSetting: function(){ // 点击按钮后
                console.log(this.setting); // 12
                this.setting = 3; // 3 -> a
                console.log(this.setting); // 36
            }
        },

    })
</script>
</html>
```
 
### Watcher API
在`watch api`中可以定义`deep`与`immediate`属性，分别为深度监听`watch`和最初绑定即执行回调的定义，在`render watch`中定义数组的每一项由于性能与效果的折衷是不会直接被监听的，但是使用`deep`就可以对其进行监听，当然在`Vue3`中使用`Proxy`就不存在这个问题了，这原本是`Js`引擎的内部能力，拦截行为使用了一个能够响应特定操作的函数，即通过`Proxy`去对一个对象进行代理之后，我们将得到一个和被代理对象几乎完全一样的对象，并且可以从底层实现对这个对象进行完全的监控。  

对于`watch api`，类型`{ [key: string]: string | Function | Object | Array }`，是一个对象，键是需要观察的表达式，值是对应回调函数，值也可以是方法名，或者包含选项的对象，`Vue`实例将会在实例化时调用`$watch()`，遍历`watch`对象的每一个`property`。  
不应该使用箭头函数来定义`watcher`函数，例如`searchQuery: newValue => this.updateAutocomplete(newValue)`，理由是箭头函数绑定了父级作用域的上下文，所以`this`将不会按照期望指向`Vue`实例，`this.updateAutocomplete`将是`undefined`。

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
            a: function(n, o){ // 普通watcher
                console.log("a", o, "->", n);
            },
            b: { // 可以指定immediate属性
                handler: function(n, o){
                    console.log("b", o, "->", n);
                },
                immediate: true
            },
            c: [ // 逐单元执行
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
                handler: function(n, o){ // 因为是内部属性值 更改不会执行
                    console.log("d.e1", o, "->", n);
                },
            },
            "d.e": { // 可以指定内部属性的值
                handler: function(n, o){
                    console.log("d.e2", o, "->", n);
                }
            },
            f: { // 深度绑定内部属性
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

    })
</script>
</html>
```



## 每日一题

- <https://github.com/WindRunnerMax/EveryDay>

## 参考

- <https://cn.vuejs.org/v2/api/#watch>
- <https://www.jianshu.com/p/0f00c58309b1>
- <https://juejin.cn/post/6844904128435470350>
- <https://juejin.cn/post/6844904128435453966>
- <https://juejin.cn/post/6844903600737484808>
- <https://segmentfault.com/a/1190000023196603>
- <https://blog.csdn.net/qq_32682301/article/details/105408261>
