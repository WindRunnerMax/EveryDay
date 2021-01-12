# Widget模式
`Widget`模式是指借用`Web Widget`思想将页面分解成组件，针对部件开发，最终组合成完整的页面，`Web Widget`指的是一块可以在任意页面中执行的代码块，`Widget`模式不属于一般定义的`23`种设计模式的范畴，而通常将其看作广义上的架构型设计模式。

## 描述
模块化开发使页面的功能细化，逐一实现每个功能模块来完成系统需求，这是一种很好的编程实践，在简单模板模式实现的模板引擎的帮助下可以非常方便的完成这个实例，这将更适合多人团队开发，降低相互之间因为功能或者视图创建的耦合影响概率，组件的多样化也能够组建更加丰富的页面，同样也会让组件的复用率提高。

## 实现

```javascript
// dom.js
F.module("./dom", function() {
    return {
        g: function(id) {
            return document.getElementById(id);
        },
        html: function(id, html) {
            if (!html) return this.g(id).innerHTML;
            else this.g(id).innerHTML = html;
        }
    }
});
```

```javascript
// event.js
F.module("./event", ["./dom"], function(dom) {
    return {
        on: function(id, type, fn) {
            dom.g(id)["on" + type] = fn;
        }
    }
});
```

```html
<!-- demo.html -->
<!DOCTYPE html>
<html>

<head>
    <title>异步模块</title>
</head>

<body>
    <div id="demo">Click Me</div>
</body>
<script type="text/javascript">
(function(F) {
    const moduleCache = {};

    function getUrl(moduleName) {
        return String(moduleName).replace(/\.js$/g, "") + ".js"
    }

    function loadScript(src) {
        let _script = document.createElement("script");
        _script.type = "text/javascript";
        _script.charset = "UTF-8";
        _script.async = true;
        _script.src = src;
        document.body.appendChild(_script);
    }

    function setModule(moduleName, params, callback) {
        let _module = null, fn = null;
        if(moduleCache[moduleName]) {
            _module = moduleCache[moduleName];
            _module.status = "loaded";
            _module.exports = callback ? callback.apply(_module, params) : null;
            while (fn = _module.onload.shift()) {
                fn(_module.exports)
            }
        } else {
            callback && callback.apply(null, params);
        }
    }

    function loadModule(moduleName, callback) {
        let _module = "";
        if (moduleCache[moduleName]) {
            _module = moduleCache[moduleName];
            if (_module.status === "loaded") {
                // 这个很重要，loadModule一定是异步的，effectiveJS 上的某一条建议有写，永远不要同步的调用异步函数，这非常重要
                setTimeout(callback(_module.exports), 0);
            } else {
                // 加载完成的时候调用
                _module.onload.push(callback);
            }
        } else {
            // 第一次加载
            moduleCache[moduleName] = {
                moduleName: moduleName,
                status: "loading",
                exports: null,
                onload: [callback]
            };
            loadScript(getUrl(moduleName));
        }
    }

    F.module = function(...args) {
        // 获取模块构造函数（参数数组中最后一个参数成员）
        let callback = args.pop();
        // 获取依赖模块（紧邻回调函数参数，且数据类型为数组）
        let deps = (args.length && args[args.length - 1] instanceof Array) ? args.pop() : [];
        // 该模块url（模块ID）
        let url = args.length ? args.pop() : null;
        //  依赖模块序列
        let params = [];
        // 未加载的依赖模块数量统计
        let depsCount = 0;

        if(deps.length) {
            deps.forEach((v ,i) => {
                // 增加未加载依赖模块数量统计
                depsCount++;
                // 异步加载依赖模块
                loadModule(deps[i], function(mod) {
                    // 依赖模块序列中添加依赖模块数量统一减一
                    depsCount--;
                    params[i] = mod;
                    // 如果依赖模块全部加载
                    if(depsCount === 0) {
                        // 在模块缓存器中矫正该模块，并执行构造函数
                        setModule(url, params, callback);
                    }
                });
            })     
        } else { // 无依赖模块，直接执行回调函数
            // 在模块缓存器中矫正该模块，并执行构造函数
            setModule(url, [], callback);
        }
    }

})((() => window.F = ({}))());


F.module(["./event", "./dom"], function(events, dom) {
    console.log(events, dom)
    events.on("demo", "click", function() {
        dom.html("demo", "success");
    })
});
</script>

</html>
```



## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://en.wikipedia.org/wiki/Web_widget
https://segmentfault.com/a/1190000019541819
https://blog.csdn.net/yuzhiboyouzhu/article/details/78998860
```

