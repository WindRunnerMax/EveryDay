# chown命令
`chown`命令改变某个文件或目录的所有者和所属的组，该命令可以向某个用户授权，使该用户变成指定文件的所有者或者改变文件所属的组，用户可以是用户或者是用户`D`，用户组可以是组名或组`id`，文件名可以使由空格分开的文件列表，在文件名中可以包含通配符。一般来说，这个指令只有是由系统管理者`root`所使用，一般使用者没有权限可以改变别人的文件拥有者，也没有权限把自己的文件拥有者改设为别人，只有系统管理者`root`才有这样的权限。

## 语法

```shell
chown [-cfhvR] [--help] [--version] user[:group] file
```

## 参数
* `user`: 新的文件拥有者的使用者。
* `group`: 新的文件拥有者的使用者组。
* `--help`: 在线帮助。
* `--version`: 显示版本信息。
* `-c`或`--changes`: 效果类似`-v`参数，但仅回报更改的部分。
* `-f`或`--quite`或`--silent`: 不显示错误信息。
* `-h`或`--no-dereference`: 只对符号连接的文件作修改，而不更改其他任何相关文件。
* `-R`或`--recursive`: 递归处理，将指定目录下的所有文件及子目录一并处理。
* `-v`或`--version`: 显示指令执行过程。
* `--dereference`: 效果和`-h`参数相同。
* `--reference=<file or folder>`: 把指定文件或目录的拥有者与所属群组全部设成和参考文件或目录的拥有者与所属群组相同。

## 示例

将`file.txt`文件拥有者设置为`www`，所属群组设置为`web`。

```shell
chown www:web file.txt
```

将`file.txt`文件的所属群组设置为`web`。

```shell
chown :web file.txt
```

将`example`文件夹下所有文件文件与目录的拥有者设置为`www`。

```shell
chown -R www example
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://man.linuxde.net/chown
https://www.cnblogs.com/piaozhe116/p/6079977.html
https://www.runoob.com/linux/linux-comm-chown.html
```
