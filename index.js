process.env.TZ = 'Asia/Tokyo';

const express = require('express');
const TimeTable = require('./TimeTable.js');
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
  new TimeTable("錦糸町発 シャトルバス")
];

let obniz = new Obniz(process.env.OBNIZ_ID);
const { createCanvas, registerFont } = require('canvas');
registerFont('fonts/sazanami-gothic.ttf', {
  family: "sazanami-gothic"
});
var timerId = null;

function connectAction() {
  if (timerId) {
    clearInterval(timerId);
  }
  obniz.reset();
  obniz = new Obniz(process.env.OBNIZ_ID);
  obniz.onconnect = async function() {
    const canvas = createCanvas(128, 64);
    const ctx = canvas.getContext('2d');
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
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, 128, 64);
      ctx.fillStyle = "white";
      ctx.font = "14px sazanami-gothic";
      ctx.fillText("at " + timeTable.name, 0, 14);
      ctx.font = "14px Aviator";
      ctx.fillText("1st  - " + (timeTable.filteredDepartures[0] || "None"), 0, 30);
      ctx.fillText("2nd - " + (timeTable.filteredDepartures[1] || "None"), 0, 46);
      if (timeTable.remainExpression) {
        ctx.fillText("remain - " + timeTable.remainExpression, 0, 62);
      }
      obniz.display.draw(ctx);
    }
    timerId = setInterval(function() {
      drawFunc();
    }, 1000)
  }
}

connectAction()
