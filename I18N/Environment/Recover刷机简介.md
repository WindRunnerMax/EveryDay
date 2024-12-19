# Recovery
Recovery is a mode that allows for modifying data files on an Android phone, similar to a PE on a computer. Different recoveries have different functions. Understanding rec is essential for smooth flash when it comes to the basis of flashing.

> PS: Why not introduce flashing first? Flashing seems easier, just connect the phone to the computer and use various flashing software for one-click operation. In the past, it was indeed like this, as long as you found the right firmware, one-click flashing was sufficient. However, currently, major phone manufacturers have used BL locks for security, making it relatively difficult for line flashing, especially when it is officially closed source and unable to unlock BL for phones.

How to enter rec: In the powered-off state, simultaneously press and hold the power button and volume up (for some phones, it's volume down, depending on the phone).

What is the purpose of entering rec: In addition to flashing as mentioned earlier, it can also be used to clear data. Sometimes, if the phone cannot be turned on, or if the password is forgotten and there is no intention to seek after-sales support, one can directly attempt to clear the data.
> PS: If the password is forgotten and it is the third-party rec, TWRP, which will be introduced below, you can directly delete the password file and then access the phone.

Official recovery (the recovery that comes with a newly purchased phone) can only be used for official OTA system upgrades and restoring to factory settings.
Third-party recoveries mainly include CWM and TWRP. CWM is now rarely seen, mainly TWRP.

## CWM:

![](screenshots/2023-04-14-20-28-42.jpg)

1. CWM is commonly used for flashing firmware and clearing data, and cannot be operated via touch. It can only be operated using volume keys, thus having fewer functions compared to twrp recovery.

## TWRP 

![](screenshots/2023-04-14-20-28-55.jpg)

1. install
  Installation of third-party ROMs and patches, or switching to another storage under "install" -> "storage"
2. wipe
  Clearing certain partitions of the phone or internal storage, external SD card, or OTG devices. A simple wipe is generally sufficient for flashing.
3. Back up
  Backing up certain partitions of the phone
4. restore
  Restoring data for certain partitions of the phone
5. mount
  Mounting certain partitions of the phone
  When managing system files or executing terminal operations on the system partition, if the "system" is not found, the "mount" command is used.
6. advanced
  Managing internal data of the phone, including copy, move, permission assignment, deletion, and renaming (don't forget to use the MOUNT command when operating on the system).
7. SD card partition
  Partition SD card, please try on your own
8. reload theme
  Modifying the recovery theme to beautify the recovery interface and use the Chinese interface
  Place the downloaded theme (ui.zip) in TWRP/theme/ directory (possibly in internal storage or external SD card, depending on the storage chosen in your recovery), click "reload theme" to use the theme. You can switch the TWRP interface to the Chinese version through theme selection.
9. terminal command
  Terminal on the phone for modifying the phone system
10. file manager
  File management
11. adb sideload flashing
  Automatically push third-party ROMs and patch packages from the computer to the phone's internal storage or SD card (adb command: adb sideload ***.zip)
```