@setupApplicationTest
Feature: Role | render permissions

  Scenario: Render and check all of the permissions against the given role

    Given There is no pre-existing data
    And default scenario is loaded
    And There are 10 roles in system
    And There are catalog permissions for role 2
    And There are 10 projects in system
    And There are 10 userroles for role 2
    And User_1 is logged in
    When User navigates to app/role
    And User selects role 2
    Then There are 4 action permissions for issue module
    And There are 6 field permissions for issue module
