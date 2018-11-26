const Screen = require('../Screen.js');

const textScreen = new Screen('text');

textScreen.setConsumer(function(state) {
  if (state == 'push') {
    return 'menu';
  }
  else if (state == 'left' || state == 'continuousLeft') {
    const beforeCursor = this.cursor;
    this.cursor = Math.max(this.cursor - 1, 0);
    return beforeCursor != this.cursor;
  }
  else if (state == 'right' || state == 'continuousRight') {
    const beforeCursor = this.cursor;
    this.cursor = this.cursor + 1;
    if (this.cursor > this.lineNo - 4) {
      this.cursor = this.lineNo - 4;
    }
    return beforeCursor != this.cursor;
  }
  else {
    return false;
  }
});

textScreen.text = 'Thank you. I am looking for...あいうえおかきくけ西葛西白金高輪門前仲町こさしすせそたちつてとなにぬねのはひふへほまみThank you. I am looking for...あいうえおかきくけ西葛西白金高輪門前仲町こさしすせそたちつてとなにぬねのはひふへほまみThank you. I am looking for...あいうえおかきくけ西葛西白金高輪門前仲町こさしすせそたちつてとなにぬねのはひふへほまみThank you. I am looking for...あいうえおかきくけ西葛西白金高輪門前仲町こさしすせそたちつてとなにぬねのはひふへほまみ';
textScreen.setDrawer(function(ctx) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, 128, 64);
  ctx.fillStyle = "white";
  ctx.font = '14px sazanami-gothic';
  let canvasWidth = 128;
  let widthSum = 0;
  let nextWidth = 0;
  let positionY = 13 - this.cursor * 16;
  let charDump = [];
  let nextChar;
  const split = textScreen.text.split("");
  let lineNo = 0;
  while (split.length > 0) {
    nextChar = split.shift();
    nextWidth = ctx.measureText(nextChar).width;
    if (widthSum + nextWidth > canvasWidth) {
      ctx.fillText(charDump.join(""), 0, positionY);
      widthSum = nextWidth;
      positionY += 16;
      charDump = [nextChar];
      lineNo++;
    }
    else {
      charDump.push(nextChar);
      widthSum += nextWidth;
    }
  }
  if (charDump.length > 0) {
    ctx.fillText(charDump.join(""), 0, positionY);
    lineNo++;
  }
  this.lineNo = lineNo;
});

textScreen.onPullupFunc = function(globalVariables) {
  this.cursor = 0;
  this.lineNo = 0;
};

module.exports = textScreen;
