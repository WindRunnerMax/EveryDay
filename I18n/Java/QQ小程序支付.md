# QQ Mini Program Payment Java Backend

> A classmate spent several days struggling with the payment process of QQ Mini Program, but couldn't complete the unified order. Since I have experience with WeChat and Alipay payments, he asked for my help. After spending a good two or three hours on it without success, I finally thought the issue might be with the merchant key. Although I asked the first party multiple times and was told that the key was not the problem, I still felt that the issue likely lay with the key. So, I went ahead and directly reset the key for him, and then, the payment was successfully completed... In summary, never trust the first party.

QQ Mini Program payment is similar to WeChat Mini Program payment, with completely identical signature methods, but with some differences in the submitted XML.

[QQ Mini Program Unified Order Document](https://qpay.qq.com/buss/wiki/38/1203)
[WeChat Mini Program Signature Verification Tool (Applicable to QQ Mini Program)](https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=20_1)

First, there is the configuration class, set to have package-private access. In reality, it should be placed in a properties file or directly configured in XML. However, I took a shortcut and wrote it directly in the code.

```java
public class PayConfigs {

    final static String appid="";

    final static String mchid="";

    final static String key="";

    final static String reqAd="https://qpay.qq.com/cgi-bin/pay/qpay_unified_order.cgi";
}
```

For the Mini Program payment, it is necessary to first send a request to the backend with some product information and submit XML, then return a prepay_id to the front end. The Mini Program provides an API call to trigger payment.

```javascript
qq.request({
      url: "Request Address",
      data: { /* Data */ },
      success: function(result) {
        if (result.data) {
          qq.requestPayment({
              package: "prepay_id=" + result.data.prepay_id,
              bargainor_id: "", //Merchant ID
              success(res) { },
              fail(res) { }
            })
        }
      }
    })
```

The Java method for initiating payment requires the use of a utility class, as mentioned at the end of the document.

```java
public Map<String,String> qqPay() throws Exception{
        String mchid = PayConfigs.mchid;
        String nonce_str = PayUtil.getRandomStringByLength(16);
        String body = "Test";
        String out_trade_no = "OTS"+ PayUtil.getRandomStringByLength(12); //Merchant Order Number
        String fee_type = "CNY";
        String total_fee = "100"; //Custom currency total, unit in cents
        String spbill_create_ip = ""; // User client IP
        String trade_type = "JSAPI"; //Default to JSAPI for Mini Program
        String notify_url = "http://www.baidu.com"; //Callback address

        Map<String, String> packageParams = new HashMap<>();
        packageParams.put("mch_id", mchid);
        packageParams.put("nonce_str", nonce_str);
        packageParams.put("body", body);
        packageParams.put("out_trade_no", out_trade_no + ""); //Merchant Order Number
        packageParams.put("total_fee", total_fee + ""); //Payment amount, needs to be converted to a string
        packageParams.put("spbill_create_ip", spbill_create_ip);
        packageParams.put("notify_url", notify_url); //Callback address after successful payment
        packageParams.put("trade_type", trade_type); //Payment method

        String result = PayUtil.exec(packageParams,PayConfigs.key,PayConfigs.reqAd);
        System.out.println(result);

        // Business logic

        return PayUtil.xmlToMap(result);
    }
```

Upon successful user payment, Tencent's servers will access the submitted `notify_url` (the callback address) and provide the order number and signature verification in XML.

```java
public String acceptPay(HttpServletRequest request) throws Exception{
        BufferedReader br = new BufferedReader(new InputStreamReader(request.getInputStream()));
        String line;
        StringBuilder stringBuilder = new StringBuilder();
        while ((line = br.readLine()) != null) {
            stringBuilder.append(line);
        }
        br.close();
        String notityXml = stringBuilder.toString();
        Map<String,String> acceptParam = PayUtil.xmlToMap(notityXml);
        if (acceptParam.get("trade_state").equals("SUCCESS") && PayUtil.verifySign(acceptParam,PayConfigs.key)){

            // Please note that before the QQ server receives the "Accept", there may be multiple callbacks. There needs to be code to handle multiple callbacks
            // Business logic

            System.out.println(PayUtil.acceptXML());
        }
        return PayUtil.acceptXML();
    }
```

Dependency and utility class [All code mentioned in the article](https://github.com/WindrunnerMax/Asse/tree/master/Java)

```xml
<dependencies>
    <dependency>
        <groupId>commons-codec</groupId>
        <artifactId>commons-codec</artifactId>
        <version>1.6</version>
    </dependency>
</dependencies>
```

```java
package com.utils;

import org.apache.commons.codec.digest.DigestUtils;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.*;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;


public class PayUtil {

    public static String exec(Map<String, String> map, String key, String gateway) {
        Map<String, String> sortedMap = sortMapByKey(map);
        String sign = getLinkToSign(sortedMap, key);
        String xml = mapToXml(sortedMap, sign);
        String result = PayUtil.httpRequest(gateway, "POST", xml);
        return result;
    }

    public static String getRandomStringByLength(int length) {
        String base = "abcdefghijklmnopqrstuvwxyz0123456789";
        Random random = new Random();
        StringBuilder stringBuilder = new StringBuilder();
        for (int i = 0; i < length; i++) {
            int number = random.nextInt(base.length());
            stringBuilder.append(base.charAt(number));
        }
        return stringBuilder.toString();
    }
```

```java
public static Map<String, String> xmlToMap(String strXML) throws Exception {
    Map<String, String> data = new HashMap<>();
    DocumentBuilderFactory documentBuilderFactory = DocumentBuilderFactory.newInstance();
    DocumentBuilder documentBuilder = documentBuilderFactory.newDocumentBuilder();
    InputStream stream = new ByteArrayInputStream(strXML.getBytes(StandardCharsets.UTF_8));
    org.w3c.dom.Document doc = documentBuilder.parse(stream);
    doc.getDocumentElement().normalize();
    NodeList nodeList = doc.getDocumentElement().getChildNodes();
    for (int idx = 0; idx < nodeList.getLength(); ++idx) {
        Node node = nodeList.item(idx);
        if (node.getNodeType() == Node.ELEMENT_NODE) {
            org.w3c.dom.Element element = (org.w3c.dom.Element) node;
            data.put(element.getNodeName(), element.getTextContent());
        }
    }
    return data;
}

public static boolean verifySign(Map<String, String> map, String key){
    String sign = map.get("sign");
    map.remove("sign");
    Map<String, String> sortedMap = sortMapByKey(map);
    String xmlSign = getLinkToSign(sortedMap, key);
    return xmlSign.equals(sign);
}

public static String acceptXML(){
    return "<xml><return_code>SUCCESS</return_code></xml>";
}


private static String sign(String text, String key) {
    text = text + "key=" + key;
//        System.out.println("Sign Url: " + text);
    return DigestUtils.md5Hex(getContentBytes(text)).toUpperCase();
}


private static byte[] getContentBytes(String content) {
    return content.getBytes(StandardCharsets.UTF_8);
}


private static String getLinkToSign(Map<String, String> map, String payKey) {
    StringBuilder preStr = new StringBuilder();
    for (Map.Entry<String, String> m : map.entrySet()) {
        String key = m.getKey();
        String value = m.getValue();
        preStr.append(key).append("=").append(value).append("&");
    }
    String link = preStr.toString();
    return sign(link, payKey);
}
```

```java
    private static String httpRequest(String requestUrl, String requestMethod, String outputStr) {
        StringBuilder stringBuilder = new StringBuilder();
        try {
            URL url = new URL(requestUrl);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod(requestMethod);
            conn.setDoOutput(true);
            conn.setDoInput(true);
            conn.connect();
            if (null != outputStr) {
                OutputStream os = conn.getOutputStream();
                os.write(outputStr.getBytes(StandardCharsets.UTF_8));
                os.close();
            }
            InputStream is = conn.getInputStream();
            InputStreamReader isr = new InputStreamReader(is, StandardCharsets.UTF_8);
            BufferedReader br = new BufferedReader(isr);
            String line;
            while ((line = br.readLine()) != null) {
                stringBuilder.append(line);
            }
            br.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return stringBuilder.toString();
    }


    private static Map<String, String> sortMapByKey(Map<String, String> map) {
        List<String> keys = new ArrayList<>(map.keySet());
        Collections.sort(keys);
        // The underlying implementation of HashMap is an array plus a linked list. It will put the value of the key on the array coordinates of the object hashed by the hash algorithm,
        // So the retrieved value is based on the hash table, so it is not related to the order of putting in. To maintain order, a LinkedHashMap is needed.
        Map<String, String> m = new LinkedHashMap<>();
        for (String key : keys) {
            m.put(key, map.get(key));
        }
        map.clear();
        return m;
    }

    private static String mapToXml(Map<String, String> map, String sign) {
        StringBuilder stringBuilder = new StringBuilder().append("<xml>");
        for (Map.Entry<String, String> m : map.entrySet()) {
            stringBuilder.append("<").append(m.getKey()).append(">")
                    .append(m.getValue()).append("</").append(m.getKey()).append(">");
        }
        stringBuilder.append("<sign>").append(sign).append("</sign>").append("</xml>");
        return stringBuilder.toString();
    }
}
```