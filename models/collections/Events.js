/*
 * Events
 * =========
 * isStatic         : Boolean
 * taskId           : String
 * googleEventId    : String
 * start            : Date
 * end              : Date
 * googleCalendarId : String
 *
 */

Events.helpers({

  task: function () {
    return Tasks.findOne(this.taskId);
  },

  isTaskEvent: function () {
    return !!this.taskId;
  },

  duration: function () {
    return this.end - this.start;
  },

  durationWithinRange: function (start, end) {
    return Date.durationWithinRange([this.start, this.end], [start, end]);
  }

});

Events.createOrUpdate = function (obj) {
  if(Array.isArray(obj)) {
    var ary = obj;
    return ary.map(function(event) {
      return Events.createOrUpdate(event);
    });
  } else if(typeof(obj) === 'object') {
    obj = _.cloneDeep(obj);
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
      Events.update(event._id, { $set: obj });
      return event._id;
    } else {
      return Events.insert(obj);
    }
  } else {
    console.error('type error, Events.createOrUpdate does not expect: ', typeof(obj), obj);
  }
};

// Client Only; Requires google api
Events.syncTaskEventsWithGoogle = function (options, callback) {
  Events.syncAllTaskEventsInRange(options, function () {
    var selector = selector || {};
    selector.taskId = { $exists: true };
    selector.start  = { $gt: options.start };
    selector.end    = { $lt: options.end };
    var events = Events.fetch(selector, options);
    Events.queuedEvents = events.length;
    events.forEach(function (event) {
      gapi.getEvent(event, function (googleEvent) {
        var ret = Events.createOrUpdate(googleEvent);
        Events.queuedEvents--;
        if(Events.queuedEvents == 0) callback();
      });
    });
  });
};

Events.findTaskEvents = function (selector, options) {
  selector = selector || {};
  selector.taskId = { $exists: true };
  return Events.find(selector);
};

// options: { start, end }
Events.fetchTaskEvents = function (options, callback) {
  var selector = selector || {};
  selector.taskId = { $exists: true };
  selector.start  = { $gt: options.start };
  selector.end    = { $lt: options.end };
  Events.syncTaskEventsWithGoogle(options, function () {
    var ret = Events.fetch(selector);
    callback(ret);
  });
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
    end: { $lt: new Date() }
  });
  return Events.fetch(selector, options);
};

Events.getTasks = function (events) {
  var taskIds = events.map(function (e) { return e.taskId; });
  var taskIds = _.uniq(taskIds);
  var tasks   = Tasks.fetchAllById(taskIds);
  return tasks;
};
