# Implementing a Task Queue and Graceful Shutdown Based on NodeJs
When executing complex tasks on the backend, instant responses aren’t usually feasible within a short timeframe—for example, document import and export tasks. With the current development of `LLMs`, we can handle more complex tasks like writing, quality inspection, and translation of documents. These tasks tend to be time-consuming, so a task queue is needed to manage the execution order and resource allocation of these asynchronous tasks, while graceful shutdown ensures the tasks are completed properly.

<details>
<summary><strong>Related Articles from the AI Infra Series</strong></summary>

- [SSE Solution Based on fetch](../Browser/基于fetch的SSE方案.md)
- [Implementing Basic RAG Services Based on Vector Retrieval](./基于向量检索实现基础RAG服务.md)
- [Streaming Markdown Incremental Rich Text Parsing Algorithm](./流式Markdown增量富文本解析算法.md)
- [Implementing a Task Queue and Graceful Shutdown Based on NodeJs](./基于NodeJs实现任务队列与优雅停机.md)

</details>

## Overview
A task queue is used to manage and schedule asynchronous tasks. In practice, you might use existing libraries such as `Bull/BullMQ`, `Agenda`, etc. If you require more complex task/message scheduling — such as reliable messaging across different systems or applications — you’ll want to use message queue systems like `Kafka` or `RabbitMQ`. In general, asynchronous tasks offer the following benefits:

- Asynchronous processing: Push time-consuming operations to the background so the main program can respond quickly.
- Traffic smoothing: Convert a large number of requests into tasks, enqueue them steadily, and then consume tasks according to the system’s capacity.
- Error retry: When a task fails, the queue can attempt to retry. If it still fails after multiple attempts, the task can be marked as failed.

Graceful shutdown refers to the process where, upon app termination, ongoing tasks are handled correctly to ensure data consistency and integrity. Here, graceful shutdown mainly involves handling both incoming requests and tasks in the queue. Request handling is usually managed by the gateway and the framework itself, while task queue resetting or termination requires manual intervention. Generally, graceful shutdown involves:

- Stopping new incoming requests. Services need to avoid accepting new requests, typically managed by gateways or front-end nodes.
- Completing in-progress requests. Services continue processing current requests to ensure they finish properly.
- Releasing allocated resources. After requests complete, all resources such as database connections must be freed.
- Shutting down the service. Once all requests are finished and resources released, the service can shut down cleanly or force shutdown if needed.

In this article, based on the `Nest` framework, we implement a simplified distributed task scheduling queue. Using `pm2` to manage NodeJs processes, we achieve graceful shutdown capabilities and explore how process signals behave on Linux systems. The code implementations can be found at <https://github.com/WindRunnerMax/webpack-simple-environment>.

## Task Queue
Implementing a task queue is relatively straightforward. Our main goal here is traffic smoothing, especially when scheduling `LLMs`; requests need to queue for processing because cloud providers usually limit concurrency. These limits usually apply to RPM (requests per minute) and TPM (tokens per minute), so request queuing has to happen at the application layer.

We’ll avoid using existing frameworks here and build the task queue ourselves. The main objectives are controlling concurrent tasks and outlining single-process, single-machine cluster modes, as well as distributed task locking solutions. Beyond the task queue, many details need attention, such as concurrency control when reading from databases and task timeout management — all extendable in real-world applications.

Message queue systems typically support two consumption modes: push and pull. In pull mode, consumers still need to implement task queues to control concurrency, e.g., in `Kafka`. On the other hand, push mode allows concurrency control directly within the message queue, e.g., in `RabbitMQ`.

### Single Instance Task
First, let’s implement a single-instance, single-process task queue. We’ll start by creating a Task Queue class. Instantiating this class lets multiple service instances (`Service`) schedule tasks with the queue independently. A key point: if you don’t want to create multiple global instances, you can maintain the instance inside a provider class in `Nest`, but make sure the `Scope` is set to global singleton instead of request-scoped:

```js
@Injectable({ scope: Scope.DEFAULT })
export class TasksService {}
```

Assuming tasks are stored in a database for persistence — essential to prevent data loss — we then implement a `TaskQueue` class to control concurrent executions. Since we’re operating in a single-instance, single-process mode here, distributed locks aren’t needed; concurrency control can rely on in-memory variables. Below is the basic structure of this class:

```js
export declare class TaskQueue {
  /** Instance/lock identifier */
  private readonly key;
  /** Maximum number of concurrent tasks */
  private readonly maxTasks;
  /** Number of tasks currently running locally */
  private runningTasks;
  constructor(/** Unique identifier */ key: string, /** Max number of parallel tasks */ maxTasks: number);
  /** Attempt to schedule multiple tasks */
  tryRun(): Promise<void>;
  /** Officially schedule a task */
  run(): Promise<void>;
  /** Schedule and run a task - needs to be overridden after instantiation @returns Returns the task identifier `id` */
  onRunning(): Promise<string | undefined>;
  /** Allocate Quota */
  assign(): Promise<boolean>;
  /** Release Quota */
  release(): Promise<boolean>;
}
```

Next, let's focus on the `assign` and `release` methods that allocate and free `Quota`. Here, we directly use an in-memory `Record<string, number>` object to manage the number of concurrent task resources. Since distributed locking will ultimately be implemented, the logic here closely mirrors the `LUA` scripts for Redis locks.

When allocating `Quota`, we need to check whether the current number of running tasks is less than the maximum concurrency. If it is, allocation succeeds and the count increments; otherwise, allocation fails. When releasing `Quota`, we decrement the running task count, ensuring it does not drop below zero. This mainly prevents writing negative values when switching keys, which would cause concurrency to increase incorrectly.

```js
function assign(): Promise<boolean> {
  const lockKey = "_lock_" + this.key;
  let current = MEMORY_MAP[lockKey];
  if (current === void 0)  current = MEMORY_MAP[lockKey] = 0;
  if (current >= this.maxTasks) return false;
  const serial = ++MEMORY_MAP[lockKey];
  return true;
}

function release(): Promise<boolean> {
  const lockKey = "_lock_" + this.key;
  const current = MEMORY_MAP[lockKey];
  if (current === void 0 || current <= 0) {
    MEMORY_MAP[lockKey] = 0;
    return true;
  }
  --MEMORY_MAP[lockKey];
  return true;
}
```

Because the tasks themselves are already concurrency-controlled by the lock, we only need to manage the execution flow of tasks next. There are usually two common approaches to controlling asynchronous tasks, similar to how plugins work in `webpack`: one is inversion of control, passing a `done` callback into the task; the other is directly returning a `Promise` from the task. Here, we adopt the asynchronous pattern directly.

```js
async function run(): Promise<void> {
  const assigned = await this.assign();
  if (!assigned) return void 0;
  let id: string | undefined = void 0;
  this.runningTasks++;
  try {
    id = await this.onRunning();
  } catch (error) {
    console.error("Task Queue Running Error:", error);
  }
  this.runningTasks--;
  await this.release();
  id && process.nextTick(this.tryRun);
}
```

Here, the `onRunning` method needs to be overridden — that is, in the service layer, this built-in method is assigned to the class instance. Typically, this method fetches a task from the database and executes it, returning the task’s `id` upon completion, or `undefined` if there are no tasks. The returned `id` then indicates whether subsequent tasks will continue executing. Using `nextTick` primarily prevents stack overflow issues.

Direct recursive calls within task scheduling can cause stack overflow. In the example below, if recursion is synchronous, it throws a `Maximum call stack size exceeded` error. However, with asynchronous recursion like `asyncRecursion`, each recursive call is executed in the next event loop cycle, avoiding overflow.


```js
function recursion(n) {
  if (n <= 0) return;
  n % 100 === 0 && console.log(`Depth: ${n}`);
  recursion(n - 1)
}
recursion(100000);

function asyncRecursion(n) {
  if (n <= 0) return;
  n % 100 === 0 && console.log(`Depth: ${n}`);
  Promise.resolve().then(() => asyncRecursion(n - 1));
}
asyncRecursion(100000);
```

To execute concurrent tasks, the `run` function must actually be started; it continually attempts to schedule and execute tasks. Naturally, task scheduling is implemented through a loop to batch process tasks. One important point to note is that the `run` function should not be awaited when executed, as this would block the current event loop and prevent tasks from running concurrently.

```js
async function tryRun(): Promise<void> {
  const batch = this.maxTasks - this.runningTasks;
  for (let i = 0; i < batch; i++) {
    this.run();
  }
}
```

However, there is a caveat here: if there are no tasks available for scheduling, it will still try running tasks up to `maxTasks` times. This can cause invalid reads from the database. Usually, such read operations are acceptable in a database context since the state values should be indexed. If this is absolutely unacceptable, running the `run` function should be queued or delayed — for example, if the previous task returns empty within 10 seconds, do not execute.

### Atomic Read and Write
Let's rewrite the `onRunning` method — its main job is to read tasks from the database and execute them. Suppose we use a `find` statement to read and an `update` statement to write. Assume the status field is called `status`, with values defined as `pending` (waiting), `running` (in progress), `completed` (done), and `failed` (failed).

Assume we have two tasks with IDs `1` and `2`, both in `pending` status, and the maximum concurrency allowed is 2. When scheduling tasks independently in two processes, the first step is to query the database for tasks with `pending` status and update their status to `running`.

```js
// Task 1
await find status="pending"
update id=$0 status="running"
// Task 2
await find status="pending"
update id=$0 status="running"
```

At first glance, this scheduling seems fine, but actually, a race condition problem arises. Because Task 1 and Task 2 both execute the query simultaneously, both will find the task with `id=1`, and both will try to update it to `running`. Consequently, the same task is processed by multiple processes.

```js
// Task 1
await find status="pending" -> id=1
// Task 2
await find status="pending" -> id=1
```

The root cause is that the query and update are two separate operations. Parallel tasks trigger the query simultaneously without any lock to guarantee that the queried task won’t be modified by another task before the update. Therefore, to achieve correctness under parallel execution, the read and write must be atomic. This means combining the query and update into a single operation — for example, MongoDB provides the `findOneAndUpdate` method.

Here, we will simulate the data-handling logic in the same way. Since `Service` is now a singleton, we maintain a 2D array to store tasks. We implement a `findAndModify` method to simulate the database’s query-and-update in one atomic step, which will search for tasks by the criteria passed in and update their status accordingly.

```js
export class TasksService {
  public tasks: { id: string; status: "pending" | "running" | "success" | "fail" }[]
```

```ts
private async findAndModify(
  find: { id?: string; status?: typeof TasksService.prototype.tasks[0]["status"] } = {},
  status: typeof TasksService.prototype.tasks[0]["status"]
) {
  const task = this.tasks.find(t => {
    if (find.id && t.id !== find.id) return false;
    if (find.status && t.status !== find.status) return false;
    return true;
  });
  if (task) {
    console.log(`Task ${task.id} is ${task.status} => ${status}.`);
    task.status = status;
    return task;
  }
  return null;
}
}
```

When rewriting the `running` method to execute tasks, we can invoke this `findAndModify` method to query and update the task status, thereby ensuring the atomicity of task operations. Here, we simulate a timeout of `2s` for task execution. The tasks themselves have randomly generated durations, and the state transitions are strictly controlled using the method above, although using flags for tracking is also an option.

```js
async function onRunning() {
  const task = await this.findAndModify({ status: "pending" }, "running");
  if (!task) return void 0;
  const now = Date.now();
  const execute = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 3000));
      await this.findAndModify({ id: task.id, status: "running" }, "success");
      console.log(`Task ${task.id} cost ${Date.now() - now} ms.`);
    } catch (error) {
      await this.findAndModify({ id: task.id, status: "running" }, "fail");
      console.log("Task", task.id, "failed.", error);
    }
  };
  const timeout = async (ms: number) => {
    await sleep(ms);
    await this.findAndModify({ id: task.id, status: "running" }, "fail");
  };
  await Promise.all([execute(), timeout(2000)]);
  return task.id;
}
```

At this point, the implementation of a single-instance, single-process task queue is basically complete. Next, we will implement task creation and execution through an API. Also, the method for creating tasks is defined in the API. In the following example, we batch-create 5 tasks, then call the queue’s `tryRun` method to attempt to schedule tasks.

```js
async function createTask() {
  const id = `task_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  this.tasks.push({ id, status: "pending" });
  return { id };
}

@Controller()
export class IndexController {
  @Inject(IndexService)
  private readonly indexService!: IndexService;

  @Post("batch-create-task")
  public async createTask() {
    // curl -X POST http://localhost:3000/batch-create-task
    for (let i = 0; i < 5; i++) {
      this.tasksService.createTask();
    }
  }
}
```

After executing the curl command, you will observe tasks being sequentially scheduled and executed, with concurrency limited to no more than 2 at a time. Since the execution times of the tasks themselves are random, the actual execution order and whether tasks succeed or fail are both uncertain.

```
Lock Assign _lock_key 0 -> 1
Lock Assign _lock_key 1 -> 2
Task task_1762683026625_272 is pending => running.
Task task_1762683026625_164 is pending => running.
Task task_1762683026625_272 is running => success.
Task task_1762683026625_272 took 534 ms.
Task task_1762683026625_164 is running => success.
Task task_1762683026625_164 took 1556 ms.
Lock Release _lock_key 2 -> 1
Lock Assign _lock_key 1 -> 2
Task task_1762683026625_300 is pending => running.
Lock Release _lock_key 2 -> 1
Lock Assign _lock_key 1 -> 2
Task task_1762683026625_944 is pending => running.
Task task_1762683026625_300 is running => success.
Task task_1762683026625_300 took 378 ms.
Task task_1762683026625_944 is running => success.
Task task_1762683026625_944 took 1852 ms.
Lock Release _lock_key 2 -> 1
Lock Assign _lock_key 1 -> 2
Task task_1762683026625_42 is pending => running.
Lock Release _lock_key 2 -> 1
Lock Assign _lock_key 1 -> 2
Lock Release _lock_key 2 -> 1
Task task_1762683026625_42 is running => success.
Task task_1762683026625_42 took 1119 ms.
Lock Release _lock_key 1 -> 0
Lock Assign _lock_key 0 -> 1
Lock Assign _lock_key 1 -> 2
Lock Release _lock_key 2 -> 1
Lock Release _lock_key 1 -> 0
```

### Distributed Lock

In fact, regarding lock management, the aforementioned single-process mode only requires handling in-memory operations. For a single-server clustered mode — that is, multiple processes sharing memory or using the file system — locking can be managed similarly. However, what’s common now is a distributed multi-instance setup, where using external storage like `Redis` is necessary, because a centralized lock management mechanism is required.

Additionally, `Redis` offers the `RedLock` algorithm, which provides distributed mutual exclusion to prevent concurrency conflicts. However, this is not suitable for our task queue scenario. Also, in a `Redis` distributed master-slave deployment, if the master node fails and a slave takes over as master, there can be a brief period where the number of concurrently running tasks exceeds the maximum limit (`MaxTask`).

Therefore, we need to replace the in-memory lock implementation with a distributed lock based on `Redis`. Compared to in-memory approaches, `Redis` natively supports atomic `incr` and `decr` operations, but it cannot inherently limit the data range. We address this by using `LUA` scripts to implement the distributed lock functionality. Below is the `LUA` implementation for managing parallel tasks:

```js
/**
 * Redis Increment Lock LUA Script
 * - KEYS[1]: lock key name
 * - ARGV[1]: maximum number of tasks (MaxTask)
 * @example ioredis.eval(LUA_SCRIPT, 1, LOCK_KEY, MAX_TASK);
 */
export const INCR_LOCK_LUA = `
  local current = redis.call("GET", KEYS[1])

  if not current then
    current = 0
  else
    current = tonumber(current)
  end

  if current >= tonumber(ARGV[1]) then
    return -1
  end

  local new_count = redis.call("INCR", KEYS[1])
  return new_count
`;

/**
 * Redis Decrement Lock LUA Script
 * - KEYS[1]: lock key name
 * @example ioredis.eval(LUA_SCRIPT, 1, LOCK_KEY);
 */
export const DESC_LOCK_LUA = `
  local current = redis.call("GET", KEYS[1])
  
  if not current then
    return 0
  end
```

```lua
current = tonumber(current)
if current <= 0 then
  return 0
end

local new_count = redis.call("DECR", KEYS[1])
return new_count
`;
```

## Graceful Shutdown
Handling graceful shutdown is a bit more complex because it cannot rely solely on the framework's built-in capabilities; instead, it requires handling at the application level. Specifically, we must ensure that signals are properly delivered to the process. Without receiving the signal, the process cannot perform a graceful shutdown—even if resource cleanup is implemented, it will have no practical effect.

Especially in distributed deployments where services run inside `Docker` containers, signal delivery heavily depends on the container’s configuration and the way the daemon is managed. For example, if the shutdown signal is only sent to the main process (instead of the entire process group, as with `Ctrl+C`), then the main process must explicitly forward the signal to child processes. Otherwise, the child processes won't be able to handle the shutdown.

### SIGINT
`SIGINT` is the primary signal we focus on. When pressing `Ctrl+C` in the terminal, the system sends a `SIGINT` signal to the current foreground process group, triggering an interrupt handler in the process. The signal number for `SIGINT` is `2`, so we can also send it with `kill -2 <pid>` or `kill -INT <pid>` commands.

Here, we’ll implement a simple `SIGINT` handler by creating a basic HTTP server and listening for the `process.on("SIGINT")` event. When `Ctrl+C` is pressed, the server won’t shut down immediately; instead, it will log a waiting message, delay for 2 seconds, then close the server and exit the process.

```js
const server = http.createServer((_, res) => {
  console.log("Received Request", Date.now());
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello, World!\n");
});

process.on("SIGINT", async () => {
  console.log("Received SIGINT. Shutting Down Gracefully...");
  await new Promise(r => setTimeout(r, 2000));
  server.close(() => {
    console.log("Server Closed. Exiting Process.");
    process.exit(0);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server Running at http://localhost:${PORT}/`);
});
```

### Signal Forwarding
Pressing `Ctrl+C` sends a `SIGINT` signal to the entire foreground process group. However, in some cases, the signal might only be sent to the main process, meaning child processes won’t receive it. We can simulate this behavior: when using the `npx` command to start a process, it does not forward signals to the spawned child process. Another common signal is `SIGTERM` with signal number `15`.

```bash
# ps -A -o pid,ppid,comm,args > ps.txt
# lsof -i :3000
# kill -INT 1234
echo "signal.sh PID-PPID $$,$PPID"
npx tsx ./src/index.ts
```

When running the script with `bash signal.sh`, it first outputs the current process's `PID` and parent process's `PPID`. Since the process is started by `bash`, the parent process ID is `bash`’s PID. Next, `npx tsx` launches the Node.js process, whose parent is the `npx` process. Suppose the output is as follows:

```bash
signal.sh PID-PPID 66721,59534
59534 51513 /bin/zsh         /bin/zsh -il                 # zsh shell
66721 59534 bash             bash signal.sh               # bash 
66722 66721 npm exec tsx ./s npm exec tsx ./src/index.ts  # npx tsx
```

If you run `kill -INT 66721` to send a signal to the script process (`bash`), you'll notice the Node.js process does not receive the signal and thus cannot shut down gracefully. Usually, in this scenario, you would have to wait for a timeout before forcibly terminating the child processes (e.g., `kill -9 <pid>` or `kill -KILL <pid>`). However, if you send `kill -2 66722` directly to the Node.js process, it shuts down normally.

This happens because we only send the signal to the main process, which in this case is the `bash` script. The reason is we’re launching the process with `npx`, which spawns a new process to run the service. Since `npx` does not propagate signals to its child processes, those child processes never receive the shutdown signal unless it’s explicitly forwarded.

In `Bash`, we can use the `exec` command to replace the current `Shell` process instead of creating a new child process. Therefore, if we use `exec` before the `npx` command to replace the current `bash` process, the signal can be directly passed to the `NodeJs` process.

```bash
exec npx tsx ./src/index.ts
```

The process relationship at this point is shown below. The main process now is the one with PID `67033`. Sending `kill -INT 67033` will properly deliver the signal and allow for graceful shutdown handling. It’s worth noting that since we executed the command directly from the terminal, its own process `59534` — which is the `zsh` process — is the parent process.

```bash
signal.sh PID-PPID 67033,59534
59534 51513 /bin/zsh         /bin/zsh -il
67033 59534 npm exec tsx ./s npm exec tsx ./src/index.ts   
```

Because `npx` creates a child process to execute the command, if the service start command itself also creates child processes, signal propagation issues will still occur. Therefore, when using process management tools like `pm2`, it's important to be mindful of signal transmission in the startup commands. In such cases, we can avoid using the `npx` command to start the process, thus launching the service as a top-level process.

```bash
export PATH="$PWD/node_modules/.bin:$PATH"
exec tsx ./src/index.ts
```

```bash
signal.sh PID-PPID 67675,59534
59534 51513 /bin/zsh         /bin/zsh -il
67675 59534 node             node /xxx/node_modules/.bin/../tsx/dist/cli.mjs ./src/index.ts
```

### Child Process Management

Since we will later implement signal transmission with `PM2` in cluster mode, here we start with a simple and interesting experiment mainly to observe child process behavior. Usually, in deployment environments, we rely on container processes such as `systemd` to supervise processes rather than using `pm2`. However, if `pm2` is used directly for process supervision, manual signal propagation becomes necessary.

For this reason, we construct a simple parent-child process model to illustrate the process relationship. `child.sh` is a basic script that uses a `while` loop to keep the process running. `normal.sh` is the parent process script that launches `child.sh` as a child process using `bash`. `fork.sh` is another parent script, but it detaches the child process using `disown`.

```bash
# child.sh
while true; do
    sleep 1
    echo "child.sh PID-PPID $$,$PPID"
done
```

```bash
# normal.sh
echo "normal.sh PID-PPID $$,$PPID"
bash child.sh > /dev/tty 2>&1
```

```bash
# fork.sh
echo "fork.sh PID-PPID $$,$PPID"
bash child.sh > /dev/tty 2>&1 &
disown -h %1
```

By starting `normal.sh` and `fork.sh` in two different terminals, you can see that the `normal` process remains active and does not terminate, while the `fork` process ends its parent process immediately, allowing you to run other commands in the terminal. This behavior is similar to running the process in the background. Note that redirecting output to the `tty` terminal keeps it running; output can also be redirected to a file.

```bash
normal.sh PID-PPID 70263,69842
child.sh PID-PPID 70264,70263
69842 51513 /bin/zsh         /bin/zsh -il
70263 69842 bash             bash normal.sh
70264 70263 bash             bash child.sh
72259 70264 sleep            sleep 1
```

```bash
fork.sh PID-PPID 70303,69954
child.sh PID-PPID 70304,1
69954 51513 /bin/zsh         /bin/zsh -il
70304     1 bash             bash child.sh
72260 70304 sleep            sleep 1
```

### PM2 Process

From the previous experiment, we have already observed the signal transmission issue. The same problem exists when using `pm2`. Suppose we start a process with `pm2 start`, which launches the process in `fork` mode. In this case, signals cannot be propagated to the child process because the parent process exits immediately.

```bash
export PORT=3000
echo "bootstrap.sh PID-PPID $$,$PPID"
npx tsc --project tsconfig.json
export PATH="$PWD/node_modules/.bin:$PATH"
exec pm2 start ./dist/index.js -i 2 --kill-timeout 5000 --log-date-format="YYYY-MM-DD HH:mm:ss" --log ./output.log
```

At this point, the process tree is as follows. Since the process will exit immediately, the parent process of the main `pm2` process is `1`. Because we're using cluster mode, two child processes are started to run the service, and these two child processes have the main `pm2` process as their parent. Under these circumstances, we cannot send the `SIGINT` signal to the main process, and naturally, the child processes won't receive the signal either.

```bash
73353     1 PM2 v6.0.8: God  PM2 v6.0.8: God Daemon (/Users/czy/.pm2) 
73354 73353 node /Users/czy/ node /xxx/graceful-shutdown/dist/index.js 
73355 73353 node /Users/czy/ node /xxx/graceful-shutdown/dist/index.js 
```

In this scenario, if you want to attempt graceful shutdown handling, you need to actively forward the signal to the child processes. Typically, since the process terminates, we can’t obtain the child processes’ `PID` directly from the main process. Therefore, the only option is to use `pm2` commands to get the child process `PID`s, or use `ps` to match the `PID`s, then send the signal. This method makes a graceful shutdown possible.

```bash
kill -INT $(pgrep pm2)
```

Thus, we can combine the above scripts to handle forwarding the signal. First, you need to prevent the main process script from exiting by using a `while` loop to keep it running. Then, upon receiving a signal, fetch the child process `PID`s and forward the signal. Note that in this case, you cannot use `exec` because that would replace the shell process; you need to `fork` a child process normally so the `while` loop and `trap` handlers will work correctly afterward.

```bash
pm2 start ./dist/index.js -i 2 --kill-timeout 5000 --log-date-format="YYYY-MM-DD HH:mm:ss" --log ./output.log
forward_signal() {
    pm2_pid=$(pgrep pm2)
    kill -INT $pm2_pid
    exit 0
}
trap forward_signal SIGINT
while true; do
    sleep 1
done
```

```bash
bootstrap.sh PID-PPID 76699,73203
76731     1 PM2 v6.0.8: God  PM2 v6.0.8: God Daemon (/Users/czy/.pm2) 
76732 76731 node /Users/czy/ node /xxx/graceful-shutdown/dist/index.js 
76733 76731 node /Users/czy/ node /xxx/graceful-shutdown/dist/index.js 
73203 51513 /bin/zsh         /bin/zsh -il
76699 73203 bash             bash bootstrap.sh
76895 76699 sleep            sleep 1
```

In fact, `pm2` now supports the `pm2-runtime` command to better manage processes in containerized environments. The previously mentioned `npx` command issue still applies here. From the following process tree, you can see that the signal forwarding includes one more layer than before. When executing `kill -INT 80795`, the child processes won’t receive the signal, and the processes won’t terminate.

```bash
78367 51513 /bin/zsh         /bin/zsh -il
80795 78367 bash             bash bootstrap.sh
80819 80795 npm exec pm2-run npm exec pm2-runtime start pm2.config.js --env production      
80836 80819 node             node /xxx/.bin/../pm2/bin/pm2-runtime start pm2.config.js --env production
80844 80836 node /Users/czy/ node /xxx/graceful-shutdown/dist/index.js     
80845 80836 node /Users/czy/ node /xxx/graceful-shutdown/dist/index.js 
```

Therefore, the implementation here still requires using `exec` to start the `pm2-runtime` service. Additionally, this command does not start the `pm2` daemon; related logs are directly output to the current shell. It also supports cluster mode. The following example shows the process tree started by `pm2-runtime`. Executing `kill -INT 84685` will properly handle the signal.

```bash
78367 51513 /bin/zsh         /bin/zsh -il
78673 78367 node             node /xxx/.bin/../pm2/bin/pm2-runtime start pm2.config.js --env production
78704 78673 node /Users/czy/ node /xxx/graceful-shutdown/dist/index.js     
78705 78673 node /Users/czy/ node /xxx/graceful-shutdown/dist/index.js
```

### Heartbeat Mechanism
In a distributed environment, besides the issue of signal transmission, another challenge is detecting whether a process is still alive. Suppose an instance exits abruptly for some reason; in this case, graceful shutdown processing becomes impossible. Therefore, we need to implement a heartbeat mechanism to monitor the process's alive status, thereby maintaining the robustness of the service itself.

The heartbeat mechanism is actually quite simple — it's mainly about periodically writing the current timestamp to a storage location to indicate that the process is alive. Assuming we use `Redis` to store the heartbeat timestamps, each instance can use a unique `key` to store its own heartbeat timestamp and update it regularly.

```js
export const launchInstance = () => {
  const keep = () => {
    // Update Redis heartbeat timestamp
    setTimeout(keep, LOOP_TIME);
  };
  keep();
  // Clean up expired instances once at startup
  const res = clearInactiveInstances();
  console.log("Active Instance", res.active);
  console.log("Inactive Instance", res.inactive);
};

export const terminateInstance = () => {
  // Delete current instance during graceful shutdown
};

export const clearInactiveInstances = () => {
  const entries = Object.entries(MEMORY_MAP);
  const now = Date.now();
  const active: string[] = [];
  const inactive: string[] = [];
  for (const [key, value] of entries) {
    if (now - Number(value) > ACTIVE_TIME_OUT) {
      // Clean up expired instances
      inactive.push(key);
      continue;
    }
    active.push(key);
  }
  return { active, inactive };
};
```

Since the instance itself will stop updating the heartbeat timestamp once it exits, and because the presence of a daemon means a stopped process will be restarted after a while, in business logic—such as in the task queue implementation we initially discussed—we can fetch the currently active instances at startup and then verify if the IDs of the scheduler instances currently running tasks are among those active instances. This way, we can attempt to reschedule tasks when necessary.

```js
// task
{
  id: 1,
  pod_id: "$instance_id0",
  status: "running"
}

// redis
[
  "$instance_id0": 100,
  "$instance_id1": 9999999999,
  "$instance_id2": 9999999999
]
```

## Summary
In this article, we implemented a simple distributed task queue and handled graceful shutdowns. The task queue mainly uses distributed locks to restrict concurrency, ensuring tasks are scheduled and executed properly. This supports asynchronous scheduling of long-running tasks and enables features like traffic smoothing and error retries.

Graceful shutdown handling primarily relies on signal transmission to ensure that processes can clean up resources and complete tasks upon receiving shutdown signals. This avoids task interruption and data inconsistency. Moreover, we covered signal propagation between parent and child processes and implemented a heartbeat mechanism to detect instance liveness, thereby guaranteeing the robustness of services in a distributed environment.

## Daily Challenge

- <https://github.com/WindRunnerMax/EveryDay>

## References
- <https://docs.nestjs.com/modules>
- <https://pm2.keymetrics.io/docs/usage/docker-pm2-nodejs/>
- <https://pm2.keymetrics.io/docs/usage/signals-clean-restart/>