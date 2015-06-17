/*
 * Project
 * ==========
 * ownerId            : String
 * title              : String
 * dueAt              : DateTime
 * memberIds          : String[]
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

  members: function () {
    return Meteor.users.find({ _id: { $in: this.memberIds } });
  },

  fetchMembers: function () {
    return this.members().fetch();
  },

  addMember: function (user) {
    var userId;
    if(typeof user === 'string') userId = user;
    else                         userId = user._id;
    return this.update({ $addToSet: { memberIds: userId } });
  },

  removeMember: function (user) {
    var userId;
    if(typeof user === 'string') userId = user;
    else                         userId = user._id;
    return this.update({ $pullAll: { memberIds: userId } });
  },

  managers: function () {
    return Meteor.users.find({ _id: { $in: this.managerIds } });
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
    return Meteor.users.findOne(this.ownerId);
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
