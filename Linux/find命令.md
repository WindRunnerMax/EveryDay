# find命令
`find`命令用来在指定目录下查找文件，任何位于参数之前的字符串都将被视为要查找的目录名，如果使用该命令时，不设置任何参数，则`find`命令将在当前目录下查找子目录与文件，并且将查找到的子目录和文件全部进行显示。

## 语法

```shell
find [-H] [-L] [-P] [-Olevel] [-D help|tree|search|stat|rates|opt|exec|time] [path...] [expression]
```

## 参数
* `-amin<minute>`: 查找在指定时间曾被存取过的文件或目录，单位以分钟计算。
* `-anewer<file or folder>`: 查找其存取时间较指定文件或目录的存取时间更接近现在的文件或目录。
* `-atime<day>`: 查找在指定时间曾被存取过的文件或目录，单位以天计算。
* `-cmin<minute>`: 查找在指定时间之时被更改过的文件或目录。
* `-cnewer<file or folder>`查找其更改时间较指定文件或目录的更改时间更接近现在的文件或目录。
* `-ctime<day>`: 查找在指定时间之时被更改的文件或目录，单位以天计算。
* `-daystart`: 从本日开始计算时间。
* `-depth`: 从指定目录下最深层的子目录开始查找。
* `-empty`: 寻找文件大小为`0 Byte`的文件，或目录下没有任何子目录或文件的空目录。
* `-exec<command>`: 假设`find`指令的回传值为`True`，就执行该指令。
* `-false`: 将`find`指令的回传值皆设为`False`。
* `-fls<file list>`: 此参数的效果和指定`-ls`参数类似，但会把结果保存为指定的列表文件。
* `-follow`: 排除符号连接。
* `-fprint<file list>`: 此参数的效果和指定`-print`参数类似，但会把结果保存成指定的列表文件。
* `-fprint0<file list>`: 此参数的效果和指定`-print0`参数类似，但会把结果保存成指定的列表文件。
* `-fprintf<file list><output format>`: 此参数的效果和指定`-printf`参数类似，但会把结果保存成指定的列表文件。
* `-fstype<file system type>`: 只寻找该文件系统类型下的文件或目录。
* `-gid<group id>`: 查找符合指定之群组识别码的文件或目录。
* `-group<group name>`: 查找符合指定之群组名称的文件或目录。
* `-help, --help`: 在线帮助。
* `-ilname<template style>`: 此参数的效果和指定`-lname`参数类似，但忽略字符大小写的差别。
* `-iname<template style>`: 此参数的效果和指定`-name`参数类似，但忽略字符大小写的差别。
* `-inum<inode num>`: 查找符合指定的inode编号的文件或目录。
* `-ipath<template style>`: 此参数的效果和指定`-path`参数类似，但忽略字符大小写的差别。
* `-iregex<template style>`: 此参数的效果和指定`-regexe`参数类似，但忽略字符大小写的差别。
* `-links<number of connections>`: 查找符合指定的硬连接数目的文件或目录。
* `-iname<template style>`: 指定字符串作为寻找符号连接的范本样式。
* `-ls`: 假设`find`指令的回传值为`Ture`，就将文件或目录名称列出到标准输出。
* `-maxdepth<directory level>`: 设置最大目录层级。
* `-mindepth<directory level>`: 设置最小目录层级。
* `-mmin<minute>`: 查找在指定时间曾被更改过的文件或目录，单位以分钟计算。
* `-mount`: 此参数的效果和指定`-xdev`相同。
* `-mtime<24 hour>`: 查找在指定时间曾被更改过的文件或目录，单位以`24`小时计算。
* `-name<template style>`: 指定字符串作为寻找文件或目录的范本样式。
* `-newer<file or folder>`: 查找其更改时间较指定文件或目录的更改时间更接近现在的文件或目录。
* `-nogroup`: 找出不属于本地主机群组识别码的文件或目录。
* `-noleaf`: 不去考虑目录至少需拥有两个硬连接存在。
* `-nouser`: 找出不属于本地主机用户识别码的文件或目录。
* `-ok<command>`: 此参数的效果和指定`-exec`类似，但在执行指令之前会先询问用户，若回答`y`或`Y`，则放弃执行命令。
* `-path<template style>`: 指定字符串作为寻找目录的范本样式。
* `-perm<permission value>`: 查找符合指定的权限数值的文件或目录。
* `-print`: 假设`find`指令的回传值为`Ture`，就将文件或目录名称列出到标准输出。格式为每列一个名称，每个名称前皆有`./`字符串。
* `-print0`: 假设`find`指令的回传值为`Ture`，就将文件或目录名称列出到标准输出。格式为全部的名称皆在同一行。
* `-printf<output format>`: 假设`find`指令的回传值为`Ture`，就将文件或目录名称列出到标准输出。格式可以自行指定。
* `-prune`: 不寻找字符串作为寻找文件或目录的范本样式;
* `-regex<template style>`: 指定字符串作为寻找文件或目录的范本样式。
* `-size<file size>`: 查找符合指定的文件大小的文件。
* `-true`: 将find指令的回传值皆设为`True`。
* `-type<file type>`: 只寻找符合指定的文件类型的文件。
* `-uid<user id>`: 查找符合指定的用户识别码的文件或目录。
* `-used<day>`: 查找文件或目录被更改之后在指定时间曾被存取过的文件或目录，单位以日计算。
* `-user<owner name>`: 查找符和指定的拥有者名称的文件或目录。
* `-version, --version`: 显示版本信息。
* `-xdev`: 将范围局限在先行的文件系统中。
* `-xtype<file type>`: 此参数的效果和指定`-type`参数类似，差别在于它针对符号连接检查。

## 示例

查找`/tmp/`目录及其子目录下所有拓展名为`py`的文件。

```shell
find /tmp/ -name *.py
# /tmp/file.py
```

查找`/tmp/`目录及其子目录下所有一般文件。

```shell
find /tmp/ -type f
# /tmp/file.c
# /tmp/file.txt
# /tmp/a.out
# /tmp/www/1.txt
# /tmp/file.py
# /tmp/file
# ...
```

查找`/tmp/`目录及其子目录下所有最近`1`天内更改过的文件，`+1`则表示`1`天前更改过文件。

```shell
find /tmp/ -ctime -1
# /tmp/
# /tmp/1
# /tmp/file.txt
# /tmp/file
```

查找`/tmp/`目录及其子目录下所有更改时间在`7`日以前的普通文件，并在删除之前询问是否删除。

```shell
find /tmp/ -type f -mtime +7 -ok rm {} \;
# < rm ... /tmp/file.py > ? n
# ...
```

查找`/tmp/`目录及其子目录下所有文件属主具有读、写权限，并且文件所属组的用户和其他用户具有读权限的文件。

```shell
find /tmp/  -type f -perm 644 -exec ls -l {} \;
# -rw-r--r-- 1 root root 60 Jul 22 19:55 /tmp/file.c
# -rw-r--r-- 1 www www 73 Jul 23 20:54 /tmp/file.txt
# ...
```

查找`/tmp/`目录及其子目录下所有文件长度为`0`的普通文件，并列出它们的完整路径。

```shell
find /tmp/ -type f -size 0 -exec ls -l {} \;
# -rwx------ 1 root root 0 Jul 11 17:25 /tmp/file.py
```



## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://man.linuxde.net/find
https://www.runoob.com/linux/linux-comm-find.html
https://www.tutorialspoint.com/unix_commands/find.htm
```
