# chmod Command

The `chmod` command is used to change the permissions of files or directories. The control of file or directory permissions is divided into three general permissions: read, write, and execute, as well as three special permissions that can be applied. Users can use the `chmod` command to change the permissions of files and directories, and the settings can be made using either symbolic or numeric representations. Additionally, the permissions of symbolic links cannot be changed. If a user modifies the permissions of a symbolic link, the change will affect the original file being linked to.

## Syntax

```shell
chmod [option] [ugoa...][[+-=][rwxX]...][,...] file
```

## Parameters
* `u`: Represents the owner of the file.
* `g`: Represents users belonging to the same group as the owner (`group`).
* `o`: Represents others except for the owner and group members.
* `a`: Represents all three of the above.
* `+`: Indicates adding permissions.
* `-`: Indicates removing permissions.
* `=`: Indicates setting unique permissions.
* `r`: Indicates read permission.
* `w`: Indicates write permission.
* `x`: Indicates execute permission.
* `X`: Indicates execute permission only if the file is a directory or has already been set as executable.
* `-c` or `--changes`: Similar to the `-v` parameter, but only reports the changed parts.
* `-f` or `--quiet` or `--silent`: Suppresses error messages.
* `-R` or `--recursive`: Recursively processes all files and subdirectories in the specified directory.
* `-v` or `--verbose`: Displays the execution process.
* `--reference=<folder/file>`: Sets the group of the specified file or directory to be the same as the group of the reference file or directory.

## Permissions
Use the `ll` command to view file and folder information. Regarding the permissions information:

```shell
-rw-r--r--
```
The first symbol `-` represents a regular file, while `d` represents a directory. The next three characters `rw-` represent the user `u` permission properties, the following three characters `r--` represent the group `g` permission properties, and the last three characters `r--` represent the other `o` permission properties.
* `r`: Read property, with a value of `4`.
* `w`: Write property, with a value of `2`.
* `x`: Execute property, with a value of `1`.

## Examples
Make the file `file.txt` readable by everyone.

```shell
chmod ugo+r file.txt
```

```shell
chmod a+r file.txt
```

Revoke the write permission for group users on `file.txt`.

```shell
chmod g-w file.txt
```

Make all directories and files in a folder readable by everyone.

```shell
chmod -R a+r *
```

Set the file `file.txt` to have write permission for the owner and read-only permission for other users.

```shell
chmod u=rw,go=r file.txt
```

Give the owner execute permission for the file `file.py`.

```shell
chmod u+x file.py
```

Set full permissions for the owner and no permissions for other users for the file `file.py`.

```shell
chmod 700 file.py
```

```shell
chmod u=rwx,go= file.py
```

## Daily Question
```
https://github.com/WindrunnerMax/EveryDay
```

## References
```
https://man.linuxde.net/chmod
https://www.cnblogs.com/linuxandy/p/10881918.html
https://www.runoob.com/linux/linux-comm-chmod.html
```