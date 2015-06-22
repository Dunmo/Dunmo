
Daylists     = {};
Freetimes    = {};
Tags         = {};

Calendars    = new Mongo.Collection('calendars');
Events       = new Mongo.Collection('events');
Projects     = new Mongo.Collection('projects');
Subscribers  = new Mongo.Collection('subscribers');
Tasks        = new Mongo.Collection('tasks');
TaskComments = new Mongo.Collection('taskComments');
UserSettings = new Mongo.Collection('userSettings');
Users        = Meteor.users;
