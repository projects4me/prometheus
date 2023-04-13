@setupApplicationTest
Feature: User Management | navigate to a user

  Scenario: Navigate to one of the user from the given list of users

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    When User navigates to app/user/management
    And User clicks on user having id 4
    Then User should be in app/user/4 page