
underscore = _;
_ = lodash;

// TODO: prop could also just be a function
_.sum = function(collection, prop) {
  if(typeof prop === 'function') {
    return _.reduce(collection, function(sum, item) {
      return sum + prop(item);
    });
  }
  else if(prop) {
    return _.reduce(collection, function(sum, item) {
      return sum + item.prop;
    });
  }
  else {
    return _.reduce(collection, function(sum, item) {
      return sum + item;
    });
  }
};

_.avg = function(collection) {
  return _.sum(collection) / collection.length;
};
