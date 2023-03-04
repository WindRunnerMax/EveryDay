# 初探富文本之CRDT协同实例
在前边初探富文本之`CRDT`协同算法一文中我们探讨了为什么需要协同、分布式的最终一致性理论、偏序集与半格的概念、为什么需要有偏序关系、如何通过数据结构避免冲突、分布式系统如何进行同步调度等等，这些属于完成协同所需要了解的基础知识，实际上当前有很多成熟的协同实现，例如`automerge`、`yjs`等等，本文就是关注于以`yjs`为`CRDT`协同框架来实现协同的实例。

## 描述
接入协同框架实际上并不是一件简单的事情，当然相对于接入`OT`协同而言接入`CRDT`协同已经是比较简单的了，因为我们只需要聚焦于数据结构的使用就好，而不需要对变换有过多的关注。当前我们更加关注的是`Op-based CRDT`，本文所说的`CRDT`也是特指的`Op-based CRDT`，毕竟`State-baed CRDT`需要将全量数据进行传输，每次都要完整传输状态来完成同步让它比较难变成通用的解决方案。因此与`OT`算法一样，我们依然需要`Operation`，在富文本领域，最经典的`Operation`有`quill`的`delta`模型，通过`retain`、`insert`、`delete`三个操作完成整篇文档的描述与操作，还有`slate`的`JSON`模型，通过`insert_text`、`split_node`、`remove_text`等等操作来完成整篇文档的描述与操作。假如此时是`OT`的话，接下来我们就要聊到变换`Transformation`了，但是使用`CRDT`算法的情况下，我们的关注点变了，我们需要做的是关注于如何将我们现在的数据结构转换为`CRDT`框架的数据结构，比如通过框架提供的`Array`、`Map`、`Text`等类型构建我们自己的`JSON`数据，并且我们的`Op`也需要映射到对框架提供的数据结构进行的操作，这样框架便可以帮我们进行协同，当框架完成协同之后把框架的数据结构的改变返回，此时我们需要再将这部分改变映射到我们自己的`Op`，然后我们只需要在本地应用这些远程同步并在本地转换的`Op`，就可以做到协同了。

上边这个数据转换听起来是不是有点耳熟，在前边初探富文本之`OT`协同实例中，我们介绍了`json0`，我们也提到了一个可行的操作，我们让变换`Transformation`这部分让`json0`去做，我们需要关注的是从我们自己定义的数据结构转换到`json0`，在`json0`进行变换操作之后我们同样地将`Op`转换后应用到我们本地的数据就好。虽然原理是完全不同的，但是我们在已有成熟框架的情况下似乎并不需要关注这点，我们更侧重于使用，实际上在使用起来是很像的，此时假设我们有一个自研的思维导图功能需要实现协同，而保存的数据结构都是自定义的，没有直接可以调用的实现方案，我们就需要进行转换适配，那么如果使用`OT`的话，并且借助`json0`做变换，那么我们需要做的是把`Op`转换为`json0`的`Op`，发送的数据也将会是这个`json0`的`Op`，那么如果直接使用`CRDT`的话，我们更像是通过框架定义的数据结构将`Op`应用到数据结构上，发送的数据是框架定义的数据，类似于将`Op`应用到数据结构上了，其他的操作都由框架给予完整的支持了。实际上通过框架提供的例子后，接入`CRDT`协同就主要是理解并且实现的问题了，这样就有一个大体的实现方向了，而不是毫无头绪不知道应该从哪里开始做协同。另外还是那个宗旨，合适的才是最好的，要考虑到实现的成本问题，没有必要硬套数据结构的实现，`OT`有`OT`的优点，`CRDT`有`CRDT`的优点，`CRDT`这类方法相比`OT`还比较年轻，还是在不断发展过程中的，实际上有些问题例如内存占用、速度等问题最近几年才被比较好的解决，`ShareDB`作者在关注`CRDT`不断发展的过程中也说了`CRDTs are the future`。此外从技术上讲，`CRDT`类型是`OT`类型的子集，也就是说，`CRDT`实际上是不需要转换函数的`OT`类型，因此任何可以处理这些`OT`类型的东西也应该能够使用`CRDT`。

或许上边的一些概念可能一时间让人难以理解，所以下面的`Counter`与`Quill`两个实例就是介绍了如何使用`yjs`实现协同，究竟如何通过数据结构完成协同的接入工作，当然具体的`API`调用还是还是需要看`yjs`的文档，本文只涉及到最基本的协同操作，所有的代码都在`https://github.com/WindrunnerMax/Collab`中，注意这是个`pnpm`的`workspace monorepo`项目，要注意使用`pnpm`安装依赖。

## Counter
首先我们运行一个基础的协同实例`Counter`，实现的主要功能是在多个客户端可以`+1`的情况下我们可以维护同一份计数器总数，该实例的地址是`https://github.com/WindrunnerMax/Collab/tree/master/packages/crdt-counter`，首先简单看一下目录结构(`tree --dirsfirst -I node_modules`):

```
crdt-counter
├── public
│   ├── favicon.ico
│   └── index.html
├── server
│   └── index.ts
├── src
│   ├── client.ts
│   ├── counter.tsx
│   └── index.tsx
├── babel.config.js
├── package.json
├── rollup.config.js
├── rollup.server.js
└── tsconfig.json
```

先简略说明下各个文件夹和文件的作用，`public`存储了静态资源文件，在客户端打包时将会把内容移动到`build`文件夹，`server`文件夹中存储了`CRDT`服务端的实现，在运行时同样会编译为`js`文件放置于`build`文件夹下，`src`文件夹是客户端的代码，主要是视图与`CRDT`客户端的实现，`babel.config.js`是`babel`的配置信息，`rollup.config.js`是打包客户端的配置文件，`rollup.server.js`是打包服务端的配置文件，`package.json`与`tsconfig.json`大家都懂，就不赘述了。

在前边`CRDT`协同算法实现一文中，我们经常提到的就是无需中央服务器的分布式协同，那么在这个例子中我们就来实现一个`peer-to-peer`的实例。`yjs`提供了一个`y-webrtc`的信令服务器，甚至还有公共的信令服务器可以用，当然可能因为网络的关系这个公共的信令服务器在国内不是很适用。在继续完成协同之前，我们还需要了解一下`WebRTC`以及信令的相关概念。

`WebRTC`是一种实时通信技术，重点在于可以点对点即`P2P`通信，其允许浏览器和应用程序直接在互联网上传输音频、视频和数据流，无需使用中间服务器进行中转。`WebRTC`利用浏览器内置的标准`API`和协议来提供这些功能，并且支持多种编解码器和平台，`WebRTC`可以用于开发各种实时通信应用，例如在线会议、远程协作、实时广播、在线游戏和`IoT`应用等。但是在多级`NAT`网络环境下，`P2P`连接可能会受到限制，简单来说就是一台设备无法直接发现另一台设备，自然也就没有办法进行`P2P`通信，这时需要使用特殊的技术来绕过`NAT`并建立`P2P`连接。

`NAT Network Address Translation`网络地址转换是一种在`IP`网络中广泛使用的技术，主要是将一个`IP`地址转换为另一个`IP`地址，具体来说其工作原理是将一个私有`IP`地址(如在家庭网络或企业内部网络中使用的地址)映射到一个公共`IP`地址(如互联网上的`IP`地址)。当一个设备从私有网络向公共网络发送数据包时，`NAT`设备会将源`IP`地址从私有地址转换为公共地址，并且在返回数据包时将目标`IP`地址从公共地址转换为私有地址。`NAT`可以通过多种方式实现，例如静态`NAT`、动态`NAT`和端口地址转换`PAT`等，静态`NAT`将一个私有`IP`地址映射到一个公共`IP`地址，而动态`NAT`则动态地为每个私有地址分配一个公共地址，`PAT`是一种特殊的动态`NAT`，在将私有`IP`地址转换为公共`IP`地址时，还会将源端口号或目标端口号转换为不同的端口号，以支持多个设备使用同一个公共`IP`地址。`NAT`最初是为了解决`IPv4`地址空间的短缺而设计的，后来也为提高网络安全性并简化网络管理提供了基础。

在互联网上大多数设备都是通过路由器或防火墙连接到网络的，这些设备通常使用网络地址转换`NAT`将内部`IP`地址映射到一个公共的`IP`地址上，这个公共`IP`地址可以被其他设备用来访问，但是这些设备内部的`IP`地址是隐藏的，其他的设备不能直接通过它们的内部`IP`地址建立`P2P`连接。因此，直接进行`P2P`连接可能会受到网络地址转换`NAT`的限制，导致连接无法建立。为了解决这个问题，需要使用一些技术来绕过`NAT`并建立`P2P`连接。另外，`P2P`连接也需要一些控制和协调机制，以确保连接的可靠性和安全性。

信令可以用来解决多级`NAT`环境下的`P2P`连接问题，当两个设备尝试建立`P2P`连接时，可以使用信令服务器来交换网络信息，例如`IP`地址、端口和协议类型等，以便设备之间可以彼此发现并建立连接。当然信令服务器并不是绕过`NAT`的唯一解决方案，`STUN`、`TURN`和`ICE`等技术也可以帮助解决这个问题。信令服务器的主要作用是协调不同设备之间的连接，以确保设备可以正确地发现和通信。在实际应用中，通常需要同时使用多种技术和工具来解决多级`NAT`环境下的`P2P`连接问题。

那么回到`WebRTC`，我们即使是使用了`P2P`的技术，但是不可避免的需要一个信令服务器来交换`WebRTC`会话描述和控制信息。当然这些信息不包括实际通信的数据流本身，而是用于描述和控制这些流的方式和参数，这些数据流本身是通过对等连接在两个浏览器之间直接传输的。主要数据流的通信不经过中央服务器，这就使得`WebRTC`有着低延迟和高带宽等优点，但是同样的因为每个对等点相互连接，不适合单个文档上的大量协作者。

接下来我们要进行数据结构的设计，目前在`yjs`中是没有`Y.Number`这个数据结构的，也就是说`yjs`没有自增自减的操作，这点就与前边`OT`实例不一样了，所以在这里我们需要设计数据结构。网络是不可靠的，我们不能够在本地模拟`+1`的操作，就是说本地先取得值，然后进行`+1`操作之后再把值推到其他的客户端上，这样的设计虽然在本地测试应该是可行的，但是由于网络不可靠，我们不能保证本地取值的时候获得的是最新的值，所以这个方案是不可靠的。

那么我们思考几种方案来实现这一点，有一种可行的方案是类似于我们之前介绍的`CRDT`数据结构，我们可以构造一个集合`Y.Array`，当我们点`+1`的时候，就向集合中`push`一个新的值，这样再取和的时候直接取集合长度即可。

```
Y.Array: [] => +1 => [1] => +1 => [1, 1] => ...
Counter: [1, 1].size = N
```

另一种方案是使用`Y.Map`来完成，当用户加入我们的`P2P`组的时候，我们通过其身份信息为其分配一个`id`，然后这个`id`只记录与自增自己的值，也就是说当某个客户端点击`+1`的时候，操作的只有其`id`对应的数，而不能影响组网内其他的用户的值。

```
Y.Map: {} => +1 => {"id": 1} => +1 => {"id": 2} => ...
Counter: Object.values({"id": 2}).reduce((a, b) => a + b) = N
```

在这里我们使用的是`Y.Map`的方案，毕竟如果是`Y.Array`的话占用资源会是比较大的，当然因为实例中并没有身份信息，每次进入的时候都是会随机分配`id`的，当然这不会影响到我们的`Counter`。此外还有比较重要的一点是，因为我们是直接进行`P2P`通信的，当所有的设备都离线的时候，由于没有设计实际的数据存储机制，所以数据会丢失，这点也是需要注意的。


接下来我们看看代码的实现，首先我们来看看服务端，这里主要实现是调用了一下`y-webrtc-signaling`来启动一个信令服务器，这是`y-webrtc`给予的开箱即用的功能，也可以基于这些内容进行改写，不过因为是信令服务器，除非有着很高的稳定性、定制化等要求，否则直接当作开箱即用的信令服务器就好。后边主要是使用了`express`启动了一个静态资源服务器，因为直接在浏览器打开文件的`file`协议有很多的安全限制，所以需要一个`HTTP Server`。

```js
import { exec } from "child_process";
import express from "express";

// https://github.com/yjs/y-webrtc/blob/master/bin/server.js
exec("PORT=3001 npx y-webrtc-signaling", (err, stdout, stderr) => { // 调用`y-webrtc-signaling`
  console.log(stdout, stderr);
});

const app = express(); // 实例化`express`
app.use(express.static("build")); // 客户端打包过后的静态资源路径
app.listen(3000);
console.log("Listening on http://localhost:3000");
```

在客户端方面主要是定义了一个定义了一个共用的链接，通过`id`来加入我们的`P2P`组，并且还有密码的保护，这里需要链接的信令服务器也就是上边启动的`y-webrtc`的`3001`端口的信令服务。之后我们通过`observe`定义的`Y.Map`数据结构的变化来执行回调，在这里实际上就是将回调过后的整个`Map`数据传回回调函数，然后在视图层进行`Counter`的计算，这里还有一个`transaction.origin`判断是为了防止我们本地的调用触发回调。最后我们定义了一个`increase`函数，在这里我们通过`transact`作为事务来执行`set`操作，因为我们之前的设计只会处理我们当前客户端对应的`id`的那个值，本地的值是可信的，直接自增即可，`transact`最后一个参数也就是上边提到了的`transaction.origin`，可以用来判断事件的来源。

```js
const getRandomId = () => Math.floor(Math.random() * 10000).toString();
export type ClientCallback = (record: Record<string, number>) => void;

class Connection {
  private doc: Doc;
  private map: YMap<number>;
  public id: string = getRandomId(); // 当前客户端生成的唯一`id`
  public counter = 0; // 当前客户端的初始值

  constructor() {
    const doc = new Doc();
    new WebrtcProvider("crdt-example", doc, { // `P2P`组名称 // `Y.Doc`实例
      password: "room-password", // `P2P`组密码
      signaling: ["ws://localhost:3001"], // 信令服务器
    });
    const yMapDoc = doc.getMap<number>("counter"); // 获取数据结构
    this.doc = doc;
    this.map = yMapDoc;
  }

  bind(cb: ClientCallback) {
    this.map.observe(event => { // 监听数据结构变化 // 如果是多层嵌套需要`observeDeep`
      if (event.transaction.origin !== this) { // 防止本地修改时触发
        const record = [...this.map.entries()].reduce( // 获取`Y.Map`定义中的所有数据
          (cur, [key, value]) => ({ ...cur, [key]: value }),
          {} as Record<string, number>
        );
        cb(record); // 执行回调
      }
    });
  }

  public increase() {
    this.doc.transact(() => { // 事务
      this.map.set(this.id, ++this.counter); // 自增本地`id`对应的值
    }, this); // 来源
  }
}
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://docs.yjs.dev/
https://github.com/yjs/yjs
https://github.com/automerge/automerge
https://zhuanlan.zhihu.com/p/425265438
https://zhuanlan.zhihu.com/p/452980520
https://josephg.com/blog/crdts-go-brrr/
https://www.npmjs.com/package/quill-delta
https://josephg.com/blog/crdts-are-the-future/
https://github.com/yjs/yjs/blob/main/INTERNALS.md
```

