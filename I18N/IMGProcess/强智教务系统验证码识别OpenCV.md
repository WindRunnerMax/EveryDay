# StrongWisdom Education System CAPTCHA Recognition with OpenCV

The character positions of the CAPTCHA in StrongWisdom Education System are relatively fixed and can be segmented effectively. By accurately identifying the segmentation positions and dividing it into four parts, it can be matched against a self-built library, achieving a recognition rate close to 100%. See the [Java, PHP, Python, JavaScript versions here](https://github.com/WindrunnerMax/SWVerifyCode).

First, use code to segment the CAPTCHA and select the well-segmented CAPTCHAs to create a comparison library. Since the `matchTemplate` function requires the image to be matched to be smaller than the library image, it is necessary to enlarge the boundaries of the library image.

Use the `TestImgCut.py` to segment the image and select the appropriate segmentation position.

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
  Manually binarize
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
  '''Use queues and sets to record the traversed pixel coordinates to solve the problem of excessively deep access during CFS instead of simple recursion.
  '''

  # print('**********')

  xaxis=[]
  yaxis=[]
  visited =set()
  q = Queue()
  q.put((x_fd, y_fd))
  visited.add((x_fd, y_fd))
  offsets=[(1, 0), (0, 1), (-1, 0), (0, -1)]#Four-neighborhood

  while not q.empty():
      x,y=q.get()

      for xoffset,yoffset in offsets:
          x_neighbor,y_neighbor = x+xoffset,y+yoffset

          if (x_neighbor,y_neighbor) in (visited):
              continue  # Already visited

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
```

```python
else:
    xmax = max(xaxis)
    xmin = min(xaxis)
    ymax = max(yaxis)
    ymin = min(yaxis)
    # ymin, ymax = sort(yaxis)

  return ymax, ymin, xmax, xmin


def detectFgPix(im, xmax):
    '''Search for the starting point of the block
    '''
    h, w = im.shape[:2]
    for y_fd in range(xmax + 1, w):
        for x_fd in range(h):
            if im[x_fd, y_fd] == 0:
                return x_fd, y_fd


def CFS(im):
    '''Cutting character positions
    '''
    zoneL = []  # List of lengths L for each block
    zoneWB = []  # X-axis [start, end] list for each block
    zoneHB = []  # Y-axis [start, end] list for each block

    xmax = 0  # The previous block ends with the x-coordinate of the black point, which is initialized here
    for i in range(10):
        try:
            x_fd, y_fd = detectFgPix(im, xmax)
            # print(y_fd,x_fd)
            xmax, xmin, ymax, ymin = cfs(im, x_fd, y_fd)
            L = xmax - xmin
            H = ymax - ymin
            zoneL.append(L)
            zoneWB.append([xmin, xmax])
            zoneHB.append([ymin, ymax])
        except TypeError:
            return zoneL, zoneWB, zoneHB
    return zoneL, zoneWB, zoneHB


def cutting_img(im, im_position, xoffset=1, yoffset=1):
    # Recognized number of characters
    im_number = len(im_position[1])
    if im_number >= 4:
        im_number = 4
    imgArr = []
    # Cut characters
    for i in range(im_number):
        im_start_X = im_position[1][i][0] - xoffset
        im_end_X = im_position[1][i][1] + xoffset
        im_start_Y = im_position[2][i][0] - yoffset
        im_end_Y = im_position[2][i][1] + yoffset
        cropped = im[im_start_Y:im_end_Y, im_start_X:im_end_X]
        imgArr.append(cropped)
        cv2.imwrite(str(i) + "v.jpg", cropped)  # View cutting effect
    return im_number, imgArr


def main():
    cvt = Convert()
    req = requests.get("http://XXXXXXXXXXXXXXXXXXX/verifycode.servlet")
    img = cvt.run(req.content)
    cv2.imwrite("v.jpg", img)

    # Cut positions
    im_position = CFS(img)  # Auto

    print(im_position)

    maxL = max(im_position[0])
    minL = min(im_position[0])
```

```python
# If there are connected characters, and if the length of a character is too long, it is considered a connected character and will be split from the middle
if maxL > minL + minL * 0.7:
    maxL_index = im_position[0].index(maxL)
    minL_index = im_position[0].index(minL)
    # Set the width of the character
    im_position[0][maxL_index] = maxL // 2
    im_position[0].insert(maxL_index + 1, maxL // 2)
    # Set the X-axis position of the character [start, end]
    im_position[1][maxL_index][1] = im_position[1][maxL_index][0] + maxL // 2
    im_position[1].insert(maxL_index + 1, [im_position[1][maxL_index][1] + 1, im_position[1][maxL_index][1] + 1 + maxL // 2])
    # Set the Y-axis position of the character [start, end]
    im_position[2].insert(maxL_index + 1, im_position[2][maxL_index])

# To cut the character, the parameters need to be configured for a good cut, usually 1 or 2 will suffice
cutting_img_num, imgArr = cutting_img(img, im_position, 1, 1)

# # Directly use the library to read the image and recognize the captcha
# result = ""
# for i in range(cutting_img_num):
#     try:
#         template = imgArr[i]
#         tempResult = ""
#         matchingDegree = 0.0
#         filedirWarehouse = '../../Warehouse/StrIntell/'
#         for fileImg in os.listdir(filedirWarehouse):
#             if fnmatch(fileImg, '*.jpg'):
#                 img = cv2.imread(filedirWarehouse + fileImg, 0)
#                 res = cv2.matchTemplate(img, template, 3)  # Match the template with the original image
#                 min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(res)
#                 if max_val > matchingDegree:
#                     tempResult = fileImg.split('.')[0]
#                     matchingDegree = max_val
#         result += tempResult
#         matchingDegree = 0.0
#     except Exception as err:
#         print("ERROR " + str(err))
#         pass
# print('切图：%s' % cutting_img_num)
# print('识别为：%s' % result)

if __name__ == '__main__':
    main()
```

`resize.py` Change the image boundaries

```python
import cv2
from fnmatch import fnmatch
import os

def main():
    filedir = './StrIntell'
    for file in os.listdir(filedir):
        if fnmatch(file, '*.jpg'):
            fileLoc = filedir + "/" + file
            img = cv2.imread(fileLoc)
            # img = cv2.copyMakeBorder(img, 10, 10, 10, 10, cv2.BORDER_CONSTANT, value=[255,255,255]) # Expand
            # img = img[0:25, 0:25] # Crop height * width
            print(img.shape)
            cv2.imwrite(fileLoc, img)

if __name__ == '__main__':
    main()
```

Choose a suitable library image and resize it
Use `TestImgCut.py` to directly read and identify the captcha from the library
Select the appropriate cropping positions based on effectiveness and save them
When you think the library files and cropping positions are suitable, convert the images to a `list` and save them in a variable
The main purpose of saving in a variable is to directly read it into memory, avoiding frequent disk reads that waste time.

`binary.py` Convert characters to variables

```python
import cv2
import os
from fnmatch import fnmatch
import numpy as np
np.set_printoptions(threshold=np.inf) # Do not omit output

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

`CharMap.py` Character variables

```python
charMap = {'1':[[255, 255, 254, 254, 255, 251, 254, 255, 254, 253, 254, 255, 255], [252, 254, 251, 255, 255, 254, 255, 255, 254, 253, 254, 255, 255], [255, 249, 255, 252, 248, 255, 250, 255, 252, 252, 253, 254, 254], [253, 255, 250, 255, 249, 255, 1, 0, 251, 252, 253, 253, 254], [253, 255, 250, 253, 5, 1, 3, 0, 253, 254, 254, 254, 253], [254, 251, 255, 253, 0, 0, 5, 2, 253, 255, 255, 254, 253], [254, 254, 250, 255, 252, 254, 2, 0, 251, 253, 255, 255, 254], [254, 250, 255, 255, 255, 254, 3, 5, 250, 252, 254, 254, 254], [255, 255, 248, 255, 249, 254, 2, 0, 255, 255, 255, 253, 255], [252, 255, 251, 255, 255, 253, 1, 0, 254, 255, 253, 254, 255], [255, 251, 254, 255, 250, 254, 2, 0, 255, 255, 252, 253, 251], [253, 255, 252, 253, 248, 253, 0, 6, 255, 251, 254, 252, 251], [255, 250, 255, 249, 255, 255, 0, 2, 250, 255, 253, 255, 254], [254, 255, 253, 255, 0, 0, 2, 1, 1, 2, 254, 251, 255], [254, 254, 247, 255, 0, 3, 3, 0, 3, 3, 254, 251, 254], [252, 253, 255, 252, 255, 255, 251, 255, 254, 254, 253, 255, 252], [255, 255, 255, 249, 255, 253, 255, 252, 255, 255, 252, 251, 254]],'2':[[249, 255, 251, 254, 255, 253, 253, 253, 255, 255, 252, 251, 255], [255, 253, 255, 251, 249, 255, 254, 255, 252, 253, 255, 255, 253], [253, 254, 252, 255, 254, 253, 255, 253, 253, 255, 250, 252, 255], [254, 255, 252, 2, 0, 3, 1, 0, 255, 255, 253, 254, 255], [254, 252, 5, 0, 2, 0, 3, 1, 3, 249, 253, 255, 254], [254, 255, 254, 249, 251, 251, 253, 253, 4, 1, 254, 255, 251], [255, 254, 251, 255, 251, 255, 255, 250, 0, 4, 253, 251, 254], [255, 250, 251, 252, 255, 246, 253, 254, 9, 2, 252, 255, 251], [248, 255, 253, 252, 255, 255, 255, 5, 0, 254, 253, 254, 255], [253, 255, 251, 255, 252, 0, 0, 0, 255, 251, 255, 251, 255], [255, 250, 252, 255, 1, 2, 255, 253, 250, 255, 252, 255, 250], [254, 253, 255, 0, 6, 255, 247, 255, 252, 255, 252, 251, 255], [254, 255, 2, 2, 0, 250, 255, 253, 251, 254, 253, 252, 255], [254, 254, 3, 2, 1, 1, 5, 1, 3, 1, 255, 253, 252], [252, 251, 1, 3, 0, 3, 0, 4, 7, 1, 252, 254, 255], [254, 255, 255, 255, 255, 255, 255, 253, 252, 255, 254, 255, 253], [252, 255, 255, 255, 253, 255, 251, 253, 255, 255, 251, 255, 254]],'3':[[255, 253, 253, 255, 255, 253, 251, 255, 254, 253, 255, 255, 250], [255, 253, 251, 255, 255, 254, 253, 249, 255, 254, 253, 255, 254], [253, 251, 255, 252, 252, 255, 254, 255, 255, 254, 253, 252, 253], [255, 253, 249, 253, 255, 0, 4, 0, 0, 0, 255, 255, 252], [254, 255, 255, 250, 3, 3, 0, 6, 4, 0, 0, 255, 254], [254, 255, 255, 253, 252, 255, 252, 252, 253, 3, 0, 254, 255], [255, 250, 255, 255, 252, 253, 255, 253, 253, 254, 0, 248, 255], [255, 255, 254, 254, 253, 253, 253, 252, 255, 0, 2, 253, 253], [254, 255, 253, 255, 255, 251, 0, 1, 0, 3, 253, 255, 253], [254, 250, 255, 255, 255, 255, 0, 5, 4, 0, 0, 252, 254], [255, 255, 254, 252, 255, 254, 254, 255, 255, 0, 3, 254, 253], [254, 250, 255, 254, 254, 254, 253, 250, 251, 255, 0, 255, 255], [255, 255, 253, 255, 255, 252, 253, 255, 255, 4, 3, 251, 251], [255, 255, 252, 254, 254, 4, 0, 1, 4, 0, 2, 255, 254], [254, 254, 255, 252, 254, 0, 0, 2, 5, 0, 255, 250, 254], [255, 255, 254, 254, 255, 254, 255, 254, 255, 253, 253, 252, 251], [255, 255, 255, 255, 255, 255, 254, 254, 252, 255, 253, 255, 254]],'b':[[254, 255, 255, 255, 254, 255, 253, 255, 255, 254, 255, 255, 253], [255, 252, 251, 253, 252, 255, 254, 252, 255, 255, 255, 252, 255], [253, 255, 255, 252, 255, 255, 252, 255, 255, 250, 255, 255, 255], [255, 253, 0, 1, 252, 252, 255, 252, 253, 255, 253, 254, 255], [255, 251, 4, 0, 255, 252, 255, 254, 255, 253, 255, 253, 251], [253, 255, 0, 5, 254, 254, 255, 253, 249, 250, 255, 255, 253], [253, 255, 4, 1, 3, 0, 1, 0, 9, 254, 250, 249, 255], [254, 253, 2, 1, 0, 3, 0, 5, 0, 1, 255, 249, 253], [253, 251, 4, 0, 4, 255, 255, 252, 1, 0, 3, 255, 252], [255, 255, 0, 4, 250, 249, 255, 255, 255, 0, 0, 254, 254], [252, 254, 0, 5, 254, 255, 252, 252, 255, 5, 0, 255, 255], [254, 253, 4, 0, 255, 251, 250, 255, 254, 1, 2, 255, 254], [254, 255, 0, 0, 2, 255, 254, 252, 3, 0, 1, 253, 255], [248, 253, 1, 4, 2, 0, 2, 4, 1, 0, 255, 253, 255], [255, 255, 4, 1, 253, 2, 4, 0, 13, 249, 254, 255, 252], [249, 255, 254, 251, 255, 253, 254, 253, 254, 255, 253, 255, 251], [255, 254, 255, 251, 255, 255, 253, 252, 252, 255, 255, 255, 255]],'c':[[254, 255, 255, 255, 255, 254, 254, 255, 255, 255, 254, 255, 253], [255, 255, 251, 254, 255, 255, 255, 255, 254, 255, 254, 254, 254], [255, 255, 255, 252, 255, 251, 254, 254, 255, 253, 255, 254, 255], [254, 251, 255, 255, 254, 255, 251, 254, 253, 255, 254, 254, 255], [255, 255, 252, 254, 255, 250, 255, 253, 255, 248, 255, 255, 255], [255, 255, 255, 252, 251, 255, 255, 251, 255, 254, 255, 255, 250], [249, 255, 255, 252, 7, 0, 0, 2, 0, 255, 251, 255, 255], [255, 252, 253, 7, 0, 3, 0, 0, 0, 255, 255, 254, 254], [254, 255, 1, 5, 2, 254, 254, 254, 255, 249, 255, 255, 254], [252, 255, 0, 6, 247, 255, 252, 255, 253, 254, 254, 254, 255], [255, 250, 0, 0, 255, 255, 252, 255, 254, 255, 251, 253, 255], [254, 252, 4, 1, 252, 255, 252, 250, 251, 254, 255, 255, 255], [250, 255, 0, 4, 0, 250, 254, 255, 255, 250, 255, 254, 249], [255, 255, 254, 0, 1, 0, 2, 0, 0, 252, 254, 255, 255], [254, 255, 252, 255, 3, 0, 0, 3, 2, 255, 252, 255, 255], [248, 255, 252, 253, 254, 255, 255, 255, 253, 255, 255, 255, 250], [255, 255, 254, 251, 255, 253, 252, 254, 255, 253, 255, 255, 254]],'m':[[254, 253, 255, 252, 255, 252, 255, 255, 255, 255, 253, 255, 255], [255, 255, 252, 255, 252, 255, 253, 254, 252, 255, 255, 252, 255], [255, 255, 255, 253, 255, 254, 254, 255, 253, 255, 254, 254, 255], [254, 253, 254, 255, 255, 254, 251, 253, 255, 255, 253, 255, 253], [254, 255, 255, 251, 254, 254, 253, 253, 253, 252, 254, 253, 255], [255, 250, 255, 255, 255, 255, 252, 255, 254, 254, 255, 255, 255], [255, 255, 0, 8, 253, 0, 7, 0, 5, 251, 250, 255, 254], [254, 255, 1, 0, 2, 9, 1, 1, 1, 4, 1, 255, 255], [255, 253, 6, 0, 1, 254, 255, 255, 3, 0, 1, 255, 252], [255, 251, 1, 0, 255, 255, 249, 254, 0, 3, 255, 250, 255], [254, 253, 2, 1, 252, 254, 252, 255, 3, 0, 255, 254, 252], [255, 255, 0, 1, 255, 252, 255, 253, 0, 7, 253, 249, 255], [254, 251, 4, 0, 250, 254, 255, 254, 2, 0, 255, 255, 252], [255, 255, 2, 3, 254, 255, 254, 255, 4, 0, 255, 253, 255], [254, 255, 0, 0, 255, 253, 253, 255, 1, 0, 255, 254, 248], [255, 254, 255, 255, 253, 255, 255, 255, 253, 255, 253, 255, 255], [255, 253, 251, 252, 254, 254, 254, 255, 254, 255, 255, 254, 254]],'n':[[254, 255, 253, 252, 255, 255, 252, 255, 254, 255, 253, 255, 255], [255, 253, 255, 255, 252, 252, 255, 255, 255, 255, 255, 255, 254], [255, 254, 255, 255, 

```python
import cv2
import numpy as np

class Convert(object):
    """docstring for Convert"""
    def __init__(self):
        super(Convert, self).__init__()
    
    def _get_dynamic_binary_image(self,img):
        '''
        Adaptive threshold binarization
        '''
        img = cv2.imdecode(np.frombuffer(img, np.uint8), cv2.IMREAD_COLOR)
        img = cv2.cvtColor(img,cv2.COLOR_BGR2GRAY)
        th1 = cv2.adaptiveThreshold(img, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 21, 1)
        return th1

    def clear_border(self,img):
        '''Remove border
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
        Interference line denoising
        '''
        h, w = img.shape[:2]
        # ！！！opencv matrix points are reversed
        # img[1,2] 1: image height, 2: image width
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
```

```python
def interference_point(self, img, x=0, y=0):
    """Point noise reduction
    9-neighborhood box, the number of black points in the cross box with the current point as the center
    :param x:
    :param y:
    :return:
    """
    # todo Determine the lower limit of the length and width of the image
    cur_pixel = img[x, y]  # The value of the current pixel point
    height, width = img.shape[:2]
```

```python
for y in range(0, width - 1):
    for x in range(0, height - 1):
        if y == 0:  # First row
            if x == 0:  # Top left corner, 4-neighborhood
                # 3 points next to the central point
                total = int(cur_pixel) \
                      + int(img[x, y + 1]) \
                      + int(img[x + 1, y]) \
                      + int(img[x + 1, y + 1])
                if total <= 2 * 245:
                    img[x, y] = 0
            elif x == height - 1:  # Top right corner
                total = int(cur_pixel) \
                      + int(img[x, y + 1]) \
                      + int(img[x - 1, y]) \
                      + int(img[x - 1, y + 1])
                if total <= 2 * 245:
                    img[x, y] = 0
            else:  # Top non-corner, 6-neighborhood
                total = int(img[x - 1, y]) \
                      + int(img[x - 1, y + 1]) \
                      + int(cur_pixel) \
                      + int(img[x, y + 1]) \
                      + int(img[x + 1, y]) \
                      + int(img[x + 1, y + 1])
                if total <= 3 * 245:
                    img[x, y] = 0
        elif y == width - 1:  # Last row
            if x == 0:  # Bottom left corner
                # 3 points next to the central point
                total = int(cur_pixel) \
                      + int(img[x + 1, y]) \
                      + int(img[x + 1, y - 1]) \
                      + int(img[x, y - 1])
                if total <= 2 * 245:
                    img[x, y] = 0
            elif x == height - 1:  # Bottom right corner
                total = int(cur_pixel) \
                      + int(img[x, y - 1]) \
                      + int(img[x - 1, y]) \
                      + int(img[x - 1, y - 1])
```

```python
if sum <= 2 * 245:
  img[x, y] = 0
else:  # Not the bottom and top vertices, 6-neighborhood
    sum = int(cur_pixel) \
          + int(img[x - 1, y]) \
          + int(img[x + 1, y]) \
          + int(img[x, y - 1]) \
          + int(img[x - 1, y - 1]) \
          + int(img[x + 1, y - 1])
    if sum <= 3 * 245:
      img[x, y] = 0
else:  # y is not at the edge
    if x == 0:  # Not the left vertex
        sum = int(img[x, y - 1]) \
              + int(cur_pixel) \
              + int(img[x, y + 1]) \
              + int(img[x + 1, y - 1]) \
              + int(img[x + 1, y]) \
              + int(img[x + 1, y + 1])

        if sum <= 3 * 245:
          img[x, y] = 0
    elif x == height - 1:  # Not the right vertex
        sum = int(img[x, y - 1]) \
              + int(cur_pixel) \
              + int(img[x, y + 1]) \
              + int(img[x - 1, y - 1]) \
              + int(img[x - 1, y]) \
              + int(img[x - 1, y + 1])
```

```python
if sum <= 3 * 245:
    img[x, y] = 0
else:  # Meets 9-field conditions
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

def run(self, img):
    # Adaptive threshold binarization
    img = self._get_dynamic_binary_image(img)
    # Remove border
    img = self.clear_border(img)
    # Denoise interference lines in images
    img = self.interference_line(img)
    # Denoise interference points in images
    img = self.interference_point(img)
    return img
```

`ImgMain.py` Recognition Code

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

def cutting_img(im, im_position, xoffset=1, yoffset=1):
    # Number of recognized characters
    im_number = len(im_position[1])
    if im_number >= 4:
        im_number = 4;
```

```python
imgArr = []
# Cut characters
for i in range(im_number):
    im_start_X = im_position[1][i][0] - xoffset
    im_end_X = im_position[1][i][1] + xoffset
    im_start_Y = im_position[2][i][0] - yoffset
    im_end_Y = im_position[2][i][1] + yoffset
    cropped = im[im_start_Y:im_end_Y, im_start_X:im_end_X]
    imgArr.append(cropped)
    # cv2.imwrite(str(i)+"v.jpg",cropped) # Check the cutting effect
return im_number,imgArr

def main():
    cvt = Convert()
    req = requests.get("http://xxxxxxxxxxxxxxxx/verifycode.servlet")   
    # Please note that some educational institutions have installed so-called cloud protection. Without a request header, the request will be intercepted, making it impossible to obtain the verification code image. You can print req.content to see the error message
    img = cvt.run(req.content)
    cv2.imwrite("v.jpg",img) # Check the verification code

    # Position for cutting
    im_position = ([8, 7, 6, 9], [[4, 12], [14, 21], [24, 30], [34, 43]], [[7, 16], [7, 16], [7, 16], [7, 16]])

    cutting_img_num,imgArr = cutting_img(img,im_position,1,1)

    # Identify the verification code
    result=""
    for i in range(cutting_img_num):
        try:
          template = imgArr[i]
          tempResult=""
          matchingDegree=0.0
          for char in charMap:
            img = np.asarray(charMap[char],dtype = np.uint8)
            res = cv2.matchTemplate(img,template,3) #img original image, template template, matching the template to the original image
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

Complete code available at:
[https://github.com/WindrunnerMax/SWVerifyCode](https://github.com/WindrunnerMax/SWVerifyCode)