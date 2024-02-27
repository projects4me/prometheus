@setupApplicationTest
Feature: Role | render users

  Scenario: Render and check list of users (memberships) associated with the given role

    Given There is no pre-existing data
    And default scenario is loaded
    And There are 10 roles in system
    And There are 10 projects in system
    And There are 10 memberships for role 2
    And User fetch membership against roleId
    And User_1 is logged in
    When User navigates to app/role/2
    And User clicks on user tab
    Then There should 10 memberships exists