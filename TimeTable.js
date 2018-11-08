const nameToDepartures = {
  "錦糸町発 都バス": [],
  "錦糸町発 シャトルバス": [
    1830, 1920, 2000, 2050, 2150
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
}

module.exports = TimeTable;
