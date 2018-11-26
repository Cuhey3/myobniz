/* global Exception */
const { circularAdd } = require('./appUtil.js');

function ScrollableTable(options) {
  this.options = options;
  this.cursor = options.initialCursor || 0;
}

ScrollableTable.prototype.initCursor = function() {
  this.cursor = this.options.initialCursor;
};

ScrollableTable.prototype.moveCursor = function(num) {
  if (num) {
    this.cursor = circularAdd(num, this.cursor, this.options.elements.length);
  }
};

ScrollableTable.prototype.draw = function(ctx) {
  let positionY = 0;
  let contentSize = 0;
  const {
    font,
    fromX = 0,
    fromY = 0,
    width: tableWidth,
    height: tableHeight,
    contentLength,
    elements
  } = this.options;
  ctx.fillStyle = "black";
  ctx.fillRect(fromX, fromY, tableWidth, tableHeight);
  ctx.fillStyle = "white";
  if (font) {
    ctx.font = font;
  }
  const sliced = elements.slice(this.cursor);
  while (true && contentSize < contentLength && contentSize < sliced.length) {
    const nextText = sliced[contentSize];
    const nextHeight = parseInt(ctx.font, 10);
    ctx.fillText(nextText, fromX, fromY + positionY + nextHeight);
    positionY += nextHeight;
    contentSize++;
  }
};

module.exports = ScrollableTable;
