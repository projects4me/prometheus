@setupApplicationTest
Feature: User | create a user

  Scenario: Create a user

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    When User navigates to app/user/create
    And User enters following details for a user
    ------------------------------------------------------------------------------
    |name        | email                 | password | confirmPassword | username |
    |Rana Nouman | ranamnouman@gmail.com | test     | test            | rana     |
    ------------------------------------------------------------------------------
    And User selects date of birth
    And User clicks on save button
    #User with id 11 is created because "default scenario" had already created 10 users.
    Then User should be in app/user/11 page
    And User name is Rana Nouman