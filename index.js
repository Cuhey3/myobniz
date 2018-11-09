process.env.TZ = 'Asia/Tokyo';

const express = require('express');
const TimeTable = require('./TimeTable.js');
const CanvasUtil = require('./CanvasUtil.js');
const path = require('path');
const PORT = process.env.PORT || 5000;
const Obniz = require('obniz');

express()
  .use(express.static(path.join(__dirname, 'public')))
  .post('/', function(req, res) {
    try {
      connectAction();
      res.send('requested');
    }
    catch (e) {
      res.send(e);
    }
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const timeTables = [
  new TimeTable("葛西発 シャトルバス"),
  new TimeTable("葛西発 都バス"),
  new TimeTable("錦糸町発 シャトルバス"),
  new TimeTable("錦糸町発 都バス")
];

let obniz = new Obniz(process.env.OBNIZ_ID);
const { createCanvas, registerFont } = require('canvas');
registerFont('fonts/sazanami-gothic.ttf', {
  family: "sazanami-gothic"
});
var timerId = null;
const canvas = createCanvas(128, 64);
const ctx = canvas.getContext('2d');

const canvasUtil = new CanvasUtil(ctx);
canvasUtil.setResetFunc(function(ctx) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, 128, 64);
  ctx.fillStyle = "white";
});
canvasUtil.setLineStyles([
  { font: "14px sazanami-gothic", text_y: 14 },
  { font: "14px Aviator", text_y: 30 },
  { font: "14px Aviator", text_y: 46 },
  { font: "14px Aviator", text_y: 62 }
]);

function connectAction() {
  obniz.onconnect = async function() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
    let cursor = 0;
    obniz.switch.onchange = function(state) {
      if (state == 'left') {
        cursor = (cursor + timeTables.length - 1) % timeTables.length;
        drawFunc();
      }
      else if (state == 'right') {
        cursor = (cursor + 1) % timeTables.length;
        drawFunc();
      }
    }

    function drawFunc() {
      let timeTable = timeTables[cursor];
      timeTable.check();
      canvasUtil.update([
        "at " + timeTable.name,
        "1st  - " + (timeTable.filteredDepartures[0] || "None"),
        "2nd - " + (timeTable.filteredDepartures[1] || "None"),
        timeTable.remainExpression ? "remain - " + timeTable.remainExpression : ""
      ]);
      obniz.display.draw(canvasUtil.context());
    }
    if (!timerId) {
      timerId = setInterval(function() {
        drawFunc();
      }, 1000)
    }
    drawFunc();
  }

}

connectAction()
