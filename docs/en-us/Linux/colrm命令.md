# The `colrm` Command

The `colrm` command is used to edit text in source code files, script files, or regular text files. This command removes selected columns from a file, where a column is defined as a single character in a line. The index always starts at `1`, not `0`. If both the start and end are specified, the columns between them, including the start and end, will be deleted. If only one column needs to be deleted, the start and end must be the same. `colrm` can also accept input from `stdin`. If no parameters are provided, the command will not filter any lines.

## Syntax

```shell
colrm [start] [stop]
```

## Parameters
* `start`: Specifies the starting index of the column to be deleted.
* `stop`: Specifies the ending index of the column to be deleted. If omitted, all columns starting from `start` will be deleted.
* `-V, --version`: Output version information.
* `-h, --help`: Output help information.

## Examples
Remove all characters between `start` and `stop`, including `start` and `stop`, from the standard input.

```shell
colrm 3 6
# 123456
# 127
```

Remove all characters after `start` from the standard input.

```shell
colrm 3
# 1234567
# 12
```

Read the contents of the `file.txt` file and write the modified content to `file2.txt`.

```shell
cat file.txt | colrm 3 6 > file2.txt
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://linux.die.net/man/1/colrm
https://www.runoob.com/linux/linux-comm-colrm.html
https://www.geeksforgeeks.org/colrm-command-in-linux-with-examples/
```