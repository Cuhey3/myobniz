const Screen = require('../Screen.js');
const TimeTable = require('../TimeTable.js');
const HighlightTable = require('../HighlightTable.js');
const whereFromScreen = new Screen('whereFrom');
const highlightTable = new HighlightTable({
  elements: TimeTable.getFromList().map(function(fromName) {
    return { name: fromName };
  }),
  all: false,
  font: "16px sazanami-gothic",
  textKey: 'name',
  fromY: 13,
  width: 128,
  height: 64,
  column: 2,
  pageContentSize: 6
});

whereFromScreen.setConsumer(function(state) {
  if (state == "right") {
    highlightTable.moveCursor(1);
    return true;
  }
  else if (state == "left") {
    highlightTable.moveCursor(-1);
    return true;
  }else if (state == "holdLeft") {
    return "menu";
  }
  else if (state == "push") {
    return "whereTo";
  }
  else {
    return false;
  }
});

whereFromScreen.setDrawer(function(ctx) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, 128, 64);
  ctx.fillStyle = "white";
  ctx.font = "13px Aviator";
  ctx.fillText("Where from?", 0, 13);
  highlightTable.draw(ctx);
});

whereFromScreen.onPulldownFunc = function(globalVariables) {
  globalVariables['whereFrom.fromName'] = highlightTable.selectedText();
};

module.exports = whereFromScreen;
