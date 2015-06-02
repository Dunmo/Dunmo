/*
 * Events
 * =========
 * isStatic : Boolean
 * taskId   : String
 *
 */

Events = new Mongo.Collection('events');

Events.helpers({

  setRemoved: collectionsDefault.setRemoved(Events),

  update: collectionsDefault.update(Events)

});

Events.createOrUpdate = function (obj) {
  if(Array.isArray(obj)) {
    var ary = obj;
    ary.forEach(function(event) {
      Events.createOrUpdate(event);
    });
  } else if(typeof(obj) === 'object') {
    obj.googleEventId = obj.googleEventId || obj.id;
    var event = Events.findOne({ googleEventId: obj.googleEventId });
    if(event) {
      Events.update(event._id, obj);
    } else {
      Events.insert(obj);
    }
  } else {
    console.error('type error, Events.createOrUpdate does not expect: ', typeof(obj), obj);
  }
};

Events.taskEvents = {};

Events.taskEvents.find = function (selector, options) {
  selector = selector || {};
  selector.taskId = { $exists: true };
  return Events.find(selector);
};
