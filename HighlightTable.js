const { circularAdd } = require('./appUtil.js');

const Table = require('./Table.js');

class HighlightTable extends Table {
  constructor(options) {
    super();
    this.options = options;
    this.cursor = options.initialCursor || 0;
    this.createPages();
  }
}

HighlightTable.prototype.moveCursor = function(num) {
  if (num) {
    this.cursor = circularAdd(num, this.cursor, this.options.elements.length);
  }
};

HighlightTable.prototype.selectedText = function() {
  return this.options.elements[this.cursor][this.options.textKey];
};

HighlightTable.prototype.createPages = function() {
  const pages = [];
  let index = 0;
  const { pageContentSize, all, textKey, elements } = this.options;
  if (all) {
    elements.unshift({
      [textKey]: 'ALL'
    });
  }
  while (true) {
    const page = { start: index, end: -1, pageContent: [] };
    if (pages.length > 0 && ((pages[pages.length - 1]).pageContent)[pageContentSize - 1][textKey] === 'next→') {
      page.pageContent.push({
        [textKey]: '←prev'
      });
    }
    while (index < elements.length && page.pageContent.length < pageContentSize - 1) {
      let copied = JSON.parse(JSON.stringify(elements[index]));
      copied.index = index;
      page.pageContent.push(copied);
      index++;
    }
    if (index == elements.length) {
      page.end = index - 1;
      pages.push(page);
      break;
    }
    else if (index == elements.length - 1) {
      let copied = JSON.parse(JSON.stringify(elements[index]));
      copied.index = index;
      page.pageContent.push(copied);
      page.end = index;
      pages.push(page);
      break;
    }
    else if (index < elements.length - 1) {
      page.pageContent.push({
        [textKey]: 'next→'
      });
      page.end = index - 1;
      pages.push(page);
    }
  }
  this.pages = pages;
};

HighlightTable.prototype.draw = function(ctx) {
  const self = this;
  let positionY = 0;
  let tableCursor = 0;
  let currentColumn = 0;
  const { font, textKey, fromX = 0, fromY = 0, width: tableWidth, height: tableHeight, column = 1 } = this.options;
  ctx.fillStyle = "black";
  ctx.fillRect(fromX, fromY, tableWidth, tableHeight);
  ctx.fillStyle = "white";
  if (font) {
    ctx.font = font;
  }
  const page = this.pages.find(function(page) {
    return page.end >= self.cursor;
  });

  while (true && tableCursor < page.pageContent.length) {
    const nextText = page.pageContent[tableCursor][textKey];
    const index = page.pageContent[tableCursor].index;
    const nextHeight = parseInt(ctx.font, 10);
    if (currentColumn < column) {
      if (this.cursor == index) {
        ctx.fillStyle = "white";
        ctx.fillRect(fromX + (currentColumn * (tableWidth / column)), fromY + positionY + 2, tableWidth / column, parseInt(ctx.font, 10));
        ctx.fillStyle = "black";
        ctx.fillText(nextText, fromX + (currentColumn * (tableWidth / column)), fromY + positionY + nextHeight);
        ctx.fillStyle = "white";
      }
      else {
        ctx.fillText(nextText, fromX + (currentColumn * (tableWidth / column)), fromY + positionY + nextHeight);
      }
      currentColumn++;
    }
    else if (positionY + nextHeight <= tableHeight) {
      positionY += nextHeight;
      currentColumn = 1;
      if (this.cursor == index) {
        ctx.fillStyle = "white";
        ctx.fillRect(fromX, fromY + positionY + 2, tableWidth / column, parseInt(ctx.font));
        ctx.fillStyle = "black";
        ctx.fillText(nextText, fromX, fromY + positionY + nextHeight);
        ctx.fillStyle = "white";
      }
      else {
        ctx.fillText(nextText, fromX, fromY + positionY + nextHeight);
      }
    }
    else {
      break;
    }
    tableCursor++;
  }
};

module.exports = HighlightTable;
