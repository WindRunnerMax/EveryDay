# Look Command
The `look` command is used to search for words by specifying only the prefix string to be queried, and it will display all the words whose starting string matches the given condition.

## Syntax
```
look [-bdf] [-t char] string [file ...]
```

## Options
* `-a, --alternative`: Use an alternative dictionary file.
* `-d, --alphanum`: Use the standard alphanumeric character set and order, i.e., only compare space and alphanumeric characters. If no file is specified, this option is enabled by default.
* `-f, --ignore-case`: Ignore the case of alphabetic characters. If no file is specified, this option is enabled by default.
* `-t, --terminate character`: Specify a string termination character, i.e., only compare characters in the string up to the first occurrence of the character, including the first occurrence of the character.
* `-V, --version`: Output version information.
* `-h, --help`: Output help information.

## Examples

Use `look` to find words starting with `ab`.
```
look ab
# Abbas
# Abbas's
# Abbasid
# Abbasid's
# Abbott
# Abbott's
# Abby
# ...
```

Find words starting with `L` in a file and display the entire sentence.

```
# file.txt
HELLO LINUX!  
Linux is a free unix-type operating system.  
This is a Linux test file!  
```

```
look L file.txt
Linux is a free unix-type operating system.
```

In the above example, use `-t` to specify a string termination character, i.e., only compare characters in the string up to the first occurrence (including the first occurrence) of the character.

```
look -t E HEO file.txt
# HELLO LINUX!
```

## Daily Question
```
https://github.com/WindrunnerMax/EveryDay
```

## Reference
```
https://www.runoob.com/linux/linux-comm-look.html
https://www.tutorialspoint.com/unix_commands/look.htm
https://www.geeksforgeeks.org/look-command-in-linux-with-examples/
```