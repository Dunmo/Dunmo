
Schemas.TaskComment = new SimpleSchema([Schemas.Default, {
  ownerId:     { type: String },
  taskId:      { type: String },
  mentionsIds: { type: [String], defaultValue: [] },
  text:        { type: String },
  timestamp:   { type: Date   },
}]);

var props = [
  'text',
  'timestamp',
  'mentionsIds'
];

var setters = {};

props.forEach(function (prop) {
  var setterName      = 'set' + prop.capitalize();
  setters[setterName] = Setters.setProp(prop);
});

Projects.helpers(setters);

Projects.helpers({

  owner: function () {
    return Users.findOne(this.ownerId);
  },

  task: function () {
    return Tasks.findOne(this.taskId);
  },

  mentioned: function () {
    return Users.find({ _id: { $in: this.mentionedIds } });
  },

  fetchMentioned: function () {
    return this.mentioned().fetch();
  },

  timeAgoString: function () {
    return moment(this.timestamp).fromNow();
  }

});
