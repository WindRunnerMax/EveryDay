# DOCTYPE
`DOCTYPE`是`document type`(文档类型)的简写，在`web`设计中用来说明使用的`XHTML`或者`HTML`是什么版本。  
`HTML5` 不基于 `SGML`，所以不需要引用 `DTD`。 

`<!DOCTYPE html>`声明必须是 HTML 文档的第一行，位于 `<html>` 标签之前。   

```xml
<!DOCTYPE html>
<html>
    <head>
        <title></title>
    </head>
    <body>

    </body>
</html>
```
  
在`HTML 4.01`中，`<!DOCTYPE>`声明引用`DTD`，因为`HTML 4.01`基于`SGML`。  
`DTD`规定了标记语言的规则，这样浏览器才能正确地呈现内容。

```
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd">
```

其中的`DTD`叫文档类型定义，里面包含了文档的规则，浏览器就根据定义的`DTD`来解释你页面的标识，并展现出来。  

要建立符合标准的网页，`DOCTYPE`声明是必不可少的关键组成部分；除非你的`XHTML`确定了一个正确的`DOCTYPE`，否则标识和`CSS`都不会生效。  

## XHTML 1.0 提供了三种DTD声明可供选择  
1. 过渡的`Transitional`：要求非常宽松的`DTD`，它允许继续使用`HTML4.01`的标识(但是要符合`xhtml`的写法)，完整代码如下：

```
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
```

2. 严格的`Strict`：要求严格的`DTD`，不能使用任何表现层的标识和属性，例如`<br>`，完整代码如下：

```
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
```

3. 框架的`Frameset`：专门针对框架页面设计使用的`DTD`，如果页面中包含有框架，需要采用这种`DTD`，完整代码如下：

```
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd">
```
