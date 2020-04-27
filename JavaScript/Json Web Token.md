# JSON WEB TOKEN
`JSON WEB TOKEN`简称为`JWT`，是一个基于`JSON`的开放标准，用于通信双方之间传递安全信息的简洁的、`URL`安全的表述性声明规范，经常用于身份验证。

## 结构
`JWT`有三部分组成，他们之间用`.`分隔，这三部分分别是`Header`、`Payload`、`Signature`，结构如下

```javascript
Header.Payload.Signature
```
在`jwt.io`给予的实例

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```
对于这个例子，其三部分组成分别为

```javascript
// header
{
  "alg": "HS256",
  "typ": "JWT"
}

// Payload
{
  "sub": "1234567890",
  "name": "John Doe",
  "iat": 1516239022
}

// Signature
HMACSHA256(
  base64UrlEncode(header) + "." +base64UrlEncode(payload),
  "your-256-bit-secret"
)
```

### Header
`Header`头部，其由两部分组成：声明类型和算法名称，在本例中的`Token`类型为`jwt`，加密算法为`HMAC-SHA256`。将`Header`进行`BASE64URL`算法编码，即可得到`jwt`的第一部分，注意`BASE64URL`算法编码与`BASE64`编码略有不同，`BASE64URL`需要将`BASE64`中输出中的`+`替换为减号`-`，`/`替换为`_`，而且没有标准的`BASE64`填充，把`=`去掉。

```javascript
base64UrlEncode({"alg": "HS256","typ": "JWT"}) === "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
```

### Payload 
`Payload`有效载荷，其为`JWT`的主体，这里可以存放主体数据信息，`Payload`包含三个部分，标准中注册的声明、公共的声明、私有的声明
#### 标准中注册的声明 （建议但不强制使用）
* `iss`: `jwt`签发者
* `sub`: `jwt`主题
* `aud`: `jwt`接收者
* `exp`: `jwt`过期时间
* `nbf`: `jwt`生效时间
* `iat`: `jwt`的签发时间
* `jti`: `jwt`的唯一身份标识，避免重放攻击

#### 公共声明
可以在公共声明添加任何信息，我们一般会在里面添加用户信息和业务信息，但是不建议添加敏感信息，因为公共声明部分可以在客户端解密，除非此信息是加密的。

#### 私有声明
私有声明是服务器和客户端共同定义的声明，同样这里不建议添加敏感信息。

```javascript
base64UrlEncode({"sub": "1234567890","name": "John Doe","iat": 1516239022}) === "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ";
```
### Signature
`Signature`哈希签名，其通过`JWT`中`Header`定义的算法，将前两部分数据进行编码后哈希来生成签名，主要是确保数据不会被篡改。

```javascript
HMACSHA256( base64UrlEncode(header) + "." +base64UrlEncode(payload),"your-256-bit-secret") === "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
```

## 优点
* 无状态和可拓展性，服务器将`JWT`存储到客户端以后不存在状态或者会话信息，易于拓展
* 可以预防`CSRF`攻击，由于使用`JWT`一般放置于请求头的`Authorization: Bearer ${JWT}`字段中而不使用`Cookie`可以有效防止`CSRF`攻击
* `payload`部分可以存储一些其他业务逻辑所必要的非敏感信息，可以减轻服务端压力
* `JWT`的跨语言支持性，由于`json`与加密算法的通用性，在多数语言中都能得到支持
* 相对于`OAuth2`更加轻量，但是其应用场景有所区别，`OAuth2`是一种授权框架，通常用于第三方应用授权，`JWT`是一种认证协议，用于前后端分离的用户认证以及后端`API`的保护

## 缺点
* 一旦签发无法更新，如果想更新数据或者续签，必须重新签发
* 无法废弃，在`JWT`设置的过期时间到达之前，`JWT`始终有效
* `Payload`是使用`BASE64URL`编码的，并没有加密，因此`jwt`中在未加密的情况下不能存储敏感数据
* `JWT`本身包含认证信息，因此一旦信息泄露，任何人都可以获得令牌的所有权限，所以`JWT`的有效期不宜设置太长。
* 伪造`JWT`，攻击者拥有一个`JWT`，可以伪造`Header`中的`alg`为`none`来验证身份，理论上这是符合`JWT`规范要求的，而且有些库中都默认实现此验证，所以需要禁用`alg`为`none`的请求。
* 爆破`HMAC`密钥，由于用户可以拿到完整的`JWT`，其中就包含加密算法，用户可以根据`JWT`中信息爆破密钥，而且整个操作可以本地完成，不需要与服务端交互。

## 相关

```
CSRF https://github.com/WindrunnerMax/EveryDay/blob/master/Browser/CSRF%E8%B7%A8%E7%AB%99%E8%AF%B7%E6%B1%82%E4%BC%AA%E9%80%A0.md
XSS https://github.com/WindrunnerMax/EveryDay/blob/master/Browser/XSS%E8%B7%A8%E7%AB%99%E8%84%9A%E6%9C%AC%E6%94%BB%E5%87%BB.md
Cookie与Session https://github.com/WindrunnerMax/EveryDay/blob/master/HTML/Cookie%E4%B8%8ESession.md
```

## 参考

```
https://www.freebuf.com/vuls/219056.html
https://blog.csdn.net/qq_28165595/article/details/80214994
```