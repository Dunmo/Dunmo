
// Depends on dateCustom.js

Natural = {
  impEnum : {
    "!"   : 1,
    "!!"  : 2,
    "!!!" : 3
  },

  numBangs : {
    0 : '',
    1 : '!',
    2 : '!!',
    3 : '!!!'
  },

  parseImportance: function (str) {
    var impEnum = this.impEnum;

    var matches = str.match(/!+/g);
    if(matches) {
      var ret = 0, val;
      matches.forEach(function(match) {
        // can have !!! at most, !!!! will become !!!, etc.
        match = match.match(/!!!|!!|!/);
        if(match) {
          val = impEnum[match];
          if(val > ret) ret = val;
        }
      });

      str = str.replace(/(^|\s+)(!!!|!!|!)($|\s+)/g, ' ');
      str = str.slimNTidy();

      if(ret) {
        return [str, ret];
      }
    }
    else {
      match = str.match(/(((not|not very|not really|hardly|barely|a bit|a little)( ))+important)|unimportant/);
      if(match) {
        str = str.replace(match[0], '');
        return [str.slimNTidy(), 1];
      }
      match = str.match(/((very|really|extremely|super|mega)( ))+important/);
      if(match) {
        str = str.replace(match[0], '');
        return [str.slimNTidy(), 3];
      }
      match = str.match(/((somewhat|sort of|kind of|not very|not really)( ))*important/);
      if(match) {
        str = str.replace(match[0], '');
        return [str.slimNTidy(), 2];
      }
      match = str.match(/no importance/);
      if(match) {
        str = str.replace(match[0], '');
        return [str.slimNTidy(), 0];
      }
      return [str.slimNTidy(), 1];
    }

    return [str.slimNTidy(), 1]
  },

  parseDueAt: function (str) {
    var _match, arr, arrcp, date, first, match, ret, second, temp;

    str = str.replace('midnight', '11:59pm');
    str = str.replace('noon', '12:00pm');

    // Check any text in brackets
    match = str.match(/\[.*\]|\(.*\)|\{.*\}/);
    if(match) {
      match      = match[0];
      _match = match.substring(1, match.length-1);
      date   = Date.create( _match );
      if ( date.isValid() ) {
        ret       = [str.replace(match, '').slimNTidy(), date];
        ret.dueAt = date;
        return ret;
      }
    }

    // Check the rest of the text if there are no brackets

    // Check as is
    date = Date.create( str );
    if ( date.isValid() ) {
      ret       = [str.slimNTidy(), date];
      ret.dueAt = date;
      return ret;
    }

    // Try all permutations
    arr = str.split(" ");
    for (var i = arr.length; i > 0; i--) {
      for (var j = 0; j < i; j++) {
        arrcp = arr.slice(j, i);

        // Check
        temp = arrcp.join(" ");
        date = Date.create( temp );

        if ( date.isValid() ) {
          first = arr.slice(0, j).join(" ");
          first = first.replace(/ (due before|due at|due by|due on|due)$/g, '');
          second = arr.slice(i, arr.length).join(" ");
          ret = first + ' ' + second;
          ret = [ret.slimNTidy(), date];
          ret.dueAt = date;
          return ret;
        }
      };
    };

    match = str.match(/due someday/);
    if(match) {
      match     = match[0];
      date      = Infinity;
      str       = str.replace(match, '');
      str       = str.slimNTidy();
      ret       = [str, date];
      ret.dueAt = date;
      return ret;
    }

    ret       = [str.slimNTidy(), null];
    ret.dueAt = null;
    return ret;
  },

  parseDuration: function (str) {
    var match = str.match(/for ([0-9]+) (\w+) (?:and|&) ([0-9]+) (\w+)|for ([0-9]+) (\w+)/);
    if(match) {
      match = match[0];
      str   = str.replace(match, '');
      match = match.split(' ');
      match.shift();
    }
    else { // didn't match 'for', try to match brackets
      match = str.match(/\[.*\]|\(.*\)|\{.*\}/);
      if (!match) {
        return [str.slimNTidy(), null];
      }
      else {
        match = match[0];
        str   = str.replace(match, '');
        match = match.substring(1, match.length-1);
        match = match.split(' ');
      }
    }

    var num  = match[0];
    var unit = match[1];
    var dur  = Date.toMilliseconds(num, unit);

    if(match.length > 2) {
      var num2  = match[3];
      var unit2 = match[4];
      var dur2  = Date.toMilliseconds(num2, unit2);
      dur = dur + dur2;
    }

    return [str.slimNTidy(), dur];
  },

  // Used when only the title is needed
  parseTitle: function (str) {
    var ret;

    ret = this.parseImportance(str);
    if(ret) str = ret[0];

    ret = this.parseDueAt(str);
    if(ret) str = ret[0];

    ret = this.parseDuration(str);
    if(ret) str = ret[0];

    return str.slimNTidy();
  },

  // Used when all attributes are needed
  parseTask: function (str) {
    var obj = {};


    var ret = this.parseImportance(str);
    if(!ret) obj.importance = null;
    else {
      str = ret[0];
      obj.importance = ret[1];
    }

    var _str = str;

    ret = this.parseDueAt(_str);
    if(!ret) obj.dueAt = null;
    else {
      _str = ret[0];
      obj.dueAt = ret[1];
    }

    ret = this.parseDuration(_str);
    if(!ret) obj.remaining = null;
    else {
      _str = ret[0];
      obj.remaining = ret[1];
    }

    if( !obj.remaining || !obj.dueAt ) {
      _str = str;

      ret = this.parseDuration(_str);
      if(!ret) obj.remaining = null;
      else {
        _str = ret[0];
        obj.remaining = ret[1];
      }

      ret = this.parseDueAt(_str);
      if(!ret) obj.dueAt = null;
      else {
        _str = ret[0];
        obj.dueAt = ret[1];
      }
    }

    str = _str;

    obj.title = str.slimNTidy();

    return obj;
  },

  humanizeDuration: function (milliseconds) {
    var hours     = Date.hours(milliseconds);
    milliseconds -= hours*HOURS;
    var minutes   = Date.minutes(milliseconds);

    var str = '';
    if(hours > 0)                str += hours + ' hours';
    if(hours > 0 && minutes > 0) str += ' & ';
    if(minutes > 0)              str += minutes + ' minutes';
    return str;
  }
};

// [
//   "!!! [8pm] make a pizza for 1 hour",
//   "!!! [Feb 14th 2016] write my term paper for 20 hours and 30 minutes",
//   "!! [2/13/15 10pm] tell julee to do the thing for 5 minutes",
//   "!! [2/14] find a valentine for 2 hours",
//   "! [2/15 9:00am] sink or swim for 30 minutes",
//   "{Friday at 3:45pm} !! study for CS480 test for 3 hours and 30 minutes",
//   "[2/2/15 8pm] study for CS midterm for 5 hours"
// ].forEach(function (str) {
//   var imp      = Natural.parseImportance(str);
//   var dueAt    = Natural.parseDueAt(str);
//   var duration = Natural.parseDuration(str);

//   // console.log(str)
//   // console.log('imp: ', imp);
//   // console.log('dueAt: ', dueAt);
//   // console.log('duration: ', duration.humanize());
// });
