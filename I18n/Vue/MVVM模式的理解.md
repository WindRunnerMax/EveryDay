# Understanding of the MVVM Pattern
 `MVVM`, short for `Model-View-ViewModel`, is an improvement on the `MVC` and `MVP` architectural patterns. In the `MVVM` pattern, the state and behavior of the `View` in the `MVC` pattern are abstracted, separating the development of the user interface (`UI`) from the development of business logic and behavior within the application more clearly.

## Description
The `MVVM` pattern simplifies the dependency between the interface and business logic, helping to separate the development of the graphical user interface from the development of business logic or data models. In `MVVM`, the `ViewModel` acts as a binder to link the UI layer to the data layer `Model`. When the `Model` updates, the `ViewModel` updates the data to the `View` through the binder. When the `View` triggers a command, it communicates the message to the `Model` through the `ViewModel`. The `ViewModel` acts as a black box, allowing developers to focus only on the presentation of the UI in the view layer and the data layer `Model`, without needing to be concerned with how the `ViewModel` passes data and messages.

## Components

### Model
- It results from abstracting things based on object orientation and represents the domain model that reflects the real state.
- The `Model`, also referred to as the data layer, solely focuses on the data itself without any concern for behavior.

### View
- The `View` is the structure, layout, and appearance that the user sees on the screen, i.e., the `UI`.
- When the `Model` is updated, the `ViewModel` updates the `View` through data binding.

### ViewModel
- The `ViewModel` is an abstraction of the view that exposes public properties and commands.
- The binder in the `ViewModel` communicates between the view and data binders.
- When the `Model` is updated, the `ViewModel` updates the data to the `View` through the binder. When the `View` triggers a command, it communicates the message to the `Model` through the `ViewModel`.

## Advantages
- Loose coupling: The `View` can change and modify independently of the `Model`. A `ViewModel` can be bound to different `View` instances, whereby when the `View` changes, the `Model` can remain unchanged, and vice versa.
- Reusability: It is possible to consolidate some view logic in a `ViewModel`, enabling multiple `View` instances to reuse this segment of view logic.
- Independent development: Developers can focus on the development of business logic and data in `Model`, while designers can concentrate on page design.
- Testable: User interface testing is usually challenging, but behavioral testing can be conducted through the `ViewModel`.

## Disadvantages
- For overly large projects, data binding might require more memory consumption.
- Data binding can make debugging more difficult. When there's an abnormality in the interface, it could be due to issues in the `View` code, or it could be due to problems in the `Model` code. Data binding can rapidly propagate a bug from one location to another, making it less straightforward to pinpoint the original problematic area.

## Example
Below is a simple data binding example implemented with reference to `Vue`. However, with regards to `Vue`, it's worth noting that the official documentation mentions that `Vue` does not fully adhere to the `MVVM` model, but its design is certainly inspired by it. For further information on why Evan You, the creator of `Vue`, states that `Vue` does not fully adhere to `MVVM`, one can refer to this [link](https://www.zhihu.com/question/327050991).

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
        <button onclick="update()">Update</button>
    </div> 
</body>
<script type="text/javascript">

///////////////////////////////////////////////////////////////////////////////
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
```

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
    var html = String(this.__originHTML||'').replace(/"/g,'\\"').replace(/\s+|\r|\t|\n/g, ' ')
        .replace(/\{\{(.)*?\}\}/g, function(value){ 
            return  value.replace("{{",'"+(').replace("}}",')+"');
        })
    html = `var targetHTML = "${html}";return targetHTML;`;
    var parsedHTML = new Function(...Object.keys(this.$data), html)(...Object.values(this.$data));
    this.__root.innerHTML = parsedHTML;
})
```

///////////////////////////////////////////////////////////////////////////////

```javascript
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

function update(){
    vm.msg = "updated";
}

///////////////////////////////////////////////////////////////////////////////
</script>
</html>
```


## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://zhuanlan.zhihu.com/p/38296857
https://baike.baidu.com/item/MVVM/96310
https://www.liaoxuefeng.com/wiki/1022910821149312/1108898947791072
```