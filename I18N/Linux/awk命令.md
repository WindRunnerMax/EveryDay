# The `awk` command
`Awk` is a general-purpose scripting language used for advanced text processing. It is mainly used as a reporting and analysis tool. Unlike most other procedural programming languages, `Awk` is data-driven, meaning that you need to define a set of operations to be performed on the input text and then it fetches the input data, processes it, and sends the results to standard output.

## Syntax
```shell
awk [ -F fs ] [ -v var=value ] [ 'prog' | -f progfile ] [ file ... ]
```

## Parameters
* `-F fs`: Set the input field separator to the regular expression `fs`.
* `-v var=value`: Assign the value to the variable `var` before executing the `awk` program.
* `'prog'`: The `awk` program.
* `-f progfile`: Specify the file `progfile` that contains the `awk` program to be executed.
* `file ...`: Files to be processed by the specified `awk` program.

## Examples

Suppose the example file `example.txt` contains the following data:

```
Bucks Milwaukee    60 22 0.732 
Raptors Toronto    55 24 0.707 
76ers Philadelphia 51 31 0.622
Celtics Boston     33 33 0.598
Pacers Indiana     30 34 0.585
```

Print the third field of `example.txt`.

```shell
awk '{ print $3 }' example.txt
# 60
# 55
# 51
# 33
# 30
```

Match the groups that start with `R` using regular expressions.

```shell
awk '/^R/ { print $1,$2,$3,$4 }' example.txt
# Raptors Toronto 55 24
```

Use `BEGIN` and `END` to perform actions before and after processing records. The process is to output groups where the second field contains `Tor`.

```shell
awk 'BEGIN { print "Start Processing" }; $2 ~ /Tor/ {print $1,$2,$3,$4 }; END { print "End Processing" }' example.txt
# Start Processing
# Raptors Toronto 55 24
# End Processing
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://linuxize.com/post/awk-command/
https://www.computerhope.com/unix/uawk.htm
https://www.runoob.com/linux/linux-comm-awk.html
```