
// converting to milliseconds
SECONDS = 1000;
MINUTES = 60 * SECONDS;
HOURS   = 60 * MINUTES;

Date.formatGoog = function (d) {
  if(typeof d === 'number') d = new Date(d);
  var current_year = new Date().getFullYear();
  d.setFullYear(current_year);
  d = d.toISOString();
  return d;
};

Date.ISOToMilliseconds = function (d) {
  d = new Date(d);
  d = Number(d);
  return d;
};

// depends on Moment.js
Date.toMilliseconds = function (n, unit) {
  var dur, ms;

  n   = Number(n);
  dur = moment.duration(n, unit);
  ms  = dur.asMilliseconds();
  return ms;
};
