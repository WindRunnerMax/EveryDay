# Ubuntu20.04配置CuckooSandbox环境
因为最近要做恶意软件分析，阅读论文发现动态分析的效果普遍比静态分析的效果要好一些，所以需要搭建一个动态分析的环境，查阅资料发现`Cuckoo Sandbox`是不错的自动化分析环境，但是搭建起来还是比较复杂的，主要是在配置虚拟机环境以及网络配置方面。

## 基础环境
文中的环境是`Ubuntu 20.04 Server`，也就是服务器版，后来为了配置虚拟机尝试过`GNOME`还有`xfce4`桌面环境，其实纯服务器环境即可完成配置，但是在配置虚拟机环境时可能会卡，所以还是有必要装一个桌面环境的。   
在配置环境的时候建议配置一个新用户出来，`Cuckoo`官方不建议使用`root`权限搭建环境，最好是配置一个有`sudo`权限的用户，在本文中我配置的新用户名为`Czy`，注意要使用有`sudo`权限的用户创建，比如`root`等，对了别忘了在创建好新用户后在`/etc/passwd`将创建用户的默认的`bash`环境`/bin/sh`更改为`/bin/bash`，默认的`/bin/sh`在登陆后只有一个`$`不太好用。

```bash
sudo useradd -m Czy # 添加Czy用户并生成home目录
sudo usermod -aG sudo Czy # 添加到超级用户组即sudo权限
```
```bash
# /etc/passwd
Czy:x:1001:1001::/home/Czy:/bin/bash
```

`SSH`软件使用的是`MobaXterm`，可以直接在本地实现`virtualbox`的图形界面，不过还是比较卡，肯定是不如直接使用图形界面的快，但是也只是配置过程中需要使用，真正使用`Cuckoo`时就不需要手动启动虚拟机环境了，如果用`Xbash`的话需要配合`Xmanager`才能在本地拉起`virtualbox`的图形界面，此外建议安装`WinSCP`用来传输文件，这个为了方便可以用`root`登录，不过要注意用`root`登录后传输后的文件的所有者都是`root`，写文件的话需要更改权限。  

![](screenshots/2023-04-14-18-51-55.png)

## 安装Anaconda 
首先来说明为什么要安装`Anaconda `，首先在`Cuckoo`不建议直接使用主`python`环境进行配置，建议使用`venv`，还有一个更重要的原因，在`Ubuntu 20.04`已经不建议使用`python2`了，而到目前为止`Cuckoo`只支持`python2`，之前在`16.04`使用`pyhton`就能拉起的环境现在需要安装`python2`并且必须使用`python2`命令才能唤起，所以为了避免出现各种问题，还是选择使用`Anaconda`进行环境配置。  
首先下载`Anaconda`安装包，我下载的版本为`Anaconda3-2019.03-Linux-x86_64.sh`，在清华的镜像站`https://mirrors.tuna.tsinghua.edu.cn/anaconda/archive/`下载即可，之后便是直接`./`运行该可执行文件，如果不能执行的话可能是没有`x`权限，直接`sudo chmod 755  Anaconda3-2019.03-Linux-x86_64.sh`运行即可安装，安装过程不再赘述，可以参考其他的文章 。  
在`conda`环境中安装`python 2.7`，然后这个虚拟环境我命名为`python2`，在下边的脚本要用到。
在`Conda`安装的最后会提示你是否加入到环境变量，如果加入到环境变量的话那么每次`ssh`到服务器都会自动运行`conda`环境的，我个人不是很喜欢，于是我自行写了一个`.sh`文件，需要的时候我再去执行这个`.sh`文件即可唤醒环境，注意该文件的`x`执行权限，`755`一把梭就行。  
其实这些都不算重点，能跑起来`python 2.7`的环境都是胜利。

```bash
#!/bin/bash

# >>> conda initialize >>>
# !! Contents within this block are managed by 'conda init' !!
__conda_setup="$('/home/Czy/application/conda/bin/conda' 'bash.bash' 'hook' 2> /dev/null)"
if [ $? -eq 0 ]; then
    eval "$__conda_setup"
else
    if [ -f "/home/Czy/application/conda/etc/profile.d/conda.sh" ]; then
        . "/home/Czy/application/conda/etc/profile.d/conda.sh"
    else
        export PATH="/home/Czy/application/conda/bin:$PATH"
    fi
fi
unset __conda_setup
# <<< conda initialize <<<
conda activate python2
```
```bash
source ./python2-conda.sh
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210607104439839.png)

## 安装Cuckoo

### 安装python库
我是直接执行了`sudo pip install -U cuckoo`，然后执行过程中告诉我缺啥我都再装，虽然这样不太好但是也不是不行哈哈，文档对于这块说的还是比较清楚的，这里借鉴一下其他博客说明的安装环境，如果安装失败，搜索一下错误，我就遇到过一个编译`image`什么的错误，是在`github issue`中找到一个用`apt`安装的依赖才解决的，但是具体记不清了。

```bash
sudo apt-get install python python-pip python-dev libffi-dev libssl-dev
sudo apt-get install python-virtualenv python-setuptools
sudo apt-get install libjpeg-dev zlib1g-dev swig
```

### 安装MongoDB
为了使用基于`Django`的`Web`界面，需要使用`MongoDB`，也就是为了启动`cuckoo web runserver 0.0.0.0:8000`的环境依赖，之后还需要配置用户名密码与数据库信息，这个在下一节会细说。

```bash
sudo apt-get install mongodb
```

### 安装PostgreSQL
`Cuckoo`的`Web`服务需要一个数据库，在配置文件中可以看出`sqlite`、`postgresql`、`mysql`都是可以的，由于我比较熟悉`Mysql`的操作本来想指定`Mysql`作为选定数据库来着，但是由于装`python_mysql`的驱动一直出问题，我估计是因为我装的`Mysql 8.0`，而`Python 2.7`早已不再维护了，所以无法正常使用驱动了，所以最终还是选择`PostgreSQL`，当然这个也需要配置用户名密码等，这个下一节再说明。

```bash
sudo apt-get install postgresql libpq-dev
```
### 安装virtualbox
首先需要安装`virtualbox`，直接使用`apt-get`安装即可。

```bash
sudo apt-get install virtualbox
```

如果像我一样是使用的服务器而没有实体机，而且我的服务器在实体机上是使用`VMware Workstation`管理的，那么这个状态就相当于在虚拟机中安装虚拟机，那么就需要在主体实体机的`VMware Workstation`中修改虚拟机配置在，`Processors`中启用`VT-X`或`AMD-V`，也就是启动虚拟化才可以。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210607204557586.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQwNDEzNjcw,size_16,color_FFFFFF,t_70)


### 安装tcpdump
为了在执行期间转储恶意软件执行的网络活动，需要正确配置网络嗅探器以捕获流量并将其转储到文件中。

```bash
sudo apt-get install tcpdump apparmor-utils
sudo aa-disable /usr/sbin/tcpdump
```

请注意，只有在使用默认目录时才需要`apparmor`禁用配置文件(`aa-disable`命令)，`CWD`因为`apparmor`会阻止创建实际的`PCAP`文件(另请参阅`tcpdump`的权限被拒绝)，对于禁用`apparmor`的`Linux`平台(例如，`Debian`)，以下命令就足以安装`tcpdump` 。

```bash
sudo apt-get install tcpdump
```

`tcpdump`需要`root`权限，但由于不希望`Cuckoo`以`root`身份运行，因此必须为二进制文件设置特定的`Linux`功能。

```bash
sudo groupadd pcap
sudo usermod -a -G pcap Czy # 这里是用户名
sudo chgrp pcap /usr/sbin/tcpdump
sudo setcap cap_net_raw,cap_net_admin=eip /usr/sbin/tcpdump
```

可以使用以下命令验证上一个命令的结果。

```bash
getcap /usr/sbin/tcpdump
# /usr/sbin/tcpdump = cap_net_admin,cap_net_raw+eip
```
如果没有安装`setcap`则安装。

```bash
sudo apt-get install libcap2-bin
```
或者以其他方式(不推荐)的做法。

```bash
sudo chmod +s /usr/sbin/tcpdump
```

### 安装Volatility
`Volatility`是一种可选工具，可对内存转储进行取证分析，与`Cuckoo`结合使用，它可以自动提供对操作系统深度修改的额外可视性，并检测逃脱`Cuckoo`分析器监控域的`rootkit`技术的存在。

```bash
git clone https://github.com/volatilityfoundation/volatility.git
cd volatility
sudo python setup.py build
sudo python setup.py install
```

### 安装M2Crypto
目前`M2Crypto`只有在安装`SWIG`时才支持该库，在`Ubuntu /Debian`的系统上，可以按如下方式完成。

```bash
sudo apt-get install swig
sudo pip install m2crypto==0.24.0
```

## Cuckoo环境配置

`cuckoo`默认安装在当前用户目录下，即`~/.cuckoo`，我们可以使用`cuckoo -d`来启动`cuckoo`。

### 配置virtualbox虚拟机
这是个比较大的工程，为了方便我们直接在图形界面上完成这个操作。  
首先我们需要准备好一个`XP`镜像，镜像需要自行下载，可以去`MSDN`下载，之后还要准备一个密钥，这个可以自行百度，多试试总有能用的。  
点击新建，这边的`name`填`cuckoo1`，因为我有一个重名的了所以写了个`2`，这边一定要写好是`cuckoo1`，选择好`windows XP 32-bit`系统。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210607112214968.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQwNDEzNjcw,size_16,color_FFFFFF,t_70)
之后便是分配内存和硬盘存储等，可以一路`next`，接下来要启动安装镜像。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210607112344625.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQwNDEzNjcw,size_16,color_FFFFFF,t_70)

在此处选择下载好的`xp`系统镜像，接下来就跟随着系统进行安装，安装完成后将虚拟机关机，在`Setting`中的`Storage`中将光盘形状的这个位置的启动位置移除即可，否则每次开机都会提示你按任意键从光盘启动，那么便又会启动一次安装程序。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210607112748263.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQwNDEzNjcw,size_16,color_FFFFFF,t_70)
接下来需要配置网络环境，在启动的`virtualbox`中新建一个虚拟网卡，配置的`ip`地址等如下所示。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210607170913896.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQwNDEzNjcw,size_16,color_FFFFFF,t_70)

之后在我们新建的`cuckoo1`的虚拟机设置网络，如下所示，`Host-only`是代表只允许与宿主机通信，如果需要访问外网的话，请继续看下边的网络配置。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210607171018171.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQwNDEzNjcw,size_16,color_FFFFFF,t_70)

之后我们要配置一下虚拟机的外网网络环境，刚才我们新建了这个虚拟网卡，之后为了通信我们还需要将虚拟机里设置一个固定的`ip`地址，也就是刚才我们设置的虚拟网卡网关的子网，但是我们如果我们直接在`xp`系统里设置虚拟机的`ip`地址之后是无法上网的，所以我们需要在`ubuntu`中配置一个`NAT`网络转发，在这里我们直接使用`iptables `进行网络转发，这里每次开机都会重置，如果想要开机自动可以使用`systemctl`进行开机自启动管理，需要编写`UNIT`，在这里就不赘述了，在这里我们还是写到一个`sh`文件中需要的时候再执行即可。  
注意在下边这个`ens160`是我的网卡，可以使用`ifconfig`查看网卡名称，之后的`192.168.56.0/24`就是主机以及网络号划分的子网，如果上边的`ip`配置都是根据文章来的话，那就只需要修改这个网卡名称即可。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210607172721482.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQwNDEzNjcw,size_16,color_FFFFFF,t_70)


```bash
echo 1 | sudo tee -a /proc/sys/net/ipv4/ip_forward
sudo sysctl -w net.ipv4.ip_forward=1

sudo iptables -t nat -A POSTROUTING -o ens160 -s 192.168.56.0/24 -j MASQUERADE # 网卡名称 ens160 
sudo iptables -P FORWARD DROP
sudo iptables -A FORWARD -m state --state RELATED,ESTABLISHED -j ACCEPT
sudo iptables -A FORWARD -s 192.168.56.0/24 -j ACCEPT
sudo iptables -A FORWARD -s 192.168.56.0/24 -d 192.168.56.0/24 -j ACCEPT
sudo iptables -A FORWARD -j LOG
```

```bash
sudo ./network-transform.sh
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210607182339190.png)


接下来启动这个虚拟机，我们需要在这里关闭防火墙与自动更新，并且配置好`ip`地址。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210607183105206.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQwNDEzNjcw,size_16,color_FFFFFF,t_70)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210607183140981.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQwNDEzNjcw,size_16,color_FFFFFF,t_70)

另外还需要在虚拟机中进行网络配置以及启动一个`agent.py`，这个文件在`~/.cuckoo/agent/agent.py`，也就是说在虚拟机中也必须安装`python 2.7`环境，如果需要截图的话，还需要`PIL`包，在这里就不赘述安装过程了，无论是使用虚拟机共享磁盘还是搭建文件服务器环境等方式，或者是直接在`xp`虚拟机中下载`python`安装包并安装即可，使用`python3`启动简单的文件服务器命令如下。

```python
python3 -m http.server --bind 0.0.0.0 8088
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210702164405351.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQwNDEzNjcw,size_16,color_FFFFFF,t_70)


  之后我们可以直接双击启动`agent.py`，另外也可以在`C:\Document and Settings\Administrator\start menu\program\start`设置让其开机自启，当然这个也没要必要，因为我们只需要创建快照即可，在运行`agent.py`之后，我们可以使用`netstat`命令查看`8000`端口是否被占用，如果已经占用就说明`agent.py`成功启动。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210607185737997.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQwNDEzNjcw,size_16,color_FFFFFF,t_70)


等环境全部搭建完成之后，我们需要创建快照，务必注意名字要命名为`snapshot1`，默认的为`Snapshot 1`，注意是首字母大写以及`1`之前有个空格的，所以我们要命名为`snapshot1`。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210607185813867.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQwNDEzNjcw,size_16,color_FFFFFF,t_70)
之后我们就关闭虚拟机即可，在运行`cuckoo`过程中不需要手动启动虚拟机。

### 创建数据库
之前我们安装了`MongoDB`与`PostgreSQL`，接下来我们需要为其创建一个用户以及创建数据库，这里统一一下用户名都为`cuckoo`，密码都为`1234567890-=`，数据库名都为`cuckoo`，下边的配置文件要用得到，具体过程请参照各自的数据库命令。

### 配置文件
所有的配置文件都在`~/.cuckoo/conf/`目录下，`cuckoo.conf`配置文件，重要位置已标出。

```
[cuckoo]
version_check = yes
ignore_vulnerabilities = no
api_token = uIfx
web_secret = 
delete_original = no
delete_bin_copy = no
machinery = virtualbox
memory_dump = no
terminate_processes = no
reschedule = no
process_results = yes
max_analysis_count = 0
max_machines_count = 0
max_vmstartup_count = 10
freespace = 1024
tmppath = 
rooter = /tmp/cuckoo-rooter

[feedback]
enabled = no
name = 
company = 
email = 

[resultserver]
ip = 192.168.109.206 ### 主机地址
port = 2042 ### 端口
upload_max_size = 134217728

[processing].
analysis_size_limit = 134217728
resolve_dns = yes
sort_pcap = yes

[database]
connection = postgresql://cuckoo:1234567890-=@localhost:5432/cuckoo ### 数据库链接
timeout = 60

[timeouts]
default = 120
critical = 60
vm_state = 60

[remotecontrol]
enabled = no
guacd_host = localhost
guacd_port = 4822
```

`virtualbox.conf`配置文件，重要位置已标出。

```
[virtualbox]
mode = headless
path = /usr/bin/VBoxManage
interface = vboxnet0 ### 默认网卡
machines = cuckoo1 ### 虚拟机名称
controlports = 5000-5050

[cuckoo1]
label = cuckoo1 ### label
platform = windows
ip = 192.168.56.101 ### 虚拟机ip地址
snapshot = snapshot1 ### 快照名
interface = vboxnet0 ### 虚拟网卡
resultserver_ip = 
resultserver_port = 
tags = 
options = 
osprofile = 

[honeyd]
label = honeyd
platform = linux
ip = 192.168.56.102
tags = service, honeyd
options = nictrace noagent
```

`reporting.conf`配置文件，重要位置已标出。

```
[feedback]
enabled = no ### 启动

[jsondump]
enabled = yes
indent = 4
calls = yes

[singlefile]
enabled = no
html = no
pdf = no

[misp]
enabled = no
url = 
apikey = 
mode = maldoc ipaddr hashes url
distribution = 0
analysis = 0
threat_level = 4
min_malscore = 0
tag = Cuckoo
upload_sample = no

[mongodb]
enabled = yes ### 启用mongodb
host = 127.0.0.1
port = 27017
db = cuckoo ### 数据库名
store_memdump = yes
paginate = 100
username = cuckoo ### 账号
password = 1234567890-= ### 密码

[elasticsearch]
enabled = no
hosts =  127.0.0.1
timeout = 300
calls = no
index = cuckoo
index_time_pattern = yearly
cuckoo_node = 

[moloch]
enabled = no
host = 
insecure = no
moloch_capture = /data/moloch/bin/moloch-capture
conf = /data/moloch/etc/config.ini
instance = cuckoo

[notification]
enabled = no
url = 
identifier = 

[mattermost]
enabled = no
url = 
myurl = 
username = cuckoo
show_virustotal = no
show_signatures = no
show_urls = no
hash_filename = no
hash_url = no
```

## 启动Cuckoo
启动`Cuckoo`需要两个终端，一个终端启动`cuckoo`，另外一个终端启动`cuckoo web runserver`。

```bash
cuckoo
```

```bash
cuckoo web runserver 0.0.0.0:8000
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210607192243446.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQwNDEzNjcw,size_16,color_FFFFFF,t_70)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210607192322183.png)
之后打开该`web`服务，在我的服务器的地址为`http://192.168.109.206:8000/`。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210607192551847.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQwNDEzNjcw,size_16,color_FFFFFF,t_70)
在右上角的`Submit`提交文件，点击`Analyze`即可，现在就可以在执行`cuckoo`的终端查看到分析进度了，在`Dashboard`可以整体查看概览，也可以在`Rencent`中查看已经完成的任务。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210607193218462.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQwNDEzNjcw,size_16,color_FFFFFF,t_70)

另外在正常情况下在分析的时候`$HOME/.cuckoo/storage/analyses`会出现很多`xxx.exe_`和`xxx.dmp`文件，可以使用`crontab`执行一些定时任务出来一下，例如我不需要则在存在时间大于`6`分钟的直接删除。

```shell
*/6 * * * * cd $HOME/.cuckoo/storage/analyses && find ./ -regex .*/memory/.*\.exe_  -mmin +6 -delete && find ./ -regex .*/memory/.*\.dmp  -mmin +6 -delete
```


## 参考
```
https://zh.codeprj.com/blog/a9f9bd1.html
https://cuckoo.sh/docs/introduction/community.html
https://blog.csdn.net/root__user/article/details/89251386
https://blog.csdn.net/qq_42569334/article/details/107212245
```
