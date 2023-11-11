# Widget Mode
The `Widget` mode refers to breaking down a page into components by borrowing the idea of `Web Widget`. It involves developing components aimed at creating a complete page. `Web Widget` refers to a block of code that can be executed on any page. The `Widget` mode does not belong to the category of the 23 design patterns defined in general. It is usually considered a broad architectural design pattern.

## Description
Modular development allows the functions of a page to be refined, and each functional module can be implemented one by one to meet the system's requirements. This is a very good programming practice. With the help of a simple template engine implemented in the simple template pattern, this can be very easily achieved. This approach is more suitable for collaborative development by multiple teams, reducing the probability of coupling effects caused by the creation of functions or views. Diversification of components will also help in building richer pages and increase the reuse rate of components.

## Implementation

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
// template.js
F.module("./template", function() {
```

```javascript
/***
 *   Template engine, the entry point for compiling templates
 *   @param  str     Module container id or template string
 *   @param  data    Rendering data
 **/
var _TplEngine = function(str, data) {
    // If the data is an array
    if (data instanceof Array) {
        // Cache the template rendering result
        var html = "";
        // Data index
        var i = 0;
        // Data length
        var len = data.length;
        // Iterate through the data
        for (; i < len; i++) {
            // Cache the template rendering result, or you can write it as
            // html += arguments.callee(str, data[i]) ;
            html += _getTpl(str)(data[i]);
        }
        // Return the final result of template rendering
        return html;
    } else {
        // Return the template rendering result
        return _getTpl(str)(data);
    }
};
/***
 *   Get template
 *   @param  str Template container id, or template string
 **/
var _getTpl = function(str) {
    // Get the element
    var ele = document.getElementById(str);
    // If the element exists
    if (ele) {
        // If it is an input or textarea form element, then get the value of the element, otherwise get the content of the element
        var html = /^(textarea | input)$/i.test(ele.nodeName) ? ele.value : ele.innerHTML;
        // Compile the template
        return _compileTpl(html);
    } else {
        // Compile the template
        return _compileTpl(str);
    }
};
// Handle the template
var _dealTpl = function(str) {
    // Left delimiter
    var _left = "{%";
    // Right delimiter
    var _right = "%}";
    // Convert to string
    return String(str)
        // Escape < inside tags, e.g.: <div>{%if(a&lt;b)%}</div> -> <div>{%if(a<b)%}</div>
        .replace(/&lt;/g, "<")
        // Escape >
        .replace(/&gt;/g, ">")
        // Filter out line breaks, tabs, and carriage returns
        .replace(/[\r\t\n]/g, "")
        // Replace content
        .replace(new RegExp(_left + "=(.*?)" + _right, "g"), "',typeof($1) === 'undefined' ? '' : $1, '")
        // Replace left delimiter
        .replace(new RegExp(_left, "g"), "');")
        // Replace right delimiter
        .replace(new RegExp(_right, "g"), "template_array.push('");

};
/***
 *   Compile and execute
 *   @param  str Template data
 **/
var _compileTpl = function(str) {
    // Compile function body
    var fnBody = "var template_array=[];\nvar fn=(function(data){\nvar template_key='';\nfor(key in data){\ntemplate_key +=(''+key+'=data[\"'+key+'\"];');\n}\neval(template_key);\ntemplate_array.push('" + _dealTpl(str) + "');\ntemplate_key=null;\n})(templateData);\nfn=null;\nreturn template_array.join('') ;";
    // Compile function
    return new Function("templateData", fnBody);
};

// Return
return _TplEngine;
});
```

```html
<!-- demo.html -->
<!DOCTYPE html>
<html>

<head>
    <title>Widget mode</title>
</head>
```

```html
<body>
    <div id="app"></div>
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
        let _module = null,
            fn = null;
        if (moduleCache[moduleName]) {
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
                // This is very important. loadModule must be asynchronous. An advice in EffectiveJS says: never synchronously call an asynchronous function, this is very important.
                setTimeout(callback(_module.exports), 0);
            } else {
                // Call when the loading is completed
                _module.onload.push(callback);
            }
        } else {
            // First load
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
        // Get the module constructor function (the last member in the arguments array)
        let callback = args.pop();
        // Get dependent modules (adjoining the callback function as an array and data type is an array)
        let deps = (args.length && args[args.length - 1] instanceof Array) ? args.pop() : [];
        // The URL of the module (module ID)
        let url = args.length ? args.pop() : null;
        // Dependent modules sequence
        let params = [];
        // Number of unloaded dependent modules
        let depsCount = 0;
```

```javascript
if (deps.length) {
    deps.forEach((v, i) => {
        // Increase the count of unloaded dependency modules
        depsCount++;
        // Asynchronously load dependency modules
        loadModule(deps[i], function(mod) {
            // Reduce the count of dependency modules in the sequence by one
            depsCount--;
            params[i] = mod;
            // If all dependency modules are loaded
            if (depsCount === 0) {
                // Correct the module in the module cache and execute the constructor function
                setModule(url, params, callback);
            }
        });
    })
} else { // No dependency modules, execute the callback function directly
    // Correct the module in the module cache and execute the constructor function
    setModule(url, [], callback);
}
};

})((() => window.F = ({}))());
</script>
<!-- Template content -->
<script type="text/template" id="tpl">
    <div id="tag_cloud">
        {% for(var i = 0; i < tagCloud.length; i++){ 
            var ctx = tagCloud[i] ; %}
        <a href="#" class="tag_item 
            {% if(ctx["is_selected"]){ %}
            selected
            {% } %}" title="{%=ctx["title"]%}">{%=ctx["text"]%}
        </a>
        {% } %}
    </div>
</script>
<!-- Custom template -->
<!--===============End of template type===========-->
<script type="text/javascript">
// Simulated data
var data = {
    tagCloud: [
        { is_selected: true, title: "Pattern", text: "Design Pattern" },
        { is_selected: false, title: "HTML", text: "HTML" },
        { is_selected: null, title: "CSS", text: "CSS" },
        { is_selected: "", title: "JavaScript", text: "JavaScript" },
    ]
}

F.module(["./template", "./dom"], function(template, dom) {
    // Logic for retrieving data from the server
    // Creating component view logic
    var str = template("tpl", data);
    dom.html("app", str);
    // Other component interaction logic
});
</script>
</html>
```



## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://en.wikipedia.org/wiki/Web_widget
https://segmentfault.com/a/1190000019541819
https://blog.csdn.net/yuzhiboyouzhu/article/details/78998860
```