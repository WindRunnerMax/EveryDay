# 解决ufw下pptp客户端连接问题
解决`ubuntu`在启动`ufw`的情况下`pptp`客户端无法链接的问题。

修改`/etc/ufw/before.rules`  
在`COMMIT`之前添加如下内容：  
`-A ufw-before-input -p 47 -j ACCEPT`

修改`/etc/default/ufw`   
在`IPT_MODULES`选项中添加`nf_conntrack_pptp` 

重启`ufw`  
`sudo service ufw restart`

重新`pptpsetup`链接即可