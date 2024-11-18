# Methods for catching exceptions in Js

Exception handling in `JavaScript` mainly uses the `try catch finally` statement and the `onerror` event of the `window` object to catch exceptions.

## try catch finally
`try catch finally` can only catch runtime errors and cannot catch syntax errors. It can obtain error information, stack, error file, line number, and column number. The `try catch finally` statement marks the block of statements to be tried and specifies a response to throw when an exception occurs.

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
    Note:
    [catch (e if e instanceof TypeError) { // Non-standard
       catch_statements
    }]
*/
```
An error object can be created using the `Error` constructor. When a runtime error occurs, an instance of the `Error` will be thrown. The `Error` object can also be used as the base object for user-defined exceptions. `JavaScript` has several standard error types built in:
* `EvalError`: Create an error instance that represents the reason for the error: related to `eval()`.
* `RangeError`: Create an error instance that represents the reason for the error: a numeric variable or parameter is outside its valid range.
* `ReferenceError`: Create an error instance that represents the reason for the error: an invalid reference.
* `SyntaxError`: Create an error instance that represents the reason for the error: a syntax error that occurs during the parsing of code by `eval()`.
* `TypeError`: Create an error instance that represents the reason for the error: a variable or parameter is not of a valid type.
* `URIError`: Create an error instance that represents the reason for the error: the argument passed to `encodeURI()` or `decodeURl()` is not valid.

## window.onerror
`window.onerror` can capture syntax errors as well as runtime errors. It can obtain error information, stack, error file, line number, and column number. It captures errors from `JavaScript` scripts executed in the current `window`, and frontend error monitoring can be implemented using `window.onerror`. For security reasons, when a syntax error occurs while loading scripts from a different domain, the details of the syntax error will not be reported.

```javascript
/*
    message: error message (string).
    source: URL of the script where the error occurred (string).
    lineno: line number where the error occurred (number).
    colno: column number where the error occurred (number).
    error: Error object (object).
    If this function returns true, it prevents the default event handler from executing.
*/
window.onerror = function(message, source, lineno, colno, error) { 
    // onerror_statements
}

/*
    The event of the ErrorEvent type contains all the information about the event and the error.
*/
window.addEventListener('error', function(event) { 
    // onerror_statements
})
```




## Daily question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://www.jianshu.com/p/307df0f8d3f0
https://developer.mozilla.org/zh-CN/docs/Web/API/GlobalEventHandlers/onerror
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/try...catch
```