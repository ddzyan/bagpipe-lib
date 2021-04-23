## 简介

充分使用异步任务处理方式，来加快任务的执行速度，并且避免由于任务数量过多导致的报错

可以通过设置以下参数进行调整：

- timeout 异步任务超时时间
- ratio 异步任务队列长度，避免加入过多的异步任务
- activeJobLimit 并行执行的异步任务数量

可以通过监听 full 事件，可以获得满载通知，可以根据情况修改 activeJobLimit 数量

### 待优化内容

- ts 重构
- 支持一次性返回所有异步结果
- 支持 promise 使用

## 安装

```shell
npm i bagpipe --save
```

## 使用

```js
const Bagpipe = require('./lib');

const asyncFn = function (ms, callback) {
  setTimeout(function () {
    callback(null, {});
  }, ms * 1000);
};

const bagpipe = new Bagpipe(3);

bagpipe.on('full', length => {
  console.log('full', length);
});

for (let i = 0; i < 5; i++) {
  bagpipe.push(asyncFn, 2, function () {
    console.log('success');
  });
}
```
