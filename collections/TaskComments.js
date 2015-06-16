/*
 * TaskComment
 * ==========
 * ownerId     : String
 * taskId      : String
 * text        : String
 * timestamp   : DateTime
 * mentionsIds : String[]
 *
 */

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
    return Meteor.users.findOne(this.ownerId);
  },

  task: function () {
    return Tasks.findOne(this.taskId);
  },

  mentioned: function () {
    return Meteor.users.find({ _id: { $in: this.mentionedIds } });
  },

  fetchMentioned: function () {
    return this.mentioned().fetch();
  },

  timeAgoString: function () {
    return moment(this.timestamp).fromNow();
  }

});
