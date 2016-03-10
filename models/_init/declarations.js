
Schemas      = {};

Daylists     = {};
Freetimes    = {};
Tags         = {};

Collections  = {
  Calendars    : new Mongo.Collection('calendars'),
  Events       : new Mongo.Collection('events'),
  Projects     : new Mongo.Collection('projects'),
  Tasks        : new Mongo.Collection('tasks'),
  TaskComments : new Mongo.Collection('taskComments'),
  Users        : Meteor.users,
};

Calendars    = Collections.Calendars;
Events       = Collections.Events;
Projects     = Collections.Projects;
Tasks        = Collections.Tasks;
TaskComments = Collections.TaskComments;
Users        = Collections.Users;
