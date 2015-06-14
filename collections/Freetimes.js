
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
      end:   startOf(day) + 1*DAYS
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
// options:   { minTime, maxTime }
Freetimes._invertBusytimes = function (busytimes, options) {
  var freetimes = [];

  if(busytimes.length == 0) {
    return [
      {
        start: options.minTime,
        end:   options.maxTime
      }
    ];
  }

  busytimes.forEach(function (obj, index, busytimes) {
    var start, end;

    // if it's the first item, add a freetime before obj.start
    if(index === 0 && options.minTime < obj.start) {
      freetimes.push({
        start: options.minTime,
        end:   obj.start
      });
    }

    // for every other item, including the last, add a freetime between items
    if(index !== 0) {
      freetimes.push({
        start: busytimes[index-1].end,
        end:   obj.start
      });
    }

    // if it's the last item, add a freetime after obj.end
    if(index === busytimes.length-1 && options.maxTime > obj.end) {
      freetimes.push({
        start: obj.end,
        end:   options.maxTime
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
  var freetimes = this._invertBusytimes(busytimes, options);

  return freetimes;
};

// busytimes: [{start, end}]
// options:   { minTime, maxTime, startOfDay, endOfDay, defaultProperties }
Freetimes.createFromBusytimes = function (busytimes, options) {
  var freetimes = this._toFreetimes(busytimes, options);

  freetimes = freetimes.map(function(freetime) {
    freetime = _.extend({}, options.defaultProperties, freetime);
    freetime.remaining = function () { return this.end - this.start; };
    return freetime;
  });
  return freetimes;
};

// obj: [{start, end}] OR {start, end}
Freetimes.printable = function (obj) {
  if(Array.isArray(obj)) return obj.map(Freetimes.printable);
  else {
    var freetime   = _.cloneDeep(obj);
    freetime.start = new Date(freetime.start);
    freetime.end   = new Date(freetime.end);
    return freetime;
  }
};
