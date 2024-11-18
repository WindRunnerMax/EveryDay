# DNS Resolution Process
Domain Name System (DNS) is a system designed to facilitate address translation for the purpose of easy memorization. In order to access a server on the Internet, it must ultimately be done through an IP address. Domain name resolution is the process of converting a domain name back into an IP address. One domain name corresponds to one IP address, and one IP address can correspond to multiple domain names. Therefore, multiple domain names can be resolved to one IP address at the same time. Domain name resolution needs to be done by specialized DNS servers.

## Resolution Methods
There are two types of DNS resolution queries: recursive resolution and iterative resolution. Typically, the client and the local domain name server perform recursive queries, while iterative queries are performed between local domain name servers and other domain name servers.

### Recursive Resolution
Suppose our local client is `A`, and there are three domain name resolution servers `B`, `C`, and `D`. First, the local client `A` initiates a DNS resolution request to server `B`. If server `B` does not have the resolution record, it requests resolution from server `C`. If server `C` does not have the resolution record, it requests resolution from server `D`. If server `D` has the resolution record, it returns the record to server `C`, which then returns it to server `B`, and finally server `B` returns it to server `A`. This completes one recursive resolution query.

```
A → B → C → D
A ← B ← C ← D
```

### Iterative Resolution
Suppose our local client is `A`, and there are three domain name resolution servers `B`, `C`, and `D`. First, the local client `A` initiates a DNS resolution request to server `B`. If server `B` does not have the resolution record, it returns to `A` indicating the unsuccessful query and provides the address of server `C`. Then, client `A` requests resolution from server `C`. If server `C` does not have the resolution record, it returns to `A` indicating the unsuccessful query and provides the address of server `D`. Then, client `A` requests resolution from server `D`. If server `D` has the resolution record, it returns the record to `A`. This completes one iterative resolution query.

```
A → B
A → C
A → D
```

## Resolution Process

### Browser Cache
After entering a URL, the browser first checks its own DNS cache for the IP address corresponding to the domain name. Typically, the browser's DNS resolution cache has a short retention time and a limited number of entries. In Chrome, the cache retention time for domain name resolution is 60 seconds. The DNS cache can be cleared by entering `chrome://net-internals/#dns` in the address bar.

### HOSTS File
The HOSTS file is a system file that establishes a correspondence between domain names and their corresponding IP addresses. When performing DNS resolution, the system first automatically searches for the corresponding IP address in the HOSTS file. If it is not found, the system submits the domain name to a DNS domain name resolution server for IP address resolution. On Windows, this file is usually located in the `C:\Windows\system32\drivers\etc\` directory, while on Linux, it is usually located in the `/etc/` directory.

### Local Domain Name Server
The client requests resolution from the local domain name server, which is usually provided by the Internet Service Provider (ISP). The resolution from the client to the local domain name server is done through the UDP protocol on port 53. The resolution process from the client to the local domain name server is recursive. If the requested domain name is not found in the local domain name server, it starts iterative queries.

### Root Domain Name Server
The local domain name server requests resolution from the root domain name server `a.rootserver.net`. The root domain name server queries the server corresponding to the top-level domain `.com` and returns the resolution address of the `.com` top-level domain to the local domain name server.

### Top-Level Domain Name Server
The local domain name server requests resolution from the top-level domain name server. The top-level domain name server queries the server corresponding to the second-level domain `example.com` and returns the resolution address of the second-level domain `example.com` to the local domain name server.

### Second-Level Domain Name Server
The local domain name server requests resolution from the second-level domain name server. If the second-level domain name server does not have the resolution record, it returns the address of the authoritative domain name server for `example.example.com` to the local domain name server. Typically, second-level domain name servers and subsequent servers can be referred to as authoritative domain name servers.

### Permission Domain Name Resolution Server
The local domain name resolution server sends a request to the permission domain name resolution server. After the permission domain name resolution server queries the resolution records, it returns the result to the local domain name resolution server. The local domain name resolution server then returns the queried IP address to the client and caches the corresponding relationship between the domain name and the IP address. If the permission domain name resolution server has not yet found the IP address corresponding to the domain name, it returns a resolution failure. In addition, if the client has configured multiple DNS server addresses, it will continue to query other configured DNS resolution servers after a failed query.


## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.jianshu.com/p/6b502d0f2ede
https://www.zhihu.com/question/53882349
https://blog.csdn.net/qq_40378034/article/details/100998367
```