Feature: Sync Tasks

  As an existing user
  I want to be able to manually resync my tasks with my calendar
  So that I can have an updated agenda when my events change

  # The background will be run for every scenario
  Background:
    Given I am a logged in user

  @dev
  Scenario: Add a task, add an event, and resync
    When I navigate to "/taskView"
     And I add a new task "test task for 2 hours due tomorrow somewhat important"
     And I add a new event "test event for 1 hour starting in 1 hour"
     And I add click the ".sync" button
    Then the calendar should have the correct agenda
