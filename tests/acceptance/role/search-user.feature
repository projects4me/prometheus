@setupApplicationTest
Feature: Role | search user

  Scenario: Search a user from given list of users

    Given There is no pre-existing data
    And default scenario is loaded
    And There are 10 roles in system
    And There are 10 projects in system
    And There are 10 memberships for role 2
    And User fetch membership against roleId
    And User_1 is logged in
    When User navigates to app/role/2
    And User clicks on user tab
    And User search for user having membership 4
    Then There should some users exists