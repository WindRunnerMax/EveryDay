
# Common Configuration for Nginx

`Nginx (Engine X)` is a lightweight, high-performance `HTTP` and reverse proxy `web` server. It also provides email `IMAP/POP3/SMTP` services, released under a `BSD-like` license. Its characteristics include low memory footprint and strong concurrency. In fact, `nginx`'s concurrency performance is quite good compared to similar web servers.

## Common Commands

* `-c </path/to/config>`: Specifies a configuration file for `Nginx` to replace the default configuration file.
* `-t`: Tests the configuration file without running it. `nginx` will check the syntax of the configuration file and attempt to open the files referenced in the configuration file. This command can also be used to view the location of `nginx` files.
* `-v`: Displays the version of `nginx`.
* `-V`: Displays the version of `nginx`, compiler version, and configuration parameters.
* `nginx -s ${signal}`: Controls some behaviors of `nginx` by executing `nginx` with the `-s` parameter. `${signal}` can usually be `stop` for quick stopping, `quit` for graceful stopping, `reload` for reloading the configuration file, or `reopen` for reopening log files.

## Configuration Modules

Under the division of Nginx configuration files, there are basically the following sections:
```
main # Global settings
events { # Nginx working mode
    ....
}
http { # HTTP settings
    ....
    upstream myproject { # Load balancing server settings
        .....
    }
    server  { # Host settings
        ....
        location { # URL matching
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

### Main Module
The `main` section is a global setting.

```
user www www; # Specifies the Nginx Worker process's running user and user group, which is by default done by the nobody account. 
worker_processes auto; # Specifies the number of child processes Nginx should open. Each Nginx process consumes an average of 10M~12M of memory. Generally, it is enough to specify 1 process. If there are multiple CPU cores, it is recommended to specify the same number of processes as the number of CPUs. If 2 is written here, 2 child processes will be opened, making a total of 3 processes.
error_log /usr/local/var/log/nginx/error.log notice; # Defines the global error log file. The log output levels to choose from are debug, info, notice, warn, error, and crit. Among these, debug outputs the most detailed logs, while crit outputs the least.
pid /usr/local/var/run/nginx/nginx.pid; # Specifies the location of the process ID storage file.
worker_rlimit_nofile 1024; # Specifies the maximum number of file descriptors that an nginx process can open.
include /www/server/vhost/nginx/*.conf; # Splits off part of the configuration into different configuration files.
```

### Events Module
The `events` module is usually used to specify the working mode and connection limit of `nginx`.

```
events {
    use epoll; # Specifies the working mode of Nginx. Nginx supports working modes such as select, poll, kqueue, epoll, rtsig, and /dev/poll. Among these, select and poll are standard working modes, while kqueue and epoll are efficient working modes. The difference is that epoll is used on Linux platforms, while kqueue is used on BSD systems.
    worker_connections  1024; # Defines the maximum number of connections per process for Nginx, i.e., the maximum number of requests received from the front end, which is initially set to 1024. The maximum client connection count is determined by worker_processes and worker_connections, that is, Max_clients = worker_processes * worker_connections. As a reverse proxy, the Max_clients becomes: Max_clients = worker_processes * worker_connections / 4.
}
```

### HTTP module
The `http` module is arguably the most core module. It is responsible for configuring properties related to the `HTTP` server, as well as its `server` and `upstream` sub-modules.

```conf
http {
    include mime.types; # Used to set the MIME type of files. The types are defined in the mime.type file in the configuration directory to tell Nginx to recognize the file type.
    default_type application/octet-stream; # Sets the default type to octet-stream, so when the file type is not defined, this method is used. For example, when the asp location environment is not configured, Nginx does not parse it, and accessing the asp file in a browser will result in a download window.
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"'; # Used to set the log format and record which parameters. Here it is set as main, which is used for access_log to record this type.
    access_log /usr/local/var/log/nginx/access.log main; # Records the access log file location for each visit. The main is the log format style corresponding to log_format main.
    sendfile on; # Enables efficient file transfer mode.
    tcp_nopush on; # Prevents network blocking.
    tcp_nodelay on; # Prevents network blocking.
    keepalive_timeout 10; # Sets the timeout for keeping client connections active. After this time, the server will close the connection.
    gzip on; # Enables gzip compression, used to compress static resources, effective only if the client also supports it.
    gzip_disable "MSIE [1-6]\.(?!.*SV1)"; # Some versions of IE6 have poor support for gzip compression, so it is disabled.
    gzip_http_version 1.0; # Enables gzip for versions above HTTP1.0
    gzip_types text/plain application/javascript application/x-javascript text/javascript text/css application/xml; # Specifies which types of responses to enable gzip compression for, separated by spaces.
    gzip_comp_level 5; # Compression level, optional 1-9, the higher the value, the longer the compression time and the higher the compression ratio, usually choose 2-5.
    upstream myproject {
        .....
    }
    server {
        ....
    }
}
```

The `server` module is a sub-module of `http`, used to define a virtual host. These configurations, such as `root`, have global scope under this `server`. Of course, they can also be redefined in `location`.

```conf
server {
    listen      80; # Specifies the server port for the virtual host.
    server_name localhost www.example.com; # Specifies the IP address or domain name, separated by space for multiple domain names.
    root        /www/wwwroot/www.example.com; # Global definition, indicates the root directory of the web under this server, be sure to distinguish it from the one defined under `location {}`.
    index       index.php index.html index.htm; # Global definition for the default index page accessed.
    charset     utf-8; # Sets the default character encoding for the web page.
    access_log  logs/host.access.log  main; # Specifies the access log storage path for this virtual host, with main as the output format.
    error_log   logs/host.error.log  error; # Error log storage path, with error as the output format.
    error_page  404  /404.html; # Web page address when the status code is 404, can also define 500, 502, and the like.
    ....
}
```

### location Module
The `location` module is a sub-module of the `server` used for URL matching and parsing. It provides powerful regular expression matching and supports conditional matching. Users can use the `location` directive to enable `Nginx` to filter and process dynamic and static web pages.

`location` matching rules and order:
* Exact match `=` type: has the highest priority, once a match is found, further regular expression matching is ignored.
* Prefix match `^~` type: matches the beginning of a string, not using regular expressions. If this type of rule matches, the search stops. If there are multiple `^~` matches, their order matters and they have a higher priority than regular expressions.
* Regular expression matching `~` and `~*` types: the latter is case-insensitive. The order matters, and the first regular expression match stops the search.
* Plain string match `/uri`: no specific order, the longest match is chosen.
* `/` universal match: matches all requests.
* A special match type `@url` is only used for internal `nginx` redirection, for example `location @40x { root /var/www/errors/40x.html; }`.

```nginx
# Simple example, matching all requests
location / {
    root   /home/www/html;
    index  index.php index.html index.htm;
}
```

```nginx
# Example of using regular expression matching
# Matching requests ending with .php
location ~ \.php$ {
    ....
}
```

```nginx
# Example of reverse proxy
# When matching routes starting with /api, forward the request to http://192.168.0.1, usually set up with an upstream configuration
location /api {
    proxy_pass  http://192.168.0.1; #Request forwarding to 192.168.0.1
    #Not modifying the location header in the response returned by the proxied server
    proxy_redirect off;
    #After using nginx reverse proxy, if you want the service to get the real user information, it's usually done by carrying request headers
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}

# Matching requests containing the "example" string and forwarding to another HOST with the path
location ~ /example/ {
    proxy_set_header Host example.example.top;
    if ($request_uri ~*  [.]*?/example/(.*)){
       set $path $1;
       proxy_pass http://127.0.0.1/$path;
     }
}

# Example of configuring nginx for vue-router, react-router, and other routing frameworks to enable history mode
location / {
  alias     static/;
  try_files $uri $uri/ /index.html;
}
```

### Upstream Module
The `upstream` module provides simple load balancing for backend servers.

`Nginx`'s load balancing module currently supports 4 types of scheduling algorithms, where `fair` and `url_hash` require additional software packages:
* `weight` round-robin (default): Each request is sequentially assigned to different backend servers over time. If a backend server goes down, the faulty system is automatically removed, ensuring uninterrupted user access. `weight` can specify the weight value for round-robin distribution. The higher the weight, the higher the likelihood of being assigned a request. This is mainly used when backend server performance is uneven.
* `ip_hash`: Each request is assigned to a backend server based on the hash result of the visiting IP. This ensures that visitors from the same IP are directed to a specific backend server, effectively solving session sharing issues with dynamic web pages.
* `fair` (third-party): A more intelligent load balancing algorithm than the previous ones. Based on page size and load time, it intelligently performs load balancing, prioritizing servers with shorter response times. `Nginx` itself does not support `fair`, so to use this scheduling algorithm, the `Nginx` `upstream_fair` module must be downloaded.
* `url_hash` (third-party): Requests are assigned to backend servers based on the hash result of the URL, directing each URL to the same backend server, further improving the efficiency of backend cache servers. `Nginx` itself does not support `url_hash`, so to use this scheduling algorithm, the `hash` software package for `Nginx` must be installed.

In the `HTTP Upstream` module, the `server` directive can be used to specify the IP address and port of the backend server, and you can also set the status of each backend server in load balancing scheduling. Commonly used states include:

- `down` indicates that the current `server` temporarily does not participate in load balancing.
- `backup` is a reserved backup machine. It will only be requested when all other non-`backup` machines are faulty or busy, so this machine has the lightest load.
- `max_fails` allows the number of failed requests, default is `1`. When the maximum number of failures is exceeded, the error defined by the `proxy_next_upstream` module is returned.
- `fail_timeout`: the time to suspend service after experiencing `max_fails` failures. `max_fails` can be used with `fail_timeout`.

Note: When the load balancing algorithm is `ip_hash`, the status of the backend server in the load balancing schedule cannot be `weight` or `backup`.

```nginx
upstream backend_name {
    server 192.168.12.1:80 weight=5;
    server 192.168.12.2:80 down;
    server 192.168.12.3:8080 max_fails=3 fail_timeout=20s;
    server 192.168.12.4:8080;
}

server {
  location / {
    proxy_pass  http://backend_name/;
  }
}
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.jianshu.com/p/f04733896a48
https://juejin.cn/post/6844903598824882183
https://blog.csdn.net/weixin_37610397/article/details/106608265
```