# Setting up CuckooSandbox environment on Ubuntu 20.04

Recently, I needed to analyze malware and found that dynamic analysis generally yields better results than static analysis. Therefore, I needed to set up a dynamic analysis environment. After researching, I found that Cuckoo Sandbox is a good automated analysis environment, but it's quite complex to set up, especially in configuring the virtual machine environment and network settings.

## Basic Environment
The environment in this article is Ubuntu 20.04 Server. Later, I tried using the GNOME and xfce4 desktop environments to configure virtual machines. In reality, the configuration can be completed in a pure server environment, but there may be performance issues when configuring the virtual machine environment, so it's necessary to install a desktop environment.   
When setting up the environment, it is recommended to create a new user. The Cuckoo official documentation advises against using root privileges to set up the environment. It's best to configure a user with sudo privileges. In this article, I created a new username "Czy". It's important to use a user with sudo privileges for creation, such as root. Also, don't forget to change the default shell environment for the created user in `/etc/passwd` from `/bin/sh` to `/bin/bash`. The default `/bin/sh` shell has only a single `$` prompt after logging in, which is not very convenient.

```bash
sudo useradd -m Czy  # Add the user Czy and create a home directory
sudo usermod -aG sudo Czy  # Add to the sudo group for superuser privileges
```
```bash
# /etc/passwd
Czy:x:1001:1001::/home/Czy:/bin/bash
```

I used MobaXterm for SSH software, which allows for a graphical interface for VirtualBox on the local machine. However, it's a bit slow and definitely not as fast as using a graphical interface directly. But it's only needed during the configuration process; when using Cuckoo, manual startup of the virtual machine environment is not required. If using Xbash, it's recommended to use Xmanager to launch VirtualBox's graphical interface locally. Additionally, I recommend installing WinSCP for file transfer. To make it convenient, you can log in as root to use WinSCP. However, be aware that files transferred after logging in as root will be owned by root, and changing permissions is necessary to modify these files.

![](screenshots/2023-04-14-18-51-55.jpg)

## Installing Anaconda
First, let's explain why we need to install Anaconda. Firstly, Cuckoo does not recommend using the main Python environment directly for configuration; it recommends using venv. Secondly, an even more important reason is that Ubuntu 20.04 no longer recommends using Python 2. Up to now, Cuckoo only supports Python 2. Previously, in 16.04, using Python was sufficient to launch the environment, but now Python 2 needs to be installed and the `python2` command must be used to start it. In order to avoid various problems, using Anaconda for environment configuration is a better choice.
Download the Anaconda installation package, I downloaded the version `Anaconda3-2019.03-Linux-x86_64.sh` from Tsinghua's mirror site `https://mirrors.tuna.tsinghua.edu.cn/anaconda/archive/`. After downloading, simply run the executable file using `./`. If it cannot be executed, it may not have the `x` permission. You can run `sudo chmod 755 Anaconda3-2019.03-Linux-x86_64.sh` to install. The installation process is not elaborated here and can be referenced from other articles.  
Install Python 2.7 in the conda environment, and I named this virtual environment `python2`, which will be used in the script below.  
At the end of the Conda installation, you will be prompted whether to add it to the environment variable. If added to the environment variable, the Conda environment will automatically run each time you `ssh` to the server. Personally, I don't like this, so I created my own `.sh` file. When needed, I simply execute this `.sh` file to activate the environment. Make sure the file has execution permission, `755` for example.  
In fact, these details are not the focus; the successful startup of the Python 2.7 environment is the main point.

```bash
#!/bin/bash

```bash
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

![](screenshots/2023-04-14-20-29-24.png)

## Installing Cuckoo

### Installing Python Libraries
I just straight up did `sudo pip install -U cuckoo`, and then during the process, if it told me something was missing, I'd install it again. It's not the best way, but it works, haha. The documentation explains this quite clearly. Here, I'll also borrow some installation environment instructions from other blog posts. If the installation fails, search for the error. I once encountered a compilation error related to `image`, and I solved it by finding a dependency to install using `apt` in a `github issue`, but I can't remember the specifics.

```bash
sudo apt-get install python python-pip python-dev libffi-dev libssl-dev
sudo apt-get install python-virtualenv python-setuptools
sudo apt-get install libjpeg-dev zlib1g-dev swig
```

### Installing MongoDB
To use the `Django`-based `Web` interface, you need to use `MongoDB`, which is required for the environment to run `cuckoo web runserver 0.0.0.0:8000`. Later, you'll need to configure the username, password, and database information, which I'll explain in the next section.

```bash
sudo apt-get install mongodb
```

### Installing PostgreSQL
The `Web` service of `Cuckoo` requires a database, as can be seen in the configuration file: `sqlite`, `postgresql`, and `mysql` are all viable options. I initially wanted to specify `Mysql` as the selected database because I'm more familiar with it. However, I had trouble installing the `python_mysql` driver, probably because I installed `Mysql 8.0`, and `Python 2.7` is no longer supported, so the driver couldn't work properly. Ultimately, I chose `PostgreSQL`. Of course, this also requires configuring usernames, passwords, and so on, as I'll explain in the next section.

```bash
sudo apt-get install postgresql libpq-dev
```
### Installing VirtualBox
First, you need to install `virtualbox`, which you can do using `apt-get`.

```bash
sudo apt-get install virtualbox
```

If, like me, you are using a server without physical hardware and your server is being managed by `VMware Workstation` on a physical machine, then this situation is essentially installing virtual machines within a virtual machine. Therefore, you need to modify the virtual machine configuration in `VMware Workstation` on the host physical machine to enable `VT-X` or `AMD-V` in the `Processors` section, which is essentially enabling virtualization.

![](screenshots/2023-04-14-20-29-31.jpg)


### Installing tcpdump

To dump the network activities of malicious software during execution, it's necessary to configure the network sniffer correctly to capture traffic and dump it into a file.

```bash
sudo apt-get install tcpdump apparmor-utils
sudo aa-disable /usr/sbin/tcpdump
```

Note that the `apparmor` disable configuration file (`aa-disable` command) is only required when using the default directory, since `apparmor` would otherwise prevent the creation of actual `PCAP` files (also see the permission denied issues with `tcpdump`). For `Linux` platforms (e.g., `Debian`) with `apparmor` disabled, the following command is sufficient to install `tcpdump`.

```bash
sudo apt-get install tcpdump
```

`tcpdump` requires `root` privileges, but because we do not want `Cuckoo` to run as `root`, specific Linux capabilities must be set for the binary file.

```bash
sudo groupadd pcap
sudo usermod -a -G pcap Czy # This is the username
sudo chgrp pcap /usr/sbin/tcpdump
sudo setcap cap_net_raw,cap_net_admin=eip /usr/sbin/tcpdump
```

You can use the following command to verify the result of the previous command.

```bash
getcap /usr/sbin/tcpdump
# /usr/sbin/tcpdump = cap_net_admin,cap_net_raw+eip
```

If `setcap` is not installed, then install it.

```bash
sudo apt-get install libcap2-bin
```

Alternatively, you can use another (not recommended) approach.

```bash
sudo chmod +s /usr/sbin/tcpdump
```

### Installing Volatility

`Volatility` is an optional tool for forensic analysis of memory dumps. When combined with `Cuckoo`, it automatically provides additional visibility into deep modifications of the operating system and detects the presence of rootkit techniques attempting to escape the `Cuckoo` analyzer's monitoring domain.

```bash
git clone https://github.com/volatilityfoundation/volatility.git
cd volatility
sudo python setup.py build
sudo python setup.py install
```

### Installing M2Crypto

Currently, `M2Crypto` only supports the library when `SWIG` is installed. On `Ubuntu/Debian` systems, you can accomplish this as follows.

```bash
sudo apt-get install swig
sudo pip install m2crypto==0.24.0
```

## Cuckoo Environment Configuration

`Cuckoo` is installed by default in the current user's directory, i.e., `~/.cuckoo`. You can start `Cuckoo` using `cuckoo -d`.

### Configuring VirtualBox Virtual Machine

This is a rather extensive undertaking, so to make things easier, we will complete this operation directly in the graphical interface.  
First, you need to prepare a `Windows XP` image, which you will need to download yourself, perhaps from `MSDN`. Additionally, you'll need to prepare an activation key, which can be found through a quick search.  
Click "New", name the machine `cuckoo1` (I used a `2` because I already have one with the same name, but be sure to use `cuckoo1`), and select `Windows XP 32-bit` as the operating system.

![](screenshots/2023-04-14-20-29-41.jpg)

Next, allocate memory and storage space, and proceed by clicking "Next". Then, you will need to start the installation image.

![](screenshots/2023-04-14-20-29-47.jpg)

Here, select the downloaded `XP` system image, and follow the system's installation process. After the installation is complete, shut down the virtual machine. In the `Settings` under `Storage`, remove the boot position of the disc shape to prevent the program from prompting you to boot from the CD every time you start the machine, as this would reinitiate the installation process.

![](screenshots/2023-04-14-20-29-55.jpg)

Next, we need to configure the network environment by creating a new virtual network card in the running `virtualbox` and setting the `ip` address as follows.

![](screenshots/2023-04-14-20-30-02.jpg)

Afterward, in our newly created `cuckoo1` virtual machine, we set the network as shown below, where `Host-only` means only allowing communication with the host machine. If access to the external network is required, please continue to review the network configuration below.

![](screenshots/2023-04-14-20-30-10.jpg)

Next, we need to configure the external network environment for the virtual machine. After creating the virtual network card earlier, in order to communicate, we also need to assign a fixed `ip` address within the virtual machine, which is within the subnet of the gateway of the virtual network card we just set. However, if we directly set the virtual machine's `ip` address in the `xp` system, it won't be able to access the internet. Therefore, in order to enable internet access, we need to configure network address translation (NAT) in `ubuntu`. Here, we will directly use `iptables` for network forwarding, which will reset each time the system is restarted. If automatic start on boot is desired, `systemctl` can be used for startup management, requiring the creation of a `UNIT`. However, we won't delve into this here. Instead, we will simply write the necessary commands into a `.sh` file and execute it when needed.  
Please note that in the command below, `ens160` is my network card, you can use `ifconfig` to check the network card name, and `192.168.56.0/24` represents the subnet of the host and network number. If the `ip` configurations above are based on the provided article, then only the network card name needs to be modified.

![](screenshots/2023-04-14-20-30-17.png)

```bash
echo 1 | sudo tee -a /proc/sys/net/ipv4/ip_forward
sudo sysctl -w net.ipv4.ip_forward=1

sudo iptables -t nat -A POSTROUTING -o ens160 -s 192.168.56.0/24 -j MASQUERADE # network card name is ens160 
sudo iptables -P FORWARD DROP
sudo iptables -A FORWARD -m state --state RELATED,ESTABLISHED -j ACCEPT
sudo iptables -A FORWARD -s 192.168.56.0/24 -j ACCEPT
sudo iptables -A FORWARD -s 192.168.56.0/24 -d 192.168.56.0/24 -j ACCEPT
sudo iptables -A FORWARD -j LOG
```

```bash
sudo ./network-transform.sh
```

![](screenshots/2023-04-14-20-30-42.png)

Next, start the virtual machine, and here we need to disable the firewall and automatic updates, and configure the `ip` address.

![](screenshots/2023-04-14-20-30-50.png)
![](screenshots/2023-04-14-20-30-58.png)

Also, network configuration and the launch of `agent.py` need to be performed within the virtual machine. The file is located at `~/.cuckoo/agent/agent.py`, which means that the virtual machine must also have `python 2.7` installed. If screenshots are required, the `PIL` package is also necessary. We won't elaborate on the installation process here. Finally, regardless of whether it's using shared disk in the virtual machine, setting up a file server environment, or directly downloading and installing the `python` installation package in the `xp` virtual machine, using `python3` to start a simple file server command is as follows.

```python
python3 -m http.server --bind 0.0.0.0 8088
```

![](screenshots/2023-04-14-20-31-04.jpg)

Afterwards, you can directly double-click to launch `agent.py`. Additionally, you can set it to start automatically at boot by going to `C:\Document and Settings\Administrator\start menu\program\start`, although this isn't really necessary because all we need to do is create a snapshot. After running `agent.py`, you can use the `netstat` command to check if port `8000` is in use. If it is, it means `agent.py` has been successfully started.

![Screenshot](screenshots/2023-04-14-20-31-15.jpg)

Once all the environment is set up, we need to create a snapshot. It's important to name it `snapshot1`, with the default being `Snapshot 1`. Please note that the first letter should be capitalized and there should be a space before the `1`. Therefore, we should name it `snapshot1`.

![Screenshot](screenshots/2023-04-14-20-31-22.jpg)

After that, you can close the virtual machine. There's no need to manually start the virtual machine during the `cuckoo` running process.

### Creating a Database
Earlier, we installed `MongoDB` and `PostgreSQL`. Next, we need to create a user and a database for them. Let's standardize the username as `cuckoo`, password as `1234567890-=`, and database name as `cuckoo`. The following configuration file will be used. Please refer to the respective database commands for the specific process.

### Configuration File
All configuration files are located in the `~/.cuckoo/conf/` directory. `cuckoo.conf` is the configuration file where important positions are marked as follows:

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
ip = 192.168.109.206 ### Host address
port = 2042 ### Port
upload_max_size = 134217728

[processing].
analysis_size_limit = 134217728
resolve_dns = yes
sort_pcap = yes

[database]
connection = postgresql://cuckoo:1234567890-=@localhost:5432/cuckoo ### Database link
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

The `virtualbox.conf` configuration file is as follows:

```
[virtualbox]
mode = headless
path = /usr/bin/VBoxManage
interface = vboxnet0 ### Default network card
machines = cuckoo1 ### Virtual machine name
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

The `reporting.conf` configuration file, important sections have been marked.

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

## Start Cuckoo
Starting `Cuckoo` requires two terminals. One terminal is used to start `cuckoo`, and the other terminal is used to start `cuckoo web runserver`.

```bash
cuckoo
```

```bash
cuckoo web runserver 0.0.0.0:8000
```

![](screenshots/2023-04-14-20-31-43.jpg)

![](screenshots/2023-04-14-20-32-18.png)

Afterward, open the `web` service, the address in my server is `http://192.168.109.206:8000/`.

![](screenshots/2023-04-14-20-31-53.png)

Click on `Submit` in the upper right corner to submit a file, then click `Analyze`. Now you can monitor the analysis progress in the `cuckoo` terminal. You can oversee the overview in the `Dashboard` and view completed tasks in `Rencent`.

![](screenshots/2023-04-14-20-32-01.jpg)

In normal circumstances, when analyzing, there will be many `xxx.exe_` and `xxx.dmp` files in `$HOME/.cuckoo/storage/analyses` directory. You can use `crontab` to execute some scheduled tasks. For example, if I don't need them, I can directly delete those files that have been in existence for more than `6` minutes.

```shell
*/6 * * * * cd $HOME/.cuckoo/storage/analyses && find ./ -regex .*/memory/.*\.exe_  -mmin +6 -delete && find ./ -regex .*/memory/.*\.dmp  -mmin +6 -delete
```

## Reference
```
https://zh.codeprj.com/blog/a9f9bd1.html
https://cuckoo.sh/docs/introduction/community.html
https://blog.csdn.net/root__user/article/details/89251386
https://blog.csdn.net/qq_42569334/article/details/107212245
```