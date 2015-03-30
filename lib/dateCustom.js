
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

Date.parseTime = function (time) {
  time = Date.create(time);
  time = time.getHours()   * HOURS
       + time.getMinutes() * MINUTES
       + time.getSeconds() * SECONDS
       + time.getMilliseconds();

  return time;
};

Date.timeString = function (time) {
  console.log('time: ', time);
  var str     = '';
  console.log('time / HOURS: ', time / HOURS);
  var hours   = Math.floor(time / HOURS);
  console.log('hours: ', hours);
  time       -= hours * HOURS;
  console.log('time: ', time);
  console.log('time / MINUTES: ', time / MINUTES);
  var minutes = Math.floor(time / MINUTES);
  console.log('minutes: ', minutes);
  if(hours < 10) str += '0';
  console.log('str: ', str);
  str += hours + ':'
  console.log('str: ', str);
  if(minutes < 10) str += '0';
  console.log('str: ', str);
  str += minutes;
  console.log('str: ', str);

  return str;
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
