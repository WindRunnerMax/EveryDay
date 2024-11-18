# mv command
The `mv` command is used to rename files or directories, or to move files or directories to another location.

## Syntax
```shell
mv [OPTION] [-T] SOURCE DEST
mv [OPTION] SOURCE DIRECTORY
mv [OPTION] -t DIRECTORY SOURCE
```

## Parameters
* `--backup[=CONTROL]`: Make a backup of each existing target file.
* `-b`: Like `--backup`, but does not accept a parameter.
* `-f, --force`: Do not prompt before overwriting an existing destination file.
* `-i, --interactive`: Prompt before overwriting an existing destination file.
* `-n, --no-clobber`: Do not overwrite an existing destination file.
* `--strip-trailing-slashes`: Remove any trailing slashes from each source argument.
* `-S, --suffix=SUFFIX`: Override the usual backup suffix with the specified suffix.
* `-t, --target-directory=DIRECTORY`: Move all source files into DIRECTORY.
* `-T, --no-target-directory`: Treat the destination as a normal file and not a directory.
* `-u, --update`: Do not move the destination file if it is newer than the source file.
* `-v, --verbose`: Explain what is being done with each file being moved.
* `--help`: Display this help and exit.
* `--version`: Output version information and exit.

## Syntax Setting

|Command Format | Result|
|---|---|
|`mv` file1 file2 | Renames file1 to file2.|
|`mv` file1 dir1 | Moves file1 into directory dir1.|
|`mv` dir1 dir2 | If dir2 exists, moves dir1 into dir2; if not, renames dir1 to dir2.|
|`mv` dir1 file1 | Error.|

## Examples

Rename `file2.txt` to `file3.txt`.

```shell
mv file2.txt file3.txt
```

Move `file.txt` into the `var` directory.

```shell
mv file.txt /var/
```

Rename the `dir` directory to `dirs`.

```shell
mv dir dirs
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.computerhope.com/unix/umv.htm
https://www.runoob.com/linux/linux-comm-mv.html
https://www.tutorialspoint.com/unix_commands/mv.htm
```