const Screen = require('../Screen.js');
const TimeTable = require('../TimeTable.js');
const { circularAdd, objToTop } = require('../appUtil.js');
const detailsScreen = new Screen('details');

detailsScreen.interval = 1000;

detailsScreen.setVariables({
  cursor: 0,
  modal: false,
  modalCursor: true,
  isRecording: false,
  timeTables: []
});

const val = function(str) { return detailsScreen.val(str); };

const layers = [{
  name: 'detailLayer',
  consume: function(state) {
    if (val('isRecording')) {
      if (state == 'push') {
        objToTop(layers, 'modalLayer');
        val().modalCursor = false;
        return true;
      }
      else {
        return false;
      }
    }
    else {
      if (state == "right") {
        val().cursor = circularAdd(+1, val('cursor'), val('timeTables').length);
        return true;
      }
      else if (state == "left") {
        val().cursor = circularAdd(-1, val('cursor'), val('timeTables').length);
        return true;
      }
      else if (state == "push") {
        objToTop(layers, 'modalLayer');
        val().modalCursor = true;
        return true;
      }
      else if (state == "holdLeft") {
        return "whereTo";
      }
      else {
        return false;
      }
    }
  },
  draw: function(ctx) {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 128, 64);
    ctx.fillStyle = "white";
    let timeTable = val('timeTables')[val('cursor')];
    timeTable.check();
    ctx.font = "14px sazanami-gothic";
    ctx.fillText("at " + timeTable.name, 0, 14);
    ctx.font = "14px Aviator";
    ctx.fillText([(timeTable.filteredDepartures[0] || "None"), (timeTable.filteredDepartures[1] || "None"), (timeTable.filteredDepartures[2] || "None")].join('/'), 0, 30);
    ctx.fillText(timeTable.remainExpression ? "Rem. " + timeTable.remainExpression : "", 0, 46);
    ctx.fillText(timeTable.estimateExpression ? "Est. " + timeTable.estimateExpression : "", 0, 62);
  }
}, {
  name: 'modalLayer',
  consume: function(state) {
    if (val('isRecording')) {
      if (state == 'push') {
        objToTop(layers, 'detailLayer');
        if (val('modalCursor') == true) {
          val().isRecording = false;
          val('timeTables')[val('cursor')].recordEnd();
        }
        return true;
      }
      else if (state == "right" || state == "left") {
        val().modalCursor = !val().modalCursor;
        return true;
      }
      else {
        return false;
      }
    }
    else {
      if (state === 'holdPush') {
        objToTop(layers, 'detailLayer');
        return 'history';
      }
      else if (state == "right" || state == "left") {
        val().modalCursor = !val().modalCursor;
        return true;
      }
      else if (state == "push") {
        if (val('modalCursor')) {
          val().isRecording = true;
          val('timeTables')[val('cursor')].recordStart();
        }
        else {
          val().isRecording = false;
        }
        objToTop(layers, 'detailLayer');
        return true;
      }
      else {
        return false;
      }
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
    if (val('isRecording')) {
      ctx.fillText("Stop Rec?", 30, 27);
    }
    else {
      ctx.fillText("Start Rec?", 30, 27);
    }
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

detailsScreen.setConsumer(function(state) {
  return layers.find(function(layer) {
    return layer.consume;
  }).consume(state);
});

detailsScreen.setDrawer(function(ctx) {
  for (var i = layers.length - 1; i >= 0; i--) {
    layers[i].draw(ctx);
  }
});

detailsScreen.onPullupFunc = function(globalVariables) {
  val().cursor = 0;
  const from = globalVariables['whereFrom.fromName'];
  const to = globalVariables['whereTo.toName'];
  val().timeTables = TimeTable.getListByFrom(from)
    .filter(function(value) {
      return to == 'ALL' || value.to.indexOf(to) != -1;
    }).map(function(value) {
      return new TimeTable(value);
    });
};

detailsScreen.onPulldownFunc = function(globalVariables) {
  const timeTable = val('timeTables')[val('cursor')];
  globalVariables['details.lineName'] = timeTable.line;
};

module.exports = detailsScreen;
