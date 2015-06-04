
function setBool (prop) {
  return function (bool) {
    if(bool === undefined || bool === null) bool = true;
    var selector = {};
    selector[prop] = bool;
    return this.update(selector);
  };
};

function setProp (prop) {
  return function (value) {
    var selector = {};
    selector[prop] = value;
    return this.update(selector);
  };
};

collectionsDefault = {

  instanceMethods: function (collection, props) {

    var _helpers = {}

    // Property setters
    props = props || [];
    props.forEach(function (prop) {
      var propName, propType;
      if(typeof prop === 'object') {
        propName = prop.name;
        propType = prop.type;
      } else if (typeof prop === 'string') {
        propName = prop;
      } else {
        console.error('Unexpected type for collection property description')
      }
      funcName = 'set' + propName.capitalize();
      if(prop.type === 'boolean') _helpers[funcName] = setBool(propName);
      else                        _helpers[funcName] = setProp(propName);
    });

    // Default properties

    if(collection != Meteor.users) {
      _.extend(_helpers, {

        setRemoved: setBool('isRemoved')

      });
    }

    // Other default methods

    _.extend(_helpers, {

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
        // console.log('updating: ', this, data.$set);
        return collection.update(this._id, data);
      }

    });

    return _helpers;

  },

  collectionMethods: function (collection) {

    var _methods = {

      // includes removed items
      fetchAll: function (selector, options) {
        selector   = selector || {};
        var result = collection.find(selector, options);
        result     = result.fetch();
        return result;
      },

      // does not include removed items
      fetch: function (selector, options) {
        selector   = selector || {};
        selector.isRemoved = { $ne: true };
        var result = collection.find(selector, options);
        result     = result.fetch();
        return result;
      },

      findAllById: function (ids) {
        return collection.find({ _id: { $in: ids } });
      },

      findBy: function (selector) {
        return collection.findOne(selector);
      }

    };

    return _methods;

  }

};
