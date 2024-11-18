# The `file` command

The `file` command is used to detect the type of a given file. The inspection of a file by the `file` command involves three processes: file system, magic file, and language check.

## Syntax

```shell
file [ -bchikLnNprsvz ] [ -f namefile ] [ -F separator ] [ -m magicfiles ] [file or folder] ...
file -C [ -m magicfile ]
```

## Parameters
* `-b, --brief`: Brief mode, when listing identification results, does not display the file name.
* `-c, --checking-printout`: Detailed display of the command execution process, to facilitate debugging or analysis of program execution.
* `-C, --compile`: Compile a `magic.mgc` output file, which contains the pre-parsed version of the files.
* `-f, --files-from <file>`: Specify the name of the file, and when the content has one or more file names, let `file` identify these files in sequence, with each file name in a separate line.
* `-F, --separator separator`: Use the specified string as the separator between the file name and the returned file result, the default is `:`.
* `-i, --mime`: Make the file command output the `mime` type.
* `-L`: Directly display the category of the file the symbolic link points to.
* `-L, --dereference`: Follow symbolic links, if `POSIXLY_CORRECT` is set, it is the default value.
* `-m <file>`: Specify the magic file. The `magic file` rules determine the type of a file based on its special content, such as the identification information for the `tar` format, usually the default `magic file` exists in directories such as `/usr/share/file/`.
* `-n, --no-buffer`: Force the standard output to be flushed after checking each file, it is only useful when checking the file list, and this option is used by programs that wish to output the file type from a pipe.
* `-N, --no-pad`: Do not pad the file names to align them in the output.
* `-r, --raw`: Do not translate unprintable characters to `\ooo`, usually files will convert unprintable characters into octal representation.
* `-v`: Display version information.
* `-z`: Attempt to interpret the contents of compressed files.
* `file or folder`: The list of files for which to determine the type, multiple files separated by spaces, shell wildcard can be used to match multiple files.

## Example

Display the file type.

```shell
file file.txt
# file.txt: ASCII text
```

Display the `MIME` type of the file.

```shell
file -i file.txt
# file.txt: text/plain; charset=us-ascii
```

Brief mode, without displaying the file name.

```shell
file -b -i file.txt
# text/plain; charset=us-ascii
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://www.runoob.com/linux/linux-comm-file.html
https://www.tutorialspoint.com/unix_commands/file.htm
https://blog.csdn.net/pzqingchong/article/details/70226640
```