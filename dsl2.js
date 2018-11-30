const assert = require('assert');

class Operation {
  constructor(obj) {
    assert(typeof obj === 'object' &&
      !Array.isArray(obj) &&
      Object.keys(obj).length === 1,
      'Operation constructor: first argument must be an object with only one key.>>>',
      JSON.stringify(obj));
    this._funcName = Object.keys(obj)[0];
    this._rawArgs = obj[this._funcName];
  }
  funcName() {
    return this._funcName;
  }
  rawArgs() {
    return this._rawArgs;
  }
  firstArg() {
    return Array.isArray(this._rawArgs) ? this._rawArgs[0] : this._rawArgs;
  }
  toString() {
    return JSON.stringify(this);
  }
}

const dateAndTime = require('date-and-time');
const dateUtil = require('./dateUtil.js');
const request = require('request-promise');
const arrayPattern = /^\$(.+)\[(\d+)\]$/;

const MongoService = require('./MongoService.js');

async function mongo_insert(operation) {
  const collectionName = operation.firstArg();
  assert(typeof collectionName === 'string', `dslGlobals.mongo_insert: argument must be string. ${collectionName}`);
  const client = await MongoService.getClient();
  await MongoService.getCollection(client, collectionName).insertOne(this);
  client.close();
  MongoService.loadCollection(collectionName);
}

async function mongo_delete(operation) {
  const collectionName = operation.firstArg();
  assert(typeof collectionName === 'string', `dslGlobals.mongo_delete: argument must be string. ${collectionName}`);
  MongoService.deleteRecord(collectionName, this);
}


async function dateFormat(operation) {
  const [date, format] = await evaluateArg.call(this, operation.rawArgs());
  assert(typeof date === 'number' || date instanceof Date, `dslGlobals.dateFormat: first argument must be date or number. ${date}`);
  assert(typeof format === 'string', `dslGlobals.dateFormat: first argument must be string. ${format}`);
  return dateAndTime.format(typeof date === 'number' ? new Date(date) : date, format);
}

async function extractDates(operation) {
  let args = await evaluateArg.call(this, operation.rawArgs());
  assert(typeof args === 'string' || Array.isArray(args), `dslGlobals.extractDates: argument must evaluate to a string or an array. ${args}`);
  if (typeof args === 'string') {
    args = [args];
  }
  let result = [];
  const resultKeys = {};
  for (let a of args) {
    assert(typeof a === 'string', `dslGlobals.extractDates: Among the evaluated values, non-character strings are included. ${a}`);
    result = result.concat(dateUtil.extractDates(a).filter(function(num) {
      const isNew = !(String(num) in resultKeys);
      resultKeys[String(num)] = true;
      return isNew;
    }));
  }
  return result;
}

function _get(operation) {
  const arg = operation.firstArg();
  assert(typeof arg === 'string', `dslGlobals.get: arg must be string. ${operation}`);
  return this[arg];
}

async function _set(operation) {
  const args = await evaluateArg.call(this, operation.rawArgs());
  assert(typeof args[0], `dslGlobals.set: first argument must be string. ${args}`);
  assert(args.length === 2, `dslGlobals.set: arguments was evaluated to three or more. ${args}`);
  const [key, value] = args;
  this[key] = value;
}

async function print(operation) {
  const arg = await evaluateArg.call(this, operation.firstArg());
  if (Array.isArray(arg)) {
    console.log.apply(null, arg);
  }
  else {
    console.log(arg);
  }
}

async function _not(operation) {
  const bool = await evaluateArg.call(this, operation.firstArg());
  assert(typeof bool === 'boolean', `dslGlobals.not: first argument was evaluated other than boolean. ${bool}`);
  return !bool;
}

async function _push(operation) {
  const args = await evaluateArg.call(this, operation.rawArgs());
  assert(typeof args[0], `dslGlobals.push: first argument must be string. ${args}`);
  assert(args.length === 2, `dslGlobals.push: arguments was evaluated to three or more. ${args}`);
  let [key, value] = args;
  assert(!(key in this) || Array.isArray(this[key]), `dslGlobals.push: "${key}" already exists, but it is not an array.${JSON.stringify(this)}`);
  let result = [];
  if (!Array.isArray(value)) {
    value = [value];
  }
  value.forEach(function(arg) {
    result = result.concat(arg);
  });
  this[key] = (this[key] || []).concat(result);
}

async function _filter(operation) {
  const rawArgs = operation.rawArgs();
  assert(rawArgs.length === 2, `dslGlobals.filter: 2 arguments are required. ${operation}`);
  const predicate = await evaluateArg.call(this, rawArgs[0]);
  assert(typeof predicate === 'boolean', `dslGlobals.filter: The first argument was evaluated other than boolean. ${predicate}`);
  if (predicate) {
    execute_dsl(rawArgs[1], this);
  }
}

async function _isEmpty(operation) {
  const arg = await evaluateArg.call(this, operation.firstArg());
  assert(Array.isArray(arg), `dslGlobals.isEmpty: first argument was evaluated  other than Array. ${arg}`);
  return arg.length === 0;
}

async function webhook(operation) {
  const [triggerName, values] = await evaluateArg.call(this, operation.rawArgs());
  assert(typeof triggerName === 'string', `dslGlobals.webhook: The first argument, trigger name was evaluated other than string. ${triggerName}`);
  assert(Array.isArray(values) && values.length, `dslGlobals.webhook: The second argument, values  must be interpreted as an array of length 3. ${values}`);
  const [value1, value2, value3] = values;
  await request({
    method: 'POST',
    uri: 'https://maker.ifttt.com/trigger/' + triggerName + '/with/key/' + process.env.IFTTT_KEY,
    body: {
      value1,
      value2,
      value3
    },
    json: true
  });
  console.log({ value1, value2, value3 });
}

const dslGlobals = {
  get: _get,
  set: _set,
  print,
  filter: _filter,
  push: _push,
  not: _not,
  isEmpty: _isEmpty,
  dateFormat,
  extractDates,
  webhook,
  mongo_insert,
  mongo_delete
};

async function execute(operation) {
  assert(operation instanceof Operation, `execute: first argument must be Operation instance. ${operation}`);
  const funcName = operation.funcName();
  assert(funcName in dslGlobals, `execute: function does not exist. ${operation}`);
  return await dslGlobals[funcName].call(this, operation);
}

async function evaluateArg(arg) {
  console.log(`    >> evaluate start...${JSON.stringify(arg)}, ${JSON.stringify(this)}`);
  if (typeof arg === 'string') {
    if (arg.startsWith('$')) {
      const match = arrayPattern.exec(arg);
      if (match) {
        console.log(`    << evaluate end ${this[match[1]][Number(match[2])]}`);
        return this[match[1]][Number(match[2])];
      }
      else {
        console.log(`    << evaluate end ${this[arg.substr(1)]}`);
        return this[arg.substr(1)];
      }
    }
    else {
      console.log(`    << evaluate end ${arg}`);
      return arg;
    }
  }
  else if (Array.isArray(arg)) {
    const result = [];
    for (let a of arg) {
      result.push(await evaluateArg.call(this, a));
    }
    console.log(`    << evaluate end ${result}`);
    return result;
  }
  else if (arg && typeof arg === 'object' && Object.keys(arg).length === 1 && Object.keys(arg) in dslGlobals) { // TBD
    const operation = new Operation(arg);
    console.log('      >> nested evaluation called: ', operation);
    const result = await execute.call(this, operation);
    console.log(`    << evaluate end ${JSON.stringify(result)}`);
    return result;
  }
  else {
    console.log(`    << evaluate end. not match. ${arg}`);
    return arg;
  }
}

async function execute_dsl(dsl, dsl_locals = {}) {
  assert(Array.isArray(dsl), 'execute_dsl: first argument must be an array', JSON.stringify(dsl));
  console.log('dsl start>>>>>>>>', JSON.stringify(dsl_locals));
  for (let rawOp of dsl) {
    const operation = new Operation(rawOp);
    console.log('  start', operation);
    await execute.call(dsl_locals, operation);
  }
  console.log('dsl end>>>>>>>>>>', JSON.stringify(dsl_locals));
}
//execute_dsl([{ filter: ["$foo", [{ print: '$bar' }]] }], { foo: true, bar: 'waowao' });
//execute_dsl([{ push: ["$foo", [111]] }], { foo: "bar", boo: 'waowao' });
//execute_dsl([{ filter: [{ isEmpty: "$foo" },[{ print: '$bar' }]]}], { foo: [1], bar: 'waowao' });
//execute_dsl([{ print: '$boo[3]' }], { boo: [1, 2, 3, 4] });
//execute_dsl([{ print: { dateFormat: ['$boo[3]', 'YYYY/MM/DD'] } }], { boo: [1, 2, 3, new Date(1999, 1, 1)] });
//execute_dsl([{ set: ['foo', { extractDates: ['aaa2017/01/01aaaa', 'aaaa2018/01/01aaaa'] }] }, { print: { dateFormat: ["$foo[1]", 'YYYY/MM/DD'] } }]);
//execute_dsl([{ webhook: ['google_calendar', [1, 2, 3]] }]);
//execute_dsl([{ mongo_insert: ['foobar'] }], { 'foo': 'bar' });
/*setTimeout(function() {
  execute_dsl([{ mongo_delete: ['foobar'] }], MongoService.coldCollection('foobar')[0]);
}, 5000);*/

module.exports = { execute_dsl };
