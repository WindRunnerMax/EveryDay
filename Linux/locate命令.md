# locate命令
 `locate`命令用于查找符合条件的文件，其会去保存文件和目录名称的数据库内，查找符合指定条件的文件或目录，`locate`命令预设的数据库位于`/var/lib/mlocate/mlocate.db`，`locate`与`find`不同，`find`是去硬盘找，而`locate`只在数据库中查找，这个数据库中含有本地所有文件信息，`Linux`系统自动创建这个数据库，并且每天自动更新一次，所以使用`locate`命令查不到最新变动过的文件，可以主动执行`updatedb`命令以更新数据库。

## 语法

```shell
locate [OPTION] [PATTERN]
```

## 参数
* `-b, --basename`: 仅将基本名称与指定的模式匹配。
* `-c, --count`: 在标准输出上不输出文件名，而只输出匹配条目的数量。
* `-d, --database <DBPATH>`: 用指定的数据库替换默认数据库，如果指定了多个`--database`选项，则结果路径是单独路径的串联，此外空数据库文件名将替换为默认数据库。
* `-e, --existing`: 仅打印引用定位时存在的文件的条目。
* `-L, --follow`: 在检查文件是否存在时，遵循尾随的符号链接，这会使将导致断开的符号链接从输出中省略，这是默认行为。
* `-h, --help`: 在线帮助。
* `-i, --ignore-case`: 匹配模式时忽略大小写区别。
* `-l, --limit, -n <LIMIT>`: 找到`LIMIT`个条目后成功退出，如果指定了`--count`选项，则结果计数也将限制为`LIMIT`。
* `-m, --mmap`: 出于`BSD`和`GNU`兼容性而被忽略。
* `-P, --nofollow, -H`: 在检查文件是否存在时，不跟随尾随的符号链接，这会使断开的符号链接像其他文件一样被报告。
* `-0, --null`: 使用`ASCII NUL`字符分隔输出上的条目，而不是将每个条目写在单独的行上，此选项旨在与`GNU xargs`的 `--null`选项互操作。
* `-S, --statistics`: 将每个有关读取数据库的统计信息写入标准输出，而不是搜索文件并成功退出。
* `-q, --quiet`: 不输出任何有关读取和处理数据库时遇到的错误的消息。
* `-r, --regexp <REGEXP>`: 搜索基本的正则表达式，如果使用此选项，则不允许使用模式匹配，但可以多次指定此选项。
* `--regex`: 将所有`PATTERN`解释为扩展的正则表达式。
* `-s, --stdio`: 出于`BSD`和`GNU`兼容性而被忽略。
* `-V, --version`: 输出版本信息。
* `-w, --wholename`: 将整个路径名与指定的模式匹配，这是默认行为。

## 示例

查找`file.txt`文件。

```shell
locate file.txt
```

输出匹配`file.txt`文件名的数量。

```shell
locate -c file.txt
```

匹配以`make`结尾的文件。

```shell
locate -r make$
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://man.linuxde.net/locate_slocate
https://www.runoob.com/linux/linux-comm-locate.html
https://www.tutorialspoint.com/unix_commands/locate.htm
```
