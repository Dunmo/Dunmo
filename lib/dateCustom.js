
// converting to milliseconds
SECONDS = 1000;
MINUTES = 60 * SECONDS;
HOURS   = 60 * MINUTES;
DAYS    = 24 * HOURS;

Date.MAX_TIMESTAMP = 8640000000000000;

Date.maxDate = function () {
  return new Date(Date.MAX_TIMESTAMP);
};

Date.prototype.equals = function (d) {
  return this.toString() === d.toString();
};

Date.prototype.startOfDay = function () {
  return Date.startOfDay(this);
};

Date.prototype.endOfDay = function () {
  return Date.endOfDay(this);
};

Date.prototype.isToday = function () {
  return (Date.startOfToday() === this.startOfDay());
};

Date.prototype.toHtmlDate = function () {
  return Date.toHtmlDate(this);
};

Date.toHtmlDate = function (d) {
  d = new Date(d);
  return moment(d).format('YYYY-MM-DD');
};

Date.formatGoog = function (d) {
  if(typeof d === 'number') d = new Date(d);
  var currentYear = Date.currentYear();
  if(d.getFullYear() < currentYear) d.setFullYear(currentYear);
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
  var date = Date.create(time);
  time     = Date.timeOfDay(date);
  return time;
};

// time: Number<milliseconds>
Date.timeString = function (time) {
  var str     = '';
  var hours   = Math.floor(time / HOURS);
  time       -= hours * HOURS;
  var minutes = Math.floor(time / MINUTES);

  if(hours < 10) str += '0';
  str += hours + ':';
  if(minutes < 10) str += '0';
  str += minutes;

  return str;
};

Date.startOfDay = function (date) {
  var date = date ? new Date(date) : new Date();
  date.setHours(00, 00, 00, 00);
  return date;
};

Date.endOfDay = function (date) {
  var date = date ? new Date(date) : new Date();
  date.setHours(23, 59, 00, 00);
  return date;
};

Date.startOfToday = function (date) {
  return Date.startOfDay(Date.now());
};

Date.endOfToday = function (date) {
  return Date.endOfDay(Date.now());
};

Date.daysAgo = function (n) {
  return new Date(Date.now() - n*DAYS);
};

Date.startOfYesterday = function (date) {
  return Date.startOfDay(Date.daysAgo(1));
};

Date.endOfYesterday = function (date) {
  return Date.endOfDay(Date.daysAgo(1));
};

Date.currentYear = function () {
  return new Date().getFullYear();
};

var _DateCreate = Date.create;
Date.create = function (str, code) {
  var orig_result = _DateCreate.apply(this, [str, code]);

  if( orig_result >= Date.startOfDay() ) return orig_result;

  str = str.slimNTidy();
  var m = str.match(/^monday|^tuesday|^wednesday|^thursday|^friday|^saturday|^sunday/i);
  if(m) m = m[0]; // get matched text
  else  m = '';

  str = str.replace(m, 'next ' + m);

  return _DateCreate.apply(this, [str, code]);
};

// TODO: refactor ceiling, floor, nearest into Math
Date.floor = function (milliseconds, unit) {
  return Math.floor(milliseconds / unit) * unit;
};

Date.ceiling = function (milliseconds, unit) {
  return Math.ceil(milliseconds / unit) * unit;
};

Date.nearest = function (milliseconds, unit) {
  if(unit === undefined || unit === null) {
    return Date.nearest(Date.now(), milliseconds);
  }
  return Math.round(milliseconds / unit) * unit;
};

Date.nearestSecond = function (milliseconds) {
  return Date.nearest(milliseconds, MINUTES);
};

Date.nearestMinute = function (milliseconds) {
  return Date.nearest(milliseconds, MINUTES);
};

Date.floorMinute = function (milliseconds) {
  return Date.floor(milliseconds, MINUTES);
};

Date.minutes = function (milliseconds) {
  return Math.floor(milliseconds / MINUTES);
};

Date.hours = function (milliseconds) {
  return Math.floor(milliseconds / HOURS);
};

Date.durationWithinRange = function (originalRange, targetRange) {
  var originalStart = Number(new Date(originalRange[0]));
  var originalEnd   = Number(new Date(originalRange[1]));
  var targetStart   = Number(new Date(targetRange[0]));
  var targetEnd     = Number(new Date(targetRange[1]));

  var start = _.max([originalStart, targetStart]);
  var end   = _.min([originalEnd,   targetEnd]);

  var duration = end - start;
  var originalDuration = originalEnd - originalStart;
  duration = _.bound(duration, 0, originalDuration);

  return duration;
};

Date.timeOfDay = function (milliseconds) {
  var d = new Date(milliseconds);
  return d.getHours()   * HOURS
       + d.getMinutes() * MINUTES
       + d.getSeconds() * SECONDS
       + d.getMilliseconds();
};
