# Jest中Mock网络请求
最近需要将一个比较老的库修改为`TS`并进行单元测试，修改为`TS`还能会一点，单元测试纯粹是现学现卖了，初学`Jest`框架，觉得在单元测试中比较麻烦的就是测试网络请求，所以记录一下`Mock`掉`Axios`发起网络请求的一些方式。初学两天的小白，如有问题还请指出。

## 描述
文中提到的示例全部在 [jest-axios-mock-server仓库](https://github.com/WindrunnerMax/jest-axios-mock-server) 中，直接使用包管理器安装就可以启动示例，例如通过`yarn`安装：

```shell
$ yarn install
```

在`package.json`中指定了一些命令，分别如下：
* `npm run build`: `rollup`的打包命令。
* `npm run test:demo1`: 简单地`mock`封装的网络请求库。
* `npm run test:demo2`: 采用重新实现并`hook`的方式完成`mock`。
* `npm run test:demo3`: 使用`Jest`中的库完成`demo2`的实现。
* `npm run test:demo4-5`: 启动一个`node`服务器，通过`axios`的`proxy`将网络请求进行代理，转发到启动的`node`服务器，通过设置好对应的单元测试请求与响应的数据，利用对应关系实现测试，也就是`jest-axios-mock-server`完成的工作。

在这里我们封装了一层`axios`，比较接近真实场景，可以查看`test/demo/wrap-request.ts`文件，实际上只是简单的在内部创建了一个`axios`实例，并且转发了一下响应的数据而已，`test/demo/index.ts`文件简单地导出了一个`counter`方法，这里对于这两个参数有一定的处理然后才发起网络请求，之后对于响应的数据也有一定的处理，只是为了模拟一下相关的操作而已。

```typescript
// test/demo/wrap-request.ts
import axios, { AxiosRequestConfig } from "axios";

const instance = axios.create({
    timeout: 3000,
});

export const request = (options: AxiosRequestConfig): Promise<any> => {
    // do something wrap
    return instance.request(options).then(res => res.data);
};
```

```typescript
// test/demo/index.ts
import { request } from "./wrap-request";

export const counter = (id: number, number: number): Promise<{ result: number; msg: string }> => {
    const operate = number > 0 ? 1 : -1;
    return request({
        url: "https://www.example.com/api/setCounter",
        method: "POST",
        data: { id, operate },
    })
        .then(res => {
            if (res.result === 0) return { result: 0, msg: "success" };
            if (res.result === -100) return { result: -100, msg: "need login" };
            return { result: -999, msg: "fail" };
        })
        .catch(err => {
            return { result: -999, msg: "fail" };
        });
};
```

此处的`Jest`使用了`JSDOM`模拟的浏览器环境，在`jest.config.js`中配置的`setupFiles`属性中配置了启动文件`test/config/setup.js`，在此处初始化了`JSDOM`。
```javascript
import { JSDOM } from "jsdom";

const config = {
    url: "https://www.example.com/",
    domain: "example.com",
};
const dom = new JSDOM("", config);
global.document = dom.window.document;
global.document.domain = config.domain;
global.window = dom.window;
global.location = dom.window.location;

```

## demo1: 简单Mock网络请求
在`test/demo1.test.js`中进行了简单的`mock`处理，通过`npm run test:demo1`即可尝试运行，实际上是将包装`axios`的`wrap-request`库进行了一个`mock`操作，在`Jest`启动时会进行编译，在这里将这个库`mock`掉后，所有在之后引入这个库的文件都是会获得`mock`后的对象，也就是说我们可以认为这个库已经重写了，重写之后的方法都是`JEST`的`Mock Functions`了，可以使用诸如`mockReturnValue`一类的函数进行数据模拟，关于`Mock Functions`可以参考`https://www.jestjs.cn/docs/mock-functions`。

```javascript
// test/demo1.test.js
import { counter } from "./demo";
import { request } from "./demo/wrap-request";

jest.mock("./demo/wrap-request");

describe("Simple mock", () => {
    it("test success", () => {
        request.mockResolvedValue({ result: 0 });
        return counter(1, 2).then(res => {
            expect(res).toStrictEqual({ result: 0, msg: "success" });
        });
    });

    it("test need login", () => {
        request.mockResolvedValue({ result: -100 });
        return counter(1, 2).then(res => {
            expect(res).toStrictEqual({ result: -100, msg: "need login" });
        });
    });

    it("test something wrong", () => {
        request.mockResolvedValue({ result: 1111111 });
        return counter(1, 2).then(res => {
            expect(res).toStrictEqual({ result: -999, msg: "fail" });
        });
    });
});
```

在这里我们完成了返回值的`Mock`，也就是说对于`wrap-request`库中的`request`返回的值我们都能进行控制了，但是之前也提到过对于传入的参数也有一定的处理，这部分内容我们还没有进行断言，所以对于这个我们同样需要尝试进行处理。

## demo2: hook网络请求
`demo2`通过`npm run test:demo2`即可尝试运行，在上边提到了我们可以处理返回值的情况，但是没法断言输入的参数是否正确进行了处理，所以我们需要处理一下这种情况，所幸`Jest`提供了一种可以直接实现被`Mock`的函数库的方式，当然实际上`Jest`还提供了`mockImplementation`的方式，这个是在`demo3`中使用的方式，在这里我们重写了被`mock`的函数库，在实现的时候也可以使用`jest.fn`完成`Implementations`，这里通过在返回之前写入了一个`hook`函数，并且在各个`test`时再实现断言或者是指定返回值，这样就可以解决上述问题，实际上就是实现了`Jest`中`Mock Functions`的`mockImplementation`。

```javascript
// test/demo2.test.js
import { counter } from "./demo";
import * as request from "./demo/wrap-request";

jest.mock("./demo/wrap-request", () => {
    let hook = () => ({ result: 0 });
    return {
        setHook: cb => (hook = cb),
        request: (...args) => {
            return new Promise(resolve => {
                resolve(hook(...args));
            });
        },
    };
});

describe("Simple mock", () => {
    it("test success", () => {
        request.setHook(() => ({ result: 0 }));
        return counter(1, 2).then(res => {
            expect(res).toStrictEqual({ result: 0, msg: "success" });
        });
    });

    it("test need login", () => {
        request.setHook(() => ({ result: -100 }));
        return counter(1, 2).then(res => {
            expect(res).toStrictEqual({ result: -100, msg: "need login" });
        });
    });

    it("test something wrong", () => {
        request.setHook(() => ({ result: 1111111 }));
        return counter(1, 2).then(res => {
            expect(res).toStrictEqual({ result: -999, msg: "fail" });
        });
    });

    it("test param transform", () => {
        return new Promise(done => {
            request.setHook(({ data }) => {
                expect(data).toStrictEqual({ id: 1, operate: 1 });
                done();
                return { result: 0 };
            });
            counter(1, 1000);
        });
    });
});
```

## demo3: 使用Jest的mockImplementation
`demo3`通过`npm run test:demo3`即可尝试运行，在`demo2`中的例子实际上是写复杂了，在`Jest`中`Mock Functions`有`mockImplementation`的实现，直接使用即可。

```javascript
// test/demo3.test.js
import { counter } from "./demo";
import { request } from "./demo/wrap-request";

jest.mock("./demo/wrap-request");

describe("Simple mock", () => {
    it("test success", () => {
        request.mockImplementation(() => Promise.resolve({ result: 0 }));
        return counter(1, 2).then(res => {
            expect(res).toStrictEqual({ result: 0, msg: "success" });
        });
    });

    it("test need login", () => {
        request.mockImplementation(() => Promise.resolve({ result: -100 }));
        return counter(1, 2).then(res => {
            expect(res).toStrictEqual({ result: -100, msg: "need login" });
        });
    });

    it("test something wrong", () => {
        request.mockImplementation(() => Promise.resolve({ result: 1111111 }));
        return counter(1, 2).then(res => {
            expect(res).toStrictEqual({ result: -999, msg: "fail" });
        });
    });

    it("test param transform", () => {
        return new Promise(done => {
            request.mockImplementation(({ data }) => {
                expect(data).toStrictEqual({ id: 1, operate: 1 });
                done();
                return Promise.resolve({ result: 0 });
            });
            counter(1, 1000);
        });
    });
});
```

## demo4-5: 真实发起网络请求
`demo4`与`demo5`通过`npm run test:demo4-5`即可尝试运行，采用这种方式是进行了真正的数据请求，在这里会利用`axios`的代理，将内部的数据请求转发到指定的服务器端口，当然这个服务器也是在本地启动的，通过指定对应的`path`相关的请求与响应数据进行测试，如果请求的数据不正确，则不会正常匹配到相关的响应数据，这样这个请求会直接返回`500`，返回的响应数据如果不正确的话也会在断言时被捕捉。在这里就使用到了`jest-axios-mock-server`库，首先我们需要指定三个文件，分别对应每个单元测试文件启动前执行，`Jest`测试启动前执行，与`Jest`测试完成后执行的三个生命周期进行的操作，分别是`jest.config.js`配置文件的`setupFiles`、`globalSetup`、`globalTeardown`三个配置项。    
首先是`setupFiles`，在这里我们除了初始化`JSDOM`之外，还需要对`axios`的默认代理进行操作，因为采用的方案是使用`axios`的`proxy`进行数据请求的转发，所以才需要在单元测试的最前方设定代理值。

```javascript
// test/config/setup.js
import { JSDOM } from "jsdom";
import { init } from "../../src/index";
import axios from "axios";

const config = {
    url: "https://www.example.com/",
    domain: "example.com",
};
const dom = new JSDOM("", config);
global.document = dom.window.document;
global.document.domain = config.domain;
global.window = dom.window;
global.location = dom.window.location;

init(axios);
```

之后便是`globalSetup`与`globalTeardown`两个配置项，在这里指的是`Jest`单元测试启动前与全部测试完毕后进行的操作，我们将服务器启动与关闭的操作都放在这里，请注意，在这两个文件运行的文件是单独的一个独立`context`，与任何进行的单元测试的`context`都是无关的，包括`setupFiles`配置项指定的文件，所以在此处所有的数据要么是通过在配置文件中指定，要不就是通过网络在服务器端口之间进行传输。

```javascript
// test/config/global-setup.js
import { run } from "../../src";
export default async () => {
    await run();
};
```

```javascript
// test/config/global-teardown.js
import { close } from "../../src";
export default async function () {
    await close();
}
```

对于配置端口与域名信息，将其直接放置在`jest.config.js`中的`globals`字段中了，对于`debug`这个配置项，建议和`test.only`配合使用，在调用服务器信息的过程中可以打印出相关的请求信息。

```javascript
// jest.config.js
module.exports = {
    // ...
    globals: {
        host: "127.0.0.1",
        port: "5000",
        debug: false,
    },
    // ...
}
```

当然，或许会有提出为什么不在每个单元测试文件的`beforeAll`与`afterAll`生命周期启动与关闭服务器，首先这个方案我也尝试过，首先对于每个测试文件将服务器启动结束后再关闭虽然相对比较耗费时间，但是理论上还是合理的，毕竟要进行数据隔离的话确实是没错，但是在`afterAll`关闭的时候就出了问题，因为`node`服务器在关闭时调用的`close`方法并不会真实地关闭服务器以及端口占用，他只是停止处理请求了，端口还是被占用，当启动第二个单元测试文件时会抛出端口正在被占用的异常，虽然现在已经有一些解决的方案，但是我尝试过后并不理想，会偶现端口依旧被占用的情况，尤其是在`node`开机后第一次被运行的情况，异常的概率比较大，所以效果不是很理想，最终还是采用了这种完全隔离的方案，具体相关的问题可以参考`https://stackoverflow.com/questions/14626636/how-do-i-shutdown-a-node-js-https-server-immediately`。  
由于采用的是完全隔离的方案，所以我们想给测试的请求进行请求与响应数据的传输的时候，只有两个方案，要么在服务器启动的时候，也就是`test/config/global-setup.js`文件中将数据全部指定完成，要么就是通过网络进行数据传输，即在服务器运行的过程中通过指定`path`然后该`path`的网络请求会携带数据，在服务器的闭包中会把这个数据请求指定，当然在这里两种方式都支持，我觉得还是在每个单元测试文件中指定一个自己的数据比较合适，所以在这里仅示例了在单元测试文件中指定要测试的数据。关于要测试的数据，指定了一个`DataMapper`类型，以减少类型出错导致的异常，在这里示例了两个数据集，另外在匹配`query`和`data`时是支持正则表达式的，对于`DataMapper`类型的结构还是比较标准的。

```typescript
// test/data/demo1.data.ts
import { DataMapper } from "../../src";

const data: DataMapper = {
    "/api/setCounter": [
        {
            request: {
                method: "POST",
                data: '{"id":1,"operate":1}',
            },
            response: {
                status: 200,
                json: {
                    result: 0,
                },
            },
        },
        {
            request: {
                method: "POST",
                data: /"id":2,"operate":-1/,
            },
            response: {
                status: 200,
                json: {
                    result: -100,
                },
            },
        },
    ],
};

export default data;
```

```javascript
// test/data/demo2.data.ts
import { DataMapper } from "../../src";

const data: DataMapper = {
    "/api/setCounter": [
        {
            request: {
                method: "POST",
                data: /"id":3,"operate":-1/,
            },
            response: {
                status: 200,
                json: {
                    result: -100,
                },
            },
        },
    ],
};

export default data;
```

最后进行的两个单元测试中就在`beforeAll`中指定了要测试的数据，要注意这里是`return setSuitesData(data)`，因为要在数据设置成功响应以后在进行单元测试，之后就是正常的请求与响应以及断言测试是否正确了。

```javascript
// test/demo4.test.js
import { counter } from "./demo";
import { setSuitesData } from "../src/index";
import data from "./data/demo1.data";

beforeAll(() => {
    return setSuitesData(data);
});

describe("Simple mock", () => {
    it("test success", () => {
        return counter(1, 2).then(res => {
            expect(res).toStrictEqual({ result: 0, msg: "success" });
        });
    });

    it("test need login", () => {
        return counter(2, -3).then(res => {
            expect(res).toStrictEqual({ result: -100, msg: "need login" });
        });
    });
});
```

```javascript
// test/demo5.test.js
import { counter } from "./demo";
import { setSuitesData } from "../src/index";
import data from "./data/demo2.data";

beforeAll(() => {
    return setSuitesData(data);
});

describe("Simple mock", () => {
    it("test success", () => {
        return counter(3, -30).then(res => {
            expect(res).toStrictEqual({ result: -100, msg: "need login" });
        });
    });

    it("test no match response", () => {
        return counter(6, 2).then(res => {
            expect(res).toStrictEqual({ result: -999, msg: "fail" });
        });
    });
});
```

## BLOG
```
https://github.com/WindrunnerMax/EveryDay/
```

## 参考
```
https://www.jestjs.cn/docs/mock-functions
https://stackoverflow.com/questions/41316071/jest-clean-up-after-all-tests-have-run
https://stackoverflow.com/questions/14626636/how-do-i-shutdown-a-node-js-https-server-immediately
```