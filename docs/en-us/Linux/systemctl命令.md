# systemctl Command
`Systemd` is a command group that involves all aspects of system management, and `systemctl` is the main command of `Systemd` used for managing the system.

## Description
In the past, `Linux` booting has always used the `init` process, which has two disadvantages. First, the startup time is long because the `init` process starts serially, and only when the previous process is started, will the next process start. Second, the startup scripts are complex. The `init` process merely executes the startup scripts without caring about other things, so the scripts need to handle various situations on their own, often making the scripts very long.  
`Systemd` was born to solve these problems. Its design goal is to provide a complete solution for the startup and management of the system. According to `Linux` conventions, the letter `d` is an abbreviation for the daemon process, so the name `Systemd` means that it is designed to guard the entire system. With the use of `Systemd`, there is no need to use `init` anymore. `Systemd` replaces `initd` and becomes the first process of the system with a `PID` equal to `1`, and all other processes are its child processes. The advantage of `Systemd` is its powerful functionality and convenient use, but its disadvantage is its vast and complex structure. In fact, there are still many people opposed to using `Systemd` because it is too complex, tightly coupled with other parts of the operating system, and violates the "keep simple, keep stupid" Unix philosophy.  
## Syntax
```shell
systemctl [OPTIONS...] {COMMAND} ...
```
## Parameters
### OPTIONS

```markdown
* `-t, --type=`: The parameter should be a comma-separated list of unit types, such as `service` and `socket`. If one of the parameters is a unit type, only units of that type will be listed. If `help` is one of the parameters, a list of allowable values will be printed, and the program will exit.
* `--state=`: The parameter should be a comma-separated list of unit load, substate, or activity state. When listing units, only units in the specified state will be displayed.
* `-p, --property=`: When using the `show` command to display `unit/job/manager` properties, the display will be limited to the properties specified by the parameter. If not specified, all set properties will be displayed. The parameter should be a comma-separated list of property names, such as `MainPID`. If specified multiple times, all properties with the specified names will be displayed.
* `-a, --all`: When listing units, all loaded units will be displayed, regardless of their status, including inactive units. When displaying `unit/job/manager` properties, all properties will be displayed, regardless of whether they are set. Use the `list-unit-files` command to list all units installed on the system.
* `-r, --recursive`: When listing units, also display the units of local containers. The units of local containers will be prefixed with the container name and separated by a single colon `:`.
* `--reverse`: Display reverse dependencies between units with the listed dependencies, specifically for units with `Wants=` or `Requires=` type on the given unit.
* `--after`: Using `list-dependencies`, list the units sorted before the specified unit. In other words, list the units listed in the `After=` directive of the specified unit, the units with the specified unit in the `Before=` directive, or implicit dependencies of the specified unit.
* `--before`: Using `list-dependencies`, list the units sorted after the specified unit. In other words, list the units with the specified unit in the `Before=` directive, those with the specified unit in the `After=` directive, or that otherwise depend on the specified unit.
* `-l, --full`: Don't abbreviate states, meaning that the output of `list-units`, `list-jobs`, `list-timers` will list the unit names, `process tree entries` process tree entries, `journal output` log outputs, and `truncate unit descriptions`.
* `--show-types`: When displaying sockets, display the socket types.
* `--job-mode=`: When queuing a new job, this option controls how queued jobs are handled. It takes one of `fail`, `replace`, `replace-irreversibly`, `isolate`, `ignore dependencies`, `ignore requirements`, or `flush` as its value, with the default being `replace`, unless the `isolate` command, representing the isolated job mode, is used. When `fail` is specified and the requested operation conflicts with a pending job, more specifically causing a pending start job to be reversed into a stop job and vice versa, the operation fails. When `replace` is specified as the default value, any conflicting pending jobs will be replaced as needed. When `replace-irreversibly` is specified, it operates like `replace`, but also marks the new job as irreversible, which prevents future conflicting transactions from replacing these jobs, even if the irreversible jobs are still pending, they can still be canceled using the `cancel` command. `isolate` is only effective for start operations, and causes all other units to stop when starting the specified unit. When the isolate command is used, this mode is always used. `flush` will cancel all queued jobs when queuing a new job. If `ignore-dependencies` is specified, all unit dependencies for this new job will be ignored, and the operation will be executed immediately, and if it is successful, it won't introduce any required units for the passed unit and won’t follow any ordering dependencies. This is mainly an administrator's debugging and rescue tool and should not be used by applications. `ignore-requirements` is similar to `ignore-dependencies`, but it only ignores the requirement dependencies, and the ordering dependencies will still be met.
* `-i, --ignore-inhibitors`: When the system is shutting down or requesting sleep status, ignore inhibitor locks. Applications can establish inhibitor locks to prevent certain critical operations such as `CD` recording from being interrupted by the system shutdown or sleep state. These locks can be used by any user, and privileged users can override these locks. If any locks are being used, shutdown and sleep requests will generally fail whether or not they have privileges, and a list of active locks will be printed, but if `--ignore inhibitors` is specified, the locks will be ignored and not printed, and the operation will be attempted regardless, which may require additional permissions.
* `-q, --quiet`: Suppress the output of `snapshot`, `is-active`, `is-failed`, `is-enabled`, `is-system-running`, `enable`, and `disable` to standard output.
* `--no-block`: Do not synchronously wait for the requested operation to complete. If not specified, the job will be validated, queued, and `systemctl` will wait until it completes. By passing this parameter, only validation and queuing will be done.
* `--no-legend`: Do not print the legend, i.e., column headings and footers with prompts.
* `--user`: Pass information to the service manager of the calling user, as opposed to the system's service manager.
* `--system`: Pass information to the system's service manager, which is the default value.
* `--failed`: List units in a failed state, which is equivalent to `--state=failed`.
* `--no-wall`: Before stopping, powering off, or rebooting, do not send a wall message.
* `--global`: When used with `enable` and `disable`, operate on the global user configuration directory, thus globally enabling or disabling unit files for all future logins by users.
* `--no-reload`: When used with `enable` and `disable`, do not implicitly reload the daemon's configuration after making the changes.
* `--no-ask-password`: When used with `start` and related commands, disable password prompt. Background services may require entry of a password or passphrase string, such as unlocking a system hard disk or encrypted certificate. Unless this option is specified and the command is invoked from the terminal, `systemctl` will query the necessary credentials from the user on the terminal. Using this option will shut down this behavior. In this case, the password must be provided through other means, for example, a graphical password agent, otherwise the service may fail. This also disables asking the user to authenticate for privileged operations.
* `--kill-who=`: When used with `kill`, select which process to send the signal to, must be one of `main`, `control`, or `all`, to choose to terminate only the main process, control process, or all processes of the unit. The main process of a unit is the process that defines its lifecycle. A unit's control process are the processes started by its manager to effect a state change. For example, all processes started by settings like `ExecStartPre=`, `ExecStop=`, or `ExecReload=` of a service unit are control processes. Note that each unit has at most one control process at a time, as only one state change can be executed at a time. For a `type=forking` service, the initial process started by `ExecStart=manager` is a control process, and the subsequent processes derived from that process are considered the main process of the unit, if determinable. For other types of service units, this is different. In these service units, the manager forking off from `ExecStart=` is always the main process itself. A service unit consists of zero or one main processes, zero or one control processes, and any number of additional processes, but not all unit types manage these types of processes, for example, for a `mount` unit, control processes are defined; specifically calls to `/bin/mount` and `/bin/umount`, but a main process is not defined. If omitted, it defaults to `all`.
* `-s, --signal=`: When used with `kill`, choose the signal to send to the selected process, must be one of the well-known signal specifiers, such as `SIGTERM`, `SIGINT`, or `SIGSTOP`, if omitted, it defaults to `SIGTERM`.
* `-f, --force`: When used with `enable`, override any existing conflicting symbolic links. When used with `halt`, `poweroff`, `reboot`, or `kexec`, perform the selected operations without shutting down all units, but all processes will be forcibly terminated, and all file systems will be unmounted or remounted read-only, so this is a forceful but relatively safe option to request an immediate restart. If specified twice for these operations, they will be executed immediately without terminating any processes or unmounting any file systems. Note that specifying `--force` twice in these operations may lead to data loss.
* `--root=`: When used with `enable/disable/is enabled` and related commands, use an alternate root path when looking for unit files.
* `--runtime`: When used with `enable`, `disable`, and related commands, make the changes temporarily so that they are lost on the next restart. This has the effect that changes are not made in a subdirectory of `etc`, but in `run`, with the same immediate effect, but because the latter is lost on restart, the changes are also lost. Similarly, when used with `set` property, make the changes temporarily so that they are lost on the next restart.
* `--preset-mode=`: Take one of `full` default, `enable only`, `disable only` as the value. When used with the `preset` or `preset-all` commands, it controls whether the units are disabled and enabled according to the preset rules or only enabled or only disabled the units.
* `-n, --lines=`: When used with `status`, control the number of log lines to be displayed, counting from the most recent line, accept a positive integer parameter, with a default of `10`.
* `-o, --output=`: When used with `status`, control the format of the displayed journal entries, for available options, refer to `journalctl`, default is `short`.
* `--plain`: When used with `list-dependencies`, print the output as a list rather than a tree.
* `-H, --host=`: Perform remote operations, specify the hostname to connect to, or username and hostname separated by `@`, the suffix of the hostname can be a container name, separated by `:`, it connects directly to a specific container on the specified host, this will communicate with the remote `machinemanager` instance using `SSH`, and enumerate the container names with `machinectl-H HOST`.
* `-M, --machine=`: Perform operations on the local container, specify the container name to connect to.
* `-h, --help`: Print help information.
* `--version`: Print version information.
```

### Commands for Managing Units

* `list-units [PATTERN...]`: Lists known units, restricted by `-t` if specified. If one or more patterns are specified, only units matching one of the patterns will be displayed, which is the default `PATTERN`.
* `list-sockets [PATTERN...]`: Lists socket units sorted by listening addresses. If one or more patterns are specified, only socket units matching one of the patterns will be displayed.
* `list-timers [PATTERN...]`: Lists timer units ordered by their next elapse time. If one or more patterns are specified, only units matching one of the patterns will be displayed.
* `start PATTERN...`: Activates one or more units specified on the command line. Note that global patterns run on the currently loaded unit list, typically units not active or failed to start won't be loaded and won't match any pattern. Also, when instantiating units, `systemd` usually won't know the instance names until right before starting them, so using glob patterns with `start` together has limited use.
* `stop PATTERN...`: Deactivates one or more units specified on the command line.
* `reload PATTERN...`: Requests all units listed on the command line to reload their configurations. Note that this will reload service-specific configurations, not the `systemd` unit configuration files. To reload `systemd` unit configuration files, use the `daemon reload` command. For example, for `Apache` this would reload the `httpd.conf` file within the web server, not the `apache.service` service system unit file. This command should not be confused with reloading or loading daemon commands.
* `restart PATTERN...`: Restarts one or more units specified on the command line. If these units are not running, they will be started.
* `try-restart PATTERN...`: Restarts one or more units specified on the command line if they are running. If the units are not running, no action will be taken. Note that for compatibility with `Red Hat init` scripts, `condrestart` is equivalent to this command.
* `reload-or-restart PATTERN...`: Reloads the units if supported, otherwise, restarts them. If these units are not running, they will be started.
* `reload-or-try-restart PATTERN...`: Reloads the units if supported, otherwise, restarts them. If these units are not running, this will have no effect. Note that for compatibility with `SysV init` scripts, `force reload` is equivalent to this command.
* `isolate NAME`: Starts the specified unit on the command line and its dependencies, and stops all other units. This is similar to changing run levels in traditional `init` systems. The `isolate` command will immediately stop processes not enabled in the new unit, which may include the current graphical environment or terminal. Note that this is only allowed on units with `AllowIsolate=` enabled, see `systemd.unit` for details.
* `kill PATTERN...`: Sends a signal to one or more processes of a unit, using `--kill who=` to select which processes to terminate, and `--signal=` to select which signal to send.
* `is-active PATTERN...`: Checks if any specified unit is active, that is, running. If at least one is active, it returns exit code 0, otherwise it returns non-zero, unless `--quiet` is specified. It will also print the current unit state to the standard output.
* `is-failed PATTERN...`: Checks if the specified unit is in a failed state. If at least one has failed, it returns exit code `0`, otherwise it returns non-zero, unless `--quiet` is specified. It will also print the current unit state to the standard output.
* `status [PATTERN...|PID...]]`: Displays brief run-time status information about one or more units, followed by the latest log data from the log. If no unit is specified, it displays the system status. When combined with `--all`, it also shows the status of all units (restricted by `-t`). If a `PID` is passed, it will show the unit information for that process. The purpose of this function is to generate human-readable output. If you are looking for machine-parsable output, use `show` instead. By default, this function displays `10` lines of output and ellipses to fit within the terminal window, which can be changed with `--lines` and `--full`. Furthermore, `journalctl --unit=NAME` or `journalctl --user-unit=NAME` uses similar filters for messages, which may be more convenient.
* `show [PATTERN...|JOB...]`: Displays the properties of one or more units, jobs, or the manager itself. If no parameter is specified, it will display the properties of the manager. By default, empty properties are omitted. Use `--all` to display all properties. Use `--property=` to select specific properties to display. This command is useful for machine-parsable output. For formatted, human-readable output, use `status`.
* `cat PATTERN...`: Displays the backup files of one or more units, printing the `fragment` and `drop-ins` (source files), with a comment preceding each file name.
* `set-property NAME ASSIGNMENT...`: Sets specified unit properties at runtime where supported. This allows changing configuration parameters and attributes at runtime, such as resource control settings. Not all properties can be changed at runtime, but many resource control settings from `systemd.resource-control` can. Changes take effect immediately and are stored on disk for future boots, unless `--runtime` is passed, in which case the setting applies only until the next restart. The syntax for property assignment is very similar to the assignment in unit files. For example, `systemctl set-property foobar.service CPUShares=777`. Note that this command allows changing multiple properties simultaneously, which is preferable to setting properties individually. Just like unit file configurations, specifying an empty list for list parameters will reset the list.
* `help PATTERN...|PID...`: Displays the manual pages for one or more units if available. If a `PID` is given, it will show the manual page for the unit the process belongs to.
* `reset-failed [PATTERN...]`: Resets the `fail` state of the specified units, or if no unit names are passed, resets the status of all units. When a unit fails in some way (i.e., a process exits with a non-zero exit code, terminates abnormally, or times out), it automatically enters a `fail` state and records its exit code and state for administrative review, until this command restarts or resets the service.
* `list-dependencies [NAME]`: Displays the required units and the required-by units of the specified unit. If no unit is specified, the target unit will be recursively expanded. When `--all` is passed, all other units will also be recursively expanded.

### Unit File Commands
* `list-unit-files [PATTERN...]`: Lists the installed unit files. If one or more patterns are specified, it only displays the file names (just the last component of the path) that match one of the patterns.
* `enable NAME...`: Enables one or more unit files or unit file instances based on the specified names on the command line. This will create many symbolic links encoded in the `[Install]` section of the unit file. After creating the symbolic links, the `systemd` configuration is reloaded (akin to `daemon reload`) to ensure immediate consideration of the changes. Please note that this does not start any enabled units simultaneously. If needed, a separate start command must be invoked for the unit. Also, note that in the case of enabling instances, a symbolic link named `same as instances` is created in the installation location, but they all point to the same template unit file. This command will print the executed operation, and this output can be suppressed by passing `--quiet`. Please note that this operation only suggests creating symbolic links for the unit. Although this command is the recommended way to operate on the unit's configuration directory, the administrator can manually make other changes by placing or removing symbolic links in the directory. This is particularly useful for creating a configuration different from the suggested default installation. In such cases, the administrator must ensure to manually invoke `daemon reload` as needed to ensure the changes are considered. Starting a unit should not be confused with enabling (activating) a unit. Just like the start command does, enabling and starting units are orthogonal. A unit can be enabled without being started, and a unit can be started without being enabled. Enabling simply hooks up the unit in various suggested locations, so the unit will start automatically on boot or insertion of specific types of hardware. Starting actually generates a daemon process (for service units) or binds a socket (for socket units), and so on. Depending on whether `--system`, `--user`, `--runtime`, or `--global` is specified, it will enable the unit for system, for the calling user only, for this boot only, for all future logins of all users, or for this boot only. Please note that in the last case, the `systemd` daemon configuration is not reloaded.

* `disable NAME...`: Disables one or more units, which removes all symbolic links pointing to the specified unit files from the unit configuration directory, undoing the changes made by `enable`. However, please note that this will remove all symbolic links pointing to the unit file (including manually added ones) rather than just those created by `enable`. After the disablement of units is completed, this call implicitly reloads the systemd daemon configuration. Please note that this command does not implicitly stop the units being disabled. If this is required, an additional stop command should be executed subsequently. This command will print the executed operation, and this output can be suppressed by passing `--quiet`. This command accepts `--system`, `--user`, `--runtime`, and `--global` in a similar way to `enable`.

* `is-enabled NAME...`: Checks whether any specified unit files are enabled (i.e., enabled). If at least one is enabled, it returns the exit code `0`; otherwise, it returns a non-zero code. It prints the current enablement state: `enabled`, `enabled-runtime`, `linked`, `linked-runtime`, `masked`, `masked-runtime`, `static`, `disabled`. To suppress this output, use `--quiet`.

* `reenable NAME...`: Reenables one or more unit files based on the command line. This is a combination of `disable` and `enable`, used to reset the symbolic links for the enabled units to the defaults configured in the `[Install]` section of the unit file.

* `preset NAME...`: Resets one or more unit files specified in the command line to the defaults configured in the preset policy files. This has the same effect as `disable` or `enable` depending on how the units are listed in the preset files. Use `--preset-mode=` to control whether the units are enabled and disabled, or just enabled or just disabled. For detailed information on the preset policy format, please refer to `systemd.preset`. For more information on the preset concept, please refer to the `Preset` documentation.

* `preset-all`: Resets all installed unit files to the defaults configured in the preset policy files. Use `--preset mode=` to control whether the units are enabled and disabled, or just enabled or just disabled.

* `mask NAME...`: Masks one or more unit files based on the command line, which links these units to `/dev/null`, making them unable to start. This is a more potent version of disabling because it prevents various activated units, including manual activations. Use this option with caution. The `--runtime` option allows temporarily masking until the system is restarted.

* `link FILENAME...`: Links unit files not in the unit file search path to the unit file search path. This requires the absolute path to the unit file. The effect of this command can be undone using `disable`. The effect of this command is that the unit file is available for `start` and other commands, even though it is not directly installed in the unit search path.

* `get-default`: Obtains the default target specified by the link through `default.target`.

* `set-default NAME`: Sets the default target to start, linking `default.target` to the given unit.

### Machine Commands
* `list-machines [PATTERN...]`: Lists the hosts and all running local containers and their statuses. If one or more patterns are specified, it only displays the containers that match one of the patterns.

### Job Commands
* `list-jobs [PATTERN...]`: Lists the jobs in progress. If one or more patterns are specified, only jobs corresponding to one of the patterns are displayed.
* `cancel JOB...`: Cancels one or more jobs specified by the numerical job IDs on the command line. If no job IDs are specified, all pending jobs are canceled.

### Snapshot Commands
* `snapshot [NAME]`: Creates a snapshot. If a snapshot name is specified, the new snapshot will be named accordingly. If no name is specified, an automatic snapshot name is generated. In both cases, the snapshot name used is printed to standard output unless `--quiet` is specified. A snapshot is a saved state of the `systemd manager` itself, implemented as a unit created dynamically with this command. It depends on all active units at the time. Later, users can return to this state using the isolate command on the snapshot unit. Snapshots are only used to save and restore running or stopped units. They do not save/restore any other state. Snapshots are dynamic and lost on reboot.

* `delete PATTERN...`: Deletes the snapshots created previously with `snapshot`.

### Environment Commands
* `show-environment`: Dumps the `systemd manager` environment block. The environment block is dumped in a form suitable for inclusion into shell scripts from the source code directly. This environment block is passed to all processes generated by the manager.

* `set-environment VARIABLE=VALUE...`: Sets one or more `systemd manager` environment variables as specified on the command line.

* `unset-environment VARIABLE...`: Unsets one or more `systemd manager` environment variables. If only the variable name is specified, the variable will be deleted regardless of its value. If a variable and a value are specified, the variable will only be deleted if it has the specified value.

* `import-environment VARIABLE...`: Imports all, one, or more environment variables set on the client into the `systemd manager` environment block. If no arguments are passed, the entire environment block is imported. Otherwise, a list of one or more environment variable names should be passed, and then their client values are imported into the manager's environment block.

### Manager Lifecycle Commands
* `daemon-reload`: Reloads the `systemd manager` configuration. This reloads all unit files and recreates the entire dependency tree. When the daemon is reloaded, all sockets `systemd` listens on for user configuration remain accessible. This command should not be confused with `load` or `reload` commands.

* `daemon-reexec`: Re-executes the `systemd manager`. This serializes the manager's state, re-executes the process, and then deserializes the state again. Other than for debugging and package upgrades, this command is not useful. Sometimes, as a reload daemon, it may be helpful. When the daemon is re-executed, all sockets `systemd` listens on for user configuration remain accessible.

### System Commands
* `is-system-running`:  Check if the system is running, when the system is fully booted and operational, it returns `success`, which means it's not in startup, shutdown, or maintenance mode. Otherwise, it returns `failure`. In addition, the current status is printed to the standard output in a short string form. Use `--quiet` to suppress the output of this status string.
* `default`:  Enter default mode, which is mainly equivalent to isolating `default.target`.
* `rescue`:  Enter rescue mode, which is mainly equivalent to isolating `rescue.target`, but it also prints a message to all users.
* `emergency`:  Enter emergency mode, which is mostly equivalent to isolating `Emergency.target`, but it also displays an isolated wall message to all users.
* `halt`:  Shut down and stop the system, which is mainly equivalent to starting `halt.target --irreversible`, but it also displays a wall message to all users. When used with `--force`, it will skip the shutdown of all running services, but it will terminate all processes, unmount or mount all file systems as read-only, and then stop the system immediately. If `--force` is specified twice, the operation will be executed immediately without terminating any processes or unmounting any file systems, which may result in data loss.
* `poweroff`:  Shut down and power off the system, which is mainly equivalent to starting `poweroff.target --irreversible`, but it also displays a wall message to all users. When used with `--force`, it will skip the shutdown of all running services, but it will terminate all processes, unmount or mount all file systems as read-only, and then power off immediately. If `--force` is specified twice, the operation will be executed immediately without terminating any processes or unmounting any file systems, which may result in data loss.
* `reboot [arg]`:  Shut down and restart the system, which is mainly equivalent to starting `reboot.target --irreversible`, but it also displays a wall message to all users. When used with `--force`, it will skip the shutdown of all running services, but it will terminate all processes, unmount or mount all file systems as read-only, and then reboot immediately. If `--force` is specified twice, the operation will be executed immediately without terminating any processes or unmounting any file systems, which may result in data loss. If an optional `arg` is provided, it will be passed as an optional argument to the `reboot` system call. This value is architecture and firmware specific, for example, `recovery` can be used to trigger system recovery, while `fota` can be used to trigger firmware over the air update.
* `kexec`:  Shut down and restart the system through `kexec`, which is mainly equivalent to starting `kexec.target --irreversible`, but it also displays a wall message to all users. When used with `--force`, it will skip the shutdown of all running services, but it will terminate all processes, unmount or mount all file systems as read-only, and then reboot immediately.
* `exit`:  Request the system administrator to exit. This function is only supported by the user service manager, i.e. when used with the `--user` option, otherwise it will fail.
* `suspend`:  Suspend the system, which triggers the activation of the special `suspend.target`.
* `hibernate`:  Hibernate the system, which triggers the activation of the special `hibernate.target`.
* `hybrid-sleep`:  Hibernate and suspend the system. This triggers the activation of the special `hybrid-sleep.target`.
* `switch-root ROOT [INIT]`:  Switch to another root directory and execute a new system manager process underneath it. This is intended for use with the initial RAM disk (`initrd`) and to transition from the system manager process running from `initrd`, also known as the `init` process, to the main system manager process. This call takes two arguments - the directory to become the new root directory, and the path to the new system manager binary to be executed as `PID 1` underneath it. If the latter is omitted or an empty string, the `systemd` binary will be searched for and used as `init`. If the system manager path is omitted or is an empty string, the state of the system manager process from `initrd` will be passed to the main system manager, allowing for later introspection of services involved in the `initrd` boot.

## UNIT file configuration

### UNIT File Types
The `Unit` files have standardized various different system resource configuration formats, such as service startup, shutdown, scheduled tasks, automatic device mounting, network configuration, device configuration, virtual memory configuration, and more. `Systemd` uses different file suffixes to distinguish these configuration files. The `.service` file is the most commonly used, and below are the 12 `Unit` file types supported by `Systemd`.

- `.automount`: Controls the automatic mounting of file systems. When a directory is accessed, the system automatically mounts it. This type of `unit` replaces the respective functionality of traditional `Linux` systems' `autofs`.
- `.device`: Corresponds to devices under the `/dev` directory and is mainly used to define dependencies between devices.
- `.mount`: Defines a mount point in the system hierarchy and can replace the legacy `/etc/fstab` configuration file.
- `.path`: Monitors changes in a specified directory and triggers the execution of other `unit` files.
- `.scope`: These `unit` files are not created by users, but are generated by `Systemd` runtime to describe some system service grouping information.
- `.service`: Encapsulates the startup, shutdown, restart, and reload operations of daemons and is the most common type of `unit`.
- `.slice`: Describes some information about `cgroup` and is rarely used, so users generally ignore it.
- `.snapshot`: This type of `unit` is actually a snapshot of the running state of a `Systemd unit` created by the `systemctl snapshot` command.
- `.socket`: Monitors `socket` messages in the system or on the internet to automatically trigger service startup based on network data.
- `.swap`: Defines a swap partition for virtual memory.
- `.target`: Used to logically group `units` and guide the execution of other `units`. It replaces the role of run levels in `SysV` and provides a more flexible way of starting based on specific device events. For example, `multi-user.target` is equivalent to the previous run level `5`, while `bluetooth.target` is triggered when a Bluetooth device is connected.
- `.timer`: Encapsulates time-triggered actions inside the `system` and replaces the functionality of `crontab`.

### Configuration Directories
According to `Systemd` conventions, `Unit` files should be placed in one of three specified system directories. These three directories have a hierarchy of priorities. Hence, when there are files with the same name in several directories, only the file in the directory with the highest priority will be used.

- `/etc/systemd/system`: Configuration files provided by the system or users.
- `/run/systemd/system`: Configuration files generated during software runtime.
- `/usr/lib/systemd/system`: Configuration files added during system or third-party software installation.

### Service File Fields
Usually, we only need to configure the `.service` file, which consists of three segments.

#### Unit Section
In these configurations, other than `Description`, multiple values can be added. For example, the `After` parameter can use a space to separate all values, or multiple `After` parameters can be used to specify a value on each line.

- `Description`: A description of the `Unit` file, usually just a short sentence.
- `Documentation`: Specifies the documentation of the service, which can be one or more document `URL` paths.
- `Requires`: Lists dependencies on other `Unit` modules. The modules listed therein will be started when this service starts, and if any of those services fail to start, this service will also be terminated.
- `Wants`: Similar to `Requires`, but triggers the start of each listed `Unit` module when the configured `Unit` starts, without considering whether the start of these modules is successful.
- `After`: Similar to `Requires`, but the current service will only start after all the listed modules have started.
- `Before`: Opposite of `After`; ensures that the current service is already running before starting any of the specified modules.
- `BindsTo`: Similar to `Requires`, but it's a stronger association. When starting this service, all listed modules will start simultaneously. If any module fails to start, the current service will be terminated. Conversely, once all the listed modules start, the current service will also start automatically. If any of these modules unexpectedly terminate or restart, this service will also terminate or restart.
- `PartOf`: This is a subset of the `BindTo` function, and only terminates or restarts the current service if any of the listed modules fail or restart, without starting with the listed modules.
- `OnFailure`: Automatically starts each listed module when this module fails to start.
- `Conflicts`: Modules that conflict with this module. If any of the listed modules are already running, this service cannot start, and vice versa.

#### Install Section
The configuration in this section is somewhat similar to `Unit`, but this part of the configuration needs to be activated by the `systemctl enable` command and can be disabled by the `systemctl disable` command. In addition, the target module of this configuration is usually a `.target` file for a specific startup level, used to make the service run automatically when the system starts up.
* `WantedBy`: Similar to the function of `Wants` mentioned earlier, but instead of listing the modules that the service depends on, it lists the modules that depend on the current service.
* `RequiredBy`: Similar to the function of `Requires` mentioned earlier, it also lists the modules that depend on the current service, not the modules that the service depends on.
* `Also`: When this service is `enable/disable`, each module listed afterwards will be automatically `enable/disable` as well.

#### Service Section
This section is unique to the `.service` file and is the most important part of the service configuration. There are many configuration options in this part, mainly divided into service lifecycle control and service context configuration. Here are some commonly used configurations. In addition, there are some limitations on specific resources available to the service, such as `CPU`, program stacks, file handles, number of child processes, and so on, which can be referred to in the `Linux` documentation for resource quotas.
* `Type`: The type of service, commonly used are `simple` and `forking`. The default `simple` type is suitable for the vast majority of scenarios, so this parameter can generally be ignored. If the service program will create a child process through the `fork` system call after starting and then close the process of the application itself, the value of `Type` should be set to `forking`. Otherwise, `systemd` will not track the behavior of the child process and will consider the service to have exited.
* `RemainAfterExit`: The value can be `true` or `false`, or can be written as `yes` or `no`, with a default value of `false`. When the configuration value is `true`, `systemd` will only be responsible for starting the service process. Even if the service process exits, `systemd` will still consider the service to be running. This configuration is mainly for special types of services that are not resident in memory, but start, exit immediately, and then wait for a message to be started on demand.
* `ExecStart`: This parameter is present in almost every `.service` file, specifying the main command to start the service, and can only be used once in each configuration file.
* `ExecStartPre`: Specifies the preparatory work before the `ExecStart` command is executed at startup, and there can be multiple commands, all of which will be executed in the order written in the file.
* `ExecStartPost`: Specifies the post-startup work after the `ExecStart` command is executed, and there can be multiple commands.
* `TimeoutStartSec`: The number of seconds to wait when starting the service. If the service has not completed all startup commands after this time, `systemd` will consider the service to have automatically failed. This configuration is particularly important for applications hosted in `Docker` containers because the initial run of `Docker` may require downloading the service's image file from the network, causing significant delay and making it easy for `systemd` to mistake the startup as a failure and kill the service. Typically, for such services, the value of `TimeoutStartSec` needs to be specified as `0` to disable the timeout check.
* `ExecStop`: The main command needed to stop the service.
* `ExecStopPost`: Specifies the post-stop work after the `ExecStop` command is executed, and there can be multiple commands.
* `TimeoutStopSec`: The number of seconds to wait when stopping the service. If the service has not stopped after this time, `systemd` will forcibly kill the service's process using the `SIGKILL` signal.
* `Restart`: This value is used to specify when the service process needs to be restarted. Common values include `no`, `on-success`, `on-failure`, `on-abnormal`, `on-abort`, and `always`, with a default value of `no`, meaning the service will not automatically restart.
* `RestartSec`: If the service needs to be restarted, the value of this parameter is the number of seconds to wait before the service is restarted.
* `ExecReload`: The main command to reload the service.
* `Environment`: Adds environment variables to the service.
* `EnvironmentFile`: Specifies a file that contains a list of environment variables required for the service, with each line in the file defining an environment variable.
* `Nice`: The process priority of the service. The lower the value, the higher the priority, with a default of `0`, `-20` being the highest priority, and `19` being the lowest.
* `WorkingDirectory`: Specifies the working directory of the service.
* `RootDirectory`: Specifies the root directory `/` of the service process. If this parameter is configured, the service will not be able to access any files outside the specified directory.
* `User`: Specifies the user running the service, affecting the read, write, and execute permissions of the service on the local file system.
* `Group`: Specifies the user group running the service, affecting the service's access permissions on the local file system.
* `StartLimitIntervalSec`: Sets the startup frequency limit for the unit, defaulting to `5` starts within `10` seconds.
* `StartLimitBurst`: Sets the startup frequency limit for the unit within a given time period, by default allowing `5` starts within `10` seconds.

#### File Example

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

## Example

Enable the service at boot.

```shell
systemctl enable nginx.service
```

Check if the service is enabled at boot.

```shell
systemctl is-enabled nginx.service
```

Disable the service at boot.

```shell
systemctl disable nginx.service
```

Start the service.

```shell
systemctl start nginx.service
```

Stop the service.

```shell
systemctl stop nginx.service
```

Restart the service.

```shell
systemctl restart nginx.service
```

Reload the service configuration. After modifying the configuration file, you need to execute `systemctl daemon-reload` first.

```shell
systemctl reload nginx.service
```

Check the running status of the service.

```shell
systemctl status nginx.service
```

Show the failed units.

```shell
systemctl --failed
systemctl list-units --state failed
```

Reset the failure counter for units.

```shell
systemctl reset-failed
```

Reload all modified service configurations. Otherwise, the configuration changes will not take effect. Of course, this command will also do a lot of other things, such as regenerate the dependency tree.

```shell
systemctl daemon-reload
```

List all units.

```shell
systemctl list-units
```

List an overview of all unit statuses.

```shell
systemctl status
```

View the active services.

```shell
systemctl list-units -t service
```

List all installed services.

```shell
systemctl list-unit-files
```

Check all configuration details of the `nginx` service.

```shell
systemctl show nginx.service
```

Get the dependency list of the `nginx` service.

```shell
systemctl list-dependencies nginx.service
```

View environment variables.

```shell
systemctl show-environment
```

Reboot the system.

```shell
systemctl reboot
```

Power off the system.

```shell
systemctl poweroff
```

Stop the CPU.

```shell
systemctl halt
```

Suspend the system.

```shell
systemctl suspend
```

Hibernate the system.

```shell
systemctl hibernate
```

Put the system into interactive sleep.

```shell
sudo systemctl hybrid-sleep
```

Start in rescue mode, also known as single-user mode.

```shell
systemctl rescue
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://www.cnblogs.com/tsdxdx/p/7288490.html
https://www.cnblogs.com/chjbbs/p/6288592.html
https://www.geeksforgeeks.org/systemctl-in-unix/
http://www.jinbuguo.com/systemd/systemd.unit.html
https://blog.csdn.net/m0_38023255/article/details/78757655
https://www.commandlinux.com/man-page/man1/systemctl.1.html
http://www.ruanyifeng.com/blog/2016/03/systemd-tutorial-commands.html
```