# Establishing DNS tunnel to bypass campus network authentication

In the past, during my undergraduate years, I cracked the campus network three times. I mainly exploited loopholes in its business logic, unfiltered packets on port `53`, and replay attacks. It was a process of cat and mouse, but after these three attempts, which took about a year in total, the vulnerabilities were completely patched. Recently, I found myself in need of network access again and started thinking about tinkering with it. However, while I successfully established a `dns` tunnel and can use the regular network through the server's `dns` tunnel, I haven't successfully bypassed the campus network's authentication. The reason for this failure still needs further investigation. In the end, I thought it would be better to record the tunnel establishment process. It could be useful for future `CTF` challenges.

## Description
The description of the `dns` tunnel is directly quoted from a section in the reference article: "Since data packets on the `UDP53` port can pass through the gateway, we can run a program locally to disguise data packets from other ports as `UDP53` port packets and then send them to the local domain server. In this way, the gateway will not intercept the packets, and they will smoothly pass through. But, how will the outbound data packets return? This requires us to make further settings. Next, we need a VPS (cloud server) and a domain name. For convenience, I'll name the cloud server `V` and the domain name `Y`. The domain name that our disguised `DNS` data packet needs to query is `Y`. When the local domain server receives this disguised data packet, it is unable to resolve the domain name `Y`, so it forwards the data packet to a server capable of resolving `Y`. Next, we'll set an `NS` record for `Y` to specify which domain server should resolve `Y`. The domain server we specify is the previously mentioned `V`, so the data packet will be sent to `V`. At this point, we run a program on `V` to restore the disguised data packet and then send it out again. This way, when `V` receives the response data packet, the program running on `V` will again disguise it as a `DNS` response data packet. This `DNS` response data packet will be sent back to our computer along the opposite path mentioned above. Our computer can then restore this `DNS` response data packet. Now, we finally have the data packet we wanted."

## Server Side
Suppose we have a domain name `example.com` with the server's `IP` address being `111.111.111.111`. Next, we need to resolve the domain name and add an `NS` record and an `A` record. The name of the added `NS` record is `dns.example.com`, with the value being `dnsserver.example.com`, and the name of the added `A` record is `dnsserver.example.com` with the value being the `IP` address, i.e., `111.111.111.111`.

```markdown
Type  Name                    Value
NS    dns.example.com         dnsserver.example.com
A     dnsserver.example.com   111.111.111.111
```

Afterwards, execute the following command on the server.

```bash
$ tcpdump -n -i eth0 udp dst port 53
```

Then, simply query the `dns` using any machine, and you'll be able to see the query information in the server's terminal.

```bash
$ nslookup dns.example.com
```

```
...
19:09:01.810846 IP 222.222.222.222.54346 > 111.111.111.111.53: 6858 [1au] A? dns.example.com. (57)
...
```

My server uses the `ubuntu` distribution of `linux`, so I directly installed `dns2tcp` using a package manager.

```bash
$ apt install dns2tcp
```

Next, it's necessary to configure `dns2tcp`.

```bash
$ vim /etc/dns2tcpd.conf
```

```plaintext
listen = 0.0.0.0
port = 53
# If you change this value, also change the USER variable in /etc/default/dns2tcpd
user = nobody
chroot = /tmp
domain = dns.example.com
resources = ssh:127.0.0.1:22
```

To start `dns2tcp`, simply execute the following command. The parameter `-f /etc/dns2tcpd.conf` specifies the configuration file, `-F` requires the program to run in the foreground, and `-d 2` specifies the debug information output level as `2`. For the initial run, we add the parameters `-F` and `-d 2`. Furthermore, if you need to maintain foreground operation and log output, `nohub`, `screen`, and `systemctl` are all viable options. We won't delve into maintaining terminal processes running in the background.

```bash
dns2tcpd -f /etc/dns2tcpd.conf -F -d 2
```

```
19:31:49 : Debug socket.c:55	Listening on 0.0.0.0:53 for domain dns.example.com
Starting Server v0.5.2...
19:31:49 : Debug main.c:132	Chroot to /tmp
11:31:49 : Debug main.c:142	Change to user nobody
```

## Client

While on the server side only one terminal needs to be opened, on the client side two terminals need to be maintained. First, we establish a connection channel. The client also needs to download `dns2tcp`. Here, I'm directly using `brew` for installation.

```bash
$ brew install dns2tcp
```
Next, we need to start the channel. With this, the first terminal connection is complete.

```bash
$ dns2tcpc -l 8888 -r ssh -z dns.example.com 111.111.111.111
```

```
Listening on port : 8888
```

Subsequently, we need to use `ssh` to start a `socks4/5` universal proxy. This is the task for the second terminal, similar to completing an `ssh` connection. It also requires an account password or private key. Execute the following command to open a `socks` proxy on `127.0.0.1` with port `1080`.

```bash
$ ssh -D 127.0.0.1:1080 root@127.0.0.1 -p 8888
```

After that, we can use the proxy, enabling global proxy or enabling `socks` proxy connections for some software. Here, a simple test was conducted locally.

```bash
$ curl https://www.baidu.com --proxy socks5://127.0.0.1
```

You can see a large amount of output on the server side.
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

It's important to note that whether it's the local terminal or the server's terminal, it needs to be kept running to continue normal usage. After all, if the terminal is terminated and the process ends, there won't be any more packet processing. Additionally, the actual usage speed is quite modest, given the substantial packet processing operations.

## Finally
In the end, the desired functionality was not successfully implemented. After using `dnslog` to investigate, it was found that there were indeed DNS queries. Further research is needed to determine the exact blocking strategy that prevented the establishment of the tunnel. It is worth noting that the `A` record of a tertiary domain can carry some information, for example, `abc.example.com` can carry the information `abc`. Additionally, there is a last resort - solving the issue with a direct physical solution, given that the AP is indeed inside the dormitory.

## References

```
http://0sec.com.cn/2018-08-05/
http://blog.dengxj.com/archives/14/
https://www.cnblogs.com/nkqlhqc/p/7805837.html
https://blog.csdn.net/wn314/article/details/81430554
https://blog.csdn.net/m0_53129012/article/details/111173610
https://blog.csdn.net/miaomiaodmiaomiao/article/details/50883764
```