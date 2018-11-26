process.env.TZ = 'Asia/Tokyo';

const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const Obniz = require('obniz');

const ScreenManager = require('./ScreenManager.js');
const bodyParser = require('body-parser');
const querystring = require('querystring');
const { parseString } = require('xml2js');
const OnHoldHelper = require('./OnHoldHelper.js');
const OnContinuousHelper = require('./OnContinuousHelper.js');
const screenManager = new ScreenManager('./screeens', 'menu');

const obniz = new Obniz(process.env.OBNIZ_ID);

const { createCanvas, registerFont } = require('canvas');
express()
  .use(express.static(path.join(__dirname, 'public')))
  .get('/rpa', function(req, res) {
    if (obniz.switch.onchange) {
      setTimeout(function() {
        const rpaCommand = ['right', 'right', 'right', 'right', 'push', 'none', 'none', 'none', 'none', 'none', 'push'];
        const rpaInterval = setInterval(function() {
          if (rpaCommand.length > 0) {
            const command = rpaCommand.shift();
            obniz.switch.onchange(command);
            setTimeout(function() { obniz.switch.onchange('none'); }, 100);
          }
          else {
            clearInterval(rpaInterval);
          }
        }, 1000);
      }, 5000);
    }
    res.send('start');
  })
  .use(bodyParser.urlencoded({
    extended: true
  }))
  .post('/', function(req, res) {
    try {
      res.send('requested');
    }
    catch (e) {
      res.send(e);
    }
  })
  .post('/boo', bodyParser.text(), function(req, res) {
    try {
      console.log(req.body);
      const rawText = querystring.parse(req.body);
      console.log('r', rawText);
      parseString(Object.keys(querystring.parse(req.body))[0], function(err, result) {
        console.log(result);
      });
      res.send('requested');

    }
    catch (e) {
      console.log(e);
      res.send(e);
    }
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));


registerFont('fonts/sazanami-gothic.ttf', {
  family: "sazanami-gothic"
});

const ctx = createCanvas(128, 64).getContext('2d');

const onHoldHelper = new OnHoldHelper();

const onContinuousHelper = new OnContinuousHelper();

obniz.onconnect = async function() {

  screenManager
    .bindDisplay(obniz.display)
    .bindContext(ctx)
    .draw();

  onHoldHelper
    .setFunc('left', function() {
      obniz.switch.onchange('holdLeft');
    })
    .setFunc('push', function() {
      obniz.switch.onchange('holdPush');
    });

  onContinuousHelper
    .setFunc('left', function() {
      obniz.switch.onchange('continuousLeft');
    })
    .setFunc('right', function() {
      obniz.switch.onchange('continuousRight');
    });

  obniz.switch.onchange = function(state) {
    onHoldHelper.state(state);
    onContinuousHelper.state(state);
    screenManager.consume(state);
  };

};
