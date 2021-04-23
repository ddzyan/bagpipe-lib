## 简介

充分使用异步任务处理方式，来加快任务的执行速度，并且避免由于任务数量过多导致的报错

可以通过设置以下参数进行调整：

- timeout 异步任务超时时间
- ratio 异步任务队列长度，避免加入过多的异步任务
- activeJobLimit 并行执行的异步任务数量

## 安装

```shell
npm i bagpipe --save
```

## 使用

```js
const Bagpipe = require('bagpipe');

const asyncFn = function (ms, callback) {
  setTimeout(function () {
    callback(null, {});
  }, ms);
};

const bagpipe = new Bagpipe(3);

for (let i = 0; i < 10; i++) {
  bagpipe.push(asyncFn, 10, function () {
    console.log('success');
  });
}
```
