# 将SublimeText加入右键菜单

```bash
Windows Registry Editor Version 5.00

[HKEY_CLASSES_ROOT\*\shell\SublimeText]
@="Open By SublimeText"
"Icon"="E:\\Sublime Text3\\sublime_text.exe,0"

[HKEY_CLASSES_ROOT\*\shell\SublimeText\command]
@="E:\\Sublime Text3\\sublime_text.exe %1"

```
将代码保存为`sublime.reg`双击打开安装即可
注意`E:\\Sublime Text3\\sublime_text.exe`是sublime安装路径
执行添加后注册表如下
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200217121204220.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQwNDEzNjcw,size_16,color_FFFFFF,t_70)

