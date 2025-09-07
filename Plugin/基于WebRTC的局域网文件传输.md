# 基于WebRTC的局域网文件传输
`WebRTC(Web Real-Time Communications)`是一项实时通讯技术，允许网络应用或者站点，在不借助中间媒介的情况下，建立浏览器之间点对点`P2P(Peer-To-Peer)`的连接，实现视频流、音频流、文件等等任意数据的传输。`WebRTC`包含的这些标准使用户在无需安装任何插件或者第三方的软件的情况下，可以创建点对点`Peer-To-Peer`的数据分享和电话会议等。

<details>
<summary><strong>WebRTC 局域网数据传输系列文章</strong></summary>

* [基于 WebRTC 的局域网文件传输](./基于WebRTC的局域网文件传输.md)
* [基于 ServiceWorker 的文件传输方案](./基于ServiceWorker的文件传输方案.md)

</details>

## 概述
通常来说，在发起文件传输或者音视频通话等场景的时候，我们需要借助第三方的服务器来中转数据。例如我们通过`IM`即时通讯软件向对方发送消息的时候，我们的消息会先发送到服务器，然后服务器再将消息发送到对方的客户端。这种方式的好处是可以保证消息的可靠性，但是存在的问题也比较明显。通过服务器进行转发的速度会受限于服务器本身的带宽，同时也会增加服务器的负载，特别是在传输文件或者进行音视频聊天的情况下，会给予服务器比较大的压力。对于服务提供商来说提供服务器的带宽同样也是很大的开销，对于用户来说文件与消息经由服务器转发也存在安全与隐私方面的问题。

`WebRTC`的出现解决了这些问题，其允许浏览器之间建立点对点的连接，实现数据的传输，以及处理了实时通信的复杂性、插件依赖和兼容性问题，提高了安全性和隐私保护。因此`WebRTC`广泛应用于实时通信领域，包括视频会议、音视频聊天、远程协作、在线教育和直播等场景。而具体到`WebRTC`与`P2P`的数据传输上，主要是解决了如下问题: 

1. `WebRTC`提供了一套标准化的`API`和协议，使开发者能够更轻松地构建实时通信应用，无需深入了解底层技术细节。
2. `WebRTC`支持加密传输，使用`DTLS-SRTP`对传输数据进行加密，确保通信内容的安全性，对于敏感信息的传输非常重要。
3. `WebRTC`使用`P2P`传输方式，使得数据可以直接在通信双方之间传输，减轻了服务器的负担，且通信质量不受服务器带宽限制。
4. `P2P`传输方式可以直接在通信双方之间传输数据，减少了数据传输的路径和中间环节，从而降低了传输延迟，实现更实时的通信体验。
5. `P2P`传输方式不需要经过中心服务器的中转，减少了第三方对通信内容的访问和监控，提高了通信的隐私保护。

在前一段时间，我想在手机上向电脑发送文件，因为要发送的文件比较多，所以我想直接通过`USB`连到电脑上传输。等我将手机连到电脑上之后，我发现手机竟然无法被电脑识别，能够充电但是并不能传文件，因为我的电脑是`Mac`而手机是`Android`，所以无法识别设备这件事就变得合理了起来。那么接着我想用`WeChat`去传文件，但是一想到传文件之后我还需要手动将文件删掉，否则会占用我两份手机存储并且传输还很慢。由此我就又开始在网上寻找软件，这时候我突然想起来了`AirDrop`也就是隔空投送，就想着有没有类似的软件可以用，然后我就找到了`Snapdrop`这个项目。

我觉得这个项目很神奇，不需要登录就可以在局域网内发现设备并且传输文件，于是在好奇心的驱使下我也学习了一下，并且基于`WebRTC/WebSocket`实现了类似的文件传输方案`https://github.com/WindrunnerMax/FileTransfer`。通过这种方式，任何拥有浏览器的设备都有传输数据的可能，不需要借助数据线传输文件，也不会受限于`Apple`全家桶才能使用的隔空投送，以及天然的跨平台优势可以应用于常见的`IOS/Android/Mac`设备向`PC`台式设备传输文件的场景等等。此外即使因为各种原因路由器开启了`AP`隔离功能，我们的服务依旧可以正常交换数据，这样避免了在路由器不受我们控制的情况下通过`WIFI`传输文件的掣肘。那么回归到项目本身，具体来说在完成功能的过程中解决了如下问题: 

1. 局域网内可以互相发现，不需要手动输入对方`IP`地址等信息。
2. 多个设备中的任意两个设备之间可以相互传输文本消息与文件数据。
3. 设备间的数据传输采用基于`WebRTC`的`P2P`方案，无需服务器中转数据。
4. 跨局域网传输且`NAT`穿越受限的情况下，基于`WebSocket`服务器中转传输。

此外，如果需要调试`WebRTC`的链接，可以在`Chrome`中打开`about://webrtc-internals/`，`FireFox`中打开`about:webrtc`即可进行调试，在这里可以观测到`WebRTC`的`ICE`交换、数据传输、事件触发等等。


## WebRTC
`WebRTC`是一套复杂的协议，同样也是`API`，并且提供了音视频传输的一整套解决方案，可以总结为跨平台、低时延、端对端的音视频实时通信技术。`WebRTC`提供的`API`大致可以分为三类，分别是`Media Stream API`设备音视频流、`RTCPeerConnection API`本地计算机到远端的`WebRTC`连接、`Peer-To-Peer RTCDataChannel API`浏览器之间`P2P`数据传输信道。

在`WebRTC`的核心层中，同样包含三大核心模块，分别是`Voice Engine`音频引擎、`Video Engine`视频引擎、`Transport`传输模块:

- 音频引擎`Voice Engine`中包含`iSAC/iLBC Codec`音频编解码器、`NetEQ For Voice`网络抖动和丢包处理、` Echo Canceler/Noise Reduction`回音消除与噪音抑制等。
- `Video Engine`视频引擎中包括`VP8 Codec`视频编解码器、`Video Jitter Buffer`视频抖动缓冲器、`Image Enhancements`图像增强等。
- `Transport`传输模块中包括`SRTP`安全实时传输协议、`Multiplexing`多路复用、​`STUN+TURN+ICE`网络传输`NAT`穿越，`DTLS`数据报安全传输等。

由于在这里我们的主要目的是数据传输，所以我们只需要关心`API`层面上的`RTCPeerConnection API`和`Peer-To-Peer RTCDataChannel API`，以及核心层中的`Transport`传输模块即可。实际上由于网络以及场景的复杂性，基于`WebRTC`衍生出了大量的方案设计，而在网络框架模型方面，便有着三种架构: 

- `Mesh`架构即真正的`P2P`传输，每个客户端与其他客户端都建立了连接，形成了网状的结构，这种架构可以同时连接的客户端有限，但是优点是不需要中心服务器，实现简单。
- `MCU(MultiPoint Control Unit)`网络架构即传统的中心化架构，每个浏览器仅与中心的MCU服务器连接，`MCU`服务器负责所有的视频编码、转码、解码、混合等复杂逻辑。这种架构会对服务器造成较大的压力，但是优点是可以支持更多的人同时音视频通讯，比较适合多人视频会议。
- `SFU(Selective Forwarding Unit)`网络架构类似于`MCU`的中心化架构，仍然有中心节点服务器，但是中心节点只负责转发，不做太重的处理。所以服务器的压力会低很多，这种架构需要比较大的带宽消耗，但是优点是服务器压力较小，典型场景是`1`对`N`的视频互动。

对于我们而言，我们的目标是局域网之间的数据传输，所以并不会涉及此类复杂的网络传输架构模型，我们实现的是非常典型的`P2P`架构，甚至不需要`N-N`的数据传输，但是同样也会涉及到一些复杂的问题，例如`NAT`穿越、`ICE`交换、`STUN`服务器、`TURN`服务器等等。

### 信令
信令是涉及到通信系统时，用于建立、控制和终止通信会话的信息，包含了与通信相关的各种指令、协议和消息，用于使通信参与者之间能够相互识别、协商和交换数据。主要目的是确保通信参与者能够建立连接、协商通信参数，并在需要时进行状态的改变或终止，这其中涉及到各种通信过程中的控制信息交换，而不是直接传输实际的用户数据。

或许会产生一个疑问，既然`WebRTC`可以做到`P2P`的数据传输，那么为什么还需要信令服务器来调度连接。实际上这很简单，因为我们的网络环境是非常复杂的，我们并不能明确地得到对方的`IP`等信息来直接建立连接，所以我们需要借助信令服务器来协调连接。需要注意的是信令服务器的目标是协调而不是直接传输数据，数据本身的传输是`P2P`的，那么也就是说我们建立信令服务器并不需要大量的资源。

那如果说我们是不是必须要有信令服务器，那确实不是必要的。在`WebRTC`中虽然没有建立信令的标准或者说客户端来回传递消息来建立连接的方法，因为网络环境的复杂特别是`IPv4`的时代在客户端直接建立连接是不太现实的，也就是我们做不到直接在互联网上广播我要连接到我的朋友。但是我们通过信令需要传递的数据是很明确的，而这些信息都是文本信息，所以如果不建立信令服务器的话，我们可以通过一些即使通讯软件`IM`来将需要传递的信息明确的发给对方，那么这样就不需要信令服务器了。那么人工转发消息的方式看起来非常麻烦可能并不是很好的选择，由此实际上我们可以理解为信令服务器就是把协商这部分内容自动化了，并且附带的能够提高连接的效率以及附加协商鉴权能力等等。

```
             SIGNLING

             /      \ 
  SDP/ICE   /        \   SDP/ICE
           /          \

      Client    <->    Client
```

基本的数据传输过程如上图所示，我们可以通过信令服务器将客户端的`SDP/ICE`等信息传递，然后就可以在两个`Client`之间建立起连接，之后的数据传输就完全在两个客户端也就是浏览器之间进行了。而信令服务器的作用就是协调这个过程，使得两个客户端能够建立起连接，实际上整个过程非常类似于`TCP`的握手，只不过这里并没有那么严格而且只握手两次就可以认为是建立连接了。此外`WebRTC`是基于`UDP`的，所以`WebRTC DataChannel`也可以相当于在`UDP`的不可靠传输的基础上实现了基本可靠的传输，类似于`QUIC`希望能取得可靠与速度之间的平衡。

那么我们现在已经了解了信令服务器的作用，接下来我们就来实现信令服务器用来调度协商`WebRTC`。前边我们也提到了，因为`WebRTC`并没有规定信令服务器的标准或者协议，并且传输的都是文本内容，那么我们是可以使用任何方式来搭建这个信令服务器的，例如我们可以使用`HTTP`协议的短轮询`+`超时、长轮询，甚至是`EventSource`、`SIP`等等都可以作为信令服务器的传输协议。

在这里我们的目标不是仅仅建立起链接，而是希望能够实现类似于房间的概念，由此来管理我们的设备链接。所以首选的方案是`WebSocket`，`WebSocket`可以把这个功能做的更自然一些，全双工的客户端与服务器通信，消息可以同时在两个方向上流动。而`socket.io`是基于`WebSocket`封装了服务端和客户端，使用起来非常简单方便，所以接下来我们使用`socket.io`来实现信令服务器。

首先我们需要实现房间的功能，在最开始的时候我们就明确我们需要在局域网自动发现设备，由此也就是相当于局域网的设备是属于同一个房间的，那么我们就需要存储一些信息，在这里我们使用`Map`分别存储了`id`、房间、连接信息。那么在一个基本的房间中，我们除了将设备加入到房间外还需要实现几个功能：对于新加入的设备`A`，我们需要将当前房间内已经存在的设备信息告知当前新加入的设备`A`；对于房间内的其他设备，则需要通知当前新加入的设备`A`的信息；同样的在设备`A`退出房间的时候，我们也需要通知房间内的其他设备当前离开的设备`A`的信息，并且更新房间数据。

```js
// packages/webrtc/server/index.ts
const authenticate = new WeakMap<ServerSocket, string>();
const mapper = new Map<string, Member>();
const rooms = new Map<string, string[]>();

socket.on(CLINT_EVENT.JOIN_ROOM, ({ id, device }) => {
  // 验证
  if (!id) return void 0;
  authenticate.set(socket, id);
  // 加入房间
  const ip = getIpByRequest(socket.request);
  const room = rooms.get(ip) || [];
  rooms.set(ip, [...room, id]);
  mapper.set(id, { socket, device, ip });
  // 房间通知消息
  const initialization: SocketEventParams["JOINED_MEMBER"]["initialization"] = [];
  room.forEach(key => {
    const instance = mapper.get(key);
    if (!instance) return void 0;
    initialization.push({ id: key, device: instance.device });
    instance.socket.emit(SERVER_EVENT.JOINED_ROOM, { id, device });
  });
  socket.emit(SERVER_EVENT.JOINED_MEMBER, { initialization });
});

const onLeaveRoom = (id: string) => {
  // 验证
  if (authenticate.get(socket) !== id) return void 0;
  // 退出房间
  const instance = mapper.get(id);
  if (!instance) return void 0;
  const room = (rooms.get(instance.ip) || []).filter(key => key !== id);
  if (room.length === 0) {
    rooms.delete(instance.ip);
  } else {
    rooms.set(instance.ip, room);
  }
  mapper.delete(id);
  // 房间内通知
  room.forEach(key => {
    const instance = mapper.get(key);
    if (!instance) return void 0;
    instance.socket.emit(SERVER_EVENT.LEFT_ROOM, { id });
  });
};

socket.on(CLINT_EVENT.LEAVE_ROOM, ({ id }) => {
  onLeaveRoom(id);
});

socket.on("disconnect", () => {
  const id = authenticate.get(socket);
  id && onLeaveRoom(id);
});
```

可以看出我们管理房间是通过`IP`来实现的，因为此时需要注意一个问题，如果我们的信令服务器是部署在公网的服务器上，那么我们的房间就是全局的，也就是说所有的设备都可以连接到同一个房间，这样的话显然是不合适的。解决这个问题的方法很简单，对于服务器而言我们获取用户的`IP`地址，如果用户的`IP`地址是相同的就认为是同一个局域网的设备，所以我们需要获取当前连接的`Socket`的`IP`信息，在这里我们特殊处理了`127.0.0.1`和`192.168.0.0`两个网域的设备，以便我们在本地/路由器部署时能够正常发现设备。

```js
// packages/webrtc/server/utils.ts
export const getIpByRequest = (request: http.IncomingMessage) => {
  let ip = "";
  if (request.headers["x-forwarded-for"]) {
    ip = request.headers["x-forwarded-for"].toString().split(/\s*,\s*/)[0];
  } else {
    ip = request.socket.remoteAddress || "";
  }
  // 本地部署应用时，`ip`地址可能是`::1`或`::ffff:`
  if (ip === "::1" || ip === "::ffff:127.0.0.1" || !ip) {
    ip = "127.0.0.1";
  }
  // 局域网部署应用时，`ip`地址可能是`192.168.x.x`
  if (ip.startsWith("::ffff:192.168") || ip.startsWith("192.168")) {
    ip = "192.168.0.0";
  }
  return ip;
};
```

至此信令服务器的房间功能就完成了，看起来实现信令服务器并不是一件难事，将这段代码以及静态资源部署在服务器上也仅占用`20MB`左右的内存，几乎不占用太多资源。而信令服务器的功能并不仅仅是房间的管理，我们还需要实现`SDP`和`ICE`的交换，只不过先前也提到了信令服务器的目标是协调连接，那么在这里我们还需要实现`SDP`和`ICE`的转发用以协调链接，在这里我们先将这部分内容前置，接下来再开始聊`RTCPeerConnection`的协商过程。

```js
// packages/webrtc/server/index.ts
socket.on(CLINT_EVENT.SEND_OFFER, ({ origin, offer, target }) => {
  if (authenticate.get(socket) !== origin) return void 0;
  if (!mapper.has(target)) {
    socket.emit(SERVER_EVENT.NOTIFY_ERROR, {
      code: ERROR_TYPE.PEER_NOT_FOUND,
      message: `Peer ${target} Not Found`,
    });
    return void 0;
  }
  // 转发`Offer` -> `Target`
  const targetSocket = mapper.get(target)?.socket;
  if (targetSocket) {
    targetSocket.emit(SERVER_EVENT.FORWARD_OFFER, { origin, offer, target });
  }
});

socket.on(CLINT_EVENT.SEND_ICE, ({ origin, ice, target }) => {
  // 转发`ICE` -> `Target`
  // ...
});

socket.on(CLINT_EVENT.SEND_ANSWER, ({ origin, answer, target }) => {
  // 转发`Answer` -> `Target`
  // ...
});

socket.on(CLINT_EVENT.SEND_ERROR, ({ origin, code, message, target }) => {
  // 转发`Error` -> `Target`
  // ...
});
```

### 连接
在建设好信令服务器之后，我们就可以开始聊一聊`RTCPeerConnection`的具体协商过程了。在这部分会涉及比较多的概念，例如`Offer`、`Answer`、`SDP`、`ICE`、`STUN`、`TURN`等等，不过我们先不急着了解这些概念。我们先开看一下`RTCPeerConnection`的完整协商过程，整个过程是非常类似于`TCP`的握手，当然没有那么严格，但是也是需要经过几个步骤才能够建立起连接的：


```
              A                         SIGNLING                        B
-------------------------------        ----------        --------------------------------
|  Offer -> LocalDescription  |   ->   |   ->   |   ->   |  Offer -> RemoteDescription  |
|                             |        |        |        |                              |
| RemoteDescription <- Answer |   <-   |   <-   |   <-   |  LocalDescription <- Answer  |
|                             |        |        |        |                              |
|    RTCIceCandidateEvent     |   ->   |   ->   |   ->   |       AddRTCIceCandidate     |
|                             |        |        |        |                              |
|     AddRTCIceCandidate      |   <-   |   <-   |   <-   |     RTCIceCandidateEvent     |
-------------------------------        ----------        --------------------------------
```

1. 假设我们有`A`、`B`客户端，两个客户端都已经实例化`RTCPeerConnection`对象等待连接，当然按需实例化`RTCPeerConnection`对象也是可以的。
2. `A`客户端准备发起链接请求，此时`A`客户端需要创建`Offer`也就是`RTCSessionDescription(SDP)`，并且将创建的`Offer`设置为本地的`LocalDescription`，紧接着借助信令服务器将`Offer`转发到目标客户端也就是`B`客户端。
3. `B`客户端收到`A`客户端的`Offer`之后，此时`B`客户端需要将收到`Offer`设置为远端的`RemoteDescription`，然后创建`Answer`即同样也是`RTCSessionDescription(SDP)`，并且将创建的`Answer`设置为本地的`LocalDescription`，紧接着借助信令服务器将`Answer`转发到目标客户端也就是`A`客户端。
4. `A`客户端收到`B`客户端的`Answer`之后，此时`A`客户端需要将收到`Answer`设置为远端的`RemoteDescription`，客户端`A`、`B`之间的握手过程就结束了。
5. 在`A`客户端与`B`客户端握手的整个过程中，还需要穿插着`ICE`的交换，我们需要在`ICECandidate`候选人发生变化的时候，将`ICE`完整地转发到目标的客户端，之后目标客户端将其设置为目标候选人。

经过我们上边简单`RTCPeerConnection`协商过程描述，此时如果网络连通情况比较好的话，就可以顺利建立连接，并且通过信道发送消息了。但是实际上在这里涉及的细节还是比较多的，我们可以一步步来拆解这个过程并且描述涉及到的相关概念，并且在最后我们会聊一下当前`IPv6`设备的`P2P`、局域网以及`AP`隔离时的信道传输。

首先我们来看`RTCPeerConnection`对象，因为`WebRTC`有比较多的历史遗留问题，所以我们为了兼容性可能会需要做一些冗余的设置。当然随着`WebRTC`越来约规范化这些兼容问题会逐渐减少，但是我们还是可以考虑一下这个问题的，比如在建立`RTCPeerConnection`时做一点小小的兼容。

```js
// packages/webrtc/client/core/instance.ts
 const RTCPeerConnection =
  // @ts-expect-error RTCPeerConnection
  window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
const connection = new RTCPeerConnection({
  // https://icetest.info/
  // https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/
  iceServers: options.ice
      ? [{ urls: options.ice }]
      : [{ urls: ["stun:stunserver.stunprotocol.org:3478", "stun:stun.l.google.com:19302"] }],
});
```

在这里我们可以看出实例化`RTCPeerConnection`对象时，传入的`Ice Servers`都是使用的公开服务，因为本身`STUN`服务器是不需要比较大的性能消耗，所以当前互联网上存在不少公开的不需要认证的免费`STUN`服务。然而在我们寻找公开服务时，我们比较难以确认哪些服务是当前还可用的，因此需要我们在本地浏览器进行测试，我们可以借助`Trickle ICE`测试连接状态，并且可以将互联网公开的服务预设在`LocalStorage`中来方便测试。

```js
// https://gist.github.com/mondain/b0ec1cf5f60ae726202e
// https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/
const str = ``;
const group = [];
str.split("\n").forEach(line => {
  const url = line.trim();
  url && group.push({ credential: "", urls: ["stun:" + url], username: "" });
});
localStorage.setItem("servers", JSON.stringify(group));
```

在这里我们主要是配置了`iceServers`，其他的参数我们保持默认即可我们不需要太多关注，以及例如`sdpSemantics: unified-plan`等配置项也越来越统一化作为默认值，在比较新的`TS`版本中甚至都不再提供这个配置项的定义了。那么我们目光回到`iceServers`这个配置项，`iceServers`主要是用来提供我们协商链接以及中转的用途。我们可以简单理解一下，试想我们的很多设备都是内网的设备，而信令服务器仅仅是做了数据的转发，所以我们如果要是跨局域网想在公网上或者在路由器`AP`隔离的情况下传输数据的话，最起码需要知道我们的设备出口`IP`地址。而`STNU`服务器就是用来获取我们的出口`IP`地址的，`TURN`服务器则是用来中转数据的，而因为`STNU`服务器并不需要太大的资源占用，所以有有比较多的公网服务器提供免费的`STNU`服务。但是`TURN`实际上相当于中转服务器，所以通常是需要购置云服务器自己搭建，并且设置`Token`过期时间等等防止盗用。上边我们只是简单理解一下，所以我们接下来需要聊一下`NAT`、`STNU`、`TURN`三个概念。

`NAT(Network Address Translation)`网络地址转换是一种在`IP`网络中广泛使用的技术，主要是将一个`IP`地址转换为另一个`IP`地址。具体来说其工作原理是将一个私有`IP`地址(如在家庭网络或企业内部网络中使用的地址)，映射到一个公共`IP`地址(如互联网上的`IP`地址)。当一个设备从私有网络向公共网络发送数据包时，`NAT`设备会将源`IP`地址从私有地址转换为公共地址，并且在返回数据包时将目标`IP`地址从公共地址转换为私有地址。`NAT`可以通过多种方式实现，例如静态`NAT`、动态`NAT`和端口地址转换`PAT`等，静态`NAT`将一个私有`IP`地址映射到一个公共`IP`地址，而动态`NAT`则动态地为每个私有地址分配一个公共地址，`PAT`是一种特殊的动态`NAT`，在将私有`IP`地址转换为公共`IP`地址时，还会将源端口号或目标端口号转换为不同的端口号，以支持多个设备使用同一个公共`IP`地址。`NAT`最初是为了解决`IPv4`地址空间的短缺而设计的，后来也为提高网络安全性并简化网络管理提供了基础。在互联网上大多数设备都是通过路由器或防火墙连接到网络的，这些设备通常使用网络地址转换`NAT`将内部`IP`地址映射到一个公共的`IP`地址上，这个公共`IP`地址可以被其他设备用来访问。但是这些设备内部的`IP`地址是隐藏的，其他的设备不能直接通过它们的内部`IP`地址建立`P2P`连接。因此，直接进行`P2P`连接可能会受到网络地址转换`NAT`的限制，导致连接无法建立。

`STUN(Session Traversal Utilities for NAT)`会话穿透应用程序用于在`NAT`或防火墙后面的客户端之间建立`P2P`连接，`STUN`服务器并不会中转数据，而是主要用于获取客户端的公网`IP`地址。在客户端请求服务器时服务器会返回客户端的公网`IP`地址和端口号，这样客户端就可以通过这个公网`IP`地址和端口号来建立`P2P`连接，主要目标是探测和发现通讯对方客户端是否躲在防火墙或者`NAT`路由器后面，并且确定内网客户端所暴露在外的广域网的`IP`和端口以及`NAT`类型等信息，`STUN`服务器利用这些信息协助不同内网的计算机之间建立点对点的`UDP`通讯。实际上`STUN`是一个`Client/Server`模式的协议，客户端发送一个`STUN`请求到`STUN`服务器，请求包含了客户端本身所见到的自己的`IP`地址和端口号。`STUN`服务器收到请求后，会从请求中获取到设备所在的公网`IP`地址和端口号，并将这些信息返回给设备，设备收到`STUN`服务器的回复后，就可以将这些信息告诉其他设备，从而实现对等通信，本质上将地址交给客户端设备，客户端利用这些信息来尝试建立通信。`NAT`主要分为四种，分别是完全圆锥型`NAT`、受限圆锥型`NAT`、端口受限圆锥型`NAT`、对称型`NAT`。`STUN`对于前三种`NAT`是比较有效的，而大型公司网络中经常采用的对称型`NAT`则不能使用`STUN`获取公网`IP`及需要的端口号，具体的`NAT`穿越过程我们后边再聊。在我的理解上`STUN`比较适用于单层`NAT`，多级`NAT`的情况下复杂性会增加，如果都是圆锥型`NAT`可能也还好，而实际上因为国内网络环境的复杂性，甚至运营商对于`UDP`报文存在较多限制，实际使用`STUN`进行`NAT`穿越的成功率还是比较低的。

`TURN(Traversal Using Relay NAT)`即通过`Relay`方式穿越`NAT`，由于网络的复杂性，当两个设备都位于对称型`NAT`后面或存在防火墙限制时时，直接的`P2P`连接通常难以建立。而当设备无法直接连接时，设备可以通过与`TURN`服务器建立连接来进行通信，设备将数据发送到`TURN`服务器，然后`TURN`服务器将数据中继给目标设备。实际上是一种中转方案，并且因为是即将传输的设备地址，避免了`STUN`应用模型下出口`NAT`对`RTP/RTCP`地址端口号的任意分配，但无论如何就是相当于`TURN`服务器成为了中间人，使得设备能够在无法直接通信的情况下进行数据传输。那么使用`TURN`服务器就会引入一定的延迟和带宽消耗，因为数据需要经过额外的中间步骤，所以`TURN`服务器在`WebRTC`中通常被视为备用方案，当直接点对点连接无法建立时才使用，并且通常没有公共的服务器资源可用。而且因为实际上是在前端配置的`iceServers`，所以通常是通过加密的方式生成限时连接用于传输，类似于常用的图片防盗链机制。实际上在`WebRTC`中使用中继服务器的场景是很常见的，例如多人视频通话的场景下通常会选择`MCU`或者`SFU`的中心化网络架构用来传输音视频流。

那么在我们了解了这些概念以及用法之后，我们就简单再聊一聊`STUN`是如何做到`NAT`穿透的。此时我们假设我们的网络结构只有一层`NAT`，并且对等传输的两侧都是同样的`NAT`结构，当然不同的`NAT`也是可以穿越的，在这里我们只是简化了整个模型，那么此时我们的网络`IP`与相关端口号如下所示：

``` 
          内网                      路由器                   公网
A:     1.1.1.1:1111    1.1.1.1:1111 <-> 3.3.3.3:3333   3.3.3.3:3333 
B:     6.6.6.6:6666    6.6.6.6:6666 <-> 8.8.8.8:8888   8.8.8.8:8888
STUN:                                                  7.7.7.7:7777           
SIGNLING:                                              9.9.9.9:9999           
```

接着我们来看完全圆锥型`NAT`，一旦一个内部地址`IA:IP`映射到外部地址`EA:EP`，所有发自`IA:IP`的包会都经由`3EA:EP`向外发送，并且任意外部主机都能通过给`EA:EP`发包到达`IA:IP`。那么此时我们假设我们需要建立连接，此时我们需要基于`A`和`B`向`STUN`服务器发起请求，即`1.1.1.1:1111 -> 7.7.7.7:7777`那么此时`STUN`服务器就会返回`A`的公网`IP`地址和端口号，即`3.3.3.3:3333`，同样的`B`也是`6.6.6.6:6666 -> 7.7.7.7:7777`得到`8.8.8.8:8888`。那么此时需要注意，我们已经成功在路由器的路由表中建立了映射，那么我此时任意外部主机都能通过给`EA:EP`发包到达`IA:IP`，所以此时只需要通过信令服务器`9.9.9.9:9999`将`A`的`3.3.3.3:3333`告知`B`，将`B`的`8.8.8.8:8888`告知`A`，双方就可以自由通信了。

```
     From                 To                Playload
[1.1.1.1:1111]  ->  [7.7.7.7:7777]       [1.1.1.1:1111]
[7.7.7.7:7777]  ->  [1.1.1.1:1111]       [3.3.3.3:3333]
[6.6.6.6:6666]  ->  [7.7.7.7:7777]       [6.6.6.6:6666]
[7.7.7.7:7777]  ->  [6.6.6.6:6666]       [8.8.8.8:8888]
[1.1.1.1:1111]  ->  [9.9.9.9:9999]       [3.3.3.3:3333]
[9.9.9.9:9999]  ->  [6.6.6.6:6666]       [3.3.3.3:3333]
[6.6.6.6:6666]  ->  [9.9.9.9:9999]       [8.8.8.8:8888]
[9.9.9.9:9999]  ->  [1.1.1.1:1111]       [8.8.8.8:8888]
[1.1.1.1:1111]  ->  [8.8.8.8:8888]       [DATA]
[6.6.6.6:6666]  ->  [3.3.3.3:3333]       [DATA]
```

受限圆锥型`NAT`和端口受限圆锥型`NAT`比较类似，我们就放在一起了，这两种`NAT`是基于圆锥型`NAT`加入了限制。受限圆锥型`NAT`是一种特殊的完全圆锥型`NAT`，其的限制是内部主机只能向之前已经发送过数据包的外部主机发送数据包，也就是说数据包的源地址需要与`NAT`表相符，而端口受限圆锥型`NAT`是一种特殊的受限圆锥型`NAT`，其限制是内部主机只能向之前已经发送或者接收过数据包的外部主机的相同端口发送数据包，也就是说数据包的源`IP`和`PORT`都要与`NAT`表相符。举个例子的话就是只有路由表中已经存在的`IP/IP:PORT`才能被路由器转发数据，实际上很好理解，当我们正常发起一个请求的时候都是向某个固定的`IP:PORT`发送数据，而接受数据的时候，这个`IP:PORT`已经在路由表中了所以是可以正常接受数据的。而这两种`NAT`虽然限制了`IP/IP:PORT`必需要在路由表中，但是并没有限制`IP:PORT`只能与之前的`IP:PORT`通信，所以我们只需要在之前的圆锥型`NAT`基础上，主动预发送数据包即可，相当于把`IP/IP:PORT`写入了路由表，那么路由器在收到来自这个`IP/IP:PORT`的数据包时就可以正常转发了。

```
     From                 To                Playload
[1.1.1.1:1111]  ->  [7.7.7.7:7777]       [1.1.1.1:1111]
[7.7.7.7:7777]  ->  [1.1.1.1:1111]       [3.3.3.3:3333]
[6.6.6.6:6666]  ->  [7.7.7.7:7777]       [6.6.6.6:6666]
[7.7.7.7:7777]  ->  [6.6.6.6:6666]       [8.8.8.8:8888]
[1.1.1.1:1111]  ->  [9.9.9.9:9999]       [3.3.3.3:3333]
[9.9.9.9:9999]  ->  [6.6.6.6:6666]       [3.3.3.3:3333]
[6.6.6.6:6666]  ->  [9.9.9.9:9999]       [8.8.8.8:8888]
[9.9.9.9:9999]  ->  [1.1.1.1:1111]       [8.8.8.8:8888]
[1.1.1.1:1111]  ->  [8.8.8.8:8888]       [PRE-REQUEST]
[6.6.6.6:6666]  ->  [3.3.3.3:3333]       [PRE-REQUEST]
[1.1.1.1:1111]  ->  [8.8.8.8:8888]       [DATA]
[6.6.6.6:6666]  ->  [3.3.3.3:3333]       [DATA]
```

对称型`NAT`是限制最多的，每一个来自相同内部`IP`与`PORT`，到一个特定目的地`IP`和`PORT`的请求，都映射到一个独特的外部`IP`地址和`PORT`，同一内部`IP`与端口发到不同的目的地和端口的信息包，都使用不同的映射。类似于在端口受限圆锥型`NAT`的基础上，限制了`IP:PORT`只能与之前的`IP:PORT`通信，对于`STUN`来说具体的限制实际上是我们发起的`IP:PORT`探测请求与最终实际连接的`IP:PORT`必须是同一个地址与端口的映射。然而在对称型`NAT`中，我们发起的`IP:PORT`探测请求与最终实际连接的`IP:PORT`会被记录为不同的地址与端口映射，或者换句话说，我们通过`STUN`拿到的`IP:PORT`只能跟`STUN`通信，无法用来共享给别的设备传输数据。

```
     From                 To                Playload
[1.1.1.1:1111]  ->  [7.7.7.7:7777]       [1.1.1.1:1111]
[7.7.7.7:7777]  ->  [1.1.1.1:1111]       [3.3.3.3:3333]
[6.6.6.6:6666]  ->  [7.7.7.7:7777]       [6.6.6.6:6666]
[7.7.7.7:7777]  ->  [6.6.6.6:6666]       [8.8.8.8:8888]
[1.1.1.1:1111]  ->  [9.9.9.9:9999]       [3.3.3.3:3333]
[9.9.9.9:9999]  ->  [6.6.6.6:6666]       [3.3.3.3:3333]
[6.6.6.6:6666]  ->  [9.9.9.9:9999]       [8.8.8.8:8888]
[9.9.9.9:9999]  ->  [1.1.1.1:1111]       [8.8.8.8:8888]
[1.1.1.1:1111]  --  [8.8.8.8:8888]       []
[6.6.6.6:6666]  --  [3.3.3.3:3333]       []
```

在完整了解了`WebRTC`有关`NAT`穿透相关的概念之后，我们继续完成`WebRTC`的链接过程。实际上因为我们已经深入分析了`NAT`的穿透，那么就相当于我们已经可以在互联上建立起链接了，但是因为`WebRTC`并不仅仅是建立了一个传输信道，这其中还伴随着音视频媒体的描述，用于媒体信息的传输协议、传输类型、编解码协商等等也就是`SDP`协议。`SDP`是`<type>=<value>`格式的纯文本协议，一个典型的`SDP`如下所示，而我们将要使用的`Offer/Answer/RTCSessionDescription`就是带着类型的`SDP`即`{ type: "offer"/"answer"/"pranswer"/"rollback", sdp: "..." }`，对于我们来说可能并不需要过多关注，因为我们现在的目标是建立连接以及传输信道，所以我们更多的还是关注于链接建立的流程。

```
v=0
o=- 8599901572829563616 2 IN IP4 127.0.0.1
s=-
c=IN IP4 0.0.0.0
t=0 0
m=audio 49170 RTP/AVP 0
a=rtpmap:0 PCMU/8000
m=video 51372 RTP/AVP 31
a=rtpmap:31 H261/90000
m=video 53000 RTP/AVP 32
a=rtpmap:32 MPV/90000
```

那么此时我们需要创建链接，看起来发起流程非常简单。我们假设现在有两个客户端`A`、`B`，此时客户端`A`通过`createOffer`创建了`Offer`，并且通过`setLocalDescription`将其设置为本地描述，紧接着将`Offer`通过信令服务器发送到了目标客户端`B`。


```js
// packages/webrtc/client/core/instance.ts
public createRemoteConnection = async (target: string) => {
  console.log("Send Offer To:", target);
  this.connection.onicecandidate = async event => {
    if (!event.candidate) return void 0;
    console.log("Local ICE", event.candidate);
    const payload = { origin: this.id, ice: event.candidate, target };
    this.signaling.emit(CLINT_EVENT.SEND_ICE, payload);
  };
  const offer = await this.connection.createOffer();
  await this.connection.setLocalDescription(offer);
  console.log("Offer SDP", offer);
  const payload = { origin: this.id, offer, target };
  this.signaling.emit(CLINT_EVENT.SEND_OFFER, payload);
};
```

当目标客户端`B`收到`Offer`之后，可以通过判断当前是否正在建立连接等状态来决定是否接受这个`Offer`，接受的话就将收到的`Offer`通过`setRemoteDescription`设置为远程描述，并且通过`createAnswer`创建`answer`，同样将`answer`设置为本地描述后，紧接着将`answer`通过信令服务器发送到了`Offer`来源的客户端`A`。

```js
// packages/webrtc/client/core/instance.ts
private onReceiveOffer = async (params: SocketEventParams["FORWARD_OFFER"]) => {
  const { offer, origin } = params;
  console.log("Receive Offer From:", origin, offer);
  if (this.connection.currentLocalDescription || this.connection.currentRemoteDescription) {
    this.signaling.emit(CLINT_EVENT.SEND_ERROR, {
      origin: this.id,
      target: origin,
      code: ERROR_TYPE.PEER_BUSY,
      message: `Peer ${this.id} is Busy`,
    });
    return void 0;
  }
  this.connection.onicecandidate = async event => {
    if (!event.candidate) return void 0;
    console.log("Local ICE", event.candidate);
    const payload = { origin: this.id, ice: event.candidate, target: origin };
    this.signaling.emit(CLINT_EVENT.SEND_ICE, payload);
  };
  await this.connection.setRemoteDescription(offer);
  const answer = await this.connection.createAnswer();
  await this.connection.setLocalDescription(answer);
  console.log("Answer SDP", answer);
  const payload = { origin: this.id, answer, target: origin };
  this.signaling.emit(CLINT_EVENT.SEND_ANSWER, payload);
};
```

当发起方的客户端`A`收到了目标客户端`B`的应答之后，如果当前没有设置远程描述的话，就通过`setRemoteDescription`设置为远程描述，此时我们的`SDP`协商过程就完成了。

```js
// packages/webrtc/client/core/instance.ts
private onReceiveAnswer = async (params: SocketEventParams["FORWARD_ANSWER"]) => {
  const { answer, origin } = params;
  console.log("Receive Answer From:", origin, answer);
  if (!this.connection.currentRemoteDescription) {
    this.connection.setRemoteDescription(answer);
  }
};
```

实际上我们可以关注到在创建`Offer`和`Answer`的时候还存在`onicecandidate`事件的回调，这里实际上就是`ICE`候选人变化的过程。我们可以通过`event.candidate`获取到当前的候选人，然后我们需要尽快通过信令服务器将其转发到目标客户端，目标客户端收到之后通过`addIceCandidate`添加候选人，这样就完成了`ICE`候选人的交换。在这里我们需要注意的是我们需要尽快转发`ICE`，那么对于我们而言就并不需要关注时机，但实际上时机已经在规范中明确了，在`setLocalDescription`不会开始收集候选者信息。

```js
// packages/webrtc/client/core/instance.ts
private onReceiveIce = async (params: SocketEventParams["FORWARD_ICE"]) => {
  const { ice, origin } = params;
  console.log("Receive ICE From:", origin, ice);
  await this.connection.addIceCandidate(ice);
};
```

那么到这里我们的链接协商过程就结束了，而我们实际建立`P2P`信道的过程就非常依赖`ICE(Interactive Connectivity Establishment)`的交换，`ICE`候选者描述了`WebRTC`能够与远程设备通信所需的协议和路由。当启动`WebRTC P2P`连接时，通常连接的每一端都会提出许多候选连接，直到他们就描述他们认为最好的连接达成一致，然后`WebRTC`就会使用该候选人的详细信息来启动连接。`ICE`和`STUN`密切相关，前边我们已经了解了`NAT`穿越的过程，那么接下来我们就来看一下`ICE`候选人交换的数据结构。`ICE`候选人实际上是一个`RTCIceCandidate`对象，而这个对象包含了很多信息，但是实际上这个对象中存在了`toJSON`方法，所以实际交换的数据只有`candidate`、`sdpMid`、`sdpMLineIndex`、`usernameFragment`，而这些交换的数据又会在`candidate`字段中体现，所以我们在这里就重点关注这四个字段代表的意义。

* `candidate`: 描述候选者属性的字符串，示例`candidate:842163049 1 udp 1677729535 101.68.35.129 24692 typ srflx raddr 0.0.0.0 rport 0 generation 0 ufrag WbBI network-cost 999`。候选字符串指定候选的网络连接信息，这些属性均由单个空格字符分隔，并且按特定顺序排列，如果候选者是空字符串，则表示已到达候选者列表的末尾，该候选者被称为候选者结束标记。
  * `foundation`: 候选者的标识符，用于唯一标识一个`ICE`候选者。，示例`4234997325`。
  * `component`: 候选者所属的是`RTP:1`还是`RTCP:2`协议，示例`1`。
  * `protocol`: 候选者使用的传输协议`udp/tcp`，示例`udp`。
  * `priority`: 候选者的优先级，值越高越优先，示例`1677729535`。
  * `ip`: 候选者的`IP`地址，示例`101.68.35.129`。
  * `port`: 候选者的端口号，示例`24692`。
  * `type`: 候选者的类型，示例`srflx`。
    * `host`: `IP`地址实际上是设备主机公网地址，或者本地设备地址。
    * `srflx`: 通过`STUN`或者`TURN`收集的`NAT`网关在公网侧的`IP`地址。
    * `prflx`: `NAT`在发送`STUN`请求以匿名代表候选人对等点时分配的绑定，可以在`ICE`的后续阶段中获取到。
    * `relay`: 中继候选者，通过`TURN`收集的`TURN`服务器的公网转发地址。
  * `raddr`: 候选者的远程地址，表示在此候选者之间建立连接时的对方地址，示例`0.0.0.0`。
  * `rport`: 候选者的远程端口，表示在此候选者之间建立连接时的对方端口，示例`0`。
  * `generation`: 候选者的`ICE`生成代数，用于区分不同生成时的候选者，示例`0`。
  * `ufrag`: 候选者的`ICE`标识符，用于在`ICE`过程中进行身份验证和匹配，示例`WbBI`。
  * `network-cost`: 候选者的网络成本，较低的成本值表示较优的网络路径，示例`999`。
* `sdpMid`: 用于标识媒体描述的`SDP`媒体的唯一标识符，示例`sdpMid: "0"`，如果媒体描述不可用，则为空字符串。
* `sdpMLineIndex`: 媒体描述的索引，示例`sdpMLineIndex: 0`，如果媒体描述不可用，则为`null`。
* `usernameFragment`: 用于标识`ICE`会话的唯一标识符，示例`usernameFragment: "WbBI"`。

在链接建立完成之后，我们就可以通过控制台观察`WebRTC`是否成功建立了，在内网的情况下`ICE`的候选人信息大致如下所示，我们可以通过观察`IP`来确定连接的实际地址，并且在`IPv4`和`IPv6`的情况下是有所区别的。

```
ICE Candidate pair: :60622 <=> 192.168.0.100:44103
ICE Candidate pair: :55305 <=> 2408:8240:e12:3c45:f1ba:c574:6328:a70:45954
```

如果是在`AP`隔离的情况下，也就是说我们不能通过`192.168.x.x`网域直接访问对方，这种情况下`STUN`服务器就起到作用了，相当于做了一次`NAT`穿透。此时我们可以观察到`IP`地址是公网地址并且相同，但是端口号是不同的，我们也可以理解为我们的数据包通过公网跑了一圈又回到了局域网，很像是完成了一次网络回环。

```
ICE Candidate pair: 101.68.35.129:25595 <=> 101.68.35.129:25596
```

在前几天搬砖的时候，我突然想到一个问题，现在都是`IPv6`的时代了，而`STUN`服务器实际上又是支持`IPv6`的，那么如果我们的设备都有全球唯一的公网`IPv6`地址岂不是做到`P2P`互联，从而真的成为互联网。所以我找了朋友测试了一下`IPv6`的链接情况，因为手机设备通常都是真实分配`IPv6`的地址，所以就可以直接在手机上先进行一波测试。首先访问下`test-ipv6`来获取手机的公网`IPv6`地址，并且对比下手机详细信息里边的地址，而`IPv6`目前只要是看到以`2/3`开头的都可以认为是公网地址，以`fe80`开头的则是本地连接地址。在这里我们可以借助`Netcat`也就是常用的`nc`命令来测试，在手机设备上可以使用`Termux`并且使用包管理器安装`netcat-openbsd`。

```bash
# 设备`A`监听
$ nc -vk6 9999   
# 设备`B`连接
$ nc -v6 ${ip} 9999 
```

这里的测试就很有意思了，然后我屋里的路由器设备已经开启了`IPv6`，而且关闭了标准中未定义而是社区提供的`NAT6`方案，并且使用获取`IPv6`前缀的`Native`方案。然而无论我如何尝试都不能通过我的电脑连接到我的手机，实际上即使我的电脑没有公网地址而只要手机有公网地址，那么从电脑发起连接请求并且连接到手机，但是可惜还是无法建立链接，但是使用`ping6`是可以`ping`通的，所以实际上是能寻址到只是被拦截了连接的请求。后来我尝试在设备启动`HTTP`服务也无法直接建立链接，或许是有着一些限制策略例如`UDP`的报文必须先由本设备某端口发出后这个端口才能接收公网地址报文。再后来我找我朋友的手机进行连接测试，我是联通卡朋友是电信卡，我能够连接到我的朋友，但是我朋友无法直接连接到我，而我们的`IPv6`都是`2`开头的是公网地址，然后我们怀疑是运营商限制了端口所以尝试不断切换端口来建立链接，还是不能直接连接。

于是我最后测试了一下，我换到了我的卡`2`电信卡，此时无论是我的朋友还是我的电脑都可以直接通过电信分配的`IPv6`地址连接到我的手机了。这就很难绷，而我另一个朋友的联通又能够直接连接，所以在国内的网络环境下还是需要看地域性的。之后我找了好几个朋友测试了`P2P`的链接，因为只要设备双方只要有一方有公网的`IP`那么大概率就是能够直接`P2P`的，所以通过`WebRTC`连接的成功率还是可以的，并没有想象中那么低，但我们主要的场景还是局域网传输，只是我们会在项目中留一个输入对方`ID`用以跨网段链接的方式。

### 通信
在我们成功建立链接之后，我们就可以开启传输信道`Peer-To-Peer RTCDataChannel API`相关部分了，通过`createDataChannel`方法可以创建一个与远程对等点链接的新通道，可以通过该通道传输任何类型的数据，例如图像、文件传输、文本聊天、游戏更新数据包等。我们可以在`RTCPeerConnection`对象实例化的时候就创建信道，之后等待链接成功建立即可，同样的`createDataChannel`也存在很多参数可以配置。

* `label`: 可读的信道名称，不超过`65,535 bytes`。
* `ordered`: 保证传输顺序，默认为`true`。
* `maxPacketLifeTime`: 信道尝试传输消息可能需要的最大毫秒数，如果设置为`null`则表示没有限制，默认为`null`。
* `maxRetransmits`: 信道尝试传输消息可能需要的最大重传次数，如果设置为`null`则表示没有限制，默认为`null`。
* `protocol`: 信道使用的子协议，如果设置为`null`则表示没有限制，默认为`null`。
* `negotiated`: 是否为协商信道，如果设置为`true`则表示信道是协商的，如果设置为`false`则表示信道是非协商的，默认为`false`。
* `id`: 信道的唯一标识符，如果设置为`null`则表示没有限制，默认为`null`。

前边我们也提到了`WebRTC`希望借助`UDP`实现相对可靠的数据传输，类似于`QUIC`希望能取得可靠与速度之间的平衡，所以在这里我们的`order`指定了`true`，并且设置了最大传输次数，在这里需要注意的是，我们最终的消息事件绑定是在`ondatachannel`事件之后的，当信道真正建立之后，这个事件将会被触发，并且在此时将可以进行信息传输，此外当`negotiated`指定为`true`时则必须设置`id`，此时就是通过`id`协商信道相当于双向通信，那么就不需要指定`ondatachannel`事件了，直接在`channel`上绑定事件回调即可。

```js
// packages/webrtc/client/core/instance.ts
const channel = connection.createDataChannel("FileTransfer", {
  ordered: true, // 保证传输顺序
  maxRetransmits: 50, // 最大重传次数
});
this.connection.ondatachannel = event => {
  const channel = event.channel;
  channel.onopen = options.onOpen || null;
  channel.onmessage = options.onMessage || null;
  // @ts-expect-error RTCErrorEvent
  channel.onerror = options.onError || null;
  channel.onclose = options.onClose || null;
};
```

那么在信道创建完成之后，我们现在暂时只需要关注最基本的两个方法，一个是`channel.send`方法可以用来发送数据，例如纯文本数据、`Blob`、`ArrayBuffer`都是可以直接发送的，同样的`channel.onmessage`事件也是可以接受相同的数据类型，那么我们接下来就借助这两个方法来完成文本与文件的传输。那么我们就来最简单地实现传输，首先我们要规定好基本的传输数据类型，因为我们是实际上只区分两种类型的数据，也就是`Text/Blob`数据，所以需要对这两种数据做基本的判断，然后再根据不同的类型响应不同的行为，当然我们也可以自拟数据结构/协议。例如借助`Uint8Array`构造`Blob`前`N`个字节表示数据类型、`id`、序列号等等，后边携带数据内容，这样也可以组装直接传输`Blob`，在这里我们还是简单处理，主要处理单个文件的传输。

```js
export type ChunkType = Blob | ArrayBuffer;
export type TextMessageType =
  | { type: "text"; data: string }
  | { type: "file"; size: number; name: string; id: string; total: number }
  | { type: "file-finish"; id: string };
```

那么我们封装发送文本和文件的方法，我们可以看到我们在发送文件的时候，我们会先发送一个文件信息的消息，然后再发送文件内容，这样就可以在接收端进行文件的组装。在这里需要注意的有两点，对于大文件来说我们是需要将其分割发送的，在协商`SCTP`时会有`maxMessageSize`的值，表示每次调用`send`方法最大能发送的字节数，通常为`256KB`大小。在`MDN`的`WebRTC_API/Using_data_channels`对这个问题有过描述，另一个需要注意的地方时是缓冲区，由于发送大文件时缓冲区会很容易大量占用缓冲区，并且也不利于我们对发送进度的统计，所以我们还需要借助`onbufferedamountlow`事件来控制缓冲区的发送状态。

```js
// packages/webrtc/client/components/modal.tsx
const onSendText = () => {
  const str = TSON.encode({ type: "text", data: text });
  if (str && rtc.current && text) {
    rtc.current?.send(str);
    setList([...list, { type: "text", from: "self", data: text }]);
  }
};

const sendFilesBySlice = async (file: File) => {
  const instance = rtc.current?.getInstance();
  const channel = instance?.channel;
  if (!channel) return void 0;
  const chunkSize = instance.connection.sctp?.maxMessageSize || 64000;
  const name = file.name;
  const id = getUniqueId();
  const size = file.size;
  const total = Math.ceil(file.size / chunkSize);
  channel.send(TSON.encode({ type: "file", name, id, size, total }));
  const newList = [...list, { type: "file", from: "self", name, size, progress: 0, id } as const];
  setList(newList);
  let offset = 0;
  while (offset < file.size) {
    const slice = file.slice(offset, offset + chunkSize);
    const buffer = await slice.arrayBuffer();
    if (channel.bufferedAmount >= chunkSize) {
      await new Promise(resolve => {
        channel.onbufferedamountlow = () => resolve(0);
      });
    }
    fileMapper.current[id] = [...(fileMapper.current[id] || []), buffer];
    channel.send(buffer);
    offset = offset + buffer.byteLength;
    updateFileProgress(id, Math.floor((offset / size) * 100), newList);
  }
};

const onSendFile = () => {
  const KEY = "webrtc-file-input";
  const exist = document.querySelector(`body > [data-type='${KEY}']`) as HTMLInputElement;
  const input: HTMLInputElement = exist || document.createElement("input");
  input.value = "";
  input.setAttribute("data-type", KEY);
  input.setAttribute("type", "file");
  input.setAttribute("class", styles.fileInput);
  input.setAttribute("accept", "*");
  !exist && document.body.append(input);
  input.onchange = e => {
    const target = e.target as HTMLInputElement;
    document.body.removeChild(input);
    const files = target.files;
    const file = files && files[0];
    file && sendFilesBySlice(file);
  };
  input.click();
};
```

那么最后我们只需要在接收的时候将内容组装到数组当中，并且在调用下载的时候将其组装为`Blob`下载即可。当然因为目前我们是单文件发送的，也就是说发送文件块的时候并没有携带当前块的任何描述信息，所以我们在接收块的时候是不能再发送其他内容的。

```js
// packages/webrtc/client/components/modal.tsx
const onMessage = useMemoizedFn((event: MessageEvent<string | ChunkType>) => {
  if (isString(event.data)) {
    const data = TSON.decode(event.data);
    if (data && data.type === "text") {
      setList([...list, { from: "peer", ...data }]);
    } else if (data?.type === "file") {
      fileState.current = { id: data.id, current: 0, total: data.total };
      setList([...list, { from: "peer", progress: 0, ...data }]);
    } else if (data?.type === "file-finish") {
      updateFileProgress(data.id, 100);
    }
  } else {
    const state = fileState.current;
    if (state) {
      const mapper = fileMapper.current;
      if (!mapper[state.id]) mapper[state.id] = [];
      mapper[state.id].push(event.data);
      state.current++;
      const progress = Math.floor((state.current / state.total) * 100);
      updateFileProgress(state.id, progress);
      if (progress === 100) {
        fileState.current = void 0;
        rtc.current?.send(TSON.encode({ type: "file-finish", id: state.id }));
      }
    }
  }
});

const onDownloadFile = (id: string, fileName: string) => {
  const data = fileMapper.current[id] || new Blob();
  const blob = new Blob(data, { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
};
```

在后来补充了一下多文件传输的方案，具体的思路是构造`ArrayBuffer`，其中前`12`个字节表示当前块所属的文件`ID`，再使用`4`个字节也就是`32`位表示当前块的序列号，其余的内容作为文件块的实际内容。然后就可以实现文件传输的过程中不同文件发送块，然后就可以在接收端通过存储的`ID`和序列号进行`Blob`组装，思路与后边的`WebSocket`通信部分保持一致，所以在这里只是描述一下`ArrayBuffer`的组装方法。

```js
// packages/webrtc/client/utils/binary.ts
export const getNextChunk = (
  instance: React.MutableRefObject<WebRTCApi | null>,
  id: string,
  series: number
) => {
  const file = FILE_SOURCE.get(id);
  const chunkSize = getMaxMessageSize(instance);
  if (!file) return new Blob([new ArrayBuffer(chunkSize)]);
  const start = series * chunkSize;
  const end = Math.min(start + chunkSize, file.size);
  const idBlob = new Uint8Array(id.split("").map(char => char.charCodeAt(0)));
  const seriesBlob = new Uint8Array(4);
  // `0xff = 1111 1111`
  seriesBlob[0] = (series >> 24) & 0xff;
  seriesBlob[1] = (series >> 16) & 0xff;
  seriesBlob[2] = (series >> 8) & 0xff;
  seriesBlob[3] = series & 0xff;
  return new Blob([idBlob, seriesBlob, file.slice(start, end)]);
};

export const destructureChunk = async (chunk: ChunkType) => {
  const buffer = chunk instanceof Blob ? await chunk.arrayBuffer() : chunk;
  const id = new Uint8Array(buffer.slice(0, ID_SIZE));
  const series = new Uint8Array(buffer.slice(ID_SIZE, ID_SIZE + CHUNK_SIZE));
  const data = chunk.slice(ID_SIZE + CHUNK_SIZE);
  const idString = String.fromCharCode(...id);
  const seriesNumber = (series[0] << 24) | (series[1] << 16) | (series[2] << 8) | series[3];
  return { id: idString, series: seriesNumber, data };
};
```


## WebSocket
当`WebRTC`无法成功进行`NAT`穿越时，如果想在公网发送数据还是需要经过`TURN`转发，那么都是通过`TURN`转发了还是需要走我们服务器的中继，那么我们不如直接借助`WebSocket`直接传输了。`WebSocket`也是全双工信道，在非`AP`隔离的情况下我们同样也可以直接部署在路由器上，在局域网之间进行数据传输。

### 连接
使用`WebSocket`进行传输的时候，我们是直接借助服务器转发所有数据的，不知道大家是不是注意到`WebRTC`的链接过程实际上是比较麻烦的，而且相对难以管理，这其中部分原因就是建立一个链接涉及到了多方的通信链接，需要客户端`A`、信令服务器、`STUN`服务器、客户端`B`之间的相互连接。那么如果我们使用`WebSocket`就没有这么多方连接需要管理，每个客户端都只需要管理自身与服务器之间的连接，就像是我们的`HTTP`模型一样是`Client/Server`结构。

```
             WebSocket

             /      \ 
     DATA   /        \   DATA
           /          \

      Client           Client
```

那么此时我们在`WebSocket`的服务端依然要定义一些事件，与`WebRTC`不一样的是，我们只需要定义一个房间即可，并且所有的状态都可以在服务端直接进行管理，例如是否连接成功、是否正在传输等等。在`WebRTC`的实现中我们必须要将这个实现放在客户端，因为连接状态实际上是客户端直接连接的对等客户端，在服务端并不是很容易实时管理整个状态，当然不考虑延迟或者实现心跳的话也是可以的。

那么同样的在这里我们的服务端定义了`JOIN_ROOM`加入到房间、`LEAVE_ROOM`离开房间，这里的管理流程与`WebRTC`基本一致。

```js
// packages/websocket/server/index.ts
const authenticate = new WeakMap<ServerSocket, string>();
const room = new Map<string, Member>();
const peer = new Map<string, string>();

socket.on(CLINT_EVENT.JOIN_ROOM, ({ id, device }) => {
  // 验证
  if (!id) return void 0;
  authenticate.set(socket, id);
  // 房间通知消息
  const initialization: SocketEventParams["JOINED_MEMBER"]["initialization"] = [];
  room.forEach((instance, key) => {
    initialization.push({ id: key, device: instance.device });
    instance.socket.emit(SERVER_EVENT.JOINED_ROOM, { id, device });
  });
  // 加入房间
  room.set(id, { socket, device, state: CONNECTION_STATE.READY });
  socket.emit(SERVER_EVENT.JOINED_MEMBER, { initialization });
});


const onLeaveRoom = () => {
  // 验证
  const id = authenticate.get(socket);
  if (id) {
    const peerId = peer.get(id);
    peer.delete(id);
    if (peerId) {
      // 状态复位
      peer.delete(peerId);
      updateMember(room, peerId, "state", CONNECTION_STATE.READY);
    }
    // 退出房间
    room.delete(id);
    room.forEach(instance => {
      instance.socket.emit(SERVER_EVENT.LEFT_ROOM, { id });
    });
  }
};

socket.on(CLINT_EVENT.LEAVE_ROOM, onLeaveRoom);
socket.on("disconnect", onLeaveRoom);
```

之后便是我们建立连接时要处理的`SEND_REQUEST`发起连接请求、`SEND_RESPONSE`回应连接请求、`SEND_MESSAGE`发送消息、`SEND_UNPEER`发送断开连接请求。并且在这里因为状态是由服务端管理的，我们可以立即响应对方是否正在忙线等状态，那么便可以直接使用回调函数通知发起方。

```js
// packages/websocket/server/index.ts
socket.on(CLINT_EVENT.SEND_REQUEST, ({ origin, target }, cb) => {
  // 验证
  if (authenticate.get(socket) !== origin) return void 0;
  // 转发`Request`
  const member = room.get(target);
  if (member) {
    if (member.state !== CONNECTION_STATE.READY) {
      cb?.({ code: ERROR_TYPE.PEER_BUSY, message: `Peer ${target} is Busy` });
      return void 0;
    }
    updateMember(room, origin, "state", CONNECTION_STATE.CONNECTING);
    member.socket.emit(SERVER_EVENT.FORWARD_REQUEST, { origin, target });
  } else {
    cb?.({ code: ERROR_TYPE.PEER_NOT_FOUND, message: `Peer ${target} Not Found` });
  }
});

socket.on(CLINT_EVENT.SEND_RESPONSE, ({ origin, code, reason, target }) => {
  // 验证
  if (authenticate.get(socket) !== origin) return void 0;
  // 转发`Response`
  const targetSocket = room.get(target)?.socket;
  if (targetSocket) {
    updateMember(room, origin, "state", CONNECTION_STATE.CONNECTED);
    updateMember(room, target, "state", CONNECTION_STATE.CONNECTED);
    peer.set(origin, target);
    peer.set(target, origin);
    targetSocket.emit(SERVER_EVENT.FORWARD_RESPONSE, { origin, code, reason, target });
  }
});

socket.on(CLINT_EVENT.SEND_MESSAGE, ({ origin, message, target }) => {
  // 验证
  if (authenticate.get(socket) !== origin) return void 0;
  // 转发`Message`
  const targetSocket = room.get(target)?.socket;
  if (targetSocket) {
    targetSocket.emit(SERVER_EVENT.FORWARD_MESSAGE, { origin, message, target });
  }
});

socket.on(CLINT_EVENT.SEND_UNPEER, ({ origin, target }) => {
  // 验证
  if (authenticate.get(socket) !== origin) return void 0;
  // 处理自身的状态
  peer.delete(origin);
  updateMember(room, origin, "state", CONNECTION_STATE.READY);
  // 验证
  if (peer.get(target) !== origin) return void 0;
  // 转发`Unpeer`
  const targetSocket = room.get(target)?.socket;
  if (targetSocket) {
    // 处理`Peer`状态
    updateMember(room, target, "state", CONNECTION_STATE.READY);
    peer.delete(target);
    targetSocket.emit(SERVER_EVENT.FORWARD_UNPEER, { origin, target });
  }
});
```

### 通信
在先前我们实现了`WebRTC`的单文件传输，那么在这里我们就来实现一下多文件的传输，由于涉及到对于`Buffer`的一些操作，我们就先来了解一下`Unit8Array`、`ArrayBuffer`、`Blob`的概念以及关系。

* `Uint8Array`: `Uint8Array`是一种用于表示8位无符号整数的数组类型，类似于`Array`，但是其元素是固定在范围`0`到`255`之间的整数，也就是说每个值都可以存储一个字节的`8`位无符号整数，`Uint8Array`通常用于处理二进制数据。
* `ArrayBuffer`: `ArrayBuffer`是一种用于表示通用的、固定长度的二进制数据缓冲区的对象，提供了一种在`JS`中存储和操作二进制数据的方式，但是其本身不能直接访问和操作数据，`ArrayBuffer = Uint8Array.buffer`。
* `Blob`: `Blob`是一种用于表示二进制数据的对象，可以将任意数据转换为二进制数据并存储在`Blob`中，`Blob`可以看作是`ArrayBuffer`的扩展，`Blob`可以包含任意类型的数据，例如图像、音频或其他文件，通常用于在`Web`应用程序中处理和传输文件，`Blob = new Blob([ArrayBuffer])`。

实际上看起来思路还是比较清晰的，如果我们自拟一个协议，前`12`个字节表示当前块所属的文件`ID`，再使用`4`个字节也就是`32`位表示当前块的序列号，其余的内容作为文件块的实际内容，那么我们就可以直接同时发送多个文件了，而不必要像之前一样等待一个文件传输完成之后再传输下一个文件。不过看起来还是比较麻烦，毕竟涉及到了很多字节的操作，所以我们可以偷懒，想一想我们的目标实际上就是在传输文件块的时候携带一些信息，让我们能够知道当前块是属于哪个`ID`以及序列。

那么我们很容易想到二进制文件实际上是可以用`Base64`来表示的，由此我们就可以直接传输纯文本了，当然使用`Base64`传输的缺点也很明显，`Base64`将每`3`个字节的数据编码为`4`个字符，编码后的数据通常会比原始二进制数据增加约`1/3`的大小，所以我们实际传输的过程中还可以加入压缩程序，比如`pako`，那么便可以相对抵消一些传输字节数量的额外传输成本。实际上也是因为`WebSocket`是基于`TCP`的，而`TCP`的最大段大小通常为`1500`字节，这是以太网上广泛使用的标准`MTU`，所以传输大小没有那么严格的限制。而如果使用`WebRTC`的话单次传输的分片是比较小的，我们一旦转成`Base64`那么传输的大小便会增加，就可能会出现问题，所以我们自定义协议的多文件传输还是留到`WebRTC`中实现，这里我们就直接使用`Base64`传输。

```js
// packages/websocket/client/utils/format.ts
export const blobToBase64 = async (blob: Blob) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const data = new Uint8Array(reader.result as ArrayBuffer);
      const compress = pako.deflate(data);
      resolve(Base64.fromUint8Array(compress));
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
};

export const base64ToBlob = (base64: string) => {
  const bytes = Base64.toUint8Array(base64);
  const decompress = pako.inflate(bytes);
  const blob = new Blob([decompress]);
  return blob;
};

export const getChunkByIndex = (file: Blob, current: number): Promise<string> => {
  const start = current * CHUNK_SIZE;
  const end = Math.min(start + CHUNK_SIZE, file.size);
  return blobToBase64(file.slice(start, end));
};
```

接下来就是我们的常规操作了，首先是分片发送文件，这里因为我们是纯文本的文件发送，所以并不需要特殊处理`Text/Buffer`的数据差异，只需要直接发送就好，大致流程与`WebRTC`是一致的。

```js
// packages/websocket/client/components/modal.tsx
const onSendText = () => {
  sendMessage({ type: "text", data: text });
  setList([...list, { type: "text", from: "self", data: text }]);
  setText("");
};

const sendFilesBySlice = async (files: FileList) => {
  const newList = [...list];
  for (const file of files) {
    const name = file.name;
    const id = getUniqueId();
    const size = file.size;
    const total = Math.ceil(file.size / CHUNK_SIZE);
    sendMessage({ type: "file-start", id, name, size, total });
    fileSource.current[id] = file;
    newList.push({ type: "file", from: "self", name, size, progress: 0, id } as const);
  }
  setList(newList);
};

const onSendFile = () => {
  const KEY = "websocket-file-input";
  const exist = document.querySelector(`body > [data-type='${KEY}']`) as HTMLInputElement;
  const input: HTMLInputElement = exist || document.createElement("input");
  input.value = "";
  input.setAttribute("data-type", KEY);
  input.setAttribute("type", "file");
  input.setAttribute("class", styles.fileInput);
  input.setAttribute("accept", "*");
  input.setAttribute("multiple", "true");
  !exist && document.body.append(input);
  input.onchange = e => {
    const target = e.target as HTMLInputElement;
    document.body.removeChild(input);
    const files = target.files;
    files && sendFilesBySlice(files);
  };
  input.click();
};
```

在接收消息的地方，我们改变了策略，因为当前的数据是纯文本携带了很多数据，所以对于文件分块而言我们的可控性更高了，所以我们采用一种客户端请求的多文件分片策略。具体就是说在`A`向`B`发送文件的时候，我们由`B`来请求我希望拿到的下一个文件分片，`A`在收到请求的时候将这个文件进行切片然后发送给`B`，当这个文件分片传输完成之后再继续请求下一个，直到整个文件传输完成。而每个分片我们都携带了所属文件的`ID`以及序列号、总分片数量等等，这样就不会因为多文件传递的时候造成混乱，而且两端的文件传输进度是完全一致的，不会因为缓冲区的差异造成两端传输进度上的差别。

```js
// packages/websocket/client/components/modal.tsx
const onMessage: ServerFn<typeof SERVER_EVENT.FORWARD_MESSAGE> = useMemoizedFn(event => {
  if (event.origin !== peerId) return void 0;
  const data = event.message;
  if (data.type === "text") {
    setList([...list, { from: "peer", ...data }]);
  } else if (data.type === "file-start") {
    const { id, name, size, total } = data;
    fileMapper.current[id] = [];
    setList([...list, { type: "file", from: "peer", name, size, progress: 0, id }]);
    sendMessage({ type: "file-next", id, current: 0, size, total });
  } else if (data.type === "file-chunk") {
    const { id, current, total, size, chunk } = data;
    const progress = Math.floor((current / total) * 100);
    updateFileProgress(id, progress);
    if (current >= total) {
      sendMessage({ type: "file-finish", id });
    } else {
      const mapper = fileMapper.current;
      if (!mapper[id]) mapper[id] = [];
      mapper[id][current] = base64ToBlob(chunk);
      sendMessage({ type: "file-next", id, current: current + 1, size, total });
    }
  } else if (data.type === "file-next") {
    const { id, current, total, size } = data;
    const progress = Math.floor((current / total) * 100);
    updateFileProgress(id, progress);
    const file = fileSource.current[id];
    if (file) {
      getChunkByIndex(file, current).then(chunk => {
        sendMessage({ type: "file-chunk", id, current, total, size, chunk });
      });
    }
  } else if (data.type === "file-finish") {
    const { id } = data;
    updateFileProgress(id, 100);
  }
});

const onDownloadFile = (id: string, fileName: string) => {
  const blob = fileMapper.current[id]
    ? new Blob(fileMapper.current[id], { type: "application/octet-stream" })
    : fileSource.current[id] || new Blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
};
```

## 每日一题

- <https://github.com/WindRunnerMax/EveryDay>

## 参考

- <http://v6t.ipip.net/>
- <https://icetest.info/>
- <https://www.stunprotocol.org/>
- <https://global.v2ex.co/t/843359>
- <https://webrtc.github.io/samples/>
- <https://bford.info/pub/net/p2pnat/>
- <https://blog.p2hp.com/archives/11075>
- <https://zhuanlan.zhihu.com/p/86759357>
- <https://zhuanlan.zhihu.com/p/621743627>
- <https://github.com/RobinLinus/snapdrop>
- <https://web.dev/articles/webrtc-basics>
- <https://juejin.cn/post/6950234563683713037>
- <https://juejin.cn/post/7171836076246433799>
- <https://chidokun.github.io/p2p-file-transfer>
- <https://bloggeek.me/webrtc-vs-websockets/amp>
- <https://github.com/wangrongding/frontend-park>
- <https://web.dev/articles/webrtc-infrastructure>
- <https://socket.io/zh-CN/docs/v4/server-socket-instance/>
- <https://socket.io/zh-CN/docs/v4/client-socket-instance/>
- <https://developer.mozilla.org/zh-CN/docs/Web/API/RTCPeerConnection/createDataChannel>
- <https://developer.mozilla.org/zh-CN/docs/Web/API/WebRTC_API/Simple_RTCDataChannel_sample>

