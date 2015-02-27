
  Natural = {
    parseImportance: function(str) {
      var impEnum = {
        "!"   : 1,
        "!!"  : 2,
        "!!!" : 3
      };

      var s = str;
      var matches = s.match(/\w*!+\w*!*/g);
      console.log('matches: ', matches);
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
      console.log('match: ', match);
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
      var match = str.match(/for ([0-9]+) (\w+) (and|&) ([0-9]+) (\w+)|for ([0-9]+) (\w+)/ig);
      if(!match) return null;
      match = match[0];
      console.log('match: ', match);
      match = match.substring(4, match.length);
      return moment.duration(match);
    }
  };

  [
    // "make a pizza before 8pm",
    // "write my term paper due on Tuesday, Feb 14th",
    // "[2/13/15 10pm] tell julee to do the thing",
    // "[2/14] find a valentine",
    "[2/15 9:00am] sink or swim",
    "study for test due at {3:45pm} on friday for 3 hours and 30 minutes",
    "[2/2/15 8pm] study for CS midterm for 5 hours"
  ].forEach(function (str) {
    console.log(str)
    console.log('Natural.parseDueAt(str): ', Natural.parseDueAt(str));
    Natural.parseDuration(str);
  });
