# The `mktemp` Command

The `mktemp` command is used to securely create a temporary file or directory and output its name. The `TEMPLATE` in the last component must contain at least `3` consecutive `X`s. If `TEMPLATE` is not specified, a corresponding temporary file with the name `tmp.XXXXXXXXXX` will be created in the current directory, where `X` represents a generated random number. The trailing `X` will be replaced with a combination of the current process ID and random letters. The file name depends on the number of `X`s in the template and the number of conflicts with existing files. The number of unique file names that `mktemp` can return depends on the number of `X`s provided. Ten `X`s will result in approximately `26**10` combinations being tested. The temporary file created by the `mktemp` command does not use the default `umask` permission value. Instead, it assigns read and write permissions to the file owner. Once the file is created, it has full read and write permissions in a shell script, and no one except `root` can access it. In other words, the file has `u+rw` permissions at creation, while a folder has `u+rwx` permissions.

## Syntax

```shell
mktemp [OPTION] [TEMPLATE]
```

## Options
* `-d, --directory`: Create a directory instead of a file.
* `-u, --dry-run`: Temporary files will be unlinked before `mktemp` exits, effectively creating no files or directories, only outputting the name. This option is not recommended.
* `-q, --quiet`: If an error occurs during execution, no information will be output.
* `--suffix=SUFF`: Append `SUFF` to `TEMPLATE`. `SUFF` cannot contain slashes and is used if `TEMPLATE` does not end with `X` by default.
* `-p <DIR>, --tmpdir <DIR>`: Use the specified directory as the target when generating temporary files.
* `-t`: Store the target file in a temporary directory, which first selects the user's `TMPDIR` environment variable, then the directory specified by the `-p` parameter, and finally the `/tmp` directory. After creation, the full path of the temporary file will be output.
* `--help`: Output help options.
* `--version`: Output version information.

## Examples

Create a temporary file in the current directory.

```shell
mktemp tmp.XXX
# tmp.g6k
```

Create a temporary file of a specific file type.

```shell
mktemp tmp.XXX --suffix=.txt
# tmp.gSI.txt
```

Create a temporary file in a specified directory.

```shell
mktemp --tmpdir=/home tmp.XXX
# /home/tmp.HxB
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.jianshu.com/p/31660ac1650f
https://www.cnblogs.com/xingmuxin/p/8440689.html
https://www.runoob.com/linux/linux-comm-mktemp.html
```