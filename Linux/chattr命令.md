# chattr命令
`chattr`命令可改变存放在`ext2`文件系统上的文件或目录属性。


## 语法

```shell
chattr [-vRV] [mode] [files]
```

## 参数
* `-R`: 递归处理，将指定目录下的所有文件及子目录一并处理。
* `-v <version num>`: 设置文件或目录版本。
* `-V`: 显示指令执行过程。
* `+ <attribute>`: 开启文件或目录的该项属性。
* `- <attribute>`: 关闭文件或目录的该项属性。
* `= <attribute>`: 指定文件或目录的该项属性。

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

防止`file.txt`文件被修改。

```shell
chattr +i file.txt
```

同时对`file.txt`文件增加两种属性。

```shell
chattr +ac file.txt
```

指定`file.txt`文件的属性。

```shell
chattr =i file.txt
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://man.linuxde.net/chattr
https://www.howtoforge.com/linux-chattr-command/
https://www.runoob.com/linux/linux-comm-chattr.html
```
