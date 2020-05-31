# Js捕获异常的方法
`JavaScript`的异常主要使用`try catch finally`语句以及窗口对象`window`的`onerror`事件来捕获。

## try catch finally
`try catch finally`只能捕获运行时的错误，无法捕获语法错误，可以拿到出错的信息，堆栈，出错的文件、行号、列号。`try catch finally`语句标记要尝试的语句块，并指定一个出现异常时抛出的响应。

```javascript
try{
    // try_statements
    throw new TypeError("Test");
}catch (e){
    // catch_statements
    console.log("catch_statements");
    if(e instanceof TypeError){
        // handle this expected error
        console.log("handle this expected error");
    }else{
        // handle unexpected error
        console.log("handle unexpected error");
    }
}finally{
    // finally_statements
    console.log("finally_statements");
}

/*
    注：
    [catch (e if e instanceof TypeError) { // 非标准
       catch_statements
    }]
*/
```
通过`Error`的构造器可以创建一个错误对象，当运行时错误产生时，`Error`的实例对象会被抛出，`Error`对象也可用于用户自定义的异常的基础对象，`Js`内建了几种标准错误类型：
* `EvalError`: 创建一个`error`实例，表示错误的原因：与`eval()`有关。
* `RangeError`: 创建一个`error`实例，表示错误的原因：数值变量或参数超出其有效范围。
* `ReferenceError`: 创建一个`error`实例，表示错误的原因：无效引用。
* `SyntaxError`: 创建一个`error`实例，表示错误的原因：`eval()`在解析代码的过程中发生的语法错误。
* `TypeError`: 创建一个`error`实例，表示错误的原因：变量或参数不属于有效类型。
* `URIError`: 创建一个`error`实例，表示错误的原因：给`encodeURI()`或`decodeURl()`传递的参数无效。

## window.onerror
`window.onerror`可以捕捉语法错误，也可以捕捉运行时错误，可以拿到出错的信息，堆栈，出错的文件、行号、列号，只要在当前`window`执行的`Js`脚本出错都会捕捉到，通过`window.onerror`可以实现前端的错误监控。出于安全方面的考虑，当加载自不同域的脚本中发生语法错误时，语法错误的细节将不会报告。

```javascript
/*
    message：错误信息（字符串）。
    source：发生错误的脚本URL（字符串）
    lineno：发生错误的行号（数字）
    colno：发生错误的列号（数字）
    error：Error对象（对象）
    若该函数返回true，则阻止执行默认事件处理函数。
*/
window.onerror = function(message, source, lineno, colno, error) { 
    // onerror_statements
}

/*
    ErrorEvent类型的event包含有关事件和错误的所有信息。
*/
window.addEventListener('error', function(event) { 
    // onerror_statements
})
```




## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.jianshu.com/p/307df0f8d3f0
https://developer.mozilla.org/zh-CN/docs/Web/API/GlobalEventHandlers/onerror
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/try...catch
```
