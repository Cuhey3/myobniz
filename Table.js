class Table {

  constructor() {
    this.cursor = 0;
    this.elements = [];
  }

  moveCursor(num) {
    if (num) {
      this.cursor = (
        this.cursor + num + this.elements.length
      ) % this.elements.length;
    }
  }

  draw(ctx) {}
}

module.exports = Table;
