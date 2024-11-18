# MVP Pattern
`MVC` stands for Model, View, Controller, and `MVP` pattern is evolved from `MVC` pattern. By cleverly separating the view and the model through the presenter, the `MVP` pattern changes the name of the `Controller` to `Presenter` and also changes the direction of communication. The `MVP` pattern does not belong to the category of the generally defined `23` design patterns, rather it is usually considered as a broadly defined architectural design pattern.

## Description
In `MVC`, the `View` can directly access the data in the `Model`, but in `MVP`, the `View` cannot directly access the `Model`. Instead, it provides an interface for the `Presenter` to update the `Model`, and then updates the `View` through observer pattern, etc. Compared with `MVC`, the `MVP` pattern decouples the `View` and `Model`, completely separating the view and the model, making the division of responsibilities clearer. Because the `View` does not depend on the `Model`, the `View` can be separated and made into a component, only needing to provide a series of interfaces for upper layer operations.

```
View <-> Presenter <-> Model
```

## Implementation
Here we mainly illustrate the layered structure of `MVP`. To implement the transmission of information in `MVP`, some parsing of commands and events is needed. The `Presenter`, as the middleman between `View` and `Model`, needs to manually synchronize the data from `View` to `Model` and from `Model` to `View in addition to basic business logic. For example, if we implement a `++` counter in the `View`, we need to carry out specific operations in the `Presenter` to `++` the `Model`, and then `Render` it to the view. Furthermore, due to the lack of data binding, if the `Presenter` has more requirements for view rendering, it has to pay too much attention to specific views. Once the view requirements change, the `Presenter` also needs to change.

```html
<!DOCTYPE html>
<html>
<head>
    <title>MVP</title>
</head>
<body>
    <div id="app"></div>
</body>
<script type="text/javascript">
    const MVP = function(){
        this.data = {};
        this.template = "";
    };
    MVP.prototype.model = function(data){
        /* Some preprocessing */
        this.data = data;
    }
    MVP.prototype.view = function(template){
        /* Some preprocessing */
        this.template = template;
    }
    MVP.prototype.presenter = function(el){
        /* Some processing */
        /* The key is the presenter part; parsing instructions and logic all need to be implemented here */
        const container = document.querySelector(el);
        const formatString = (str, data) => {
            return str.replace(/\{\{(\w+)\}\}/g, (match, key) => data[key] === void 0 ? "" : data[key]);
        }
        return {
            render: () => {
                const parsedStr = formatString(this.template, this.data);
                container.innerHTML = parsedStr;
            }
        }
    }

    const mvp = new MVP();
    mvp.model({
        name: "Test",
        phone: "13333333333"
    })
    mvp.view(`
        <div>
            <span>Name</span>
            <span>{{name}}</span>
        </div>
        <div>
            <span>Phone Number</span>
            <span>{{phone}}</span>
        </div>
    `);
    const presenter = mvp.presenter("#app");
    presenter.render();

</script>
</html>
```

## Question of the Day
```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://zhuanlan.zhihu.com/p/140071889
https://juejin.cn/post/6844903480126078989
http://www.ruanyifeng.com/blog/2015/02/mvcmvp_mvvm.html
```