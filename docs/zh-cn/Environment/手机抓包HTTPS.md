# 手机抓包HTTPS (Fiddler & Packet Capture)

> 以前写了一个小游戏(消灭病毒)的刷金币小脚本，使用需要获取openid ，就需要抓微信的HTTPS包  
> 一直都是用Fiddler抓电脑的包，Packet Capture抓手机的包，突然想试一下用电脑抓手机的包  
> https://github.com/WindrunnerMax/EliminVirus

## 1. Fiddler
首先下载安装Fiddler

![](screenshots/2023-04-14-19-00-50.png)

打开 Tools - Options - HTTPS 并安装证书

![](screenshots/2023-04-14-19-01-00.png)

打开 Connections 允许远程主机链接
此操作需重启Fiddler生效

![](screenshots/2023-04-14-19-01-09.png)

为了防止防火墙阻止手机链接，暂时关闭防火墙
控制面板 - 防火墙 - 更改通知设置

![](screenshots/2023-04-14-19-01-19.png)

![](screenshots/2023-04-14-19-01-26.png)

需要手机与电脑在同一个局域网，查看本机ip地址
我用的是wifi，所以我只需要wlan的那个网卡显示的ip地址

![](screenshots/2023-04-14-19-01-36.png)

手机端打开 ip:8888 下载并安装证书
安装证书如果提示找不到文件，那就去手机的 安全 - 从存储设备安装证书 会让你设置密码

![](screenshots/2023-04-14-19-01-47.png)

打开手机的已连接wifi，点击设置手动代理

![](screenshots/2023-04-14-19-01-56.png)

打开 微信 - 消灭病毒，Fiddler就可以抓到包了

![](screenshots/2023-04-14-19-02-06.png)
## 2. Packet Capture
打开软件右上角 选项-设置

![](screenshots/2023-04-14-19-02-14.png)

安装证书

![](screenshots/2023-04-14-19-02-23.png)

点击 开始-选择微信

![](screenshots/2023-04-14-19-02-30.png)

选择右边带有ssl字样的，即可看到openid

![](screenshots/2023-04-14-19-02-36.png)
