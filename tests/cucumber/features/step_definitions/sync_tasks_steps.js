(function () {

  'use strict';

  module.exports = function () {

    // You can use normal require here, cucumber is NOT run in a Meteor context (by design)
    // var url    = require('url');
    var _      = require('lodash');
    var assert = require('chai').assert;

    // Shared: I am a logged in user

    this.When(/^I add a new task "([^"]*)"$/, function (taskString, callback) {
      // Write code here that turns the phrase above into concrete actions
      // Tasks.create(taskString);
      callback.pending();
    });

    this.When(/^I add a new event "([^"]*)"$/, function (eventString, callback) {
      // Write code here that turns the phrase above into concrete actions
      // Events.create(eventString);
      callback.pending();
    });

    // Shared: I click the "" button

    this.Then(/^the calendar should have the correct agenda$/, function (callback) {
      // Write code here that turns the phrase above into concrete actions
      callback.pending();
    });

  };

});
