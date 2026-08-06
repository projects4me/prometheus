@setupApplicationTest
Feature: Role | delete userrole

  Scenario: Delete user's role assignment

    Given There is no pre-existing data
    And default scenario is loaded
    And There are 10 roles in system
    And There are 10 projects in system
    And There are 10 userroles for role 2
    And User fetch userrole against roleId
    And User_1 is logged in
    When User navigates to app/role/2
    And User delete userrole 1
    Then There should 9 userroles exists
