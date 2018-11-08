const nameToDepartures = {
  "錦糸町発 シャトルバス": [
    1830, 1920, 2000, 2050, 2150
  ],
  "葛西発 シャトルバス": [
    0904, 0944, 1954
  ],
  "葛西発 都バス": [
    0805, 0811, 0817, 0823, 0829, 0835, 0841, 0848, 0855,
    0903, 0911, 0919, 0927, 0935, 0943, 0948, 0951, 0959
  ]
}

function TimeTable(name) {
  this.name = name;
  this.departures = nameToDepartures[name];
}

TimeTable.prototype.check = function() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  this.filteredDepartures = this.departures.filter(function(departure) {
    return hours * 100 + minutes < departure;
  });
  if (this.filteredDepartures.length > 0) {
    const next = this.filteredDepartures[0];
    const nextHour = Math.floor(next / 100);
    const nextMinutes = next % 100;

    this.remain = (new Date(now.getFullYear(), now.getMonth(), now.getDate(), nextHour, nextMinutes, 0).getTime() - now.getTime()) / 1000;
    this.remainExpression = Math.floor(this.remain / 60) + "m" + (("0" + Math.floor(this.remain % 60)).substring(1)) + "s";
  }
  else {
    this.filteredDepartures = ["None"];
    this.remainExpression = "";
  }
}

module.exports = TimeTable;
