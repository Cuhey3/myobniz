const Screen = require('../Screen.js');
const { circularAdd, objToTop } = require('../appUtil.js');
const likeScreen = new Screen('like');
const dateAndTime = require('date-and-time');

const MongoService = require('../MongoService.js');

likeScreen.setVariables({
  modal: false,
  modalCursor: true,
  cursor: 0
});

const val = function(str) { return likeScreen.val(str); };

const layers = [{
  name: 'likeLayer',
  consume: function(state) {
    if (state == 'holdLeft') {
      return 'menu';
    }
    else if (state == 'left') {
      val().cursor = circularAdd(-1, val('cursor'), MongoService.coldCollection('liked_tweets').length || 1);
      return true;
    }
    else if (state == 'right') {
      val().cursor = circularAdd(1, val('cursor'), MongoService.coldCollection('liked_tweets').length || 1);
      return true;
    }
    else if (state == 'push') {
      objToTop(layers, 'modalLayer');
      return true;
    }
    else {
      return false;
    }
  },
  draw: function(ctx) {
    const tweet = MongoService.coldCollection('liked_tweets')[val('cursor')] || {};
    const dateString = dateAndTime.format(new Date((tweet.extractDates || [])[0]), 'MM/DD') || "";
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 128, 64);
    ctx.fillStyle = "white";
    ctx.font = '14px sazanami-gothic';
    let canvasWidth = 128;
    let widthSum = 0;
    let nextWidth = 0;
    let positionY = 13;
    ctx.fillText([dateString, tweet.userName || ''].join(" "), 0, positionY);
    positionY += 16;
    let charDump = [];
    let nextChar;
    const split = (tweet.text || '').split('');
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
  }
}, {
  name: 'modalLayer',
  consume: function(state) {
    if (state == "right" || state == "left") {
      val().modalCursor = !val().modalCursor;
      return true;
    }
    else if (state == "push") {
      if (val('modalCursor') && MongoService.coldCollection("liked_tweets").length > 0) {
        const toDeleteRecord = MongoService.coldCollection("liked_tweets").splice(val('cursor'), 1)[0];
        if (MongoService.coldCollection("liked_tweets").length === val('cursor')) {
          val().cursor = 0;
        }
        MongoService.deleteRecord('liked_tweets', toDeleteRecord);
      }
      objToTop(layers, 'likeLayer');
      return true;
    }
    else {
      return false;
    }
  },
  draw: function(ctx) {
    ctx.font = "12px Aviator";
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.fillStyle = "black";
    ctx.fillRect(18, 10, 88, 42);
    ctx.strokeRect(18, 10, 88, 42);
    ctx.fillStyle = "white";
    ctx.fillText("Remove?", 30, 27);
    if (val('modalCursor')) {
      ctx.fillStyle = "white";
      ctx.fillRect(35, 32, 24, 15);
      ctx.fillStyle = "black";
      ctx.fillText("Yes", 38, 44);
      ctx.fillStyle = "white";
      ctx.fillText("No", 68, 44);
    }
    else {
      ctx.fillStyle = "white";
      ctx.fillText("Yes", 38, 44);
      ctx.fillRect(64, 32, 24, 15);
      ctx.fillStyle = "black";
      ctx.fillText("No", 68, 44);
    }
  }
}];

likeScreen.setConsumer(function(state) {
  return layers.find(function(layer) {
    return layer.consume;
  }).consume(state);
});

likeScreen.setDrawer(function(ctx) {
  for (var i = layers.length - 1; i >= 0; i--) {
    layers[i].draw(ctx);
  }
});

likeScreen.onPullupFunc = function(globalVariables) {
  this.lineNo = 0;
};

module.exports = likeScreen;
