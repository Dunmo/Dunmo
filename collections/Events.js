/*
 * Events
 * =========
 * isStatic         : Boolean
 * taskId           : String
 * googleEventId    : String
 * start            : Date
 * end              : Date
 * googleCalendarId : String
 */

Events = new Mongo.Collection('events');

Events.helpers({

  setRemoved: collectionsDefault.setRemoved(),

  update: collectionsDefault.update(Events),

  task: function () {
    return Tasks.findOne(this.taskId);;
  }

});

Events.createOrUpdate = function (obj) {
  if(Array.isArray(obj)) {
    var ary = obj;
    return ary.map(function(event) {
      return Events.createOrUpdate(event);
    });
  } else if(typeof(obj) === 'object') {
    obj.googleEventId = obj.googleEventId || obj.id;
    obj.isRemoved     = obj.isRemoved     || obj.status === 'cancelled'
    obj.start         = new Date(obj.start.dateTime);
    obj.end           = new Date(obj.end.dateTime);
    obj.created       = new Date(obj.created);
    obj.updated       = new Date(obj.updated);
    obj.isTransparent = obj.isTransparent || obj.transparency === 'transparent';
    obj.title         = obj.title         || obj.summary;
    var event = Events.findOne({ googleEventId: obj.googleEventId });
    if(event) {
      return Events.update(event._id, { $set: obj });
    } else {
      return Events.insert(obj);
    }
  } else {
    console.error('type error, Events.createOrUpdate does not expect: ', typeof(obj), obj);
  }
};

Events.fetch = collectionsDefault.fetch(Events);

Events.fetchActive = collectionsDefault.fetchActive(Events);

// Client Only; Requires google api
Events.syncWithGoogle = function (selector, options) {
  var events = Events.fetch(selector, options);
  events.forEach(function (event) {
    gapi.getEvent(event, function (googleEvent) {
      Events.createOrUpdate(googleEvent);
    });
  });
};

// Client Only; Requires google api
Events.syncActiveWithGoogle = function (selector, options) {
  selector = selector || {};
  selector.isRemoved = { $ne: true };
  Events.syncWithGoogle(selector, options);
};

Events.taskEvents = {};

Events.taskEvents.find = function (selector, options) {
  selector = selector || {};
  selector.taskId = { $exists: true };
  return Events.find(selector);
};

Events.taskEvents.recent = function (selector, options) {
  selector = selector || {};
  _.extend(selector, {
    taskId: { $exists: true },
    needsReviewed: true,
    end: { $lt: new Date() }
  });
  return Events.fetchActive(selector, options);
};

Events.getTasks = function (events) {
  var taskIds = events.map(function (e) { return e.taskId; });
  var taskIds = _.uniq(taskIds);
  var tasks   = Tasks.findAllById(taskIds);
  return tasks;
};
