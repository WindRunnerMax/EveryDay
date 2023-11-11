const str = `
* [记一次有意思的种树比赛](MyLife/记一次有意思的种树比赛.md)
* [记2021年实习春招历程](MyLife/记2021年实习春招历程.md)
* [2021腾讯实习实录](MyLife/2021腾讯实习实录.md)
* [记ByteCTF中的Node题](Security/记ByteCTF中的Node题.md)
* [记2022年实习春招历程](MyLife/记2022年实习春招历程.md)
* [致我四年的大学生活](MyLife/致我四年的大学生活.md)
* [记2022年秋招历程](MyLife/记2022年秋招历程.md)
* [致我三年的研究生生活](MyLife/致我三年的研究生生活.md)
* [2022字节实习实录](MyLife/2022字节实习实录.md)
* [记一些日常的想法与思考](MyLife/记一些日常的想法与思考.md)
`;

const arr = str
  .split("\n")
  .filter((item) => item.trim() !== "")
  .map((line) => line.split("](")[1].replace(/%20/g, " "))
  .map(item => item.replace(".md)", ""))
  .map(item => `"${item}",`);
arr.forEach(item => console.log(item));
