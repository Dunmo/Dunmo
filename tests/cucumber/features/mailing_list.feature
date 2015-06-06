Feature: Mailing List Signup

  As a Visitor
  I want to be able to sign up for the mailing list
  So that I can receive updates about Dunmo

  # The background will be run for every scenario
  Background:
    Given I am a new visitor

  @dev
  Scenario: Signup for the mailing list
    When I navigate to "/"
     And I type "test@example.com" into the email input
     And I click the ".mailing-list .btn-submit" button
    Then the email "test@example.com" should be added to the database
     And I should see a confirmation message
