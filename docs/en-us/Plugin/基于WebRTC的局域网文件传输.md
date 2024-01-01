# LAN File Transfer Based on WebRTC

`WebRTC (Web Real-Time Communications)` is a real-time communication technology that allows network applications or websites to establish peer-to-peer (P2P) connections between browsers without the need for intermediate media. It enables the transmission of video streams, audio streams, files, and any other arbitrary data. The standards included in `WebRTC` allow users to create P2P data sharing and audio/video conferences without the need for installing any plugins or third-party software.

## Description
Typically, in scenarios such as initiating file transfers or audio/video calls, we rely on third-party servers to relay data. For example, when we send a message to someone using an Instant Messaging (IM) application, our message first goes to the server, and then the server forwards the message to the recipient's client. This method ensures message reliability but has clear drawbacks. The speed of relay through the server is limited by the server's bandwidth and also increases the server's load. This can pose significant pressure, especially when transferring files or conducting audio/video chats. From a service provider perspective, providing server bandwidth also incurs substantial costs. For users, relaying files and messages through servers also raises security and privacy concerns.

The emergence of `WebRTC` addresses these issues by enabling browsers to establish P2P connections, facilitating data transmission, and addressing the complexities, plugin dependencies, and compatibility issues of real-time communication. It enhances security and privacy protection. Consequently, `WebRTC` is widely used in real-time communication scenarios, including video conferences, audio/video chats, remote collaboration, online education, and live streaming. Specifically in terms of data transmission between `WebRTC` and `P2P`, it primarily resolves the following issues:

1. `WebRTC` provides a standardized set of APIs and protocols, making it easier for developers to build real-time communication applications without the need for in-depth understanding of low-level technical details.
2. `WebRTC` supports encrypted transmission, using `DTLS-SRTP` to encrypt transmitted data, ensuring the security of communication content, which is crucial for transmitting sensitive information.
3. `WebRTC` employs P2P transmission, allowing data to be directly transmitted between communicating parties, reducing the server's burden and ensuring communication quality is not limited by server bandwidth.
4. P2P transmission allows data to be directly transmitted between communicating parties, reducing the transmission path and intermediary steps, thus lowering transmission latency and achieving a more real-time communication experience.
5. P2P transmission eliminates the need for relay through a central server, reducing third-party access and monitoring of communication content, thereby enhancing communication privacy protection.

Recently, I wanted to send files from my mobile phone to my computer. Since I had many files to send, I intended to directly connect via USB for the transfer. However, when I connected my phone to the computer, I found that the computer couldn't recognize the phone. Although it could charge, it couldn't transfer files. This turned out to be reasonable because my computer is a Mac while my phone operates on Android. Subsequently, I thought of using WeChat to transfer the files, but considering that I would need to manually delete the files after transferring to free up space and the transfer speed was slow, I began searching for software online. Then, I suddenly remembered AirDrop and wondered if there was similar software available. That's when I found the Snapdrop project, which I found to be remarkable. It doesn't require login and allows devices to be discovered within the LAN for file transfer. Out of curiosity, I learned more about it and based on `WebRTC/WebSocket`, I implemented a similar file transfer solution: `https://github.com/WindrunnerMax/FileTransfer`. This approach enables any device with a browser to transfer data without relying on a data cable and without being limited to Apple's ecosystem for using AirDrop. Its inherent cross-platform advantage makes it feasible for common devices such as iOS/Android/Mac to transfer files to PC desktops and other scenarios.

Moreover, even if the router has enabled `AP` isolation for various reasons, our service can still exchange data normally, avoiding the hindrance of transferring files via `WIFI` due to routers being out of our control. Refocusing on the project itself, specifically, in the process of achieving functionality, it resolves the following issues:

1. Devices within the LAN can find each other without the need for manually entering the other party's IP address.
2. Any two devices among multiple devices can exchange text messages and file data with each other.
3. Data transmission between devices uses a P2P solution based on WebRTC, eliminating the need for server relay.
4. In cases of cross-LAN transmission and when `NAT` traversal is restricted, transmission is relayed through a WebSocket server.

Additionally, for debugging the WebRTC link, you can open `about://webrtc-internals/` in Chrome and `about:webrtc` in Firefox to conduct debugging. Here, you can observe WebRTC's `ICE` exchange, data transmission, event triggering, and more.

## WebRTC

`WebRTC` is a complex protocol and also an API, providing a complete set of solutions for audio and video transmission. It can be summarized as a cross-platform, low-latency, end-to-end real-time communication technology for audio and video. The `WebRTC` API can be roughly divided into three categories: `Media Stream API` for device audio and video streams, `RTCPeerConnection API` for local-to-remote `WebRTC` connections, and `Peer-To-Peer RTCDataChannel API` for `P2P` data transmission channels between browsers. At the core layer of `WebRTC`, there are three main modules: `Voice Engine` for audio, `Video Engine` for video, and `Transport` for transmission. The `Voice Engine` includes audio codecs such as `iSAC/iLBC Codec`, network jitter and packet loss handling with `NetEQ For Voice`, and echo cancellation and noise reduction. The `Video Engine` encompasses the `VP8 Codec`, video jitter buffer, and image enhancements. The `Transport` module includes secure real-time transport protocol (`SRTP`), multiplexing, `STUN+TURN+ICE` for `NAT` traversal, and `DTLS` for secure data transmission.

Since our main purpose here is data transmission, we only need to focus on the `RTCPeerConnection API` and `Peer-to-Peer RTCDataChannel API` at the API level, as well as the `Transport` module at the core layer. Due to the complexity of networks and scenarios, numerous solution designs have arisen from `WebRTC`. In terms of network framework models, there are three types of architectures: 

- `Mesh` architecture, which represents true `P2P` transmission where each client connects to every other client, forming a mesh structure. While this architecture has a limitation on the number of clients that can simultaneously connect, it does not require a central server, making it simple to implement. 

- `MCU (MultiPoint Control Unit)` network architecture, which is a traditional centralized architecture where each browser connects only to the central MCU server, responsible for video encoding, transcoding, decoding, and mixing. This architecture can put significant pressure on the server but can support more people for simultaneous audio and video communication, making it suitable for multi-party video conferences.

- `SFU (Selective Forwarding Unit)` network architecture, similar to the `MCU` architecture, still has a central node server but only forwards without heavy processing. Therefore, the server’s load is significantly reduced, but this architecture requires considerable bandwidth consumption and is suitable for `1-to-N` video interaction.

For our purpose, involving data transmission between local networks, we do not need to deal with such complex network transmission architecture models. Our implementation follows a very typical `P2P` architecture, which may not even involve `N-N` data transmission but still requires addressing complex issues such as `NAT` traversal, `ICE` exchange, `STUN` and `TURN` servers, among others.

### Signaling

Signaling in communication systems refers to the information used to establish, control, and terminate communication sessions, including various instructions, protocols, and messages related to the communication, allowing communication participants to recognize, negotiate, and exchange data. The main purpose is to ensure that communication participants can establish connections, negotiate communication parameters, and change or terminate states as needed through the exchange of control information during communication processes, rather than directly transmitting actual user data.

You might wonder, if `WebRTC` enables `P2P` data transmission, why do we still need signaling servers to coordinate connections? It's quite simple. Our network environment is very complex, and we cannot obtain the other party's `IP` information to directly establish a connection. Therefore, we need signaling servers to coordinate connections. It's important to note that the purpose of signaling servers is to coordinate, not directly transmit data. The data transmission itself is `P2P`. In other words, establishing signaling servers does not require a large amount of resources.

But, do we really need signaling servers? In `WebRTC`, although there is no established standard for signaling or a method for client-to-client message exchange to establish connections, due to the complexity of network environments, especially in the era of `IPv4`, it is not quite realistic for clients to establish connections directly. In other words, we cannot directly broadcast on the internet that we want to connect to our friend. However, the data that needs to be transmitted via signaling is very clear, and this information is in text form. Therefore, if we do not establish a signaling server, we can use even instant messaging (`IM`) software to send the information that needs to be transmitted clearly to the other party, thus eliminating the need for a signaling server. Using a manual forwarding message approach might seem very cumbersome and may not be a good choice. Therefore, we can understand the signaling server as automating the negotiation part and providing additional benefits such as improving connection efficiency and offering negotiation authentication capabilities, among others.

```
             SIGNLING

             /      \ 
  SDP/ICE   /        \   SDP/ICE
           /          \

      Client    <->    Client
```

The basic data transmission process is as shown in the figure above. We can transmit the client's `SDP/ICE` information through the signaling server, and then establish a connection between the two clients. Subsequently, the data transmission will take place directly between the two clients, i.e., the browsers. The role of the signaling server is to coordinate this process, enabling the two clients to establish a connection. In essence, the entire process is quite similar to the handshake of `TCP`, although it is not as strict and can be considered as establishing a connection after only two handshakes. Additionally, `WebRTC` is based on `UDP`, so the `WebRTC DataChannel` also achieves basic reliable transmission on the basis of unreliable transmission of `UDP`, similar to how `QUIC` aims to achieve a balance between reliability and speed. 

Now that we understand the role of the signaling server, we will proceed to implement the signaling server for negotiating `WebRTC`. As mentioned earlier, since `WebRTC` does not specify the standard or protocol for the signaling server, and the transmission is all in text format, we can use any method to build this signaling server. For example, we can use the `HTTP` protocol's short polling + timeout, long polling, and even `EventSource`, `SIP`, etc. as the transport protocol for the signaling server. Our goal here is not just to establish a connection, but to implement a concept similar to a room to manage our device connections. Therefore, the preferred solution is `WebSocket`, which can make this feature more natural. `WebSocket` allows full-duplex communication between client and server, where messages can flow in both directions simultaneously. In addition, `socket.io` encapsulates the server and client based on `WebSocket`, making it very easy and convenient to use. Therefore, we will use `socket.io` to implement the signaling server.

Firstly, we need to implement the functionality of rooms. At the beginning, it is clear that we need to automatically discover devices in the local network, so devices in the local network belong to the same room. Therefore, we need to store some information. Here, we use `Map` to store `id`, rooms, and connection information. In a basic room, besides adding devices to the room, we also need to implement several features. For a newly added device `A`, we need to inform the device `A` of the existing device information in the current room. For other devices in the room, we need to notify them of the information of the newly added device `A`. Similarly, when device `A` exits the room, we need to notify the other devices in the room of the information of the departing device `A` and update the room data.

```js
// packages/webrtc/server/index.ts
const authenticate = new WeakMap<ServerSocket, string>();
const mapper = new Map<string, Member>();
const rooms = new Map<string, string[]>();

socket.on(CLINT_EVENT.JOIN_ROOM, ({ id, device }) => {
  // Authentication
  if (!id) return void 0;
  authenticate.set(socket, id);
  // Join the room
  const ip = getIpByRequest(socket.request);
  const room = rooms.get(ip) || [];
  rooms.set(ip, [...room, id]);
  mapper.set(id, { socket, device, ip });
  // Room notification messages
  const initialization: SocketEventParams["JOINED_MEMBER"]["initialization"] = [];
  room.forEach(key => {
    const instance = mapper.get(key);
    if (!instance) return void 0;
    initialization.push({ id: key, device: instance.device });
    instance.socket.emit(SERVER_EVENT.JOINED_ROOM, { id, device });
  });
  socket.emit(SERVER_EVENT.JOINED_MEMBER, { initialization });
});
```

```js
// packages/webrtc/server/utils.ts
export const getIpByRequest = (request: http.IncomingMessage) => {
  let ip = "";
  if (request.headers["x-forwarded-for"]) {
    ip = request.headers["x-forwarded-for"].toString().split(/\s*,\s*/)[0];
  } else {
    ip = request.socket.remoteAddress || "";
  }
  // When deploying the application locally, the `ip` address may be `::1` or `::ffff:`
  if (ip === "::1" || ip === "::ffff:127.0.0.1" || !ip) {
    ip = "127.0.0.1";
  }
  // When deploying the application in a local area network, the `ip` address may be `192.168.x.x`
  if (ip.startsWith("::ffff:192.168") || ip.startsWith("192.168")) {
    ip = "192.168.0.0";
  }
  return ip;
};
```

It can be seen that we manage rooms based on `IP`, because at this point we need to be aware of a certain issue. If our signaling server is deployed on a public server, then our rooms are global, meaning that all devices can connect to the same room. Obviously, this is not appropriate. The solution to this problem is simple. For the server, we obtain the user's `IP` address. If the user's `IP` address is the same, we consider it to be a device in the same local area network. Therefore, we need to obtain the `IP` information of the current connection's `Socket`. Here, we handle the special cases of `127.0.0.1` and `192.168.0.0` domains so that we can properly discover devices when deploying locally/on a router.

Thus, the room functionality of the signaling server is complete. It seems that implementing a signaling server is not a difficult task. Deploying this code and static resources on the server only occupies around `20MB` of memory, hardly consuming too many resources. However, the functionality of the signaling server is not limited to room management. We also need to implement the exchange of `SDP` and `ICE`, as mentioned earlier, the purpose of the signaling server is to coordinate connections. Therefore, we also need to implement the forwarding of `SDP` and `ICE` for coordinating connections. We will prioritize this part of the content first, and then move on to discussing the negotiation process of `RTCPeerConnection`.

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
  // Forward `Offer` -> `Target`
  const targetSocket = mapper.get(target)?.socket;
  if (targetSocket) {
    targetSocket.emit(SERVER_EVENT.FORWARD_OFFER, { origin, offer, target });
  }
});

socket.on(CLINT_EVENT.SEND_ICE, ({ origin, ice, target }) => {
  // Forward `ICE` -> `Target`
  // ...
});

socket.on(CLINT_EVENT.SEND_ANSWER, ({ origin, answer, target }) => {
  // Forward `Answer` -> `Target`
  // ...
});

socket.on(CLINT_EVENT.SEND_ERROR, ({ origin, code, message, target }) => {
  // Forward `Error` -> `Target`
  // ...
});
```

### Connection
After setting up the signaling server, we can now talk about the specific negotiation process of `RTCPeerConnection`. This part will involve many concepts, such as `Offer`, `Answer`, `SDP`, `ICE`, `STUN`, `TURN`, and so on. But let's not rush to understand these concepts and take a look at the complete negotiation process of `RTCPeerConnection` first. The entire process is very similar to the handshake of `TCP`, of course not as strict, but it also needs to go through several steps to establish the connection:

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

1. Suppose we have client `A` and `B`, both have instantiated the `RTCPeerConnection` object waiting to connect. Of course, it is also possible to instantiate the `RTCPeerConnection` object as needed.
2. Client `A` is ready to initiate the connection request. At this point, client `A` needs to create an `Offer`, which is `RTCSessionDescription (SDP)`, and set the created `Offer` as the local `LocalDescription`, and then, with the help of the signaling server, forward the `Offer` to the target client, which is client `B`.
3. After receiving the `Offer` from client `A`, client `B` needs to set the received `Offer` as the remote `RemoteDescription`, then create an `Answer`, also an `RTCSessionDescription (SDP)`, and set the created `Answer` as the local `LocalDescription`, then with the help of the signaling server, forward the `Answer` to the target client, which is client `A`.
4. After receiving the `Answer` from client `B`, client `A` needs to set the received `Answer` as the remote `RemoteDescription`, and the handshake process between client `A` and `B` is completed.
5. Throughout the entire handshake process between client `A` and `B`, there is also the exchange of `ICE`. When there is a change in the `ICECandidate`, we need to fully forward the `ICE` to the target client, and then the target client will set it as the target candidate.

After briefly describing the `RTCPeerConnection` negotiation process, if the network connectivity is good at this time, the connection can be established smoothly, and messages can be sent through the channel. However, in reality, there are still many details involved in this process. We can break down this process step by step, describe the related concepts involved, and finally discuss the channel transmission of the current `IPv6` devices, `P2P`, local area networks, and `AP` isolation.

First, let's take a look at the `RTCPeerConnection` object. Because `WebRTC` has quite a few legacy issues, we may need to do some redundant settings for compatibility, but as `WebRTC` becomes more standardized, these compatibility issues will gradually decrease. However, it's still worth considering, such as doing a little compatibility when establishing `RTCPeerConnection`.

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

Here, we mainly configure `iceServers`, and we can keep the other parameters at their default values without paying too much attention to them. Configuration items such as `sdpSemantics: unified-plan` are becoming more standardized and are increasingly being used as default values. In newer versions of `TS`, the definition of this configuration item may not even be provided. Now, let's focus on the `iceServers` configuration. `iceServers` is mainly used for negotiating connections and relaying data. We can understand it simply: imagine that many of our devices are on an internal network, and the signaling server only forwards data. Therefore, if we want to transmit data across different local networks or in cases of isolation such as on a public network or behind a router `AP`, we at least need to know the public IP address of our device. STUN server is used to obtain our public IP address, while TURN server is used to relay data. STUN servers do not require significant resource usage, so there are many public servers that provide free STUN services. However, TURN servers, which essentially act as relay servers, usually need to be set up on a cloud server and measures should be taken to prevent unauthorized usage, such as setting expiry times for tokens. This is just a simple understanding, so the next thing we need to discuss is the concepts of `NAT`, `STUN`, and `TURN`.

`NAT (Network Address Translation)` is a widely used technology in IP networks, mainly used to map one IP address to another. Specifically, it works by mapping a private IP address (such as those used in home or enterprise internal networks) to a public IP address (such as those used on the internet). When a device from a private network sends a data packet to the public network, the NAT device will convert the source IP address from the private address to the public address, and when returning the data packet, it will convert the target IP address from the public address to the private address. NAT can be implemented in various ways, such as static NAT, dynamic NAT, and Port Address Translation (PAT). Static NAT maps one private IP address to one public IP address, while dynamic NAT dynamically assigns a public address to each private address. PAT is a special type of dynamic NAT, which also converts the source or destination port number to a different port number when converting a private IP address to a public IP address, to support multiple devices using the same public IP address. NAT was initially designed to address the shortage of IPv4 address space and later also provided the basis for improving network security and simplifying network management. Most devices on the internet are connected through routers or firewalls, which usually use NAT to map internal IP addresses to a public IP address. This public IP address can be used by other devices to access these devices, but their internal IP addresses are hidden and other devices cannot establish a P2P connection directly through their internal IP addresses. Therefore, direct P2P connections may be restricted by network address translation (NAT), leading to connection failures.

The **STUN (Session Traversal Utilities for NAT)** session traversal application is used to establish **P2P** connections between clients behind **NAT** or firewalls. The **STUN** server does not relay data, but is primarily used to obtain the client's public IP address. When the client requests the server, the server returns the client's public IP address and port number. This allows the client to establish a **P2P** connection using this public IP address and port number. The main goal is to detect and determine whether the communicating client is behind a firewall or **NAT** router, and to determine the exposed WAN **IP** and port of the internal client, as well as **NAT** type. The **STUN** server uses this information to assist in establishing **UDP** communication between different internal computers. 

In reality, **STUN** is a **Client/Server** model protocol. The client sends a **STUN** request to the **STUN** server, including the client's own perceived **IP** address and port number. Upon receiving the request, the **STUN** server extracts the device's public **IP** address and port number from the request and returns this information to the device. Armed with this information from the **STUN** server, the device can then share this information with other devices to achieve peer-to-peer communication. Essentially, the server provides the address to the client device, which uses this information to attempt to establish communication. 

**NAT** mainly includes four types: Full Cone **NAT**, Restricted Cone **NAT**, Port Restricted Cone **NAT**, and Symmetric **NAT**. **STUN** is effective for the first three types of **NAT**, but is not usable for the Symmetric **NAT** often used in large corporate networks for obtaining the public **IP** and required port number. We will talk more about the specific **NAT** traversal process later, but in my understanding, **STUN** is more applicable to single-layer **NAT**. The complexity increases in the case of multi-level **NAT**, and while it may be manageable if all are Cone **NAT**, the actual success rate of using **STUN** for **NAT** traversal is still relatively low due to the complexity of the domestic network environment, and various restrictions imposed by operators on **UDP** packets.

**TURN (Traversal Using Relay NAT)**, on the other hand, refers to traversing **NAT** using a relay. Due to the complexity of networks, when two devices are both behind Symmetric **NAT** or restricted by firewalls, direct **P2P** connections are often difficult to establish. When direct connections are impossible, devices can communicate by connecting to a **TURN** server. The device sends data to the **TURN** server, which then relays the data to the target device. This is essentially an intermediate solution, as the **TURN** server acts as an intermediary and avoids the arbitrary allocation of **RTP/RTCP** address port numbers on the egress **NAT**, as in the case of the **STUN** application model. However, using a **TURN** server introduces some latency and bandwidth consumption because the data must pass through additional intermediate steps. Therefore, **TURN** servers are usually considered as backup solutions in **WebRTC** when direct peer-to-peer connections cannot be established. Typically, public server resources are not available, and because **iceServers** are configured at the front end, they usually generate encrypted temporary connections for transmission, similar to the commonly used image anti-theft chain mechanism. In reality, using relay servers in **WebRTC** scenarios is quite common. For example, in multi-person video call scenarios, a centralized network architecture such as **MCU** or **SFU** is often chosen to transmit audio and video streams.

Now that we have an understanding of these concepts and their uses, let's briefly discuss how **STUN** accomplishes **NAT** traversal. Let's assume our network structure has only one layer of **NAT**, and both sides of peer-to-peer transmission are the same **NAT** structure. Of course, different **NAT** structures can also be traversable, but here we are simplifying the entire model. At this point, our network **IP** and related port numbers are as follows:

``` 
          Internal                 Router                   Public
A:     1.1.1.1:1111    1.1.1.1:1111 <-> 3.3.3.3:3333   3.3.3.3:3333 
B:     6.6.6.6:6666    6.6.6.6:6666 <-> 8.8.8.8:8888   8.8.8.8:8888
STUN:                                                  7.7.7.7:7777           
SIGNLING:                                              9.9.9.9:9999           
```

Next, let's take a look at the full cone type `NAT`. Once an internal address `IA:IP` is mapped to an external address `EA:EP`, all packages sent from `IA:IP` will be sent outside through `EA:EP`, and any external host can reach `IA:IP` by sending packages to `EA:EP`. 

Now, let's say we need to establish a connection. We initiate a request to the `STUN` server based on `A` and `B`, like `1.1.1.1:1111 -> 7.7.7.7:7777`. At this point, the `STUN` server will return the public IP address and port of `A`, which is `3.3.3.3:3333`, and similarly `B` will receive `6.6.6.6:6666 -> 7.7.7.7:7777` and get `8.8.8.8:8888`. It's important to note that we have successfully established a mapping in the router's routing table. This means that any external host can reach `IA:IP` by sending packets to `EA:EP`. So, at this point, we just need to inform `A` of `3.3.3.3:3333` and `B` of `8.8.8.8:8888` through the signaling server `9.9.9.9:9999`, and the two parties can communicate freely. 

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

Restricted cone type `NAT` and port restricted cone type `NAT` are quite similar, so we'll talk about them together. These two types of `NAT` are based on the full cone type `NAT` with added restrictions. The restricted cone type `NAT` is a special type of full cone type `NAT`, where the limitation is that internal hosts can only send packets to external hosts that have previously sent data packets. This means that the source address of the data packet needs to match the `NAT` table. On the other hand, the port restricted cone type `NAT` is a special type of restricted cone type `NAT`, where the limitation is that internal hosts can only send packets to the same port of external hosts from which they have previously sent or received data packets. This means that both the source `IP` and `PORT` of the data packet need to match the `NAT` table. 

To give an example, only the `IP/IP:PORT` that already exists in the routing table can be used to forward data by the router. In practice, this is understandable because when we send a request, it is usually to a specific `IP:PORT`, and when receiving data, this `IP:PORT` is already in the routing table so it can receive data normally. Although these two types of `NAT` restrict the necessity of `IP/IP:PORT` to be in the routing table, they do not restrict the communication between `IP:PORT` and the previous `IP:PORT`. Therefore, we just need to proactively send data packets based on the previous full cone type `NAT`, effectively writing `IP/IP:PORT` into the routing table, so that the router can then forward data packets received from `IP/IP:PORT` as needed.

```
     From                 To                Payload
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

Symmetric NAT is the most restrictive, where each request from the same internal IP and port to a specific destination IP and port is mapped to a unique external IP address and port. Information packets sent from the same internal IP and port to different destinations and ports use different mappings. This is similar to a port-restricted cone NAT but also restricts the IP:port to only communicate with the previous IP:port. For STUN, this means that the IP:port used for the probe request and the actual connection will be different in symmetric NAT, unlike in port-restricted cone NAT. In other words, the IP:port obtained through STUN can only be used to communicate with STUN and cannot be shared with other devices for data transmission.

After gaining a complete understanding of NAT traversal in WebRTC, we can proceed to complete the WebRTC connection process. Since we have delved deep into NAT traversal, we are now able to establish connections on the internet. However, WebRTC is not just about establishing a transport channel but also involves the exchange of audio and video media descriptions using the SDP protocol. SDP is a text-based protocol in the format of <type>=<value>. The Offer/Answer/RTCSessionDescription that we will be using carries the type of SDP, such as { type: "offer"/"answer"/"pranswer"/"rollback", sdp: "..." }. For our current purpose of establishing a connection and a transport channel, we mainly focus on the process of establishing the connection.

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

So at this point, we need to create a link, it seems very simple to initiate the process. Let's assume we have two clients, `A` and `B`. Client `A` creates an `Offer` using `createOffer`, sets it as the local description using `setLocalDescription`, and then sends the `Offer` to target client `B` via the signaling server.

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

Once client `B` receives the `Offer`, it can decide whether to accept it based on the current connection status. If accepted, the received `Offer` is set as the remote description using `setRemoteDescription`. An `answer` is then created using `createAnswer` and set as the local description. Finally, the `answer` is sent back to the original client `A` via the signaling server.

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

Once client `A` receives the response from client `B`, if the remote description is not set, it will be set as such using `setRemoteDescription`, completing the SDP negotiation process.

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

Actually, we can pay attention to the fact that when creating an `Offer` and an `Answer`, there are still `onicecandidate` event callbacks. This is actually the process of `ICE` candidate changes. We can obtain the current candidate through `event.candidate` and then promptly forward it to the target client through the signaling server. Upon receiving it, the target client adds the candidate using `addIceCandidate`, thereby completing the exchange of `ICE` candidates. Here, we need to note that we need to forward `ICE` promptly. Therefore, we don't need to pay attention to the timing, but actually, the timing is already clearly defined in the specification. The collection of candidates' information will not start until `setLocalDescription`.

```js
// packages/webrtc/client/core/instance.ts
private onReceiveIce = async (params: SocketEventParams["FORWARD_ICE"]) => {
  const { ice, origin } = params;
  console.log("Receive ICE From:", origin, ice);
  await this.connection.addIceCandidate(ice);
};
```

So, this concludes the process of our connection negotiation, and the actual establishment of the `P2P` channel relies heavily on the exchange of `ICE (Interactive Connectivity Establishment)`. `ICE` candidates describe the protocols and routes required for `WebRTC` to communicate with remote devices. When initiating a `WebRTC P2P` connection, each endpoint typically proposes many candidate connections until they agree on what they consider the best connection, and then `WebRTC` uses the detailed information of that candidate to initiate the connection. `ICE` is closely related to `STUN`, and we have already understood the process of `NAT` traversal earlier. Next, let's take a look at the data structure for the exchange of `ICE` candidates. `ICE` candidates are actually `RTCIceCandidate` objects, and this object contains a lot of information, but it actually has a `toJSON` method, so the exchanged data only includes `candidate`, `sdpMid`, `sdpMLineIndex`, and `usernameFragment`, and these exchanged data will be reflected in the `candidate` field. Therefore, we focus on the significance represented by these four fields.

* `candidate`: A string describing the attributes of a candidate, for example `candidate:842163049 1 udp 1677729535 101.68.35.129 24692 typ srflx raddr 0.0.0.0 rport 0 generation 0 ufrag WbBI network-cost 999`. The candidate string specifies the network connection information for the candidate. These properties are separated by single space characters and arranged in a specific order. If the candidate is an empty string, it means that the end of the candidate list has been reached, and this candidate is referred to as the candidate end marker.
  * `foundation`: The identifier of the candidate, used to uniquely identify an `ICE` candidate. Example: `4234997325`.
  * `component`: Whether the candidate belongs to the `RTP:1` or `RTCP:2` protocol. Example: `1`.
  * `protocol`: The transport protocol used by the candidate, `udp/tcp`. Example: `udp`.
  * `priority`: The priority of the candidate, the higher the value, the higher the priority. Example: `1677729535`.
  * `ip`: The IP address of the candidate. Example: `101.68.35.129`.
  * `port`: The port number of the candidate. Example: `24692`.
  * `type`: The type of the candidate. Example: `srflx`.
    * `host`: The IP address is the actual public address of the device or the local device address.
    * `srflx`: the public IP address on the WAN side of the NAT gateway collected through STUN or TURN.
    * `prflx`: the binding allocated by NAT when sending STUN requests to represent the candidate peer anonymously, which can be obtained in the subsequent stage of ICE.
    * `relay`: relay candidate obtained through TURN server's public relay address.
  * `raddr`: The remote address of the candidate, indicating the peer address when establishing a connection between this candidate. Example: `0.0.0.0`.
  * `rport`: The remote port of the candidate, indicating the peer port when establishing a connection between this candidate. Example: `0`.
  * `generation`: ICE generation of the candidate, used to distinguish candidates generated at different times. Example: `0`.
  * `ufrag`: The ICE identifier of the candidate, used for authentication and matching in the ICE process. Example: `WbBI`.
  * `network-cost`: The network cost of the candidate, lower cost values indicate a better network path. Example: `999`.
* `sdpMid`: Used to identify the unique identifier of the `SDP` media for media description. Example: `sdpMid: "0"`. If the media description is not available, it is an empty string.
* `sdpMLineIndex`: The index of the media description. Example: `sdpMLineIndex: 0`. It is `null` if the media description is not available.
* `usernameFragment`: Used to identify the unique identifier of the ICE session. Example: `usernameFragment: "WbBI"`.

Once the connection is established, we can observe whether `WebRTC` has been successfully established through the console. In the case of an intranet, the `ICE` candidate information is roughly as follows, and we can determine the actual address of the connection by observing the `IP`. There is a difference between `IPv4` and `IPv6`.

```
ICE Candidate pair: :60622 <=> 192.168.0.100:44103
ICE Candidate pair: :55305 <=> 2408:8240:e12:3c45:f1ba:c574:6328:a70:45954
```

If it is in an `AP` isolated environment, which means we cannot directly access the peer through the `192.168.x.x` domain, the `STUN` server comes into play. It acts as a `NAT` traversal, allowing us to observe that the `IP` address is a public address and identical, but the port numbers are different. We can also understand it as our data packets making a round trip through the public network and returning to the local network, similar to completing a network loop.

```
ICE Candidate pair: 101.68.35.129:25595 <=> 101.68.35.129:25596
```

The other day while working on something, I suddenly thought of a question. Now that it's the era of `IPv6` and `STUN` servers actually support `IPv6`, if all our devices have globally unique public `IPv6` addresses, wouldn't that enable `P2P` connectivity, thus truly creating the internet? So, I tested the `IPv6` connection with a friend, as mobile devices usually have actual `IPv6` addresses assigned. We could first test it on the mobile phone, by visiting `test-ipv6` to obtain the public `IPv6` address of the phone and comparing it with the detailed information in the phone. With `IPv6`, any address starting with `2/3` can be considered a public address, and those starting with `fe80` are local link addresses. Here, we can use `Netcat` or the commonly used `nc` command to test it. On a mobile device, we can use `Termux` and install `netcat-openbsd` using a package manager.

```bash
# Device `A` listening
$ nc -vk6 9999   
# Device `B` connecting
$ nc -v6 ${ip} 9999 
```

The testing here is quite interesting. The router in my house has enabled IPv6 and disabled the standard but community-provided NAT6 solution. It is using the Native approach to obtain the IPv6 prefix. However, no matter how hard I try, I can't connect my computer to my phone. In fact, even if my computer doesn't have a public IP address and only my phone does, I should be able to initiate a connection request from the computer to the phone. Unfortunately, I still can't establish a connection. However, using 'ping6' does work, so in reality, the addressing is successful, but the connection requests are being intercepted. Later, I tried to start an HTTP service on the device, but still couldn't establish a direct connection. Perhaps there are some limitations in place, such as the requirement for UDP packets to be sent from a specific port on this device before it can receive packets with public IP addresses.

Later, I tried connecting with my friend's phone. I have a China Unicom SIM card and my friend has a China Telecom SIM card. I can connect to my friend, but my friend can't connect directly to me, even though both of our IPv6 addresses start with '2' and are public. We suspect that the issue may be due to the operators restricting the ports, so we kept trying to establish a connection by switching ports, but still couldn't establish a direct connection.

Finally, I tested by switching to a China Telecom SIM card. At this point, both my friend and my computer can directly connect to my phone using the IPv6 address assigned by China Telecom. This is quite puzzling. Another friend with China Unicom can also connect directly. Therefore, it seems that in the domestic network environment, the regional aspect is quite crucial.

After that, I tested 'P2P' connections with several friends because if at least one of the devices has a public IP, then the probability of direct 'P2P' connection is high. Therefore, the success rate of connections through WebRTC is still quite good, not as low as we initially thought. However, our main scenario is still local network transmission, and we will leave a field for entering the peer's ID in the project for cross-network segment connections.

### Communication
After successfully establishing a connection, we can initiate the transmission channel related to the Peer-To-Peer RTCDataChannel API. The `createDataChannel` method can create a new channel linked to the remote peer for transmitting various types of data, such as images, file transfers, text chat, game update packets, and more. We can create the channel when the RTCPeerConnection object is instantiated, and then wait for the successful link establishment. Similarly, `createDataChannel` also has many configurable parameters.

- `label`: A readable channel name, not exceeding 65,535 bytes.
- `ordered`: Ensures transmission sequence, default is `true`.
- `maxPacketLifeTime`: Maximum number of milliseconds that the channel attempts to transmit a message, set to `null` means no limit, default is `null`.
- `maxRetransmits`: Maximum number of retransmissions the channel attempts to transmit a message, set to `null` means no limit, default is `null`.
- `protocol`: Subprotocol used by the channel, set to `null` means no limit, default is `null`.
- `negotiated`: Whether the channel is negotiated, `true` means the channel is negotiated, `false` means the channel is non-negotiated, default is `false`.
- `id`: Unique identifier for the channel, set to `null` means no limit, default is `null`.

As mentioned earlier, WebRTC aims to achieve relatively reliable data transmission through UDP, similar to how QUIC seeks a balance between reliability and speed. Here, we set `ordered` to `true` and specify the maximum transmission attempts. It is important to note that the final message event binding is done after the `ondatachannel` event, which is triggered when the channel is truly established, allowing information transfer. Furthermore, when `negotiated` is set to `true`, `id` must be set, establishing two-way communication through the `id`, rendering the need for specifying the `ondatachannel` event redundant, and we can directly bind event callbacks on the `channel`.

```js
// packages/webrtc/client/core/instance.ts
const channel = connection.createDataChannel("FileTransfer", {
  ordered: true, // Ensures transmission sequence
  maxRetransmits: 50, // Maximum number of retransmissions
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

So once the channel has been created, we currently only need to focus on the most basic two methods for now. One is the `channel.send` method, which can be used to send data, such as plain text, `Blob`, `ArrayBuffer`, etc. and similarly the `channel.onmessage` event can also receive the same data types. Next, we will use these two methods to complete the transmission of text and files.  

Now, let's implement the simplest transmission. First, we need to define the basic data types for transmission. Since we actually only distinguish between two types of data, which are `Text/Blob` data, we need to make basic judgments on these two types of data, and then respond differently according to the different types. Of course, we can also design our own data structure/protocol, for example, using `Uint8Array` to construct the first `N` bytes of `Blob` to represent data types, `id`, sequence number, etc., and then carry the data content. In this way, we can also assemble and transmit `Blob` directly. However, here we will keep it simple, mainly dealing with the transmission of single files.

```js
export type ChunkType = Blob | ArrayBuffer;
export type TextMessageType =
  | { type: "text"; data: string }
  | { type: "file"; size: number; name: string; id: string; total: number }
  | { type: "file-finish"; id: string };
```

So, we encapsulate the methods for sending text and files. As we can see, when sending a file, we first send a file information message, and then send the file content, so that it can be assembled on the receiving end. There are two points to note here. For large files, we need to split them before sending. When negotiating `SCTP`, there will be a `maxMessageSize` value, which represents the maximum number of bytes that can be sent each time the `send` method is called, usually a size of `256KB`. `MDN`'s `WebRTC_API/Using_data_channels` describes this issue. Another point to note is the buffer. Since sending a large file will easily occupy a large amount of the buffer and is not conducive to our tracking of the sending progress, we also need to use the `onbufferedamountlow` event to control the buffer's sending state.

```js
// packages/webrtc/client/components/modal.tsx
const onSendText = () => {
  const str = TSON.encode({ type: "text", data: text });
  if (str && rtc.current && text) {
    rtc.current?.send(str);
    setList([...list, { type: "text", from: "self", data: text }]);
  }
};
```

```javascript
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

So in the end, all we need to do is to assemble the content into an array when receiving and assemble it into a `Blob` for download when calling for the download. Of course, since we are currently sending single files, which means no descriptive information is carried when sending file chunks, we cannot send other content when receiving chunks.

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

Later there was a supplement to the multi-file transmission solution. The specific idea is to construct an `ArrayBuffer`, where the first `12` bytes represent the file `ID` to which the current block belongs, and then use `4` bytes, that is, `32` bits to represent the sequence number of the current block, and the rest of the content is used as the actual content of the file block. Then, it is possible to send blocks of different files during the file transmission process, and then the receiving end can assemble the `Blob` by using the stored `ID` and sequence number. The idea is consistent with the subsequent `WebSocket` communication part, so here I will just describe the method of assembling the `ArrayBuffer`.

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
When `WebRTC` fails to successfully traverse `NAT`, if you still need to send data over the public network through `TURN` forwarding, then it's better to directly use `WebSocket` for transmission. `WebSocket` is also a full-duplex channel, and in non-`AP` isolated scenarios, we can also directly deploy it on routers for data transmission between local area networks.

### Connection
When using `WebSocket` for transmission, we directly rely on the server to forward all data. I wonder if everyone has noticed that the connection process of `WebRTC` is actually quite complicated and relatively difficult to manage. This is partly because establishing a connection involves communication links from multiple parties, including client `A`, signaling server, `STUN` server, and client `B`. If we use `WebSocket`, we won't have to manage so many connections from different parties. Each client only needs to manage its own connection with the server, similar to our `HTTP` model, which is a `Client/Server` structure.

```
             WebSocket

             /      \ 
     DATA   /        \   DATA
           /          \

      Client           Client
```

At this point, in the server-side of `WebSocket`, we still need to define some events. Unlike `WebRTC`, we only need to define one room, and all states can be directly managed on the server. For example, whether the connection is successful, whether data is being transmitted, and so on. In the `WebRTC` implementation, we must put this implementation on the client side because the connection status is actually directly connected to the peer client, and it's not very easy to manage the entire state in real time on the server, unless we consider latency or implement heartbeats.

Similarly, here on the server, we define `JOIN_ROOM` to join the room, and `LEAVE_ROOM` to leave the room. The management process here is basically the same as `WebRTC`.


```js
// packages/websocket/server/index.ts
const authenticate = new WeakMap<ServerSocket, string>();
const room = new Map<string, Member>();
const peer = new Map<string, string>();

socket.on(CLINT_EVENT.JOIN_ROOM, ({ id, device }) => {
  // Verification
  if (!id) return void 0;
  authenticate.set(socket, id);
  // Room notification message
  const initialization: SocketEventParams["JOINED_MEMBER"]["initialization"] = [];
  room.forEach((instance, key) => {
    initialization.push({ id: key, device: instance.device });
    instance.socket.emit(SERVER_EVENT.JOINED_ROOM, { id, device });
  });
  // Join room
  room.set(id, { socket, device, state: CONNECTION_STATE.READY });
  socket.emit(SERVER_EVENT.JOINED_MEMBER, { initialization });
});

const onLeaveRoom = () => {
  // Verification
  const id = authenticate.get(socket);
  if (id) {
    const peerId = peer.get(id);
    peer.delete(id);
    if (peerId) {
      // Reset status
      peer.delete(peerId);
      updateMember(room, peerId, "state", CONNECTION_STATE.READY);
    }
    // Exit room
    room.delete(id);
    room.forEach(instance => {
      instance.socket.emit(SERVER_EVENT.LEFT_ROOM, { id });
    });
  }
};

socket.on(CLINT_EVENT.LEAVE_ROOM, onLeaveRoom);
socket.on("disconnect", onLeaveRoom);
```

Next, when establishing a connection, we need to handle the `SEND_REQUEST` to initiate a connection request, `SEND_RESPONSE` to respond to a connection request, `SEND_MESSAGE` to send a message, and `SEND_UNPEER` to send a disconnect request. Because the status is managed by the server here, we can immediately respond to the other party's busy status and directly notify the initiating party using a callback function.

```js
// packages/websocket/server/index.ts
socket.on(CLINT_EVENT.SEND_REQUEST, ({ origin, target }, cb) => {
  // Verification
  if (authenticate.get(socket) !== origin) return void 0;
  // Forward `Request`
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
```

```javascript
socket.on(CLINT_EVENT.SEND_RESPONSE, ({ origin, code, reason, target }) => {
  // Verification
  if (authenticate.get(socket) !== origin) return void 0;
  // Forward the `Response`
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
  // Verification
  if (authenticate.get(socket) !== origin) return void 0;
  // Forward the `Message`
  const targetSocket = room.get(target)?.socket;
  if (targetSocket) {
    targetSocket.emit(SERVER_EVENT.FORWARD_MESSAGE, { origin, message, target });
  }
});

socket.on(CLINT_EVENT.SEND_UNPEER, ({ origin, target }) => {
  // Verification
  if (authenticate.get(socket) !== origin) return void 0;
  // Process its own status
  peer.delete(origin);
  updateMember(room, origin, "state", CONNECTION_STATE.READY);
  // Verification
  if (peer.get(target) !== origin) return void 0;
  // Forward the `Unpeer`
  const targetSocket = room.get(target)?.socket;
  if (targetSocket) {
    // Process the `Peer` status
    updateMember(room, target, "state", CONNECTION_STATE.READY);
    peer.delete(target);
    targetSocket.emit(SERVER_EVENT.FORWARD_UNPEER, { origin, target });
  }
});
```

### Communication
Previously, we implemented single-file transmission using `WebRTC`. Now, let's implement the transmission of multiple files. This involves some operations with `Buffer`, so let's first understand the concepts and relationships between `Unit8Array`, `ArrayBuffer`, and `Blob`.

- `Uint8Array`: `Uint8Array` is an array type used to represent 8-bit unsigned integers. Similar to `Array`, but its elements are integers fixed in the range of `0` to `255`, meaning each value can store an 8-bit unsigned integer (byte). `Uint8Array` is commonly used for handling binary data.
- `ArrayBuffer`: `ArrayBuffer` is an object used to represent a generic, fixed-length binary data buffer. It provides a way to store and manipulate binary data in JavaScript, but cannot directly access or manipulate the data itself. `ArrayBuffer = Uint8Array.buffer`.
- `Blob`: `Blob` is an object used to represent binary data. It can convert arbitrary data into binary data and store it in `Blob`. `Blob` can be seen as an extension of `ArrayBuffer` and can contain any type of data, such as images, audio, or other files. It is commonly used for handling and transmitting files in web applications. `Blob = new Blob([ArrayBuffer])`.

The overall approach seems clear. If we create a custom protocol where the first 12 bytes represent the file ID of the current block, and then use 4 bytes (32 bits) to represent the sequence number of the current block, with the remaining content as the actual content of the file block, then we can directly transmit multiple files without waiting for one file to finish before transmitting the next. However, it seems a bit complicated, involving a lot of byte operations. So, we can try to find a way to achieve our goal of carrying information while transmitting file blocks, so that we can know which ID and sequence the current block belongs to.

So it's easy to think that binary files can actually be represented by `Base64`. This way, we can directly transmit pure text. Of course, the disadvantage of using `Base64` for transmission is also very obvious. `Base64` encodes every `3` bytes of data as `4` characters, and the encoded data usually increases about `1/3` in size compared to the original binary data. So, in the actual transmission process, we can also add a compression program, such as `pako`, to offset some of the additional transmission costs in terms of transmitted byte count. Actually, it's also because `WebSocket` is based on `TCP`, and the maximum segment size of `TCP` is usually `1500` bytes, which is the standard `MTU` widely used on Ethernet. So, the transmission size is not so strictly limited. However, if using `WebRTC`, the size of individual transmission fragments is relatively small. Once we convert to `Base64`, the transmission size will increase, which may lead to problems. Therefore, we will leave the implementation of multi-file transmission using our custom protocol to `WebRTC`. Here, we will directly use `Base64` for transmission.

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

Next is our regular operation. First, we need to send the file in chunks. Here, because we are sending pure text files, there is no need to handle the data differences of `Text/Buffer`. We just need to send it directly, and the overall process is similar to `WebRTC`.

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
```

```javascript
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

In the message receiving end, we have changed the strategy because the current data is pure text carrying a lot of data. So, for file chunking, we have greater control. Therefore, we adopt a client-request multi-file slicing strategy. Specifically, when `A` sends a file to `B`, `B` requests the next file chunk it wants from `A`. When `A` receives the request, it slices the file and sends it to `B`. After the file chunk is transferred, the next request is made, and this continues until the entire file is transferred. For each chunk, we include the file's ID, sequence number, and total chunk count to prevent confusion when transferring multiple files. Both ends' file transfer progress is completely synchronized and won't be affected by differences in buffer areas, ensuring consistent progress on both ends.

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

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
http://v6t.ipip.net/
https://icetest.info/
https://www.stunprotocol.org/
https://global.v2ex.co/t/843359
https://webrtc.github.io/samples/
https://bford.info/pub/net/p2pnat/
https://blog.p2hp.com/archives/11075
https://zhuanlan.zhihu.com/p/86759357
https://zhuanlan.zhihu.com/p/621743627
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