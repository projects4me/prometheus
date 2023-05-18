@setupApplicationTest
Feature: User | edit a user

  Scenario: Edit a user

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    When User navigates to app/user/edit/1
    And User enters following details for a user
    ------------------------------------------------------------------------------
    |name        | email                 | password | confirmPassword | username |
    |Rana Nouman | ranamnouman@gmail.com | test     | test            | rana     |
    ------------------------------------------------------------------------------
    And User selects date of birth
    And User clicks on save button
    Then User should be in app/user/1 page
    And User name is Rana Nouman