# Ubuntu安装QQ机器人
> 看了看现在QQ机器人似乎只有酷Q机器人有Docker可以在linux上运行了  
> 那就k开始装酷Q机器人，资源占用也不是很大，大概占用180M内存吧

## 安装酷Q HTTP
首先安装好`docker`  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020030222182724.png)  
酷Q官网提供了`docker` [COOLQ Docker 2.0](https://cqp.cc/t/34558)  
但是我是打算通过`HTTP`进行一些功能开发的，于是选择了大佬做的带`HTTP`插件的 [CQHTTP Docker](https://richardchien.gitee.io/coolq-http-api/docs/4.12/#/Docker)  
首先`pull`镜像，我觉得下载的比较慢，挂了一个`screen`慢慢下

```shell
docker pull richardchien/cqhttp:latest
```
下载完成后启动容器进行测试

```powershell
docker run -ti --rm --name coolq \
        -v /home/coolq:/home/user/coolq \  # 将宿主目录挂载到容器内用于持久化 酷Q 的程序文件
        -p 9000:9000 \  # noVNC 端口，用于从浏览器控制 酷Q
        -p 5700:5700 \  # HTTP API 插件开放的端口
        -e COOLQ_ACCOUNT=123456 \ # 要登录的 QQ 账号，可选但建议填
        -e CQHTTP_POST_URL=http://example.com:8080 \  # 事件上报地址
        -e VNC_PASSWD=111111111 \ # noVnc密码
        -e CQHTTP_SERVE_DATA_FILES=yes \  # 允许通过 HTTP 接口访问 酷Q 数据文件
        richardchien/cqhttp:latest
```
此时可以登录`noVNC`查看并且登录了
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200302223049172.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQwNDEzNjcw,size_16,color_FFFFFF,t_70)
如果测试没有问题的话，就讲启动参数中的`--rm`改为`-d`就可以存储运行了

```shell
docker start coolq
docker stop coolq
```
## supervisord开机自启
由于我有一个定时任务多久开关机一次，但是`coolq`不会开机自启动，选择`supervisord`进行开机自启
注意`autorestart=false`，由于启动`coolq`后会`exit(0)`，所以`supervisord`会不断尝试重启，我们只需要他启动一次就好
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

## 配置信息
### 账号的配置文件
注意上报地址不能为`127.0.0.1`，因为容器内有自己的`127.0.0.1`，一般情况下可使用机器`ip`作为上报地址

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

### 过滤上报HTTP配置文件
* 私聊消息
* 非匿名发送的@机器人的群消息
* 非匿名的‘出来’群消息
* 加好友消息、加群邀请、加群请求

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
                ".regex": "CQ:at,qq=2450184313|^出来$"
            }
        },
        {
            "post_type": "request"
        }
    ]
}
```

## 防火墙
由于`Docker`直接更改`iptables`且优先级比`ufw`高，不能通过`ufw`控制其监听端口的开放关闭，需要手动配置`Docker`信息

```shell
# vim /etc/default/ufw
DEFAULT_FORWARD_POLICY="ACCEPT"
```

```shell
# vim /etc/ufw/before.rules
# *filter前面添加下面内容 
# 172.17.0.0/16 为docker网桥地址，可能不同
*nat
:POSTROUTING ACCEPT [0:0]
-A POSTROUTING ! -o docker0 -s 172.17.0.0/16 -j MASQUERADE
COMMIT

```

```shell
# vim /etc/default/docker
# 添加此条配置信息
DOCKER_OPTS="--dns 8.8.8.8 --dns 8.8.4.4 --iptables=false"
```
```shell
# vim /etc/docker/daemon.json
# 没有此文件则创建
{
"iptables": false
}
```
重启`daemon`、`docker`、`ufw`
```shell
systemctl daemon-reload && systemctl restart docker && ufw reload
```