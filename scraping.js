const request = require('request-promise');
const { JSDOM } = require('jsdom');

function metro(metroUrl, noGoodClassNames = []) {
  request.get(metroUrl).then(function(result) {
    const document = new JSDOM(result).window.document;
    const table = document.getElementsByClassName('v2_tableTimeTableData')[0];
    const tbody = table.getElementsByTagName('tbody')[0];
    const trs = Array.from(tbody.getElementsByTagName('tr'));
    return trs.map(function(tr) {
      let rawHour = parseInt(tr.getElementsByTagName('th')[0].innerHTML);
      if (rawHour < 4) {
        rawHour += 24;
      }
      const hour = ('0' + rawHour).substr(-2);
      return Array.from(tr.getElementsByTagName('li')).filter(function(li) {
        return noGoodClassNames.every(function(noGoodClassName) {
          return li.getElementsByClassName(noGoodClassName).length == 0;
        });
      }).map(function(li) {
        return hour + li.getElementsByTagName('a')[0].innerHTML;
      }).reduce(function(result, current) {
        return result.concat(current);
      }, []);
    }).reduce(function(result, current) {
      return result.concat(current);
    }, []);
  }).then(function(result) {
    console.log(result.join(','));
  });
}

function toei(toeiUrl, noGoodClassNames = []) {
  request.get(toeiUrl).then(function(result) {
    const document = new JSDOM(result).window.document;
    let firstHour = false;
    const res = Array.from(document.querySelectorAll('.ekimod table tbody tr:not(.time)'))
      .map(function(tr) {
        const rawHour = parseInt(tr.querySelector('th').innerHTML);
        if (firstHour == false) {
          firstHour = rawHour;
        }
        const hour = ("0" + (firstHour > rawHour ? 24 + rawHour : rawHour)).substr(-2);
        return Array.from(tr.querySelectorAll('em')).map(function(em) {
          return hour + em.innerHTML;
        });
      })
      .reduce(function(result, current) {
        console.log(current);
        return result.concat(current);
      }, []).join(',');
    console.log(res);
  });
}

function jrEast(jrEastUrl, noGoodClassNames = []) {
  request.get(jrEastUrl).then(function(result) {
    const document = new JSDOM(result).window.document;
    let firstHour = false;
    document.querySelectorAll('table tbody tr')[0].remove();
    document.querySelectorAll('table tbody tr')[0].remove();
    const trs = Array.from(document.querySelectorAll('table tbody tr'));
    const res = trs.map(function(tr) {
        const rawHour = parseInt(tr.querySelector('td').innerHTML);
        if (firstHour == false) {
          firstHour = rawHour;
        }
        const hour = ("0" + (firstHour > rawHour ? 24 + rawHour : rawHour)).substr(-2);
        return Array.from(tr.querySelectorAll('a')).map(function(aSpan) {
          return hour + (aSpan.textContent.replace(/[^\d]/g, ""));
        });
      })
      .reduce(function(result, current) {
        return result.concat(current);
      }, []).join(',');
    console.log(res);
  });
}

function getTimeTable(url, noGoodClassNames = []) {
  if (url.indexOf('tokyometro') != -1) {
    metro(url, noGoodClassNames);
  }
  else if (url.indexOf('time.ekitan.com') != -1) {
    toei(url, noGoodClassNames);
  }
  else if (url.indexOf('www.jreast-timetable.jp') != -1) {
    jrEast(url, noGoodClassNames);
  }
}

// 東西線-飯田橋-帰り(快速でない)
//getTimeTable('https://www.tokyometro.jp/station/iidabashi/timetable/tozai/a/index.html', ['v2_txtExpress']);

// 南北線-白金高輪-行き
//getTimeTable('https://www.tokyometro.jp/station/shirokane-takanawa/timetable/namboku/a/index.html');

// 南北線-白金高輪-帰り
//getTimeTable('https://www.tokyometro.jp/station/shirokane-takanawa/timetable/namboku/b/index.html');

// 南北線-目黒-帰り
//getTimeTable('https://www.tokyometro.jp/station/meguro/timetable/namboku/a/index.html');

// 東西線-葛西-行き
//getTimeTable('https://www.tokyometro.jp/station/kasai/timetable/tozai/b/index.html');

// 三田線-大手町-行き
//getTimeTable('https://time.ekitan.com/train/TimeStation/224-8_D1.shtml');

// 大江戸線/門前仲町/行き
//getTimeTable('https://time.ekitan.com/train/TimeStation/225-28_D1_DW0.shtml');

// 半蔵門線/清澄白河/行き
//getTimeTable('https://www.tokyometro.jp/station/kiyosumi-shirakawa/timetable/hanzomon/a/index.html');

// 大江戸線/清澄白河/帰り
//getTimeTable('https://time.ekitan.com/train/TimeStation/225-27_D2_DW0.shtml');

// 半蔵門線/錦糸町/帰り
//getTimeTable('https://www.tokyometro.jp/station/kinshicho/timetable/hanzomon/a/index.html');

// 総武線/錦糸町/帰り
//getTimeTable('https://www.jreast-timetable.jp/1811/timetable/tt0609/0609030.html');

// 東西線/門前仲町/帰り
//getTimeTable('https://www.tokyometro.jp/station/monzen-nakacho/timetable/tozai/a/index.html', ['v2_txtExpress']);

// 三田線/御成門/行き
//getTimeTable('https://time.ekitan.com/train/TimeStation/224-5_D1.shtml');

// 三田線/御成門/帰り
//getTimeTable('https://time.ekitan.com/train/TimeStation/224-5_D2_DW0.shtml');

// 半蔵門線/永田町/帰り
//getTimeTable('https://www.tokyometro.jp/station/nagatacho/timetable/hanzomon/a/index.html');

// 南北線/永田町/帰り
//getTimeTable('https://www.tokyometro.jp/station/nagatacho/timetable/namboku/a/index.html');

// 東西線/九段下/帰り
//getTimeTable('https://www.tokyometro.jp/station/kudanshita/timetable/tozai/a/index.html', ['v2_txtExpress']);

// 半蔵門/九段下/行き
//getTimeTable('https://www.tokyometro.jp/station/kudanshita/timetable/hanzomon/b/index.html');


//ここから休日

// 半蔵門線/永田町/帰り/休日
//getTimeTable('https://www.tokyometro.jp/station/nagatacho/timetable/hanzomon/a/holiday.html');

// 東西線/九段下/帰り/休日
//getTimeTable('https://www.tokyometro.jp/station/kudanshita/timetable/tozai/a/holiday.html', ['v2_txtExpress']);

// 東西線-葛西-行き/休日
//getTimeTable('https://www.tokyometro.jp/station/kasai/timetable/tozai/b/holiday.html');

// 半蔵門/九段下/行き/休日
//getTimeTable('https://www.tokyometro.jp/station/kudanshita/timetable/hanzomon/b/holiday.html');

// 南北線/永田町/帰り/休日
//getTimeTable('https://www.tokyometro.jp/station/nagatacho/timetable/namboku/a/holiday.html');

// 南北線/飯田橋/行き/休日
//getTimeTable('https://www.tokyometro.jp/station/iidabashi/timetable/namboku/a/holiday.html');

// 東西線-飯田橋-帰り(快速でない)/休日
//getTimeTable('https://www.tokyometro.jp/station/iidabashi/timetable/tozai/a/holiday.html', ['v2_txtExpress']);

// 東西線-茅場町-帰り(快速でない)/休日
//getTimeTable('https://www.tokyometro.jp/station/kayabacho/timetable/tozai/a/holiday.html', ['v2_txtExpress']);

// 総武線/秋葉原/帰り/休日
//getTimeTable('https://www.jreast-timetable.jp/1812/timetable/tt0041/0041021.html');

//日比谷線/秋葉原/帰り/休日
getTimeTable('https://www.tokyometro.jp/station/akihabara/timetable/hibiya/a/holiday.html')
