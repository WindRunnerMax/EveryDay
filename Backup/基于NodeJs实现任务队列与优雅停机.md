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
锁，单进程模式仅需要处理内存，单机集群即多进程模式可以共享内存或者使用文件系统，分布式多实例模式则需要使用`Redis`等外部存储

这些分布式任务队列库都需要接入消息队列或数据库作为后端存储

## 优雅停机

### 子进程信号

## 每日一题

- <https://github.com/WindRunnerMax/EveryDay>

## 参考
- <https://docs.nestjs.com/modules>
- <https://pm2.keymetrics.io/docs/usage/signals-clean-restart/>
- <https://github.com/WindRunnerMax/webpack-simple-environment>
