# 初探富文本之CRDT协同实例
在前边初探富文本之`CRDT`协同算法一文中我们探讨了为什么需要协同、分布式的最终一致性理论、偏序集与半格的概念、为什么需要有偏序关系、如何通过数据结构避免冲突、分布式系统如何进行同步调度等等，这些属于完成协同所需要了解的基础知识，实际上当前有很多成熟的协同实现，例如`automerge`、`yjs`等等，本文就是关注于以`yjs`为`CRDT`协同框架来实现协同的实例。

## 描述
接入协同框架实际上并不是一件简单的事情，当然相对于接入`OT`协同而言接入`CRDT`协同已经是比较简单的了，因为我们只需要聚焦于数据结构的使用就好，而不需要对变换有过多的关注。当前我们更加关注的是`Op-based CRDT`，本文所说的`CRDT`也是特指的`Op-based CRDT`，毕竟`State-baed CRDT`需要将全量数据进行传输，每次都要完整传输状态来完成同步让它比较难变成通用的解决方案。因此与`OT`算法一样，我们依然需要`Operation`，在富文本领域，最经典的`Operation`有`quill`的`delta`模型，通过`retain`、`insert`、`delete`三个操作完成整篇文档的描述与操作，还有`slate`的`JSON`模型，通过`insert_text`、`split_node`、`remove_text`等等操作来完成整篇文档的描述与操作。假如此时是`OT`的话，接下来我们就要聊到变换`Transformation`了，但是使用`CRDT`算法的情况下，我们的关注点变了，我们需要做的是关注于如何将我们现在的数据结构转换为`CRDT`框架的数据结构，比如通过框架提供的`Array`、`Map`、`Text`等类型构建我们自己的`JSON`数据，并且我们的`Op`也需要映射到对框架提供的数据结构进行的操作，这样框架便可以帮我们进行协同，当框架完成协同之后把框架的数据结构的改变返回，此时我们需要再将这部分改变映射到我们自己的`Op`，然后我们只需要在本地应用这些远程同步并在本地转换的`Op`，就可以做到协同了。

上边这个数据转换听起来是不是有点耳熟，在前边初探富文本之`OT`协同实例中，我们介绍了`json0`，我们也提到了一个可行的操作，我们让变换`Transformation`这部分让`json0`去做，我们需要关注的是从我们自己定义的数据结构转换到`json0`，在`json0`进行变换操作之后我们同样地将`Op`转换后应用到我们本地的数据就好。虽然原理是完全不同的，但是我们在已有成熟框架的情况下似乎并不需要关注这点，我们更侧重于使用，实际上在使用起来是很像的。此时假设我们有一个自研的思维导图功能需要实现协同，而保存的数据结构都是自定义的，没有直接可以调用的实现方案，我们就需要进行转换适配，那么如果使用`OT`的话，并且借助`json0`做变换，那么我们需要做的是把`Op`转换为`json0`的`Op`，发送的数据也将会是这个`json0`的`Op`，那么如果直接使用`CRDT`的话，我们更像是通过框架定义的数据结构将`Op`应用到数据结构上，发送的数据是框架定义的数据，类似于将`Op`应用到数据结构上了，其他的操作都由框架给予完整的支持了。实际上通过框架提供的例子后，接入`CRDT`协同就主要是理解并且实现的问题了，这样就有一个大体的实现方向了，而不是毫无头绪不知道应该从哪里开始做协同。另外还是那个宗旨，合适的才是最好的，要考虑到实现的成本问题，没有必要硬套数据结构的实现，`OT`有`OT`的优点，`CRDT`有`CRDT`的优点，`CRDT`这类方法相比`OT`还比较年轻，还是在不断发展过程中的，实际上有些问题例如内存占用、速度等问题最近几年才被比较好的解决，`ShareDB`作者在关注`CRDT`不断发展的过程中也说了`CRDTs are the future`。此外从技术上讲，`CRDT`类型是`OT`类型的子集，也就是说，`CRDT`实际上是不需要转换函数的`OT`类型，因此任何可以处理这些`OT`类型的东西也应该能够使用`CRDT`。

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
import { Doc, Map as YMap } from "yjs";
import { WebrtcProvider } from "y-webrtc";

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

export default new Connection();
```

## Quill
在运行富文本的实例`Quill`之前，我们不妨先来简单讨论一下是如何在富文本上应用的`CRDT`，在前文`CRDT`协同算法中主要讨论的是分布式与`CRDT`的原理，并没有涉及具体的富文本该如何设计数据结构，那么在这里我们简单讨论下`yjs`在富文本上应用`CRDT`的设计。看之前描述那一节的时候我们可能会产生一些有趣的想法，或许我们可以这么来做，可以通过底层来实现`OT`，之后在上层封装一层数据结构供外部使用的方式，从而对外看起来像是`CRDT`。当然原理上是不会这么做的，因为这样失去了拥抱`CRDT`的意义，可能会有部分借鉴实现的思路，但是不会直接这么做的。

首先我们可以回忆一下`CRDT`在集合这个数据结构上的设计，我们主要考虑到了集合的添加和删除如何完整的保证交换律、结合律、幂等律，那么现在在富文本的实现上，我们不仅需要考虑到插入和删除，需要考虑到顺序的问题，并且我们还需要保证`CCI`，即最终一致性、因果一致性、意图一致性，当然还需要考虑到`Undo/Redo`、光标同步等相关的问题。

那么我们首先来看看如何保证插入数据的顺序，对于`OT`而言是通过索引得知用户要操作的位置，并且通过变换来确保最终一致性，那么`CRDT`是不需要这么做的，上边也提到过完全靠`OT`的话可能就失去了拥抱`CRDT`的意义，那么如何确保要插入的位置正确呢，`CRDT`不靠索引的话就需要靠数据结构来完成这点，我们可以通过相对位置来完成，例如我们目前有`AB`字符串，此时在中间插入了`C`字符，那么这个字符就需要被标记为在`A`之后，在`B`之前，那么很显然，我们需要为每个字符都分配唯一的`id`，否则我们是无法做到这一点的，当然这块实际上还有优化空间，在这里就先不谈这点，那么由此我们通过相对位置保证了插入的顺序。

接下来我们再看看删除的问题，在前文的`Observed-Remove Set`集合数据结构中我们是可以真正的进行删除操作的，而在这里由于我们是通过相对位置来实现完整的顺序，所以实际上我们是不能够真正地将我们标记的`Item`进行删除的，`Item`可以理解为插入的字符，也就是所谓的软删除。举个例子，目前我们有`AB`字符串，其中一个客户端删除了`B`，另一个客户端同时在`A`与`B`之间增加了`C`，那么此时这两个`Op`同步到了第三个客户端，那么假如增加了`C`这个操作先到并且执行了，再删除了`B`，那么没有问题，可是假设我们先删除了`B`，再增加了`C`，那么这个`C`我们就不能够找到他要插入的位置，因为`B`已经被删除了，我们是要在`A`与`B`之间去插入`C`的，那么这样这个操作就无法执行下去了，由此这样其实就导致了操作不满足交换律，那么这就不能真的作为`CRDT`的数据结构设计了。其实我们可能会想，为什么需要两个位置来保证插入的字符位置，完全可以用`B`的左侧或者`A`的右侧来完成，实际上思考一下这是同样的问题，多个客户端来操作的话假如一个删除了`A`另一个删除了`B`，那么便无论如何也找不到插入的位置了，这是不满足交换律和结合律的操作，就不能作为`CRDT`的实现了。因此为了冲突的解决`yjs`并没有真正的删除`Item`，而是采用了标记的形式，即删除的`Item`会被加入一个`deleted`标记，那么不删除会造成一个明显的问题，空间的占用会无限增长，因此`yjs`引入了墓碑机制，当确认了内容不会再被干涉之后，将对象的内容替换为空的墓碑对象。

上边也提到了冲突的问题，很明显在设计上是存在冲突的问题的，因为`CRDT`实际上并不是完全为了协同编辑的场景而专门设计的，其主要是为了解决分布式场景中的一致性问题，所以在应用到协同编辑的场景中，不可避免地会出现冲突的问题，实际上这个冲突主要是为了集合顺序的引入而导致的，要是不关心顺序，那么自然就不会出现冲突问题了。那么为了使数据能够满足三律，在前文我们引入了一个偏序的概念，但是在协同编辑设计中，使用偏序不能够保证数据同步的正确性和一致性，因为其无法处理一些关键的冲突情况，举一个简单的例子，假设我们此时有`AB`字符串，如果一个客户端在`AB`中加入了`C`，另一个加入了`D`，那么究竟谁在前呢，所以我们需要引入全序的方法，即任意两个`Item`都是可以比较的。那么很明显的，如果我们为每个`Item`附加上时间戳的元信息，便可以引入全序了，但是实际上由于不同的客户端可能具有不同的时钟偏差，网络延迟和时钟不同步等问题也可能导致时间戳不可靠。那么相比之下，逻辑时钟或者逻辑时间戳可以使用更简单和可靠的方式来维护事件的顺序:

* 每次发生本地事件时，`clock = clocl + 1`。
* 每次接收到远程事件时，`clock = max(clock, remoteClock) + 1`。

看起来依旧会有发生冲突的可能，那么我们可以再引入一个客户端的唯一`id`，也就是`clientID`。这种机制看似简单，但实际上使我们获得了数学上性质良好的全序结构，这意味着我们可以在任意两个`Item`之间对比获得逻辑上的先后关系，这对保证`CRDT`算法的正确性相当重要。此外，通过这种方式我们也可以保证因果一致性，假如此时我们有两个操作`a`、`b`如果有因果关系，那么`a.clock`一定大于`b.clock`，这样的得到的顺序一定是满足因果关系的，当然如果没有因果关系，就可以取任意的顺序执行了。举个例子，我们有三个客户端`A`、`B`、`C`以及字符串`SE`，`A`在`SE`中间添加了`a`字符，此时这个操作同步到了`B`，`B`将`a`字符给删除了，假设此时`C`先收到了`B`的删除操作，因为这个操作依赖于`A`的操作，需要进行因果依赖关系的检查，这个操作的逻辑时钟和位移大于`C`本地文档中已经应用的操作的逻辑时钟和位移，需要等待先前的操作被应用后再应用这个操作，当然这并不是在`yjs`中的实现，因为`yjs`不会存在真正的删除操作，并且在删除操作的时候实际上并不会导致时钟的增加，只是增加一个标记，上边这个例子其实可以换个说法，两个相同的插入操作，因为我们是相对位置，所以后一个插入操作是依赖前一个插入操作的，因此就需要因果检查，其实这也是件有意思的事情，当收到在同一个位置编辑的不同客户端操作时候，如果时钟相同就是冲突操作，不相同就是因果关系。

那么由此我们通过`CRDT`数据结构与算法设计解决了最终一致性和因果一致性，对于意图一致性的问题，当不存在冲突的时候我们是能够保证意图的，即插入文档的`Item`的顺序，在冲突的时候我们实际上会比较`clientID`决定究竟谁在前在后，其实实际上无论谁在前还是在后都可以认为是一种乌龙，我们在冲突的时候只保证最终一致性，对于意图一致性则需要做额外的设计才可以实现，在这里就不做过多探讨了。实际上`yjs`还有大量的设计与优化操作，以及基于`YATA`的冲突解决算法等，比如通过双向链表来保存文档结构顺序，通过`Map`为每个客户端保存的扁平的 `Item`数组，优化本地插入的速度而设计的缓存机制(链表的查找`O(N)`与跟随光标的位置缓存)，倾向于`State-based`的删除，`Undo/Redo`，光标同步，压缩数据网络传输等等，还是很值得研究的。

我们再回到富文本的实例`Quill`中，实现的主要功能是在`quill`富文本编辑器中接入协同，并支持编辑光标的同步，该实例的地址是`https://github.com/WindrunnerMax/Collab/tree/master/packages/crdt-quill`，首先简单看一下目录结构(`tree --dirsfirst -I node_modules`):

```
crdt-quill
├── public
│   └── favicon.ico
├── server
│   └── index.ts
├── src
│   ├── client.ts
│   ├── index.css
│   ├── index.ts
│   └── quill.ts
├── package.json
├── rollup.config.js
├── rollup.server.js
└── tsconfig.json
```

依旧简略说明下各个文件夹和文件的作用，`public`存储了静态资源文件，在客户端打包时将会把内容移动到`build`文件夹，`server`文件夹中存储了`CRDT`服务端的实现，在运行时同样会编译为`js`文件放置于`build`文件夹下，`src`文件夹是客户端的代码，主要是视图与`CRDT`客户端的实现，`rollup.config.js`是打包客户端的配置文件，`rollup.server.js`是打包服务端的配置文件，`package.json`与`tsconfig.json`大家都懂，就不赘述了。

`quill`的数据结构并不是`JSON`而是`Delta`，`Delta`是通过`retain`、`insert`、`delete`三个操作完成整篇文档的描述与操作，我们试想一下描述一段字符串的操作需要什么，是不是通过这三种操作就能够完全覆盖了，所以通过`Delta`来描述文本增删改是完全可行的，而且`12`年`quill`的开源可以说是富文本发展的一个里程碑，于是`yjs`是直接原生支持`Delta`数据结构的。

接下来我们看看来看看服务端，这里主要实现是调用了一下`y-websocket`来启动一个`websocket`服务器，这是`y-websocket`给予的开箱即用的功能，也可以基于这些内容进行改写，`yjs`还提供了`y-mongodb-provider`等服务端服务可以使用。后边主要是使用了`express`启动了一个静态资源服务器，因为直接在浏览器打开文件的`file`协议有很多的安全限制，所以需要一个`HTTP Server`。

```js
import { exec } from "child_process";
import express from "express";

// https://github.com/yjs/y-websocket/blob/master/bin/server.js
exec("PORT=3001 npx y-websocket", (err, stdout, stderr) => { // 调用`y-websocket`
  console.log(stdout, stderr);
});

const app = express(); // 实例化`express`
app.use(express.static("build")); // 客户端打包过后的静态资源路径
app.use(express.static("node_modules/quill/dist")); // `quill`静态资源路径
app.listen(3000);
console.log("Listening on http://localhost:3000");
```

在客户端方面主要是定义了一个定义了一个共用的链接，通过`crdt-quill`作为`RoomName`进入组，这里需要链接的`websocket`服务器也就是上边启动的`y-websocket`的`3001`端口的服务。之后我们定义了顶层的数据结构为`YText`数据结构的变化来执行回调，并且将一些信息暴露了出去，`doc`就是这需要使用的`yjs`实例，`type`是我们定义的顶层数据结构，`awareness`意为感知，只要是用来完成实时数据同步，在这里是用来同步光标选区。

```js
import { Doc, Text as YText } from "yjs";
import { WebsocketProvider } from "y-websocket";

class Connection {
  public doc: Doc; // `yjs`实例
  public type: YText; // 顶层数据结构
  private connection: WebsocketProvider; // `WebSocket`链接
  public awareness: WebsocketProvider["awareness"]; // 数据实时同步

  constructor() {
    const doc = new Doc(); // 实例化
    const provider = new WebsocketProvider("ws://localhost:3001", "crdt-quill", doc); // 链接`WebSocket`服务器
    provider.on("status", (e: { status: string }) => {
      console.log("WebSocket", e.status); // 链接状态
    });
    this.doc = doc; // `yjs`实例
    this.type = doc.getText("quill"); // 获取顶层数据结构
    this.connection = provider; // 链接
    this.awareness = provider.awareness; // 数据实时同步
  }

  reconnect() {
    this.connection.connect(); // 重连
  }

  disconnect() {
    this.connection.disconnect(); // 断线
  }
}

export default new Connection();
```

在客户端主要分为了两部分，分别是实例化`quill`的实例，以及`quill`与`yjs`客户端通信的实现。在`quill`的实现中主要是将`quill`实例化，注册光标的插件，随机生成`id`的方法，通过`id`获取随机颜色的方法，以及光标同步的位置转换。在`quill`与`yjs`客户端通信的实现中，主要是完成了对于`quill`与`doc`的事件监听，主要是远程数据变更的回调，本地数据变化的回调，光标同步事件感知的回调。

```js
import Quill from "quill";
import QuillCursors from "quill-cursors";
import tinyColor from "tinycolor2";
import { Awareness } from "y-protocols/awareness.js";
import {
  Doc,
  Text as YText,
  createAbsolutePositionFromRelativePosition,
  createRelativePositionFromJSON,
} from "yjs";
export type { Sources } from "quill";

Quill.register("modules/cursors", QuillCursors); // 注册光标插件

export default new Quill("#editor", { // 实例化`quill`
  theme: "snow",
  modules: { cursors: true },
});

const COLOR_MAP: Record<string, string> = {}; // `id => color`

export const getRandomId = () => Math.floor(Math.random() * 10000).toString(); // 随机生成用户`id`

export const getCursorColor = (id: string) => { // 根据`id`获取颜色
  COLOR_MAP[id] = COLOR_MAP[id] || tinyColor.random().toHexString();
  return COLOR_MAP[id];
};

export const updateCursor = (
  cursor: QuillCursors,
  state: Awareness["states"] extends Map<number, infer I> ? I : never,
  clientId: number,
  doc: Doc,
  type: YText
) => {
  try {
    // 从`Awareness`中取得状态
    if (state && state.cursor && clientId !== doc.clientID) {
      const user = state.user || {};
      const color = user.color || "#aaa";
      const name = user.name || `User: ${clientId}`;
      // 根据`clientId`创建光标
      cursor.createCursor(clientId.toString(), name, color);
      // 相对位置转换为绝对位置 // 选区为`focus --- anchor`
      const focus = createAbsolutePositionFromRelativePosition(
        createRelativePositionFromJSON(state.cursor.focus),
        doc
      );
      const anchor = createAbsolutePositionFromRelativePosition(
        createRelativePositionFromJSON(state.cursor.anchor),
        doc
      );
      if (focus && anchor && focus.type === type) {
        // 移动光标位置
        cursor.moveCursor(clientId.toString(), {
          index: focus.index,
          length: anchor.index - focus.index,
        });
      }
    } else {
      // 根据`clientId`移除光标
      cursor.removeCursor(clientId.toString());
    }
  } catch (err) {
    console.error(err);
  }
};
```

```js
import "./index.css";
import quill, { getRandomId, updateCursor, Sources, getCursorColor } from "./quill";
import client from "./client";
import Delta from "quill-delta";
import QuillCursors from "quill-cursors";
import { compareRelativePositions, createRelativePositionFromTypeIndex } from "yjs";

const userId = getRandomId(); // 本地客户端的`id` 或者使用`awareness.clientID`
const doc = client.doc; // `yjs`实例
const type = client.type; // 顶层类型
const cursors = quill.getModule("cursors") as QuillCursors; // `quill`光标模块
const awareness = client.awareness; // 实时通信感知模块

// 设置当前客户端的信息 `State`的数据结构类似于`Record<string, unknown>`
awareness.setLocalStateField("user", {
  name: "User: " + userId,
  color: getCursorColor(userId),
});

// 页面显示的用户信息
const userNode = document.getElementById("user") as HTMLInputElement;
userNode && (userNode.value = "User: " + userId);

type.observe(event => {
  // 来源信息 // 本地`UpdateContents`不应该再触发`ApplyDelta'
  if (event.transaction.origin !== userId) {
    const delta = event.delta;
    quill.updateContents(new Delta(delta), "api"); // 应用远程数据, 来源
  }
});

quill.on("editor-change", (_: string, delta: Delta, state: Delta, origin: Sources) => {
  if (delta && delta.ops) {
    // 来源信息 // 本地`ApplyDelta`不应该再触发`UpdateContents`
    if (origin !== "api") {
      doc.transact(() => {
        type.applyDelta(delta.ops); // 应用`Ops`到`yjs`
      }, userId); // 来源
    }
  }

  const sel = quill.getSelection(); // 选区
  const aw = awareness.getLocalState(); // 实时通信状态数据
  if (sel === null) { // 失去焦点
    if (awareness.getLocalState() !== null) {
      awareness.setLocalStateField("cursor", null); // 清除选区状态
    }
  } else {
    // 卷对位置转换为相对位置 // 选区为`focus --- anchor`
    const focus = createRelativePositionFromTypeIndex(type, sel.index);
    const anchor = createRelativePositionFromTypeIndex(type, sel.index + sel.length);
    if (
      !aw ||
      !aw.cursor ||
      !compareRelativePositions(focus, aw.cursor.focus) ||
      !compareRelativePositions(anchor, aw.cursor.anchor)
    ) {
      // 选区位置发生变化 设置位置信息
      awareness.setLocalStateField("cursor", { focus, anchor });
    }
  }
  // 更新所有光标状态到本地
  awareness.getStates().forEach((aw, clientId) => {
    updateCursor(cursors, aw, clientId, doc, type);
  });
});

// 初始化更新所有远程光标状态到本地
awareness.getStates().forEach((state, clientId) => {
  updateCursor(cursors, state, clientId, doc, type);
});
// 监听远程状态变化的回调
awareness.on(
  "change",
  ({ added, removed, updated }: { added: number[]; removed: number[]; updated: number[] }) => {
    const states = awareness.getStates();
    added.forEach(id => {
      const state = states.get(id);
      state && updateCursor(cursors, state, id, doc, type);
    });
    updated.forEach(id => {
      const state = states.get(id);
      state && updateCursor(cursors, state, id, doc, type);
    });
    removed.forEach(id => {
      cursors.removeCursor(id.toString());
    });
  }
);
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
https://cloud.tencent.com/developer/article/2081651
```

