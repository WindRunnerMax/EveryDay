# Improve the Heat Dissipation of the PHICOMM K3C Router

The PHICOMM K3C router is pretty good for daily use, but the temperature tends to run high, although it's still handy as a hand warmer during the winter.

![Screenshot](screenshots/2023-04-14-18-52-34.png)

I learned this heat dissipation mod from a user on Tieba, and I must say, they really know their stuff. You can check out the [original post here](https://tieba.baidu.com/p/6599983651). Unfortunately, I didn't take enough photos at the time, so I had to borrow a few images from the user to clarify certain steps.

First, you'll need to purchase a 3cm fan, a fan speed controller, and an additional USB cable.

![Screenshot](screenshots/2023-04-14-18-52-41.jpg)

Start by removing the outer shell of the K3C router. After peeling off the four foot pads from the bottom, you'll find two screws that need to be removed from the backside without the 'interl' paint. I broke several clips during the disassembly, which was a bit awkward, but disassembling it without causing damage is quite challenging, so forceful removal is inevitable.

![Screenshot](screenshots/2023-04-14-18-52-55.jpg)

![Screenshot](screenshots/2023-04-14-18-53-04.jpg)

Once you have the shell off, you'll find a sunshade on the right side, which conveniently can be used to secure the fan in place.

![Screenshot](screenshots/2023-04-14-18-53-16.jpg)

This sunshade is quite thick, and it took me some effort to punch two holes in it. Cutting it with a knife wasn't easy, so I used a grinder to create the two holes. After that, I used a glue gun to attach the two fans to the sunshade. I made sure that the fans blow air from the outside in, and be careful not to get them reversed.

![Screenshot](screenshots/2023-04-14-18-53-27.jpg)

Next, you'll need to cut and connect the wires to the USB cable in parallel. Remember, parallel for voltage and series for current. Typically, the red and black wires on a USB cable indicate the positive and negative poles, and you should match them with the corresponding poles on the fan. The K3C has a USB port on the exterior, so after plugging in the fan speed controller, route the USB cable inward. I drilled a hole for this purpose, and it snugly accommodated the USB cable, although it was quite a hassle due to the thickness of the USB I used.

![Screenshot](screenshots/2023-04-14-18-55-31.jpg)

After plugging in the sunshade, reassemble the outer shell, and you're all set.

![Screenshot](screenshots/2023-04-14-18-55-47.jpg)

Once the fan is turned on, you'll notice a significant improvement in heat dissipation, but there will be some noise. At approximately 30% speed, the temperature drops by more than ten degrees.

![Screenshot](screenshots/2023-04-14-18-56-01.png)

Let's sneak a peek at the fan setup borrowed from the Tieba user.

![Screenshot](screenshots/2023-04-14-18-56-13.jpg)
