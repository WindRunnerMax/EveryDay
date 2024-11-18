# Dota2 Senate
In the world of `Dota2`, there are two factions: `Radiant` and `Dire`. The `Dota2` Senate is composed of senators from both sides. The Senate now wishes to make a decision regarding a change in a `Dota2` game. They conduct a vote based on a round-robin process. In each round, each senator can exercise one of two rights:

- Ban a senator's right: A senator can cause another senator to lose all rights in this and subsequent rounds.
- Declare victory: If the senator finds that all the voting senators are from the same faction, they can declare victory and decide on the changes in the game.

Given a string representing the faction of each senator, where the letters `R` and `D` represent `Radiant` and `Dire`, respectively, and the string size will be `n` if there are `n` senators. The round-based process starts from the first senator in the given order and ends with the last senator. This process continues until the vote is over. All the senators who lose their rights will be skipped during the process. Assuming that each senator is smart enough to make the best strategy for their own party, you need to predict which party will ultimately declare victory and decide on the changes in the `Dota2` game. The output should be `Radiant` or `Dire`.

## Example

```
Input: "RD"
Output: "Radiant"
Explanation: The first senator is from the Radiant faction and can use the first right to strip the second senator of their rights, resulting in the second senator being skipped because they have no rights. Then, in the second round, the first senator can declare victory because they are the only one with the voting right.
```

```
Input: "RDD"
Output: "Dire"
Explanation: 
In the first round, the first senator from the Radiant faction can use the first right to ban the second senator's right.
The second senator from the Dire faction will be skipped because their right is banned.
The third senator from the Dire faction can use their first right to ban the first senator's right.
Therefore, in the second round, only the third senator remains with the voting right, so they can declare victory.
```

## Solution
```javascript
/**
 * @param {string} senate
 * @return {string}
 */
var predictPartyVictory = function(senate) {
    const dire = [];
    const radiant = [];
    const n = senate.length;

    [...senate].forEach((v, i) => {
        if (v === "R") radiant.push(i);
        else dire.push(i);
    })

    while(radiant.length && dire.length) {
            if(radiant[0] < dire[0]) radiant.push(radiant[0] + n);
            else dire.push(dire[0] + n);
            radiant.shift();
            dire.shift();
        }
    return radiant.length ? "Radiant" : "Dire";
};
```

## Idea
The problem is quite long. To solve this problem, we can use a queue to simulate the voting process. We can use a greedy algorithm. For each senator, when it is their turn, they can exercise the first right to disable the right of the nearest senator from the opposite faction behind them. This process continues until all the rights of one faction's senators are disabled, and the remaining faction wins. The official examples show that when a Radiant faction senator exercises the right, if all the senators currently have the voting right are from the Radiant faction, then the senator can directly declare that Radiant faction wins. If there are still senators from the Dire faction, then the Radiant faction senator can only exercise the right to "ban a senator's right". Obviously, the senator will not cause a senator from the Radiant faction to lose their right, so they will definitely choose a senator from the Dire faction. Who should be chosen? It is easy to think of greedily choosing the next senator from the Dire faction in the voting order. This can also be easily proven: since only one senator from the Dire faction can be chosen, then we should choose the senator who can vote first according to the voting order. If other senators are chosen, then when the senator who can vote first exercises the right, a senator from the Radiant faction will lose their right. Therefore, we will suffer a loss. The problem refers to the official solution, my initial idea was to use an array to simulate the process, but this would define an inner loop, with a complexity of `O(n^2)`. So, after referring to the official solution, I used two queues, `radiant` and `dire`, to respectively store the voting time of each senator from the Radiant and Dire factions. First, define the `dire` and `radiant` queues and the length `n` of the queue. Then convert the string to an array and traverse the string to place the index of each senator in their respective queues. Note that the indexes placed here are index values. After that, define a loop, which is executed as long as both queues are not empty. If the first value of `radiant` stored index value is less than the first value of `dire` stored index value, then continue to place the value added by `n` index in the queue. This means that the senator takes the right to the next round. Conversely, remove the first two senators in the queues, as they should be removed in the current round. However, one side adds to the next round queue due to exercising their rights, while the other side is silenced because their right is banned. Finally, determine which queue still has senators and return it.

## Daily Question
```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://leetcode-cn.com/problems/dota2-senate/
```