
// Freetime
// ========
// start   : Number<Milliseconds>
// end     : Number<Milliseconds>
// ownerId : String

// busytimes: [{start, end}]
// options:   { minTime, maxTime, startOfDay, endOfDay }
Freetimes._addStartEndTimes = function (busytimes, options) {
  var start      = options.minTime;
  var end        = options.maxTime;
  var startOfDay = options.startOfDay || 0;
  var endOfDay   = options.endOfDay   || 1*DAYS;

  function startOf (day) { return day + startOfDay; };
  function endOf   (day) { return day + endOfDay;   };

  var day        = Number(Date.startOfDay(start));
  var lastDay    = Number(Date.startOfDay(end));

  if(start < startOf(day)) {
    busytimes.push({
      start: start,
      end:   startOf(day)
    });
  }

  while(day < lastDay) {
    busytimes.push({
      start: endOf(day),
      end:   startOf(day) + 1 * DAYS
    });

    day += 1*DAYS;
  }

  if(end > endOf(day)) {
    busytimes.push({
      start: endOf(day),
      end:   end
    });
  }

  return busytimes;
};

// busytimes: [{start, end}]
Freetimes._coalesceBusytimes = function (busytimes) {
  busytimes    = _.sortBy(busytimes, 'end');
  busytimes    = _.sortBy(busytimes, 'start');
  newBusytimes = [];

  busytimes.forEach(function (next) {
    var last = newBusytimes.pop();
    if(!last) {
      newBusytimes.push(next);
    }
    else if(last.end < next.start) {
      newBusytimes.push(last);
      newBusytimes.push(next);
    }
    else {
      newBusytimes.push({
        start: _.min(last.start, next.start),
        end:   _.max(last.end,   next.end)
      });
    }
  });

  return newBusytimes;
};

// busytimes: [{start, end}]
Freetimes._invertBusytimes = function (busytimes) {
  var freetimes = [];

  busytimes.forEach(function (obj, index, busytimes) {
    var start, end;

    // if it's the first item, add a freetime before obj.start
    if(index === 0 && minTime < obj.start) {
      start = minTime;
      end   = obj.start;
      freetimes.push({
        start: start,
        end:   end
      });
    }

    // for every other item, including the last, add a freetime between items
    if(index !== 0) {
      start = busytimes[index-1].end;
      end   = obj.start;
      freetimes.push({
        start: start,
        end:   end
      });
    }

    // if it's the last item, add a freetime after obj.end
    if(index === busytimes.length-1 && maxTime > obj.end) {
      start = obj.end;
      end   = maxTime;
      freetimes.push({
        start: start,
        end:   end
      });
    }
  });

  return freetimes;
};

// busytimes: [{start, end}]
// options:   { minTime, maxTime, startOfDay, endOfDay }
Freetimes._toFreetimes = function (busytimes, options) {
  // inputs are in milliseconds, but task time is limited by granularity
  var granularity = Meteor.user().taskGranularity();
  granularity     = _.bound(granularity, 1, Infinity);
  options.minTime = Date.floor(options.minTime, granularity);
  options.maxTime = Date.floor(options.maxTime, granularity);

  // TODO: add busytimes { start: -Infinity, minTime }
  busytimes     = this._addStartEndTimes(busytimes, options);
  busytimes     = this._coalesceBusytimes(busytimes);
  var freetimes = this._invertBusytimes(busytimes);

  return freetimes;
};

// busytimes: [{start, end}]
// options:   { minTime, maxTime, startOfDay, endOfDay, defaultProperties }
Freetimes.createFromBusytimes = function (busytimes, options) {
  var freetimes = this._toFreetimes(busytimes, options);

  return freetimes.map(function(freetime) {
    freetime = _.extend(options.defaultProperties, freetime);
    freetime.remaining = function () { return this.end - this.start; };
    return freetime;
  });
};

// obj: [{start, end}] OR {start, end}
Freetimes.printable = function (obj) {
  if(Array.isArray(obj)) return obj.map(Freetimes.printable);
  else {
    var freetime   = R.cloneDeep(obj);
    freetime.start = new Date(freetime.start);
    freetime.end   = new Date(freetime.end);
    return freetime;
  }
};
