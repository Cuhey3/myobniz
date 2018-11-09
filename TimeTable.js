const nameToDepartures = {
  "錦糸町発 シャトルバス": [
    1830, 1920, 2000, 2050, 2150
  ],
  "錦糸町発 都バス": [
    1800, 1806, 1812, 1819, 1826, 1833, 1840, 1848, 1856,
    1904, 1912, 1920, 1928, 1936, 1944, 1952,
    2000, 2008, 2018, 2028, 2038, 2048, 2059
  ],
  "葛西発 シャトルバス": [
    0904, 0944, 1954
  ],
  "葛西発 都バス": [
    0805, 0811, 0817, 0823, 0829, 0835, 0841, 0848, 0855,
    0903, 0911, 0919, 0927, 0935, 0943, 0948, 0951, 0959
  ],
  "葛西駅発 行き": [
    0802, 0804, 0806, 0809, 0811, 0813, 0816, 0818, 0820, 0823, 0825, 0827, 0830, 0832, 0834, 0837, 0839, 0842, 0844, 0846, 0849, 0851, 0854, 0856, 0859
  ],
  "門前仲町駅発 行き": [
    0800, 0805, 0810, 0815, 0819, 0823, 0827, 0831, 0834, 0837, 0840, 0843, 0846, 0849, 0852, 0855, 0858,
    0901, 0904, 0907, 0910, 0913, 0916, 0919, 0922, 0925, 0929, 0932, 0936, 0939, 0943, 0947, 0951, 0955
  ],
  "清澄白河駅発 行き": [
    0900, 0903, 0907, 0909, 0911, 0916, 0918, 0920, 0923, 0925, 0928, 0931, 0933, 0936, 0938, 0941, 0944, 0946, 0949, 0952, 0955, 0958
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
