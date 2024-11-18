# lsattr Command
The `lsattr` command is used to display the attributes of a file.

## Syntax

```shell
lsattr [-RVadlv] [file | folder]
```

## Options
* `-a`: Display all files and directories, including additional built-ins with names starting with `.` such as the current directory `.` and the parent directory `..`.
* `-d`: Display the directory name, not its contents.
* `-l`: Specify the logical name of the device to be displayed.
* `-R`: Recursively process all files and subdirectories in the specified directory.
* `-v`: Display the version of the file or directory.
* `-V`: Display version information.

## File Attributes
* `a`: Files or directories are for append-only use.
* `b`: Do not update the last access time of the file or directory.
* `c`: Compress and store the file or directory.
* `d`: Exclude the file or directory from the dump operation.
* `i`: File or directory cannot be arbitrarily modified.
* `s`: Securely delete the file or directory.
* `S`: Immediately update the file or directory.
* `u`: Prevent accidental deletion.

## Examples

View the attributes of the  `file.txt` file.

```shell
lsattr file.txt
```

Display the attributes of all files and directories.

```shell
lsattr -a
```

Recursively process all files and subdirectories in the `/tmp/` directory.

```shell
lsattr -R /tmp/
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://man.linuxde.net/lsattr
https://www.runoob.com/linux/linux-comm-lsattr.html
https://www.tutorialspoint.com/unix_commands/lsattr.htm
```