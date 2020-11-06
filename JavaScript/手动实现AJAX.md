# Ajax

`Ajax`在浏览器是通过`XMLHttpRequest`对象来实现数据传输的。

`XMLHttpRequest`对象进行HTTP请求前必须通过open初始化，open接受五个参数，分别为请求方法、请求链接、异步标识、账号和密码用以服务端验证。

```javascript
open(Method, URL, Asynchronous, UserName, Password)
```
在成功初始化请求之后，`XMLHttpRequest`对象的`setRequestHeader`方法可以用来设置请求头。

```javascript
setRequestHeader(key,value)
```

调用`open()`方法后，就可以通过调用`send()`方法按照open方法设定的参数将请求进行发送。  
```javascript
send(Data)
```
当`open`方法设定发送的方式为异步请求时，`onreadystatechange`事件监听器将自动在`XMLHttpRequest`对象的`readyState`属性改变时被触发。

```javascript
switch(readyState){
    case 1: break; //当open方法被成功调用,readyState为1
    case 2: break; //当send方法被调用，readyState属性被置为2
    case 3: break; //HTTP响应内容开始加载，readyState属性被置为3
    case 4: break; //HTTP响应内容结束加载，readyState属性被置为4
}
```
如果XMLHttpRequest对象的readyState属性还没有变成4，`abort`可以终止请求。这个方法可以确保异步请求中的回调不被执行。
```javascript
abort()
```

##### ajax的简单实现
由于浏览器的同源策略(协议 url 端口号 任一不同都算为跨域请求)，于是此代码需要打开百度的首页，在开发者工具的`Console`直接执行，在`Network`查看效果。

```javascript
    function ajax(url,method="GET",data=null,async=true) {
        // 声明XMLHttpRequest //在IE5和IE6中需要使用ActiveX对象
        var XHR = XMLHttpRequest;
        // 创建XMLHttqRequest
        XHR = new XMLHttpRequest()
        // 设置请求状态改变时执行的函数
        XHR.onreadystatechange = function() {
            if (XHR.readyState === 4 ) console.log(`响应状态:${XHR.status}`,"FINISH") //XHR.responseText为响应体
         }
         // 初始化请求参数
         XHR.open(method,url,async)
         // 发起请求
         XHR.send(data)
    }

    ajax("https://www.baidu.com");
    ajax("https://www.baidu.com","POST","A=1&B=2");
```
