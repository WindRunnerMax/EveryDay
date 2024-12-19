# Capturing HTTPS Traffic on Mobile (Fiddler & Packet Capture)

    I previously wrote a little script for a game called "EliminVirus" that helps with collecting coins. To use it, you need to obtain the openid, which requires capturing the HTTPS packets from WeChat. I've always used Fiddler to capture packets on the computer and Packet Capture to capture packets on the phone. Suddenly, I wanted to try capturing the phone's packets using the computer. 
    Link: https://github.com/WindrunnerMax/EliminVirus

## 1. Fiddler
First, download and install Fiddler.

![](screenshots/2023-04-14-19-00-50.jpg)

Open Tools - Options - HTTPS and install the certificate.

![](screenshots/2023-04-14-19-01-00.png)

Open Connections and allow remote hosts to connect. This operation requires restarting Fiddler to take effect.

![](screenshots/2023-04-14-19-01-09.png)

To prevent the firewall from blocking the phone's connection, temporarily disable the firewall.
Control Panel - Firewall - Change Notification Settings

![](screenshots/2023-04-14-19-01-19.png)

![](screenshots/2023-04-14-19-01-26.png)

The phone and the computer need to be on the same local network. Check the local IP address of the device. Since I'm using Wi-Fi, I only need to look at the IP address displayed under the WLAN network card.

![](screenshots/2023-04-14-19-01-36.jpg)

On the phone, open the IP:8888 to download and install the certificate. If prompted that the file cannot be found, go to the phone's Settings - Install Certificates from Storage, then set a password.

![](screenshots/2023-04-14-19-01-47.jpg)

Open the connected Wi-Fi on the phone and click on "Set Proxy Manually."

![](screenshots/2023-04-14-19-01-56.jpg)

Open WeChat - EliminVirus, and Fiddler will start capturing packets.

![](screenshots/2023-04-14-19-02-06.jpg)

## 2. Packet Capture
Open the software and go to the options in the top right corner to set it up.

![](screenshots/2023-04-14-19-02-14.jpg)

Install the certificate.

![](screenshots/2023-04-14-19-02-23.jpg)

Click Start and choose WeChat.

![](screenshots/2023-04-14-19-02-30.jpg)

Select the one on the right with "ssl" and you will be able to see the openid.

![](screenshots/2023-04-14-19-02-36.jpg)