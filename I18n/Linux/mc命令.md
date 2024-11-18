# mc command
`mc` is a character-based directory browser and file manager that combines the familiar graphical file manager and common command-line tools. The design of `mc` is based on the double-directory pane design of file manager, where the lists of two directories are displayed simultaneously. It can perform all common file and directory operations, such as copying, moving, renaming, linking, and deleting, and also allows manipulation of file and directory permissions.

## Syntax

```shell
mc [option] [file]
```


## Arguments
* `--configure-options`: Print configuration options.
* `-e, --edit=<file>`: Edit file in `mc` mode.
* `-f, --datadir`: Print data directory.
* `-F, --datadir-info`: Print extended information about the data directory in use.
* `-h, --help`: Display help.
* `--help-all`: Display all help options.
* `--help-terminal`: Terminal options.
* `--help-color`: Color options.
* `-l, --ftplog=<file>`: Log the `ftp` dialog to the specified file.
* `-P, --printwd=<file>`: Print the last working directory to the specified file.
* `-u, --nosubshell`: Disable `subshell` support.
* `-U, --subshell`: Enable `subshell` support, default option.
* `-v, --view=<file>`: Start the file viewer on the file.

## Example
Start the Midnight Commander manager.

```shell
mc
```



## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://man.linuxde.net/mc
http://linuxcommand.org/lc3_adv_mc.php
https://www.runoob.com/linux/linux-comm-mc.html
```