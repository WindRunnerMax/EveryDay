# 建立DNS隧道绕过校园网认证
因为之前在本科的时候破解过校园网三次，主要就是利用其业务逻辑上的漏洞、`53`端口未过滤包、重放攻击的手段，然后就是一个博弈的过程，这三次加起来用了大概有一年的时间就被完全堵死了，最近又比较需要网络，然后有开始想折腾了，不过这次建立`dns`隧道虽然是成功建立了，使用正常网络是能够走服务器的`dns`隧道的，但是并没有成功绕过校园网的认证，至于原因还是有待探查。最后想着还是记录一下隧道建立流程，之后做`CTF`题可能用得到。

## 描述
`dns`隧道相关的描述直接引用参考中文章的一段描述：既然`UDP53`端口的数据包可以通过网关，那么我们可以在本地运行一个程序将其它端口的数据包伪装组成`UDP53`端口的数据包，然后发送到本地域名服务器，那么网关就不会进行拦截了，数据包就顺利的通过了网关，可是发送出去的数据报如何返回呢？这就需要我们做进一步的设置。接下来我们需要一个`VPS`（云服务器）和一个域名，我了便于叙述，我给这个云服务器起名为`V`，域名起名为`Y`。我们伪装的`DNS`数据包要查询的域名就是`Y`，本地域名服务器接收到这个伪装后的数据包后，由于它无法解析这个域名`Y`，便将数据包进行转发，让能够解析`Y`的域名服务器进行解析，接下来我们将`Y`设置一个`NS`记录，用来指定`Y`由哪个域名服务器来进行解析，我们指定的域名服务器就是前面提到的`V`，所以接下来数据包会被发送到`V`中。此时我们在`V`中运行一个程序，对伪装的数据包进行还原，还原后的数据包再发送出去，这样当`V`接收到响应数据包后，`V`上运行的程序会再次对其进行伪装，伪装成一个`DNS`响应数据包，这个`DNS`响应数据包会沿着上述相反的路径发送回我们的计算机，我们的计算机再次对这个`DNS`响应数据包进行还原，到现在，我们真正想要得到的数据包已经到手了。

## 服务端
假设此时有一个`example.com`的域名，服务器的`ip`地址为`111.111.111.111`。接下来要对域名进行解析，增加一个`NS`记录以及一个`A`记录，新增`NS`记录的名称为`dns.example.com`，值为`dnsserver.example.com`，新增`A`记录的名称为`dnsserver.example.com`，值为`ip`地址即`111.111.111.111`。

```
类型  名称                    值
NS   dns.example.com         dnsserver.example.com
A    dnsserver.example.com   111.111.111.111
```

之后在服务器执行以下命令。

```bash
$ tcpdump -n -i eth0 udp dst port 53
```

然后随便找一台机器进行`dns`查询，然后在服务器的终端就能够看到查询的信息了。

```bash
$ nslookup dns.example.com
```

```
...
19:09:01.810846 IP 222.222.222.222.54346 > 111.111.111.111.53: 6858 [1au] A? dns.example.com. (57)
...
```

我的服务端使用`ubuntu`的`linux`发行版，直接使用包管理器安装`dns2tcp`。

```bash
$ apt install dns2tcp
```

接下来需要配置一下`dns2tcp`。

```bash
$ vim /etc/dns2tcpd.conf
```

```
listen = 0.0.0.0
port = 53
# If you change this value, also change the USER variable in /etc/default/dns2tcpd
user = nobody
chroot = /tmp
domain = dns.example.com
resources = ssh:127.0.0.1:22
```

执行如下命令即可启动`dns2tcp`，其中参数`-f /etc/dns2tcpd.conf`指定了配置文件，`-F`要求程序在前台运行，`-d 2`指明了输出调试信息，级别为`2`，为首次运行，我们加上参数`-F`和`-d 2`，另外如果需要保持前台运行且输出日志信息的话，`nohub`、`screen`、`systemctl`都是可行的，维持终端进程后台运行就不再赘述。

```bash
dns2tcpd -f /etc/dns2tcpd.conf -F -d 2
```

```
19:31:49 : Debug socket.c:55	Listening on 0.0.0.0:53 for domain dns.example.com
Starting Server v0.5.2...
19:31:49 : Debug main.c:132	Chroot to /tmp
11:31:49 : Debug main.c:142	Change to user nobody
```


## 客户端

在服务端只需要开启一个终端，客户端需要保持两个终端，首先我们建立一个链接通道，在客户端也需要下载`dns2tcp`，在这里我直接使用`brew`安装。

```bash
$ brew install dns2tcp
```
紧接着需要启动通道，至此第一个终端连接已经完成。

```bash
$ dns2tcpc -l 8888 -r ssh -z dns.example.com 111.111.111.111
```

```
Listening on port : 8888
```

紧接着我们需要借助`ssh`开启一个`socks4/5`通用代理，这也就是第二个终端需要完成的任务，相当于完成了一个`ssh`连接，同样也是需要账号密码或者私钥的，执行下面的命令即可在`127.0.0.1`开启一个端口为`1080`的`socks`代理。

```bash
$ ssh -D 127.0.0.1:1080 root@127.0.0.1 -p 8888
```

之后就是使用代理了，可以为全局进行代理也可以近为一些软件启用`socks`代理连接，在此本地进行了简单的测试。

```bash
$ curl https://www.baidu.com --proxy socks5://127.0.0.1
```

可以看到服务端有大量的输出。
```
...
Debug queue.c:240	Flush Write 72 bytes, crc = 0x40c5
Debug queue.c:300	Flushing outgoing data
Debug queue.c:642	Packet [646] decoded, data_len 0
Debug queue.c:653	diff = 21
Debug queue.c:300	Flushing outgoing data
Debug queue.c:642	Packet [647] decoded, data_len 24
Debug queue.c:653	diff = 21
Debug queue.c:240	Flush Write 24 bytes, crc = 0xd739
Debug queue.c:300	Flushing outgoing data
Debug queue.c:642	Packet [648] decoded, data_len 0
Debug queue.c:653	diff = 21
Debug queue.c:300	Flushing outgoing data
...
```
要注意的是无论是本地的终端还是服务器的终端都需要保持其运行才能继续正常使用，毕竟如果终端掉了进程结束了也就不存在封包解包的操作了，另外实际使用速度还是比较感人的，毕竟其有大量的封包拆包操作。

## 最后
最终还是没能成功实现想要的功能，最后使用`dnslog`探查了一下实际上是有`dns`查询的，还是需要研究一下究竟是什么阻拦策略导致没有完成隧道的建立。想来三级域名的`A`记录其实是可以携带一点信息的，即`abc.example.com`可以携带`abc`这个信息过去。此外还有一个终极大招，直接物理方案解决，毕竟`AP`可是在宿舍里边的。


## Blog

```
https://github.com/WindRunnerMax
```

## 参考

```
http://0sec.com.cn/2018-08-05/
http://blog.dengxj.com/archives/14/
https://www.cnblogs.com/nkqlhqc/p/7805837.html
https://blog.csdn.net/wn314/article/details/81430554
https://blog.csdn.net/m0_53129012/article/details/111173610
https://blog.csdn.net/miaomiaodmiaomiao/article/details/50883764
```