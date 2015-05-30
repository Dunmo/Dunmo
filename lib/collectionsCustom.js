collectionsDefault = {

  update: function (collection) {
    return function (data) {
      if( _.keys(data).every(function(k) { return k.charAt(0) !== '$'; }) ) {
        var self = this;
        lodash.forOwn(data, function(value, key) {
          self[key] = value;
        });
        data = { $set: data };
      }
      return collection.update(this._id, data);
    };
  },

  fetch: function (collection) {
    return function (selector, options) {
      selector   = selector || {};
      var result = collection.find(selector, options);
      result     = result.fetch();
      return result;
    };
  },

  findBy: function (collection) {
    return function (selector) {
      return collection.findOne(selector);
    };
  }

};
