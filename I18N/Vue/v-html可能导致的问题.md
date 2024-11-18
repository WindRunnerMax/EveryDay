# Potential issues with v-html

The `v-html` directive in Vue is used to update the `innerHTML` of an element. Its content is inserted as normal HTML and is not compiled as a Vue template. If you are trying to combine templates using `v-html`, it might be worth reconsidering and using components instead.

## Description

### Vulnerability to XSS Attacks
The `v-html` directive ultimately calls the `innerHTML` method to insert the value of the directive into the corresponding element. This is what makes it susceptible to cross-site scripting (XSS) attacks. Vue's official website also provides a gentle reminder that dynamically rendering arbitrary HTML on a website is extremely dangerous as it can lead to XSS attacks. It's advised to only use `v-html` on trusted content and never on user-submitted content.

Regarding XSS, cross-site scripting attacks are the most common security vulnerabilities in web applications. These vulnerabilities allow attackers to embed malicious scripts into pages that normal users will visit. When a normal user visits such a page, the embedded malicious script can be executed, achieving the attacker's malicious goals. When special characters such as `<` are included in the content inserted into dynamic pages, the user's browser mistakenly interprets them as HTML tags. If these HTML tags introduce a JavaScript script, the script will be executed in the user's browser. When these special characters cannot be checked or are checked incorrectly in dynamic pages, XSS vulnerabilities arise.

- Reflected XSS: Attackers create attack links in advance and need to deceive users into clicking the links to trigger the XSS code. Reflected XSS reflects the malicious user input JavaScript code to the browser for execution.
- Stored XSS: The code is stored on the server, such as in personal information or published articles. If the code is not filtered or insufficiently filtered, it will be stored on the server. Whenever a user visits the page, the code will be executed. This type of XSS is very dangerous and can easily lead to worms and theft of cookies. It's also known as persistent XSS.
- DOM-based XSS: Similar to reflected XSS, but this type of XSS attack is implemented through modifications to the DOM tree.

```php
// Directly printing input to the page, resulting in XSS // Reflected XSS example
<?php 
$XssReflex = $_GET['i'];
echo $XssReflex;
```

```html
<!-- Constructing a URL that can execute JavaScript code upon clicking -->
http://127.0.0.1/xss.php?i=<script>alert("run javascript");</script>
```

### Not Compiled as Template
The content updated by `v-html` directly uses the element's `innerHTML` method, with the content being inserted as normal HTML and not being compiled as a Vue template. If you are trying to use `v-html` to combine templates, it might be worth considering using components instead. Furthermore, the code within `<script>` tags returned by the backend will not be executed directly due to browser policies. If needed, you can dynamically create `<script>` tags and import code URLs in the `$nextTick` callback.

### Scoped Styles Cannot Be Applied
In single-file components, scoped styles will not be applied inside `v-html` because that part of the HTML is not processed by Vue's template compiler. If you want to apply scoped CSS to the content of `v-html`, you can replace it with CSS Modules or manually set up a separate global `<style>` element to implement a scoped strategy similar to BEM. Additionally, when it comes to style isolation, Shadow DOM is also a good solution. For more information about CSS Modules and the BEM naming convention, you can refer to the following links.

```
https://zhuanlan.zhihu.com/p/72631379
https://vue-loader.vuejs.org/zh/guide/css-modules.html
https://www.ruanyifeng.com/blog/2016/06/css_modules.html
```

## Daily Challenge

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://cn.vuejs.org/v2/api/#v-html
https://zhuanlan.zhihu.com/p/72631379
https://juejin.cn/post/6844903918518927367
https://www.cnblogs.com/ming1025/p/13091253.html
https://www.ruanyifeng.com/blog/2017/04/css_in_js.html
https://vue-loader.vuejs.org/zh/guide/css-modules.html
https://www.ruanyifeng.com/blog/2016/06/css_modules.html
```