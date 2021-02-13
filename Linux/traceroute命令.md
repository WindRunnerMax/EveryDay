# traceroute命令
`traceroute`命令尝试跟踪`IP`数据包到某个`Internet`主机的路由，方法是使用一个小`ttl`(生存时间)启动探测数据包，然后侦听来自网关的`ICMP`超时回复，它以`ttl`为`1`开始探测，并将其增加`1`，直到获得`ICMP port unreachable`或`TCP reset`，这意味着我们到达了`host`，或达到了最大值(默认为`30`跳)，在每个`ttl`设置处发送三个探测(默认)，并打印一行，显示`ttl`、网关地址和每个探测的往返时间，在请求时，地址后面可以有附加信息，如果探测结果来自不同的网关，则会打印每个响应系统的地址，如果在`5.0`秒内(默认值)没有响应，则会为该探测器打印一个`*`。

## 语法
```shell
traceroute [-46dFITUnreAV] [-f first_ttl] [-g gate,...] [-i device] 
           [-m max_ttl] [-p port] [-s src_addr] [-q nqueries] 
           [-N squeries] [-t tos] [-l flow_label] [-w waittime] 
           [-z sendwait] [-UL] [-D] [-P proto] [--sport=port] [-M method] 
           [-O mod_options] [--mtu] [--back] host [packet_len]
```

## 参数
* `-4, -6`: 显式强制`IPv4`或`IPv6`跟踪路由，默认情况下，程序将尝试解析给定的名称，并自动选择适当的协议，如果解析主机名同时返回`IPv4`和`IPv6`地址，则`traceroute`将使用`IPv4`。
* `-I, --icmp`: 使用`ICMP ECHO`进行探测。
* `-T, --tcp`: 使用`TCP SYN`进行探测。
* `-d, --debug`: 启用套接字级调试，如果内核支持的话。
* `-F, --dont-fragment`: 不要对探测数据包进行分段，对于`IPv4`它还会设置`DF`位，该位告诉中间路由器也不要进行远程分段。通过`packet_len`命令参数更改探测数据包的大小，可以手动获取有关单个网络跃点的`MTU`的信息。从`Linux`内核`2.6.22`开始，非碎片化功能(例如`-F`或`--mtu`)才能正常工作，在该版本之前，`IPv6`始终是零散的，`IPv4`只能使用一次(从路由缓存中)发现的最终`mtu`，它可能小于设备的实际`mtu`。
* `-f first_ttl, --first=first_ttl`: 指定要启动的`TTL`，默认为`1`。
* `-g gate,..., --gateway=gate,...`: 告诉`traceroute`向传出数据包添加`IP`源路由选项，该选项告诉网络通过指定网关路由数据包(出于安全原因，大多数路由器已禁用源路由)，通常允许指定多个网关(以逗号分隔的列表)。对于`IPv6`允许使用`num`、`addr`、`addr`、`...`的形式，其中`num`是路由报头类型(默认为类型`2`)，注意，根据`rfc 5095`，现在不赞成使用`0`型路由头。
* `-i device, --interface=device`: 指定`traceroute`应该通过其发送数据包的接口，缺省情况下，接口是根据路由表选择的。
* `-m max_ttl, --max-hops=max_ttl`: 指定`traceroute`探测的最大跳数(最大生存时间值)，默认值为`30`。
* `-N squeries, --sim-queries=squeries`: 指定同时发送的探测报文数，同时发送多个探针可以大大提高跟踪路由的速度，默认值为`16`，注意某些路由器和主机可以使用`ICMP`速率限制，在这种情况下，指定太大的数字可能会导致某些响应丢失。
* `-n`: 在显示`IP`地址时不要尝试将它们映射到主机名。
* `-p port, --port=port`: 对于`UDP`跟踪，指定`traceroute`将使用的目的端口号，目标端口号将随每个探针递增，对于`ICMP`跟踪，指定初始`ICMP`序列值(每个探针也增加)，对于`TCP`和其他协议，仅指定要连接的(恒定)目标端口，使用`tcptraceroute`包装程序时，`-p`指定源端口。
* `-t tos, --tos=tos`: 对于`IPv4`，设置服务类型`TOS`和优先级值，有用的值是`16`低延迟和`8`高吞吐量，要使用某些`TOS`优先级值，必须是超级用户，对于`IPv6`，设置流量控制值。
* `-l flow_label, --flowlabel=flow_label`: 对`IPv6`数据包使用指定的`flow_label`。
* ` -w MAX,HERE,NEAR, --wait=MAX,HERE,NEAR`: 设置等待探测响应的时间，以秒为单位，默认为`5.0`。
* `-q nqueries, --queries=nqueries`: 设置每个跃点的探测数据包数，默认值为`3`。
* `-r`: 绕过常规路由表，并直接发送到连接的网络上的主机，如果主机不在直接连接的网络上，则返回错误，此选项可用于通过没有路由的接口对本地主机执行`ping`操作。
* `-s src_addr, --source=src_addr`: 选择一个备用源地址，请注意必须选择一个接口的地址，默认情况下使用传出接口的地址。
* `-z sendwait, --sendwait=sendwait`: 探测之间的最小时间间隔，默认值为`0`，如果该值大于`10`，则以毫秒为单位指定一个数字，否则为秒数，也允许使用浮点值，当某些路由器对`ICMP`消息使用速率限制时非常有用。
* `-e, --extensions`: 显示`ICMP`扩展名，通用格式为`CLASS / TYPE`即后跟十六进制转储，所示的`MPLS`多协议标签交换数据已解析，格式为`MPLS:L=label,E=exp_use,S=stack_bottom,T=TTL (with any further objects separated by a slash ("/"))`。
* `-A, --as-path-lookups `: 在路由注册表中执行`AS`路径查找，并在相应地址后直接打印结果。
* `-M name  --module=name`: 使用指定的模块(内置或外部)用于`traceroute`操作，大多数方法都有其快捷方式，例如`-I`表示`-M icmp`等。
* `-O OPTS,..., --options=OPTS,...`: 将特定于模块的选项`OPTS`用于`traceroute`模块，允许几个`OPTS`，以逗号分隔，例如如果`OPTS`是`help`，则打印帮助信息。             
* `--sport=num`: 将源端口号用于传出数据包，表示为`-N 1`。 
* `--fwmark=num`： 为传出数据包设置防火墙标记。
* `-U  --udp`: 使用`UDP`到特定端口进行路由，而不是每个探针增加端口，默认端口为`53`。
* `-UL`: 使用`UDP LITE`进行路由，默认目标端口为`53`。
* `-D  --dccp`: 使用`DCCP`请求进行路由，默认端口为`33434`。
* `-P prot  --protocol=prot`: 使用协议保护的原始数据包进行路由。
* `--mtu`: 沿着被追踪的路径发现`MTU`，表示为`-F-N 1`。
* `--back`: 推断后向路径中的跳数，如果不同则打印。
* `-V`: 输出版本信息。
* `--help`: 输出帮助信息。

## 示例

使用`traceroute`查看路由信息。

```shell
traceroute www.google.com
```

指定`IPv4`查看路由信息。

```shell
traceroute -4 www.google.com
```

指定要启动的`TTL`，默认为`1`。

```shell
traceroute -f 3 www.google.com
```

不将`IP`地址解析为其域名。

```shell
traceroute -n www.google.com
```

设置每个跃点的探测数，默认为`3`。

```shell
traceroute -q 1 www.google.com
```

指定完整的数据包长度，默认是`60`字节的数据包。

```shell
traceroute www.google.com 100
```

设置要使用的目标端口，默认为`33434`。

```shell
traceroute -p 20292 www.google.com
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.computerhope.com/unix/utracero.htm
https://www.runoob.com/linux/linux-comm-traceroute.html
https://www.geeksforgeeks.org/traceroute-command-in-linux-with-examples/
```