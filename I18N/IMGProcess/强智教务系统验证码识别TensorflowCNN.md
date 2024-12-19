# StrongWisdom Academic Affairs System Verification Code Recognition Tensorflow CNN

> We have always used the API to obtain data, but the data provided by the API is limited. In order to prevent the API from being closed, let's solve the verification code problem first.  
> We used Tensorflow to train the model. The verification code of the StrongWisdom Academic Affairs System is relatively simple. It can be recognized quite well without using CNN. Using CNN is also a way to review CNN.  
> The training set has 3109 images, the test set has 128 images, trained 1600 times, the accuracy rate (ACC) is 99%, and the actual test accuracy rate is about 98%.  
> Code and model: https://github.com/WindrunnerMax/SWVerifyCode

##### Directory Structure

![](screenshots/2023-04-14-20-32-27.jpg)

##### Preparation
First, you need to manually enter the verification code after obtaining it automatically and creating the folders in the directory manually in PowerShell.  
The introduction of `Convert` is for image processing, binarization, and noise reduction.  
Manually input over 200 verification codes, and then start training. Set a relatively low stop condition for training at 50% ACC.  
After obtaining a certain accuracy model, automatically obtain the training set, train again, and repeat the process to improve accuracy.  
I repeated the above process three times, and in the last iteration, I took a break and obtained a training set of approximately 3000 images.

`GetImg.py` - Manually input the verification code

```python
import requests
import cv2
import numpy as np
import sys
from Convert import Convert

class GetImg(object):
    """docstring for GetImg"""
    def __init__(self):
        super(GetImg, self).__init__()
    
    def run(self):
        count = 1
        cvt = Convert()
        while True:
            print("Image",count)
            req = requests.get("http://xxxxxx/verifycode.servlet")
            with open("pv.jpg",'wb') as fb: 
                fb.write(req.content)
            img = cvt.run(req.content)
            cv2.imwrite("v.jpg",img)
            mark = input()
            if mark == "" : continue;
            count += 1
            cv2.imwrite("TrainImg/%s.jpg" % (mark),img)

if __name__ == '__main__':
    GetImg().run()
```

`Convert.py` - Preprocess images

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
        '''Remove the border
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
        # OpenCV matrix points are inverted
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
        9-neighborhood frame, the cross frame centered on the current point, and the number of black points
        :param x:
        :param y:
        :return:
        """
        # todo Determine the minimum width and height of the image
        cur_pixel = img[x, y]  # Value of the current pixel
        height, width = img.shape[:2]

        for y in range(0, width - 1):
            for x in range(0, height - 1):
                if y == 0:  # First row
                    if x == 0:  # Upper left corner, 4 neighbors
                        # 3 points next to the center point
                        sum = int(cur_pixel) \
                              + int(img[x, y + 1]) \
                              + int(img[x + 1, y]) \
                              + int(img[x + 1, y + 1])
                        if sum <= 2 * 245:
                            img[x, y] = 0
                    elif x == height - 1:  # Upper right corner
                        sum = int(cur_pixel) \
                              + int(img[x, y + 1]) \
                              + int(img[x - 1, y]) \
                              + int(img[x - 1, y + 1])
                        if sum <= 2 * 245:
                            img[x, y] = 0
                    else:  # Upper non-corner, 6 neighbors
                        sum = int(img[x - 1, y]) \
                              + int(img[x - 1, y + 1]) \
                              + int(cur_pixel) \
                              + int(img[x, y + 1]) \
                              + int(img[x + 1, y]) \
                              + int(img[x + 1, y + 1])
                        if sum <= 3 * 245:
                            img[x, y] = 0
                elif y == width - 1:  # Bottom row
                    if x == 0:  # Bottom left corner
                        sum = int(cur_pixel) \
                              + int(img[x + 1, y]) \
                              + int(img[x + 1, y - 1]) \
                              + int(img[x, y - 1])
                        if sum <= 2 * 245:
                            img[x, y] = 0
                    elif x == height - 1:  # Bottom right corner
                        sum = int(cur_pixel) \
                              + int(img[x, y - 1]) \
                              + int(img[x - 1, y]) \
                              + int(img[x - 1, y - 1])
                        if sum <= 2 * 245:
                            img[x, y] = 0
                    else:  # Bottom non-corner, 6 neighbors
                        sum = int(cur_pixel) \
                              + int(img[x - 1, y]) \
                              + int(img[x + 1, y]) \
                              + int(img[x, y - 1]) \
                              + int(img[x - 1, y - 1]) \
                              + int(img[x + 1, y - 1])
                        if sum <= 3 * 245:
                            img[x, y] = 0
                else:  # y is not on the edge
                    if x == 0:  # Left non-corner
                        sum = int(img[x, y - 1]) \
                              + int(cur_pixel) \
                              + int(img[x, y + 1]) \
                              + int(img[x + 1, y - 1]) \
                              + int(img[x + 1, y]) \
                              + int(img[x + 1, y + 1])
```

```python
if sum <= 3 * 245:
  img[x, y] = 0
elif x == height - 1:  # Not the top right
    sum = int(img[x, y - 1]) \
          + int(cur_pixel) \
          + int(img[x, y + 1]) \
          + int(img[x - 1, y - 1]) \
          + int(img[x - 1, y]) \
          + int(img[x - 1, y + 1])

    if sum <= 3 * 245:
      img[x, y] = 0
else:  # with 9-neighborhood condition
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
    # Adaptive threshold binarization
    img = self._get_dynamic_binary_image(img)
    # Remove border
    img = self.clear_border(img)
    # Denoise interference line
    img = self.interference_line(img)
    # Denoise interference point
    img = self.interference_point(img)
    return img
```

##### Training
Our smart captcha contains only the characters `['1', '2', '3', 'b', 'c', 'm', 'n', 'v', 'x', 'z']`
The image size is `22 * 62`
The learning rate is set to `0.01`
keep_prob is `0.75`
The specific definition of CNN is given in the comments in the method `crack_captcha_cnn`
Based on repetitive training, estimate how many times the training will converge with a learning rate of `0.01` and what ACC can be achieved. Here, we set the training to stop when ACC is greater than 99%

`CNNTrain.py` training
```python
#!/usr/bin/python 
# -*- coding: utf-8 -*-

# Build CNN, train classifier

```python
import numpy as np
import tensorflow as tf
import cv2
import os
import random
import time

# number
number = ['1', '2', '3', 'b', 'c', 'm', 'n', 'v', 'x', 'z']

# Image size
IMAGE_HEIGHT = 22  # 80
IMAGE_WIDTH = 62  # 160
MAX_CAPTCHA = 4

char_set = number
CHAR_SET_LEN = len(char_set)  #10

image_filename_list = []
total = 0

train_path = "TrainImg/"
valid_path = "TestImg/"
model_path = "model/"


def get_image_file_name(imgFilePath):
    fileName = []
    total = 0
    for filePath in os.listdir(imgFilePath):
        captcha_name = filePath.split('/')[-1]
        fileName.append(captcha_name)
        total += 1
    random.seed(time.time())
    # Shuffle
    random.shuffle(fileName)
    return fileName, total


# Get a list of training data names
image_filename_list, total = get_image_file_name(train_path)
# Get a list of test data names
image_filename_list_valid, total = get_image_file_name(valid_path)


# Read images and labels
def gen_captcha_text_and_image(imageFilePath, image_filename_list, imageAmount):
    num = random.randint(0, imageAmount - 1)
    img = cv2.imread(os.path.join(imageFilePath, image_filename_list[num]), 0)
    img = cv2.resize(img, (IMAGE_WIDTH, IMAGE_HEIGHT))
    img = np.float32(img)
    text = image_filename_list[num].split('.')[0]
    return text, img


# Text to vector
# For example, if the captcha is '0296', the corresponding label is
# [1 0 0 0 0 0 0 0 0 0
#  0 0 1 0 0 0 0 0 0 0
#  0 0 0 0 0 0 0 0 0 1
#  0 0 0 0 0 0 1 0 0 0]
def text2vec(text):
    text_len = len(text)
    if text_len > MAX_CAPTCHA:
        raise ValueError('The captcha should not exceed 4 characters')

    vector = np.zeros(MAX_CAPTCHA * CHAR_SET_LEN)

    def char2pos(c):
        for index, item in enumerate(char_set):
            if c == item:
                return index
        raise ValueError('The character ' + c + ' does not exist in the character set')

    for i, c in enumerate(text):
        idx = i * CHAR_SET_LEN + char2pos(c)
        vector[idx] = 1
    return vector


# Vector to text
def vec2text(vec):
    char_pos = vec.nonzero()[0]
    text = []
    for c in char_pos:
        text.append(char_set[c % CHAR_SET_LEN])
    return ''.join(text)


# Generate a training batch
def get_next_batch(imageFilePath, image_filename_list=None, batch_size=128):
    batch_x = np.zeros([batch_size, IMAGE_HEIGHT * IMAGE_WIDTH])
    batch_y = np.zeros([batch_size, MAX_CAPTCHA * CHAR_SET_LEN])

    def wrap_gen_captcha_text_and_image(imageFilePath, imageAmount):
        while True:
            text, image = gen_captcha_text_and_image(imageFilePath, image_filename_list, imageAmount)
            if image.shape == (IMAGE_HEIGHT, IMAGE_WIDTH):
                return text, image

    for listNum in os.walk(imageFilePath):
        pass
    imageAmount = len(listNum[2])

    for i in range(batch_size):
        text, image = wrap_gen_captcha_text_and_image(imageFilePath, imageAmount)

        batch_x[i, :] = image.flatten() / 255
        batch_y[i, :] = text2vec(text)

    return batch_x, batch_y


####################################################################
# Placeholders, X and Y are the input training data and their labels, and the label is converted to an 8*10 vector
X = tf.placeholder(tf.float32, [None, IMAGE_HEIGHT * IMAGE_WIDTH])
Y = tf.placeholder(tf.float32, [None, MAX_CAPTCHA * CHAR_SET_LEN])
# Declare the dropout placeholder variable
keep_prob = tf.placeholder(tf.float32)  # dropout


# Define CNN
def crack_captcha_cnn(w_alpha=0.01, b_alpha=0.1):
    # Reshape X to the format of IMAGE_HEIGHT*IMAGE_WIDTH*1, the input is grayscale image, so the number of channels is 1;
    # The -1 in shape means that the number is not fixed, it is obtained according to the actual situation, which is the size of the number of images entered in each round of iteration (batch size);
    x = tf.reshape(X, shape=[-1, IMAGE_HEIGHT, IMAGE_WIDTH, 1])
    

# Build the first convolutional layer
# The shape [3, 3, 1, 32] indicates the patch size of the convolutional kernel in the first two parameters;
# the third parameter represents the number of image channels, and the fourth parameter represents the number of convolutional kernels in that layer, which will output as many convolutional feature images as there are convolutional kernels
w_c1 = tf.Variable(w_alpha * tf.random_normal([3, 3, 1, 32]))
# Each convolutional kernel has a bias value. There should be as many bias values as there are outputs in that layer
b_c1 = tf.Variable(b_alpha * tf.random_normal([32]))
# The image is convolved with the convolutional kernel and added with the bias value, yielding a convolutional result of 28x28x32
# The tf.nn.conv2d() function is used to perform the convolution operation
# The padding parameter in tf.nn.conv2d() is used to set how the convolution operation treats edge pixels. TensorFlow has two modes: VALID and SAME
# With 'SAME' padding, the image edges are padded with zeros to complete the convolution operation on all pixels in the image (especially edge pixels)
# With 'VALID' padding, pixels at the edges of the image that are not sufficient for convolution are simply discarded
# The strides parameter determines the step size of the convolution in each dimension of the image. It is a one-dimensional vector with a length of 4, and strides[0]=strides[3]=1
# The tf.nn.bias_add() function adds the bias term b_c1 to the convolutional result value
# It's important to note that the bias term b_c1 must be one-dimensional and the quantity must match the number of the last dimension of the convolutional result value
# The tf.nn.relu() function is the ReLU activation function, which achieves the non-linear transformation of the output result, i.e., features=max(features, 0). The shape of the output tensor is consistent with the input
conv1 = tf.nn.relu(tf.nn.bias_add(tf.nn.conv2d(x, w_c1, strides=[1, 1, 1, 1], padding='SAME'), b_c1))
# The tf.nn.max_pool() function is used to perform max pooling, further extracting abstract features from the image and reducing the feature dimension
# With ksize=[1, 2, 2, 1], the operation defines a 2x2 max pooling kernel, resulting in a pooling result of 14x14x32 by multiplying the convolutional result by the pooling convolutional kernel
conv1 = tf.nn.max_pool(conv1, ksize=[1, 2, 2, 1], strides=[1, 2, 2, 1], padding='SAME')
# The tf.nn.dropout() function is used in TensorFlow to prevent or alleviate overfitting, and is generally used in fully connected layers
# The dropout mechanism involves randomly dropping (masking) a portion of neurons with a certain probability (which can be set, but typically recommended to be 0.5) in different training processes, excluding them from the current neural network iteration calculation (optimization) process. The weights are retained but not updated
# The keep_prob parameter in tf.nn.dropout() is used to set the probability and should be a placeholder variable with a specific value given during execution
conv1 = tf.nn.dropout(conv1, keep_prob)
# With the original image size of HEIGHT=22 and WIDTH=62, after passing through the first layer of convolution in the neural network (image size remains the same, features x 32), and pooling (image size reduced by half, features remain the same);
# the output size will be 11x31x32

# Building the second convolutional layer
w_c2 = tf.Variable(w_alpha * tf.random_normal([3, 3, 32, 64]))
b_c2 = tf.Variable(b_alpha * tf.random_normal([64]))
conv2 = tf.nn.relu(tf.nn.bias_add(tf.nn.conv2d(conv1, w_c2, strides=[1, 1, 1, 1], padding='SAME'), b_c2))
conv2 = tf.nn.max_pool(conv2, ksize=[1, 2, 2, 1], strides=[1, 2, 2, 1], padding='SAME')
conv2 = tf.nn.dropout(conv2, keep_prob)
# After the second layer of neural network computation, the output is 6*16*64 (30*80 image is convoluted by a 2*2 convolution kernel with SAME padding, and the output dimension is 6*16)

# Building the third convolutional layer
w_c3 = tf.Variable(w_alpha * tf.random_normal([3, 3, 64, 64]))
b_c3 = tf.Variable(b_alpha * tf.random_normal([64]))
conv3 = tf.nn.relu(tf.nn.bias_add(tf.nn.conv2d(conv2, w_c3, strides=[1, 1, 1, 1], padding='SAME'), b_c3))
conv3 = tf.nn.max_pool(conv3, ksize=[1, 2, 2, 1], strides=[1, 2, 2, 1], padding='SAME')
conv3 = tf.nn.dropout(conv3, keep_prob)
# The original image has HEIGHT = 22 and WIDTH = 62. After the first layer of the neural network, the output size is 11*31*32. After the second layer of the neural network, the output is 6*16*64; after the third layer, the output is 3*8*64, this parameter is very important and determines the dimensions of the subsequent fully connected layers.

# print(conv3)
# Building the fully connected layer
# It's a 2D tensor, the first argument is a patch of 3*8*64, this parameter is determined by the output of the last convolutional layer, and the second argument represents the number of convolutions, a total of 1024, that is, the output is 1024 features.
w_d = tf.Variable(w_alpha * tf.random_normal([3 * 8 * 64, 1024]))
# The bias term is 1D, the number is consistent with the number of convolution kernels
b_d = tf.Variable(b_alpha * tf.random_normal([1024]))
# w_d.get_shape() function converts the shape of tensor w_d into a tuple form, w_d.get_shape().as_list() converts w_d into a list form after converting it to a tuple
# The shape of w_d is [ 8 * 20 * 64, 1024]. w_d.get_shape().as_list() results in 8*20*64=10240;
# So the purpose of tf.reshape(conv3, [-1, w_d.get_shape().as_list()[0]]) is to convert the output of the last hidden layer into a one-dimensional form
dense = tf.reshape(conv3, [-1, w_d.get_shape().as_list()[0]])
# The tf.matmul(dense, w_d) function is matrix multiplication, and the output dimension is -1*1024
dense = tf.nn.relu(tf.add(tf.matmul(dense, w_d), b_d))
dense = tf.nn.dropout(dense, keep_prob)
# After the fully connected layer, the output is one-dimensional, with 1024 vectors

# Define w_out as a shape of [1024, 8 * 10] = [1024, 80]
w_out = tf.Variable(w_alpha * tf.random_normal([1024, MAX_CAPTCHA * CHAR_SET_LEN]))
b_out = tf.Variable(b_alpha * tf.random_normal([MAX_CAPTCHA * CHAR_SET_LEN]))
# The output of out is an 8*10 vector, where 8 represents the number of recognition results, and 10 is the possible results for each position (0 to 9)
out = tf.add(tf.matmul(dense, w_out), b_out)
# out = tf.nn.softmax(out)
# Output the predicted value of the neural network under the current parameters
return out


# Training
def train_crack_captcha_cnn():
    output = crack_captcha_cnn()
    # loss
    # loss = tf.reduce_mean(tf.nn.softmax_cross_entropy_with_logits(output, Y))
    # The tf.nn.sigmoid_cross_entropy_with_logits() function calculates the cross-entropy, and outputs a vector rather than a number;
    # Cross-entropy measures the distance between the actual output (probability) and the expected output (probability). The smaller the cross-entropy value, the closer the two probability distributions are.
    # The tf.reduce_mean() function calculates the mean value of the matrix
    loss = tf.reduce_mean(tf.nn.sigmoid_cross_entropy_with_logits(logits=output, labels=Y))
    # The optimizer is used to accelerate training. The learning_rate should start large and then gradually decrease
    # The tf.train.AdamOptimizer() function implements the Adam algorithm optimizer
    optimizer = tf.train.AdamOptimizer(learning_rate=0.001).minimize(loss)

    predict = tf.reshape(output, [-1, MAX_CAPTCHA, CHAR_SET_LEN])
    max_idx_p = tf.argmax(predict, 2)
    max_idx_l = tf.argmax(tf.reshape(Y, [-1, MAX_CAPTCHA, CHAR_SET_LEN]), 2)
    correct_pred = tf.equal(max_idx_p, max_idx_l)
    accuracy = tf.reduce_mean(tf.cast(correct_pred, tf.float32))
    saver = tf.train.Saver()
    with tf.Session() as sess:
        sess.run(tf.global_variables_initializer())
        step = 0
        while True:
            batch_x, batch_y = get_next_batch(train_path, image_filename_list, 64)
            _, loss_ = sess.run([optimizer, loss], feed_dict={X: batch_x, Y: batch_y, keep_prob: 0.75})
            print(step, loss_)
            # Calculate the accuracy every 100 steps
            if step % 100 == 0:
                batch_x_test, batch_y_test = get_next_batch(valid_path, image_filename_list_valid, 128)
                acc = sess.run(accuracy, feed_dict={X: batch_x_test, Y: batch_y_test, keep_prob: 1.})
                print("Predict: " + str(step) + " " + str(acc))

                # Training end condition
                if acc > 0.99 or step > 3000:
                    saver.save(sess, model_path, global_step=step)
                    break
            step += 1


def predict_captcha(captcha_image):
    output = crack_captcha_cnn()

    saver = tf.train.Saver()
    with tf.Session() as sess:
        saver.restore(sess, tf.train.latest_checkpoint('.'))

        predict = tf.argmax(tf.reshape(output, [-1, MAX_CAPTCHA, CHAR_SET_LEN]), 2)
        text_list = sess.run(predict, feed_dict={X: [captcha_image], keep_prob: 1})

        text = text_list[0].tolist()
        vector = np.zeros(MAX_CAPTCHA * CHAR_SET_LEN)
        i = 0
        for n in text:
            vector[i * CHAR_SET_LEN + n] = 1
            i += 1
        return vec2text(vector)

if __name__ == '__main__':
    train_crack_captcha_cnn()
    print ("FINISH")
    # print(vec2text(text2vec("123z")))

##### Test set accuracy
With 3109 images in the training set, 128 images in the test set, and 1600 training iterations, the test set accuracy is approximately 96%.
```

Testing the dataset with `Spot.py`

```python
import numpy as np
import tensorflow as tf
import cv2
import os
import random
import time
import sys
 
# number
number = ['1', '2', '3', 'b', 'c', 'm', 'n', 'v', 'x', 'z']
 
# image size
IMAGE_HEIGHT = 22  # 80
IMAGE_WIDTH = 62  # 160
MAX_CAPTCHA = 4
 
char_set = number
CHAR_SET_LEN = len(char_set)  #10
valid_path = "TestImg/"
model_path = "model/"
 
 
X = tf.placeholder(tf.float32, [None, IMAGE_HEIGHT * IMAGE_WIDTH])
Y = tf.placeholder(tf.float32, [None, MAX_CAPTCHA * CHAR_SET_LEN])
keep_prob = tf.placeholder(tf.float32)  # dropout
 
 
# Define CNN
def crack_captcha_cnn(w_alpha=0.01, b_alpha=0.1):
    x = tf.reshape(X, shape=[-1, IMAGE_HEIGHT, IMAGE_WIDTH, 1])
 
    # 3 conv layers
    w_c1 = tf.Variable(w_alpha * tf.random_normal([3, 3, 1, 32]))
    b_c1 = tf.Variable(b_alpha * tf.random_normal([32]))
    conv1 = tf.nn.relu(tf.nn.bias_add(tf.nn.conv2d(x, w_c1, strides=[1, 1, 1, 1], padding='SAME'), b_c1))
    conv1 = tf.nn.max_pool(conv1, ksize=[1, 2, 2, 1], strides=[1, 2, 2, 1], padding='SAME')
    conv1 = tf.nn.dropout(conv1, keep_prob)
 
    w_c2 = tf.Variable(w_alpha * tf.random_normal([3, 3, 32, 64]))
    b_c2 = tf.Variable(b_alpha * tf.random_normal([64]))
    conv2 = tf.nn.relu(tf.nn.bias_add(tf.nn.conv2d(conv1, w_c2, strides=[1, 1, 1, 1], padding='SAME'), b_c2))
    conv2 = tf.nn.max_pool(conv2, ksize=[1, 2, 2, 1], strides=[1, 2, 2, 1], padding='SAME')
    conv2 = tf.nn.dropout(conv2, keep_prob)
 
    w_c3 = tf.Variable(w_alpha * tf.random_normal([3, 3, 64, 64]))
    b_c3 = tf.Variable(b_alpha * tf.random_normal([64]))
    conv3 = tf.nn.relu(tf.nn.bias_add(tf.nn.conv2d(conv2, w_c3, strides=[1, 1, 1, 1], padding='SAME'), b_c3))
    conv3 = tf.nn.max_pool(conv3, ksize=[1, 2, 2, 1], strides=[1, 2, 2, 1], padding='SAME')
    conv3 = tf.nn.dropout(conv3, keep_prob)
 
    # Fully connected layer
    w_d = tf.Variable(w_alpha * tf.random_normal([3 * 8 * 64, 1024]))
    b_d = tf.Variable(b_alpha * tf.random_normal([1024]))
    dense = tf.reshape(conv3, [-1, w_d.get_shape().as_list()[0]])
    dense = tf.nn.relu(tf.add(tf.matmul(dense, w_d), b_d))
    dense = tf.nn.dropout(dense, keep_prob)
 
    w_out = tf.Variable(w_alpha * tf.random_normal([1024, MAX_CAPTCHA * CHAR_SET_LEN]))
    b_out = tf.Variable(b_alpha * tf.random_normal([MAX_CAPTCHA * CHAR_SET_LEN]))
    out = tf.add(tf.matmul(dense, w_out), b_out)
    # out = tf.nn.softmax(out)
    return out
 
 
# Vector to text
def vec2text(vec):
    char_pos = vec.nonzero()[0]
    text = []
    for i, c in enumerate(char_pos):
        text.append(char_set[c % CHAR_SET_LEN])
    return "".join(text)
 
 
def predict_captcha(captcha_image):
    output = crack_captcha_cnn()
 
    saver = tf.train.Saver()
    with tf.Session() as sess:
        saver.restore(sess, tf.train.latest_checkpoint(model_path))
 
        predict = tf.argmax(tf.reshape(output, [-1, MAX_CAPTCHA, CHAR_SET_LEN]), 2)
        text_list = sess.run(predict, feed_dict={X: [captcha_image], keep_prob: 1})
 
        text = text_list[0].tolist()
        vector = np.zeros(MAX_CAPTCHA * CHAR_SET_LEN)
        i = 0
        for n in text:
            vector[i * CHAR_SET_LEN + n] = 1
            i += 1
        return vec2text(vector)
 
 
if not os.path.exists(valid_path):
    print('Image does not exist, please check!, path:"{}"'.format(os.path.abspath(valid_pathb)))
    sys.exit()
image_list = os.listdir(valid_path)
 
 
output = crack_captcha_cnn()
 
saver = tf.train.Saver()
with tf.Session() as sess:
    saver.restore(sess, tf.train.latest_checkpoint(model_path))
 
    predict = tf.argmax(tf.reshape(output, [-1, MAX_CAPTCHA, CHAR_SET_LEN]), 2)
    
    count = 0
    acceptCount = 0
    for image_ in image_list:
        count += 1
        text_ = image_.split('.')[0]
        image_p = os.path.join(valid_path, image_)
        # Single image prediction
        image = np.float32(cv2.imread(image_p, 0))
        image = image.flatten() / 255
 
        text_list = sess.run(predict, feed_dict={X: [image], keep_prob: 1})
 
        text = text_list[0].tolist()
        vector = np.zeros(MAX_CAPTCHA * CHAR_SET_LEN)
        i = 0
        for n in text:
            vector[i * CHAR_SET_LEN + n] = 1
            i += 1
        predict_text= vec2text(vector)
 
        print("Actual: {0}  Predicted: {1}".format(text_, predict_text),text_ == predict_text)
        if text_ == predict_text: acceptCount += 1;
    print("Test set accuracy",acceptCount,count,acceptCount/count)
```


##### Automatically obtain the training set

Simply use a web crawler to crawl images and simulate login to verify correctness.

The `AutoGetImg.py` automatically fetches the training set.

```python
import numpy as np
import tensorflow as tf
import cv2
import os
import random
import time
import struct
import requests
from Convert import Convert
import re
import socket
 
# number
number = ['1', '2', '3', 'b', 'c', 'm', 'n', 'v', 'x', 'z']
 
# Image size
IMAGE_HEIGHT = 22  # 80
IMAGE_WIDTH = 62  # 160
MAX_CAPTCHA = 4
 
char_set = number
CHAR_SET_LEN = len(char_set)  #10
model_path = "model/"
 
 
X = tf.placeholder(tf.float32, [None, IMAGE_HEIGHT * IMAGE_WIDTH])
Y = tf.placeholder(tf.float32, [None, MAX_CAPTCHA * CHAR_SET_LEN])
keep_prob = tf.placeholder(tf.float32)  # dropout
```

```python
# Define CNN
def crack_captcha_cnn(w_alpha=0.01, b_alpha=0.1):
    x = tf.reshape(X, shape=[-1, IMAGE_HEIGHT, IMAGE_WIDTH, 1])

    # 3 conv layer
    w_c1 = tf.Variable(w_alpha * tf.random_normal([3, 3, 1, 32]))
    b_c1 = tf.Variable(b_alpha * tf.random_normal([32]))
    conv1 = tf.nn.relu(tf.nn.bias_add(tf.nn.conv2d(x, w_c1, strides=[1, 1, 1, 1], padding='SAME'), b_c1))
    conv1 = tf.nn.max_pool(conv1, ksize=[1, 2, 2, 1], strides=[1, 2, 2, 1], padding='SAME')
    conv1 = tf.nn.dropout(conv1, keep_prob)

    w_c2 = tf.Variable(w_alpha * tf.random_normal([3, 3, 32, 64]))
    b_c2 = tf.Variable(b_alpha * tf.random_normal([64]))
    conv2 = tf.nn.relu(tf.nn.bias_add(tf.nn.conv2d(conv1, w_c2, strides=[1, 1, 1, 1], padding='SAME'), b_c2))
    conv2 = tf.nn.max_pool(conv2, ksize=[1, 2, 2, 1], strides=[1, 2, 2, 1], padding='SAME')
    conv2 = tf.nn.dropout(conv2, keep_prob)

    w_c3 = tf.Variable(w_alpha * tf.random_normal([3, 3, 64, 64]))
    b_c3 = tf.Variable(b_alpha * tf.random_normal([64]))
    conv3 = tf.nn.relu(tf.nn.bias_add(tf.nn.conv2d(conv2, w_c3, strides=[1, 1, 1, 1], padding='SAME'), b_c3))
    conv3 = tf.nn.max_pool(conv3, ksize=[1, 2, 2, 1], strides=[1, 2, 2, 1], padding='SAME')
    conv3 = tf.nn.dropout(conv3, keep_prob)

    # Fully connected layer
    w_d = tf.Variable(w_alpha * tf.random_normal([3 * 8 * 64, 1024]))
    b_d = tf.Variable(b_alpha * tf.random_normal([1024]))
    dense = tf.reshape(conv3, [-1, w_d.get_shape().as_list()[0]])
    dense = tf.nn.relu(tf.add(tf.matmul(dense, w_d), b_d))
    dense = tf.nn.dropout(dense, keep_prob)

    w_out = tf.Variable(w_alpha * tf.random_normal([1024, MAX_CAPTCHA * CHAR_SET_LEN]))
    b_out = tf.Variable(b_alpha * tf.random_normal([MAX_CAPTCHA * CHAR_SET_LEN]))
    out = tf.add(tf.matmul(dense, w_out), b_out)
    # out = tf.nn.softmax(out)
    return out


# Convert vector to text
def vec2text(vec):
    char_pos = vec.nonzero()[0]
    text = []
    for i, c in enumerate(char_pos):
        text.append(char_set[c % 10])
    return "".join(text)


def predict_captcha(captcha_image):
    output = crack_captcha_cnn()

    saver = tf.train.Saver()
    with tf.Session() as sess:
        saver.restore(sess, tf.train.latest_checkpoint(model_path))

        predict = tf.argmax(tf.reshape(output, [-1, MAX_CAPTCHA, CHAR_SET_LEN]), 2)
        text_list = sess.run(predict, feed_dict={X: [captcha_image], keep_prob: 1})

        text = text_list[0].tolist()
        vector = np.zeros(MAX_CAPTCHA * CHAR_SET_LEN)
        i = 0
        for n in text:
            vector[i * CHAR_SET_LEN + n] = 1
            i += 1
        return vec2text(vector)
```

```python
if __name__ == '__main__':
     
    output = crack_captcha_cnn()
     
    saver = tf.train.Saver()
    with tf.Session() as sess:
        saver.restore(sess, tf.train.latest_checkpoint(model_path))
     
        predict = tf.argmax(tf.reshape(output, [-1, MAX_CAPTCHA, CHAR_SET_LEN]), 2)
        cvt = Convert()
        session = requests.Session()
        count = 1
        acceptCount = 1
        headers = {}

        while True:
            try:
                IP = socket.inet_ntoa(struct.pack('>I', random.randint(1, 0xffffffff)))
                headers['X-FORWARDED-FOR'] = IP
                headers['CLIENT-IP'] = IP
                req = session.get("http://xxxxxxxx/jsxsd/",headers = headers)
                req = session.get("http://xxxxxxxx/jsxsd/verifycode.servlet",headers = headers)
                img = cvt.run(req.content)
                cv2.imwrite("vvvv.jpg",img)

                image = np.float32(img)
                image = image.flatten() / 255
                text_list = sess.run(predict, feed_dict={X: [image], keep_prob: 1})
                text = text_list[0].tolist()
                vector = np.zeros(MAX_CAPTCHA * CHAR_SET_LEN)
                i = 0
                for n in text:
                    vector[i * CHAR_SET_LEN + n] = 1
                    i += 1
                predict_text= vec2text(vector)
                # predict_text = input()
                print(predict_text)
                
                params={
                    "encoded": "MjAyMDE2MTIyMzU=%%%MjAyMDE2MTIyMzU=",
                    "RANDOMCODE": predict_text
                }
                req = session.post("http://xxxxxxxx/jsxsd/xk/LoginToXk",data=params,headers = headers)
                if not re.search("验证码错误", req.text) :
                    print("Load",acceptCount,count,acceptCount/count)
                    acceptCount += 1
                    cv2.imwrite("TrainImg/%s.jpg" % (predict_text),img)
                count += 1
                time.sleep(0.3) #稍微延时一下
            except Exception as e:
                print(e)
            pass


```

##### Training completed
3109 images in the training set, 128 images in the test set, 1600 training iterations, with an accuracy of 99%, and an actual test accuracy of about 98%.

Code and model are available at:  
[https://github.com/WindrunnerMax/SWVerifyCode](https://github.com/WindrunnerMax/SWVerifyCode)  
[https://gitee.com/windrunner_Max/IMGPATH/tree/master/DL/SW](https://gitee.com/windrunner_Max/IMGPATH/tree/master/DL/SW)