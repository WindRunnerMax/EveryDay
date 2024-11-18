# MVC Pattern
`MVC` stands for Model, View, and Controller. It's a way to organize code by separating business logic, data, and views, using a separation of concerns to improve the way applications are organized. This approach separates the business data (`Model`) from the user interface (`View`) and introduces a third component, the `Controller`, which is responsible for managing the traditional business logic and user input. The `MVC` pattern is commonly seen as an architectural design pattern.

## Description
In frontend component-based development, it's common to write views, data, and business logic within a single module. If the content of the component is extensive, it can lead to confusion in hierarchy and increase development and maintenance costs. By using the `MVC` pattern, it's possible to organize the data layer, view layer, and controller layer to reduce coupling.

```
View -> Controller -> Model -> View
```

## Implementation
Here we are mainly illustrating the layered structure of `MVC`. In practice, `MVC` is mainly divided into three parts. To implement this information passing, some command and event parsing is required.
* The `View` sends commands to the `Controller`.
* After completing the business logic, the `Controller` requests a change in the state of the `Model`.
* The `Model` sends the new data to the `View`, and the user receives feedback.

```html
<!DOCTYPE html>
<html>
<head>
    <title>MVC</title>
</head>
<body>
    <div id="app"></div>
</body>
<script type="text/javascript">
    const MVC = function(){
        this.data = {};
        this.template = "";
    };
    MVC.prototype.model = function(data){
        /* Some preprocessing */
        this.data = data;
    }
    MVC.prototype.view = function(template){
        /* Some preprocessing */
        this.template = template;
    }
    MVC.prototype.controller = function(el){
        /* Some processing */
        /* The key part is the controller section, where command parsing, logic, etc., need to be implemented */
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

    const mvc = new MVC();
    mvc.model({
        name: "Test",
        phone: "13333333333"
    })
    mvc.view(`
        <div>
            <span>Name</span>
            <span>{{name}}</span>
        </div>
        <div>
            <span>Phone</span>
            <span>{{phone}}</span>
        </div>
    `);
    const control = mvc.controller("#app");
    control.render();

</script>
</html>
```

## Daily Quiz

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.jianshu.com/p/648c5d9dacaa
https://segmentfault.com/a/1190000009127861
https://www.kancloud.cn/kancloud/learn-js-design-patterns/56457
```