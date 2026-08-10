@setupApplicationTest
Feature: Role | render users

  Scenario: Render and check list of users (userroles) associated with the given role

    Given There is no pre-existing data
    And default scenario is loaded
    And There are 10 roles in system
    And There are 10 projects in system
    And There are 10 userroles for role 2
    And User fetch userrole against roleId
    And User_1 is logged in
    When User navigates to app/role/2
    Then There should 10 userroles exists
