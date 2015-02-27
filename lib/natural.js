
Natural = {
  parseImportance: function(str) {
    var impEnum = {
      "!"   : 1,
      "!!"  : 2,
      "!!!" : 3
    };

    var s = str;
    var matches = s.match(/\w*!+\w*!*/g);
    if(!matches) return null;

    var ret = 0, val;
    matches.forEach(function(match) {
      if(match.match(/^(!!!|!!|!)$/)) {
        val = impEnum[match];
        if(val > ret) ret = val;
      }
    });
    if(ret) return ret;

    ret = 0;
    var bangset = matches.map(function(match) {
      match = match.match(/(!!!|!!|!)/);
      match = match[0];
      val = impEnum[match];
      if(val > ret) ret = val;
    });
    if(ret) return ret;
    else return null;
  },

  parseDueAt: function(str) {

    var match = str.match(/\[.*\]|\(.*\)|\{.*\}/);
    match = match[0]
    match = match.substring(1, match.length-1);
    return Date.create(match);

    // var match = true;
    // var i=0;
    // while(match) {
    //   match = s.match(/\sdue(?=\s)|\son(?=\s)|\sat(?=\s)|\sbefore(?=\s)/);
    //   console.log('match: ', match);
    //   if(match) {
    //     matches.push(match);
    //     var len = match[0].length;
    //     s = s.substring(match['index'] + len);
    //   }
    //   i++;
    //   if(i > 5) break;
    // }
    // if(matches) matches = matches.map(function(match) {
    //   var str = match[0];
    //   match[0] = str.trim();
    //   return match;
    // });
    // console.log('matches: ', matches);
    // if(!matches) return null;

    // var dates = [];
    // for (var i = 0; i < str.length; i++) {
    //   for (var j = 0; j <= str.length; j++) {
    //     var substr = str.substring(i, j);
    //     var date = Date.create(substr);
    //     if(date.isValid()) dates.push(substr + ' : ' + date);
    //   };
    // };
    // console.log('dates: ', dates);
  },

  parseDuration: function(str) {
    var match = str.match(/for ([0-9]+) (\w+) (?:and|&) ([0-9]+) (\w+)|for ([0-9]+) (\w+)/i);
    if(!match) return null;

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
    return dur;
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
