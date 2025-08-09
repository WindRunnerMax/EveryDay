# systemctl命令
`Systemd`是一个命令组，涉及到系统管理的方方面面，而`systemctl`是`Systemd`的主命令，用于管理系统。

## 概述
在历史上`Linux`的启动一直采用`init`进程，这种方法有两个缺点，一是启动时间长，`init`进程是串行启动，只有前一个进程启动完，才会启动下一个进程，二是启动脚本复杂，`init`进程只是执行启动脚本，不管其他事情，脚本需要自己处理各种情况，这往往使得脚本变得很长。  
`Systemd`就是为了解决这些问题而诞生的，它的设计目标是，为系统的启动和管理提供一套完整的解决方案，根据`Linux`惯例，字母`d`是守护进程`daemon`的缩写，`Systemd`这个名字的含义，就是它要守护整个系统。使用了`Systemd`，就不需要再用`init`了，`Systemd`取代了`initd`，成为系统的第一个进程`PID`等于`1`，其他进程都是它的子进程，`Systemd`的优点是功能强大，使用方便，缺点是体系庞大，非常复杂，事实上，现在还有很多人反对使用`Systemd`，理由就是它过于复杂，与操作系统的其他部分强耦合，违反`keep simple, keep stupid`的`Unix`哲学。  
## 语法

```shell
systemctl [OPTIONS...] {COMMAND} ...
```

## 参数

### OPTIONS

* `-t, --type=`: 参数应该是以逗号分隔的单元类型列表，例如`service`和`socket`，如果其中一个参数是单位类型，则在列出单位时，将显示限制为某些单位类型，否则将显示所有类型的单位，作为一种特殊情况，如果其中一个参数是`help`，则将打印允许值的列表，程序将退出。
* `--state=`: 参数应该是以逗号分隔的单位负载、子状态或活动状态列表，列出单位时，仅显示处于指定状态的单位。
* `-p, --property=`: 使用`show`命令显示`unit/job/manager`属性时，将显示限制为参数指定的某些属性，如果未指定，则显示所有集合属性，参数应该是以逗号分隔的属性名列表，例如`MainPID`，如果多次指定，将显示具有指定名称的所有属性。
* `-a, --all`: 列出单位时，请显示所有加载的单位，无论其状态如何，包括不活动的单位，显示`unit/job/manager`属性时，无论是否设置，都显示所有属性，要列出系统上安装的所有单元，请改用`list-unit-files`命令。
* `-r, --recursive`: 当列出单位时，还显示本地容器的单位，本地容器的单位将以容器名称为前缀，并用单个冒号`:`分隔。
* `--reverse`: 显示具有列表依赖性的单元之间的反向依赖性，即在给定单元上具有类型为`Wants=`或`Requires=`的单元。
* `--after`: 使用`list-dependencies`列表依赖项，显示在指定单位之前排序的单位，换句话说，列出在指定单元的`After=`指令中的单元、在`Before=`指令中有指定单元的单元，或者是指定单元的隐式依赖项。
* `--before`: 使用`list-dependencies`列表依赖项，显示在指定单位之后排序的单位，换言之，列出在指定单元的`Before=`指令中、在`After=`指令中具有指定单元或以其他方式依赖于指定单元的单元。
* `-l, --full`: 不省略状态，即`list-units`列表单元、`list-jobs`列表作业和`list-timers`列表计时器的输出中的单元名称，` process tree entries`过程树条目，`journal output`日志输出或`truncate unit descriptions`截断单元描述。
* `--show-types`: 显示套接字时，显示套接字的类型。
* `--job-mode=`: 将新作业排队时，此选项控制如何处理已排队的作业，它采用`fail`、`replace`、`replace`、`replace-irreversibly`、`isolate`、`ignore dependencies`、`ignore requirements`或`flush`之一，默认为`replace`，除非使用了表示隔离作业模式的`isolate`命令。如果指定了`fail`，并且请求的操作与挂起的作业冲突，更具体地说导致已挂起的开始作业反转为停止作业，反之亦然，则导致操作失败。如果指定了`replace`默认值，则将根据需要替换任何冲突的挂起作业。如果指定了`replace-irreversibly`，则按`replace`操作，但也要将新作业标记为不可逆，这可以防止将来发生冲突的事务替换这些作业，甚至在不可逆作业仍挂起时排队，仍然可以使用`cancel`命令取消不可逆的作业。`isolate`仅对启动操作有效，并在启动指定单元时导致所有其他单元停止。使用隔离命令时，始终使用此模式。`flush`将导致在新作业排队时取消所有排队作业。如果指定了`ignore-dependencies`，那么将忽略此新作业的所有单元依赖项，并立即执行该操作，如果通过，则不会引入所通过单元的任何必需单元，并且不会遵循任何排序依赖关系，这主要是管理员的调试和救援工具，不应该被应用程序使用。`ignore-requirements`与`ignore-dependencies`类似，但只会导致忽略需求依赖项，排序依赖项仍将得到满足。
* `-i, --ignore-inhibitors`: 当系统关闭或请求睡眠状态时，忽略抑制器锁，应用程序可以建立抑制器锁，以避免某些重要操作如`CD`刻录等被系统关闭或睡眠状态中断，任何用户都可以使用这些锁，特权用户可以重写这些锁，如果使用任何锁，关机和睡眠状态请求通常会失败无论是否具有特权，并打印活动锁的列表，但是如果指定了`--ignore inhibitors`，则会忽略锁而不打印，并且无论如何都会尝试该操作，可能需要额外的权限。
* `-q, --quiet`: 禁止`snapshot`、`is-active`、`is-failed`、`is-enabled`、`is-system-running`、`enable`和`disable`的输出为标准输出。
* `--no-block`: 不要同步等待请求的操作完成，如果未指定，则将验证作业，将其加入队列，并且`systemctl`将等待直到完成，通过传递此参数，仅对其进行验证和排队。
* `--no-legend`: 不打印图例，即带有提示的列标题和页脚。
* `--user`: 与主叫用户的服务管理员传递信息，而不是与系统的服务管理员联系。
* `--system`: 与系统的服务管理传递信息，这是默认值。
* `--failed`: 列出失败状态的单元，这等效于`--state=failed`。
* `--no-wall`: 停止，关闭电源，重新启动之前，不发送`wall message`。
* `--global`: 当与`enable`和`disable`一起使用时，对全局用户配置目录进行操作，从而全局地启用或禁用所有用户将来登录的单元文件。
* `--no-reload`: 当与`enable`和`disable`一起使用时，不要在执行更改后隐式地重新加载守护程序配置。
* `--no-ask-password`: 与`start`和相关命令一起使用时，禁用询问密码，后台服务可能需要输入密码或密码短语字符串，例如解锁系统硬盘或加密证书，除非指定了此选项并且命令是从终端调用的，否则`systemctl`将在终端上向用户查询必要的机密，使用此选项可关闭此行为，在这种情况下，必须通过其他方式例如图形密码代理提供密码，否则服务可能会失败，这还禁止查询用户以进行特权操作的身份验证。
* `--kill-who=`: 与`kill`一起使用时，选择要向哪个进程发送信号，必须是`main`、`control`或`all`中的一个，以选择是仅终止主进程、控制进程还是终止单元的所有进程，单元的主要过程是定义其生命周期的过程，一个单元的控制过程是由管理者调用以引起其状态变化的过程。例如由于服务单元的`ExecStartPre=`、`ExecStop=`或`ExecReload=`设置而启动的所有进程都是控制进程，注意每个单元一次只有一个控制过程，因为一次只执行一个状态更改，对于`type=forking`的服务，`ExecStart=manager`启动的初始进程是一个控制进程，而最终由该进程派生的进程则被视为单元的主进程(如果可以确定的话)，对于其他类型的服务单元，这是不同的，在这些服务单元中，`ExecStart=`的管理器分叉的进程始终是主进程本身，一个服务单元由零个或一个主进程、零个或一个控制进程以及任意数量的附加进程组成，然而并不是所有的单元类型都管理这些类型的流程，例如对于`mount`单元，定义了控制进程即`/bin/mount`和`/bin/umount`的调用，但没有定义主进程，如果省略，则默认为`all`。
* `-s, --signal=`: 与`kill`一起使用时，选择要发送到选定进程的信号，必须是众所周知的信号说明符之一，如`SIGTERM`、`SIGINT`或`SIGSTOP`，如果省略，则默认为`SIGTERM`。
* `-f, --force`: 与`enable`一起使用时，覆盖任何现有的冲突符号链接，当与`halt`、`poweroff`、`reboot`或`kexec`一起使用时，执行所选操作而不关闭所有单元，但是所有进程都将被强制终止，所有文件系统都以只读方式卸载或重新装载，因此这是一个要求立即重启的激烈但相对安全的选择，如果为这些操作指定了`--force`两次，它们将立即执行，而不会终止任何进程或卸载任何文件系统，警告在这些操作中指定`--force`两次可能会导致数据丢失。
* `--root=`: 当与`enable/disable/is enabled`和相关命令一起使用时，在查找单位文件时使用备用根路径。
* `--runtime`: 当与`enable`、`disable`和相关命令一起使用时，仅临时进行更改，以便在下次重新启动时丢失更改，这将产生这样的效果，更改不是在`/etc`的子目录中进行的，而是在`/run`中进行的，具有相同的即时效果，但是由于后者在重新启动时丢失，因此更改也会丢失，类似地，当与`set`属性一起使用时，仅临时进行更改，以便在下次重新启动时丢失更改。
* `--preset-mode=`: 取`full`默认、`enable only`、`disable only`之一，当与预设或预设所有命令一起使用时，控制是根据预设规则禁用和启用单元，还是仅启用或仅禁用单元。
* `-n, --lines=`: 与`status`一起使用时，控制要显示的日志行数，从最近的行开始计算，接受一个正整数参数，默认为`10`。
* `-o, --output=`: 与状态一起使用时，控制显示的日记账分录的格式，有关可用选项，请参见`journalctl`，默认为`short`。
* `--plain`: 与`list-dependencies`列表依赖项一起使用时，输出将打印为列表而不是树。
* `-H, --host=`: 远程执行操作，指定要连接的主机名，或用户名和主机名之间用`@`分隔，主机名的后缀可以是一个容器名，用`:`分隔，它直接连接到指定主机上的特定容器，这将使用`SSH`与远程`machinemanager`实例通信，容器名称可以用`machinectl-H HOST`枚举。
* `-M, --machine=`: 在本地容器上执行操作，指定要连接到的容器名称。
* `-h, --help`: 输出帮助信息。
* `--version`: 输出版本信息。

### Unit Commands
* `list-units [PATTERN...]`: 列出已知单位，受`-t`规定的限制，如果指定了一个或多个模式，则只显示与其中一个模式匹配的单元，这是默认`PATTERN`。
* `list-sockets [PATTERN...]`: 列出按侦听地址排序的套接字单元。如果指定了一个或多个模式，则仅显示与其中一个模式匹配的套接字单元。
* `list-timers [PATTERN...]`: 列出计时器单位，按它们下一次经过的时间排序，如果指定了一个或多个模式，则只显示与其中一个模式匹配的单元。
* `start PATTERN...`: 启动(激活)命令行上指定的一个或多个单元，请注意全局模式在当前已加载的单位列表上运行，通常不处于活动状态且未处于故障状态的单元不会被加载，并且不会通过任何模式进行匹配，另外在实例化单元的情况下，`systemd`通常在启动实例之前才知道实例名称，因此将`glob`模式与`start`一起使用具有有限的用途。
* `stop PATTERN...`: 停止(停用)命令行上指定的一个或多个单位。
* `reload PATTERN...`: 要求命令行上列出的所有单位重新加载其配置，请注意这将重新加载特定于服务的配置，而不是`systemd`的单元配置文件，如果希望`systemd`重新加载单元的配置文件，请使用`daemon reload`命令，例如对于`Apache`的示例，这将重新加载`Apache`的`httpd.conf`文件在`web`服务器中，而不是`apache.service`服务系统单位文件，此命令不应与守护进程重载或加载命令混淆。
* `restart PATTERN...`: 重新启动命令行中指定的一个或多个单元，如果这些单元还没有运行，它们将被启动。
* `try-restart PATTERN...`: 如果一个或多个单元正在运行，则重新启动命令行中指定的一个或多个单元，如果单元没有运行，则不会执行任何操作，注意，为了与`Red Hat init`脚本兼容，`condrestart`等价于这个命令。
* `reload-or-restart PATTERN...`: 如果单位支持的话则重新加载，否则，重新启动它们，如果这些单元还没有运行，它们将被启动。
* `reload-or-try-restart PATTERN...`: 如果单位支持的话则重新加载，否则，重新启动它们。如果这些单元没有运行，这将不起任何作用，注意，为了与`SysV init`脚本兼容，`force reload`相当于这个命令。
* `isolate NAME`: 启动命令行上指定的单元及其依赖项，并停止所有其他单元，这类似于在传统的`init`系统中更改运行级别，`isolate`命令将立即停止新单元中未启用的进程，可能包括当前使用的图形环境或终端，请注意，这只允许在启用`AllowIsolate=`的单元上使用，详情请参见`systemd.unit`。
* `kill PATTERN...`: 向设备的一个或多个进程发送信号，使用`--kill who=`选择要终止的进程，使用`--signal=`选择要发送的信号。
* `is-active PATTERN...`: 检查是否有任何指定的单元处于活动状态，即正在运行，如果至少有一个处于活动状态，则返回退出代码0，否则返回非零，除非指定`--quiet`，否则这也会将当前单位状态打印到标准输出。
* `is-failed PATTERN...`: 检查指定的单元是否处于失败状态，如果至少有一个失败，则返回退出代码`0`，否则返回非零，除非指定`--quiet`，否则这也会将当前单位状态打印到标准输出。
* `status [PATTERN...|PID...]]`: 显示关于一个或多个单元的简要运行时状态信息，然后是来自日志的最新日志数据，如果未指定单位，则显示系统状态，如果与`--all`组合，也显示所有单元的状态(受`-t`指定的限制)，如果传入`PID`，则显示该进程所属的单元信息，这个函数的目的是生成人类可读的输出，如果您正在寻找计算机可解析的输出，请使用`show`代替，默认情况下，这个函数只显示`10`行输出和椭圆线以适应终端窗口，这可以用`--lines`和`--full`来更改，此外`journalctl --unit=NAME`或`journalctl --user-unit=NAME`对消息使用了类似的过滤器，可能更方便。
* `show [PATTERN...|JOB...]`: 显示一个或多个单元、作业或管理器本身的属性，如果未指定参数，则将显示管理器的属性，默认情况下，将禁止空属性。用`--all`的来显示所有属性，要选择要显示的特定属性，请使用`--property=`，此命令用于需要计算机可分析输出时，如果要查找格式化的可读输出，请使用`status`。
* `cat PATTERN...`: 显示一个或多个单元的备份文件，打印单元的`fragment`和`drop-ins`(源文件)，每个文件前面都有一个注释，其中包含文件名。
* `set-property NAME ASSIGNMENT...`: 在支持的运行时设置指定的单元属性，这允许在运行时更改配置参数属性，例如资源控制设置，并非所有属性都可以在运行时更改，但许多资源控制设置`systemd.resource-control`可以，更改会立即应用，并存储在磁盘上以备将来引导，除非传递了`--runtime`，在这种情况下，设置只应用到下一次重新启动，属性赋值的语法与单位文件中赋值的语法非常相似。例如`systemctl set-property foobar.service CPUShares=777`，请注意，此命令允许同时更改多个属性，这比单独设置属性更好，与单元文件配置设置一样，将空列表指定给列表参数将重置列表。
* `help PATTERN...|PID...`: 显示一个或多个单元的手册页(如果可用)，如果给定`PID`，则会显示流程所属单元的手册页。
* `reset-failed [PATTERN...]`: 重置指定单元的`fail`状态，或者如果没有传递单元名称，则重置所有单元的状态，当一个单元以某种方式发生故障(即进程带非零错误代码退出、异常终止或超时)时，它将自动进入`fail`状态，并记录其退出代码和状态供管理员自查，直到使用此命令重新启动或重设服务。
* `list-dependencies [NAME]`: 显示指定单位的所需单位和所需单位，如果没有指定单位，目标单位会递归展开，当传递`--all`时，所有其他单元也会递归展开。

### Unit File Commands
* `list-unit-files [PATTERN...]`: 列出已安装的单元文件，如果指定了一个或多个模式，则只显示其文件名(只是路径的最后一个组件)与其中一个匹配的单元。
* `enable NAME...`: 根据命令行上的指定，启用一个或多个单位文件或单位文件实例，这将创建许多符号链接，这些符号链接编码在单元文件的`[Install]`部分，创建符号链接后，将重新加载`systemd`配置(以相当于`daemon reload`的方式)，以确保立即考虑更改，请注意，这不会同时启动任何启用的单元。如果需要，必须为装置调用单独的启动命令，另请注意，在启用实例的情况下，将在安装位置创建名为`same as instances`的符号链接，但是它们都指向相同的模板单元文件，此命令将打印执行的操作，这个输出可以通过传递`--quiet`来抑制，请注意，此操作仅为单元创建建议的符号链接，虽然此命令是操作单元配置目录的推荐方法，但管理员可以通过在目录中放置或删除符号链接来手动进行其他更改，这对于创建与建议的默认安装不同的配置特别有用，在这种情况下，管理员必须确保根据需要手动调用`daemon reload`，以确保将更改考虑在内。启动单元不应与启动(激活)单元混淆，就像启动命令所做的那样，启用和启动装置是正交的，装置可以不启动就启用，也可以不启动就启动，启用只需将单元挂接到各种建议的位置，例如，这样在引导时或插入特定类型的硬件时，单元就会自动启动。启动实际上会生成守护进程(对于服务单元)，或者绑定套接字(对于套接字单元)等等。根据是否指定了`--system`、`--user`、`--runtime`或`--global`，这将为系统、仅为调用用户、仅为系统的此引导、所有用户的所有将来登录或仅为此引导启用该单元，请注意，在最后一种情况下，不会重新加载`systemd`守护程序配置。
* `disable NAME...`: 禁用一个或多个单位，这将从单元配置目录中删除指向指定单元文件的所有符号链接，从而撤消`enable`所做的更改，但是请注意，这将删除指向单元文件的所有符号链接(即包括手动添加)，而不仅仅是那些由`enable`实际创建的符号链接，在完成单元的禁用之后，此调用隐式地重新加载`systemd`守护程序配置，请注意，此命令不会隐式停止正在禁用的单元，如果需要这样做，随后应执行一个额外的停止命令，此命令将打印执行的操作，这个输出可以通过传递`--quiet`来抑制，这个命令以与`enable`类似的方式接受`--system`、`--user`、`--runtime`和`--global`。
* `is-enabled NAME...`: 检查是否启用了任何指定的单位文件(如启用)，如果至少启用了一个，则返回退出代码`0`，否则返回非零，打印当前启用状态`enabled`、`enabled-runtime`、`linked`、`linked-runtime`、`masked`、`masked-runtime`、`static`、`disabled`，要禁止此输出，请使用`--quiet`。
* `reenable NAME...`: 按命令行上的指定，重新启用一个或多个单位文件，这是`disable`和`enable`的组合，用于将启用单元的符号链接重置为单元文件`[Install]`部分中配置的默认值。
* `preset NAME...`: 将命令行中指定的一个或多个单位文件重置为预设策略文件中配置的默认值，这与`disable`或`enable`具有相同的效果，具体取决于单位在预设文件中的列出方式。使用`--preset-mode=`控制是启用和禁用单元，还是仅启用或仅禁用单元，有关预设策略格式的详细信息，请参阅`systemd.preset`，有关预设概念的更多信息，请参阅`Presetm`文档。
* `preset-all`: 将所有已安装的单元文件重置为预设策略文件中配置的默认值，使用`--preset mode=`控制是启用和禁用单元，还是仅启用或仅禁用单元。
* `mask NAME...`: 根据命令行上的指定，屏蔽一个或多个单位文件，这将把这些单元链接到`/dev/null`，使它们无法启动，这是一个更强大的版本的禁用，因为它禁止各种激活的单位，包括手动激活，小心使用此选项，这允许`--runtime`选项在下次重新启动系统之前临时屏蔽。
* `link FILENAME...`: 将不在单位文件搜索路径中的单位文件链接到单位文件搜索路径，这需要到单位文件的绝对路径，使用`disable`可以撤消此操作的效果，此命令的效果是，单位文件可用于`start`和其他命令，尽管它没有直接安装在单位搜索路径中。
* `get-default`: 获取通过`default.target`链接指定的默认目标。
* `set-default NAME`: 设置默认目标启动，命令将`default.target`链接到给定的单位。

### Machine Commands
* `list-machines [PATTERN...]`: 列出主机和所有运行的本地容器及其状态，如果指定了一个或多个模式，则只显示与其中一个模式匹配的容器。

### Job Commands
* `list-jobs [PATTERN...]`: 列出正在进行的作业，如果指定了一个或多个模式，则仅显示与其中一个模式匹配的单元的作业。
* `cancel JOB...`: 取消命令行上由数字作业ID指定的一个或多个作业，如果未指定作业`ID`，请取消所有挂起的作业。

### Snapshot Commands
* `snapshot [NAME]`: 创建快照，如果指定了快照名称，则新快照将以该名称命名，如果未指定任何名称，则生成自动快照名称，在这两种情况下，所使用的快照名称都打印到标准输出，除非指定了`--quiet`，快照是指`systemd manager`的已保存状态，它本身作为一个单元来实现，这个单元是用这个命令动态生成的，并且依赖于当时所有活动的单元，稍后，用户可以使用快照单元上的隔离命令返回到该状态，快照仅用于保存和还原正在运行或已停止的单元，它们不保存`/`还原任何其他状态，快照是动态的，在重新启动时丢失。
* `delete PATTERN...`: 删除之前用`snapshot`创建的快照。

### Environment Commands
* `show-environment`: 转储`systemd manager`环境块，环境块将以适合源代码到`shell`脚本的直接形式转储，此环境块将传递给管理器生成的所有进程。
* `set-environment VARIABLE=VALUE...`: 按照命令行上的指定，设置一个或多个`systemd manager`环境变量。
* `unset-environment VARIABLE...`: 取消设置一个或多个`systemd manager`环境变量，如果只指定了变量名，则无论其值如何，都将删除该变量名，如果指定了一个变量和一个值，则仅当该变量具有指定的值时才会删除该变量。
* `import-environment VARIABLE...`: 将客户机上设置的所有、一个或多个环境变量导入`systemd manager`环境块，如果没有传递任何参数，则导入整个环境块，否则，应传递一个或多个环境变量名的列表，然后将其客户端值导入到管理器的环境块中。

### Manager Lifecycle Commands
* `daemon-reload`: 重新加载`systemd manager`配置，这将重新加载所有单元文件并重新创建整个依赖关系树，在重新加载守护进程时，`systemd`代表用户配置侦听的所有套接字都将保持可访问状态，此命令不应与`load`或`reload`命令混淆。
* `daemon-reexec`: 重新执行`systemd manager`，这将序列化管理器状态，重新执行进程并再次反序列化状态，除了调试和包升级之外，这个命令没有什么用处，有时，作为一个重载守护进程，它可能会有所帮助，当守护进程被重新执行时，代表用户配置侦听的所有套接字`systemd`都将保持可访问状态。

### System Commands
* `is-system-running`: 检查系统是否正在运行，当系统完全启动并运行时，返回`success`，这意味着不处于启动、关闭或维护模式，否则返回失败，此外，当前状态以短字符串形式打印到标准输出，使用`--quiet`可以抑制此状态字符串的输出。
* `default`: 进入默认模式，这主要等效于隔离`default.target`。
* `rescue`: 进入救援模式，这主要相当于隔离`rescue.target`，但也会向所有用户打印墙消息。
* `emergency`: 进入紧急模式，这在大多数情况下等效于隔离`Emergency.target`，但也会向所有用户显示隔离墙消息。
* `halt`: 关闭并停止系统，这主要等效于启动`halt.target --irreversible`，但还会向所有用户显示一条墙消息，如果与`--force`结合使用，则将跳过所有正在运行的服务的关闭，但是将终止所有进程，并且将所有文件系统卸载或以只读方式装载，然后立即停止系统，如果两次指定`--force`，将立即执行该操作，而不会终止任何进程或卸载任何文件系统，这可能会导致数据丢失。
* `poweroff`: 关闭并关闭系统电源，这主要等效于启动`poweroff.target --irreversible`，但还会向所有用户显示一条墙消息，如果与`--force`结合使用，将跳过所有正在运行的服务的关闭，但是将终止所有进程，并且将所有文件系统卸载或以只读方式装载，然后立即关闭电源，如果两次指定`--force`，将立即执行该操作，而不会终止任何进程或卸载任何文件系统，这可能会导致数据丢失。
* `reboot [arg]`: 关闭并重新启动系统，这主要等同于启动`reboot.target --irreversible`，但还会向所有用户显示一条墙消息，如果与`--force`结合使用，将跳过所有正在运行的服务的关闭，但是将终止所有进程，并且将所有文件系统卸载或以只读方式装载，然后立即重新引导，如果两次指定`--force`，将立即执行该操作，而不会终止任何进程或卸载任何文件系统，这可能会导致数据丢失，如果给出了可选参数`arg`，它将作为可选参数传递给`reboot`系统调用，该值是体系结构和固件特定的，例如，`recovery`可用于触发系统恢复，而`fota`可用于触发`firmware over the air`更新。
* `kexec`: 通过`kexec`关闭并重新启动系统，这主要等效于启动`kexec.target --irreversible`，但还会向所有用户显示一条墙消息，如果与`--force`结合使用，则将跳过所有正在运行的服务的关闭，但是将终止所有进程，并且将所有文件系统卸载或以只读方式装载，然后立即重新引导。
* `exit`: 要求系统管理员退出，仅用户服务管理器支持此功能，即与`--user`选项结合使用，否则将失败。
* `suspend`: 挂起系统，这将触发特殊的`suspend.target`目标的激活。
* `hibernate`: 休眠系统，这将触发特殊的`hibernate.target`目标的激活。
* `hybrid-sleep`: 休眠并挂起系统。这将触发特殊的`hybrid-sleep.target`目标的激活。
* `switch-root ROOT [INIT]`: 切换到另一个根目录，并在其下执行新的系统管理器进程，这旨在用于初始`RAM`磁盘`initrd`，并将从`initrd`的系统管理器进程，也称为`init`进程，过渡到主系统管理器进程，该调用有两个参数，要成为新根目录的目录，以及要在其下以`PID 1`执行的新系统管理器二进制文件的路径，如果省略后者或为空字符串，则将自动生成`systemd`二进制文件搜索并用作`init`，如果省略了系统管理器路径或等于空字符串，则将`initrd`的系统管理器进程的状态传递给主系统管理器，这允许稍后对`initrd`引导中涉及的服务的状态进行自查。

## UNIT文件配置

### UNIT文件类型
`Unit`文件统一了过去各种不同的系统资源配置格式，例如服务的启动、停止、定时任务、设备自动挂载、网络配置、设备配置、虚拟内存配置等，而`Systemd`通过不同的通过文件的后缀名来区分这些配置文件，`.service`文件便是其中最常用的一种，下面是`Systemd`所支持的`12`种`Unit`文件类型。
* `.automount`: 用于控制自动挂载文件系统，自动挂载即当某一目录被访问时系统自动挂载该目录，这类`unit`取代了传统`Linux`系统的`autofs`相应功能。
* `.device`: 对应`/dev`目录下设备，主要用于定义设备之间的依赖关系。
* `.mount`: 定义系统结构层次中的一个挂载点，可以替代过去的`/etc/fstab`配置文件。
* `.path`: 用于监控指定目录变化，并触发其他`unit`运行。
* `.scope`: 这类`unit`文件不是用户创建的，而是`Systemd`运行时自己产生的，描述一些系统服务的分组信息。
* `.service`: 封装守护进程的启动、停止、重启和重载等操作，是最常见的一种`unit`类型。
* `.slice`: 用于描述`cgroup`的一些信息，极少使用到，一般用户就忽略它吧。
* `.snapshot`: 这种`unit`其实是`systemctl snapshot`命令创建的一个描述`Systemd unit`运行状态的快照。
* `.socket`: 监控系统或互联网中的`socket`消息，用于实现基于网络数据自动触发服务启动。
* `.swap`: 定义一个用于做虚拟内存的交换分区。
* `.target`: 用于对`unit`进行逻辑分组，引导其他`unit`的执行，它替代了`SysV`中运行级别的作用，并提供更灵活的基于特定设备事件的启动方式，例如`multi-user.target`相当于过去的运行级别`5`，而`bluetooth.target`在有蓝牙设备接入时就会被触发。
* `.timer`: 封装由`system`的里面由时间触发的动作, 替代了`crontab`的功能。

### 配置目录
`Unit`文件按照`Systemd`约定，应该被放置在指定的`3`个系统目录之一，这`3`个目录是有优先级的，在下面指定的位置优先级依次递减，因此在几个目录中有同名文件的时候，只有优先级最高的目录里的那个会被使用。
* `/etc/systemd/system`: 系统或用户提供的配置文件。
* `/run/systemd/system`: 软件运行时生成的配置文件。
* `/usr/lib/systemd/system`: 系统或第三方软件安装时添加的配置文件。

### Service文件字段
通常我们只需要配置`.service`文件即可，`.service`分为三个字符。

#### Unit段
这些配置中，除了`Description`外，都能够被添加多次，例如`After`参数可以使用空格分隔指定所有值，也可以使用多个`After`参数，在每行参数中指定一个值。
* `Description`: 一段描述这个`Unit`文件的文字，通常只是简短的一句话。
* `Documentation`: 指定服务的文档，可以是一个或多个文档的`URL`路径。
* `Requires`: 依赖的其他`Unit`列表，列在其中的`Unit`模块会在这个服务启动的同时被启动，并且如果其中有任意一个服务启动失败，这个服务也会被终止。
* `Wants`: 与`Requires`相似，但只是在被配置的这个`Unit`启动时，触发启动列出的每个 `Unit`模块，而不去考虑这些模块启动是否成功。
* `After`: 与`Requires`相似，但会在后面列出的所有模块全部启动完成以后，才会启动当前的服务。
* `Before`: 与`After`相反，在启动指定的任一个模块之前，都会首先确保当前服务已经运行。
* `BindsTo`: 与`Requires`相似，但是一种更强的关联，启动这个服务时会同时启动列出的所有模块，当有模块启动失败时终止当前服务，反之，只要列出的模块全部启动以后，也会自动启动当前服务。并且这些模块中有任意一个出现意外结束或重启，这个服务会跟着终止或重启。
* `PartOf`: 这是一个`BindTo`作用的子集，仅在列出的任何模块失败或重启时，终止或重启当前服务，而不会随列出模块的启动而启动。
* `OnFailure`: 当这个模块启动失败时，就自动启动列出的每个模块。
* `Conflicts`: 与这个模块有冲突的模块，如果列出模块中有已经在运行的，这个服务就不能启动，反之亦然。

#### Install段
这个段中的配置与`Unit`有几分相似，但是这部分配置需要通过`systemctl enable`命令来激活，并且可以通过`systemctl disable`命令禁用，另外这部分配置的目标模块通常是特定启动级别的`.target`文件，用来使得服务在系统启动时自动运行。
* `WantedBy`: 和前面的`Wants`作用相似，只是后面列出的不是服务所依赖的模块，而是依赖当前服务的模块。
* `RequiredBy`: 和前面的`Requires`作用相似，同样后面列出的不是服务所依赖的模块，而是依赖当前服务的模块。
* `Also`: 当这个服务被`enable/disable`时，将自动`enable/disable`后面列出的每个模块。

#### Service段
这个段是`.service`文件独有的，也是对于服务配置最重要的部分，这部分的配置选项非常多，主要分为服务生命周期控制和服务上下文配置两个方面，下面是一些常用的配置，另外还有一些限制特定服务可用的系统资源量，例如`CPU`、程序堆栈，文件句柄数量，子进程数量等等，可参考`Linux`文档资源配额。
* `Type`: 服务的类型，常用的有`simple`和`forking`，默认的`simple`类型可以适应于绝大多数的场景，因此一般可以忽略这个参数的配置，而如果服务程序启动后会通过`fork`系统调用创建子进程，然后关闭应用程序本身进程的情况，则应该将`Type`的值设置为`forking`，否则`systemd`将不会跟踪子进程的行为，而认为服务已经退出。
* `RemainAfterExit`: 值为`true`或`false`，也可以写`yes`或`no`，默认为`false`，当配置值为`true`时，`systemd`只会负责启动服务进程，之后即便服务进程退出了，`systemd`仍然会认为这个服务是在运行中的，这个配置主要是提供给一些并非常驻内存，而是启动注册后立即退出然后等待消息按需启动的特殊类型服务使用。
* `ExecStart`: 这个参数是几乎每个`.service`文件都会有的，指定服务启动的主要命令，在每个配置文件中只能使用一次。
* `ExecStartPre`: 指定在启动执行`ExecStart`的命令前的准备工作，可以有多个，所有命令会按照文件中书写的顺序依次被执行。
* `ExecStartPost`: 指定在启动执行`ExecStart`的命令后的收尾工作，也可以有多个。
* `TimeoutStartSec`: 启动服务时的等待的秒数，如果超过这个时间服务仍然没有执行完所有的启动命令，则`systemd`会认为服务自动失败，这一配置对于使用`Docker`容器托管的应用可能十分重要，由于`Docker`第一次运行时可以能会需要从网络下载服务的镜像文件，因此造成比较严重的延时，容易被`systemd`误判为启动失败而杀死，通常对于这种服务，需要将`TimeoutStartSec`的值指定为`0`，从而关闭超时检测。
* `ExecStop`: 停止服务所需要执行的主要命令。
* `ExecStopPost`: 指定在`ExecStop`命令执行后的收尾工作，也可以有多个。
* `TimeoutStopSec`: 停止服务时的等待的秒数，如果超过这个时间服务仍然没有停止，`systemd`会使用`SIGKILL`信号强行杀死服务的进程。
* `Restart`: 这个值用于指定在什么情况下需要重启服务进程，常用的值有`no`、`on-success`、`on-failure`、`on-abnormal`、`on-abort`和`always`，默认值为`no`，即不会自动重启服务。
* `RestartSec`: 如果服务需要被重启，这个参数的值为服务被重启前的等待秒数。
* `ExecReload`: 重新加载服务所需执行的主要命令。
* `Environment`: 为服务添加环境变量。
* `EnvironmentFile`: 指定加载一个包含服务所需的环境变量列表的文件，文件中的每一行都是一个环境变量的定义。
* `Nice`: 服务的进程优先级，值越小优先级越高，默认为`0`，`-20`为最高优先级，`19`为最低优先级。
* `WorkingDirectory`: 指定服务的工作目录。
* `RootDirectory`: 指定服务进程的根目录`/`，如果配置了这个参数后，服务将无法访问指定目录以外的任何文件。
* `User`: 指定运行服务的用户，会影响服务对本地文件系统的读写执行权限。
* `Group`: 指定运行服务的用户组，会影响服务对本地文件系统的访问权限。
* `StartLimitIntervalSec`: 属于设置单元的启动频率限制，用于设置时长，默认情况下，一个单元在`10`秒内最多允许启动`5`次。
* `StartLimitBurst`: 属于设置单元的启动频率限制，用于设置在一段给定的时长内，最多允许启动多少次，默认情况下，一个单元在`10`秒内最多允许启动`5`次。

#### 文件示例

```
[Unit]
Description=OpenBSD Secure Shell server
After=network.target auditd.service
ConditionPathExists=!/etc/ssh/sshd_not_to_be_run

[Service]
EnvironmentFile=-/etc/default/ssh
ExecStartPre=/usr/sbin/sshd -t
ExecStart=/usr/sbin/sshd -D $SSHD_OPTS
ExecReload=/usr/sbin/sshd -t
ExecReload=/bin/kill -HUP $MAINPID
KillMode=process
Restart=on-failure
RestartPreventExitStatus=255
Type=notify
RuntimeDirectory=sshd
RuntimeDirectoryMode=0755

[Install]
WantedBy=multi-user.target
Alias=sshd.service
```


## 示例

开机运行服务。

```shell
systemctl enable nginx.service
```

查询服务是否开机启动。

```shell
systemctl is-enabled nginx.service
```

取消开机运行。

```shell
systemctl disable nginx.service
```

启动服务。

```shell
systemctl start nginx.service
```

停止服务。

```shell
systemctl stop nginx.service
```

重启服务。

```shell
systemctl restart nginx.service
```

重新加载服务配置文件，修改配置文件后需要首先执行`systemctl daemon-reload`。

```shell
systemctl reload nginx.service
```

查询服务运行状态。

```shell
systemctl status nginx.service
```

显示启动失败的服务。

```shell
systemctl --failed
systemctl list-units --state failed
```

重置单元的启动频率计数器。
```shell
systemctl reset-failed
```


重新加载所有被修改过的服务配置，否则配置不会生效，当然实际上该命令还会完成很多事情，例如重新生成依赖树。

```shell
systemctl daemon-reload
```

输出所有单元。

```shell
systemctl list-units
```

列出所有单元状态概览。

```shell
systemctl status
```

查看已激活的服务。

```shell
systemctl list-units -t service
```

查看所有已安装服务。

```shell
systemctl list-unit-files
```

检查`nginx`服务的所有配置细节。

```shell
systemctl show nginx.service
```

获取`nginx`服务的依赖性列表。

```shell
systemctl list-dependencies nginx.service
```

查看环境变量。

```shell
systemctl show-environment
```

重启系统。

```shell
systemctl reboot
```

关闭系统。

```shell
systemctl poweroff
```

`CPU`停止工作。

```shell
systemctl halt
```

暂停系统。

```shell
systemctl suspend
```

让系统进入冬眠状态。

```shell
systemctl hibernate
```

让系统进入交互式休眠状态。

```shell
sudo systemctl hybrid-sleep
```

启动进入救援状态，即单用户状态。

```shell
systemctl rescue
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.cnblogs.com/tsdxdx/p/7288490.html
https://www.cnblogs.com/chjbbs/p/6288592.html
https://www.geeksforgeeks.org/systemctl-in-unix/
http://www.jinbuguo.com/systemd/systemd.unit.html
https://blog.csdn.net/m0_38023255/article/details/78757655
https://www.commandlinux.com/man-page/man1/systemctl.1.html
http://www.ruanyifeng.com/blog/2016/03/systemd-tutorial-commands.html
```