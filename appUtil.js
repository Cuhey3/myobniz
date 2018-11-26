function circularAdd(adding, added, max) {
  return (added + adding + max) % max;
}

function objToTop(array, name) {
  for (var i = 0; i < array.length; i++) {
    if (array[i].name == name) {
      break;
    }
  }
  const element = array.splice(i, 1);
  array.unshift(element[0]);
}

const holidayMap = {
  "20180101": true,
  "20180108": true,
  "20180212": true,
  "20180321": true,
  "20180430": true,
  "20180503": true,
  "20180504": true,
  "20180716": true,
  "20180917": true,
  "20180924": true,
  "20181008": true,
  "20181123": true,
  "20181224": true,
  "20190101": true,
  "20190114": true,
  "20190211": true,
  "20190321": true,
  "20190429": true,
  "20190503": true,
  "20190506": true,
  "20190715": true,
  "20190812": true,
  "20190916": true,
  "20190923": true,
  "20191014": true,
  "20191104": true,
  "20191223": true
};

function getDateType() {
  const date = new Date();
  if (date.getDay() === 6) {
    return 'saturday';
  }
  else if (date.getDay() === 0) {
    return 'holiday';
  }
  else {
    const dateString = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate() + "";
    if (dateString in holidayMap) {
      return 'holiday';
    }
    else {
      return 'weekday';
    }
  }
}

module.exports = {
  circularAdd,
  objToTop,
  getDateType
};
