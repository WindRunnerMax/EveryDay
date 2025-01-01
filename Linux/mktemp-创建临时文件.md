# mktemp命令
`mktemp`命令用于安全地创建一个临时文件或目录，并输出其名称，`TEMPLATE`在最后一个组件中必须至少包含`3`个连续的`X`，如果未指定`TEMPLATE`，则使用`tmp.XXXXXXXXXX`作为名称在当前目录下创建相应的临时文件，`X`为生成的随机数，尾部的`X`将替换为当前进程号和随机字母的组合，文件的名称取决于模板中`X`的数量以及与现有文件冲突的数量。`mktemp`可以返回的唯一文件名的数量取决于所提供的`X`的数量，十个`X`将导致`mktemp`测试大约`26**10`个组合，`mktemp`命令创建的临时文件不会使用默认的`umask`管理权限值，其会将文件的读写权限分配给文件属主，一旦创建了文件，在`shell`脚本中就拥有了完整的读写权限，除`root`外其他人不可访问，即在创建文件时即有`u+rw`权限，创建文件夹时有`u+rwx`权限。

## 语法

```shell
mktemp [OPTION] [TEMPLATE]
```

## 参数
* `-d, --directory`: 创建目录，而不是文件。
* `-u, --dry-run`: 在`mktemp`退出之前，临时文件将被取消链接，相当于不创建任何文件或文件夹，仅输出名称，不建议使用该选项。
* `-q, --quiet`: 执行时若发生错误，不会输出任何信息。
* `--suffix=SUFF`: 将`STUFF`附加到`TEMPLATE`，`SUFF`不能包含斜线，如果`TEMPLATE`不以`X`结尾，则默认此选项。
* `-p <DIR>, --tmpdir <DIR>`: 生成临时文件时使用指定的目录作为目标。
* `-t`: 将目标文件存储在临时目录，该目录首先会选择用户的`TMPDIR`环境变量，其次是用户指定的`-p`参数选择的目录，最后的选择即`/tmp`目录，创建后会输出临时文件的全路径。
* `--help`: 输出帮助选项。
* `--version`: 输出版本信息。

## 示例

在当前目录创建临时文件。

```shell
mktemp tmp.XXX
# tmp.g6k
```

创建指定文件类型的临时文件。

```shell
mktemp tmp.XXX --suffix=.txt
# tmp.gSI.txt
```

在指定目录创建临时文件。

```shell
mktemp --tmpdir=/home tmp.XXX
# /home/tmp.HxB
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.jianshu.com/p/31660ac1650f
https://www.cnblogs.com/xingmuxin/p/8440689.html
https://www.runoob.com/linux/linux-comm-mktemp.html
```
