# chattr command

The `chattr` command can change the attributes of files or directories stored on the `ext2` file system.

## Syntax

```shell
chattr [-vRV] [mode] [files]
```

## Arguments
* `-R`: Recursively process, including all files and subdirectories in the specified directory.
* `-v <version num>`: Set the version number of the file or directory.
* `-V`: Display the process of the command execution.
* `+ <attribute>`: Enable the specified attribute for the file or directory.
* `- <attribute>`: Disable the specified attribute for the file or directory.
* `= <attribute>`: Specify the attribute for the file or directory.

## File attributes
* `a`: File or directory is only for append functionality.
* `b`: Do not update the last access time for the file or directory.
* `c`: Compress the file or directory.
* `d`: Exclude the file or directory from a dump.
* `i`: Make the file or directory immutable.
* `s`: Securely delete the file or directory.
* `S`: Synchronously update the file or directory.
* `u`: Prevent accidental deletion of the file or directory.

## Examples

Prevent `file.txt` from being modified.

```shell
chattr +i file.txt
```

Add two attributes to the `file.txt` file.

```shell
chattr +ac file.txt
```

Specify the attributes of the `file.txt` file.

```shell
chattr =i file.txt
```

## Daily Exercise

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://man.linuxde.net/chattr
https://www.howtoforge.com/linux-chattr-command/
https://www.runoob.com/linux/linux-comm-chattr.html
```