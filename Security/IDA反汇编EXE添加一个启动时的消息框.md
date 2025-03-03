# IDA反汇编EXE添加一个启动时的消息框
上一篇文章介绍了用`OD`反汇编`EXE`添加一个启动时的消息框，这篇文章也是实现同样的效果，这边主要的思路还是将其反汇编得到汇编代码后，然后手动修改他的逻辑首先跳转到弹框区域再跳转回来去执行原来的代码，相关的工具有`IDA`，以及要修改的一个`xp`系统自带的扫雷软件。本来想着用`OD`做就可以了，然后同学告诉我`IDA`功能更多一些，我了解了一下确实更加方便我完成需求，但是网络上关于`IDA`相关的教程还是比较少，我也是折腾了好一阵子才完成了修改，而且我也觉得有必要记录一下对于`IDA`的相关操作。

## 描述
首先准备好要用到的软件也就是`IDA`和扫雷这个软件，特别建议使用`IDA Pro 7.5`版本，在细节方面尤其是返回和前进也就是`Ctrl + Z`和`Ctrl + Y`用起来很舒服，当然其他版本主要功能都是有的。

![](screenshots/2023-04-14-20-50-55.jpg)


首先用`IDA`打开扫雷，一切以默认设置即可，然后进入就是代码的函数执行流程了。



![](screenshots/2023-04-14-20-51-01.jpg)


![](screenshots/2023-04-14-20-51-08.jpg)


此时按空格就能够切换到代码，按`Ctrl + E`进入入口点。

![](screenshots/2023-04-14-20-51-13.png)


![](screenshots/2023-04-14-20-51-19.png)


我们复制一下`01003E23`地址的`push    offset stru_1001390`，找个地方存起来，后边会用得到。

![](screenshots/2023-04-14-20-51-25.png)

然后我们将鼠标光标移动到`01003E28`也就是下一行，然后点击键盘`n`，为其起一个本地的名字`loc_01003E28`。


![](screenshots/2023-04-14-20-51-31.png)

![](screenshots/2023-04-14-20-51-37.png)

![](screenshots/2023-04-14-20-51-43.png)

我们转移到`Hex View-1`窗口，然后往下找到一块`00`的位置，都是在文件的末尾区域，我们右击有一个与`IDA -ViewA`同步的选项也要勾上，这样我们就可以在打开`IDA`代码窗口的区域同步到这块地址了。

![](screenshots/2023-04-14-20-51-51.png)

![](screenshots/2023-04-14-20-51-56.png)

![](screenshots/2023-04-14-20-52-04.png)

我们要从`01004A71`开始写，我们可以按`G`键，进行跳转，要跳转到`01004A71`位置。

![](screenshots/2023-04-14-20-52-12.png)

![](screenshots/2023-04-14-20-52-22.png)

可以看到这个位置是被折叠的，我们选中后可以按`D`键将其展开，然后我们再次跳转到`01004A71`位置。

![](screenshots/2023-04-14-20-52-29.png)

![](screenshots/2023-04-14-20-53-01.png)

此时我们开始编写字符串，我们首先需要将字符串转成`HEX`，直接搜索`HEX`在线转换即可找到，我们将`Title`进行转换即可看到`54 69 74 6C 65`。

![](screenshots/2023-04-14-20-53-07.jpg)


我们选中好`01004A71`行后，点击`edit - Patch program - Change byte`。

![](screenshots/2023-04-14-20-53-15.png)

在这里我们输入刚才转换的`HEX`编码，注意`MessageBoxW`是使用两个字节的`UTF-8`编码的，不能直接使用一个字节的`ASCII`编码值，所以刚才我们编写的`54 69 74 6C 65`要写成`54 00 69 00 74 00 6C 00 65 00`，当然在`Hex View1`里直接右击修改也是可以的。

![](screenshots/2023-04-14-20-53-20.png)

![](screenshots/2023-04-14-20-53-27.png)


我们再空出来几行，在`01004A80`这边再写一个，我们转换`Hello World`到`HEX`编码`48 65 6c 6c 6f 20 57 6f 72 6c 64`。

![](screenshots/2023-04-14-20-53-34.jpg)

我们自行加入`00`，这便成了`48 00 65 00 6c 00 6c 00 6f 00 20 00 57 00 6f 00 72 00 6c 00 64`，当然这边太长了，不够的位置我们需要重新输入，当然如果直接使用`Hex View1`就直接输入就可以了。

![](screenshots/2023-04-14-20-53-40.png)

![](screenshots/2023-04-14-20-53-46.png)

![](screenshots/2023-04-14-20-53-52.png)

![](screenshots/2023-04-14-20-53-58.png)

此时我们需要为这个字符串起名字，光标定位到`01004A71`点`N`键，为其起一个名字，同样光标定位到`01004A80`，同样点`N`键为其起名，我为其分别起了个`title`和`content`。

![](screenshots/2023-04-14-20-54-04.png)

![](screenshots/2023-04-14-20-54-10.png)

![](screenshots/2023-04-14-20-55-12.png)

然后我们再空几行，我们将鼠标定位到`01004A9A`这个位置，然后点击`edit - Patch program - Assemble`，为其输入命令，我们按序输入以下的命令。

```
push 0
push title
push content
push 0
CALL DWORD PTR DS:[MessageBoxW]
```

![](screenshots/2023-04-14-20-55-20.png)

还记得之前在一开始就复制的`01003E23`地址的`push    offset stru_1001390`，我们在这里将代码复制下来`push  stru_1001390`，注意没有`offset`，我们在这边继续追加这行，另外在最初我们还添加了一个本地的名字`loc_01003E28`，我们还需要追加一个`jmp loc_01003E28`。

![](screenshots/2023-04-14-20-57-23.png)

![](screenshots/2023-04-14-20-57-48.png)

![](screenshots/2023-04-14-21-02-32.png)


此时我们选中这块位置，按`P`键来创建函数。

![](screenshots/2023-04-14-21-02-52.png)

![](screenshots/2023-04-14-21-02-58.png)


我们选中这个`sub_1004A9A`，点击`N`键为这个函数重新起个名字`message_box`。

![](screenshots/2023-04-14-21-03-15.png)

![](screenshots/2023-04-14-21-04-03.png)

我们按`Ctrl + E`跳转到入口点，我们选中`01003E23`这一行，我们修改这个汇编代码为`jmp message_box`。

![](screenshots/2023-04-14-21-04-11.png)

![](screenshots/2023-04-14-21-04-18.png)

现在我们已经完成了操作，思路就是从入口开始执行我们自己的代码，然后执行完了再跳转回去继续执行原来的代码，现在我们将所做修改保存到源文件`Edit - Patch program - Apply patches to input file`，选择要注入的文件以及是否需要备份即可。

![](screenshots/2023-04-14-21-04-24.png)

![](screenshots/2023-04-14-21-04-31.png)

保存过后，运行该文件即可看到效果。

![](screenshots/2023-04-14-21-04-39.jpg)

## Blog

```
https://blog.touchczy.top/#/
```

## 参考

```
https://tool.lu/hexstr/
http://www.downcc.com/soft/24420.html
http://www.xz7.com/downinfo/347986.html
```
