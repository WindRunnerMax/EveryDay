# v-html可能导致的问题
`Vue`中的`v-html`指令用以更新元素的`innerHTML`，其内容按普通`HTML`插入，不会作为`Vue`模板进行编译，如果试图使用`v-html`组合模板，可以重新考虑是否通过使用组件来替代。


## 描述

### 易导致XSS攻击
`v-html`指令最终调用的是`innerHTML`方法将指令的`value`插入到对应的元素里，这就是容易造成`xss`攻击漏洞的原因了。`Vue`在官网对于此也给出了温馨提示，在网站上动态渲染任意`HTML`是非常危险的，因为容易导致`XSS`攻击，只在可信内容上使用`v-html`，永不用在用户提交的内容上。  
关于`XSS`，跨站脚本攻击`XSS`，是最普遍的`Web`应用安全漏洞。这类漏洞能够使得攻击者嵌入恶意脚本代码到正常用户会访问到的页面中，当正常用户访问该页面时，则可导致嵌入的恶意脚本代码的执行，从而达到恶意攻击用户的目的。当动态页面中插入的内容含有这些特殊字符如`<`时，用户浏览器会将其误认为是插入了`HTML`标签，当这些`HTML`标签引入了一段`JavaScript`脚本时，这些脚本程序就将会在用户浏览器中执行。当这些特殊字符不能被动态页面检查或检查出现失误时，就将会产生`XSS`漏洞。  

* 反射型`XSS`： 攻击者事先制作好攻击链接,需要欺骗用户自己去点击链接才能触发`XSS`代码，所谓反射型`XSS`就是将恶意用户输入的`js`脚本，反射到浏览器执行。
* 存储型`XSS`：代码是存储在服务器中的，如在个人信息或发表文章等地方，加入代码，如果没有过滤或过滤不严，那么这些代码将储存到服务器中，每当有用户访问该页面的时候都会触发代码执行，这种`XSS`非常危险，容易造成蠕虫，大量盗窃`cookie`，也被称为持久型`XSS`。
* `DOM`型`XSS`：类似于反射型`XSS`，但这种`XSS`攻击的实现是通过对`DOM`树的修改而实现的。

```php
// 直接将输入打印到页面，造成XSS // 反射型示例
<?php 
$XssReflex = $_GET['i'];
echo $XssReflex;
```

```html
<!-- 构造url，点击后就可以执行js代码 -->
http://127.0.0.1/xss.php?i=<script>alert("run javascript");</script>
```


### 不作为模板编译
`v-html`更新的是直接使用元素的`innerHTML`方法，内容按普通`HTML`插入，不会作为`Vue`模板进行编译，如果试图使用`v-html`组合模板，可以重新考虑是否通过使用组件来替代。另外后端返回`<script>`标签中的代码是不会直接执行的，这是浏览器的策略，如果需要的话可以在`$nextTick`回调中动态创建`<script>`标签然后`src`引入代码`url`即可。


### scoped样式不能应用
在单文件组件里，`scoped`的样式不会应用在`v-html`内部，因为那部分`HTML`没有被`Vue`的模板编译器处理，如果你希望针对`v-html`的内容设置带作用域的`CSS`，你可以替换为`CSS Modules`或用一个额外的全局`<style>`元素手动设置类似`BEM`的作用域策略。此外提一下关于样式隔离的话，`Shadow DOM`也是个不错的解决方案。关于`CSS Modules`以及`BEM`命名规范可以参考下面的链接。


```
https://zhuanlan.zhihu.com/p/72631379
https://vue-loader.vuejs.org/zh/guide/css-modules.html
https://www.ruanyifeng.com/blog/2016/06/css_modules.html
```



## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://cn.vuejs.org/v2/api/#v-html
https://zhuanlan.zhihu.com/p/72631379
https://juejin.cn/post/6844903918518927367
https://www.cnblogs.com/ming1025/p/13091253.html
https://www.ruanyifeng.com/blog/2017/04/css_in_js.html
https://vue-loader.vuejs.org/zh/guide/css-modules.html
https://www.ruanyifeng.com/blog/2016/06/css_modules.html
```
