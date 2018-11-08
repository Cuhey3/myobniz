process.env.TZ = 'Asia/Tokyo';

const express = require('express');
const TimeTable = require('./TimeTable.js');
const path = require('path');
const PORT = process.env.PORT || 5000;
const Obniz = require('obniz');

const obniz = new Obniz("0781-1067");
const { createCanvas, registerFont } = require('canvas');
registerFont('fonts/sazanami-gothic.ttf', {
  family: "myFont"
});

const timeTable = new TimeTable("錦糸町発 シャトルバス");
obniz.onconnect = async function() {
  console.log("connected");
  const canvas = createCanvas(128, 64);
  const ctx = canvas.getContext('2d');

  setInterval(function() {
    timeTable.check();
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 128, 64);
    ctx.fillStyle = "white";
    ctx.font = "14px myFont";
    ctx.fillText("at " + timeTable.name, 0, 14);
    ctx.font = "14px Aviator";
    ctx.fillText("1st  - " + timeTable.filteredDepartures[0], 0, 30);
    ctx.fillText("2nd - " + timeTable.filteredDepartures[1], 0, 46);
    ctx.fillText("remain - " + timeTable.remainExpression, 0, 62);

    obniz.display.draw(ctx);
  }, 1000)

}
express()
  .use(express.static(path.join(__dirname, 'public')))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));
