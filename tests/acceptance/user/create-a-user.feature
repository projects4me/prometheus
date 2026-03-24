@setupApplicationTest
Feature: User | create a user

  Scenario: Create a user

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    When User navigates to app/user/create
    And User enters following details for a user
    --------------------------------------
    |name        | email                 |
    |Rana Nouman | ranamnouman@gmail.com |
    --------------------------------------
    And User selects date of birth
    And There is custom callback for user
    And User clicks on save button
    And User name is Rana Nouman