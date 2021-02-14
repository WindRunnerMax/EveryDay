# route命令
在计算机网络中，路由器是负责转发网络流量的设备，当数据报到达路由器时，路由器必须确定将其路由到目的地的最佳方法，`route`命令用于查看和更改内核路由表，在不同的系统上，命令语法不同，所以实际时可以查看命令的帮助来确定具体使用方法。

## 语法

```shell
route [-CFvnee]
route [-v] [-A family] add [-net|-host] target [netmask Nm] [gw Gw] 
      [metric N] i [mss M] [window W] [irtt m] [reject] [mod] [dyn] 
      [reinstate] [[dev] If]
route [-v] [-A family] del [-net|-host] target [gw Gw] [netmask Nm] 
      [metric N] [[dev] If]
route [-V] [--version] [-h] [--help]
```

## 参数
* `(none)`: 查看当前所有路由定义。
* `-A family`: 使用指定的地址族，可以使用`route --help`查询支持的地址族，通常支持的地址族有`inet (DARPA Internet)`、`inet6 (IPv6)`、`ax25 (AMPR AX.25)`、`netrom (AMPR NET/ROM)`、`ipx (Novell IPX)`、`ddp (Appletalk DDP)`、`x25 (CCITT X.25)`。
* `-F`: 对内核的`FIB`转发信息库路由表进行操作，这是默认值。
* `-C`: 操作内核的路由缓存。
* `-v`: 输出详细操作。
* `-n`: 显示数字地址，而不是尝试确定符号主机名，如果要确定到名称服务器的路由消失的原因，这将很有用。
* `-e`: 使用`netstat`格式显示路由表，`-ee`将使用路由表中的所有参数生成很长的一行。
* `del`: 删除路由。
* `add`: 添加路由。
* `target`: 目标网络或主机，可以用点分十进制或主机`/`网络名称提供`IP`地址。
* `-net`: 添加的目标是一个网络。
* `-host`: 添加的目标是一个主机。
* `netmask NM`: 添加网络路由时，要使用的网络掩码。
* `gw GW`: 通过网关路由数据包，必须首先可以访问指定的网关，这通常意味着必须事先设置到网关的静态路由，如果您指定本地接口之一的地址，它将用于确定数据包应路由到的接口。
* `metric M`: 将路由表(由路由守护程序使用)中的度量字段设置为M。
* `mss M`: 将通过此路由的连接的`TCP`最大段大小`MSS`设置为`M`个字节，缺省值为设备`MTU`减去标题，或在发生路径`mtu`发现时使用较低的`MTU`，当路径`mtu`发现不起作用时(通常是由于配置错误的防火墙阻止了所需的`ICMP`碎片)，此设置可用于在另一端强制使用较小的`TCP`数据包。
* `window W`: 将通过此路由的连接的`TCP`窗口大小设置为`W`字节，仅在`AX.25`网络上使用，并且驱动程序无法处理背靠背帧。
* `irtt m`: 将通过此路由的`TCP`连接的初始往返时间`irtt`设置为`m`毫秒`1-12000`，仅在`AX.25`网络上使用，如果省略，则使用`RFC 1122`默认值`300ms`。
* `reject`: 安装阻塞路由，这将强制路由查找失败，这可以用于在使用默认路由之前屏蔽网络，此外要注意这不是用于防火墙。
* `mod, dyn, reinstate`: 安装动态或修改后的路线，这些标志用于诊断目的，通常仅由路由守护程序设置。
* `dev If`: 强制将路由与指定设备相关联，否则内核将尝试自行确定设备(通过检查现有路由和设备规格以及添加路由的位置)，在大多数普通网络中，基本不需要此功能。如果`dev If`是命令行上的最后一个选项，则可以省略单词`dev`，因为它是默认值，否则路由修饰符的顺序`metric - netmask - gw - dev`无关紧要。
* `-h, --help`: 输出帮助信息。

## 示例
显示绑定到服务器的所有`IP`的路由表。

```shell
route -n
```

添加默认网关，这将分配一个网关地址，所有不属于此网络的数据包都将在该网关地址上转发。

```shell
route add default gw 169.213.0.0
```

列出内核的路由缓存信息，为了更快地路由数据包，内核保留了路由缓存信息。

```shell
route -Cn
```

拒绝路由到特定主机或网络。

```shell
route add -host 192.168.1.51 reject
```

删除默认网关，这可能会导致某些互联网故障，所以在继续执行该命令之前，请记下默认网关。

```shell
route del default
```

当我们连接`PPTP`后，通常我们会配置将一个网段添加路由，来指定数据报通过`ppp0`。

```shell
route add -net 192.168.0.0/16 dev ppp0
```

配置将一个域名添加路由，来指定数据报通过`ppp0`。

```shell
route add -host jwgl.sdust.edu.cn dev ppp0
```

将所有`D`类多播`IP`路由都设置为通过`eth0`。

```shell
route add -net 224.0.0.0 netmask 240.0.0.0 dev eth0
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.computerhope.com/unix/route.htm
https://blog.csdn.net/u013485792/article/details/51700808
https://www.geeksforgeeks.org/route-command-in-linux-with-examples/
```