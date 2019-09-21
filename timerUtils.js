const moment = require("moment");

moment.locale("es");
var startTime = 0;
var endTime = 0;

module.exports = {
  getNow() {
    const today = moment().format("LLLL");
    return today;
  },
  startTimer() {
    startTime = moment();
    return startTime;
  },
  endTimer() {
    endTime = moment();
    let result = this.duration(endTime);
    return result;
  },
  duration(finalTime) {
    var duration = moment.duration(finalTime.diff(startTime)).seconds();
    return duration;
  }
};
