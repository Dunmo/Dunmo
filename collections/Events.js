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

Events.helpers({

  task: function () {
    return Tasks.findOne(this.taskId);
  }

});

Events.createOrUpdate = function (obj) {
  if(Array.isArray(obj)) {
    var ary = obj;
    return ary.map(function(event) {
      return Events.createOrUpdate(event);
    });
  } else if(typeof(obj) === 'object') {
    obj = R.cloneDeep(obj);
    obj.googleEventId = obj.googleEventId || obj.id;
    obj.isRemoved     = obj.isRemoved     || obj.status === 'cancelled';
    ['start', 'end', 'created', 'updated'].forEach(function (prop) {
      obj[prop] = Number(new Date(obj[prop]));
    });
    obj.isTransparent = obj.isTransparent || obj.transparency === 'transparent';
    obj.title         = obj.title         || obj.summary;
    if(Meteor.userId) obj.ownerId = obj.ownerId || Meteor.userId();
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

Events.findTaskEvents = function (selector, options) {
  selector = selector || {};
  selector.taskId = { $exists: true };
  return Events.find(selector);
};

Events.fetchTaskEvents = function (selector, options) {
  selector = selector || {};
  var ret  = Events.find(selector);
  ret      = ret.fetch();
  return ret;
};

// options:
//   start: Date
//   end:   Date
Events.syncAllTaskEventsInRange = function (options, callback) {
  gapi.getEvents(options, function (events) {
    var ret = Events.createOrUpdate(events);
    callback(ret);
  });
};

Events.syncYesterdaysTaskEvents = function (callback) {
  var start = Number(Date.startOfYesterday());
  var end   = Number(Date.endOfYesterday());
  Events.syncAllTaskEventsInRange({ start: start, end: end }, callback);
};

Events.fetchYesterdaysTaskEvents = function (selector, options, callback) {
  if(typeof selector === 'function') {
    callback = selector;
    selector = undefined;
  }
  var start = Number(Date.startOfYesterday());
  var end   = Number(Date.endOfYesterday());
  Events.syncYesterdaysTaskEvents(function () {
    selector = selector || {};
    _.extend(selector, {
      start: { $gt: start },
      end:   { $lt: end   }
    });
    var ret = Events.fetchTaskEvents(selector, options);
    callback(ret);
  });
};

Events.setTaskEventsNeedsReviewed = function () {
  Events.fetchYesterdaysTaskEvents(function (events) {
    var tasks = Events.getTasks(events);
    if(tasks) {
      return tasks.map(function (task) {
        return task.setNeedsReviewed();
      });
    }
  });
};

Events.recentTaskEvents = function (selector, options) {
  selector = selector || {};
  _.extend(selector, {
    taskId: { $exists: true },
    needsReviewed: true,
    end: { $lt: new Date() }
  });
  return Events.fetch(selector, options);
};

Events.getTasks = function (events) {
  var taskIds = events.map(function (e) { return e.taskId; });
  var taskIds = _.uniq(taskIds);
  var tasks   = Tasks.findAllById(taskIds).fetch();
  return tasks;
};
