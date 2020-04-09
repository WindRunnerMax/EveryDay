VScode配置CMD本地运行环境(2.0)
[官方Task.json说明](https://code.visualstudio.com/docs/editor/tasks)
[完整的Task.json配置信息](https://code.visualstudio.com/docs/editor/tasks-appendix)
[Task.json预定义变量](https://code.visualstudio.com/docs/editor/variables-reference)
    看了很多网上的教程都说需要下载VScode的python插件，然而我只是想配置一下能使用其在终端输入输出，研究了一段时间发现其实所有能在cmd运行的命令直接配置一下task.json即可（以python为例）。
    在没有编译环境的.py文件中按下CTRL + SHIFT + B,就会在工作空间出现一个.vscode文件夹，【运行必须有工作空间（导入文件夹到工作空间），如果没有导入一个文件夹即可】，在.vscode中即出现task.json文件，进行如下配置。
    

```
{
    // See https://go.microsoft.com/fwlink/?LinkId=733558
    // for the documentation about the tasks.json format
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Python",
            "type": "shell",
            "command": "python",
            "args": [
                "${fileBasename}"
            ],
            "presentation": {
                "reveal": "always",
                "panel": "shared"
            },
            "options": {
                "cwd": "${fileDirname}"
            },
            "group": {
                "kind": "build",
                "isDefault": true
            },
            "problemMatcher": ["$tsc"]
        }
    ]
}
```
   踩过的一个大坑就是如果没有 "cwd": "${fileDirname}" 就会在工作空间目录下执行，导致了我识别验证码使用相对路径报错，找不到请求下来的验证码。所以需要将运行目录指定到文件所在目录，然后就相当于执行 python xxx.py。
   理论上所有在CMD中能运行的命令都可以这么配置，比如C++和php。   理论上所有在CMD中能运行的命令都可以这么配置，比如C++和php。