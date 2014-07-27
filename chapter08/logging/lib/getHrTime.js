// get high resolution time (in miliseconds)
module.exports = function getHrTime() {
  // ts = [seconds, nanoseconds]
  var ts = process.hrtime();
  // convert seconds to miliseconds and nanoseconds to miliseconds as well
  return (ts[0] * 1000) + (ts[1] / 1000000);
};
