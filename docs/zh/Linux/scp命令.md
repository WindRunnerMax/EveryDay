# scp命令
`scp`命令用于`Linux`之间复制文件和目录，`scp`是`secure copy`的缩写，是`Linux`系统下基于`ssh`登陆进行安全的远程文件拷贝命令，使用`scp`可以实现从本地系统到远程系统、从远程系统到本地系统、在本地系统的两个远程系统之间的复制传输。`scp`是加密的，`rcp`是不加密的，可以认为`scp`是`rcp`的加强版。

## 语法

```shell
scp [OPTION] [user@]SRC_HOST:]file1 [user@]DEST_HOST:]file2
```

## 参数
* `-1`: 强制`scp`使用协议`1`，这是一个较旧的协议。
* `-2`: 强制`scp`使用协议`2`，这是一个较旧的协议。
* `-3`: 两个远程主机之间的副本通过本地主机传输，如果没有此选项，数据将直接在两个远程主机之间复制，此选项还禁用进度表。
* `-4`: 强制`scp`仅使用`IPv4`地址。
* `-6`: 强制`scp`仅使用`IPv6`地址。
* `-B`: 使用批处理模式，无需任何交互式键盘输入即可运行，这意味着`scp`无法通过要求用户输入密码来验证会话，此时需要使用密钥进行身份验证。
* `-C`: 启用压缩，该压缩将`-C`标志传递给`ssh`以启用加密连接的压缩。
* `-c cipher`: 选择用于加密数据传输的密码，此选项直接传递给`ssh`。
* `-F ssh_config`: 为`ssh`指定每个用户的备用配置文件，此选项直接传递给`ssh`。
* `-i identity_file`: 选择读取`RSA`身份验证的身份(私钥)的文件，这个选项直接传递给`ssh`。
* `-l limit`: 限制使用的带宽，以`Kbit/s`为单位。
* `-o ssh_option `: 可用于以`ssh_config`中使用的格式将选项传递给`ssh`，例如`AddressFamily`、`BatchMode`、`BindAddress`等等，这对于指定没有单独的`scp`命令标志的选项非常有用。
* `-P port`:指定远程主机上要连接到的端口，注意这个选项是用大写字母`P`写的，因为`-p`已经被保留了，用于保存`rcp`中文件的时间和模式。
* `-p`: 保留原始文件的修改时间、访问时间和模式。
* `-q`: 禁用进度表。
* `-r`: 递归地复制整个目录。
* `-S program`: 用于加密连接的程序名称，程序必须能够解析`ssh`选项。
* `-v`: 详细模式，使`scp`和`ssh`打印有关其进度的调试消息，这有助于调试连接，身份验证和配置问题。

## 示例
将`file.txt`传输到远程主机。

```shell
scp file.txt root@1.1.1.1:/tmp
# file.txt                      100%    0     0.0KB/s   00:00
```

使用私钥将`file.txt`传输到远程主机。

```shell
scp -i ./v file.txt root@1.1.1.1:/tmp
# file.txt                      100%    0     0.0KB/s   00:00
```

将远程目录中`file.txt`文件传输到本地，使用私钥验证身份。

```
scp -i ./v root@1.1.1.1:/tmp/file.txt ./
# file.txt                      100%    0     0.0KB/s   00:00
```



## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.computerhope.com/unix/scp.htm
https://www.runoob.com/linux/linux-comm-scp.html
https://linuxize.com/post/how-to-use-scp-command-to-securely-transfer-files/
```
