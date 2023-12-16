# 基于WebRTC的局域网文件传输
`WebRTC(Web Real-Time Communications)`是一项实时通讯技术，允许网络应用或者站点，在不借助中间媒介的情况下，建立浏览器之间点对点`P2P(Peer-To-Peer)`的连接，实现视频流、音频流、文件等等任意数据的传输，`WebRTC`包含的这些标准使用户在无需安装任何插件或者第三方的软件的情况下，可以创建点对点`Peer-To-Peer`的数据分享和电话会议等。


## 描述
通常来说，在发起文件传输或者音视频通话等场景的时候，我们需要借助第三方的服务器来中转数据，例如我们通过`IM`即时通讯软件向对方发送消息的时候，我们的消息会先发送到服务器，然后服务器再将消息发送到对方的客户端，这种方式的好处是可以保证消息的可靠性，但是存在的问题也比较明显，通过服务器进行转发的速度会受限于服务器本身的带宽，同时也会增加服务器的负载，特别是在传输文件或者进行音视频聊天的情况下，会给予服务器比较大的压力，对于服务提供商来说提供服务器的带宽同样也是很大的开销，对于用户来说文件与消息经由服务器转发也存在安全与隐私方面的问题。

`WebRTC`的出现解决了这些问题，其允许浏览器之间建立点对点的连接，实现数据的传输，以及实时通信的复杂性、插件依赖和兼容性问题，提高了安全性和隐私保护。因此`WebRTC`广泛应用于实时通信领域，包括视频会议、音视频聊天、远程协作、在线教育和直播等场景。而具体到`WebRTC`与`P2P`的数据传输上，主要是解决了如下问题: 

1. `WebRTC`提供了一套标准化的`API`和协议，使开发者能够更轻松地构建实时通信应用，无需深入了解底层技术细节。
2. `WebRTC`支持加密传输，使用`DTLS-SRTP`对传输数据进行加密，确保通信内容的安全性，对于敏感信息的传输非常重要。
3. `WebRTC`使用`P2P`传输方式，使得数据可以直接在通信双方之间传输，减轻了服务器的负担，且通信质量不受服务器带宽限制。
4. `P2P`传输方式可以直接在通信双方之间传输数据，减少了数据传输的路径和中间环节，从而降低了传输延迟，实现更实时的通信体验。
5. `P2P`传输方式不需要经过中心服务器的中转，减少了第三方对通信内容的访问和监控，提高了通信的隐私保护。

在前一段时间，我想在手机上向电脑发送文件，因为要发送的文件比较多，所以我想直接通过`USB`连到电脑上传输，等我将手机连到电脑上之后，我发现手机竟然无法被电脑识别，能够充电但是并不能传文件，因为我的电脑是`Mac`而手机是`Android`，所以无法识别设备这件事就变得合理了起来。那么接着我想用`WeChat`去传文件，但是一想到传文件之后我还需要手动将文件删掉否则会占用我两份手机存储并且传输还很慢，我就又开始在网上寻找软件，这时候我突然想起来了`AirDrop`也就是隔空投送，就想着有没有类似的软件可以用，然后我就找到了`Snapdrop`这个项目，我觉得这个项目很神奇，不需要登录就可以在局域网内发现设备并且传输文件，于是在好奇心的驱使下我也学习了一下，并且基于`WebRTC/WebSocket`实现了类似的文件传输方案`https://github.com/WindrunnerMax/FileTransfer`。通过这种方式，任何拥有浏览器的设备都有传输数据的可能，不需要借助数据线传输文件，也不会受限于`Apple`全家桶才能使用的隔空投送，以及可以应用于常见的`IOS/Android`设备向`PC`台式设备传输文件的场景等等。此外即使因为各种原因路由器开启了`AP`隔离功能，我们的服务依旧可以正常交换数据，这样避免了在路由器不受我们控制的情况下通过`Wifi`传输文件的掣肘。那么回归到项目本身，具体来说在完成功能的过程中解决了如下问题: 

1. 局域网内可以互相发现，不需要手动输入对方`IP`地址等信息。
2. 多个设备中的任意两个设备之间可以相互传输文本消息与文件数据。
3. 设备间的数据传输采用基于`WebRTC`的`P2P`方案，无需服务器中转数据。
4. 跨局域网传输且`NAT`穿越受限的情况下，基于`WebSocket`服务器中转传输。

此外，如果需要调试`WebRTC`的链接，可以在`Chrome`中打开`about://webrtc-internals/`，`FireFox`中打开`about:webrtc`即可进行调试，在这里可以观测到`WebRTC`的`ICE`交换、数据传输、事件触发等等。


## WebRTC
`WebRTC`是一套复杂的协议，同样也是`API`，并且提供了音视频传输的一整套解决方案，可以总结为跨平台、低时延、端对端的音视频实时通信技术。`WebRTC`提供的`API`大致可以分为三类，分别是`Media Stream API`设备音视频流、`RTCPeerConnection API`本地计算机到远端的`WebRTC`连接、`Peer-To-Peer RTCDataChannel API`浏览器之间`P2P`数据传输信道。在`WebRTC`的核心层中，同样包含三大核心模块，分别是`Voice Engine`音频引擎、`Video Engine`视频引擎、`Transport`传输模块。音频引擎`Voice Engine`中包含`iSAC/iLBC Codec`音频编解码器、`NetEQ For Voice`网络抖动和丢包处理、` Echo Canceler/Noise Reduction`回音消除与噪音抑制等。`Video Engine`视频引擎中包括`VP8 Codec`视频编解码器、`Video Jitter Buffer`视频抖动缓冲器、`Image Enhancements`图像增强等。`Transport`传输模块中包括`SRTP`安全实时传输协议、`Multiplexing`多路复用、​`STUN+TURN+ICE`网络传输`NAT`穿越，`DTLS`数据报安全传输等。

由于在这里我们的主要目的是数据传输，所以我们只需要关心`API`层面上的`RTCPeerConnection API`和`Peer-To-Peer Data API`，以及核心层中的`Transport`传输模块即可。实际上由于网络以及场景的复杂性，基于`WebRTC`衍生出了大量的方案设计，而在网络框架模型方面，便有着三种架构: `Mesh`架构即真正的`P2P`传输，每个客户端与其他客户端都建立了连接，形成了网状的结构，这种架构可以同时连接的客户端有限，但是优点是不需要中心服务器，实现简单；`MCU-MultiPoint Control Unit`网络架构即传统的中心化架构，每个浏览器仅与中心的MCU服务器连接，`MCU`服务器负责所有的视频编码、转码、解码、混合等复杂逻辑，这种架构会对服务器造成较大的压力，但是优点是可以支持更多的人同时音视频通讯，比较适合多人视频会议。`SFU-Selective Forwarding Unit`网络架构类似于`MCU`的中心化架构，仍然有中心节点服务器，但是中心节点只负责转发，不做太重的处理，所以服务器的压力会低很多，这种架构需要比较大的带宽消耗，但是优点是服务器压力较小，典型场景是`1`对`N`的视频互动。对于我们而言，我们的目标是局域网之间的数据传输，所以并不会涉及此类复杂的网络传输架构模型，我们实现的是非常典型的`P2P`架构，甚至不需要`N-N`的数据传输，但是同样也会涉及到一些复杂的问题，例如`NAT`穿越、`ICE`交换、`STUN`服务器、`TURN`服务器等等。

### 信令
信令是涉及到通信系统时，用于建立、控制和终止通信会话的信息，包含了与通信相关的各种指令、协议和消息，用于使通信参与者之间能够相互识别、协商和交换数据。主要目的是确保通信参与者能够建立连接、协商通信参数，并在需要时进行状态的改变或终止，这其中涉及到各种通信过程中的控制信息交换，而不是直接传输实际的用户数据。

或许会产生一个疑问，既然`WebRTC`可以做到`P2P`的数据传输，那么为什么还需要信令服务器来调度连接。实际上这很简单，因为我们的网络环境是非常复杂的，我们并不能明确地得到对方的`IP`等信息来直接建立连接，所以我们需要借助信令服务器来协调连接。需要注意的是信令服务器的目标是协调而不是直接传输数据，数据本身的传输是`P2P`的，那么也就是说我们建立信令服务器并不需要大量的资源。

那如果说我们是不是必须要有信令服务器，那确实不是必要的，在`WebRTC`中虽然没有建立信令的标准或者说客户端来回传递消息来建立连接的方法，因为网络环境的复杂特别是`IPv4`的时代在客户端直接建立连接是不太现实的，也就是我们做不到直接在互联网上广播我要连接到我的朋友，但是我们通过信令需要传递的数据是很明确的，而这些信息都是文本信息，所以如果不建立信令服务器的话，我们可以通过一些即使通讯软件`IM`来将需要传递的信息明确的发给对方，那么这样就不需要信令服务器了。那么人工转发消息的方式看起来非常麻烦可能并不是很好的选择，由此实际上我们可以理解为信令服务器就是把协商这部分内容自动化了，并且附带的能够提高连接的效率以及附加协商鉴权能力等等。

```
             SIGNLING

             /      \ 
  SDP/ICE   /        \   SDP/ICE
           /          \

      Client    <->    Client
```

基本的数据传输过程如上图所示，我们可以通过信令服务器将客户端的`SDP/ICE`等信息传递，然后就可以在两个`Client`之间建立起连接，之后的数据传输就完全在两个客户端也就是浏览器之间进行了，而信令服务器的作用就是协调这个过程，使得两个客户端能够建立起连接，实际上整个过程非常类似于`TCP`的握手，只不过这里并没有那么严格而且只握手两次就可以认为是建立连接了。此外`WebRTC`是基于`UDP`的，所以`WebRTC DataChannel`也可以相当于在`UDP`的不可靠传输的基础上实现了基本可靠的传输，类似于`QUIC`希望能取得可靠与速度之间的平衡。

那么我们现在已经了解了信令服务器的作用，接下来我们就来实现信令服务器用来调度协商`WebRTC`。前边我们也提到了，因为`WebRTC`并没有规定信令服务器的标准或者协议，并且传输的都是文本内容，那么我们是可以使用任何方式来搭建这个信令服务器的，例如我们可以使用`HTTP`协议的短轮询`+`超时、长轮询，甚至是`EventSource`、`SIP`等等都可以作为信令服务器的传输协议。在这里我们的目标不是仅仅建立起链接，而是希望能够实现类似于房间的概念，由此来管理我们的设备链接，所以首选的方案是`WebSocket`，`WebSocket`可以把这个功能做的更自然一些，全双工的客户端与服务器通信，消息可以同时在两个方向上流动，而`socket.io`是基于`WebSocket`封装了服务端和客户端，使用起来非常简单方便，所以接下来我们使用`socket.io`来实现信令服务器。

首先我们需要实现房间的功能，在最开始的时候我们就明确我们需要在局域网自动发现设备，那么也就是相当于局域网的设备是属于同一个房间的，那么我们就需要存储一些信息，在这里我们使用`Map`分别存储了`id`、房间、连接信息。那么在一个基本的房间中，我们除了将设备加入到房间外还需要实现几个功能，对于新加入的设备`A`，我们需要将当前房间内已经存在的设备信息告知当前新加入的设备`A`，对于房间内的其他设备，则需要通知当前新加入的设备`A`的信息，同样的在设备`A`退出房间的时候，我们也需要通知房间内的其他设备当前离开的设备`A`的信息，并且更新房间数据。

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

可以看出我们管理房间是通过`IP`来实现的，因为此时需要注意一个问题，如果我们的信令服务器是部署在公网的服务器上，那么我们的房间就是全局的，也就是说所有的设备都可以连接到同一个房间，这样的话显然是不合适的，解决这个问题的方法很简单，对于服务器而言我们获取用户的`IP`地址，如果用户的`IP`地址是相同的就认为是同一个局域网的设备，所以我们需要获取当前连接的`Socket`的`IP`信息，在这里我们特殊处理了`127.0.0.1`和`192.168.0.0`两个网域的设备，以便我们在本地/路由器部署时能够正常发现设备。

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
在建设好信令服务器之后，我们就可以开始聊一聊`RTCPeerConnection`的具体协商过程了，在这部分会涉及比较多的概念，例如`Offer`、`Answer`、`SDP`、`ICE`、`STUN`、`TURN`等等，不过我们先不急着了解这些概念我们先开看一下`RTCPeerConnection`的完整协商过程，整个过程是非常类似于`TCP`的握手，当然没有那么严格，但是也是需要经过几个步骤才能够建立起连接的：


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

经过我们上边简单`RTCPeerConnection`协商过程描述，此时如果网络连通情况比较好的话，就可以顺利建立连接，并且通过信道发送消息了，但是实际上在这里涉及的细节还是比较多的，我们可以一步步来拆解这个过程并且描述涉及到的相关概念，并且在最后我们会聊一下当前`IPv6`设备的`P2P`、局域网以及`AP`隔离时的信道传输。

首先我们来看`RTCPeerConnection`对象，因为`WebRTC`有比较多的历史遗留问题，所以我们为了兼容性可能会需要做一些冗余的设置，当然随着`WebRTC`越来约规范化这些兼容问题会逐渐减少，但是我们还是可以考虑一下这个问题的，比如在建立`RTCPeerConnection`时做一点小小的兼容。
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

在这里我们主要是配置了`iceServers`，其他的参数我们保持默认即可我们不需要太多关注，以及例如`sdpSemantics: unified-plan`等配置项也越来越统一化病作为默认值，在比较新的`TS`版本中甚至都不再提供这个配置项的定义了。那么我们目光回到`iceServers`这个配置项，`iceServers`主要是用来提供我们协商链接以及中转的用途，我们可以简单理解一下，试想我们的很多设备都是内网的设备，而信令服务器仅仅是做了数据的转发，所以我们如果要是跨局域网想在公网上或者在路由器`AP`隔离的情况下传输数据的话，最起码需要知道我们的设备出口`IP`地址，`STNU`服务器就是用来获取我们的出口`IP`地址的，`TURN`服务器则是用来中转数据的，而因为`STNU`服务器并不需要太大的资源占用，所以有有比较多的公网服务器提供免费的`STNU`服务，但是`TURN`实际上相当于中转服务器，所以通常是需要购置云服务器自己搭建，并且设置`Token`过期时间等等防止盗用。上边我们只是简单理解一下，所以我们接下来需要聊一下`NAT`、`STNU`、`TURN`三个概念。

`NAT(Network Address Translation)`网络地址转换是一种在`IP`网络中广泛使用的技术，主要是将一个`IP`地址转换为另一个`IP`地址，具体来说其工作原理是将一个私有`IP`地址(如在家庭网络或企业内部网络中使用的地址)映射到一个公共`IP`地址(如互联网上的`IP`地址)。当一个设备从私有网络向公共网络发送数据包时，`NAT`设备会将源`IP`地址从私有地址转换为公共地址，并且在返回数据包时将目标`IP`地址从公共地址转换为私有地址。`NAT`可以通过多种方式实现，例如静态`NAT`、动态`NAT`和端口地址转换`PAT`等，静态`NAT`将一个私有`IP`地址映射到一个公共`IP`地址，而动态`NAT`则动态地为每个私有地址分配一个公共地址，`PAT`是一种特殊的动态`NAT`，在将私有`IP`地址转换为公共`IP`地址时，还会将源端口号或目标端口号转换为不同的端口号，以支持多个设备使用同一个公共`IP`地址。`NAT`最初是为了解决`IPv4`地址空间的短缺而设计的，后来也为提高网络安全性并简化网络管理提供了基础。在互联网上大多数设备都是通过路由器或防火墙连接到网络的，这些设备通常使用网络地址转换`NAT`将内部`IP`地址映射到一个公共的`IP`地址上，这个公共`IP`地址可以被其他设备用来访问，但是这些设备内部的`IP`地址是隐藏的，其他的设备不能直接通过它们的内部`IP`地址建立`P2P`连接。因此，直接进行`P2P`连接可能会受到网络地址转换`NAT`的限制，导致连接无法建立。

`STUN(Session Traversal Utilities for NAT)`会话穿越工具用于在`NAT`或防火墙后面的客户端之间建立`P2P`连接，`STUN`服务器主要用于获取客户端的公网`IP`地址，`STUN`服务器会返回客户端的公网`IP`地址和端口号，这样客户端就可以通过这个公网`IP`地址和端口号来建立`P2P`连接。`STUN`服务器并不会中转数据，它只是用来获取客户端的公网`IP`地址和端口号，`STUN`服务器的工作原理是客户端向`STUN`服务器发送请求，`STUN`服务器会返回客户端的公网`IP`地址和端口号，这样客户端就可以通过这个公网`IP`地址和端口号来建立`P2P`连接。`STUN`服务器并不会中转数据，它只是用来获取客户端的公网`IP`地址和端口号，`STUN`服务器的工作原理是客户端向`STUN`服务器发送请求，`STUN`服务器会返回客户端的公网`IP`地址和端口号，这样客户端就可以通过这个公网`IP`地址和端口号来建立`P2P`连接。`STUN`服务器并不会中转数据，它只是用来获取客户端的公网`IP`地址和端口号，`STUN`服务器的工作原理是客户端向`STUN`服务器发送请求，`STUN`服务器会返回客户端的公网`IP`地址和端口号，这样客户端就可以通过这个公网`IP`地址和端口号来建立`P2P`连接。`STUN`服务器并不会中转数据，它只是用来获取客户端的公网`IP`地址和端口号，`STUN`服务器的工作原理是客户端向


内网传输
```
ICE Candidate pair: 101.68.35.129:25595 <=> 101.68.35.129:25596
```

```
ICE Candidate pair: :60622 <=> 192.168.0.100:44103
ICE Candidate pair: :55305 <=> 2408:8240:e12:3c45:f1ba:c574:6328:a70:45954
```


`IPv6`
```bash
$ nc -vk6 9999
```
```bash
$ nc -v6 ${ip} 9999
```

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
http://v6t.ipip.net/
https://icetest.info/
https://www.stunprotocol.org/
https://webrtc.github.io/samples/
https://bford.info/pub/net/p2pnat/
https://blog.p2hp.com/archives/11075
https://github.com/RobinLinus/snapdrop
https://web.dev/articles/webrtc-basics
https://juejin.cn/post/6950234563683713037
https://juejin.cn/post/7171836076246433799
https://chidokun.github.io/p2p-file-transfer
https://bloggeek.me/webrtc-vs-websockets/amp
https://github.com/wangrongding/frontend-park
https://web.dev/articles/webrtc-infrastructure
https://socket.io/zh-CN/docs/v4/server-socket-instance/
https://socket.io/zh-CN/docs/v4/client-socket-instance/
https://developer.mozilla.org/zh-CN/docs/Web/API/RTCPeerConnection/createDataChannel
https://developer.mozilla.org/zh-CN/docs/Web/API/WebRTC_API/Simple_RTCDataChannel_sample
```
