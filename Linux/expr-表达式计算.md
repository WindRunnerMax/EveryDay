# expr命令
`expr`命令计算给定表达式并显示其相应的输出，其被使用用于：基本操作像加法、减法、乘法、除法和模等等整数，求值正则表达式，字符串操作，如子字符串，字符串长度等。

## 语法

```shell
expr [EXPRESSION | OPTION]
```

## 参数
* `--help`: 输出帮助信息。
* `--version`:  输出版本信息。

## 表达式
* `ARG1 | ARG2`: `ARG1`，如果它既不为`null`也不为`0`，否则为`ARG2`。
* `ARG1 & ARG2`: 如果两个参数都不为`null`或`0`，则为`ARG1`，否则为`0`。
* `ARG1 < ARG2`: `ARG1`小于`ARG2`。
* `ARG1 <= ARG2`: `ARG1`小于等于`ARG2`。
* `ARG1 = ARG2`: `ARG1`等于`ARG2`。
* `ARG1 != ARG2`: `ARG1`与`ARG2`不相等。
* `ARG1 >= ARG2`: `ARG1`大于或等于`ARG2`。
* `ARG1 > ARG2`: `ARG1`大于`ARG2`。
* `ARG1 + ARG2`: `ARG1`和`ARG2`的算术和。
* `ARG1 - ARG2`: `ARG1`和`ARG2`的算术差。
* `ARG1 * ARG2`: `ARG1`和`ARG2`的算术乘积。
* `ARG1 / ARG2`: `ARG1`除以`ARG2`的算术商。
* `ARG1 % ARG2`: `ARG1`除以`ARG2`的算术余数。
* `STRING : REGEXP`: 正则表达式`REGEXP`在`STRING`中的定位模式匹配。
* `match STRING REGEXP`: 与`STRING`相同`REGEXP`。
* `substr STRING POS LENGTH`: `STR`的子字符串，`POS`从`1`开始计数。
* `index STRING CHARS`: 找到任何`CHARS`的`STRING`中的索引，或者为`0`。
* `length STRING`: 字符串长度。
* `+ TOKEN`: 将`TOKEN`解释为字符串，即使它是像`match`这样的关键字或像`/`这样的操作符。
* `( EXPRESSION )`: `EXPRESSION`的值。

## 示例

计算`12 + 9`。

```shell
expr 12 + 9
# 21
```

计算`12 * 2`。

```bash
expr 12 \* 2
# 24
```

对`shell`脚本中的变量执行操作，注意保存成`.sh`文件并赋权限`755`再执行。

```shell
echo "Enter two numbers"
read x 
read y
sum=`expr $x + $y`
echo "Sum = $sum"
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.computerhope.com/unix/uexpr.htm
https://www.runoob.com/linux/linux-comm-expr.html
https://www.geeksforgeeks.org/expr-command-in-linux-with-examples/
```

