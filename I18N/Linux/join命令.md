

# `join` Command

The `join` command is used to join the lines with the specified column content in two files. It first identifies the lines with the same content in the specified column in two files, merges them, and then outputs them to the standard output device.

## Syntax

```shell
join [OPTION]... FILE1 FILE2
```

## Options
* `-a FILENUM`: Print unpairable lines from `FILENUM`, where `FILENUM` is `1` or `2`, corresponding to `FILE1` or `FILE2`.
* `-e EMPTY`: Replace missing input fields with EMPTY.
* `-i, --ignore-case`: Ignore differences in case when comparing fields.
* `-j FIELD`: Equivalent to `-1 FIELD -2 FIELD`.
* `-o FORMAT`: Construct the output line according to FORMAT.
* `-t CHAR`: Use CHAR as the input and output field separator.
* `-v FILENUM`: Similar to `-a FILENUM`, but do not join the output lines.
* `-1 FIELD`: Join on this FIELD from file 1.
* `-2 FIELD`: Join on this FIELD from file 2.
* `--check-order`: Check that the input is correctly sorted, even if all input lines can be paired.
* `--nocheck-order`: Do not check that the input is correctly sorted.
* `--header`: Treat the first line of each file as field headers and print them without attempting to pair them.
* `--help`: Display this help and exit.
* `--version`: Output version information and exit.

## Examples
Contents of `file1.txt` and `file2.txt` are as follows:

```
# file1.txt
1 AAYUSH
2 APAAR
3 HEMANT
4 KARTIK
5 TIM

# file2.txt
1 101
2 102
3 103
4 104
```

To merge files using the `join` command, the files must have some common fields, and in this case, the common fields in both files are labeled with numbers `1, 2...`.

```shell
join file1.txt file2.txt
# 1 AAYUSH 101
# 2 APAAR 102
# 3 HEMANT 103
# 4 KARTIK 104
```

Using the `-a` option to print the paired lines from `FILE1` and also the unpaired ones.

```shell
join file1.txt file2.txt -a 1
# 1 AAYUSH 101
# 2 APAAR 102
# 3 HEMANT 103
# 4 KARTIK 104
# 5 TIM

```

Using the `-v` option to print the unpaired lines from `FILE1`.

```shell
join file1.txt file2.txt -v 1
# 5 TIM
```

`join` combines the lines of the files on the first common field, which is the default. However, the common value in the two files is not always in the first column, so `join` can use `-1, -2` to specify the position of the common value. `-1` and `-2` denote the first and second files, and these options require a numerical argument that references the joining field of the corresponding file.

```
Contents of `file1.txt` and `file2.txt` are as follows:
# file1.txt
AAYUSH 1 
APAAR 2
HEMANT 3
KARTIK 4
TIM 5

# file2.txt
101 1
102 2
103 3
104 4
```

```shell
join -1 2 -2 2 file1.txt file2.txt
# 1 AAYUSH  101
# 2 APAAR 102
# 3 HEMANT 103
# 4 KARTIK 104
```

For the above example, we can also achieve the same using the `-j` parameter directly.

```shell
join -j 2 file1.txt file2.txt
# 1 AAYUSH  101
# 2 APAAR 102
# 3 HEMANT 103
# 4 KARTIK 104
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.computerhope.com/unix/ujoin.htm
https://www.runoob.com/linux/linux-comm-join.html
https://www.geeksforgeeks.org/join-command-linux/
```