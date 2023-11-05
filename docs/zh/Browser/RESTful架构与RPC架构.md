# RESTful架构与RPC架构
在`RESTful`架构中，关注点在于资源，操作资源时使用标准方法检索并操作信息片段，在`RPC`架构中，关注点在于方法，调用方法时将像调用本地方法一样调用服务器的方法。

## RESTful架构
`REST`即表述性状态传递`Representational State Transfer`，是一种软件架构风格，也可以称作是一种设计`API`的模式，`REST`通过`HTTP`协议定义的通用动词方法`GET`、`POST`、`PUT`、`DELETE`，以`URI`对网络资源进行唯一标识，响应端根据请求端的不同需求，通过无状态通信，对其请求的资源进行表述，符合`REST`设计规范的架构就称为`RESTful`架构。

### 主要原则
* 网络上的所有事物都被抽象为资源
* 每个资源都有一个唯一的资源标识符
* 对资源的各种操作不会改变资源标识符
* 所有的操作都是无状态的
* 同一个资源具有多种表现形式如`xml`、`json`等

### 统一资源接口
安全性是指访问`REST`接口时不会对服务端资源状态发生改变。  
幂等性是指对于同一`REST`接口的`URI`多次访问时，得到的资源状态是相同的。
* `GET`: 安全的，幂等的，用于读取资源
* `POST`: 不安全的，不幂等的，用于服务端自动产生的实例号创建资源，更新部分资源
* `PUT`: 不安全的，幂等的，用于客户端的实例号创建资源，更新资源
* `DELETE`: 不安全的，幂等的，用于客户端实例号删除资源

### 实例
* 查询`user`，`GET https://127.0.0.1/user/1`，通过直接携带`params`查询用户
* 新增`user`，`POST https://127.0.0.1/user`，请求`body`附带用户注册信息
* 修改`user`，`PUT https://127.0.0.1/user`，请求`body`附带`userid`标识信息
* 删除`user`，`DELETE https://127.0.0.1/user`，请求`body`附带`userid`标识信息
* 通过请求头`Accept`来获取同一资源的不同形式，如`application/json`与`application/xml`等
* 若将版本号看作同一资源的不同表现形式的话，同样应该在`Accept`字段来区分版本而不是直接在`URI`中添加版本号

## RPC架构
`RPC`即远程过程调用`Remote Procedure Call`，简单的理解是一个节点请求另一个节点提供的服务，远程过程调用，是相对于本地过程调用来说的，当调用方法时就像调用本地方法一样调用远程服务器的方法，做到了轻量、无感知通信。

### 结构组成
* 客户端`client`：服务的调用方
* 服务端`server`：服务的提供方
* 客户端存根`client stub`：将客户端请求参数打包成网络消息，再发给服务方
* 服务端存根`server stub`：接收客户端发来的消息，将消息解包，并调用本地方法


### 通信过程

```
客户端 
1. 将这个调用映射为Call Id
2. 将这个Call Id与参数等序列化，以二进制形式打包
3. 将序列化数据包通过网络通信发送到服务端
4. 等待服务端响应
5. 服务端调用成功并返回结果，反序列化后进行下一步操作

服务端 
1. 在本地维护一个Call Id的Map，用以保证Id与调用方法的对应
2. 等待客户端请求
3. 得到一个请求后，将数据包反序列化，得到Call Id与参数等
4. 通过Map寻找Call Id所对应的函数指针
5. 通过函数指针调用函数，并将数据包反序列化后的参数传递，得到结果
6. 将结果序列化之后通过网络通信返回到客户端

注：
此处的客户端指的是本地调用者，也可以是一台服务器
此处的服务端指的是被调用者，也可以是一台服务器
数据包通信时无论是使用socket进行TCP传输，或使用HTTP进行传输都是可行的
```

## 相关比较
* 在通信协议方面来说，`RESTful`是使用`HTTP`协议进行数据传输，`RPC`一般是使用`TCP`协议数据传输，当然传输协议并不是`RPC`的重点，一般使用`TCP`协议传输是因为其效率高，使用`HTTP`协议传输是完全可行的。
* 在性能方面，`RPC`的传输效率高于`RESTful`数据传输的效率，因为`RCP`具有高效紧凑的进程通信机制，且传输数据量小，在交换大量消息时效率高。
* 在灵活度方面，`RESTful`架构的灵活度高于`RPC`架构，使用`RESTful`架构具有比较好的可读性，`RPC`在编写与调试时略显繁琐。
* 使用`RESTful`架构的接口进行数据传输可以得到多语言支持，`HTTP`协议相对更规范、更通用、更标准，对于中间件而言最先支持的几种协议都包含`RESTful`数据传输规范。
* 内部服务的相互调用推荐使用`RPC`，而对外的接口推荐使用`RESTful`，例如微服务架构模式一般就采用对内`RPC`对外`RESTful`的模式。


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```


## 参考

```
https://www.jianshu.com/p/7d6853140e13
https://www.jianshu.com/p/ee92c9accedd
https://www.zhihu.com/question/28570307
https://www.zhihu.com/question/25536695
https://www.runoob.com/w3cnote/restful-architecture.html
https://blog.csdn.net/bieleyang/article/details/76272699
https://blog.csdn.net/u014590757/article/details/80233901
```
