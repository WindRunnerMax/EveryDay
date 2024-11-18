# How to obtain the user_id (openid) of Alipay Mini Program using ThinkPHP

Recently, the personal beta version of Alipay Mini Program was launched, so I wanted to give it a try. However, I didn't expect it to be so troublesome just to obtain the unique identifier of the user. Unlike the openid which can be obtained with a simple GET request in WeChat, getting the user_id in Alipay requires integrating the SDK and performing public and private key verification. Moreover, the Alipay development tool consumes a huge amount of memory; just opening it alone takes up at least 2GB of memory. Quite a headache, isn't it?

1. **Firstly, register a Mini Program and include some useful links**  

- [Alipay Mini Program Registration Link](https://mini.open.alipay.com/channel/miniIndex.htm)  
- [Development Tool Download Link](https://opendocs.alipay.com/mini/ide/download)  
- [SDK Download Address](https://docs.open.alipay.com/20180417160701241302/litbla/)  
- [Alipay Mini Program Development Documentation](https://opendocs.alipay.com/mini/006kyi)  
- [RSA Key Generation Tool Download Address](https://docs.open.alipay.com/291/105971/)

2. **After registration, download all the provided software. Then, in the development center—Mini Program application—select Mini Program—development management—function list (at the bottom), add the [Get Member Basic Information] function.**

![Screenshot](screenshots/2023-04-14-20-50-13.png)

3. **Use the RSA key generation tool to create a key, which can be used for signature verification in the future.**

![Screenshot](screenshots/2023-04-14-20-50-19.png)

After generating the application private key and application public key, copy the application public key and paste it in the [development center—Mini Program application—select Mini Program—settings—development settings—set interface encryption method].

![Screenshot](screenshots/2023-04-14-20-50-27.png)

4. **For the frontend, I used silent access without displaying the authorization box. I only need the user_id.**

```javascript
my.getAuthCode({
    scopes: 'auth_base', 
    success:(res) =>{
        // Send res.authCode to the backend here
        // Reference: https://blog.csdn.net/qq_40413670/article/details/103796680 (Section Five: Deployment class `dispose.js`, 9. APP startup event)
    }
})
```

5. **Regarding the ThinkPHP part, start by downloading the SDK. The SDK contains many classes, but if you only need to obtain the user_id, you will only need the following six classes:**

```powershell
AopClient.php
AopEncrypt.php
EncryptParseItem.php
EncryptResponseData.php
SignData.php
request/AlipaySystemOauthTokenRequest.php
```

According to its directory structure, these first five classes belong to the same namespace, while the sixth class belongs to the request namespace at the higher level. Place the SDK in the extend directory in the root directory, list the first few parts of these classes, and keep the rest consistent with the SDK. The main task is to annotate the namespace. Thanks to the automatic loading mechanism of the TP framework, manual inclusion is not required.

```php
// AopClient.php
<?php
namespace lib\alipay;

use think\Exception;

class AopClient
{
    // Application ID
    public $appId;
    // ..................
}
```

```php
// AopEncrypt.php
<?php
namespace lib\alipay;
/**
* Encryption Utility Class
*
* User: jiehua
* Date: 16/3/30
* Time: 3:25 PM
*/


/**
* Encryption method
* @param string $str
* @return string
*/
function encrypt($str, $secret_key)
{
    // ..................
}
```

```php
// EncryptParseItem.php
<?php
namespace lib\alipay;
/**
*  TODO: Add explanation
*
* User: jiehua
* Date: 16/3/30
* Time: 8:55 PM
*/

class EncryptParseItem
{
    // ..................
}
```

```php
// EncryptResponseData.php
<?php
namespace lib\alipay;
/**
*  TODO: Add explanation
*
* User: jiehua
* Date: 16/3/30
* Time: 8:51 PM
*/

class EncryptResponseData
{
    public $realContent;
    public $returnContent;
}
```

```php
// SignData.php
<?php
namespace lib\alipay;
/**
 * Created by PhpStorm.
 * User: jiehua
 * Date: 15/5/2
 * Time: 6:21 PM
 */

class SignData
{
    public $signSourceData = null;
    public $sign = null;
} 
```

```php
// AlipaySystemOauthTokenRequest.php
<?php
namespace lib\alipay\request;
/**
 * ALIPAY API: alipay.system.oauth.token request
 *
 * @author auto create
 * @since 1.0, 2019-07-03 12:05:01
 */
class AlipaySystemOauthTokenRequest
{
    // ........................
}
```
Get user_id by calling the class

```php
$c = new AopClient();
$c->appId = "";       // APPID
$c->rsaPrivateKey = "";      // Generated RSA private key
$c->alipayrsaPublicKey = "";   // Generated RSA public key
$c->signType= "RSA2";
$request= new AlipaySystemOauthTokenRequest();
$request -> setCode($_POST['code']); // The code passed from the frontend
$request -> setGrantType("authorization_code");
$response= $c->execute($request);
$user_id =$response -> alipay_system_oauth_token_response -> user_id;
```

Thus, the user_id retrieval is complete. If there are any signature verification errors, you can use the RSA generation tool mentioned above for debugging. Additionally, the return value contains token and other data, which can be used as needed.