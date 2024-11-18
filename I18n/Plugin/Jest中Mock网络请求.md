# Mocking Network Requests in Jest

I recently needed to modify an older library to use `TS` and perform unit testing. Modifying it to use `TS` was not too difficult, but diving into unit testing was a whole new ball game for me. As I was just starting out with the `Jest` framework, I found testing network requests a bit challenging. So, I decided to jot down some ways to `Mock` `Axios` to make network requests. As a newbie who's just started exploring this for a couple of days, I'd appreciate any feedback or corrections.

## Description
All the examples mentioned in this document can be found in the [jest-axios-mock-server repository](https://github.com/WindrunnerMax/jest-axios-mock-server). You can simply install it using a package manager, for example with `yarn`:

```shell
$ yarn install
```

In the `package.json`, there are several specified commands as follows:
* `npm run build`: The command for building with `rollup`.
* `npm run test:demo1`: Simple `mock` encapsulation of the network request library.
* `npm run test:demo2`: Using reimplementation and `hook` to complete the `mock`.
* `npm run test:demo3`: Using the library within `Jest` to achieve the implementation of `demo2`.
* `npm run test:demo4-5`: Starts a `node` server and uses `axios`'s `proxy` to proxy the network requests to the started `node` server. With the corresponding unit test request and response data set up, it utilizes the corresponding relationships to achieve testing. In other words, this is the work completed by `jest-axios-mock-server`.

Here, we've encapsulated another layer of `axios`, which is closer to the real scenario. You can check the `test/demo/wrap-request.ts` file, which essentially just creates a `axios` instance internally and forwards the response data. The `test/demo/index.ts` file simply exports a `counter` method, where there's some processing for the two parameters before making a network request, and then there's also some processing for the response data. All of this is just to simulate some related operations.

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

In this case, `Jest` uses a `JSDOM` simulated browser environment. The `jest.config.js` file has the `setupFiles` property configured with the startup file `test/config/setup.js`, where `JSDOM` is initialized. 
```javascript
import { JSDOM } from "jsdom";
```

```javascript
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

## demo1: Simple Network Request Mocking
A simple `mock` operation is performed in `test/demo1.test.js`, you can try running it by `npm run test:demo1`. In fact, it is a `mock` operation on the `wrap-request` library that wraps `axios`. When Jest is started, it will be compiled. Here, after `mocking` this library, all the files that import this library afterwards will get the `mocked` object. In other words, we can consider that this library has been rewritten, and after rewriting, the methods are all `JEST`'s`Mock Functions`, and you can use functions like `mockReturnValue` for data simulation. For more information on `Mock Functions`, you can refer to `https://www.jestjs.cn/docs/mock-functions`.

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

Here, we have completed the `Mock` of the return value. This means that we can control the return value of the `request` in the `wrap-request` library. However, it was mentioned earlier that there is also a certain amount of processing for the input parameters, which we have not yet asserted, so we also need to try to process this part.

## demo2: hook Network Request
You can try running `demo2` through `npm run test:demo2`. As mentioned above, we can handle the return value, but we cannot assert whether the input parameters have been correctly processed. Fortunately, `Jest` provides a way to directly implement a `Mock` of the function library. In fact, `Jest` also provides a way to use `mockImplementation`, which is the method used in `demo3`. Here, we have rewritten the function library being `mocked`, and in the implementation, we can also use `jest.fn` to complete the `Implementations`. Here, by writing a `hook` function before returning, and implementing assertions or specifying return values in each `test`, we can solve the above problem, which is actually the implementation of `mockImplementation` in `Jest`'s `Mock Functions`.
```javascript
// test/demo2.test.js
import { counter } from "./demo";
import * as request from "./demo/wrap-request";
```

```javascript
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

## demo3: Using Jest's mockImplementation
To run `demo3`, simply use `npm run test:demo3`. The example in `demo2` is actually more complicated than necessary. In Jest, `Mock Functions` have an implementation called `mockImplementation`, which can be directly used.

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
```

```javascript
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

## demo4-5: Real Network Request Initiation
`Demo4` and `demo5` can be run by using `npm run test:demo4-5`. This method involves actual data requests. Here, `axios` is used for proxying the internal data requests to a specified server port. This server is also locally initiated and is used to test specific requests and corresponding response data. If the requested data is incorrect, it will not match the relevant response data, which will then result in a direct return of `500`. Any incorrect response data will also be caught during assertion. This is where the `jest-axios-mock-server` library comes into play. First, three files need to be specified for each of the three lifecycle operations: before the start of each unit test file, before the start of `Jest` testing, and after `Jest` testing has completed. These files are configured in the `jest.config.js` file under the `setupFiles`, `globalSetup`, and `globalTeardown` configurations.

Firstly, the `setupFiles` file, in which we initialize `JSDOM` and also perform operations on the default proxy of `axios`. This is necessary due to the approach of using `axios`'s `proxy` for forwarding data requests, requiring the initialization of proxy values at the beginning of unit testing.

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

Next are the `globalSetup` and `globalTeardown` configurations, where we start and shut down the server. It is important to note that the files run in this context are entirely separate from any context of the actual unit testing or those specified in the `setupFiles` configuration. This includes the exchange of data over the network between server ports.

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

For configuring port and domain information, they can be directly placed in the `jest.config.js` file under the `globals` field. Regarding the `debug` configuration, it is recommended to use it in conjunction with `test.only` to print relevant request information while calling server information.


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

Of course, there may be a question about why not start and stop the server in the `beforeAll` and `afterAll` lifecycles of each unit test file. First of all, I have tried this approach. Starting and stopping the server for each test file does take some time, but theoretically it's still reasonable. After all, it's correct to isolate the data. However, there was a problem when closing in the `afterAll` phase. This is because the `close` method called when the `node` server shuts down does not actually close the server and release the port. It just stops handling requests, so the port is still in use. When starting the second unit test file, a "port in use" exception is thrown. Although there are some solutions now, my attempts did not yield ideal results. There were occasional cases where the port was still occupied, especially the first time it was run after `node` was booted, with a relatively high incidence of exceptions. Therefore, the effect was not very satisfactory. In the end, I chose this completely isolated approach. For specific related issues, you can refer to `https://stackoverflow.com/questions/14626636/how-do-i-shutdown-a-node-js-https-server-immediately`.  
Since a completely isolated approach is used, when we want to transfer request and response data for testing, we have only two options. Either specify all the data when the server starts, that is, in the file `test/config/global-setup.js`, or transfer the data over the network, i.e., during the server's operation, the specified `path` will carry the data with the network request. In the server's closure, this data request will be specified. Of course, both ways are supported here, but I think it's more appropriate to specify one's own data in each unit test file, so here I only provided an example of specifying the data to be tested in the unit test file. Regarding the data to be tested, I specified a `DataMapper` type to reduce exceptions caused by type errors. Here are two data sets as examples. Also, when matching `query` and `data`, regular expressions are supported. The structure of the `DataMapper` type is quite standard.

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

In the final two unit tests, I specified the data to be tested in the `beforeAll` phase. It's important to note that it is `return setSuitesData(data)` here, because the unit tests should be conducted only after the data is successfully set. Then it's just normal requests and responses, and assertions to test correctness.


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

## Daily Challenge
```
https://github.com/WindrunnerMax/EveryDay/
```

## Reference
```
https://www.jestjs.cn/docs/mock-functions
https://stackoverflow.com/questions/41316071/jest-clean-up-after-all-tests-have-run
https://stackoverflow.com/questions/14626636/how-do-i-shutdown-a-node-js-https-server-immediately
```