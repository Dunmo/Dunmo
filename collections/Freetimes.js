
// Freetime
// ========
// start   : Number<Milliseconds>
// end     : Number<Milliseconds>
// ownerId : String

Freetimes = new Mongo.Collection('freetimes');

var _helpers = collectionsDefault.instanceMethods(Freetimes);

Freetimes.helpers(_.extend(_helpers, {

  duration: function () {
    return this.end - this.start;
  },

  remaining: function () {
    return this.duration();
  }

}));

_.extend(Freetimes, collectionsDefault.collectionMethods(Freetimes));

Freetimes._addStartEndTimes = function (busytimes, options) {
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

Freetimes._coalesceBusytimes = function (busytimes) {
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

Freetimes._toFreetimes = function (busytimes, options) {
  // inputs are in milliseconds, but task time is only per minute granularity
  options.minTime = Date.floorMinute(options.minTime) + 1*MINUTES;
  options.maxTime = Date.floorMinute(options.maxTime);
  minTime = options.minTime;
  maxTime = options.maxTime;

  if(busytimes.length == 0) return [ { start: minTime, end: maxTime } ];
  busytimes = this._addStartEndTimes(busytimes, options);
  busytimes = this._coalesceBusytimes(busytimes);

  var freetimes = [];

  busytimes.forEach(function (obj, index, busytimes) {
    var start, end;

    if(index === 0 && minTime < obj.start) {
      start = minTime;
      end   = obj.start;
      freetimes.push({
        start: start,
        end:   end
      });
    }
    else if(index !== 0){
      start = busytimes[index-1].end;
      end   = obj.start;
      freetimes.push({
        start: start,
        end:   end
      });
    }

    if(index === busytimes.length-1) {
      if(maxTime > obj.end) {
        start = obj.end;
        end   = maxTime;
      }
      freetimes.push({
        start: start,
        end:   end
      });
    }
  });

  return freetimes;
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
    console.error('Error: Freetimes.create does not expect type:', typeof(obj));
  }
};

Freetimes.createFromBusytimes = function (busytimes, options) {
  defaultProperties = options.defaultProperties;

  var freetimes = this._toFreetimes(busytimes, options);
  freetimes = freetimes.map(function(freetime) {
    lodash.forOwn(defaultProperties, function(value, key) {
      freetime[key] = value;
    });
    freetime.remaining = function () {
      return this.end - this.start;
    }
    return freetime;
  });

  return freetimes; // Freetimes.create(freetimes);
};
