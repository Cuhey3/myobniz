const Screen = require('../Screen.js');
const { circularAdd, objToTop } = require('../appUtil.js');
const likeScreen = new Screen('like');
const dateAndTime = require('date-and-time');

const MongoService = require('../MongoService.js');

likeScreen.setVariables({
  modal: false,
  modalCursor: 2,
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
      val().modalCursor = 2;
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
    if (state == "right") {
      val().modalCursor = (val().modalCursor + 1) % 3;
      return true;
    }
    else if (state === 'left') {
      val().modalCursor = (val().modalCursor + 2) % 3;
      return true;
    }
    else if (state == "push") {
      if (val('modalCursor') !== 2 && MongoService.coldCollection("liked_tweets").length > 0) {
        const toDeleteRecord = MongoService.coldCollection("liked_tweets").splice(val('cursor'), 1)[0];
        if (MongoService.coldCollection("liked_tweets").length === val('cursor')) {
          val().cursor = 0;
        }
        if (val('modalCursor') === 0) {
          const request = require('request-promise');
          const value1Date = new Date(toDeleteRecord.extractDates[0]);
          request({
            method: 'POST',
            uri: 'https://maker.ifttt.com/trigger/google_calendar/with/key/' + process.env.IFTTT_KEY,
            body: {
              value1: dateAndTime.format(value1Date, "YYYY/MM/DD"),
              value2: toDeleteRecord.text,
              value3: toDeleteRecord.linkToTweet,
            },
            json: true
          });

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
    ctx.fillRect(12, 10, 100, 42);
    ctx.strokeRect(12, 10, 100, 42);
    ctx.fillStyle = "white";
    ctx.fillText("to Calendar?", 24, 27);
    switch (val('modalCursor')) {
      case 0:
        ctx.fillStyle = "white";
        ctx.fillRect(17, 32, 24, 15);
        ctx.fillStyle = "black";
        ctx.fillText("Yes", 20, 44);
        ctx.fillStyle = "white";
        ctx.fillText("No", 44, 44);
        ctx.fillStyle = "white";
        ctx.fillText("Cancel", 66, 44);
        break;
      case 1:
        ctx.fillStyle = "white";
        ctx.fillText("Yes", 20, 44);
        ctx.fillStyle = "white";
        ctx.fillRect(42, 32, 21, 15);
        ctx.fillStyle = "black";
        ctx.fillText("No", 44, 44);
        ctx.fillStyle = "white";
        ctx.fillText("Cancel", 66, 44);
        break;
      case 2:
        ctx.fillStyle = "white";
        ctx.fillText("Yes", 20, 44);
        ctx.fillStyle = "white";
        ctx.fillText("No", 44, 44);
        ctx.fillStyle = "white";
        ctx.fillRect(65, 32, 44, 15);
        ctx.fillStyle = "black";
        ctx.fillText("Cancel", 66, 44);
        break;
      default:
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
