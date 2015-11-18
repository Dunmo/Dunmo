/*
 * Project
 * ==========
 * ownerId            : String
 * title              : String
 * dueAt              : DateTime
 * readerIds          : String[]
 * writerIds          : String[]
 * managerIds         : String[]
 */

var props = [
  'title',
  'dueAt'
];

var setters = {};

props.forEach(function (prop) {
  var setterName      = 'set' + prop.capitalize();
  setters[setterName] = Setters.setProp(prop);
});

Projects.helpers(setters);

Projects.helpers({

  members: function (selector, options) {
    selector = selector || {};
    var memberIds = _.union(this.readerIds, this.writerIds, this.managerIds);
    selector._id = selector._id || { $in: memberIds };
    return Users.find(selector, options);
  },

  fetchMembers: function (selector, options) {
    return this.members(selector, options).fetch();
  },

  addMember: function (user, type) {
    var userId;
    if(typeof user === 'string') userId = user;
    else                         userId = user._id;
    switch (type) {
      case 'reader':
      case 'read':
        return this.addReader(userId);
      case 'writer':
      case 'write':
        return this.addWriter(userId);
      case 'manager':
      case 'manage':
        return this.addManager(userId);
    }
  },

  removeMember: function (user) {
    var userId;
    if(typeof user === 'string') userId = user;
    else                         userId = user._id;
    return this.update({ $pullAll: { readerIds: userId, writerIds: userId, managerIds: userId } });
  },

  readers: function (selector, options) {
    selector = selector || {};
    selector._id = selector._id || { $in: this.readerIds };
    return this.members()
  },

  fetchReaders: function (selector, options) {
    return this.readers(selector, options).fetch();
  },

  addReader: function (user) {
    var userId;
    if(typeof user === 'string') userId = user;
    else                         userId = user._id;
    return this.update({ $addToSet: { readerIds: userId } });
  },

  removeReader: function (user) {
    var userId;
    if(typeof user === 'string') userId = user;
    else                         userId = user._id;
    return this.update({ $pullAll: { readerIds: userId } });
  },

  writers: function (selector, options) {
    selector = selector || {};
    selector._id = selector._id || { $in: this.writerIds };
    return this.members()
  },

  fetchWriters: function (selector, options) {
    return this.writers(selector, options).fetch();
  },

  addWriter: function (user) {
    var userId;
    if(typeof user === 'string') userId = user;
    else                         userId = user._id;
    return this.update({ $addToSet: { writerIds: userId } });
  },

  removeWriter: function (user) {
    var userId;
    if(typeof user === 'string') userId = user;
    else                         userId = user._id;
    return this.update({ $pullAll: { writerIds: userId } });
  },

  managers: function () {
    return Users.find({ _id: { $in: this.managerIds } });
  },

  fetchManagers: function () {
    return this.managers().fetch();
  },

  addManager: function (user) {
    var userId;
    if(typeof user === 'string') userId = user;
    else                         userId = user._id;
    return this.update({ $addToSet: { managerIds: userId } });
  },

  removeManager: function (user) {
    var userId;
    if(typeof user === 'string') userId = user;
    else                         userId = user._id;
    return this.update({ $pullAll: { managerIds: userId } });
  },

  tasks: function (selector, options) {
    selector           = selector || {};
    selector.projectId = this._id;
    return Tasks.find(selector, options);
  },

  fetchTasks: function () {
    return this.tasks().fetch();
  },

  owner: function () {
    return Users.findOne(this.ownerId);
  },

  remaining: function () {
    var tasks = this.fetchTasks();
    return _.sum(tasks.map(function (t) { return t.remaining; }));
  },

  spent: function () {
    var tasks = this.fetchTasks();
    return _.sum(tasks.map(function (t) { return t.spent; }));
  },

  total: function () {
    return this.remaining() + this.spent();
  },

  inProgressTasks: function (selector, options) {
    selector        = selector        || {};
    selector.spent  = selector.spent  || { $gt: 0 };
    selector.isDone = selector.isDone || { $ne: true };
    return this.tasks(selector, options);
  },

  doneTasks: function (selector, options) {
    selector        = selector        || {};
    selector.isDone = selector.isDone || true;
    return this.tasks(selector, options);
  },

  todos: function (selector, options) {
    selector        = selector        || {};
    selector.spent  = selector.spent  || 0;
    selector.isDone = selector.isDone || { $ne: true };
  }

  // dueAtString
  // needs to handle relative dates

});

// input: project hash or array of project hashes
Projects.create = function (arg) {
  if(Array.isArray(arg)) {
    return arg.map(function(project) {
      return Projects.create(project);
    });
  }

  var project = _.cloneDeep(arg);

  project.ownerId       = project.ownerId       || null; // Meteor.userId();
  project.isRemoved     = project.isRemoved     || false;
  project.lastUpdatedAt = project.lastUpdatedAt || Date.now();

  if(!project.title) return { err: 'Title not found.' };

  return Projects.insert(project);
};
