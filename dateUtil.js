const yearDigitStr = ('(2018|2019|2020|２０１８|２０１９|２０２０)');
const monthDigitStr = '([1１][0-2０-２]|[0０]?[\\d０-９])';
const dayDigitStr = '([1１2２][\\d０-９]|[3３][0０1１]|[0０]?[\\d０-９])';

function toFutureDate(date) {
  if (date.getTime() > new Date().getTime()) {
    return date;
  }
  else {
    const pastDate = new Date(date.toString());
    return new Date(pastDate.getFullYear() + 1, pastDate.getMonth(), pastDate.getDate());
  }
}
const datePatterns = [{
  name: "YYYY/M/D",
  pattern: new RegExp(yearDigitStr + '/' + monthDigitStr + '/' + dayDigitStr),
  extract: function(matches) {
    return new Date(Number(matches[1]), Number(matches[2]) - 1, Number(matches[3]));
  }
}, {
  name: "YYYY年M月D日",
  pattern: new RegExp(yearDigitStr + '年' + monthDigitStr + '月' + dayDigitStr + '日'),
  extract: function(matches) {
    return new Date(Number(matches[1]), Number(matches[2]) - 1, Number(matches[3]));
  }
}, {
  name: "M/D",
  pattern: new RegExp(monthDigitStr + '/' + dayDigitStr),
  extract: function(matches) {
    return toFutureDate(new Date(new Date().getFullYear(), Number(matches[1]) - 1, Number(matches[2])));
  }
}, {
  name: "M月D日",
  pattern: new RegExp(monthDigitStr + '月' + dayDigitStr + '日'),
  extract: function(matches) {
    return toFutureDate(new Date(new Date().getFullYear(), Number(matches[1]) - 1, Number(matches[2])));
  }
}];

function extractDates(str) {
  const result = [];

  let obj = datePatterns.find(function(obj) {
    return obj.pattern.test(str);
  });
  while (obj) {
    result.push(obj.extract(obj.pattern.exec(str)).getTime());
    str = str.replace(obj.pattern, '');
    obj = datePatterns.find(function(obj) {
      return obj.pattern.test(str);
    });
  }
  return result;
}

module.exports = { extractDates };
