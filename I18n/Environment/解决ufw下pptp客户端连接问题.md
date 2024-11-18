# Fix the PPTP Client Connection Issue Under ufw

Fix the issue of the PPTP client unable to connect in Ubuntu when ufw is enabled.

Edit `/etc/ufw/before.rules`  
Add the following line before `COMMIT`:  
`-A ufw-before-input -p 47 -j ACCEPT`

Edit `/etc/default/ufw`  
Add `nf_conntrack_pptp` to the `IPT_MODULES` option.

Restart ufw  
`sudo service ufw restart`

Reconnect with `pptpsetup` after the modification.