# The `expr` command

The `expr` command calculates the given expression and displays its corresponding output. It is used for basic operations such as addition, subtraction, multiplication, division, and modulus on integers, evaluating regular expressions, and string operations such as substring and string length.

## Syntax

```shell
expr [EXPRESSION | OPTION]
```

## Parameters
* `--help`: Output help information.
* `--version`: Output version information.

## Expressions
* `ARG1 | ARG2`: `ARG1` if it is neither `null` nor `0`, otherwise `ARG2`.
* `ARG1 & ARG2`: `ARG1` if both arguments are neither `null` nor `0`, otherwise `0`.
* `ARG1 < ARG2`: `ARG1` is less than `ARG2`.
* `ARG1 <= ARG2`: `ARG1` is less than or equal to `ARG2`.
* `ARG1 = ARG2`: `ARG1` is equal to `ARG2`.
* `ARG1 != ARG2`: `ARG1` is not equal to `ARG2`.
* `ARG1 >= ARG2`: `ARG1` is greater than or equal to `ARG2`.
* `ARG1 > ARG2`: `ARG1` is greater than `ARG2`.
* `ARG1 + ARG2`: Arithmetic sum of `ARG1` and `ARG2`.
* `ARG1 - ARG2`: Arithmetic difference of `ARG1` and `ARG2`.
* `ARG1 * ARG2`: Arithmetic product of `ARG1` and `ARG2`.
* `ARG1 / ARG2`: Arithmetic quotient of `ARG1` divided by `ARG2`.
* `ARG1 % ARG2`: Arithmetic remainder of `ARG1` divided by `ARG2`.
* `STRING : REGEXP`: Pattern match of the regular expression `REGEXP` in `STRING`.
* `match STRING REGEXP`: Same as `STRING` matching `REGEXP`.
* `substr STRING POS LENGTH`: Substring of `STR` starting at `POS`, which starts counting from `1`.
* `index STRING CHARS`: Index of any of `CHARS` in `STRING`, or `0` if not found.
* `length STRING`: Length of the string.
* `+ TOKEN`: Treat `TOKEN` as a string, even if it is a keyword like `match` or an operator like `/`.
* `(EXPRESSION)`: Value of `EXPRESSION`.

## Examples

Calculate `12 + 9`.

```shell
expr 12 + 9
# 21
```

Calculate `12 * 2`.

```shell
expr 12 \* 2
# 24
```

Perform operations on variables in a `shell` script. Remember to save it as a `.sh` file, grant it `755` permission, and then execute.

```shell
echo "Enter two numbers"
read x 
read y
sum=`expr $x + $y`
echo "Sum = $sum"
```

## Daily Question
```
https://github.com/WindrunnerMax/EveryDay
```

## References
```
https://www.computerhope.com/unix/uexpr.htm
https://www.runoob.com/linux/linux-comm-expr.html
https://www.geeksforgeeks.org/expr-command-in-linux-with-examples/
```