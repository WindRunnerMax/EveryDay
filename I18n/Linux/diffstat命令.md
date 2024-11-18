# The `diffstat` command

The `diffstat` command calculates the differences, such as insertions, deletions, and modifications, for each file based on the comparison results of `diff`.

## Syntax

```shell
diffstat [options] [files]
```

## Parameters
* `-c`: Prefixes each line of output with `#` to make it a comment line for a `Shell` script.
* `-C`: Adds `SGR` color escape sequences to highlight the histogram.
* `-e`: Redirects standard error to `file`.
* `-f <num>`: Specifies the format of the histogram. `0` only shows the value of insertion `+`, deletion `-`, or modification `!` and a single histogram code. `1` is the normal output. `2` fills the histogram with dots. `4` prints a histogram for each value. Any nonzero value provides a histogram, dots, and single values in combination.
* `-H`: Prints a usage message and exits.
* `-k`: Prevents merging file names in the report.
* `-l`: Lists only file names without generating a histogram.
* `-n <file length>`: Specifies the length of the file name, which must be greater than or equal to the longest file name in all files.
* `-o <file>`: Redirects standard output to `file`.
* `-p <file length>`: Same as the `-n` parameter, but here `<file length>` includes the file's path.
* `-r`: Provides optional rounding of the data shown on the histogram instead of truncating by error adjustment. `0` is the default value, which does not perform rounding, but accumulated errors are added to the following columns. `1` rounds the data. `2` rounds the data and adjusts the histogram to ensure that even if there is usually rounding, there are differences.
* `-t`: Overrides the histogram to generate comma-separated value output.
* `-u`: Prevents sorting file names in the report.
* `-v`: Shows progress, for example, if the output is redirected to a file, progress messages are written to standard error.
* `-w`: Specifies the width of the output field.
* `-V`: Shows version information.

## Examples

Calculate the difference information of the comparison result of `diff`.

```shell
diff file.txt file2.txt | diffstat -v
```

Calculate the difference information of the comparison result of `diff`, only lists file names without generating a histogram.

```shell
diff file.txt file2.txt | diffstat -l
```

Calculate the difference information of the comparison result of `diff`, specifying the maximum width of the histogram.

```shell
diff file.txt file2.txt | diffstat -w 11
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://man.linuxde.net/diffstat
https://www.runoob.com/linux/linux-comm-diffstat.html
https://www.tutorialspoint.com/unix_commands/diffstat.htm
```