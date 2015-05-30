/*
 * Events
 * =========
 * isStatic : Boolean
 *
 */

Events = new Mongo.Collection('events');

Events.helpers({

  update: collectionsDefault.update(Events),

  setRemoved: collectionsDefault.setRemoved(Events)

});
