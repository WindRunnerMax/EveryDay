# Recovery
Recovery是一种可以对安卓手机内部的数据文件进行修改的模式，类似电脑的PE。不同的recovery有不同的功能。使用recovery可以说是刷机（卡刷）的基础，想要比较顺畅的刷机了解好rec是必不可少的。

> PS:为何不先介绍线刷 线刷看起来更容易，直接用手机连接电脑然后用各类刷机软件一键式操作就好。以前的话的确是这个样子，只要找到合适的刷机包一键刷机即可。但是目前各大手机厂商为了安全使用了BL锁，这样线刷就变得相对困难一些了，尤其是官方闭源，无法解锁BL的手机。

如何进入rec：在关机状态下，同时按住手的电源键和音量上（有的手机是音量下，这个键视手机而定）。

进入rec有何作用：除了刚介绍的刷机还可以进行数据的清除，某些时候手机无法开机，或者忘记了密码，并且不想去寻找售后的话，可以直接尝试清除数据
> PS：如果是忘记了密码，并且是下边将要介绍的第三方rec中的TWRP的话，可以直接删除密码文件然后就可以进入手机了

官方recovery（新买的手机官方自带的recovery），只能用它进行官方OTA系统升级以及恢复出厂设置。
第三方recovery目前主要有CWM和TWRP。CWM目前已经很少见了，主要是TWRP。

CWM:
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200113130246310.jpg)
1.CWM常用的只有刷入刷机包以及清除数据，并且无法采用触控的方式，只能利用音量键等进行操作，相对twrp recovery来说功能较少。


TWRP 
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200113130645412.jpg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQwNDEzNjcw,size_16,color_FFFFFF,t_70)

1. install
第三方rom、补丁的安装，也可以选install下的storage那里，切换至另一个存储器
2. wipe
对手机的某些分区或者内存储、外置SD卡或者OTG设备进行清除。双清三清四清五清，刷机一般只需要双清即可
3. Back up
对手机某些分区的备份
4. restore
对手机某些分区的数据恢复还原
5. mount
挂载手机某些分区
对系统文件进行管理或者终端操作system分区时，会发现找不到system，这时要用到mount命令。
6. advanced
对手机内部数据管理，包括复制、移动、赋权限、删除和重命名（对system进行操作别忘了用MOUNT命令）
7. SD卡分区；
partition SD card，这个请自行尝试
8. reload theme
修改recovery主题，可以美化recovery界面，以及使用中文界面
将下载的主题（ui.zip）放到TWRP/theme/目录下（可能是内存储，也可能是外置SD卡，看你recovery里面的storage选择哪里了），点击reload theme，即可使用主题。可以通过主题选择，将TWRP界面换成中文版。
9. terminal command
  手机端终端，对手机系统进行修改
10. file manager
文件管理
11. adb sideload刷机
自动将电脑端第三方rom和补丁包推送到手机内存储或者sd卡（adb命令：adb sideload ***.zip）
