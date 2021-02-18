# ip命令
`ip`命令与`ifconfig`命令类似，但比`ifconfig`命令更加强大，主要功能是用于显示或设置网络设备、路由和隧道的配置等，`ip`命令是`Linux`加强版的的网络配置工具，用于代替`ifconfig`命令。


## 语法

```shell
ip [ OPTIONS ] OBJECT { COMMAND | help }
ip [ -force ] -batch filename

OBJECT := { link | addr | addrlabel | route | rule | neigh | ntable | tunnel | tuntap | maddr | mroute | mrule | monitor | xfrm | netns }

OPTIONS := { -V[ersion] | -s[tatistics] | -r[esolve] | -f[amily] { inet | inet6 | ipx | dnet | link } | -o[neline] }
```

## 参数

### OPTIONS
* `-b, -batch <FILENAME>`: 从提供的文件或标准输入读取命令并调用它们，第一次失败将导致`ip`执行终止。
* `-force`: 不要在批处理模式下因错误而终止`ip`，如果在执行命令期间发生任何错误，则应用程序返回码将为非零。
* `-s, -stats, -statistics`: 输出更多信息，如果该选项出现两次或更多次，则信息量会增加，通常，信息是统计信息或一些时间值。
* `-l, -loops <COUNT>`: 指定`ip addr flush`逻辑在放弃之前尝试的最大循环数，默认值为`10`，`0`表示循环直到删除所有地址。
* `-f, -family <FAMILY>`: 指定使用的协议族，协议族标识符可以是`inet`、`inet6`、`bridge`、`ipx`、`dnet`或`link`中的一个，如果该选项不存在，则根据其他参数猜测协议族，如果命令行的其余部分没有提供足够的信息来猜测家族，`ip`将退回到默认的`ip`设置，通常是`inet`或`any`，`link`是一种特殊的族标识符，不涉及任何网络协议。
* `-4`: `-family inet`的快捷方式。
* `-6`: `-family inet6`的快捷方式。
* `-B`: `-family bridge`的快捷方式。
* `-D`: `-family decnet`的快捷方式。
* `-I`: `-family ipx`的快捷方式。
* `-0`: `-family link`的快捷方式。
* `-o, -oneline`: 将每条记录输出为一行，用`\`字符替换换行符，当使用`wc`计数记录或`grep`输出时，这很方便。
* `-r, -resolve`: 使用系统的名称解析程序打印`DNS`名称而不是主机地址。
* `-V, -Version`: 输出版本信息。

### OBJECT
* `address`: 设备上的协议地址，`IP`或`IPv6`。
* `addrlabel`: 用于协议地址选择的标签配置。
* `l2tp`: IP隧道以太网`L2TPv3`。
* `link`: 网络设备。
* `maddress`: 多播地址。
* `monitor`: 监视`netlink`消息。
* `mroute`: 多播路由缓存项。
* `mrule`: 多播路由策略数据库中的规则。
* `neighbour`: 管理`ARP`或`NDISC`缓存项。
* `netns`: 管理网络名称空间。
* `ntable`: 管理邻居缓存的操作。
* `route`: 路由表条目。
* `rule`: 路由策略数据库中的规则。
* `tcp_metrics/tcpmetrics`: 管理`TCP`指标。
* `tunnel`: `IP`隧道。
* `tuntap`: 管理`TUN/TAP`设备。
* `xfrm`: 管理`IPSec`策略。


## 示例

查看网络接口信息，例如`IP`地址，子网等。

```shell
ip addr show
```

要查看`eth0`网卡信息。

```shell
ip addr show eth0
```

启用网络接口。

```shell
ip link set eth0 up
```

关闭网络接口。

```shell
ip link set eth0 down
```

查看路由和默认网关信息。

```shell
ip route show
```

获取到特定`ip`的路由信息。

```shell
ip route get to 192.168.111.111
```

查看`arp`条目。

```shell
ip neigh
```

查看网络统计。

```shell
ip -s link
```

查看详细帮助信息。

```shell
man ip
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.computerhope.com/unix/ip.htm
https://www.commandlinux.com/man-page/man8/ip.8.html
https://www.geeksforgeeks.org/ip-command-in-linux-with-examples/
```