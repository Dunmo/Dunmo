/*
 * Events
 * =========
 * isStatic : Boolean
 * taskId   : String
 *
 */

Events = new Mongo.Collection('events');

Events.helpers({

  setRemoved: collectionsDefault.setRemoved(Events),

  update: collectionsDefault.update(Events)

});

Events.taskEvents = {};

Events.taskEvents.find = function (selector, options) {
  selector = selector || {};
  selector.taskId = { $exists: true };
  return Events.find(selector);
};
