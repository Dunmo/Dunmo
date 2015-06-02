/*
 * Events
 * =========
 * isStatic : Boolean
 * taskId   : String
 *
 */

Events = new Mongo.Collection('events');

Events.helpers({

  setRemoved: collectionsDefault.setRemoved(),

  update: collectionsDefault.update(Events)

});

Events.createOrUpdate = function (obj) {
  if(Array.isArray(obj)) {
    var ary = obj;
    return ary.map(function(event) {
      return Events.createOrUpdate(event);
    });
  } else if(typeof(obj) === 'object') {
    obj.googleEventId = obj.googleEventId || obj.id;
    var event = Events.findOne({ googleEventId: obj.googleEventId });
    if(event) {
      return Events.update(event._id, obj);
    } else {
      return Events.insert(obj);
    }
  } else {
    console.error('type error, Events.createOrUpdate does not expect: ', typeof(obj), obj);
  }
};

Events.fetch = collectionsDefault.fetch(Events);

Events.fetchActive = collectionsDefault.fetchActive(Events);

Events.taskEvents = {};

Events.taskEvents.find = function (selector, options) {
  selector = selector || {};
  selector.taskId = { $exists: true };
  return Events.find(selector);
};
