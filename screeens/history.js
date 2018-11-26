const Screen = require('../Screen.js');
const TimeTable = require('../TimeTable.js');
const { circularAdd } = require('../appUtil.js');
const historyScreen = new Screen('history');
const ScrollableTable = require('../ScrollableTable.js');

historyScreen.interval = 1000;

historyScreen.setVariables({
  cursor: 0
});

const val = function(str) { return historyScreen.val(str); };

historyScreen.setConsumer(function(state) {
  if (state == "right") {
    val().cursor = circularAdd(+1, val().cursor, val('historyElements').length);
    return true;
  }
  else if (state == "left") {
    val().cursor = circularAdd(-1, val().cursor, val('historyElements').length);
    return true;
  }
  else if (state == "push") {
    return "details";
  }
  else {
    return false;
  }
});

historyScreen.setDrawer(function(ctx) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, 128, 64);
  ctx.fillStyle = "white";
  ctx.fillText("history", 0, 12);
  val('scrollableTable').draw(ctx);
});

historyScreen.onPullupFunc = function(globalVariables) {
  val().cursor = 0;
  const from = globalVariables['whereFrom.fromName'];
  const line = globalVariables['details.lineName'];
  val().historyElements = TimeTable.getHistory(from, line).map(function(history) {
    const date = new Date(history.date);
    return ("0" + (date.getMonth() + 1)).substr(-2) + "/" + ("0" + (date.getDate())).substr(-2) + " " + TimeTable.secondToMinuteSecondExpression(history.time);
  });

  val().scrollableTable = new ScrollableTable({
    elements: val('historyElements'),
    font: "12px Aviator",
    fromY: 13,
    width: 128,
    height: 64,
    contentLength: 4
  });

};

module.exports = historyScreen;
