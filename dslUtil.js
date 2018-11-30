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

module.exports = {
  Operation
};
