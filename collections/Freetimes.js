
// Freetime
// ========
// start   : Number<Milliseconds>
// end     : Number<Milliseconds>
// ownerId : String

Freetimes = new Mongo.Collection('freetimes');

function addStartEndTimes(busytimes, options) {
  var starttimes = lodash.pluck(busytimes, 'start');
  var endtimes   = lodash.pluck(busytimes, 'end');
  var start      = options.minTime;
  var end        = options.maxTime;
  var userId     = options.userId;

  var day        = Number(Date.startOfDay(start));
  var lastDay    = Number(Date.startOfDay(end));

  var user       = Meteor.users.findOne(userId);
  var startOfDay = user.startOfDay() || 0;
  var endOfDay   = user.endOfDay()   || 1 * DAYS;

  startOfDay     = day + startOfDay;
  endOfDay       = day + endOfDay;

  if(start < startOfDay) {
    busytimes.push({
      start: start,
      end:   startOfDay
    });
  }

  while(day < lastDay) {
    busytimes.push({
      start: endOfDay,
      end:   startOfDay + 1 * DAYS
    });

    startOfDay += 1 * DAYS;
    endOfDay   += 1 * DAYS;
    day        += 1 * DAYS;
  }

  if(end > endOfDay) {
    busytimes.push({
      start: endOfDay,
      end:   end
    });
  }

  return busytimes;
};

function coalesceBusytimes(busytimes) {
  busytimes    = lodash.sortBy(busytimes, 'end');
  busytimes    = lodash.sortBy(busytimes, 'start');
  newBusytimes = [];

  busytimes.forEach(function (obj) {
    if(newBusytimes.length === 0) {
      newBusytimes.push(obj);
      return;
    }
    var last = newBusytimes.pop();
    var next = obj;
    if(last.end < next.start) {
      newBusytimes.push(last);
      newBusytimes.push(next);
    }
    else {
      var newObj = {};
      newObj.start = lodash.min([last.start, next.start]);
      newObj.end   = lodash.max([last.end,   next.end]);
      newBusytimes.push(newObj);
    }
  });

  return newBusytimes;
};

function toFreetimes(busytimes, options) {
  console.log('converting to freetimes');
  // inputs are in milliseconds, but task time is only per minute granularity
  minTime = Date.nearestMinute(options.minTime) + 1*MINUTES;
  maxTime = Date.nearestMinute(options.maxTime);

  if(busytimes.length == 0) return [ { start: minTime, end: maxTime } ];
  console.log('busytimes: ', busytimes);
  console.log('adding start and end times');
  busytimes = addStartEndTimes(busytimes, options);
  console.log('busytimes: ', busytimes);
  console.log('coalescing busytimes');
  busytimes = coalesceBusytimes(busytimes);
  console.log('busytimes: ', busytimes);

  var freetimes = [];

  busytimes.forEach(function (obj, index, busytimes) {
    var start, end;

    if(index === 0) { // if first busytime
      console.log('minTime: ', minTime);
      console.log('obj.start: ', obj.start);
      if(minTime < obj.start) {
        start = minTime;
        end   = obj.start;
      }
    }
    else {
      start = busytimes[index-1].end;
      end   = obj.start;
    }
    freetimes.push({
      start: start,
      end:   end
    });

    if(index === busytimes.length-1) {
      if(maxTime > obj.end) {
        start = obj.end;
        end   = maxTime;
      }
    }
    freetimes.push({
      start: start,
      end:   end
    });
  });

  // freetimes = freetimes.map(function(ft) {
  //   ft.ownerId = Meteor.userId();
  //   ft.timeRemaining = function () {
  //     return this.end - this.start;
  //   };
  //   return ft;
  // });

  return freetimes;
};

Freetimes.helpers({
  update: function (data) {
    Freetimes.update(this._id, { $set: data });
  },

  duration: function() {
    return this.end - this.start;
  },

  timeRemaining: function() {
    return this.duration();
  }
});

Freetimes.fetch = function (selector, options) {
  var result = Freetimes.find(selector, options);
  result     = result.fetch();
  return result;
};

Freetimes.create = function (obj) {
  if(Array.isArray(obj)) {
    var ary = obj;
    return ary.map(function(ft) {
      return Freetimes.create(ft);
    });
  } else if(typeof(obj) === 'object') {
    return Freetimes.insert(obj);
  } else {
    console.error('Error: updateOrCreate does not expect type:', typeof(obj));
  }
};

Freetimes.createFromBusytimes = function (busytimes, options) {
  defaultProperties = options.defaultProperties;

  var freetimes = toFreetimes(busytimes, options);
  console.log('freetimes: ', freetimes);
  freetimes = freetimes.map(function(freetime) {
    lodash.forOwn(defaultProperties, function(value, key) {
      freetime[key] = value;
    });
    return freetime;
  });

  return Freetimes.create(freetimes);
};
