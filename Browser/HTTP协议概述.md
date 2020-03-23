# HTTP协议概述

`HTTP`超文本传输协议，基于`TCP/IP`通信协议传输数据

## 特点
* `HTTP`是无连接的：无连接的含义是限制每次连接只处理一个请求。服务器处理完客户的请求，并收到客户的应答后，即断开连接，采用这种方式可以节省传输时间。
* `HTTP`是媒体独立的：只要客户端和服务器知道如何处理的数据内容，任何类型的数据都可以通过`HTTP`发送，在`HTTP`中使用`Content-Type`来表明资源媒体类型。
* `HTTP`是无状态的：`HTTP`协议是无状态协议，指协议对于事务处理没有记忆能力。缺少状态意味着如果后续处理需要前面的信息，则它必须重传，这样可能导致每次连接传送的数据量增大。另一方面，在服务器不需要先前信息时它的应答就较快。


## 请求方法
`HTTP1.0`定义了三种请求方法：`GET`、`POST`、`HEAD`方法。  
`HTTP1.1`新增了六种请求方法：`OPTIONS`、`PUT`、`PATCH`、`DELETE`、`TRACE`和`CONNECT`方法。
* `GET`: 请求指定的页面信息，并返回实体主体。由于各浏览器对于`URL`的长度都有限制，一般使用不超过`4K`。
* `POST`: 向指定资源提交数据进行处理请求（例如提交表单或者上传文件）。数据被包含在请求体中，`POST` 请求可能会导致新的资源的建立和/或已有资源的修改，其请求携带的最大资源大小由服务器设定。
* `HEAD`: 类似于`GET`请求，只不过返回的响应中没有具体的内容，用于获取报头
* `PUT`: 从客户端向服务器传送的数据取代指定的文档的内容。
* `DELETE`: 请求服务器删除指定的页面。
* `CONNECT`: 可以开启一个客户端与所请求资源之间的双向沟通的通道，它可以用来创建隧道`tunnel`。
* `OPTIONS`: 用于获取目的资源所支持的通信选项。
* `TRACE`: 实现沿通向目标资源的路径的消息环回`loop-back`测试 ，提供了一种实用的`debug` 机制。
* `PATCH`: 是对`PUT`方法的补充，用来对已知资源进行局部更新 。

## 请求头
* `Accept`: 指定客户端能够接收的内容类型
* `Accept-Charset`: 浏览器可以接受的字符编码集。
* `Accept-Encoding`: 指定浏览器可以支持的web服务器返回内容压缩编码类型。
* `Accept-Language`: 浏览器可接受的语言
* `Accept-Ranges`: 可以请求网页实体的一个或者多个子范围字段
* `Authorization`: HTTP授权的授权证书
* `Cache-Control`: 指定请求和响应遵循的缓存机制
* `Connection`: 表示是否需要持久连接。
* `Cookie`: HTTP请求发送时，会把保存在该请求域名下的所有cookie值一起发送给web服务器。
* `Content-Length`: 请求的内容长度
* `Content-Type`: 请求的与实体对应的`MIME`信息
* `Date`: 请求发送的日期和时间
* `Expect`: 请求的特定的服务器行为
* `From`: 发出请求的用户的`Email`
* `Host`: 指定请求的服务器的域名和端口号
* `If-Match`: `HTTP`请求报头使得所述请求为条件。对于`GET`和`HEAD`方法，服务器将只在与请求的资源匹配时发回请求的资源`ETags`。对于`PUT`和其他非安全方法，在这种情况下它只会上传资源。
* `If-Modified-Since`: 如果请求的部分在指定时间之后被修改则请求成功，未被修改则返回`304`代码
* `If-None-Match`: 如果内容未改变返回`304`代码，参数为服务器先前发送的`Etag`，与服务器回应的`Etag`比较判断是否改变
* `If-Range`: 如果实体未改变，服务器发送客户端丢失的部分，否则发送整个实体。参数也为`Etag`
* `If-Unmodified-Since`: 只在实体在指定时间之后未被修改才请求成功
* `Max-Forwards`: 限制信息通过代理和网关传送的时间
* `Pragma`: 用来包含实现特定的指令
* `Proxy-Authorization`: 包含用于向代理服务器认证用户代理的凭证，通常在服务器响应`407` `Proxy Authentication Required`状态和`Proxy-Authenticate`标题后。
* `Range`: 只请求实体的一部分，指定范围
* `Referer`: 先前网页的地址，当前请求网页紧随其后,即来路
* `TE`: 客户端愿意接受的传输编码，并通知服务器接受接受尾加头信息
* `Upgrade`: 向服务器指定某种传输协议以便服务器进行转换（如果支持）
* `User-Agent`: `User-Agent`的内容包含发出请求的用户信息
* `Via`: 通知中间网关或代理服务器地址，通信协议
* `Warning`: 关于消息实体的警告信息
* `X-Forwarded-For`: `XFF`是用于通过`HTTP`代理或负载平衡器识别连接到`web`服务器的客户端的发起`IP`地址的事实上的标准报头。
* `X-Forwarded-Host`: `XFH`是用于识别由客户机在所要求的原始主机一个事实上的标准报头`Host`的`HTTP`请求报头。
* `X-Forwarded-Proto`: `XFP`用于识别协议`HTTP`或`HTTPS`，其中使用的客户端连接到代理或负载平衡器一个事实上的标准报头。


## 响应头
* `Accept-Ranges`: 表明服务器是否支持指定范围请求及哪种类型的分段请求
* `Age`: 从原始服务器到代理缓存形成的估算时间
* `Allow`: 对某网络资源的有效的请求行为，不允许则返回`405`
* `Cache-Control`: 告诉所有的缓存机制是否可以缓存及哪种类型
* `Content-Encoding`: `web`服务器支持的返回内容压缩编码类型。
* `Content-Language`: 响应体的语言
* `Content-Length`: 响应体的长度
* `Content-Location`: 请求资源可替代的备用的另一地址
* `Content-MD5`: 返回资源的`MD5`校验值
* `Content-Range`: 在整个返回体中本部分的字节位置
* `Content-Type`: 返回内容的`MIME`类型
* `Date`: 原始服务器消息发出的时间
* `ETag`: 请求变量的实体标签的当前值
* `Expires`: 响应过期的日期和时间
* `Last-Modified`: 请求资源的最后修改时间
* `Location`: 用来重定向接收方到非请求`URL`的位置来完成请求或标识新的资源
* `Pragma`: 包括实现特定的指令，它可应用到响应链上的任何接收方
* `Proxy-Authenticate`: 它指出认证方案和可应用到代理的该`URL`上的参数
* `refresh`: 应用于重定向或一个新的资源被创造，在5秒之后重定向
* `Retry-After`: 如果实体暂时不可取，通知客户端在指定时间之后再次尝试
* `Server`: `web`服务器软件名称
* `Set-Cookie`: 设置`Http Cookie`
* `Trailer`: 指出头域在分块传输编码的尾部存在
* `Transfer-Encoding`: 文件传输编码
* `Vary`: 告诉下游代理是使用缓存响应还是从原始服务器请求
* `Via`: 告知代理客户端响应是通过哪里发送的
* `Warning`: 警告实体可能存在的问题
* `WWW-Authenticate`: 表明客户端请求实体应该使用的授权方案
* `X-Frame-Options`: 可以被用来指示一个浏览器是否应该被允许在一个以呈现页面`<frame>`，`<iframe>`或`<object>`。通过确保其内容未嵌入其他网站，网站可以使用此功能来避免点击劫持攻击。
* `X-XSS-Protection`: 可在检测到反射的跨站点脚本`XSS`攻击时阻止页面加载。

## 状态码
### 五种类型
* `1xx`: 信息，服务器收到请求，需要请求者继续执行操作
* `2xx`: 成功，操作被成功接收并处理
* `3xx`: 重定向，需要进一步的操作以完成请求
* `4xx`: 客户端错误，请求包含语法错误或无法完成请求
* `5xx`: 服务器错误，服务器在处理请求的过程中发生了错误

### 详细
* `100` `Continue`: 继续，客户端应继续其请求
* `101` `Switching Protocols`:  切换协议。服务器根据客户端的请求切换协议。只能切换到更高级的协议，例如，切换到`HTTP`的新版本协议
* `200` `OK`: 请求成功。一般用于`GET`与`POST`请求
* `201` `Created`: 已创建。成功请求并创建了新的资源
* `202` `Accepted`: 已接受。已经接受请求，但未处理完成
* `203` `Non-Authoritative Information`:    非授权信息。请求成功。但返回的`meta`信息不在原始的服务器，而是一个副本
* `204` `No Content`: 无内容。服务器成功处理，但未返回内容。在未更新网页的情况下，可确保浏览器继续显示当前文档
* `205` `Reset Content`:    重置内容。服务器处理成功，用户终端应重置文档视图。可通过此返回码清除浏览器的表单域
* `206` `Partial Content`: 部分内容。服务器成功处理了部分`GET`请求
* `300` `Multiple Choices`:     多种选择。请求的资源可包括多个位置，相应可返回一个资源特征与地址的列表用于用户终端选择
* `301` `Moved Permanently`:    永久移动。请求的资源已被永久的移动到新`URI`，返回信息会包括新的`URI`，浏览器会自动定向到新`URI`。今后任何新的请求都应使用新的`URI`代替
* `302` `Found`: 临时移动。与`301`类似。但资源只是临时被移动。客户端应继续使用原有`URI`
* `303` `See Other`: 查看其它地址。与`301`类似。使用`GET`和`POST`请求查看
* `304` `Not Modified`: 未修改。所请求的资源未修改，服务器返回此状态码时，不会返回任何资源。客户端通常会缓存访问过的资源，通过提供一个头信息指出客户端希望只返回在指定日期之后修改的资源
* `305` `Use Proxy`: 使用代理。所请求的资源必须通过代理访问
* `306` `Unused`: 已经被废弃的`HTTP`状态码
* `307` `Temporary Redirect`: 临时重定向。与`302`类似。使用`GET`请求重定向
* `400` `Bad Request`: 客户端请求的语法错误，服务器无法理解
* `401` `Unauthorized`: 请求要求用户的身份认证
* `402` `Payment Required`: 保留，将来使用
* `403` `Forbidden`: 服务器理解请求客户端的请求，但是拒绝执行此请求
* `404` `Not Found`: 服务器无法根据客户端的请求找到资源
* `405` `Method Not Allowed`: 客户端请求中的方法被禁止
* `406` `Not Acceptable`: 服务器无法根据客户端请求的内容特性完成请求
* `407` `Proxy Authentication Required`:    请求要求代理的身份认证，与`401`类似，但请求者应当使用代理进行授权
* `408` `Request Time-out`: 服务器等待客户端发送的请求时间过长，超时
* `409` `Conflict`: 服务器完成客户端的`PUT` 请求时可能返回此代码，服务器处理请求时发生了冲突
* `410` `Gone`: 客户端请求的资源已经不存在。`410`不同于`404`，如果资源以前有现在被永久删除了可使用`410`代码，网站设计人员可通过`301`代码指定资源的新位置
* `411` `Length Required`: 服务器无法处理客户端发送的不带`Content-Length`的请求信息
* `412` `Precondition Failed`: 客户端请求信息的先决条件错误
* `413` `Request Entity Too Large`:     由于请求的实体过大，服务器无法处理，因此拒绝请求。为防止客户端的连续请求，服务器可能会关闭连接。如果只是服务器暂时无法处理，则会包含一个`Retry-After`的响应信息
* `414` `Request-URI Too Large`: 请求的`URI`过长，服务器无法处理
* `415` `Unsupported Media Type`: 服务器无法处理请求附带的媒体格式
* `416` `Requested range not satisfiable`: 客户端请求的范围无效
* `417` `Expectation Failed`: 服务器无法满足`Expect`的请求头信息
* `500` `Internal Server Error`: 服务器内部错误，无法完成请求
* `501` `Not Implemented`: 服务器不支持请求的功能，无法完成请求
* `502` `Bad Gateway`:  作为网关或者代理工作的服务器尝试执行请求时，从远程服务器接收到了一个无效的响应
* `503` `Service Unavailable`:  由于超载或系统维护，服务器暂时的无法处理客户端的请求。延时的长度可包含在服务器的`Retry-After`头信息中
* `504` `Gateway Time-out`: 充当网关或代理的服务器，未及时从远端服务器获取请求
* `505` `HTTP Version not supported`: 服务器不支持请求的`HTTP`协议的版本，无法完成处理

## 参考

```
https://cloud.tencent.com/developer/doc/1117
https://www.runoob.com/http/http-tutorial.html
https://developer.mozilla.org/zh-CN/docs/Web/HTTP
```
