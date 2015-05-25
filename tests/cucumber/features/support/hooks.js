module.exports = function () {

  var helper = this;

  this.Before(function () {
    var world = helper.world;
    var callback = lodash.last(arguments);
    world.browser.
      init().
      call(callback);
  });

  this.After(function () {
    var world = helper.world;
    var callback = lodash.last(arguments);
    world.browser.
      end().
      call(callback);
  });
};
