/*
 * Events
 * =========
 * isStatic : Boolean
 *
 */

Events = new Mongo.Collection('events');

Events.helpers({

  setRemoved: collectionsDefault.setRemoved(Events),

  update: collectionsDefault.update(Events)

});
