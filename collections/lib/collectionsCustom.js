collectionsDefault = {

  // Instance Methods

  setRemoved: function (callback) {
    return function (bool) {
      if(bool === undefined || bool === null) bool = true
      this.update({ isRemoved: bool });
      if(callback) callback(bool);
    }
  },

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

  // Collection Methods

  fetch: function (collection) {
    return function (selector, options) {
      selector   = selector || {};
      var result = collection.find(selector, options);
      result     = result.fetch();
      return result;
    };
  },

  fetchActive: function (collection) {
    return function (selector, options) {
      selector   = selector || {};
      selector.isRemoved = { $ne: true };
      var result = collection.find(selector, options);
      result     = result.fetch();
      return result;
    };
  },

  findAllById: function (collection) {
    return function (ids) {
      collection.find({ _id: { $in: ids } });
    };
  },

  findBy: function (collection) {
    return function (selector) {
      return collection.findOne(selector);
    };
  }

};
