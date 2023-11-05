# Nginx常用配置
`Nginx (Engine X)`是一个轻量级的高性能的`HTTP`和反向代理`web`服务器，同时也提供了电子邮件`IMAP/POP3/SMTP`服务，在`BSD-like`协议下发行，其特点是占有内存少，并发能力强，事实上`nginx`的并发能力在同类型的网页服务器中表现较好。

## 常用命令

* `-c </path/to/config>`: 为`Nginx`指定一个配置文件，来代替缺省的配置文件。
* `-t`: 不运行而仅仅测试配置文件，`nginx`将检查配置文件的语法的正确性，并尝试打开配置文件中所引用到的文件，这个命令也可以查看`nginx`文件的所在位置。
* `-v`: 显示`nginx`的版本。
* `-V`: 显示`nginx`的版本，编译器版本和配置参数。
* `nginx -s ${signal}`: 通过执行`nginx`加`-s`参数来控制`nginx`的一些行为，`${signal}`通常可以取`stop`快速停止、`quit`平滑停止、`reload`重新加载配置文件、`reopen`重新打开日志文件。

## 配置模块

Nginx配置文件的分块下，基本就分为以下几块：
```
main # 全局设置
events { # Nginx工作模式
    ....
}
http { # http设置
    ....
    upstream myproject { # 负载均衡服务器设置
        .....
    }
    server  { # 主机设置
        ....
        location { # URL匹配
            ....
        }
    }
    server  {
        ....
        location {
            ....
        }
    }
    ....
}

```

### main模块
`main`区域是一个全局的设置。

```
user www www; # user 来指定Nginx Worker进程运行用户以及用户组，默认由nobody账号运行。 
worker_processes auto; # worker_processes 来指定了Nginx要开启的子进程数。每个Nginx进程平均耗费10M~12M内存。根据经验，一般指定1个进程就足够了，如果是多核CPU，建议指定和CPU的数量一样的进程数即可。如果这里写2，那么就会开启2个子进程，总共3个进程。
error_log /usr/local/var/log/nginx/error.log notice; # error_log 来定义全局错误日志文件。日志输出级别有debug、info、notice、warn、error、crit可供选择，其中，debug输出日志最为最详细，而crit输出日志最少。
pid /usr/local/var/run/nginx/nginx.pid; # pid 来指定进程id的存储文件位置。
worker_rlimit_nofile 1024; # worker_rlimit_nofile 来指定一个nginx进程可以打开的最多文件描述符数目。
include /www/server/vhost/nginx/*.conf; # 将部分配置直接拆分出来,分成不同的配置文件。
```

### events模块
`events`模块通常用来指定`nginx`的工作模式和工作模式及连接数上限。

```
events {
    use epoll; # use 用来指定Nginx的工作模式。Nginx支持的工作模式有select、poll、kqueue、epoll、rtsig和/dev/poll，其中select和poll都是标准的工作模式，kqueue和epoll是高效的工作模式，不同的是epoll用在Linux平台上，而kqueue用在BSD系统中。
    worker_connections  1024; # worker_connections 用于定义Nginx每个进程的最大连接数，即接收前端的最大请求数，默认是1024。最大客户端连接数由worker_processes和worker_connections决定，即Max_clients = worker_processes * worker_connections，在作为反向代理时，Max_clients变为：Max_clients = worker_processes * worker_connections / 4。
}
```


### http模块
`http`模块可以说是最核心的模块了，它负责`HTTP`服务器相关属性的配置，它里面的`server`和`upstream`子模块。

```
http {
    include mime.types; # 用来设定文件的mime类型,类型在配置文件目录下的mime.type文件定义，来告诉nginx来识别文件类型。
    default_type application/octet-stream; # 设定了默认的类型为二进制流，也就是当文件类型未定义时使用这种方式，例如在没有配置asp的locate 环境时，Nginx是不予解析的，此时，用浏览器访问asp文件就会出现下载窗口了。
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"'; # 用于设置日志的格式，和记录哪些参数，这里设置为main，刚好用于access_log来纪录这种类型。
    access_log /usr/local/var/log/nginx/access.log  main; # 用来记录每次的访问日志的文件地址，后面的main是日志的格式样式，对应于log_format的main。
    sendfile on; # 用于开启高效文件传输模式。
    tcp_nopush on; # 用于防止网络阻塞。
    tcp_nodelay on; # 用于防止网络阻塞。
    keepalive_timeout 10; # 设置客户端连接保持活动的超时时间，在超过这个时间之后，服务器会关闭该连接。
    gzip on; # gzip 压缩，用来对静态资源进行压缩，需要客户端同时支持才有效。
    gzip_disable "MSIE [1-6]\.(?!.*SV1)"; # IE6的某些版本对gzip的压缩支持很不好,故关闭。
    gzip_http_version 1.0; # HTTP1.0以上的版本都启动gzip
    gzip_types text/plain application/javascript application/x-javascript text/javascript text/css application/xml; # 指定哪些类型的相应才启用gzip压缩，多个用空格分隔
    gzip_comp_level 5; # 压缩等级，可选1-9，值越大压缩时间越长压缩率越高，通常选2-5
    upstream myproject {
        .....
    }
    server {
        ....
    }
}
```



`server`模块是`http`的子模块，它用来定义一个虚拟主机，这些配置为在该`server`下具有全局性例如`root`，当然也可以在`location`中重新定义`root`。

```conf
server {
    listen      80; # 用于指定虚拟主机的服务端口。
    server_name localhost www.example.com; # 用来指定IP地址或者域名，多个域名之间用空格分开。
    root        /www/wwwroot/www.example.com; # 全局定义，表示在该server下web的根目录，注意要和locate {}下面定义的区分开来。
    index       index.php index.html index.htm; # 全局定义访问的默认首页地址。
    charset     utf-8; # 设置网页的默认编码格式。
    access_log  logs/host.access.log  main; # 用来指定此虚拟主机的访问日志存放路径，输出格式为main。
    error_log   logs/host.error.log  error; # 错误日志存放路径，输出格式为error。
    error_page  404  /404.html; # 状态码为404时的时候的网页地址,还可定义500,502之类的
    ....
}
```

### location模块
`location`是`server`的子模块，是用来定位的，定位`URL`与解析`URL`，所以它也提供了强大的正则匹配功能，也支持条件判断匹配，用户可以通过`location`指令实现`Nginx`对动、静态网页进行过滤处理。  
`location`的匹配规则和顺序:
* 第一种是`=`类型，表示精确匹配，优先级最高，一旦匹配到忽略之后的正则匹配。
* `^~`类型，表示前缀匹配，是字符串开头匹配而非正则匹配，当匹配到该规则时，停止往下面的搜索，所以如果存在两个`^~`匹配的时候要注意有顺序之分，优先级比正则高。
* `~`和`~*`正则匹配，两者区别是后者不区分大小写，有顺序之分，匹配到第一个正则停止搜索。
* `/uri`普通字符串匹配，无顺序之分，会选择匹配长度最长的配置。
* `/` 通用匹配，匹配所有请求。
* 还有一种特殊匹配类型`@url`，只用于`nginx`内部跳转，例`location @40x { root /var/www/errors/40x.html; }`;


```
# 简单例子，匹配所有请求

location / {
    root   /home/www/html;
    index  index.php index.html index.htm;
}
```

```
# 使用正则匹配的例子 
# 匹配.php结尾的请求

location ~ \.php$ {
    ....
}
```

```
# 反向代理的例子 
# 匹配到/api开头的路由时候，将请求转发到http://192.168.0.1，但是通常不是直接填写地址，而是设置一个upstream配置

location /api {
    proxy_pass  http://192.168.0.1; #请求转向地址192.168.0.1
    #不修改被代理服务器返回的响应头中的location头
    proxy_redirect off;
    #使用nginx反向代理后，如果要使服务获取真实的用户信息，通常用请求头携带
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}

# 匹配到携带example字符串的请求 将请求转发到其他HOST并携带path
location ~ /example/ {
    proxy_set_header Host example.example.top;
    if ($request_uri ~*  [.]*?/example/(.*)){
       set $path $1;
       proxy_pass http://127.0.0.1/$path;
     }
}

# vue-router、react-router等路由框架要开启history模式可以选择的nginx配置的例子
location / {
  alias     static/;
  try_files $uri $uri/ /index.html;
}
```

### upstream模块
`upstream`可以为后端服务器提供简单的负载均衡。

`Nginx`的负载均衡模块目前支持`4`种调度算法，其中`fair`和`url_hash`需要加载其他软件包:
* `weight`轮询(默认)。每个请求按时间顺序逐一分配到不同的后端服务器，如果后端某台服务器宕机，故障系统被自动剔除，使用户访问不受影响，`weight`可以指定轮询权值，`weight`越大，分配到的访问机率越高，主要用于后端每个服务器性能不均的情况下。
* `ip_hash`，每个请求按访问`IP`的`hash`结果分配，这样来自同一个`IP`的访客固定访问一个后端服务器，有效解决了动态网页存在的`session`共享问题。
* `fair`(第三方)，比上面两个更加智能的负载均衡算法。此种算法可以依据页面大小和加载时间长短智能地进行负载均衡，也就是根据后端服务器的响应时间来分配请求，响应时间短的优先分配。`Nginx`本身是不支持`fair`的，如果需要使用这种调度算法，必须下载`Nginx`的`upstream_fair`模块。
* `url_hash`(第三方)。按访问`url`的`hash`结果来分配请求，使每个`url`定向到同一个后端服务器，可以进一步提高后端缓存服务器的效率。`Nginx`本身是不支持`url_hash`的，如果需要使用这种调度算法，必须安装`Nginx`的`hash`软件包。

在`HTTP Upstream`模块中，可以通过`server`指令指定后端服务器的`IP`地址和端口，同时还可以设定每个后端服务器在负载均衡调度中的状态，常用的状态有:
* `down`表示当前的`server`暂时不参与负载均衡。
* `backup`预留的备份机器，当其他所有的非`backup`机器出现故障或者忙的时候，才会请求`backup`机器，因此这台机器的压力最轻。
* `max_fails`允许请求失败的次数，默认为`1`，当超过最大次数时，返回`proxy_next_upstream`模块定义的错误。
* `fail_timeout`，在经历了`max_fails`次失败后，暂停服务的时间，`max_fails`可以和`fail_timeout`一起使用。
* 注：当负载调度算法为`ip_hash`时，后端服务器在负载均衡调度中的状态不能是`weight`和`backup`。

```
upstream backend_name {
    server 192.168.12.1:80 weight=5;
    server 192.168.12.2:80 down;
    server 192.168.12.3:8080  max_fails=3  fail_timeout=20s;
    server 192.168.12.4:8080;
}

server {
  location / {
    proxy_pass  http://backend_name/;
  }
}
```



## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.jianshu.com/p/f04733896a48
https://juejin.cn/post/6844903598824882183
https://blog.csdn.net/weixin_37610397/article/details/106608265
```

