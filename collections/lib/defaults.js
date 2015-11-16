
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

_.each([Calendars, Events, Projects, Subscribers, Tasks, TaskComments, Users], function (collection) {

  collection.helpers({

    setIsRemoved: Setters.setBool('isRemoved'),

    setRemoved: function (bool) { return this.setIsRemoved(bool); },

    remove: function () { return this.setIsRemoved(true); },

    toggleRemoved: function (bool) {
      if(bool === undefined) bool = !this.isRemoved;
      return this.setIsRemoved(bool);
    },

    update: function (data) {
      if( _.keys(data).every(function(k) { return k.charAt(0) !== '$'; }) ) {
        var self = this;
        _.forOwn(data, function(value, key) {
          self[key] = value;
        });
        data = { $set: data };
      }
      return collection.update(self._id, data);
    }

  });

  // does not include removed items
  // collection.before.find(function(userId, selector, options) {
  //   if(selector.isRemoved === undefined) selector.isRemoved = false;
  // });

  collection.before.insert(function (userId, doc) {
    if(Array.isArray(doc)) {
      var ary = doc;
      ary.forEach(function (doc) {
        collection.insert(doc);
      });
    }
    doc.isRemoved = doc.isRemoved || false;
  });

  // includes removed items
  collection.findAll = function(selector, options) {
    return collection.direct.find(selector, options);
  };

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
    if(selector.isRemoved === undefined) selector.isRemoved = false;
    var result = collection.find(selector, options);
    result     = result.fetch();
    return result;
  };

  // includes removed items
  collection.findAllById = function (ids) {
    return collection.find({ _id: { $in: ids } });
  };

  // includes removed items
  collection.fetchAllById = function (ids) {
    return collection.findAllById(ids).fetch();
  };

  // does not include removed items
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
