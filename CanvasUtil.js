function CanvasUtil(ctx) {
  this.ctx = ctx;
}

CanvasUtil.prototype.setResetFunc = function(func) {
  this.resetFunc = func;
}

CanvasUtil.prototype.setLineStyles = function(array) {
  this.lineStyles = array;
};

CanvasUtil.prototype.update = function(texts) {
  const self = this;
  if (self.resetFunc) {
    self.resetFunc(self.ctx);
  }
  texts.forEach(function(text, index) {
    const { font, text_x = 0, text_y } = self.lineStyles[index] || {};
    if (font) {
      self.ctx.font = font;
    }
    self.ctx.fillText(text, text_x, text_y);
  });
};

CanvasUtil.prototype.context = function() {
  return this.ctx;
};

module.exports = CanvasUtil;
