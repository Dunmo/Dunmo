
Date.formatGoog = function (d) {
  d.setFullYear(2015);
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
