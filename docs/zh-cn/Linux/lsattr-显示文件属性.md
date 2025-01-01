# lsattr命令
`lsattr`命令用于显示文件的属性。

## 语法

```shell
lsattr [-RVadlv] [file | folder]
```

## 参数
* `-a`: 显示所有文件和目录，包括以`.`为名称开头字符的额外内建，即现行目录`.`与上层目录`..`。
* `-d`: 显示目录名称，而非其内容。
* `-l`: 指出要显示设备的逻辑名称。
* `-R`: 递归处理，将指定目录下的所有文件及子目录一并处理。
* `-v`: 显示文件或目录版本。
* `-V`: 显示版本信息。

## 文件属性
* `a`: 使文件或目录仅供附加用途。
* `b`: 不更新文件或目录的最后存取时间。
* `c`: 将文件或目录压缩后存放。
* `d`: 将文件或目录排除在倾倒操作之外。
* `i`: 不得任意更动文件或目录。
* `s`: 保密性删除文件或目录。
* `S`: 即时更新文件或目录。
* `u`: 预防意外删除。

## 示例

查看`file.txt`文件的属性。

```shell
lsattr file.txt
```

显示所有文件和目录的属性。

```shell
lsattr -a
```

递归处理将`/tmp/`目录下的所有文件及子目录一并处理。

```shell
lsattr -R /tmp/
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://man.linuxde.net/lsattr
https://www.runoob.com/linux/linux-comm-lsattr.html
https://www.tutorialspoint.com/unix_commands/lsattr.htm
```
