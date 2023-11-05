# tmpwatch命令
`tmpwatch`递归删除给定时间内未访问的文件，通常用于清理用于临时存放空间的目录，并可以设置文件超期时间，默认单位以小时计算。

## 语法

```shell
tmpwatch [-u | -m | -c] [-MUadfqstvx] [--verbose] [--force] [--all] [--nodirs] [--nosymlinks] [--test] [--fuser] [--quiet] [--atime | --mtime | --ctime] [--dirmtime] [--exclude path ] [--exclude-user user ] time dirs
```


## 参数
* `-a, --all`: 删除所有文件类型，而不仅仅是常规文件，符号链接和目录。
* `-c, --ctime`: 根据文件的`ctime`即`inode`更改时间，而不是`atime`来决定删除文件，对于目录根据`mtime`做出是否删除的决定。
* `-d, --nodirs`: 即使目录为空，也不要尝试删除它们。
* `-f, --force`: 即使`root`没有写访问权限，也删除文件类似于`rm -f`。
* `-l, --nosymlinks`: 不要尝试删除符号链接。
* `-m, --mtime`: 根据文件的`mtime`即修改时间而不是`atime`来决定删除文件。
* `-M, --dirmtime`: 根据目录的`mtime`即修改时间而不是`atime`来决定删除目录，完全忽略目录时间。
* `-q, --quiet`: 仅报告致命错误。
* `-s, --fuser`: 尝试使用`fuser`命令来查看文件是否已打开，然后再将其删除，默认情况下未启用，在某些情况下确实有帮助。
* `-t, --test`: 不要删除文件，但要执行删除它们的动作，这意味着`-v`。
* `-u, --atime`: 根据文件的访问时间来决定是否删除文件，这是默认值，请注意定期的`updatedb`文件系统扫描会保留最近的目录时间。
* `-U, --exclude-user=user`: 不要删除用户拥有的文件，该文件可以是用户名或数字用户`ID`。
* `-v, --verbose`: 打印详细显示，有两种详细级别可用。
* `-x, --exclude=path`: 跳过路径，如果`path`是目录，则包含在其中的所有文件也会被跳过，如果路径不存在，则它必须是不包含符号链接的绝对路径。
* `-X, --exclude-pattern=pattern`: 跳过路径匹配模式，如果目录与`pattern`匹配，其中的所有文件也将被跳过，模式必须匹配不包含符号链接的绝对路径。

## 示例
要从`/var/log/`日志目录中删除`30d`以上未访问的文件。

```shell
tmpwatch 30d /var/log/
```

列出`/tmp/`缓存目录中至少`30`小时未修改的所有文件。

```shell
tmpwatch –mtime 30 –nodirs /tmp/ –test
```

删除`/tmp/`缓存目录中至少`30`个小时未访问的所有文件。

```shell
tmpwatch -am 30 –nodirs /tmp/
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://linux.die.net/man/8/tmpwatch
https://www.runoob.com/linux/linux-comm-tmpwatch.html
https://www.interserver.net/tips/kb/tmpwatch-command-linux/
```
# tmpwatch命令
`tmpwatch`递归删除给定时间内未访问的文件，通常用于清理用于临时存放空间的目录，并可以设置文件超期时间，默认单位以小时计算。

## 语法

```shell
tmpwatch [-u | -m | -c] [-MUadfqstvx] [--verbose] [--force] [--all] [--nodirs] [--nosymlinks] [--test] [--fuser] [--quiet] [--atime | --mtime | --ctime] [--dirmtime] [--exclude path ] [--exclude-user user ] time dirs
```


## 参数
* `-a, --all`: 删除所有文件类型，而不仅仅是常规文件，符号链接和目录。
* `-c, --ctime`: 根据文件的`ctime`即`inode`更改时间，而不是`atime`来决定删除文件，对于目录根据`mtime`做出是否删除的决定。
* `-d, --nodirs`: 即使目录为空，也不要尝试删除它们。
* `-f, --force`: 即使`root`没有写访问权限，也删除文件类似于`rm -f`。
* `-l, --nosymlinks`: 不要尝试删除符号链接。
* `-m, --mtime`: 根据文件的`mtime`即修改时间而不是`atime`来决定删除文件。
* `-M, --dirmtime`: 根据目录的`mtime`即修改时间而不是`atime`来决定删除目录，完全忽略目录时间。
* `-q, --quiet`: 仅报告致命错误。
* `-s, --fuser`: 尝试使用`fuser`命令来查看文件是否已打开，然后再将其删除，默认情况下未启用，在某些情况下确实有帮助。
* `-t, --test`: 不要删除文件，但要执行删除它们的动作，这意味着`-v`。
* `-u, --atime`: 根据文件的访问时间来决定是否删除文件，这是默认值，请注意定期的`updatedb`文件系统扫描会保留最近的目录时间。
* `-U, --exclude-user=user`: 不要删除用户拥有的文件，该文件可以是用户名或数字用户`ID`。
* `-v, --verbose`: 打印详细显示，有两种详细级别可用。
* `-x, --exclude=path`: 跳过路径，如果`path`是目录，则包含在其中的所有文件也会被跳过，如果路径不存在，则它必须是不包含符号链接的绝对路径。
* `-X, --exclude-pattern=pattern`: 跳过路径匹配模式，如果目录与`pattern`匹配，其中的所有文件也将被跳过，模式必须匹配不包含符号链接的绝对路径。

## 示例
要从`/var/log/`日志目录中删除`30d`以上未访问的文件。

```shell
tmpwatch 30d /var/log/
```

列出`/tmp/`缓存目录中至少`30`小时未修改的所有文件。

```shell
tmpwatch –mtime 30 –nodirs /tmp/ –test
```

删除`/tmp/`缓存目录中至少`30`个小时未访问的所有文件。

```shell
tmpwatch -am 30 –nodirs /tmp/
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://linux.die.net/man/8/tmpwatch
https://www.runoob.com/linux/linux-comm-tmpwatch.html
https://www.interserver.net/tips/kb/tmpwatch-command-linux/
```
