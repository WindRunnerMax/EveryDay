# Ajax

## Description

In the browser, `Ajax` achieves data transmission through the `XMLHttpRequest` object.

Before making an `HTTP` request, the `XMLHttpRequest` object must be initialized through the `open` method. `open` takes five parameters: request method, request URL, asynchronous flag, username, and password for server-side authentication.

```javascript
open(Method, URL, Asynchronous, UserName, Password)
```

After successfully initializing the request, the `setRequestHeader` method of the `XMLHttpRequest` object can be used to set the request header.

```javascript
setRequestHeader(key, value)
```

After calling the `open()` method, the request can be sent with the `send()` method according to the parameters set by the `open` method.

```javascript
send(Data)
```

When the `open` method is set to send the request asynchronously, the `onreadystatechange` event listener will be automatically triggered when the `readyState` property of the `XMLHttpRequest` object changes.

```javascript
switch (readyState) {
    case 1: break; // When the open method is successfully called, readyState is 1
    case 2: break; // When the send method is called, the readyState property is set to 2
    case 3: break; // HTTP response content begins to load, readyState property is set to 3
    case 4: break; // HTTP response content finishes loading, readyState property is set to 4
}
```

If the `readyState` property of the `XMLHttpRequest` object has not yet become `4`, `abort` can be used to terminate the request. This method ensures that callbacks in asynchronous requests are not executed.

```javascript
abort()
```

##### Simple implementation of ajax
Due to the browser's same-origin policy (where different protocols, `URLs`, or port numbers are considered cross-origin requests), this code needs to be executed directly in the `Console` of the developer tools while opening the homepage of Baidu and checking the effect in `Network`.

```javascript
function ajax(url, method="GET", data=null, async=true) {
    // Declare XMLHttpRequest // In IE5 and IE6, the ActiveX object needs to be used
    var XHR = XMLHttpRequest;
    // Create XMLHttpRequest
    XHR = new XMLHttpRequest()
    // Set the function to be executed when the request status changes
    XHR.onreadystatechange = function() {
        if (XHR.readyState === 4 ) console.log(`Response status:${XHR.status}`,"FINISH") //XHR.responseText is the response body
     }
     // Initialize the request parameters
     XHR.open(method, url, async)
     // Initiate the request
     XHR.send(data)
}

ajax("https://www.baidu.com");
ajax("https://www.baidu.com", "POST", "A=1&B=2");
```

## Question of the Day

```
https://github.com/WindrunnerMax/EveryDay
```