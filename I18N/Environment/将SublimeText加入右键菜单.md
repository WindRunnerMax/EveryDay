# Add SublimeText to the right-click menu

```bash
# Adding SublimeText to the right-click menu

Windows Registry Editor Version 5.00

[HKEY_CLASSES_ROOT\*\shell\SublimeText]
@="Open By SublimeText"
"Icon"="E:\\Sublime Text3\\sublime_text.exe,0"

[HKEY_CLASSES_ROOT\*\shell\SublimeText\command]
@="E:\\Sublime Text3\\sublime_text.exe %1"
```

Save the code as `sublime.reg` and double-click to open and install. Note that `E:\\Sublime Text3\\sublime_text.exe` is the installation path for Sublime. After running the add command, the registry will look like the following:

![](screenshots/2023-04-14-18-56-36.png)
