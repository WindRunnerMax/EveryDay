# ifconfig命令
`ifconfig`代表`interface configuration`，其用于查看和更改系统上网络接口的配置。

## 语法

```shell
ifconfig [-a] [-v] [-s] <interface> [[<AF>] <address>]
  [add <address>[/<prefixlen>]]
  [del <address>[/<prefixlen>]]
  [[-]broadcast [<address>]]  [[-]pointopoint [<address>]]
  [netmask <address>]  [dstaddr <address>]  [tunnel <address>]
  [outfill <NN>] [keepalive <NN>]
  [hw <HW> <address>]  [mtu <NN>]
  [[-]trailers]  [[-]arp]  [[-]allmulti]
  [multicast]  [[-]promisc]
  [mem_start <NN>]  [io_addr <NN>]  [irq <NN>]  [media <type>]
  [txqueuelen <NN>]
  [[-]dynamic]
  [up|down] ...
```

## 参数
* `(none), -a`: 显示所有网络接口的信息，即使它们已关闭。
* `-s`: 以与命令`netstat -i`相同的格式显示简短列表。
* `-v`: 详细模式，显示某些错误情况的详细信息。
* `interface`: 接口名称，通常是驱动程序名称，后跟一个单元号，例如第一个以太网接口的`eth0`，如果内核支持别名接口，则可以为`eth0`的第一个别名使用`eth0:0`指定它们，可以使用它们来分配第二个地址，要删除别名接口，可以使用`ifconfig eth0：0 down`，注意如果删除第一个(主接口)，则对于每个范围即具有地址/网络掩码组合的同一网络，所有别名都将被删除。
* `up`: 该标志导致接口被激活，如果为接口分配了地址，则隐式指定。
* `down`: 该标志导致该接口的驱动程序被关闭。
* `[-]arp`: 在此接口上启用(指定了`-`前缀则禁用)`ARP`协议的使用。
* `[-]promisc`: 启用(指定了`-`前缀则禁用)接口的混杂模式，如果启用混杂模式，接口将接收网络上的所有数据包。
* `[-]allmulti`: 启用(指定了`-`前缀则禁用)全组播模式，启用组播模式后，该接口将接收网络上所有的组播报文。
* `metric N`: 此参数设置接口度量，接口使用该度量做出路由决策，`N`必须是介于`0`和`4294967295`之间的整数。
* `mtu N`: 该参数用于设置接口的最大传输单元，该设置用于限制接口传输的最大数据包大小。
* `dstaddr address`: 为点到点链路(如`PPP`)设置远程`IP`地址，此关键字现在已过时，请改用`pointopoint`关键字。
* `netmask address`: 设置接口的`IP`网络掩码，该值默认为通常的`A`、`B`或`C`类网络掩码(从接口`IP`地址派生)，但它可以设置为任何值。
* `add address/prefixlen`: 在接口上添加`IPv6`地址。
* `del address/prefixlen`: 从接口移除`IPv6`地址。
* `tunnel aa.bb.cc.dd`: 创建一个新的`SIT (IPv6-in-IPv4)`设备，通过隧道传送到给定的目的地。
* `irq address`: 设置此设备使用的中断线，并非所有设备都可以动态更改其`IRQ`设置。
* `io_addr address`: 在此设备的`I/O`空间中设置起始地址。
* `mem_start address`: 设置此设备使用的共享内存的起始地址，仅少数设备需要此功能。
* `media type`: 设置设备要使用的物理端口或介质类型，并非所有设备都可以更改此设置，并且某些设备可以更改其支持的值，类型的典型值是`10base2`(细缆网)、`10baseT`(双绞线`10 Mbps`以太网)、`AUI`外部收发器等，`auto`的特殊介质类型告诉驱动程序自动感知介质，同样并非所有驱动程序都可以执行此操作。
* `[-]broadcast [address]`: 如果指定了地址参数，则将为此接口设置协议广播地址，否则它将设置(指定了`-`前缀则清除)接口的`IFF_BROADCAST`标志。
* `[-]pointopoint [address]`: 这个关键字启用了接口的点对点模式，这意味着它是两台机器之间的直接链接，没有其他人监听它，如果还提供了`address`参数，请设置链接另一端的协议地址，就像过时的`dstaddr`关键字一样，否则，设置或清除接口的`IFF POINTOPOINT`标志。
* `hw class address`: 如果设备驱动程序支持此操作，则设置此接口的硬件地址，关键字之后必须是硬件类的名称以及与硬件地址等效的可打印`ASCII`。当前支持的硬件类别包括以太`ether (Ethernet)`、`ax25 (AMPR AX.25)`、`ARCnet and netrom (AMPR NET/ROM)`。
* `multicast`: 在接口上设置多播标志，由于驱动程序自己会正确设置该标志，因此通常不需要这样做。
* `address`: 分配给该接口的`IP`地址。
* `txqueuelen length`: 设置设备发送队列的长度，对于具有较高延迟的较慢设备(例如通过调制解调器或`ISDN`进行的连接)将其设置为较小的值非常有用，以防止快速的批量传输过多地干扰诸如`telnet`之类的交互式通信。

## 硬体类型 <HW>
`loop (Local Loopback)`、`slip (Serial Line IP)`、`cslip (VJ Serial Line IP)`、`slip6 (6-bit Serial Line IP)`、`cslip6 (VJ 6-bit Serial Line IP)`、`adaptive (Adaptive Serial Line IP)`、`ash (Ash)`、`ether (Ethernet)`、`ax25 (AMPR AX.25)`、`netrom (AMPR NET/ROM)`、`rose (AMPR ROSE)`、`tunnel (IPIP Tunnel)`、`ppp (Point-to-Point Protocol)`、`hdlc ((Cisco)-HDLC)`、`lapb (LAPB)`、   `arcnet (ARCnet)`、`dlci (Frame Relay DLCI)`、`frad (Frame Relay Access Device)`、`sit (IPv6-in-IPv4)`、`fddi (Fiber Distributed Data Interface)`、`hippi (HIPPI)`、`irda (IrLAP)`、`ec (Econet)`、`x25 (generic X.25)`、`eui64 (Generic EUI-64)`



## 地址族 <AF>
`unix (UNIX Domain)`、`inet (DARPA Internet)`、`inet6 (IPv6)`、`ax25 (AMPR AX.25)`、`netrom (AMPR NET/ROM)`、`rose (AMPR ROSE)`、`ipx (Novell IPX)`、`ddp (Appletalk DDP)`、`ec (Econet)`、`ash (Ash)`、`x25 (CCITT X.25)`


## 示例

显示网络设备信息。

```shell
ifconfig
```

启动关闭指定网卡。

```shell
ifconfig eth0 down
ifconfig eth0 up
```

为网卡配置和删除`IPv6`地址。

```shell
ifconfig eth0 add 33ffe:3240:800:1005::2/ 64
ifconfig eth0 del 33ffe:3240:800:1005::2/ 64
```

修改`MAC`地址，需要首先关闭网卡并修改`MAC`地址，之后再开启网卡。

```shell
ifconfig eth1 hw ether 00:1D:1C:1D:1E
ifconfig eth1 up
```

为网卡配置`IP`地址，并加上子掩码以及广播地址。

```shell
ifconfig eth0 192.168.1.56 netmask 255.255.255.0 broadcast 192.168.1.255
```

启用和关闭`ARP`协议。

```shell
ifconfig eth0 arp
ifconfig eth0 -arp
```

设置最大传输单元`MTU`。

```shell
ifconfig eth0 mtu 1500 
```



## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.computerhope.com/unix/uifconfi.htm
https://www.runoob.com/linux/linux-comm-ifconfig.html
https://www.geeksforgeeks.org/ifconfig-command-in-linux-with-examples/
```