# The `tee` Command

The `tee` command reads data from the standard input device, outputs its content to the standard output device, and simultaneously saves it as a file.

## Syntax

```shell
tee [OPTION]... [FILE]...
```

## Options
* `-a, --append`: Append to the end of an existing file instead of overwriting it.
* `-i, --ignore-interrupts`: Ignore interrupt signals.
* `-p`: Diagnose errors writing to non-pipes.
* `--output-error[=MODE]`: Set behavior on output write errors.
* `--help`: Display help information.
* `--version`: Display version information.

## Modes
* `warn`: Diagnose errors writing to any output.
* `warn-nopipe`: Diagnose errors writing to any output that is not a pipe.
* `exit`: Exit when errors writing to any output occur.
* `exit-nopipe`: Exit when errors writing to any output (not a pipe) occur.

## Examples
Save the user input data to both `file1.txt` and `file2.txt`. After entering the file information, press Enter to obtain feedback.

```shell
tee file1.txt file2.txt
```

Append the user input data to the `file1.txt` file.

```shell
tee -a file1.txt
```

List all files with the `.txt` extension in the current directory, one file name per line, pass the output through a pipeline to `wc` to count the lines and output the number, pass the output through a pipeline to `tee` to write it to the terminal, and write the information to the `count.txt` file, which counts the number of files with the `.txt` extension.

```shell
ls -1 *.txt | wc -l | tee count.txt
```

## Daily Question
```
https://github.com/WindrunnerMax/EveryDay
```

## References
```
https://www.computerhope.com/unix/utee.htm
https://www.runoob.com/linux/linux-comm-tee.html
https://www.tutorialspoint.com/unix_commands/tee.htm
```