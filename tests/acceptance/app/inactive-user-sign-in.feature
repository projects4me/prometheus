@setupApplicationTest
#UNCOMMON steps: tests/acceptance/steps/app/inactive-user-sign-in-steps.js
Feature: App | inactive user sign in

  Scenario: Inactive user cannot sign in to the application

    Given There is no pre-existing data
    And default scenario is loaded
    And User 1 has inactive account with sign-in credentials
    And User is not logged in
    When User submits sign-in with inactive account credentials
    Then User should be in signin page
    And User should not be authenticated
    And User should see inactive account sign-in error
