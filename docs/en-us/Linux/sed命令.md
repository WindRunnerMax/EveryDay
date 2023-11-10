# Sed Command

The `sed` command uses scripts to process text files. It can process and edit text files according to the instructions in the script. It is mainly used for automatically editing one or more files, simplifying repetitive operations on files, and writing conversion programs, among other things.

## Syntax

```shell
sed [OPTION]... {script-only-if-no-other-script} [input-file]...
```

## Parameters
* `-n, --quiet, --silent`: Suppress automatic printing of pattern space.
* `-e script, --expression=script`: Add the script to the commands to be executed.
* `-f script-file, --file=script-file`: Add the contents of the script file to the commands to be executed.
* `--follow-symlinks`: Follow symbolic links when doing in-place editing.
* `-i[SUFFIX], --in-place[=SUFFIX]`: Edit files in place; if a suffix is provided, make a backup of each edited file.
* `-l N, --line-length=N`: Specify the desired line length `N` for the `l` command.
* `--POSIX`: Disable all GNU extensions.
* `-r, --regexp-extended`: Use extended regular expressions in the script.
* `-s, --separate`: Treat input files as separate files, not a single continuous long stream.
* `-u, --unbuffered`: Load minimal amounts of input from the files and flush the output buffer more often.
* `--help`: Display help information.
* `--version`: Display version information.

## Examples
The content of the `file.txt` file is as follows.

```
unix is great os. unix is opensource. unix is free os.
learn operating system.
unix linux which one you choose.
unix is easy to learn.unix is a multiuser os.Learn unix .unix is a powerful.
```

Replace the first occurrence of the word `unix` with `linux` in each line of the file. If you want to save the changes, you need to use output redirection.

```shell
sed "s/unix/linux/" file.txt

# linux is great os. unix is opensource. unix is free os.
# learn operating system.
# linux linux which one you choose.
# linux is easy to learn.unix is a multiuser os.Learn unix .unix is a powerful.

```

Replace the second occurrence of the word `unix` with `linux` in each line.

```shell
sed "s/unix/linux/2" file.txt

# unix is great os. linux is opensource. unix is free os.
# learn operating system.
# unix linux which one you choose.
# unix is easy to learn.linux is a multiuser os.Learn unix .unix is a powerful.
```

Use the `/g` replacement flag to globally replace the specified `sed` command to replace all occurrences of the string in each line.

```shell
sed "s/unix/linux/g" file.txt

# linux is great os. linux is opensource. linux is free os.
# learn operating system.
# linux linux which one you choose.
# linux is easy to learn.linux is a multiuser os.Learn linux .linux is a powerful.
```

Replace all occurrences of the pattern past the second occurrence.

```shell
sed "s/unix/linux/2g" file.txt

# unix is great os. linux is opensource. linux is free os.
# learn operating system.
# unix linux which one you choose.
# unix is easy to learn.linux is a multiuser os.Learn linux .linux is a powerful
```

Enclose the first character of each word in parentheses and print it inside the parentheses.

```
echo "Welcome To The World" | sed "s/\(\b[A-Z]\)/\(\1\)/g"

# (W)elcome (T)o (T)he (W)orld
```

You can restrict the `sed` command to replace the string on a specific line number.

```
sed "3 s/unix/linux/g" file.txt

```markdown
# Unix is a great operating system. It's open source and free. If you want to learn about operating systems, consider Linux. The decision is up to you!

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.computerhope.com/unix/used.htm
https://www.runoob.com/linux/linux-comm-sed.html
https://www.geeksforgeeks.org/sed-command-in-linux-unix-with-examples/
```
```