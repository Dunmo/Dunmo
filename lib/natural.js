
Natural = {
  impEnum : {
    "!"   : 1,
    "!!"  : 2,
    "!!!" : 3
  },

  parseImportance: function(str) {
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
      str = str.trim();

      if(ret) {
        return [str, ret];
      }
    }
    else {
      match = str.match(/(((not|hardly|barely|a bit|a little)( ))+important)|unimportant/);
      if(match) {
        str = str.replace(match[0], '');
        return [str.trim(), 1];
      }
      match = str.match(/((very|really|extremely|super|mega)( ))+important/);
      if(match) {
        str = str.replace(match[0], '');
        return [str.trim(), 3];
      }
      match = str.match(/((somewhat|sort of|kind of|not very|not really)( ))*important/);
      if(match) {
        console.log('match: ', match);
        str = str.replace(match[0], '');
        return [str.trim(), 2];
      }
      return [str.trim(), 1];
    }

    return [str.trim(), 2]
  },

  parseDueAt: function(str) {

    // Check any text in brackets
    var match = str.match(/\[.*\]|\(.*\)|\{.*\}/);
    if(match) {
      match = match[0];
      var _match = match.substring(1, match.length-1);
      var date = Date.create( _match );
      if ( date.isValid() ) return [str.replace(match, '').trim(), date];
    }

    // Check the rest of the text if there are no brackets

    var arr = str.split(" ");
    var temp, first, second, ret, arrcp;

    // Check as is
    date = Date.create( str );
    if ( date.isValid() ) return [str.trim(), date];

    // Try all permutations
    for (var i = arr.length; i > 0; i--) {
      for (var j = 0; j < i; j++) {
        arrcp = arr.slice(j, i);

        // Check
        temp = arrcp.join(" ");
        date = Date.create( temp );

        if ( date.isValid() ) {
          first = arr.slice(0, j);
          second = arr.slice(i, arr.length);
          ret = first.concat(second).join(" ");
          ret = ret.replace(/due at | due at|due by | due by|due on | due on|due | due/g, '');
          return [ret.trim(), date];
        }
      };
    };
  },

  parseDuration: function(str) {
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
        return [str.trim(), null];
      }
      else {
        match = match[0];
        str   = str.replace(match, '');
        match = match.substring(1, match.length-1);
        match = match.split(' ');
      }
    }

    console.log('match: ', match);

    var num  = match[0];
    var unit = match[1];
    var dur  = moment.duration(Number(num), unit);

    if(match.length > 2) {
      var num2  = match[3];
      var unit2 = match[4];
      var dur2  = moment.duration(Number(num2), unit2);
      dur = dur.add(dur2);
    }

    return [str.trim(), dur];
  },

  // Used when only the title is needed
  parseTitle: function (str) {
    var ret;

    ret = this.parseImportance(str);
    str = ret[0];

    ret = this.parseDueAt(str);
    str = ret[0];

    ret = this.parseDuration(str);
    str = ret[0];

    return str;
  },

  // Used when all attributes are needed
  parseTask: function (str) {
    var obj = {};


    var ret = this.parseImportance(str);
    str = ret[0];
    obj.importance = ret[1];

    var _str = str;

    ret = this.parseDueAt(_str);
    _str = ret[0];
    obj.dueAt = ret[1];

    ret = this.parseDuration(_str);
    _str = ret[0];
    obj.remaining = ret[1];

    if( !obj.remaining || !obj.dueAt ) {
      _str = str;

      ret = this.parseDuration(_str);
      _str = ret[0];
      obj.remaining = ret[1];

      ret = this.parseDueAt(_str);
      _str = ret[0];
      obj.dueAt = ret[1];
    }

    str = _str;

    obj.title = str.trim();

    return obj;
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

//   console.log(str)
//   console.log('imp: ', imp);
//   console.log('dueAt: ', dueAt);
//   console.log('duration: ', duration.humanize());
// });
