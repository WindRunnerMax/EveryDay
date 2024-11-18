# Setting up local running environment for CMD in VScode (2.0)
[Official Task.json Documentation](https://code.visualstudio.com/docs/editor/tasks)
[Complete Task.json Configuration Information](https://code.visualstudio.com/docs/editor/tasks-appendix)
[Task.json Predefined Variables](https://code.visualstudio.com/docs/editor/variables-reference)

Many tutorials online suggest downloading the Python plugin for VScode to configure the environment, but I only wanted to set it up for terminal input and output. After some research, I found out that all the commands that can run in CMD can be configured directly in the task.json file (using Python as an example).

If you press CTRL + SHIFT + B in a .py file without a compilation environment, a .vscode folder will appear in the workspace. **Note: you must have a workspace to run (import a folder into the workspace), if not, just import a folder**. In the .vscode folder, the task.json file will appear, which needs to be configured as follows.

```json
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

One major pitfall I encountered was that without `"cwd": "${fileDirname}"`, it would execute in the workspace directory. This caused an error when using relative paths to identify captchas, as it couldn't find the downloaded captcha. Therefore, it is necessary to specify the running directory to the file's location, and then it's essentially like executing `python xxx.py`.

In theory, all commands that can run in CMD can be configured this way, like C++ and PHP.