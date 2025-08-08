# Installing QQ Robot on Ubuntu

> I've noticed that currently only CoolQ robot supports running on Docker in Linux.  
> So, I'm going to install the CoolQ robot. It doesn't consume a lot of resources, probably about 180MB of memory.

## Installing CoolQ HTTP
First, make sure to install `docker`. 

![](screenshots/2023-04-14-20-49-41.jpg)

The CoolQ official website provides the `docker` [COOLQ Docker 2.0](https://cqp.cc/t/34558).  
However, I prefer to use the one with the `HTTP` plugin for some functionality development. I chose the one made by a senior, which contains the `HTTP` plugin [CQHTTP Docker](https://richardchien.gitee.io/coolq-http-api/docs/4.12/#/Docker).  
First, pull the image. I found the download speed to be a bit slow, so I ran it in a `screen` session to download slowly.

```shell
docker pull richardchien/cqhttp:latest
```
After the download is complete, start the container for testing.

```powershell
docker run -ti --rm --name coolq \
        -v /home/coolq:/home/user/coolq \  # Mount the host directory to the container for persistent storage of the CoolQ program files
        -p 9000:9000 \  # noVNC port for controlling CoolQ from the browser
        -p 5700:5700 \  # Port opened by the HTTP API plugin
        -e COOLQ_ACCOUNT=123456 \ # Optional but recommended: the QQ account to log in
        -e CQHTTP_POST_URL=http://example.com:8080 \  # Event reporting address
        -e VNC_PASSWD=111111111 \ # noVNC password
        -e CQHTTP_SERVE_DATA_FILES=yes \  # Allow access to CoolQ data files through the HTTP interface
        richardchien/cqhttp:latest
```
At this point, you can log in to `noVNC` to view and log in.

![](screenshots/2023-04-14-20-49-49.jpg)

If the test is successful, change `--rm` to `-d` in the start parameters for persistent running.

```shell
docker start coolq
docker stop coolq
```
## Auto-Start with supervisord
Since I have a scheduled task to turn the computer on and off at regular intervals, and CoolQ doesn't start automatically, I chose `supervisord` to auto-start it.
Note `autorestart=false`, because after starting `coolq`, it will `exit(0)`, causing `supervisord` to constantly attempt to restart. We only need it to start once.

```
[program:coolq]
command=docker start coolq
stderr_logfile=/var/log/supervisor/error_coolq.log
stdout_logfile=/var/log/supervisor/coolq.log
directory=/home
autostart=true
user=docker
autorestart=false
```

## Configuration Information
### Account Configuration File
Note that the reporting address cannot be `127.0.0.1` because the container has its own `127.0.0.1`. In general, you can use the machine's `ip` address as the reporting address.

```
[123456789]
use_ws = false
use_ws_reverse = false
serve_data_files = yes
access_token = 11111111111111111
log_level = error
post_url = http://example.com:8080
secret = 11111111111111111
show_log_console = false
event_filter = filter.json
```

### Filter and Report HTTP Configuration File
* Private messages
* Group messages where the robot is @ mentioned and not anonymous
* Non-anonymous group messages with the words 'come out'
* Friend requests, group invitations, group join requests

```
{
    ".or": [
        {
            "message_type": "private"
        },
        {
            "message_type": "group",
            "anonymous": {
                ".eq": null
            },
            "raw_message": {
                ".regex": "CQ:at,qq=2450184313|^come out$"
            }
        },
        {
            "post_type": "request"
        }
    ]
}
```

## Firewall
Due to Docker directly modifying iptables and having higher priority than ufw, the opening and closing of its listening ports cannot be controlled through ufw, and Docker information needs to be manually configured.

```shell
# vim /etc/default/ufw
DEFAULT_FORWARD_POLICY="ACCEPT"
```

```shell
# vim /etc/ufw/before.rules
# Add the following content before *filter
# 172.17.0.0/16 is the docker bridge address, may vary
*nat
:POSTROUTING ACCEPT [0:0]
-A POSTROUTING ! -o docker0 -s 172.17.0.0/16 -j MASQUERADE
COMMIT

```

```shell
# vim /etc/default/docker
# Add this configuration information
DOCKER_OPTS="--dns 8.8.8.8 --dns 8.8.4.4 --iptables=false"
```
```shell
# vim /etc/docker/daemon.json
# Create this file if it doesn't exist
{
"iptables": false
}
```
Restart daemon, docker, and ufw
```shell
systemctl daemon-reload && systemctl restart docker && ufw reload
```