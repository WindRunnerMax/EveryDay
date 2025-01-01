# chmod命令
`chmod`命令用来变更文件或目录的权限，文件或目录权限的控制分别以读取、写入、执行`3`种一般权限来区分，另有`3`种特殊权限可供运用。用户可以使用`chmod`指令去变更文件与目录的权限，设置方式采用文字或数字代号皆可，此外符号连接的权限无法变更，如果用户对符号连接修改权限，其改变会作用在被连接的原始文件。

## 语法

```shell
chmod [option] [ugoa...][[+-=][rwxX]...][,...] file
```

## 参数
* `u`: 表示该文件的拥有者。
* `g`: 表示与该文件的拥有者属于同组`group`的用户。
* `o`: 表示其他以外的人。
* `a`: 表示这三者皆是。
* `+`: 表示增加权限。
* `-`: 表示取消权限。
* `=`: 表示唯一设定权限。
* `r`: 表示可读取。
* `w`: 表示可写入。
* `x`: 表示可执行。
* `X`: 表示可执行当且仅当这个文件是个目录或者已经被设定过为可执行。
* `-c`或`--changes`: 效果类似`-v`参数，但仅回报更改的部分。
* `-f`或`--quiet`或`--silent`: 不显示错误信息。
* `-R`或`--recursive`: 递归处理，将指令目录下的所有文件及子目录一并处理。
* `-v`或`--verbose`: 显示指令执行过程。
* `--reference=<folder/file>`：把指定文件或目录的所属群组全部设成和参考文件或目录的所属群组相同。

## 权限
使用`ll`命令查看文件与文件夹相关信息，对于其权限信息:

```shell
-rw-r--r--
```
首符号为`-`代表该文件为普通文件，为`d`则代表目录，紧接着三个字符`rw-`代表用户`u`权限属性，接下来三个字符`r--`代表用户组`g`权限属性，最后三个字符`r--`代表其他人`o`权限属性。
* `r`: 读取属性，值为`4`。
* `w`: 写入属性，值为`2`。
* `x`: 执行属性，值为`1`。

## 示例
将文件`file.txt`设为所有人可读取。

```shell
chmod ugo+r file.txt
```

```shell
chmod a+r file.txt
```

撤销组用户的对于`file.txt`的写入权限。

```shell
chmod g-w file.txt
```

将文件夹下所有目录与文件设为所有人可读取。

```shell
chmod -R a+r *
```

将文件`file.txt`设为拥有者有写权限，其他用户只有读权限。

```shell
chmod u=rw,go=r file.txt
```

将文件`file.py`设为拥有者有执行权限。

```shell
chmod u+x file.py
```

将文件`file.py`设为拥有者拥有所有权限，其他用户无任何权限。

```shell
chmod 700 file.py
```

```shell
chmod u=rwx,go= file.py
```

所有者可以读、写、执行这个文件或目录，同组用户/其他用户可以读和执行，但不能写。

```bash
chmod 755 file.py
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://man.linuxde.net/chmod
https://www.cnblogs.com/linuxandy/p/10881918.html
https://www.runoob.com/linux/linux-comm-chmod.html
```
