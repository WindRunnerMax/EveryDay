# XSS Cross-site Scripting Attacks
Cross-site scripting (XSS) is the most common security vulnerability in web applications. This type of vulnerability allows attackers to embed malicious script code into pages that normal users will visit. When a normal user visits such a page, the embedded malicious script code can be executed, thus achieving the attacker's malicious goal.

## Types

- Reflective XSS: Attackers prepare attack links in advance and need to deceive users to click the link to trigger the XSS code. The so-called reflective XSS reflects the malicious user-inputted JavaScript code to execute in the browser.

- Stored XSS: The code is stored on the server, such as in personal information or articles. If code is added without proper filtering or if the filtering is not strict, this code will be stored on the server. Whenever a user visits this page, the code will be triggered. This type of XSS is very dangerous and can easily lead to the creation of worms and the theft of cookies. It is also known as persistent XSS.

- DOM-based XSS: Similar to reflective XSS, but this type of XSS attack is implemented through modifications to the DOM tree.

## Principle
When dynamic pages contain special characters such as `<`, the user's browser mistakenly interprets it as an inserted HTML tag. When these HTML tags introduce a JavaScript script, the script will be executed in the user's browser. When these special characters are not properly checked in dynamic pages, or if there are errors in the checking process, an XSS vulnerability will occur.

Attackers can make users execute pre-defined malicious scripts in their browsers, hijack user sessions, insert malicious content, redirect links, hijack user browsers with malicious software, and more.

Based on reflective XSS vulnerabilities, deceiving users to click and execute JS code can steal cookies, and so on.

```php
// Directly printing the input on the page, causing XSS
<?php 
$XssReflex = $_GET['i'];
echo $XssReflex;
```

```html
<!-- Constructing a URL that, when clicked, executes JS code -->
http://127.0.0.1/xss.php?i=<script>alert("run javascript");</script>
```

Based on stored XSS vulnerabilities, storing JS code in the server database and directly retrieving and displaying it on the page can cause XSS.  
One of the most classic examples of stored XSS vulnerability is a message board. When user A leaves a message with a piece of JS code `<script>alert("run javascript");</script>`, and the backend stores it directly to the database without filtering, when a normal user views their message, this JS code will be executed, potentially stealing cookies.

```
graph LR
Malicious User A --> Construct JS code
Construct JS code --> Server Database
Server Database --> Normal User B Displays Page
Server Database --> Normal User C Displays Page
Server Database --> Normal User... Displays Page
Normal User B Displays Page --> Execute JS to steal cookie
Normal User C Displays Page --> Execute JS to steal cookie
Normal User... Displays Page --> Execute JS to steal cookie
```

DOM-based XSS vulnerabilities are similar to reflective XSS, but they are more versatile. In short, in all positions and in various ways, as long as I can execute my JS. Taking advantage of tags such as `<script>` and `<img>`, which allow cross-origin resource requests.  
A classic case is the ability to write tags into the feedback of software. When an administrator views the feedback of the message, it triggers XSS, and after passing the cookie and the backend management address, the attacker can log in to the backend.

```html
<script src="js_url"></script>
```
```html
<img src=1 onerror=appendChild(createElement('script')).src='js_url' />
```

## Defense
* Before submitting user parameters, escape the submitted characters such as `<`, `>`, `&`, `"`, `'`, `+`, and `/`, and strictly control the output.
* Convert the input to lowercase and compare with `javascript:`, filter if matched.
* Set the `cookie` to `http-only`, so that `js` scripts cannot read the `cookie` information.
* Pure front-end rendering, clearly separate `innerText`, `setAttribute`, `style`, to separate the code from the data.
* Avoid concatenating untrusted data into strings passed to these `APIs`, such as inline event listeners in `DOM`, `location`, `onclick`, `onerror`, `onload`, `onmouseover`, etc., the `href` attribute of the `<a>` tag, `JavaScript`'s `eval()`, `setTimeout()`, `setInterval()`, etc., all of which can run strings as code.
* For untrusted input, a reasonable length should be limited.
* Strict `CSP`, prohibits loading cross-origin code, prohibits cross-origin submissions, and prohibits the execution of inline scripts in stricter ways.

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```