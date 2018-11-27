const Screen = require('../Screen.js');
const { circularAdd } = require('../appUtil.js');
const likeScreen = new Screen('like');

const MongoService = require('../MongoService.js');


likeScreen.setConsumer(function(state) {
  if (state == 'holdLeft') {
    return 'menu';
  }
  else if (state == 'left') {
    this.cursor = circularAdd(-1, this.cursor, MongoService.coldCollection('liked_tweets').length);
    console.log(this.cursor);
    return true;
  }
  else if (state == 'right') {
    this.cursor = circularAdd(1, this.cursor, MongoService.coldCollection('liked_tweets').length);
    console.log(this.cursor);
    return true;
  }
  else {
    return false;
  }
});

likeScreen.setDrawer(function(ctx) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, 128, 64);
  ctx.fillStyle = "white";
  ctx.font = '14px sazanami-gothic';
  let canvasWidth = 128;
  let widthSum = 0;
  let nextWidth = 0;
  let positionY = 13;
  let charDump = [];
  let nextChar;
  const split = MongoService.coldCollection('liked_tweets')[this.cursor].text.split("");
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

likeScreen.onPullupFunc = function(globalVariables) {
  this.cursor = 0;
  this.lineNo = 0;
};

module.exports = likeScreen;
