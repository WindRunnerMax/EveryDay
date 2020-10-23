# updatedb命令
`updatedb`创建或更新`locate`命令使用的数据库，如果数据库已经存在，则重用其数据以避免重新读取未更改的目录，`updatedb`通常由`cron`每天运行以更新默认数据库。

## 语法

```shell
updatedb [OPTION]...
```

## 参数
* `-f, --add-prunefs FS`: 将空格分隔的列表`FS`中的条目添加到`PRUNEFS`。
* `-n, --add-prunenames NAMES`:  将空格分隔的列表名称中的条目添加到`pruneName`。
* `-e, --add-prunepaths PATHS`: 将以空格分隔的列表`PATHS`中的条目添加到`PRUNEPATHS`。
* `-U, --database-root PATH`: 仅存储扫描以生成的数据库路径为根的文件系统子树的结果，默认情况下会扫描整个文件系统即`/`，`locate`输出的条目作为绝对路径名，不包含符号链接，无论`PATH`的形式如何。
* `-h, --help`: 显示帮助信息。
* `-o, --output FILE`: 将数据库写入文件，而不是使用默认数据库，数据库默认位置为`  /var/lib/mlocate/mlocate.db`。
* `--prune-bind-mounts FLAG`: 将`PRUNE_BIND_MOUNTS`设置为`FLAG`，覆盖配置文件，默认为`no`。
* `--prunefs FS`: 将`PRUNEFS`设置为`FS`，以覆盖配置文件。
* `--prunenames NAMES`: 将`PRUNENAMES`设置为`NAMES`，以覆盖配置文件。
* `--prunepaths PATHS`: 将`PRUNEPATHS`设置为`PATHS`，以覆盖配置文件。
* `-l, --require-visibility FLAG`: 将生成的数据库中的"报告之前要求文件可见性"标志设置为`FLAG`，默认值为`yes`。如果`FLAG`为`0`或`no`，或者数据库文件可被`others`读取或不属于`slocate`，那么`locate`将输出数据库项，运行`locate`的用户无法读取所需的目录以找到数据库项所描述的文件。如果`FLAG`为`1`或`yes`，则`locate`在将每个条目的父目录报告给调用用户之前，先检查其父目录的权限。为了使文件的存在真正被其他用户隐藏，数据库组设置为`slocate`，并且数据库权限禁止用户使用`locate set-gid slocate`以外的其他方式读取用户的数据库。注意，仅当数据库由`slocate`拥有并且`others`不可读时，才检查可见性标志。
* `-v, --verbose`: 将文件的输出路径名输出到标准输出。
* `-V, --version`: 输出版本信息。

## 示例

更新`locate`命令所使用的数据库。

```shell
updatedb
```

更新`locate`命令所使用的数据库，并输出找到的文件。

```shell
updatedb -v
```

指定更新`locate`命令所使用的数据库的目录。

```shell
updatedb -U /home
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://linux.die.net/man/8/updatedb
https://www.computerhope.com/unix/ulocate.htm
https://www.runoob.com/linux/linux-comm-updatedb.html
```
