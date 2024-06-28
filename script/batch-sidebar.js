const str = `

`;

const arr = str
  .split("\n")
  .filter((item) => item.trim() !== "")
  .map((line) => line.split("](")[1].replace(/%20/g, " "))
  .map((item) => item.replace(".md)", ""))
  .map((item) => `"${item}",`);
arr.forEach((item) => console.log(item));
