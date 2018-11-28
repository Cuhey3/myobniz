process.env.TZ = 'Asia/Tokyo';

const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const Obniz = require('obniz');
const yaml = require('js-yaml');
const ScreenManager = require('./ScreenManager.js');
const bodyParser = require('body-parser');
const querystring = require('querystring');
const { parseString } = require('xml2js');
const OnHoldHelper = require('./OnHoldHelper.js');
const OnContinuousHelper = require('./OnContinuousHelper.js');
const dsl_runner = require('./dsl.js');
const screenManager = new ScreenManager('./screeens', 'menu');

let obniz = new Obniz(process.env.OBNIZ_ID, { local_connect: false, auto_connect: false });
obniz.connect();
const { createCanvas, registerFont } = require('canvas');

dsl_runner.dsl_globals['_functions']['switch'] = async function(dsl_locals, key) {
  dsl_locals.obniz.switch.onchange(key);
  setTimeout(function() { obniz.switch.onchange('none'); }, 100);
  return new Promise(function(resolve) { setTimeout(function() { resolve() }, 1000) });
};

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(bodyParser.urlencoded({
    extended: true
  }))
  .post('/rpa', async function(req, res) {
    const dsl = yaml.safeLoad(req.body.dslOnRecieve);
    await dsl_runner.execute_dsl(dsl, { obniz });
    res.send('start');
  })
  .get('/', function(req, res) {
    try {
      obniz.connect();
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
      parseString(Object.keys(querystring.parse(req.body))[0], { explicitArray: false }, function(err, result) {
        console.log(result);
        const dsl = yaml.safeLoad(result.root.dslOnReceive);
        console.log(dsl);
        const data = result.root;
        delete data.dsl;
        dsl_runner.execute_dsl(dsl, { data });
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
