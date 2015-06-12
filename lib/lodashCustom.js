
underscore = _;
_ = lodash;

_.avg = function(collection) {
  return _.sum(collection) / collection.length;
};

// limits a value within a lower and upper bound (inclusive)
_.bound = function(arg1, arg2, arg3) {
  var max, min, value;

  if(arg3 === undefined || arg3 === undefined) {
    min = arg1;
    max = arg2;

    return function(val) {
      if(val < min)      return min;
      else if(val > max) return max;
      else               return val;
    };
  } else {
    value = arg1;
    min   = arg2;
    max   = arg3;
    return _.bound(min, max)(value);
  }

};

var _min = _.min;
_.min = function (arg1) {
  if(arguments.length === 1) return _min(arg1);
  else {
    return _min(arguments);
  }
};
