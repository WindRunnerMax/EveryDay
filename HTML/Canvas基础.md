# Canvas基础
`HTML5`中引入`<canvas>`标签，用于图形的绘制，`<canvas>`为图形的绘制提供了画布，是图形容器，具体的图形绘制由`JavaScript`来完成。

## 实例

```html
<!-- 绘制冒泡效果 -->
<!DOCTYPE html>
<html>
<head>
    <title>Canvas</title>
</head>
<style type="text/css">
    #canvas{
        border: 1px solid #eee;
    }
</style>
<body>
    <canvas id="canvas" width="500" height="300" ></canvas>
    <!-- 不建议使用css控制常宽，因为如果设置的宽高与初始比例 300:150 不同，有可能出现扭曲的现象 -->
    <!-- 假如浏览器不支持canvas可以直接 <canvas>您的浏览器不支持canvas</canvas> 浏览器会渲染替代内容 -->
</body>
<script type="text/javascript">

    class Bubble{ // ES6新增Class语法糖

        constructor(ctx){ // 构造函数
            this.colorList = [[254,158,159], [147,186,255], [217,153,249], [129,199,132], [255,202,98], [255,164,119]]; // 颜色方案
            this.ctx = ctx.getContext("2d"); // 二维绘图
            this.circleList = []; // 气泡数组
        }

        randomInt(a, b) { // 返回随机数
            return Number.parseInt(Math.random() * (b - a + 1) + a);   //取a-b之间包括ab的随机值
        }

        newCircle(){ // 新气泡
            if(this.randomInt(0,80)) return 0; // 控制生成气泡的数量
            var canvasHeight = this.ctx.canvas.height; // 获取画布高度
            var circle = {}; // 定义一个新的气泡对象
            circle.r = this.randomInt(10,50); // 随机半径
            circle.x = this.randomInt(0, this.ctx.canvas.width); // 初始化气泡X坐标
            circle.xMoveSpeed = this.randomInt(-10,10); // X方向移动速度以及方向
            circle.y = canvasHeight + circle.r; // 初始化气泡Y坐标
            circle.yMoveSpeed = this.randomInt(5,10); // Y方向的移动速度
            circle.color = this.colorList[this.randomInt(0,this.colorList.length-1)]; // 获取气泡颜色
            this.circleList.push(circle); // 将对象放入数组
        }

        destroyCircle(){ // 销毁气泡
            this.circleList.forEach((v,i) => {
                if(v.y < -v.r) this.circleList.splice(i,1); // 气泡超过上边界就销毁气泡对象
            })
        }

        draw(){ // 绘制气泡
            this.newCircle(); // 调用产生新气泡 
            this.ctx.clearRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height); // 清空画布
            this.ctx.save(); // 保存画布状态
            this.circleList.forEach( v => {
                this.ctx.beginPath(); // 起始一条路径
                this.ctx.fillStyle = `rgb(${v.color[0]},${v.color[1]},${v.color[2]},0.6)`; // 设置背景颜色
                this.ctx.strokeStyle = `rgb(${v.color[0]},${v.color[1]},${v.color[2]})`; // 设置边线颜色
                this.ctx.arc(v.x,v.y,v.r,0,Math.PI * 2); // 绘制圆 x坐标 y坐标 半径 起始角度 结束角度 顺/逆时针绘制
                this.ctx.fill(); // 绘制填充
                this.ctx.stroke(); // 绘制边线
                v.y -= v.yMoveSpeed * 0.06; // Y轴移动
                v.x += v.xMoveSpeed * 0.03; // X轴移动
            })
            this.ctx.restore(); // 恢复画布状态
            this.destroyCircle(); // 销毁气泡
        }

        start(){
            setInterval(() => {this.draw();},10); // 定时器绘制动画效果
        }

    }


    (function(){
        var ctx = document.getElementById("canvas"); // 获取canvas对象
        var bubble = new Bubble(ctx); // 实例化Bubble
        bubble.start(); // 开始绘制
    })();
</script>
</html>
```

## CANVAS与SVG

### svg
* 不依赖分辨率
* 支持事件处理器
* 不适合游戏应用
* `SVG`是使用`XML`来描述图形
* 最合适带有大型渲染区域的应用程序，如谷歌地图等
* 复杂度高会减慢渲染的速度，任何过度使用`DOM`的应用都不快
* 以单个文件的形式独立存在，后缀名`.svg`，可以直接在`html`中引入
* `SVG`是基于`XML`的，这也就是说`SVG DOM`中的每个元素都是可用的，可以为某个元素附加`JavaScript`事件处理器
* 在`SVG`中，每个被绘制过的图形均视为对象，如果`SVG`对象的属性发生变化，那么浏览器可以自行重现图形


### canvas
* 依赖分辨率
* 文本渲染力弱
* 不支持事件处理器
* `Canvas`是逐像素进行渲染的
* `Canvas`是通过`JavaScript`来绘制图形
* 能够以`.png`或`.jpg`的格式保存结果图形
* 最合适图像密集型的游戏，其中许多的对象会被频繁的重绘
* `Canvas`中一旦图形被绘制完成，他就不会继续得到浏览器的关注，如果他的位置发生变化，那么就需要重新来绘制图形，其中包括任何或已经被图形覆盖的对象

## 参考

```
https://www.runoob.com/tags/ref-canvas.html
https://www.runoob.com/w3cnote/html5-canvas-intro.html
```

