const Screen = require('../Screen.js');
const TimeTable = require('../TimeTable.js');
const HighlightTable = require('../HighlightTable.js');
const whereToScreen = new Screen('whereTo');

let highlightTable = new HighlightTable({
  elements: [
    { 'name': '錦糸町' },
    { 'name': '飯田橋' },
    { 'name': '門前仲町' },
    { 'name': '大手町' },
    { 'name': '茅場町' },
    { 'name': '秋葉原' }
  ],
  all: true,
  font: "16px sazanami-gothic",
  textKey: 'name',
  fromY: 13,
  width: 128,
  height: 64,
  column: 2,
  pageContentSize: 6
});

whereToScreen.setConsumer(function(state) {
  if (state == "right") {
    highlightTable.moveCursor(1);
    return true;
  }
  else if (state == "left") {
    highlightTable.moveCursor(-1);
    return true;
  }
  else if (state == "holdLeft") {
    return "whereFrom";
  }
  else if (state == "push") {
    return "details";
  }
  else {
    return false;
  }
});

whereToScreen.setDrawer(function(ctx) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, 128, 64);
  ctx.fillStyle = "white";
  ctx.font = "13px Aviator";
  ctx.fillText("Where to?", 0, 13);
  highlightTable.draw(ctx);
});

whereToScreen.onPulldownFunc = function(globalVariables) {
  globalVariables['whereTo.toName'] = highlightTable.selectedText();
};

whereToScreen.onPullupFunc = function(globalVariables) {
  const selectedText = globalVariables['whereFrom.fromName'];
  if (selectedText) {
    const elements = TimeTable.getToListByFrom(selectedText)
      .map(function(toName) {
        return { name: toName };
      });

    highlightTable = new HighlightTable({
      elements,
      all: elements.length > 1,
      font: "16px sazanami-gothic",
      textKey: 'name',
      fromY: 13,
      width: 128,
      height: 64,
      column: 2,
      pageContentSize: 6
    });

  }
};

module.exports = whereToScreen;
