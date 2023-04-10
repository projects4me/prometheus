@setupApplicationTest
Feature: User Management | search user from list

  Scenario: Search an user from given list of users.

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    When User navigates to app/user/management
    When User types User_2 in search box
    Then User_2 should be present inside list