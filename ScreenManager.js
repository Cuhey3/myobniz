const glob = require('glob');
const path = require('path');

function ScreenManager(dir, initialScreenName) {
  const self = this;
  self.screenMap = {};
  self.globalVariables = {};
  glob.sync(dir + '/**/*.js').forEach(function(file) {
    const screen = require(path.resolve(file));
    self.screenMap[screen.name] = screen;
  });
  self.currentScreen = self.screenMap[initialScreenName];
}

ScreenManager.prototype.switchScreen = function(screenName) {
  this.currentScreen.removeWatcher(this);
  if (this.timerId) {
    clearInterval(this.timerId);
  }
  if (this.currentScreen.onPulldownFunc) {
    this.currentScreen.onPulldownFunc(this.globalVariables);
  }
  this.currentScreen = this.screenMap[screenName];
  if (this.currentScreen.onPullupFunc) {
    this.currentScreen.onPullupFunc(this.globalVariables);
  }
  if (this.currentScreen.interval) {
    const self = this;
    this.timerId = setInterval(
      function() {
        self.draw();
      }, this.currentScreen.interval
    );
  }
  this.currentScreen.setWatcher(this);
};

ScreenManager.prototype.draw = function() {
  this.currentScreen.draw(this.context);
  if (this.display) {
    this.display.draw(this.context);
  }
};

ScreenManager.prototype.bindDisplay = function(display) {
  this.display = display;
  return this;
};

ScreenManager.prototype.bindContext = function(context) {
  this.context = context;
  return this;
};

ScreenManager.prototype.consume = function(state) {
  const result = this.currentScreen.consume(state);
  if (result) {
    if (typeof result == 'string') {
      this.switchScreen(result);
    }
    this.draw();
  }
};

ScreenManager.prototype.observe = function() {
  this.draw();
};

module.exports = ScreenManager;
