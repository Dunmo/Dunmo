
Daylists     = {};
Freetimes    = {};
Tags         = {};

Calendars    = new Mongo.Collection('calendars');
Events       = new Mongo.Collection('events');
Projects     = new Mongo.Collection('projects');
Tasks        = new Mongo.Collection('tasks');
TaskComments = new Mongo.Collection('taskComments');
Users        = Meteor.users;
