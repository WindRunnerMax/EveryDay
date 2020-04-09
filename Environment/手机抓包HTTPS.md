# 手机抓包HTTPS (Fiddler & Packet Capture)

> 以前写了一个小游戏(消灭病毒)的刷金币小脚本，使用需要获取openid ，就需要抓微信的HTTPS包
> 一直都是用Fiddler抓电脑的包，Packet Capture抓手机的包，突然想试一下用电脑抓手机的包
> https://github.com/WindrunnerMax/EliminVirus

## 1. Fiddler
首先下载安装Fiddler
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200210132839652.png)
打开 Tools - Options - HTTPS 并安装证书
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200210133023703.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQwNDEzNjcw,size_16,color_FFFFFF,t_70)
打开 Connections 允许远程主机链接
此操作需重启Fiddler生效
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200210133230914.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQwNDEzNjcw,size_16,color_FFFFFF,t_70)
为了防止防火墙阻止手机链接，暂时关闭防火墙
控制面板 - 防火墙 - 更改通知设置
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200210133407938.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQwNDEzNjcw,size_16,color_FFFFFF,t_70)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200210133433435.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQwNDEzNjcw,size_16,color_FFFFFF,t_70)
需要手机与电脑在同一个局域网，查看本机ip地址
我用的是wifi，所以我只需要wlan的那个网卡显示的ip地址
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200210133747990.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQwNDEzNjcw,size_16,color_FFFFFF,t_70)
手机端打开 ip:8888 下载并安装证书
安装证书如果提示找不到文件，那就去手机的 安全 - 从存储设备安装证书 会让你设置密码
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200210134233485.jpg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQwNDEzNjcw,size_16,color_FFFFFF,t_70)
打开手机的已连接wifi，点击设置手动代理
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200210134633582.jpg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQwNDEzNjcw,size_16,color_FFFFFF,t_70)
打开 微信 - 消灭病毒，Fiddler就可以抓到包了
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200210134753957.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQwNDEzNjcw,size_16,color_FFFFFF,t_70)
## 2. Packet Capture
打开软件右上角 选项-设置
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200210131905368.jpg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQwNDEzNjcw,size_16,color_FFFFFF,t_70)
安装证书
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200210132041860.jpg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQwNDEzNjcw,size_16,color_FFFFFF,t_70)
点击 开始-选择微信
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200210132147890.jpg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQwNDEzNjcw,size_16,color_FFFFFF,t_70)
选择右边带有ssl字样的，即可看到openid
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200210132518622.jpg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQwNDEzNjcw,size_16,color_FFFFFF,t_70)
