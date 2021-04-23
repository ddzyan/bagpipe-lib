const Bagpipe = require('./lib');

const asyncFn = function (ms, callback) {
  setTimeout(function () {
    callback(null, {});
  }, ms);
};

const bagpipe = new Bagpipe(3);

for (let i = 0; i < 10; i++) {
  bagpipe.push(asyncFn, 10000, function (error) {
    console.log('bagpipe queue', bagpipe.queue.length);
    console.log('bagpipe activeJob', bagpipe.activeJob);
    console.log('success');
  });
}

bagpipe.on('full', function (a) {
  console.log(a);
});
