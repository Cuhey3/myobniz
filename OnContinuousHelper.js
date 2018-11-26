function OnContinuousHelper(functions = {}) {
  this.functions = functions;
  this.continuousTimerId = null;
  this.nowState = null;
}

OnContinuousHelper.prototype.state = function(s) {
  if (s.indexOf('continuous') != 0 && s.indexOf('hold') != 0) {
    this.nowState = s;
    if (this.continuousTimerId) {
      clearInterval(this.continuousTimerId);
    }
    if (this.nowState in this.functions) {
      this.continuousTimerId = setInterval(this.functions[this.nowState], 300);
    }
  }
};

OnContinuousHelper.prototype.setFunc = function(s, func) {
  this.functions[s] = func;
  return this;
};

module.exports = OnContinuousHelper;
