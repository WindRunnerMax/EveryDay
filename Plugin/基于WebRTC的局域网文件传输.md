# 基于WebRTC的局域网文件传输
`WebRTC(Web Real-Time Communications)`是一项实时通讯技术，允许网络应用或者站点，在不借助中间媒介的情况下，建立浏览器之间点对点`P2P(Peer-to-Peer)`的连接，实现视频流、音频流、文件等等任意数据的传输，`WebRTC`包含的这些标准使用户在无需安装任何插件或者第三方的软件的情况下，可以创建点对点`Peer-to-Peer`的数据分享和电话会议等。


## 描述
通常来说，在发起文件传输或者音视频通话等场景的时候，我们需要借助第三方的服务器来中转数据，例如我们通过`IM`即时通讯软件向对方发送消息的时候，我们的消息会先发送到服务器，然后服务器再将消息发送到对方的客户端，这种方式的好处是可以保证消息的可靠性，但是存在的问题也比较明显，通过服务器进行转发的速度会受限于服务器本身的带宽，同时也会增加服务器的负载，特别是在传输文件或者进行音视频聊天的情况下，会给予服务器比较大的压力，对于服务提供商来说提供服务器的带宽同样也是很大的开销，对于用户来说文件与消息经由服务器转发也存在安全与隐私方面的问题。

`WebRTC`的出现解决了这些问题，其允许浏览器之间建立点对点的连接，实现数据的传输，以及实时通信的复杂性、插件依赖和兼容性问题，提高了安全性和隐私保护。因此`WebRTC`广泛应用于实时通信领域，包括视频会议、音视频聊天、远程协作、在线教育和直播等场景。而具体到`WebRTC`与`P2P`的数据传输上，主要是解决了如下问题: 

1. `WebRTC`提供了一套标准化的`API`和协议，使开发者能够更轻松地构建实时通信应用，无需深入了解底层技术细节。
2. `WebRTC`支持加密传输，使用`DTLS-SRTP`对传输数据进行加密，确保通信内容的安全性，对于敏感信息的传输非常重要。
3. `WebRTC`使用`P2P`传输方式，使得数据可以直接在通信双方之间传输，减轻了服务器的负担，且通信质量不受服务器带宽限制。
4. `P2P`传输方式可以直接在通信双方之间传输数据，减少了数据传输的路径和中间环节，从而降低了传输延迟，实现更实时的通信体验。
5. `P2P`传输方式不需要经过中心服务器的中转，减少了第三方对通信内容的访问和监控，提高了通信的隐私保护。

在前一段时间，我想在手机上向电脑发送文件，因为要发送的文件比较多，所以我想直接通过`USB`连到电脑上传输，等我将手机连到电脑上之后，我发现手机竟然无法被电脑识别，能够充电但是并不能传文件，因为我的电脑是`Mac`而手机是`Android`，所以无法识别设备这件事就变得合理了起来。那么接着我想用`WeChat`去传文件，但是一想到传文件之后我还需要手动将文件删掉否则会占用我两份手机存储并且传输还很慢，我就又开始在网上寻找软件，这时候我突然想起来了`AirDrop`，就想着有没有类似的软件可以用，然后我就找到了`Snapdrop`这个项目，我觉得这个项目很神奇，不需要登录就可以在局域网内发现设备并且传输文件，于是在好奇心的驱使下我也学习了一下，并且基于`WebRTC/WebSocket`实现了类似的文件传输方案`https://github.com/WindrunnerMax/FileTransfer`，整体来说解决了如下问题: 

1. 局域网内可以互相发现，不需要手动输入对方`IP`地址等信息。
2. 多个设备中的任意两个设备之间可以相互传输文本消息与文件数据。
3. 设备间的数据传输采用基于`WebRTC`的`P2P`方案，无需服务器中转数据。
4. 跨局域网传输且`NAT`穿越受限的情况下，基于`WebSocket`服务器中转传输。

此外，如果需要调试`WebRTC`的链接，可以在`Chrome`中打开`about://webrtc-internals/`，`FireFox`中打开`about:webrtc`即可进行调试，在这里可以观测到`WebRTC`的`ICE`交换、数据传输、事件触发等等。


## WebRTC
`WebRTC`是一套复杂的协议，同样也是`API`，并且提供了音视频传输的一整套解决方案，可以总结为跨平台、低时延、端对端的音视频实时通信技术。`WebRTC`提供的`API`大致可以分为三类，分别是`Media Stream API`设备音视频流、`RTCPeerConnection API`本地计算机到远端的`WebRTC`连接、`Peer-To-Peer Data API`浏览器之间`P2P`数据传输信道。在`WebRTC`的核心层中，同样包含三大核心模块，分别是`Voice Engine`音频引擎、`Video Engine`视频引擎、`Transport`传输模块。音频引擎`Voice Engine`中包含`iSAC/iLBC Codec`音频编解码器、`NetEQ For Voice`网络抖动和丢包处理、` Echo Canceler/Noise Reduction`回音消除与噪音抑制等。`Video Engine`视频引擎中包括`VP8 Codec`视频编解码器、`Video Jitter Buffer`视频抖动缓冲器、`Image Enhancements`图像增强等。`Transport`传输模块中包括`SRTP`安全实时传输协议、`Multiplexing`多路复用、​`STUN+TURN+ICE`网络传输`NAT`穿越，`DTLS`数据报安全传输等。

由于在这里我们的主要目的是数据传输，所以我们只需要关心`API`层面上的`RTCPeerConnection API`和`Peer-To-Peer Data API`，以及核心层中的`Transport`传输模块即可。实际上由于网络以及场景的复杂性，基于`WebRTC`衍生出了大量的方案设计，而在网络框架模型方面，便有着三种架构: `Mesh`架构即真正的`P2P`传输，每个客户端与其他客户端都建立了连接，形成了网状的结构，这种架构可以同时连接的客户端有限，但是优点是不需要中心服务器，实现简单；`MCU-MultiPoint Control Unit`网络架构即传统的中心化架构，每个浏览器仅与中心的MCU服务器连接，`MCU`服务器负责所有的视频编码、转码、解码、混合等复杂逻辑，这种架构会对服务器造成较大的压力，但是优点是可以支持更多的人同时音视频通讯，比较适合多人视频会议。`SFU-Selective Forwarding Unit`网络架构类似于`MCU`的中心化架构，仍然有中心节点服务器，但是中心节点只负责转发，不做太重的处理，所以服务器的压力会低很多，这种架构需要比较大的带宽消耗，但是优点是服务器压力较小，典型场景是`1`对`N`的视频互动。对于我们而言，我们的目标是局域网之间的数据传输，所以并不会涉及此类复杂的网络传输架构模型，我们实现的是非常典型的`P2P`架构，甚至不需要`N-N`的数据传输，但是同样也会涉及到一些复杂的问题，例如`NAT`穿越、`ICE`交换、`STUN`服务器、`TURN`服务器等等。

### 信令

### 连接

### 通信

## WebSocket
`P2P`打洞难点、`TURN`转发、全双工信道、非`AP`隔离

### 连接

### 通信

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://icetest.info/
https://www.stunprotocol.org/
https://blog.p2hp.com/archives/11075
https://github.com/RobinLinus/snapdrop
https://web.dev/articles/webrtc-basics
https://juejin.cn/post/6950234563683713037
https://juejin.cn/post/7171836076246433799
https://bloggeek.me/webrtc-vs-websockets/amp
https://github.com/wangrongding/frontend-park
https://muazkhan.com:9001/demos/file-sharing.html
https://socket.io/zh-CN/docs/v4/server-socket-instance/
https://socket.io/zh-CN/docs/v4/client-socket-instance/
https://developer.mozilla.org/zh-CN/docs/Web/API/RTCPeerConnection/createDataChannel
https://developer.mozilla.org/zh-CN/docs/Web/API/WebRTC_API/Simple_RTCDataChannel_sample
```
