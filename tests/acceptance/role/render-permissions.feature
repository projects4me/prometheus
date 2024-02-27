@setupApplicationTest
Feature: Role | render permissions

  Scenario: Render and check all of the permissions against the given role

    Given There is no pre-existing data
    And default scenario is loaded
    And There are 10 roles in system
    And There are 100 permissions for role 2
    And There are 10 projects in system
    And There are 10 memberships for role 2
    And User_1 is logged in
    When User navigates to app/role
    And User selects role 2
    And User clicks on first module to check permissions
    Then There are 100 permissions for that module
