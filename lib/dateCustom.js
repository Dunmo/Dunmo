
// converting to milliseconds
SECONDS = 1000;
MINUTES = 60 * SECONDS;
HOURS   = 60 * MINUTES;
DAYS    = 24 * HOURS;

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

Date.startOfDay = function(date) {
  var date = date ? new Date(date) : new Date();
  date.setHours(00, 00, 00, 00);
  return date;
};

Date.endOfDay = function(date) {
  var date = date ? new Date(date) : new Date();
  date.setHours(23, 59, 00, 00);
  return date;
};

Date.startOfToday = function(date) {
  return Date.startOfDay(Date.now());
};

Date.prototype.startOfDay = function() {
  return Date.startOfDay(this);
};

Date.prototype.endOfDay = function() {
  return Date.endOfDay(this);
};

Date.prototype.isToday = function() {
  return (Date.startOfToday() === this.startOfDay());
};
