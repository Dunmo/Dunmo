(function () {

  'use strict';

  module.exports = function () {

    // You can use normal require here, cucumber is NOT run in a Meteor context (by design)
    var _      = require('lodash');
    var assert = require('chai').assert;

    this.When(/^I type "([^"]*)" into the email input$/, function (email, callback) {
      var emailInputSelector = '.mailing-list .email';
      this.client.waitForVisible(emailInputSelector).
        setValue(emailInputSelector, email).
        getValue(emailInputSelector).should.become(email).
        and.notify(callback);
    });

    this.Then(/^the email "([^"]*)" should be added to the database$/, function (email, callback) {
      // callback.pending();
      this.client.executeAsync(function(done) {
        $.get('/api/emails')
         .error(function(err, msg, xhr) {
            if(err) { console.error(err); return; }
          })
         .success(function(res, msg, xhr) {
            done(res);
          });
      }, function(err, res) {
        if(err) { console.error(err); return; }
        var mailingList     = res.value;
        mailingList         = JSON.parse(mailingList);
        var emails          = _.pluck(mailingList, 'email');
        var isInMailingList = _.include(emails, email);
        assert.isTrue(isInMailingList);
        callback();
      });
    });

    this.Then(/^I should see a confirmation message$/, function (callback) {
      // Write code here that turns the phrase above into concrete actions
      // callback.pending();
      var emailInputSelector = '.mailing-list .email';
      this.client.waitForVisible(emailInputSelector)
          .getAttribute(emailInputSelector, 'placeholder').should.become('Success!');
    });

  };

})();
