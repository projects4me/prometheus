@setupApplicationTest
Feature: Role | assign userrole

  Scenario: Assign a role to a user

    Given There is no pre-existing data
    And default scenario is loaded
    And There are 10 roles in system
    And There are 10 projects in system
    And There are 10 userroles for role 2
    And User fetch userrole against roleId
    And User_1 is logged in
    When User navigates to app/role/2
    And User clicks on user tab
    And User clicks on create userrole button
    And User selects option 1 of userrole user
    And User clicks on save button
    Then There should 11 userroles exists
    And Userrole is created for user
