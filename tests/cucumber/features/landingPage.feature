Feature: Dunmo Landing Page

  As a New User
  I want to Try Dunmo
  So that I can see if I want to keep using it

  Scenario: Users can try the app by clicking on the Try Dunmo button
    Given I am a new visitor
     When I navigate to the landing page
      And I click on the Try Dunmo button
     Then I am redirected to the Login Page
