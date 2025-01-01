# mc命令
`mc`是一个基于字符的目录浏览器和文件管理器，其将熟悉的图形文件管理器和常见的命令行工具联系在一起。`mc`的设计基于文件管理器中双目录窗格的设计，其中同时显示两个目录的列表，可以执行所有常见的文件和目录操作，例如复制、移动、重命名、链接和删除等，也允许操纵文件和目录权限等操作。

## 语法

```shell
mc [option] [file]
```


## 参数
* `--configure-options`: 打印配置选项。
* `-e, --edit=<file>`: 以`mc`模式下编辑文件。
* `-f, --datadir`: 打印数据目录。
* `-F, --datadir-info`: 打印有关使用的数据目录的扩展信息。
* `-h, --help`: 显示帮助。
* `--help-all`: 显示所有帮助选项。
* `--help-terminal`: 终端选项。
* `--help-color`: 颜色选项。
* `-l, --ftplog=<file>`: 将`ftp`对话框记录到指定文件。
* `-P, --printwd=<file>`: 将最后一个工作目录打印到指定文件。
* `-u, --nosubshell`: 禁用`subshell`支持。
* `-U, --subshell`: 启用`subshell`支持，默认选项。
* `-v, --view=<file>`: 在文件上启动文件查看器。


## 示例
启动`Midnight Commander`管理器。

```shell
mc
```



## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://man.linuxde.net/mc
http://linuxcommand.org/lc3_adv_mc.php
https://www.runoob.com/linux/linux-comm-mc.html
```
