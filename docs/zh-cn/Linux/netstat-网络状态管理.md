# netstat命令
`netstat`命令显示各种网络相关信息，例如网络连接、路由表、接口统计信息、伪装连接、多播成员身份等。

## 语法

```shell
netstat [address_family_options] [--tcp|-t] [--udp|-u] [--raw|-w] 
        [--listening|-l] [--all|-a] [--numeric|-n] [--numeric-hosts] 
        [--numeric-ports] [--numeric-users] [--symbolic|-N] 
        [--extend|-e[--extend|-e]] [--timers|-o] [--program|-p] 
        [--verbose|-v] [--continuous|-c]

netstat {--route|-r} [address_family_options] [--extend|-e[--extend|-e]] 
        [--verbose|-v] [--numeric|-n] [--numeric-hosts] [--numeric-ports] 
        [--numeric-users] [--continuous|-c]
        
netstat {--interfaces|-i} [--all|-a] [--extend|-e[--extend|-e]] [--verbose|-v] 
        [--program|-p] [--numeric|-n] [--numeric-hosts] [--numeric-ports] 
        [--numeric-users] [--continuous|-c]

netstat {--groups|-g} [--numeric|-n] [--numeric-hosts] [--numeric-ports] 
        [--numeric-users] [--continuous|-c]
        
netstat {--masquerade|-M} [--extend|-e] [--numeric|-n] [--numeric-hosts] 
        [--numeric-ports] [--numeric-users] [--continuous|-c]
        
netstat {--statistics|-s} [--tcp|-t] [--udp|-u] [--raw|-w]

netstat {--version|-V}

netstat {--help|-h}

address_family_options may be any combination of the following options: 
[-4] [-6] [--protocol={inet,unix,ipx,ax25,netrom,ddp}[,...]] [--unix|-x] 
[--inet|--ip] [--ax25] [--ipx] [--netrom] [--ddp]
```

## 参数
`netstat`打印的信息类型由第一个参数控制，该参数是以下参数之一:
* `(none)`: 默认情况下，`netstat`显示打开的套接字列表，如果未指定任何地址族，则将打印所有已配置地址族的活动套接字。
* `--route, -r`: 显示内核路由表，`netstat -r`和`route -e`产生相同的输出。
* `--groups, -g`: 显示`IPv4`和`IPv6`的多播组成员身份信息。
* `--interfaces, -i`: 显示所有网络接口的表。
* `--masquerade, -M`: 显示伪装的连接列表。
* `--statistics, -s`: 显示每个协议的摘要统计信息。

在第一个参数之后，以下选项指定`netstat`的报告行为: 
* `--verbose, -v`: 通过详细操作告诉用户发生了什么，特别是打印一些有关未配置地址族的有用信息。
* `--wide, -W`: 使用指定宽度而不根据使用输出来截断`IP`地址，为了不破坏现有的脚本，这是可选的。
* `--numeric, -n`: 显示数字地址，而不是尝试确定符号主机、端口或用户名。
* `--numeric-hosts`: 显示数字主机地址，但不影响端口或用户名的解析。
* `--numeric-ports`: 显示数字端口号，但不影响主机名或用户名的解析。
* `--numeric-users`: 显示数字用户`id`，但不影响主机名或端口名的解析。
* `--protocol=family, -A`: 指定要显示其连接的地址族(低级协议)，该族是逗号分隔的地址族关键字列表，如`inet`、`unix`、`ipx`、`ax25`、`netrom`和`ddp`，这与使用`--inet`、`-unix(-x)`、`-ipx`、`-ax25`、`-netrom`和`--ddp`选项具有相同的效果，地址族`inet`包括`raw`、`udp`和`tcp`协议套接字。
* `-c, --continuous`: 使`netstat`每秒连续打印所选信息。
* `-e, --extend`: 显示附加信息，使用此选项两次以获得最大细节。
* `-o, --timers`: 包括与网络计时器相关的信息。
* `-p, --program`: 显示`PID`进程标识符和每个套接字所属的程序的名称。
* `-l, --listening`: 只显示监听套接字，这些在默认情况下被省略。
* `-a, --all`: 显示监听和非监听套接字，使用`--interfaces`选项显示未启动的接口。
* `-F`: 从`FIB`打印路由信息，这是默认设置。
* `-C`: 从路由缓存中打印路由信息。

## 网络连接
关于活跃的互联网连接`TCP`、`UDP`、`raw`的信息属于以下类别: 
* `Proto`: 套接字使用的协议`tcp`、`udp`、`raw`。
* `Recv-Q`: 连接到此套接字的用户程序未复制的字节数。
* `Send-Q`: 远程主机未确认的字节数。
* `Local Address`: 套接字本地端的地址和端口号，除非指定了`--numeric, -n`选项，否则套接字地址将解析为其规范的主机名`FQDN`，并且端口号将转换为相应的服务名。
* `Foreign Address`: 套接字远端的地址和端口号，类似于本地地址。
* `State`: `socket`的状态，由于在原始套接字`raw`模式中没有状态，而且`UDP`中通常没有使用状态，因此这一列可以留空，通常这可以是以下值之一，`TCP`握手与挥手的过程中通常会经历这些状态。
    * `ESTABLISHED`: 套接字已建立连接。
    * `SYN_SENT`: 套接字正在积极尝试建立连接。
    * `SYN_RECV`: 从网络接收到连接请求。
    * `FIN_WAIT1`: 套接字已关闭，连接正在关闭。
    * `FIN_WAIT2`: 连接已关闭，套接字正在等待从远端关闭。
    * `TIME_WAIT`: 套接字在关闭后正在等待处理仍在网络中的数据包。
    * `CLOSE`: 没有使用该套接字。
    * `CLOSE_WAIT`: 远端已关闭，等待套接字关闭。
    * `LAST_ACK`: 远端已经关闭，套接字已关闭，等待确认。
    * `LISTEN`: 套接字正在监听传入的连接，除非指定`--listening, -l`或`--all, -a`选项，否则此类套接字不包含在输出中。
    * `CLOSING`: 两个套接字都关闭了，但我们仍然没有发送所有的数据。
    * `UNKNOWN`: 套接字的状态未知。
* `User`: 套接字所有者的用户名或用户`ID(UID)`。
* `PID/Program name`: 进程`ID(PID)`和拥有套接字的进程的进程名称之间用斜杠分隔，`--program`使该列包括在内，需要超级用户特权才能在不拥有的套接字上查看此信息，此标识信息尚不适用于`IPX`套接字。

## UNIX域套接字
有关活动`UNIX`域套接字的信息属于以下类别: 
* `Proto`: 套接字使用的协议，通常是`unix`。
* `RefCnt`: 引用计数，即通过此套接字连接的进程。
* `Flags`: 显示的标志是`SO_ACCEPTON`显示为`ACC`，`SO_WAITDATA(W)`或`SO_NOSPACE(N)`，如果未连接的套接字的相应进程正在等待连接请求，则在未连接的套接字上使用`SO_ACCECPTON`，其他标志不是正常的关注点。
* `Type`: 套接字访问有几种类型: 
    * `SOCK_DGRAM`: 套接字用于数据报(无连接)模式。
    * `SOCK_STREAM`: 这是一个流(连接)套接字。
    * `SOCK_RAW`: 该套接字用作原始套接字。
    * `SOCK_RDM`: 这个服务提供可靠的消息传递。
    * `SOCK_SEQPACKET`: 这是一个顺序数据包套接字。
    * `SOCK_PACKET`: 原始接口访问套接字。
* `State`: 该字段将包含以下关键字之一: 
    * `FREE`: 未分配套接字。
    * `LISTENING`:套接字正在监听连接请求，仅当指定`--listening, -l`或`--all, -a`选项时，此类套接字才会包含在输出中。
    * `CONNECTING`: 套接字即将建立连接。
    * `CONNECTED`: 套接字已连接。
    * `DISCONNECTING`: 套接字正在断开连接。
    * `(empty)`: 该套接字未连接到另一套接字。
* `PID/Program name`:打开套接字的进程的进程`ID(PID)`和进程名称。
* `Path`: 这是相应进程附加到套接字的路径名。
* `Active IPX sockets`: 活动`IPX`套接字的列表。
* `Active NET/ROM sockets`: 活动`NET/ROM`套接字的列表。
* `Active AX.25 sockets`: 活动`AX.25`套接字的列表。


## 文件
`netstat`使用以下文件: 
* `/etc/services`: 服务转换文件。
* `/proc`: `proc`文件系统的挂载点，它以文件层次结构的形式提供对内核状态信息的访问。
* `/proc/net/dev`: 设备信息文件。
* `/proc/net/raw`: 原始套接字信息。
* `/proc/net/tcp`: `TCP`套接字信息。
* `/proc/net/udp`: `UDP`套接字信息。
* `/proc/net/igmp`: `IGMP`多播信息。
* `/proc/net/unix`: `Unix`域套接字信息。
* `/proc/net/ipx`: `IPX`套接字信息。
* `/proc/net/ax25`: `AX25`套接字信息。
* `/proc/net/appletalk`: `DDP(appletalk)`套接字信息。
* `/proc/net/nr`: `NET/ROM`套接字信息。
* `/proc/net/route`: `IP`路由信息。
* `/proc/net/ax25_route`: `AX25`路由信息。
* `/proc/net/ipx_route`: `IPX`路由信息。
* `/proc/net/nr_nodes`: `NET/ROM`节点列表。
* `/proc/net/nr_neigh`: `NET/ROM`邻居。
* `/proc/net/ip_masquerade`: 伪装的连接。
* `/proc/net/snmp`: 统计。

## 示例
显示所有`listening`与`non-listening`的套接字，并使用管道和`less`便于查看当前状态。

```shell
netstat -a | less
```

列出所有`TCP`端口。

```shell
netstat -at
```

列出所有`udp`端口。

```shell
netstat -au
```

仅列出侦听端口。

```shell
netstat -l
```

列出所有端口的统计信息。

```shell
netstat -s | less
```

显示使用`TCP`的`PID`和程序名。

```shell
netstat -pt
```

获取内核路由信息。

```shell
netstat -r
```

获取与`ssh`相关的进程的网络信息。

```shell
netstat -ap | grep ssh
```

获取`80`端口的网路状态信息。

```shell
netstat -anp |grep :80
```

获取网络接口列表。

```shell
netstat -i
```

获取网络接口列表与拓展信息。

```shell
netstat -ie
```

配合`awk`命令获取`TCP`套接字的状态统计信息。

```
netstat -ant|awk '/^tcp/ {++S[$NF]} END {for(a in S) print (a,S[a])}'
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.computerhope.com/unix/unetstat.htm
https://www.runoob.com/linux/linux-comm-netstat.html
https://www.geeksforgeeks.org/netstat-command-linux/
```