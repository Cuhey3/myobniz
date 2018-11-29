const MongoService = require('./MongoService.js');
const date = require('date-and-time');
const dateUtil = require('./dateUtil.js');
const request = require('request-promise');

async function mongo_insert(dsl_locals, collectionName) {
  const client = await MongoService.getClient();
  await MongoService.getCollection(client, collectionName).insertOne(dsl_locals);
  client.close();
  MongoService.loadCollection(collectionName);
}

function dateFormat(dsl_locals, longTime, format) {
  console.log('dateFormat', JSON.stringify(dsl_locals), longTime, format);
  return date.format(new Date(longTime), format);
}

function convertForWebhook(dsl_locals, value1, value2, value3) {
  Object.keys(dsl_locals).forEach(function(key) {
    delete dsl_locals[key];
  });
  dsl_locals['value1'] = value1;
  dsl_locals['value2'] = value2;
  dsl_locals['value3'] = value3;
}

async function sendToWebhook(dsl_locals, trigger_name) {
  const { value1, value2, value3 } = dsl_locals;
  console.log('webhoooo', value1, value2, value3);
  await request({
    method: 'POST',
    uri: 'https://maker.ifttt.com/trigger/' + trigger_name + '/with/key/' + process.env.IFTTT_KEY,
    body: {
      value1,
      value2,
      value3
    },
    json: true
  });
}

function twitterDateToLong(dsl_locals, field) {
  const twitterDate = dsl_locals[field];
  let longTime = date.parse(twitterDate.slice(0, -2), "MMMM D, YYYY at HH:mm");
  if (longTime) {
    longTime = longTime.getTime();
  }
  if (longTime && twitterDate.substr(-2) === 'PM') {
    longTime += 12 * 60 * 60 * 1000;
  }
  if (longTime) {
    dsl_locals[field] = longTime;
  }
}

// dsl_localsを使用しない関数のためのデコレータ
function ignore_locals(f) {
  return function(dsl_locals, ...args) {
    return f.apply(this, args);
  };
}

// 変数セット関数
function _set(dsl_locals, var_name, value) {
  dsl_locals[var_name] = value;
}

// 変数ゲット関数
function _get(dsl_locals, var_name) {
  console.log('_get', var_name, dsl_locals[var_name]);
  if (var_name.indexOf('.') !== -1) {
    return _get_nested(dsl_locals, var_name.split("."));
  }
  else {
    if (var_name in dsl_locals) {
      return dsl_locals[var_name];
    }
    else {
      return dsl_globals[var_name] || dsl_globals['_functions'][var_name];
    }
  }
}

function _or(dsl_locals, array) {
  console.log("or...", JSON.stringify(array));
  return array.some(function(value) {
    return value === true;
  });
}

function _top(dsl_locals, ...array) {
  return array[0];
}

function cleanup(dsl_locals, array) {
  const keys = Object.keys(dsl_locals);
  keys.forEach(function(key) {
    if (array.indexOf(key) === -1) {
      delete dsl_locals[key];
    }
  });
}

function expectsDate(dsl_locals, field) {
  const str = dsl_locals[field];
  console.log(str, field, JSON.stringify(dsl_locals));
  return [/本日/, /曜/, /\d{1,2}月\d{1,2}日/, /\d{1,2}\/\d{1,2}/].some(function(regex) {
    return regex.test(str);
  });
}

function extractDates(dsl_locals, from, to = 'extractDates') {
  const result = dateUtil.extractDates(dsl_locals[from] || '');
  const toData = dsl_locals[to] || [];
  dsl_locals[to] = toData.concat(result);
}

function _not(dsl_locals, value) {
  return !(value);
}

function isEmpty(dsl_locals, ...args) {
  console.log('isEmpty', args, typeof args);
  return args.length === 0;
}

async function _filter(dsl_locals, predicate, filtered_dsl) {
  console.log('filter', predicate);
  if (predicate) {
    await execute_dsl(filtered_dsl, dsl_locals);
  }
}

function _get_nested(dsl_locals = {}, var_name, index = 0) {
  if (index === 0) {
    if (var_name.length === 1) {
      return _get(dsl_locals, var_name[0]);
    }
    else {
      return _get_nested(_get(dsl_locals, var_name[0]), var_name, 1);
    }
  }
  else {
    if (var_name.length - 1 === index) {
      return dsl_locals[var_name[index]];
    }
    else {
      return _get_nested(dsl_locals[var_name[index]], var_name, ++index);
    }
  }
}

function _do(dsl_locals, func, args, { defined } = {}) {
  if (defined) {
    args = [dsl_locals].concat(args);
  }
  try {
    func.apply(this, args);
  }
  catch (e) {
    func(args);
  }
}

function _log(dsl_locals, logName = "dsl_logging") {
  console.log(logName, JSON.stringify(dsl_locals));
}

function wait(dsl_locals, milliseconds) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      console.log('wait end');
      resolve();
    }, milliseconds);
  });
}
// フォーマット関数
function _format(dsl_locals, format_string, ...args) {
  let replaced = format_string;
  let index = 0;
  while (replaced.indexOf("%s") !== -1) {
    replaced = replaced.replace('%s', args[index++]);
  }
  return replaced;
}

// ログインチェック関数
function check_auth(dsl_locals, username, password) {
  return dsl_globals['user_info'][username] === password;
}

// 条件分岐関数
// when関数が呼ばれた時点で、predicateは真偽値に変換されている。
async function when(dsl_locals, predicate, true_dsl, false_dsl) {
  if (predicate) {
    await execute_dsl(true_dsl, dsl_locals);
  }
  else {
    await execute_dsl(false_dsl, dsl_locals);
  }
}

// 関数定義関数
function define(dsl_locals, func_name, args_name, dsl) {
  if (!Array.isArray(args_name)) {
    args_name = [args_name];
  }
  const func = function(...args_value) {
    for (var i = 0; i < args_name.length; i++) {
      dsl_locals[args_name[i]] = args_value[i + 1];
    }
    execute_dsl(dsl, dsl_locals);
  }; //引数名、 引数値をローカル変数にセット //DSL上の変数宣言からは添字が一つずれる（ dsl_localsが存在するため）

  const _functions = dsl_locals['_functions'] || {};
  _functions[func_name] = func;
  dsl_locals['_functions'] = _functions;
}
const dsl_globals = {
  // ログインチェックで使用するusernameとpasswordのペア
  'user_info': {
    'cuhey3': 'rumiokubo'
  },
  //DSLから呼び出し可能な定義済み関数を列挙
  '_functions': {
    'print': ignore_locals(console.log),
    'set': _set,
    'get': _get,
    'do': _do,
    'or': _or,
    'log': _log,
    'format': _format,
    'top': _top,
    'not': _not,
    check_auth,
    when,
    define,
    wait,
    filter: _filter,
    mongo_insert,
    twitterDateToLong,
    expectsDate,
    extractDates,
    cleanup,
    dateFormat,
    sendToWebhook,
    convertForWebhook,
    isEmpty
  }
};
//引数を評価する関数
function evaluate_args(dsl_locals, args) {
  const result = [];
  args.forEach(function(arg) {
    if (typeof arg === "object" && '$' in arg) {
      const dollar_val = arg['$'];
      if (Array.isArray(dollar_val)) {
        const func_name = dollar_val[0];
        const func = find_func_in_scope(dsl_locals, func_name);
        const new_args = [dsl_locals].concat(evaluate_args(dsl_locals, dollar_val.slice(1)));
        result.push(func.apply(this, new_args));
      }
      else {
        result.push(_get(dsl_locals, dollar_val));
      }
    }
    else if (typeof arg === 'object' && !Array.isArray(arg) && Object.keys(arg).length === 1 && Object.keys(arg)[0].startsWith('$')) {
      const func_name = Object.keys(arg)[0].substr(1);
      const func = find_func_in_scope(dsl_locals, func_name);

      const new_args = [dsl_locals].concat(evaluate_args(dsl_locals, [arg['$' + func_name]])[0]);
      console.log('$' + func_name, new_args);
      result.push(func.apply(this, new_args));
    }
    else if (Array.isArray(arg)) {
      console.log('here', JSON.stringify(arg));
      arg = arg.map(function(a) {
        const result = evaluate_args(dsl_locals, [a]);
        console.log('aResult', a, result);
        return result[0];
      });
      console.log('boo', JSON.stringify(arg));
      result.push(arg);
    }
    else {
      result.push(arg);
    }
  });
  return result;
}

// dsl_localsまたはdsl_globalsから関数を見つける
function find_func_in_scope(dsl_locals, func_name) {
  console.log("find_func_in_scope", func_name);
  return dsl_globals['_functions'][func_name] || ((dsl_locals['_functions'] || {})[func_name]);
}

// DSL実行関数

async function execute_dsl(dsl, dsl_locals = {}) {
  if (!Array.isArray(dsl)) {
    dsl = [dsl];
  }
  for (let inst of dsl) {
    const keys = Object.keys(inst);
    for (let func_name of keys) {
      let raw_args = inst[func_name];
      const func = find_func_in_scope(dsl_locals, func_name);
      //引数が一つだけ渡される場合も許容する
      if (!Array.isArray(raw_args)) {
        raw_args = [raw_args];
      }
      const args = evaluate_args(dsl_locals, raw_args);
      await func.apply(this, [dsl_locals].concat(args));
    }
  }
}

module.exports = {
  execute_dsl,
  dsl_globals
};
