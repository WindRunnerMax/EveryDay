# 基于NodeJs实现任务队列与优雅停机
当在后端执行复杂的任务时，通常不能够在短时间内即时响应，例如文档导入、导出任务等。再加上当前的`LLMs`发展，我们可以实现文档的写作、质检、翻译等复杂任务，这些任务通常都比较耗时，这样就需要任务队列来管理这些异步任务的执行顺序和资源分配，而优雅停机则用以保证任务的完整处理。

<details>
<summary><strong>AI Infra 系列相关文章</strong></summary>

- [基于 fetch 的 SSE 方案](../Browser/基于fetch的SSE方案.md)
- [基于向量检索实现基础 RAG 服务](./基于向量检索实现基础RAG服务.md)
- [流式 Markdown 增量富文本解析算法](./流式Markdown增量富文本解析算法.md)
- [基于 NodeJs 实现任务队列与优雅停机](./基于NodeJs实现任务队列与优雅停机.md)

</details>

## 概述
任务队列用于管理和调度异步任务，在实现时我们可能会使用一些现成的库，例如`Bull/BullMQ`、`Agenda`等。而如果需要实现更复杂的任务/消息调度，例如不同系统、应用之间的可靠消息传递等服务，我们还需要使用`Kafka`、`RabbitMQ`等消息队列系统。整体来说，异步任务可以实现如下功能:

- 异步任务，将耗时的操作放到后台去处理，让主程序能够快速返回响应。
- 流量削峰，将大量请求转化为任务，平稳地存入队列，然后系统按照能承受的处理能力，从队列中取出任务进行消费。
- 错误重试，当任务执行失败时，队列可以尝试进行重试，如果重试多次后仍然失败，则可以将任务标记为失败。

优雅停机则是指在应用程序关闭时，能够正确地处理正在进行的任务，确保数据的一致性和完整性。在这里的优雅停机主要分为针对请求的处理和针对任务队列的处理，请求的部分通常会由网关加上框架本身处理，而任务队列的重置或者结束，则需要靠我们主动处理。整体来说，优雅停机通常需要做如下处理:

- 停止接收新的请求，服务需要避免新的请求进入，这部分通常需要网关等前置节点来处理。
- 处理当前请求，服务需要继续处理当前已经在处理中的请求，确保这些请求能够正常完成。
- 释放已分配资源，在请求处理完成后，需要释放所有申请的资源，例如关闭数据库连接等。
- 关闭服务，当所有请求都处理完毕且资源都已释放后，需要正常关闭服务，或者强制停机。

在本文中我们在`Nest`框架的基础上，实现简化版的分布式任务调度队列。并且基于`pm2`管理`NodeJs`进程，实现了优雅停机的能力，而且探讨了`Linux`系统下进程与信号的传递表现。文中涉及的实现都在 <https://github.com/WindRunnerMax/webpack-simple-environment> 中。

## 任务队列
任务队列的实现比较简单，在我们的场景中主要目标就是流量削峰，特别是在调度`LLMs`时，我们需要将请求排队处理，当前的云服务商都会有并发请求的限制。当前云服务商主要是会限制`RPM`和`TPM`，即每分钟请求数和每分钟`Token`数量，这样就需要我们在应用层进行请求的排队处理。

在这里我们就不借助已有的框架，而是直接实现任务队列，主要目标是能够控制并发任务，并且叙述单进程以及单机集群模式、分布式任务的锁控制方案。而除了任务队列之外，还有很多细节需要处理，例如从数据库读取的控制并发、任务超时控制等，这些都可以在实际应用中进行扩展。

消息队列系统通常会有推送模式以及拉取模式两种消息消费的方式，而实际上在拉取模式下，消费者也需要实现类似的任务队列来控制并发请求，例如`Kafka`系统。当然如果是推送模式，就可以直接在消息队列中进行并发控制，例如`RabbitMQ`系统。

### 单实例任务
我们先来实现单实例单进程的任务队列，首先需要实现一个任务队列类，通过实例化这个类我们可以在多个服务`Service`分别调度队列实例。在这里需要注意的是，如若不想在全局分别创建实例，在`Next`中就在`Provider`的类中独立维护实例，但是需要注意其`Scope`必须为全局单例而非请求级实例。

```js
@Injectable({ scope: Scope.DEFAULT })
export class TasksService {}
```

接下来假设实际任务是在数据库中存储的，毕竟任务需要持久化存储以防止数据丢失。然后需要实现`TaskQueue`类以控制并发任务，由于我们现在是单实例单进程的模式，就不需要分布式锁的要求，因此可以直接使用内存中的变量来控制并发任务，这里先定义类基本的结构:

```js
export declare class TaskQueue {
  /** 实例/锁标识 */
  private readonly key;
  /** 并发运行数 */
  private readonly maxTasks;
  /** 本机正在运行任务数量 */
  private runningTasks;
  constructor(/** 唯一标识 */ key: string, /** 最大并行任务数 */ maxTasks: number);
  /** 尝试批量调度任务 */
  tryRun(): Promise<void>;
  /**  正式调度任务 */
  run(): Promise<void>;
  /** 调度运行任务 - 需要实例化后重写该方法 @returns 返回任务标识 id */
  onRunning(): Promise<string | undefined>;
  /** 分配 Quota */
  assign(): Promise<boolean>;
  /** 释放 Quota */
  release(): Promise<boolean>;
}
```

接下来关注于`assign`和`release`分配和释放`Quota`方法，在这里我们直接在内存放置`Record<string, number>`对象来管理并发任务的资源数量。由于最后需要实现分布式锁，因此这里的逻辑实际上是与`Redis`锁的`LUA`脚本逻辑类似。

分配`Quota`时，我们需要检查当前运行的任务数量是否小于最大并发数，如果小于则分配成功并增加运行任务数量，否则分配失败。释放`Quota`时，我们需要减少运行任务数量，确保不会小于零，这里主要是避免切换`key`时释放的`Quota`将值写为负数，这样会导致并发量变高。

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

由于任务本身已经由锁控制了并发执行，因此接下来只需要控制好任务的执行流程即可，而控制异步任务的方法通常有两种方式，类似于`webpack`的插件实现，一种方式是类似于控制反转的方式将`done`函数传递到任务中，另一种方式则是直接在任务中返回`Promise`对象，这里我们就直接采用异步模式。

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

在这里我们需要将`onRunning`方法重写，也就是在服务中将内置方法赋值到类上，通常这个方法主要是从数据库中取出任务并执行，执行完成后返回任务的`id`，如果没有任务则返回`undefined`。而这个`id`则会标识后续的任务是否会继续执行，这里的`nextTick`主要是为了避免栈溢出的问题。

如果在任务调度中直接递归地执行，则会存在堆栈溢出的可能。在下面`recursion`这个例子中，如果是同步的的函数执行，则会抛出`Maximum call stack size exceeded`的异常。而如果是异步递归函数`asyncRecursion`，每次递归调用都是在下一个事件循环中执行的，避免了溢出问题。

```js
function recursion(n) {
  if (n <= 0) return;
  n % 100 === 0  && console.log(`Depth: ${n}`);
  recursion(n - 1)
}
recursion(100000);

function asyncRecursion(n) {
  if (n <= 0) return;
  n % 100 === 0  && console.log(`Depth: ${n}`);
  Promise.resolve().then(() => asyncRecursion(n - 1));
}
asyncRecursion(100000);
```

并发执行任务执行就需要实际启动这个`run`函数，不断尝试调度任务并且执行，而调度任务的方式自然就是通过循环来实现批量调度。这里需要注意的是，执行`run`函数的时候不能`await`，否则就会阻塞当前的事件循环，从而无法实现并发执行任务。

```js
async function tryRun(): Promise<void> {
  const batch = this.maxTasks - this.runningTasks;
  for (let i = 0; i < batch; i++) {
    this.run();
  }
}
```

不过这里其实有个问题，如果此时没有任务可以调度，还是会尝试`maxTasks`次任务执行，这其实是会存在数据库无效读的问题。不过对于数据库来说这里的读操作通常是可以接受的，数据库里状态值是要加索引的，如果实在不可接受就需要排队延迟`run`的执行，例如前个任务`10s`内返回空就不执行。

### 原子读写
那么重写`onRunning`方法的实现，主要是从数据库中读取任务并执行。假设我们查找数据是使用`find`语句，写数据是使用`update`语句，那么假设此时的状态字段为`status`，我们可以定义如下的状态，`pending`待处理、`running`处理中、`completed`完成，`failed`失败。

那么假设现在已经有`id`为`1`和`2`的两个任务处于`pending`状态，并且我们允许最大的并发数为`2`。此时我们在两个独立的任务中进行任务调度，第一步就是查询数据库中状态为`pending`的任务，并且将其状态更新为`running`。

```js
// 任务 1
await find status="pending"
update id=$0 status="running"
// 任务 2
await find status="pending"
update id=$0 status="running"
```

看起来这个调度并没有什么问题，但是实际上会存在竞态条件的问题。由于任务`1`和任务`2`同时执行查询语句，那么两个任务都会查询到`id=1`的任务，然后两个任务都会将其状态更新为`running`，这样就会导致同一个任务被多个进程处理。

```js
// 任务 1
await find status="pending" -> id=1
// 任务 2
await find status="pending" -> id=1
```

究其原因，是因为查询和更新是两个独立的操作，并行的任务会同时触发查询，而本身并没有锁来保证查询到的任务在更新前不会被其他任务修改。因此在并行执行时，需要保证读写状态的操作是原子性的，也就是需要将查询和更新合并为一个操作，例如在`mongodb`中就存在`findOneAndUpdate`方法。

那么在这里我们同样模拟一下数据处理的逻辑，由于`Service`现在是单例的，因此我们直接维护一个二维数组来存储任务。在这里我们实现一个`findAndModify`方法来模拟数据库的查询和更新操作，这个方法会根据传入的查询条件查找任务，并且将其状态更新为新的状态。

```js
export class TasksService {
  public tasks: { id: string; status: "pending" | "running" | "success" | "fail" }[]

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

而重写`running`方法运行任务时，我们就可以调用这个`findAndModify`方法来查询并更新任务状态，从而保证任务的原子性。这里我们模拟任务的执行时间超时时间为`2s`，任务本身是随机生成的执行时长，这里的状态转移同样是使用上述方法来严格控制状态转移，当然也可以用变量标记来处理。

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
      console.log("Task", task.id, "is fail.", error);
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

接下来基本已经完成了单实例单进程的任务队列实现，接下来我们就通过接口实现任务的创建和执行。并且在接口中定义好任务创建的方法，在下面的例子中我们批量创建`5`个任务，然后会调用队列的`tryRun`方法来尝试调度任务。

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

当执行完成`curl`后，我们就可以看到任务被顺序调度执行，并且并发数被限制在`2`以内。当然由于本身任务的执行时间是随机的，因此实际的执行顺序以及任务的状态成功与否都是不确定的。

```
Lock Assign _lock_key 0 -> 1
Lock Assign _lock_key 1 -> 2
Task task_1762683026625_272 is pending => running.
Task task_1762683026625_164 is pending => running.
Task task_1762683026625_272 is running => success.
Task task_1762683026625_272 cost 534 ms.
Task task_1762683026625_164 is running => success.
Task task_1762683026625_164 cost 1556 ms.
Lock Release _lock_key 2 -> 1
Lock Assign _lock_key 1 -> 2
Task task_1762683026625_300 is pending => running.
Lock Release _lock_key 2 -> 1
Lock Assign _lock_key 1 -> 2
Task task_1762683026625_944 is pending => running.
Task task_1762683026625_300 is running => success.
Task task_1762683026625_300 cost 378 ms.
Task task_1762683026625_944 is running => success.
Task task_1762683026625_944 cost 1852 ms.
Lock Release _lock_key 2 -> 1
Lock Assign _lock_key 1 -> 2
Task task_1762683026625_42 is pending => running.
Lock Release _lock_key 2 -> 1
Lock Assign _lock_key 1 -> 2
Lock Release _lock_key 2 -> 1
Task task_1762683026625_42 is running => success.
Task task_1762683026625_42 cost 1119 ms.
Lock Release _lock_key 1 -> 0
Lock Assign _lock_key 0 -> 1
Lock Assign _lock_key 1 -> 2
Lock Release _lock_key 2 -> 1
Lock Release _lock_key 1 -> 0
```

### 分布式锁
实际上关于锁的问题，上述的单进程模式仅需要处理内存，而如果是单机集群模式，即多进程模式可以共享内存或者使用文件系统处理。然而现在常见的都是分布式多实例模式，这种情况下则需要使用`Redis`等外部存储，因为需要一个集中式的锁管理。

此外，`Redis`提供了`RedLock`算法可以实现分布式互斥，也就是阻止并发，因此并不适合我们这里的任务队列场景。还有`Redis`分布式主从部署的情况下，若是`Redis`主节点挂掉，从节点晋升为主节点时，可能会导致短暂的任务超限，即同时运行的任务数超过`MaxTask`。

因此这里我们需要将内存的锁实现替换为`Redis`的分布式锁实现，对比内存的实现，由于本身`Redis`支持`incr`和`decr`原子操作，但是其不能限制其数据范围，因此我们需要使用`LUA`脚本来实现分布式锁的功能。下面是并行任务的`LUA`实现:

```js
/**
 * Redis 自增锁 LUA 脚本
 * - KEYS[1]: 锁的键名
 * - ARGV[1]: 最大任务数 MaxTask
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
 * Redis 自减锁 LUA 脚本
 * - KEYS[1]: 锁的键名
 * @example ioredis.eval(LUA_SCRIPT, 1, LOCK_KEY);
 */
export const DESC_LOCK_LUA = `
  local current = redis.call("GET", KEYS[1])
  
  if not current then
    return 0
  end

  current = tonumber(current)
  if current <= 0 then
    return 0
  end

  local new_count = redis.call("DECR", KEYS[1])
  return new_count
`;
```

## 优雅停机
优雅停机的处理要更复杂一些，因为其不能完全依靠框架本身的处理能力，而是需要我们在应用层进行处理。即我们必须要将信号传递到进程中，如果进程没有收到信号的话，那么就无法进行优雅停机的处理，即使是处理好了相关资源的清理，也没有实际效用。

特别的，在分布式部署的情况下我们都是部署在`Docker`容器中，在这种情况下信号的传递就非常依赖容器本身的配置，以及守护进程的方式。假设停机信号仅发送给主进程而不像是`Ctrl+C`一样发送给进程组，那么优雅停机就必须要主动将信号传递到子进程中，否则子进程将无法进行停机处理。

### SIGINT
`SIGINT`信号就是我们主要关注的信号类型，当我们在终端中按下`Ctrl+C`时，系统会向当前前台进程组发送`SIGINT`信号，从而触发进程的中断处理。在`kill`命令中，`SIGINT`信号的编号为`2`，因此我们也可以通过`kill -2 <pid>`或者`kill -INT <pid>`命令来发送该信号。

在这里我们来实现简单的`SIGINT`信号处理，需要创建简单的`HTTP`服务器，然后通过监听`process.on("SIGINT")`事件来处理信号。当我们执行`Ctrl+C`时，服务器不会立即关闭，而是会输出等待的提示，接下来等待`2s`后关闭，然后才会退出进程。

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

### 信号传递
`Ctrl+C`会给整个前台进程组发送`SIGINT`信号，但是在业务中可能会仅可能给主进程发送`SIGINT`信号，这时候子进程就无法收到信号。我们可以来模拟一下这个行为，当使用`npx`命令时，其并不会将信号转发到其启动的子进程。此外还有个常用的信号是`SIGTERM`，编号为`15`。

```bash
# ps -A -o pid,ppid,comm,args > ps.txt
# lsof -i :3000
# kill -INT 1234
echo "signal.sh PID-PPID $$,$PPID"
npx tsx ./src/index.ts
```

当使用`bash signal.sh`启动脚本时，先输出当前进程的`PID`和以及父进程的`PPID`。此时由于进程是`bash`启动的，因此`PPID`是`bash`的进程号，接下来使用`npx tsx`启动`NodeJs`进程，此时`NodeJs`进程的父进程就是`npx`进程，假设输出是下面的`id`:

```bash
signal.sh PID-PPID 66721,59534
59534 51513 /bin/zsh         /bin/zsh -il                 # zsh shell
66721 59534 bash             bash signal.sh               # bash 
66722 66721 npm exec tsx ./s npm exec tsx ./src/index.ts  # npx tsx
```

此时如果执行`kill -INT 66721`命令发送到脚本进程，会发现`NodeJs`进程并没有收到信号，因此无法进行优雅停机处理。通常在这种情况下只能等待一定时间后强制杀死子进程，也就是`kill -9 <pid>`或者`kill -KILL <pid>`命令。而如果直接`kill -2 66722`，则可以正常停机。

我们的假设是信号仅发送到主进程，而此时的主进程就是`bash`启动命令，无法结束进程就很合理了。这里问题其实就在于我们是使用`npx`启动的进程，这个命令会启动一个新的进程来执行服务的启动命令，在信号不传递的情况下，子进程是无法收到信号的。

在`Bash`中，我们可以使用`exec`命令用于替换当前的`Shell`进程，而不是创建新的子进程。因此，如果我们在`npx`命令前使用`exec`来替换掉当前的`bash`进程，那么信号就可以直接传递到`NodeJs`进程中了。

```bash
exec npx tsx ./src/index.ts
```

此时的进程关系如下所示，此时的主进程就是`67033`进程号了，此时直接`kill -INT 67033`就可以正常收到信号并且进行优雅停机处理了。这里还需要关注一下，我们是直接使用终端执行的命令，所以其本身的进程`59534`即`zsh`进程号就是父进程号。

```bash
signal.sh PID-PPID 67033,59534
59534 51513 /bin/zsh         /bin/zsh -il
67033 59534 npm exec tsx ./s npm exec tsx ./src/index.ts   
```

由于`npx`会创建子进程来执行命令，因此若是启动服务的命令本身如果也是创建子进程的方式，那么同样会存在信号无法传递的问题。因此在使用`pm2`等进程管理工具时，也需要注意其启动命令的信号传递问题，那么这种情况下我们可以避免使用`npx`命令来启动进程，此时服务就作为顶层进程启动了。

```bash
export PATH="$PWD/node_modules/.bin:$PATH"
exec tsx ./src/index.ts
```

```bash
signal.sh PID-PPID 67675,59534
59534 51513 /bin/zsh         /bin/zsh -il
67675 59534 node             node /xxx/node_modules/.bin/../tsx/dist/cli.mjs ./src/index.ts
```

### 子进程管理
由于下面需要以`PM2`在集群模式下实现信号传递，在这里我们就先做一个简单有趣的实验，主要是为了观察子进程执行的情况。通常情况下我们会在部署环境中使用容器内的进程例如`systemd`来守护进程，并不会使用`pm2`的守护进程，但是如果直接使用`pm2`守护，那就需要主动传递信号。

因此在这里我们实现一个简单的父子进程模型，相当于简单地表示一下进程的模型。`child.sh`是普通的脚本，在这里会直接使用`while`来保持进程。`normal.sh`是父进程脚本，使用`bash`启动`child.sh`作为子进程。`fork.sh`也是父进程脚本，但是会使用`disown`来分离进程。

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

当我们分别使用两个终端来启动`normal.sh`以及`fork.sh`后，可以观察到`normal`进程会持有且不会停止，`fork`进程会结束先前的进程，可以在终端里执行其他命令，类似于将其放置于后台，注意输出重定向到`tty`终端不会停, 也可以输出到文件。

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

### PM2 进程
在先前的实验中我们已经观察到了信号传递的问题，那么在`pm2`中同样会存在这个问题。假设我们使用`pm2 start`来启动进程，这种情况下就是使用`fork`模式启动的进程，因此信号是无法传递到子进程中的，因为这个进程会立即结束掉。

```bash
export PORT=3000
echo "bootstrap.sh PID-PPID $$,$PPID"
npx tsc --project tsconfig.json
export PATH="$PWD/node_modules/.bin:$PATH"
exec pm2 start ./dist/index.js -i 2 --kill-timeout 5000 --log-date-format="YYYY-MM-DD HH:mm:ss" --log ./output.log
```

此时的进程树关系如下，由于进程会立即结束，此时`pm2`的主进程的父进程就是`1`。然后由于是使用的集群模式，因此会启动两个子进程来执行服务，而这两个子进程的父进程就是`pm2`的主进程，此时我们是没有办法发送`SIGINT`信号给主进程，自然子进程也无法收到信号。

```bash
73353     1 PM2 v6.0.8: God  PM2 v6.0.8: God Daemon (/Users/czy/.pm2) 
73354 73353 node /Users/czy/ node /xxx/graceful-shutdown/dist/index.js 
73355 73353 node /Users/czy/ node /xxx/graceful-shutdown/dist/index.js 
```

在这种情况下，如果需要尝试优雅停机处理，那么就需要主动将信号传递到子进程中。通常来说由于进程结束，我们无法从主进程中得到子进程的`PID`，因此只能通过`pm2`提供的命令来获取子进程的`PID`，或者直接使用`ps`来匹配`PID`，然后再发送信号，这种情况下是可以优雅停机的。

```bash
kill -INT $(pgrep pm2)
```

因此，我们可以组合上面的脚本来实现信号的传递处理，首先需要避免主进程脚本结束掉，因此需要使用`while`来保持进程，然后在收到信号时获取子进程的`PID`并且传递信号。注意这种情况下不能用`exec`了，需要正常`fork`出子进程，否则后续`while`以及`trap`代码不会执行。

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

实际上，`pm2`当前支持了`pm2-runtime`命令来更好地支持容器化场景下的进程管理，同样的之前叙述的`npx`命令问题也会出现。从下面的进程树中可以看出来信号传递会比之前多了一层，而执行`kill -INT 80795`命令时，子进程是无法收到信号的，进程也不会结束。

```bash
78367 51513 /bin/zsh         /bin/zsh -il
80795 78367 bash             bash bootstrap.sh
80819 80795 npm exec pm2-run npm exec pm2-runtime start pm2.config.js --env production      
80836 80819 node             node /xxx/.bin/../pm2/bin/pm2-runtime start pm2.config.js --env production
80844 80836 node /Users/czy/ node /xxx/graceful-shutdown/dist/index.js     
80845 80836 node /Users/czy/ node /xxx/graceful-shutdown/dist/index.js 
```

因此这里的实现仍然需要保证使用`exec`来启动`pm2-runtime`服务，此外该命令不会启动`pm2`的守护进程，相关日志会直接输出到当前`shell`中。而且也是支持集群模式的，下面的例子展示了使用`pm2-runtime`启动的进程关系树，执行`kill -INT 84685`可以正常处理信号。

```bash
78367 51513 /bin/zsh         /bin/zsh -il
78673 78367 node             node /xxx/.bin/../pm2/bin/pm2-runtime start pm2.config.js --env production
78704 78673 node /Users/czy/ node /xxx/graceful-shutdown/dist/index.js     
78705 78673 node /Users/czy/ node /xxx/graceful-shutdown/dist/index.js
```

### 心跳机制
在分布式环境下，除了信号传递的问题之外，还有一个问题就是进程本身的存活检测问题。假设某个实例由于某些原因直接退出了，那么此时就无法进行优雅停机处理了，因此我们需要通过心跳机制来检测进程的存活状态，以此来维护服务本身的健壮性。

心跳机制的实现其实非常简单，主要是通过定时向存储位置写入当前的时间戳来表示进程的存活状态。假设我们使用`Redis`来存储心跳时间戳，那么每个实例可以使用唯一的`key`来存储自己的心跳时间戳，然后定时更新这个时间戳。

```js
export const launchInstance = () => {
  const keep = () => {
    // 更新 Redis 心跳时间戳
    setTimeout(keep, LOOP_TIME);
  };
  keep();
  // 开机时清理一次过期实例
  const res = clearInactiveInstances();
  console.log("Active Instance", res.active);
  console.log("Inactive Instance", res.inactive);
};

export const terminateInstance = () => {
  // 优雅停机时删除当前实例
};

export const clearInactiveInstances = () => {
  const entries = Object.entries(MEMORY_MAP);
  const now = Date.now();
  const active: string[] = [];
  const inactive: string[] = [];
  for (const [key, value] of entries) {
    if (now - Number(value) > ACTIVE_TIME_OUT) {
      // 清理过期实例
      inactive.push(key);
      continue;
    }
    active.push(key);
  }
  return { active, inactive };
};
```

由于实例本身如果退出了，那么心跳时间戳就不会再更新了，而且守护进程的存在，退出的进程会在一段时间内重启。那么在业务中，例如我们最开始聊的任务队列实现中，我们就可以在实例启动的时获取当前的活跃实例，然后检查正在运行任务的调度实例`id`是否还在活跃实例中，以此来尝试重新调度任务。

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

## 总结
在文本中我们实现了一个简单的分布式任务队列，并且实现了优雅停机的处理。任务队列主要是通过分布式锁来限制并发数，从而保证任务能够被合理地调度执行，从而实现长任务的异步调度机制，并且实现任务的流量削峰、错误重试等。

优雅停机的处理主要是通过信号传递来实现的，从而保证进程能够在收到停机信号时进行资源的清理和任务的完成，避免任务的中断和数据的不一致问题。此外还叙述了父子进程间的信号传递，以及实现心跳机制来检测实例的存活状态，从而保证分布式环境下的服务健壮性。

## 每日一题

- <https://github.com/WindRunnerMax/EveryDay>

## 参考
- <https://docs.nestjs.com/modules>
- <https://pm2.keymetrics.io/docs/usage/docker-pm2-nodejs/>
- <https://pm2.keymetrics.io/docs/usage/signals-clean-restart/>
