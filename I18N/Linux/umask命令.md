# umask command
In `Linux` and other `Unix`-like operating systems, when new files are created, a set of default permissions will be used. Specifically, the way in which new file permissions are restricted can be defined through the use of a permission mask called `umask`. The `umask` command is used to set a default permission mask when creating files, or to display the current mask value.

## Syntax

```shell
umask [-S] [mask]
```
## Parameters
* `-S`: Represents the mask in symbolic mode.
* `mask`: Specifies an effective mask value. If none is specified, the current `umask` value is returned.

## Permissions
Use the `ll` command to view file and directory information. Regarding its permission information:

```shell
drwxr-xr-x 12 linuxize users 4.0K Apr  8 20:51 dirname
|[-][-][-]    [------] [---]
| |  |  |        |       |       
| |  |  |        |       +-----------> Group
| |  |  +-------------------> Owner
| |  +-----------------------> Others Permissions
| +--------------------------> Group Permissions
+----------------------------> Owner Permissions
```

* The first symbol `-` represents a regular file, while `d` represents a directory.
* The next three characters `rw-` represent the user `u` permission attributes.
* The next three characters `r--` represent the user group `g` permission attributes.
* The last three characters `r--` represent the other `o` permissions.

Permissions can be represented using characters, and can also be represented in octal numbers: 
* `r`: Read attribute, with a value of `4`.
* `w`: Write attribute, with a value of `2`.
* `x`: Execute attribute, with a value of `1`.

Regarding operators for manipulating permissions:
* `+`: Adds specified file permissions for the specified user class.
* `-`: Removes specified file permissions for the specified user class.
* `=`: Assigns specified file permissions for the specified user class.

## Work  
Essentially, each digit of `umask` is subtracted from the operating system’s default value to obtain the defined default value. This is not true subtraction, it technically involves taking the bitwise complement of the mask and then applying this value using a logical `AND` operation to the default permissions. For example, if the `umask` value is `0022`:
* On a `Linux` system, the default file creation permission is `666`, and the default folder creation permission is `777`.
* So, `666 - 022 = 644`, which means the permission of the newly created file is `644`.
* For folders, `777 - 022 = 755`, meaning the permission of the newly created folder is `755`.

Also, the leading zero is a special permission number that can be ignored. For the current purpose, `0002` is the same as `002`.

## Examples
View the current `umask` value in the system.

```shell
umask
# 0022 
```

Represent the current system permission mask in symbolic form.

```shell
umask -S
# u=rwx,g=rx,o=rx # effectively expressing which permissions have been revoked for the owner, group, and other.
```

Set the system `umask` value to `022`.

```shell
umask 022
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References
```
https://www.computerhope.com/unix/uumask.htm
https://linuxize.com/post/umask-command-in-linux/
https://www.runoob.com/linux/linux-comm-umask.html
```