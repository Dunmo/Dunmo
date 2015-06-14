
Daylist = function (doc) {
  doc = doc || {};
  doc = _.cloneDeep(doc);

  var properties = {
    freetimes: []
  };

  var methods = {
    remaining: function () {
      var remainingFreetimes = this.freetimes.map(function (freetime) {
        return freetime.remaining();
      });
      return _.sum(remainingFreetimes);
    }
  };

  doc = _.merge(properties, doc);
  doc = _.extend(doc, methods);

  return doc;
}

// Assumes no freetimes carry over into another day
// TODO: handle multi-day freetimes
Daylists.createFromFreetimes = function (freetimes) {
  freetimes           = _.sortBy(freetimes, 'start');
  var daylists        = [];
  var currentEndOfDay = Date.endOfDay(freetimes[0].start);
  var currentDaylist  = new Daylist({ endOfDay: currentEndOfDay });

  freetimes.forEach(function (freetime) {
    if(freetime.end > currentEndOfDay) {
      currentEndOfDay = Date.endOfDay(freetime.start);
      daylists.push(currentDaylist);
      currentDaylist = new Daylist({ endOfDay: currentEndOfDay });
    }
    currentDaylist.freetimes.push(freetime);
  });
  daylists.push(currentDaylist);

  return daylists;
};
