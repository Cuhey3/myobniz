class Screen {
  constructor(screenName) {
    this.name = screenName;
    this.variables = {};
    this.consumer = function(operate) { return false; };
    this.drawer = function(ctx) {};
  }

  val(str) {
    if (str && typeof str == 'string') {
      return this.variables[str];
    }
    else {
      return this.variables;
    }
  }

  setVariables(variables) {
    this.variables = variables;
  }

  setConsumer(consumer) {
    this.consumer = consumer;
  }

  consume(operate) {
    return this.consumer(operate);
  }

  setDrawer(drawer) {
    this.drawer = drawer;
  }

  draw(ctx) {
    this.drawer(ctx);
  }

  setWatcher(watcher) {
    this.watcher = watcher;
  }

  removeWatcher(watcher) {
    if (watcher == this.watcher) {
      this.watcher == null;
    }
  }

  notify() {
    this.watcher.observe();
  }
}

module.exports = Screen;
