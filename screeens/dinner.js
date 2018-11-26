const dinners = [
  { name: 'なか卯', rate: 1 },
  { name: 'てんや', rate: 1 },
  { name: 'Sガスト', rate: 1 },
  { name: 'やよい軒', rate: 1 },
  { name: 'ガスト', rate: 1 },
  { name: 'だるま家2', rate: 2 },
  { name: '大勝軒', rate: 2 },
  { name: 'たいぞう', rate: 1 },
  { name: 'セブン', rate: 3 },
  { name: 'どさん子', rate: 1 }
];

const enrichedDinners = dinners
  .map(function(dinner) {
    const enriched = [];
    for (var i = 0; i < dinner.rate; i++) {
      enriched.push(dinner);
    }
    return enriched;
  })
  .reduce(function(result, current) {
    return result.concat(current);
  }, []);

const Screen = require('../Screen.js');

const dinnerScreen = new Screen('dinner');

const val = function() { return dinnerScreen.val(); };
dinnerScreen.setConsumer(function(state) {
  if (val().choosing) {
    if (state == 'push') {
      val().choosing = false;
      clearInterval(dinnerScreen.val().choosingInterval);
      return true;
    }
    else {
      return false;
    }
  }
  else if (state == 'holdLeft') {
    return 'menu';
  }
});

dinnerScreen.setDrawer(function(ctx) {
  ctx.font = "14px sazanami-gothic";
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, 128, 64);
  ctx.fillStyle = "white";
  ctx.fillText(enrichedDinners[this.cursor].name, 0, 13);
});

dinnerScreen.onPullupFunc = function(globalVariables) {
  this.cursor = 0;
  val().choosing = true;
  const self = this;
  dinnerScreen.val().choosingInterval = setInterval(function() {
    self.cursor = Math.floor(Math.random() * enrichedDinners.length);
    self.notify();
  }, 100);
};

module.exports = dinnerScreen;
