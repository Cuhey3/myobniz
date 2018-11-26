const redis = require('redis');
const bluebird = require('bluebird');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
const client = redis.createClient(process.env.REDISCLOUD_URL);
const hash = require('object-hash');
console.log(hash({ 'b': 'a', 'a': 'b', 'c': undefined, d: { 'b': 'a', 'a': 'b', 'c': undefined } }) === hash({ 'c': undefined, d: { 'b': 'a', 'a': 'b', 'c': undefined }, 'a': 'b', 'b': 'a' }))
const foo = hash({});
client.on("monitor", function(time, args, raw_reply) {
  console.log(time + ": " + args); // 1458910076.446514:['set', 'foo', 'bar']
});
//console.log(client.set(foo, "bbb"));
async function boo() {
  const data = await client.getAsync(foo);
  console.log(data);
}

boo();
