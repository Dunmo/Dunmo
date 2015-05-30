(function () {

  'use strict';

  module.exports = function () {

    // You can use normal require here, cucumber is NOT run in a Meteor context (by design)
    var url = require('url');
    // var _   = require('lodash');

    this.Given(/^I am a new visitor$/, function () {
      // no callbacks! DDP has been promisified so you can just return it
      return this.server.call('reset'); // this.ddp is a connection to the mirror
    });

    this.Given(/^I am a logged in user$/, function (callback) {
      // Write code here that turns the phrase above into concrete actions
      callback.pending();
    });

    this.When(/^I click the "([^"]*)" button$/, function (buttonSelector, callback) {
      console.log('buttonSelector: ', buttonSelector);
      this.client.waitForVisible(buttonSelector).
        click(buttonSelector).
        call(callback);
    });

    this.When(/^I navigate to "([^"]*)"$/, function (relativePath, callback) {
      // WebdriverIO supports Promises/A+ out the box, so you can return that too
      this.client. // this.browser is a pre-configured WebdriverIO + PhantomJS instance
        url(url.resolve(process.env.ROOT_URL, relativePath)). // process.env.ROOT_URL always points to the mirror
        waitForVisible('body *').
        call(callback);
    });

  };

})();
