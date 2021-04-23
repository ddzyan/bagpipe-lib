const Bagpipe = require('../lib');
const assert = require('assert');
describe('bagpipe test', function () {
  const asyncFn = function (ms, cb) {
    setTimeout(() => {
      cb(null, {});
    }, ms);
  };

  it('单个异步任务 test', function (done) {
    const bagpipe = new Bagpipe(1);

    // 第一个：异步方法 最后一个为异步完成后的回调 其他都为传入异步方法的参数
    bagpipe.push(asyncFn, 1 * 1000, () => {
      assert.strictEqual(bagpipe.queue.length, 0, '执行完毕数组长度错误');
      assert.strictEqual(bagpipe.activeJob, 0, '执行完毕任务数量错误');
      done();
    });
  });

  it('多个异步任务 test', function (done) {
    const bagpipe = new Bagpipe(3);

    // 第一个：异步方法 最后一个为异步完成后的回调 其他都为传入异步方法的参数
    let count = 10;
    for (let index = 0; index < count; index++) {
      bagpipe.push(asyncFn, 1 * 1000, () => {
        assert(bagpipe.activeJob <= 3, '正在执行的任务数量错误');
        count--;
        if (count === 0) {
          assert.strictEqual(bagpipe.queue.length, 0, '执行完毕数组长度错误');
          assert.strictEqual(bagpipe.activeJob, 0, '执行完毕任务数量错误');
          done();
        }
      });
    }
  });
});
