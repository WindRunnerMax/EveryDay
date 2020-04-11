# 强智教务系统验证码识别 OpenCV

> 强智教务系统验证码验证码字符位置相对固定，比较好切割  
> 找准切割位置，将其分为四部分，匹配自建库即可，识别率近乎100% 
> https://github.com/WindrunnerMax/SWVerifyCode 提供Java、PHP、Python、JavaScript版本  

首先使用代码切割验证码，挑选出切割的比较好的验证码，制作比对库
由于使用`matchTemplate`函数，要求待匹配图必须比库图小，于是需要放大库图边界

`TestImgCut.py`切割图片并挑选合适切割位置

```python
#!/usr/bin/python 
# -*- coding: utf-8 -*-

from fnmatch import fnmatch
from queue import Queue
import matplotlib.pyplot as plt
import cv2
import time
import os
from Convert import Convert
import requests



def _get_static_binary_image(img, threshold = 140):
  '''
  手动二值化
  '''

  img = Image.open(img)
  img = img.convert('L')
  pixdata = img.load()
  w, h = img.size
  for y in range(h):
    for x in range(w):
      if pixdata[x, y] < threshold:
        pixdata[x, y] = 0
      else:
        pixdata[x, y] = 255

  return img


def cfs(im,x_fd,y_fd):
  '''用队列和集合记录遍历过的像素坐标代替单纯递归以解决cfs访问过深问题
  '''

  # print('**********')

  xaxis=[]
  yaxis=[]
  visited =set()
  q = Queue()
  q.put((x_fd, y_fd))
  visited.add((x_fd, y_fd))
  offsets=[(1, 0), (0, 1), (-1, 0), (0, -1)]#四邻域

  while not q.empty():
      x,y=q.get()

      for xoffset,yoffset in offsets:
          x_neighbor,y_neighbor = x+xoffset,y+yoffset

          if (x_neighbor,y_neighbor) in (visited):
              continue  # 已经访问过了

          visited.add((x_neighbor, y_neighbor))

          try:
              if im[x_neighbor, y_neighbor] == 0:
                  xaxis.append(x_neighbor)
                  yaxis.append(y_neighbor)
                  q.put((x_neighbor,y_neighbor))

          except IndexError:
              pass
  # print(xaxis)
  if (len(xaxis) == 0 | len(yaxis) == 0):
    xmax = x_fd + 1
    xmin = x_fd
    ymax = y_fd + 1
    ymin = y_fd

  else:
    xmax = max(xaxis)
    xmin = min(xaxis)
    ymax = max(yaxis)
    ymin = min(yaxis)
    #ymin,ymax=sort(yaxis)

  return ymax,ymin,xmax,xmin

def detectFgPix(im,xmax):
  '''搜索区块起点
  '''

  h,w = im.shape[:2]
  for y_fd in range(xmax+1,w):
      for x_fd in range(h):
          if im[x_fd,y_fd] == 0:
              return x_fd,y_fd

def CFS(im):
  '''切割字符位置
  '''

  zoneL=[]#各区块长度L列表
  zoneWB=[]#各区块的X轴[起始，终点]列表
  zoneHB=[]#各区块的Y轴[起始，终点]列表

  xmax=0#上一区块结束黑点横坐标,这里是初始化
  for i in range(10):

      try:
          x_fd,y_fd = detectFgPix(im,xmax)
          # print(y_fd,x_fd)
          xmax,xmin,ymax,ymin=cfs(im,x_fd,y_fd)
          L = xmax - xmin
          H = ymax - ymin
          zoneL.append(L)
          zoneWB.append([xmin,xmax])
          zoneHB.append([ymin,ymax])

      except TypeError:
          return zoneL,zoneWB,zoneHB

  return zoneL,zoneWB,zoneHB


def cutting_img(im,im_position,xoffset = 1,yoffset = 1):
    # 识别出的字符个数
    im_number = len(im_position[1])
    if(im_number>=4): im_number = 4;

    imgArr = []
    # 切割字符
    for i in range(im_number):
        im_start_X = im_position[1][i][0] - xoffset
        im_end_X = im_position[1][i][1] + xoffset
        im_start_Y = im_position[2][i][0] - yoffset
        im_end_Y = im_position[2][i][1] + yoffset
        cropped = im[im_start_Y:im_end_Y, im_start_X:im_end_X]
        imgArr.append(cropped)
        cv2.imwrite(str(i)+"v.jpg",cropped) # 查看切割效果
    return im_number,imgArr



def main():
    cvt = Convert()
    req = requests.get("http://XXXXXXXXXXXXXXXXXXX/verifycode.servlet")
    img = cvt.run(req.content)
    cv2.imwrite("v.jpg",img)

    #切割的位置
    im_position = CFS(img) # Auto

    print(im_position)

    maxL = max(im_position[0])
    minL = min(im_position[0])

    # 如果有粘连字符，如果一个字符的长度过长就认为是粘连字符，并从中间进行切割
    if(maxL > minL + minL * 0.7):
        maxL_index = im_position[0].index(maxL)
        minL_index = im_position[0].index(minL)
        # 设置字符的宽度
        im_position[0][maxL_index] = maxL // 2
        im_position[0].insert(maxL_index + 1, maxL // 2)
        # 设置字符X轴[起始，终点]位置
        im_position[1][maxL_index][1] = im_position[1][maxL_index][0] + maxL // 2
        im_position[1].insert(maxL_index + 1, [im_position[1][maxL_index][1] + 1, im_position[1][maxL_index][1] + 1 + maxL // 2])
        # 设置字符的Y轴[起始，终点]位置
        im_position[2].insert(maxL_index + 1, im_position[2][maxL_index])

    # 切割字符，要想切得好就得配置参数，通常 1 or 2 就可以
    cutting_img_num,imgArr = cutting_img(img,im_position,1,1)

    # # 直接使用库读取图片识别验证码 
    # result=""
    # for i in range(cutting_img_num):
    #     try:
    #       template = imgArr[i]
    #       tempResult=""
    #       matchingDegree=0.0
    #       filedirWarehouse = '../../Warehouse/StrIntell/'
    #       for fileImg in os.listdir(filedirWarehouse):
    #         if fnmatch(fileImg, '*.jpg'):
    #           # print(file)
    #           img = cv2.imread(filedirWarehouse+fileImg,0)
    #           res = cv2.matchTemplate(img,template,3) #img原图 template模板   用模板匹配原图
    #           min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(res)
    #           # print(str(i)+" "+file.split('.')[0]+" "+str(max_val))
    #           if(max_val>matchingDegree):
    #             tempResult=fileImg.split('.')[0]
    #             matchingDegree=max_val
    #       result+=tempResult
    #       matchingDegree=0.0
    #     except Exception as err:
    #       print("ERROR "+ str(err))
    #       pass
    # print('切图：%s' % cutting_img_num)
    # print('识别为：%s' % result)



if __name__ == '__main__':
  main()
```

`resize.py`改变图片边界

```python
import cv2
from fnmatch import fnmatch
import os
 
def main():
    filedir = './StrIntell'
    for file in os.listdir(filedir):
        if fnmatch(file, '*.jpg'):
            fileLoc=filedir+"/"+file
            img=cv2.imread(fileLoc)
            # img=cv2.copyMakeBorder(img,10,10,10,10,cv2.BORDER_CONSTANT,value=[255,255,255]) # 扩大
            # img = img[0:25, 0:25] # 裁剪 高*宽
            print(img.shape)
            cv2.imwrite(fileLoc, img)
 
if __name__ == '__main__':
    main()

```
挑选好合适的库图片并将其resize
使用`TestImgCut.py`直接读库识别验证码
根据效果挑选合适的切割位置并保存起来
当觉得库文件与切割位置合适，将图片转为`list`并保存在变量
保存在变量的主要目的是可以直接读取到内存，避免频繁读硬盘造成时间浪费

`binary.py`转字符为变量

```python
import cv2
import os
from fnmatch import fnmatch
import numpy as np
np.set_printoptions(threshold=np.inf) # 不省略输出

if __name__ == '__main__':
    binary = ""
    for fileImg in os.listdir("StrIntell/"):
        if fnmatch(fileImg, '*.jpg'):
          img = cv2.imread("StrIntell/"+fileImg,0)
          binary = binary + "'" +fileImg.split(".")[0] + "'" + ":" + str(img.tolist()) + ","
          # cv2.imwrite("test.jpg", np.array(img.tolist()))
    binary = "charMap = {" + binary + "}" 
    with open("CharMap.py",'w+') as f: 
        f.write(binary)
          
```

`CharMap.py`字符变量

```python
charMap = {'1':[[255, 255, 254, 254, 255, 251, 254, 255, 254, 253, 254, 255, 255], [252, 254, 251, 255, 255, 254, 255, 255, 254, 253, 254, 255, 255], [255, 249, 255, 252, 248, 255, 250, 255, 252, 252, 253, 254, 254], [253, 255, 250, 255, 249, 255, 1, 0, 251, 252, 253, 253, 254], [253, 255, 250, 253, 5, 1, 3, 0, 253, 254, 254, 254, 253], [254, 251, 255, 253, 0, 0, 5, 2, 253, 255, 255, 254, 253], [254, 254, 250, 255, 252, 254, 2, 0, 251, 253, 255, 255, 254], [254, 250, 255, 255, 255, 254, 3, 5, 250, 252, 254, 254, 254], [255, 255, 248, 255, 249, 254, 2, 0, 255, 255, 255, 253, 255], [252, 255, 251, 255, 255, 253, 1, 0, 254, 255, 253, 254, 255], [255, 251, 254, 255, 250, 254, 2, 0, 255, 255, 252, 253, 251], [253, 255, 252, 253, 248, 253, 0, 6, 255, 251, 254, 252, 251], [255, 250, 255, 249, 255, 255, 0, 2, 250, 255, 253, 255, 254], [254, 255, 253, 255, 0, 0, 2, 1, 1, 2, 254, 251, 255], [254, 254, 247, 255, 0, 3, 3, 0, 3, 3, 254, 251, 254], [252, 253, 255, 252, 255, 255, 251, 255, 254, 254, 253, 255, 252], [255, 255, 255, 249, 255, 253, 255, 252, 255, 255, 252, 251, 254]],'2':[[249, 255, 251, 254, 255, 253, 253, 253, 255, 255, 252, 251, 255], [255, 253, 255, 251, 249, 255, 254, 255, 252, 253, 255, 255, 253], [253, 254, 252, 255, 254, 253, 255, 253, 253, 255, 250, 252, 255], [254, 255, 252, 2, 0, 3, 1, 0, 255, 255, 253, 254, 255], [254, 252, 5, 0, 2, 0, 3, 1, 3, 249, 253, 255, 254], [254, 255, 254, 249, 251, 251, 253, 253, 4, 1, 254, 255, 251], [255, 254, 251, 255, 251, 255, 255, 250, 0, 4, 253, 251, 254], [255, 250, 251, 252, 255, 246, 253, 254, 9, 2, 252, 255, 251], [248, 255, 253, 252, 255, 255, 255, 5, 0, 254, 253, 254, 255], [253, 255, 251, 255, 252, 0, 0, 0, 255, 251, 255, 251, 255], [255, 250, 252, 255, 1, 2, 255, 253, 250, 255, 252, 255, 250], [254, 253, 255, 0, 6, 255, 247, 255, 252, 255, 252, 251, 255], [254, 255, 2, 2, 0, 250, 255, 253, 251, 254, 253, 252, 255], [254, 254, 3, 2, 1, 1, 5, 1, 3, 1, 255, 253, 252], [252, 251, 1, 3, 0, 3, 0, 4, 7, 1, 252, 254, 255], [254, 255, 255, 255, 255, 255, 255, 253, 252, 255, 254, 255, 253], [252, 255, 255, 255, 253, 255, 251, 253, 255, 255, 251, 255, 254]],'3':[[255, 253, 253, 255, 255, 253, 251, 255, 254, 253, 255, 255, 250], [255, 253, 251, 255, 255, 254, 253, 249, 255, 254, 253, 255, 254], [253, 251, 255, 252, 252, 255, 254, 255, 255, 254, 253, 252, 253], [255, 253, 249, 253, 255, 0, 4, 0, 0, 0, 255, 255, 252], [254, 255, 255, 250, 3, 3, 0, 6, 4, 0, 0, 255, 254], [254, 255, 255, 253, 252, 255, 252, 252, 253, 3, 0, 254, 255], [255, 250, 255, 255, 252, 253, 255, 253, 253, 254, 0, 248, 255], [255, 255, 254, 254, 253, 253, 253, 252, 255, 0, 2, 253, 253], [254, 255, 253, 255, 255, 251, 0, 1, 0, 3, 253, 255, 253], [254, 250, 255, 255, 255, 255, 0, 5, 4, 0, 0, 252, 254], [255, 255, 254, 252, 255, 254, 254, 255, 255, 0, 3, 254, 253], [254, 250, 255, 254, 254, 254, 253, 250, 251, 255, 0, 255, 255], [255, 255, 253, 255, 255, 252, 253, 255, 255, 4, 3, 251, 251], [255, 255, 252, 254, 254, 4, 0, 1, 4, 0, 2, 255, 254], [254, 254, 255, 252, 254, 0, 0, 2, 5, 0, 255, 250, 254], [255, 255, 254, 254, 255, 254, 255, 254, 255, 253, 253, 252, 251], [255, 255, 255, 255, 255, 255, 254, 254, 252, 255, 253, 255, 254]],'b':[[254, 255, 255, 255, 254, 255, 253, 255, 255, 254, 255, 255, 253], [255, 252, 251, 253, 252, 255, 254, 252, 255, 255, 255, 252, 255], [253, 255, 255, 252, 255, 255, 252, 255, 255, 250, 255, 255, 255], [255, 253, 0, 1, 252, 252, 255, 252, 253, 255, 253, 254, 255], [255, 251, 4, 0, 255, 252, 255, 254, 255, 253, 255, 253, 251], [253, 255, 0, 5, 254, 254, 255, 253, 249, 250, 255, 255, 253], [253, 255, 4, 1, 3, 0, 1, 0, 9, 254, 250, 249, 255], [254, 253, 2, 1, 0, 3, 0, 5, 0, 1, 255, 249, 253], [253, 251, 4, 0, 4, 255, 255, 252, 1, 0, 3, 255, 252], [255, 255, 0, 4, 250, 249, 255, 255, 255, 0, 0, 254, 254], [252, 254, 0, 5, 254, 255, 252, 252, 255, 5, 0, 255, 255], [254, 253, 4, 0, 255, 251, 250, 255, 254, 1, 2, 255, 254], [254, 255, 0, 0, 2, 255, 254, 252, 3, 0, 1, 253, 255], [248, 253, 1, 4, 2, 0, 2, 4, 1, 0, 255, 253, 255], [255, 255, 4, 1, 253, 2, 4, 0, 13, 249, 254, 255, 252], [249, 255, 254, 251, 255, 253, 254, 253, 254, 255, 253, 255, 251], [255, 254, 255, 251, 255, 255, 253, 252, 252, 255, 255, 255, 255]],'c':[[254, 255, 255, 255, 255, 254, 254, 255, 255, 255, 254, 255, 253], [255, 255, 251, 254, 255, 255, 255, 255, 254, 255, 254, 254, 254], [255, 255, 255, 252, 255, 251, 254, 254, 255, 253, 255, 254, 255], [254, 251, 255, 255, 254, 255, 251, 254, 253, 255, 254, 254, 255], [255, 255, 252, 254, 255, 250, 255, 253, 255, 248, 255, 255, 255], [255, 255, 255, 252, 251, 255, 255, 251, 255, 254, 255, 255, 250], [249, 255, 255, 252, 7, 0, 0, 2, 0, 255, 251, 255, 255], [255, 252, 253, 7, 0, 3, 0, 0, 0, 255, 255, 254, 254], [254, 255, 1, 5, 2, 254, 254, 254, 255, 249, 255, 255, 254], [252, 255, 0, 6, 247, 255, 252, 255, 253, 254, 254, 254, 255], [255, 250, 0, 0, 255, 255, 252, 255, 254, 255, 251, 253, 255], [254, 252, 4, 1, 252, 255, 252, 250, 251, 254, 255, 255, 255], [250, 255, 0, 4, 0, 250, 254, 255, 255, 250, 255, 254, 249], [255, 255, 254, 0, 1, 0, 2, 0, 0, 252, 254, 255, 255], [254, 255, 252, 255, 3, 0, 0, 3, 2, 255, 252, 255, 255], [248, 255, 252, 253, 254, 255, 255, 255, 253, 255, 255, 255, 250], [255, 255, 254, 251, 255, 253, 252, 254, 255, 253, 255, 255, 254]],'m':[[254, 253, 255, 252, 255, 252, 255, 255, 255, 255, 253, 255, 255], [255, 255, 252, 255, 252, 255, 253, 254, 252, 255, 255, 252, 255], [255, 255, 255, 253, 255, 254, 254, 255, 253, 255, 254, 254, 255], [254, 253, 254, 255, 255, 254, 251, 253, 255, 255, 253, 255, 253], [254, 255, 255, 251, 254, 254, 253, 253, 253, 252, 254, 253, 255], [255, 250, 255, 255, 255, 255, 252, 255, 254, 254, 255, 255, 255], [255, 255, 0, 8, 253, 0, 7, 0, 5, 251, 250, 255, 254], [254, 255, 1, 0, 2, 9, 1, 1, 1, 4, 1, 255, 255], [255, 253, 6, 0, 1, 254, 255, 255, 3, 0, 1, 255, 252], [255, 251, 1, 0, 255, 255, 249, 254, 0, 3, 255, 250, 255], [254, 253, 2, 1, 252, 254, 252, 255, 3, 0, 255, 254, 252], [255, 255, 0, 1, 255, 252, 255, 253, 0, 7, 253, 249, 255], [254, 251, 4, 0, 250, 254, 255, 254, 2, 0, 255, 255, 252], [255, 255, 2, 3, 254, 255, 254, 255, 4, 0, 255, 253, 255], [254, 255, 0, 0, 255, 253, 253, 255, 1, 0, 255, 254, 248], [255, 254, 255, 255, 253, 255, 255, 255, 253, 255, 253, 255, 255], [255, 253, 251, 252, 254, 254, 254, 255, 254, 255, 255, 254, 254]],'n':[[254, 255, 253, 252, 255, 255, 252, 255, 254, 255, 253, 255, 255], [255, 253, 255, 255, 252, 252, 255, 255, 255, 255, 255, 255, 254], [255, 254, 255, 255, 254, 255, 250, 253, 251, 255, 255, 254, 255], [255, 255, 253, 255, 253, 255, 255, 255, 255, 254, 250, 255, 252], [254, 255, 255, 252, 255, 254, 254, 253, 251, 255, 254, 255, 255], [255, 254, 255, 253, 253, 255, 254, 255, 255, 254, 254, 252, 253], [254, 254, 7, 0, 255, 254, 0, 0, 0, 5, 254, 255, 251], [253, 255, 0, 1, 1, 0, 8, 0, 4, 0, 1, 252, 254], [254, 255, 0, 4, 2, 0, 251, 255, 245, 0, 1, 250, 254], [253, 254, 0, 2, 0, 255, 254, 252, 252, 1, 0, 255, 252], [252, 251, 5, 0, 253, 254, 255, 251, 255, 2, 1, 253, 255], [255, 250, 2, 6, 250, 255, 250, 255, 250, 0, 2, 255, 249], [247, 255, 0, 0, 254, 253, 255, 254, 255, 2, 0, 255, 255], [250, 255, 3, 1, 255, 255, 252, 255, 250, 6, 1, 254, 253], [255, 252, 3, 0, 255, 254, 251, 253, 254, 0, 0, 255, 255], [253, 255, 253, 255, 253, 255, 255, 255, 253, 255, 255, 251, 253], [255, 253, 251, 251, 254, 251, 255, 254, 254, 255, 252, 253, 255]],'v':[[255, 255, 254, 255, 253, 255, 252, 255, 255, 254, 255, 255, 253], [255, 255, 254, 255, 253, 251, 255, 255, 254, 255, 254, 252, 255], [255, 254, 255, 255, 255, 254, 255, 254, 253, 253, 255, 255, 254], [253, 255, 254, 252, 254, 255, 251, 255, 254, 255, 254, 254, 254], [255, 253, 255, 254, 255, 255, 254, 254, 255, 255, 254, 255, 255], [255, 255, 254, 248, 254, 250, 254, 255, 255, 250, 255, 252, 252], [252, 255, 252, 255, 254, 255, 252, 253, 255, 255, 1, 253, 253], [254, 255, 253, 253, 6, 0, 254, 250, 255, 0, 1, 255, 253], [253, 252, 255, 253, 1, 0, 255, 254, 251, 3, 0, 255, 252], [253, 252, 251, 255, 0, 3, 254, 251, 255, 3, 1, 252, 255], [255, 255, 254, 253, 255, 0, 0, 255, 0, 1, 255, 254, 251], [255, 251, 252, 251, 248, 1, 0, 4, 1, 2, 254, 254, 255], [255, 252, 254, 255, 255, 0, 3, 0, 3, 0, 255, 249, 253], [254, 254, 253, 255, 254, 254, 4, 0, 0, 255, 251, 255, 255], [255, 255, 255, 255, 255, 252, 2, 0, 1, 248, 255, 254, 248], [255, 253, 255, 254, 255, 255, 255, 252, 255, 255, 252, 252, 254], [255, 255, 254, 255, 255, 253, 255, 254, 254, 251, 255, 255, 252]],'x':[[255, 255, 255, 255, 253, 255, 253, 255, 255, 255, 255, 255, 254], [253, 255, 254, 255, 254, 255, 255, 255, 252, 255, 255, 251, 255], [255, 253, 255, 252, 255, 255, 250, 255, 255, 255, 255, 255, 252], [255, 254, 254, 253, 253, 255, 254, 255, 253, 253, 254, 254, 255], [254, 255, 253, 255, 254, 250, 252, 255, 255, 255, 253, 255, 255], [250, 255, 253, 252, 254, 255, 254, 254, 252, 255, 255, 251, 255], [255, 252, 0, 4, 254, 251, 255, 4, 2, 255, 250, 255, 253], [251, 252, 5, 0, 255, 254, 254, 0, 3, 255, 255, 251, 254], [255, 249, 255, 9, 0, 251, 14, 0, 255, 255, 254, 255, 255], [251, 255, 252, 253, 0, 4, 0, 255, 254, 253, 251, 251, 255], [252, 255, 254, 254, 5, 3, 5, 255, 248, 255, 255, 255, 255], [255, 252, 254, 252, 1, 4, 0, 255, 253, 255, 249, 251, 255], [254, 255, 252, 6, 1, 250, 1, 1, 255, 251, 255, 255, 253], [252, 255, 1, 0, 255, 255, 255, 3, 5, 251, 255, 252, 255], [255, 252, 4, 2, 254, 251, 253, 2, 0, 254, 255, 253, 253], [255, 251, 254, 255, 254, 255, 252, 255, 255, 255, 252, 254, 254], [255, 253, 252, 252, 253, 255, 253, 251, 255, 253, 254, 255, 251]],'z':[[255, 255, 255, 254, 255, 254, 255, 255, 255, 255, 255, 254, 255], [254, 254, 255, 255, 255, 254, 255, 253, 255, 255, 255, 254, 254], [255, 255, 252, 253, 252, 255, 255, 255, 255, 252, 255, 255, 255], [255, 255, 252, 255, 254, 248, 255, 250, 254, 255, 249, 255, 254], [255, 253, 255, 254, 255, 255, 255, 253, 253, 254, 254, 254, 254], [253, 253, 255, 252, 250, 250, 251, 253, 255, 254, 251, 255, 255], [255, 254, 0, 3, 6, 4, 9, 0, 0, 255, 252, 251, 254], [253, 253, 2, 0, 0, 3, 0, 1, 1, 250, 255, 253, 254], [253, 255, 254, 252, 255, 4, 0, 1, 255, 254, 251, 255, 255], [255, 255, 254, 253, 255, 2, 0, 254, 254, 252, 255, 253, 255], [253, 247, 255, 252, 4, 6, 252, 255, 255, 254, 255, 253, 252], [255, 255, 252, 9, 0, 254, 250, 250, 252, 254, 255, 255, 253], [255, 254, 0, 0, 5, 254, 255, 255, 255, 254, 253, 254, 251], [255, 252, 3, 4, 3, 0, 0, 1, 0, 254, 254, 254, 255], [248, 255, 3, 0, 2, 1, 1, 0, 1, 255, 252, 254, 255], [255, 250, 255, 254, 254, 255, 255, 255, 254, 253, 254, 255, 249], [252, 253, 255, 253, 254, 255, 252, 253, 255, 255, 255, 255, 255]],}
```
`Convert.py`转换为灰度图并降噪

```python
import cv2
import numpy as np

class Convert(object):
    """docstring for Convert"""
    def __init__(self):
        super(Convert, self).__init__()
    
    def _get_dynamic_binary_image(self,img):
        '''
        自适应阀值二值化
        '''
        img = cv2.imdecode(np.frombuffer(img, np.uint8), cv2.IMREAD_COLOR)
        img = cv2.cvtColor(img,cv2.COLOR_BGR2GRAY)
        th1 = cv2.adaptiveThreshold(img, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 21, 1)
        return th1

    def clear_border(self,img):
        '''去除边框
        '''
        h, w = img.shape[:2]
        for y in range(0, w):
            for x in range(0, h):
              # if y ==0 or y == w -1 or y == w - 2:
              if y < 4 or y > w -4:
                img[x, y] = 255
              # if x == 0 or x == h - 1 or x == h - 2:
              if x < 4 or x > h - 4:
                img[x, y] = 255
        return img

    def interference_line(self,img):
        '''
        干扰线降噪
        '''
        h, w = img.shape[:2]
        # ！！！opencv矩阵点是反的
        # img[1,2] 1:图片的高度，2：图片的宽度
        for y in range(1, w - 1):
            for x in range(1, h - 1):
              count = 0
              if img[x, y - 1] > 245:
                count = count + 1
              if img[x, y + 1] > 245:
                count = count + 1
              if img[x - 1, y] > 245:
                count = count + 1
              if img[x + 1, y] > 245:
                count = count + 1
              if count > 2:
                img[x, y] = 255
        return img

    def interference_point(self,img, x = 0, y = 0):
        """点降噪
        9邻域框,以当前点为中心的田字框,黑点个数
        :param x:
        :param y:
        :return:
        """
        # todo 判断图片的长宽度下限
        cur_pixel = img[x,y]# 当前像素点的值
        height,width = img.shape[:2]

        for y in range(0, width - 1):
          for x in range(0, height - 1):
            if y == 0:  # 第一行
                if x == 0:  # 左上顶点,4邻域
                    # 中心点旁边3个点
                    sum = int(cur_pixel) \
                          + int(img[x, y + 1]) \
                          + int(img[x + 1, y]) \
                          + int(img[x + 1, y + 1])
                    if sum <= 2 * 245:
                      img[x, y] = 0
                elif x == height - 1:  # 右上顶点
                    sum = int(cur_pixel) \
                          + int(img[x, y + 1]) \
                          + int(img[x - 1, y]) \
                          + int(img[x - 1, y + 1])
                    if sum <= 2 * 245:
                      img[x, y] = 0
                else:  # 最上非顶点,6邻域
                    sum = int(img[x - 1, y]) \
                          + int(img[x - 1, y + 1]) \
                          + int(cur_pixel) \
                          + int(img[x, y + 1]) \
                          + int(img[x + 1, y]) \
                          + int(img[x + 1, y + 1])
                    if sum <= 3 * 245:
                      img[x, y] = 0
            elif y == width - 1:  # 最下面一行
                if x == 0:  # 左下顶点
                    # 中心点旁边3个点
                    sum = int(cur_pixel) \
                          + int(img[x + 1, y]) \
                          + int(img[x + 1, y - 1]) \
                          + int(img[x, y - 1])
                    if sum <= 2 * 245:
                      img[x, y] = 0
                elif x == height - 1:  # 右下顶点
                    sum = int(cur_pixel) \
                          + int(img[x, y - 1]) \
                          + int(img[x - 1, y]) \
                          + int(img[x - 1, y - 1])

                    if sum <= 2 * 245:
                      img[x, y] = 0
                else:  # 最下非顶点,6邻域
                    sum = int(cur_pixel) \
                          + int(img[x - 1, y]) \
                          + int(img[x + 1, y]) \
                          + int(img[x, y - 1]) \
                          + int(img[x - 1, y - 1]) \
                          + int(img[x + 1, y - 1])
                    if sum <= 3 * 245:
                      img[x, y] = 0
            else:  # y不在边界
                if x == 0:  # 左边非顶点
                    sum = int(img[x, y - 1]) \
                          + int(cur_pixel) \
                          + int(img[x, y + 1]) \
                          + int(img[x + 1, y - 1]) \
                          + int(img[x + 1, y]) \
                          + int(img[x + 1, y + 1])

                    if sum <= 3 * 245:
                      img[x, y] = 0
                elif x == height - 1:  # 右边非顶点
                    sum = int(img[x, y - 1]) \
                          + int(cur_pixel) \
                          + int(img[x, y + 1]) \
                          + int(img[x - 1, y - 1]) \
                          + int(img[x - 1, y]) \
                          + int(img[x - 1, y + 1])

                    if sum <= 3 * 245:
                      img[x, y] = 0
                else:  # 具备9领域条件的
                    sum = int(img[x - 1, y - 1]) \
                          + int(img[x - 1, y]) \
                          + int(img[x - 1, y + 1]) \
                          + int(img[x, y - 1]) \
                          + int(cur_pixel) \
                          + int(img[x, y + 1]) \
                          + int(img[x + 1, y - 1]) \
                          + int(img[x + 1, y]) \
                          + int(img[x + 1, y + 1])
                    if sum <= 4 * 245:
                      img[x, y] = 0
        return img 

    def run(self,img):
        # 自适应阈值二值化
        img = self._get_dynamic_binary_image(img)
        # 去除边框
        img = self.clear_border(img)
        # 对图片进行干扰线降噪
        img = self.interference_line(img)
        # 对图片进行点降噪
        img = self.interference_point(img)
        return img
```

`ImgMain.py`识别代码

```python
#!/usr/bin/python 
# -*- coding: utf-8 -*-

from fnmatch import fnmatch
from queue import Queue
import matplotlib.pyplot as plt
import cv2
import time
import os
from Convert import Convert
from CharMap import charMap
import requests
import numpy as np



def cutting_img(im,im_position,xoffset = 1,yoffset = 1):
    # 识别出的字符个数
    im_number = len(im_position[1])
    if(im_number>=4): im_number = 4;

    imgArr = []
    # 切割字符
    for i in range(im_number):
        im_start_X = im_position[1][i][0] - xoffset
        im_end_X = im_position[1][i][1] + xoffset
        im_start_Y = im_position[2][i][0] - yoffset
        im_end_Y = im_position[2][i][1] + yoffset
        cropped = im[im_start_Y:im_end_Y, im_start_X:im_end_X]
        imgArr.append(cropped)
        # cv2.imwrite(str(i)+"v.jpg",cropped) # 查看切割效果
    return im_number,imgArr



def main():
    cvt = Convert()
    req = requests.get("http://xxxxxxxxxxxxxxxx/verifycode.servlet")   
    # 注意有些教务加装了所谓云防护，没有请求头会拦截，导致获取不了验证码图片，报错可以打印req.content看看
    img = cvt.run(req.content)
    cv2.imwrite("v.jpg",img) # 查看验证码

    #切割的位置
    im_position = ([8, 7, 6, 9], [[4, 12], [14, 21], [24, 30], [34, 43]], [[7, 16], [7, 16], [7, 16], [7, 16]])

    cutting_img_num,imgArr = cutting_img(img,im_position,1,1)

    # 识别验证码
    result=""
    for i in range(cutting_img_num):
        try:
          template = imgArr[i]
          tempResult=""
          matchingDegree=0.0
          for char in charMap:
            img = np.asarray(charMap[char],dtype = np.uint8)
            res = cv2.matchTemplate(img,template,3) #img原图 template模板   用模板匹配原图
            min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(res)
            if(max_val>matchingDegree):
              tempResult=char
              matchingDegree=max_val
          result += tempResult
          matchingDegree=0.0
        except Exception as err:
          raise Exception
          # print("ERROR "+ str(err))
          pass

    print(result)


if __name__ == '__main__':
  main()
```

提供全部代码
[https://github.com/WindrunnerMax/SWVerifyCode](https://github.com/WindrunnerMax/SWVerifyCode)
