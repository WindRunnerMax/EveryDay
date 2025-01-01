# rcp命令
`rcp`命令用于复制远程文件或目录，如同时指定两个以上的文件或目录，且最后的目标位置是一个已经存在的目录，则它会把前面指定的所有文件或目录复制到该目录中，执行`rcp`命令以后不会有返回信息，仅需要在目标目录下查看文件或目录是否复制成功即可，`rcp`不提示输入密码，其通过`rsh`执行远程执行 ，并且需要相同的授权。

## 语法

```shell
rcp [options] [origin] [target]
```

## 参数
* `-r`: 递归地把源目录中的所有内容拷贝到目标目录中，要使用这个选项，目标位置必须是一个目录。
* `-p`: 保留源文件的修改时间和模式，包括拥有者、所属群组、权限与时间，忽略`umask`。
* `-k`: 请求`rcp`获得在指定区域内的远程主机的`Kerberos`许可，而不是获得由`krb_relmofhost`确定的远程主机区域内的远程主机的`Kerberos`许可。
* `-x`: 为传送的所有数据打开`DES`加密，这会影响响应时间和`CPU`使用率，但是可以提高安全性。
* `-D`: 指定远程服务器的端口号。

## 示例
远程复制`file.txt`文件。

```shell
rcp root@1.1.1.1:/file.txt file.txt
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.runoob.com/linux/linux-comm-rcp.html
https://www.tutorialspoint.com/unix_commands/rcp.htm
https://www.cnblogs.com/peida/archive/2013/03/14/2958685.html
```
