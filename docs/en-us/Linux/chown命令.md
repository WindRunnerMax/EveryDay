# chown Command
The `chown` command changes the owner and group of a file or directory, and it can grant authorization to a user, making the user the owner of the specified file or changing the group to which the file belongs. Users can be user names or user IDs, and groups can be group names or group IDs. File names can be a list of space-separated files, and wildcards can be used in file names. Generally, this command is only used by the system administrator `root`. Regular users do not have permission to change others' file owners or to change their own file owners to others. Only the system administrator `root` has such permissions.

## Syntax
```shell
chown [-cfhvR] [--help] [--version] user[:group] file
```

## Parameters
* `user`: The new owner of the file.
* `group`: The new group of the file owner.
* `--help`: Online help.
* `--version`: Display version information.
* `-c` or `--changes`: Similar to the `-v` parameter, but only reports the changed parts.
* `-f` or `--quite` or `--silent`: Do not display error messages.
* `-h` or `--no-dereference`: Modify only symbolic linked files and do not change any other related files.
* `-R` or `--recursive`: Recursively process all files and subdirectories in the specified directory.
* `-v` or `--version`: Display the process of executing the command.
* `--dereference`: Same effect as the `-h` parameter.
* `--reference=<file or folder>`: Set the owner and group of the specified file or directory to be the same as those of the reference file or directory.

## Examples
Set the owner of the `file.txt` file to `www` and the group to `web`.
```shell
chown www:web file.txt
```

Set the group of the `file.txt` file to `web`.
```shell
chown :web file.txt
```

Set the owner of all files and directories in the `example` folder to `www`.
```shell
chown -R www example
```

## Daily Question
```
https://github.com/WindrunnerMax/EveryDay
```

## Reference
```
https://man.linuxde.net/chown
https://www.cnblogs.com/piaozhe116/p/6079977.html
https://www.runoob.com/linux/linux-comm-chown.html
```