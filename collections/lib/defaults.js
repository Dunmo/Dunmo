
Setters = {};

Setters.setBool = function (prop) {
  return function (bool) {
    if(bool === undefined || bool === null) bool = true;
    var selector = {};
    selector[prop] = bool;
    return this.update(selector);
  };
};

Setters.setProp = function (prop) {
  return function (value) {
    var selector = {};
    selector[prop] = value;
    return this.update(selector);
  };
};

_.each([Calendars, Events, Projects, Subscribers, Tasks, UserSettings, Meteor.users], function (collection) {

  collection.helpers({

    setRemoved: Setters.setBool('isRemoved'),

    remove: function () {
      return this.setRemoved(true);
    },

    update: function (data) {
      if( _.keys(data).every(function(k) { return k.charAt(0) !== '$'; }) ) {
        var self = this;
        lodash.forOwn(data, function(value, key) {
          self[key] = value;
        });
        data = { $set: data };
      }
      return collection.update(this._id, data);
    }

  });

  // includes removed items
  collection.fetchAll = function (selector, options) {
    selector   = selector || {};
    var result = collection.find(selector, options);
    result     = result.fetch();
    return result;
  };

  // does not include removed items
  collection.fetch = function (selector, options) {
    selector   = selector || {};
    selector.isRemoved = { $ne: true };
    var result = collection.find(selector, options);
    result     = result.fetch();
    return result;
  };

  collection.findAllById = function (ids) {
    return collection.find({ _id: { $in: ids } });
  };

  collection.findBy = function (selector) {
    return collection.findOne(selector);
  };

});

// Property setters
// props = props || [];
// props.forEach(function (prop) {
//   var propName, propType;
//   if(typeof prop === 'object') {
//     propName = prop.name;
//     propType = prop.type;
//   } else if (typeof prop === 'string') {
//     propName = prop;
//   } else {
//     console.error('Unexpected type for collection property description')
//   }
//   funcName = 'set' + _.capitalize(propName);
//   if(prop.type === 'boolean') _helpers[funcName] = setBool(propName);
//   else                        _helpers[funcName] = setProp(propName);
// });
