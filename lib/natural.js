
Natural = {
  parseImportance: function(str) {
    var impEnum = {
      "!"   : 1,
      "!!"  : 2,
      "!!!" : 3
    };

    var matches = str.match(/\w*!+\w*!*/g);
    if(matches) {
      var ret = 0, val;
      matches.forEach(function(match) {
        if(match.match(/^(!!!|!!|!)$/)) {
          str = str.replace(match);
          val = impEnum[match];
          if(val > ret) ret = val;
        }
        if(match.match(/ (!!!|!!|!) /)) {
          val = impEnum[match];
          if(val > ret) ret = val;
        }
      });
      if(ret) {
        // console.log("match: ", match);
        // str = str.replace(match, '');
        return [str,ret];
      }

      ret = 0;
      var bangset = matches.map(function(match) {
        match = match.match(/(!!!|!!|!)/);
        match = match[0];
        val = impEnum[match];
        if(val > ret) ret = val;
      });
      if(ret) {
        // console.log("match: ", match);
        str = str.replace(match, '');
        return [str,ret];
      }
      else {
        // console.log("match: ", match);
        str = str.replace(match, '');
        return [str,null];
      }
    }
    else {
      match = str.match(/(not|hardly|barely|a bit|a little)+ important | (unimportant)/);
      if(match) {
        // console.log("match: ", match);
        str = str.replace(match[0], '');
        return [str,1];
      }
      match = str.match(/(somewhat|sort of|kind of|not very|not really)* important/);
      if(match) {
        // console.log("match: ", match);
        str = str.replace(match[0], '');
        return [str,2];
      }
      match = str.match(/(?:very|really|extremely|super|mega)+ important/);
      if(match) {
        // console.log("match: ", match);
        str = str.replace(match[0], '');
        return [str,3];
      }
    }
  },

  parseDueAt: function(str) {
    var arr = str.split(" ");
    var temp, date, first, second, ret, arrcp;

    // Check as is
    date = Date.create( str );

    if ( date.isValid() ) return [temp,date];

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
          return [ret, date];
        }
      };
    };
  },

  parseDuration: function(str) {
    var match = str.match(/for ([0-9]+) (\w+) (?:and|&) ([0-9]+) (\w+)|for ([0-9]+) (\w+)/);
    if(!match) {
      match = str.match(/\[.*\]|\(.*\)|\{.*\}/);
      if (!match) {
        return [str,null];
      };
    };

    console.log("match: ", match);
    str = str.replace(match, '');

    var i = 1;
    while(!match[i]) i++;
    var num = match[i++];
    var unit = match[i++];
    var dur = moment.duration(Number(num), unit);
    while(i < match.length && !match[i]) i++;
    if(i == match.length) return dur;

    var num2 = match[i++];
    var unit2 = match[i++];
    var dur2 = moment.duration(Number(num2), unit2);
    dur = dur.add(dur2);
    return [str,dur];
  },

  parseTitle: function (str) {
    var imp = this.parseImportance(str);
    var due = this.parseDueAt(str);
    var duration = this.parseDuration(str);
    str.replace(imp, '');
    str.replace(due, '');
    str.replace(duration, '');
    return str;
  },

  parseTask: function (str) {
    var ret = this.parseImportance(str);
    var imp = ret[1];
    str = ret[0];
    console.log("str: ", str);

    ret = this.parseDueAt(str);
    var due = ret[1];
    str = ret[0];

    ret = this.parseDuration(str);
    var duration = ret[1];
    str = ret[0];

    // ret = this.parseTitle(str);
    // str = ret[1];
    // var title = str;  // ret[1];
    // str = ret[0];
    console.log("title: ", str);
    console.log("imp: ", imp);
    console.log("due: ", due);
    console.log("duration: ", duration);
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
