var originalMeteorCollection = Meteor.Collection;

Meteor.Collection = function () {
  var collectionHooks = {
    before: {
      insert: [],
      update: [],
      remove: []
    },
    after: {
      insert: [],
      update: [],
      remove: []
    }
  };

  this.before = {
    insert: function (hook) {
      collectionHooks.before.insert.push(hook);
    },
    update: function (hook) {
      collectionHooks.before.update.push(hook);
    },
    remove: function (hook) {
      collectionHooks.before.remove.push(hook);
    }
  };

  this.after = {
    insert: function (hook) {
      collectionHooks.after.insert.push(hook);
    },
    update: function (hook) {
      collectionHooks.after.update.push(hook);
    },
    remove: function (hook) {
      collectionHooks.after.remove.push(hook);
    }
  };

  this.before.insert.run = generateHookRunner(this, collectionHooks.before.insert);
  this.before.update.run = generateHookRunner(this, collectionHooks.before.update);
  this.before.remove.run = generateHookRunner(this, collectionHooks.before.remove);

  this.after.insert.run = generateHookRunner(this, collectionHooks.after.insert);
  this.after.update.run = generateHookRunner(this, collectionHooks.after.update);
  this.after.remove.run = generateHookRunner(this, collectionHooks.after.remove);

  originalMeteorCollection.apply(this, arguments);
};

Meteor.Collection.prototype = originalMeteorCollection.prototype;
// Remove this from the prototype (coming from meteor-stubs)
delete Meteor.Collection.after;
delete Meteor.Collection.before;
Mongo.Collection = Meteor.Collection;


function getCollectionHookContext(collection) {
  return {
    transform: function (document) {
      collection._transform(document);
    }
  };
}

function generateHookRunner(collection, hooks) {
  return function (userId, document) {
    hooks.forEach(function (hook) {
      hook.call(getCollectionHookContext(collection), userId, document);
    })
  };
}
