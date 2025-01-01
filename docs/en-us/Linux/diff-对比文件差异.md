# diff command
The `diff` command can compare the differences between two given files. If you use `-` as a file parameter, the content to be compared will come from the standard input. The `diff` command compares the differences between text files line by line. If the command specifies a directory comparison, it will compare files within that directory that have the same file names and will not compare any subdirectory files.

## Syntax

```shell
diff [-abBcdefHilnNpPqrstTuvwy][-<line>][-C <line>][-D <macro>][-I <string>][-S <file>][-W <width>][-x <file or folder>][-X <file>][--help][--left-column][--suppress-common-line][file or folder][file or folder]
```

## Parameters
* `-a` or `--text`: `diff` defaults to comparing text files line by line.
* `-b` or `--ignore-space-change`: Ignores changes in space characters.
* `-B` or `--ignore-blank-lines`: Ignores blank lines.
* `-c`: Displays all content and marks the differences.
* `-C <line>` or `--context <line>`: Same as executing the `-c-<line>` instruction.
* `-d` or `--minimal`: Uses a different algorithm to compare using smaller units.
* `-D <macro>` or `ifdef <macro>`: The output format of this parameter can be used for preprocessor macros.
* `-e` or `--ed`: The output format of this parameter can be used for an `ed` script file.
* `-f` or `-forward-ed`: The output format is similar to an `ed` script file, but displays the differences in the original file's order.
* `-H` or `--speed-large-files`: Speeds up the comparison of large files.
* `-l<string>` or `--ignore-matching-lines<string>`: If two files differ on certain lines and those lines also contain the characters or string specified in the option, the differences in those lines are not displayed.
* `-i` or `--ignore-case`: Ignores differences in case.
* `-l` or `--paginate`: Pages the result using the `pr` program.
* `-n` or `--rcs`: Displays the comparison result in `RCS` format.
* `-N` or `--new-file`: When comparing directories, if file `A` only appears in one directory, by default it will display `Only in <folder>`, if file `A` uses the `-N` option, `diff` will compare file `A` with a blank file.
* `-p`: When comparing C language program code files, it shows the name of the function where the difference occurs.
* `-P` or `--unidirectional-new-file`: Similar to `-N`, but only when the second directory contains files that the first directory doesn't, it will compare these files with a blank file.
* `-q` or `--brief`: Only displays whether there are differences, no detailed information is shown.
* `-r` or `--recursive`: Compares files in subdirectories.
* `-s` or `--report-identical-files`: If no differences are found, it still displays information.
* `-S <file>` or `--starting-file <file>`: When comparing directories, starts comparing from the specified file.
* `-t` or `--expand-tabs`: Expands `tab` characters in the output.
* `-T` or `--initial-tab`: Adds a `tab` character at the beginning of each line for alignment.
* `-u`, `-U <columns>` or `--unified=<columns>`: Displays the differences in the file content in a merged manner.
* `-v` or `--version`: Displays version information.
* `-w` or `--ignore-all-space`: Ignores all space characters.
* `-W <width>` or `--width <width>`: When using the `-y` parameter, specifies the column width.
* `-x <file or folder>` or `--exclude <file or folder>`: Excludes the specified files or directories from the comparison.
* `-X<file>` or `--exclude-from<file>`: You can save the file or directory types as a text file and then specify this text file in `<file>`.
* `-y` or `--side-by-side`: Displays the differences between files side by side.
* `--help`: Displays help.
* `--left-column`: When using the `-y` parameter, if a certain line in both files is the same, only the content of that line is displayed on the left side.
* `--suppress-common-lines`: When using the `-y` parameter, only the differences are displayed.

## Examples
Compare the differences between the `file.txt` and `file2.txt` files, and only output the differences.

```shell
diff file.txt file2.txt
```

Compare the differences between the `file.txt` and `file2.txt` files and display all content side by side. `|` indicates differences between the two files, `<` indicates one less line of content in the latter file compared to the former, `>` indicates one more line of content in the latter file compared to the former.

```shell
diff -y file.txt file2.txt 
```

Compare the difference between `file.txt` and custom input. After entering the content, press `Ctrl+D` to output the `EOF` flag to end the input.

```shell
diff -y file.txt -
```


## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://man.linuxde.net/diff
https://www.cnblogs.com/wf-linux/p/9488257.html
https://www.runoob.com/linux/linux-comm-diff.html
```