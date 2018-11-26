const Screen = require('../Screen.js');
const HighlightTable = require('../HighlightTable.js');
const menuScreen = new Screen('menu');

const highlightTable = new HighlightTable({
  elements: [
    { 'name': 'あと何分', 'screenTo': 'whereFrom' },
    { 'name': '祝日', 'screenTo': 'holiday' },
    { 'name': 'テキスト', 'screenTo': 'text' },
    { 'name': 'おてんき', 'screenTo': 'weather' },
    { 'name': '晩飯', 'screenTo': 'dinner' }
  ],
  all: false,
  font: "16px sazanami-gothic",
  textKey: 'name',
  fromY: 13,
  width: 128,
  height: 64,
  column: 2,
  pageContentSize: 6
});

menuScreen.setConsumer(function(state) {
  if (state == "right") {
    highlightTable.moveCursor(1);
    return true;
  }
  else if (state == "left") {
    highlightTable.moveCursor(-1);
    return true;
  }
  else if (state == "push") {
    const screenTo = highlightTable.options.elements[highlightTable.cursor].screenTo;
    return screenTo || false;
  }
  else {
    return false;
  }
});

menuScreen.setDrawer(function(ctx) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, 128, 64);
  ctx.fillStyle = "white";
  ctx.font = "13px Aviator";
  ctx.fillText("Menu", 0, 13);
  highlightTable.draw(ctx);
});

module.exports = menuScreen;
