# CSS Hijacking Attack
`CSS` hijacking is a type of hijacking that is not very well recognized, but it does have certain risks. Moreover, because it does not necessarily rely on `JavaScript`, this makes this type of attack easier to implement.

## ClickJacking
When visiting a website, attackers can use `CSS` to transparently hide the actual page they want you to click on, and then display something else on top of it to induce you to click. Clicking on it will perform certain actions without the user's knowledge, and this is known as ClickJacking.

### iframe Overlay
For example, if we have a forum that we want people to follow, we can construct a phishing page to lure users into clicking. In reality, the page that the attacker wants the user to click on is transparent. If the user is logged into the forum on the web page, they will unknowingly follow the forum. This is a relatively minor harm. However, if combined with some form of deception to trick users into entering sensitive information on the page, it can even lead to financial loss.

```html
<!DOCTYPE HTML>
<html>
<meta content="text/html; charset=utf8" />
<head>
<title>ClickJacking</title>
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
          <!-- The button position in the example is fixed and may not be suitable for different resolutions. The button position should be dynamically determined, but as a demo, we won't do too much. -->
          <div>Those Secrets We Can't Say<button>View Details</button></div>
          <iframe src="https://tieba.baidu.com/f?kw=%E6%96%97%E7%A0%B4%E8%8B%8D%E7%A9%B9%E5%8A%A8%E6%BC%AB"></iframe>
     </body>
</html>
```
### Defense
`X-FRAME-OPTIONS` is currently the most reliable method.
`X-FRAME-OPTIONS` is an `HTTP` header proposed by Microsoft specifically used to defend against ClickJacking attacks using `iframe` nesting.
```
DENY // Deny loading from any domain
SAMEORIGIN // Allow loading from the same origin domain
ALLOW-FROM // Define the page address that is allowed to load the frame
```

## CSS Traffic Hijacking
When it comes to inducing users to click and enter a website, utilizing CSS hijacking can be a good approach. Whether it's a forum or an email, there is usually a rich text editor. If the website does not pay attention to this type of attack and handle it properly, it can be easily exploited.

By inserting a link into the rich text, it should normally be `<a href="xxx"></a>`. However, if we apply a style to it or wrap it with a font style, setting the style to `display: block; z-index: 100000; position: fixed; top: 0; left: 0; width: 1000000px; height: 100000px;`, which means making the link a block-level element that covers the entire screen, then regardless of where the user clicks on the page, they will be redirected to the specified page. This hijacks the traffic to your page. If the user does not notice the change in the URL, phishing can also be carried out on the redirected page. To mitigate this type of attack, CSS isolation methods such as CSS modules, shadow DOM, and namespaces are commonly used.

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```