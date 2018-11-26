const Screen = require('../Screen.js');
const ScrollableTable = require('../ScrollableTable.js');
const holidayScreen = new Screen('holiday');
const holidays = [
  { "2018/01/01/月": "元日" },
  { "2018/01/08/月": "成人の日" },
  { "2018/02/12/月": "建国記念の日・振替休日" },
  { "2018/03/21/水": "春分の日" },
  { "2018/04/30/月": "昭和の日・振替休日" },
  { "2018/05/03/木": "憲法記念日" },
  { "2018/05/04/金": "みどりの日" },
  { "2018/07/16/月": "海の日" },
  { "2018/09/17/月": "敬老の日" },
  { "2018/09/24/月": "秋分の日・振替休日" },
  { "2018/10/08/月": "体育の日" },
  { "2018/11/23/金": "勤労感謝の日" },
  { "2018/12/24/月": "天皇誕生日・振替休日" },
  { "2019/01/01/火": "元日" },
  { "2019/01/14/月": "成人の日" },
  { "2019/02/11/月": "建国記念の日" },
  { "2019/03/21/木": "春分の日" },
  { "2019/04/29/月": "昭和の日" },
  { "2019/05/03/金": "憲法記念日" },
  { "2019/05/06/月": "こどもの日・振替休日" },
  { "2019/07/15/月": "海の日" },
  { "2019/08/12/月": "山の日・振替休日" },
  { "2019/09/16/月": "敬老の日" },
  { "2019/09/23/月": "秋分の日" },
  { "2019/10/14/月": "体育の日" },
  { "2019/11/04/月": "文化の日・振替休日" },
  { "2019/12/23/月": "天皇誕生日" }
];

const scrollableTable = new ScrollableTable({
  elements: holidays.map(function(holiday) { return Object.keys(holiday)[0] }),
  font: "12px Aviator",
  fromY: 13,
  width: 128,
  height: 64,
  contentLength: 4
});

holidayScreen.setConsumer(function(state) {
  if (state == 'right') {
    scrollableTable.moveCursor(+1);
    return true;
  }
  if (state == 'left') {
    scrollableTable.moveCursor(-1);
    return true;
  }
  else if (state == "holdLeft") {
    return "menu";
  }
  else {
    return false;
  }
});

holidayScreen.setDrawer(function(ctx) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, 128, 64);
  ctx.fillStyle = "white";
  ctx.font = "12px Aviator";
  ctx.fillText("Next holiday is...", 0, 13);
  scrollableTable.draw(ctx);
});

holidayScreen.onPullupFunc = function(globalVariables) {
  const now = new Date();
  const todayString = now.getFullYear() + "/" + (now.getMonth() + 1) + "/" + now.getDate();
  for (var i = 0; i < holidays.length; i++) {
    if (Object.keys(holidays[i])[0] > todayString) {
      scrollableTable.cursor = i;
      break;
    }
  }
};

module.exports = holidayScreen;
