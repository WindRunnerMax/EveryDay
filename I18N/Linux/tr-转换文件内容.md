# tr Command
The `tr` command is used to translate or delete characters in a file. It can read from a file or from the standard input, and after the string translation, it outputs the result to the standard output.

## Syntax
```shell
tr [OPTION]... SET1 [SET2]
```

## Options
* `-c, -C, --complement`: use the complement of `SET1`.
* `-d, --delete`: delete characters in `SET1` without translation.
* `-s, --squeeze-repeats`: replace each input sequence of a repeated character listed in `SET1` with a single occurrence of that character.
* `-t, --truncate-set1`: first truncate `SET1` to the length of `SET2`.
* `--help`: display this help and exit.
* `--version`: output version information and exit.

## Interpretation of escape sequences
... (The content of this section remains unchanged)

## Examples
The content of the `file.txt` file is as follows.

```
Hello World
```

Convert all letters in the file to uppercase.

```shell
cat file.txt | tr [a-z] [A-Z]
# HELLO WORLD
```

You can achieve the same using the `[:lower]` and `[:upper]` arguments.

```shell
cat file.txt | tr [:lower:] [:upper:]
# HELLO WORLD
```

Convert whitespace characters to tab.

```shell
cat file.txt | tr [:space:] "\t"
# Hello   World
```

Delete all `o` characters.

```shell
cat file.txt | tr -d "o"
# Hell Wrld
```

Delete all numbers.

```shell
echo "My ID is 73535" | tr -d [:digit:]
# My ID is
```

Extract numbers from a string.

```
echo "My ID is 73535" | tr -cd [:digit:]
# 73535
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.runoob.com/linux/linux-comm-tr.html
https://www.tutorialspoint.com/unix_commands/tr.htm
https://www.geeksforgeeks.org/tr-command-in-unix-linux-with-examples/
```
