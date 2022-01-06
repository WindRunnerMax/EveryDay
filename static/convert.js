let s = `

测试123测试


`;

// document.querySelectorAll("dt").forEach(v => v.innerText = "`" + v.innerText + "`: ")

s = s.replace(/[\n“”"‘’']/g, "")
     .replace(/（/g, "(")
     .replace(/）/g, ")")
     .replace(/[,。]/g, "，")
     .replace(/[；]/g, ";")
     .replace(/[？]/g, "?")
     .replace(/[！]/g, "!")
     .replace(/[：]/g, ": ");

let start = false;
const regexp = /[A-Za-z0-9\/\-\.\s@<>\{\}\[\]\?#:;_\+\\%\|=\$]/;
const arr = s.split("");
arr.forEach((v, i) => {
    if(regexp.test(arr[i]) && !start){
        start = true;
        arr[i] = ("`"+arr[i]).replace(/[\s]/g, "");
    }else if(!regexp.test(arr[i]) && start){
        start = false;
        arr[i] = ("`"+arr[i]).replace(/[\s]/g, "");
        if(arr[i - 1]) arr[i - 1] = arr[i - 1].replace(/[\s]/g, "");
    }
    if(start){
        arr[i] = arr[i].replace(/[，]/g, ", ");
        // arr[i] = arr[i].replace(/[\s]/g, "");
    } 
})


if(arr.slice(-1).includes("，")) arr[arr.length-1] = "。";
else arr.push("。");

console.log(arr.join("").replace(/`，`/g, ", ").replace(/`，。/g, "`。"));

console.log("\n\n\n");