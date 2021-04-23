const { assert } = require('console');
const { EventEmitter } = require('events');

const DEFAULT_MAT_TIME = 60 * 1000;

class Bagpipe extends EventEmitter {
  /**
   *
   * @param {number} activeJobLimit 执行的异步任务上限
   */
  constructor(activeJobLimit, timeout = DEFAULT_MAT_TIME, ratio = 2) {
    assert(activeJobLimit, 'activeJobLimit is required');
    super();
    this.queueLimit = Math.round(activeJobLimit * ratio); // 队列上限
    this.activeJobLimit = activeJobLimit; // 活跃任务上限
    this.activeJob = 0; // 活跃任务数量
    this.queue = []; // 任务队列
    this.tick = false; // 队列任务执行完毕标志
    this.timeout = timeout; // 异步任务超时时间
  }

  /**
   * @description 添加异步任务
   * @param {Function} method 异步方法
   * @param  {...any} args
   * @returns this
   */
  push(method, ...args) {
    if (typeof args[args.length - 1] !== 'function') {
      args.push(function () {});
    }

    const cb = args[args.length - 1];

    // 超出任务上限，则不再往队列中添加，而是直接报错
    if (this.queue.length > this.queueLimit) {
      const err = new Error('Too much async call in queue');
      return cb(err);
    } else {
      this.queue.push({
        method,
        args,
      });
    }

    if (this.queue.length > 1) {
      console.warn('queue full', this.queue.length);
      // 队列满载通知
      this.emit('full', this.queue.length);
    }

    this.next();
    return this;
  }

  next() {
    // 当正在执行的任务数量超过了可执行的任务数量上限，或者队列为空，则跳出
    if (this.activeJob >= this.activeJobLimit || !this.queue.length) {
      return;
    }

    const { method, args } = this.queue.shift(); // 取出第一个任务

    this._job(1);

    let called = false;
    let timer;
    const callback = args[args.length - 1];

    args[args.length - 1] = (error, ...rest) => {
      if (timer) {
        clearTimeout(timer);
      }

      if (!called) {
        this._nextJob();
        callback(error, ...rest);
      }
    };

    timer = setTimeout(() => {
      called = true;
      this._nextJob();
      const err = new Error(this.timeout + 'ms timeout');
      err.name = 'BagpipeTimeoutError';
      err.data = {
        name: method.name,
        method: method.toString(),
        args: args.slice(0, -1),
      };
      callback(err);
    }, this.timeout);

    method(...args);
  }

  _nextJob() {
    this._job(-1);
    this.next();
  }

  _job(value) {
    this.activeJob += value;
    // 任务全部执行完毕，tick为锁
    if (value < 1 && !this.tick) {
      this.tick = true;
      process.nextTick(() => {
        this.tick = false;
        if (this.queue === 0 && this.activeJob === 0) {
          // 考虑将所有任务结果收集返回
          this.emit('end');
        }
      });
    }
  }
}

module.exports = Bagpipe;
