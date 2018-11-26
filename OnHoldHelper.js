function OnHoldHelper(functions = {}) {
  this.functions = functions;
  this.holdTimerId = null;
  this.nowState = null;
}

OnHoldHelper.prototype.state = function(s) {
  if (s.indexOf('continuous') != 0 && s.indexOf('hold') != 0) {
    this.nowState = s;
    if (this.holdTimerId) {
      clearTimeout(this.holdTimerId);
    }
    if (this.nowState in this.functions) {
      this.holdTimerId = setTimeout(this.functions[this.nowState], 850);
    }
  }
};

OnHoldHelper.prototype.setFunc = function(s, func) {
  this.functions[s] = func;
  return this;
};

module.exports = OnHoldHelper;
