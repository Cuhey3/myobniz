const Screen = require('../Screen.js');
const request = require('request-promise');
const { JSDOM } = require('jsdom');
const weatherScreen = new Screen('weather');

const val = function() { return weatherScreen.val; };

function getRainAmount() {

  Promise.all([
      request.get("https://weather.goo.ne.jp/weather/station/130133/3hours/"),
      request.get("https://weather.goo.ne.jp/weather/station/120196/3hours/")
    ])
    .then(function(results) {
      return results.map(function(result) {
        const document = new JSDOM(result).window.document;
        return Array.from(document.querySelectorAll(".weather_address_box li"))
          .map(function(li) {
            const day = li.querySelector('h3').textContent.substr(0, 2);
            const trs = li.querySelectorAll("tr");
            const time = Array.from(trs[0].querySelectorAll("td"));
            const weather = Array.from(trs[1].querySelectorAll("td"));
            const amount = Array.from(trs[3].querySelectorAll("td"));
            return [0, 1, 2, 3, 4, 5, 6, 7].map(function(index) {
              return [day + ('0' + time[index].textContent).substr(-2) + '時', amount[index].textContent.replace("mm", ""), weather[index].textContent];
            });
          }).reduce(function(result, current) {
            result = result.concat(current);
            return result;
          }, []);
      });
    }).then(function(results) {
      const [kasai, chiba] = results;
      for (var i = 0; i < kasai.length; i++) {
        kasai[i] = [kasai[i][0], kasai[i][1], chiba[i][1], kasai[i][2]].join("/");
      }
      val().elements = kasai;
      weatherScreen.notify();
    });
}

weatherScreen.setConsumer(function(state) {
  if (state == 'push') {
    return 'menu';
  }
  else if (state == 'left' || state == 'continuousLeft') {
    const beforeCursor = this.cursor;
    this.cursor = Math.max(this.cursor - 1, 0);
    return beforeCursor != this.cursor;
  }
  else if (state == 'right' || state == 'continuousRight') {
    const beforeCursor = this.cursor;
    this.cursor = this.cursor + 1;
    if (this.cursor > this.lineNo - 4) {
      this.cursor = this.lineNo - 4;
    }
    return beforeCursor != this.cursor;
  }
  else {
    return false;
  }
});

weatherScreen.setDrawer(function(ctx) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, 128, 64);
  ctx.fillStyle = "white";
  ctx.font = '14px sazanami-gothic';
  let positionY = 13 - this.cursor * 16;
  const elements = val().elements || ['取得中…'];
  for (var i = 0; i < elements.length; i++) {
    ctx.fillText(elements[i], 0, positionY);
    positionY += 16;
  }
});

weatherScreen.onPullupFunc = function(globalVariables) {
  this.cursor = 0;
  getRainAmount();
};

module.exports = weatherScreen;
