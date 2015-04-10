
// TODO: prop could also just be a function
lodash.sum = function(collection, prop) {
  if(typeof prop === 'function') {
    return lodash.reduce(collection, function(sum, item) {
      return sum + prop(item);
    });
  }
  else if(prop) {
    return lodash.reduce(collection, function(sum, item) {
      return sum + item.prop;
    });
  }
  else {
    return lodash.reduce(collection, function(sum, item) {
      return sum + item;
    });
  }
};

lodash.avg = function(collection) {
  return lodash.sum(collection) / collection.length;
};
