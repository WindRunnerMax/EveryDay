# QQ小程序支付 Java后端

> 同学折腾QQ小程序的支付折腾了好几天，没有完成统一下单，因为我做过微信和支付宝支付，他就让我帮忙搞
> 我搞了好两三个小时，也没搞出来，最终我觉得问题在商户key那里，问了几次甲方，他说key没问题
> 我仍然觉得问题很有可能在key，就去直接给他重置了key，然后，就成功完成了支付...
> 总结，永远不要相信甲方

QQ小程序支付与微信小程序支付类似，签名方式完全相同，提交的xml有些不同

[QQ小程序统一下单文档](https://qpay.qq.com/buss/wiki/38/1203)
[微信小程序验签工具(QQ小程序适用)](https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=20_1)

首先是配置类，设置为包内访问权限，其实应该放于properties文件，或者直接配置在xml中，偷了个懒直接写在了代码中

```java
public class PayConfigs {

    final static String appid="";

    final static String mchid="";

    final static String key="";

    final static String reqAd="https://qpay.qq.com/cgi-bin/pay/qpay_unified_order.cgi";
}
```

小程序支付需要首先发起一个request到后端并携带一些商品信息，后端提交XML然后返回一个prepay_id到前端，小程序提供唤醒支付API调用

```javascript
qq.request({
      url: "请求地址",
      data: { /* 数据 */ },
      success: function(result) {
        if (result.data) {
          qq.requestPayment({
              package: "prepay_id=" + result.data.prepay_id,
              bargainor_id: "", //商户号
              success(res) { },
              fail(res) { }
            })
        }
      }
    })
```
发起支付的Java方法，需要用到一个工具类，在文末写明
```java
public Map<String,String> qqPay() throws Exception{
        String mchid = PayConfigs.mchid;
        String nonce_str = PayUtil.getRandomStringByLength(16);
        String body = "测试";
        String out_trade_no = "OTS"+ PayUtil.getRandomStringByLength(12); //商户订单号
        String fee_type = "CNY";
        String total_fee = "100"; //自定义货币总额，单位为分
        String spbill_create_ip = ""; // 用户客户端ip
        String trade_type = "JSAPI"; //小程序默认为JSAPI
        String notify_url = "http://www.baidu.com"; //回调地址

        Map<String, String> packageParams = new HashMap<>();
        packageParams.put("mch_id", mchid);
        packageParams.put("nonce_str", nonce_str);
        packageParams.put("body", body);
        packageParams.put("out_trade_no", out_trade_no + ""); //商户订单号
        packageParams.put("total_fee", total_fee + ""); //支付金额，需要转成字符串
        packageParams.put("spbill_create_ip", spbill_create_ip);
        packageParams.put("notify_url", notify_url); //支付成功后的回调地址
        packageParams.put("trade_type", trade_type); //支付方式

        String result = PayUtil.exec(packageParams,PayConfigs.key,PayConfigs.reqAd);
        System.out.println(result);

        // 业务逻辑

        return PayUtil.xmlToMap(result);
    }
```
当用户支付成功后腾讯服务器会访问提交的notify_url即回调地址，并携带XML提供订单号与签名验证等

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

            // 注意，在QQ服务器收到Accept之前可能会产生多次回调。需要有处理多次回调的代码
            // 业务逻辑

            System.out.println(PayUtil.acceptXML());
        }
        return PayUtil.acceptXML();
    }
```

 依赖以及工具类 [文章提及的所有代码](https://github.com/WindrunnerMax/Asse/tree/master/Java)
 

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
        // HashMap底层是数组加链表，会把key的值放在通过哈希算法散列后的对象的数组坐标上，
        // 所以取得的值是按哈希表来取的，所以和放入的顺序无关
        // 保持有序需要用LinkedHashMap
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