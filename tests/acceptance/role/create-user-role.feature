@setupApplicationTest
Feature: Role | assign userrole

  Scenario: Assign multiple users to a role in one action
    Given There is no pre-existing data
    And default scenario is loaded
    And There are 10 roles in system
    And There are 10 projects in system
    And There are 8 userroles for role 2
    And User fetch userrole against roleId
    And User_1 is logged in
    When User navigates to app/role/2
    And User clicks on create userrole button
    And User selects User_9 as a role member
    And User selects User_10 as a role member
    And User clicks on save button
    Then There should 10 userroles exists
    And User_9 is assigned to role
    And User_10 is assigned to role
    And Userrole is created for user

  Scenario: Already assigned users are excluded from add-member picker
    Given There is no pre-existing data
    And default scenario is loaded
    And There are 10 roles in system
    And There are 10 projects in system
    And There are 9 userroles for role 2
    And User fetch userrole against roleId
    And User_1 is logged in
    When User navigates to app/role/2
    And User clicks on create userrole button
    Then Add role member picker should offer 1 users

  Scenario: Empty eligible users when all users are already assigned
    Given There is no pre-existing data
    And default scenario is loaded
    And There are 10 roles in system
    And There are 10 projects in system
    And There are 10 userroles for role 2
    And User fetch userrole against roleId
    And User_1 is logged in
    When User navigates to app/role/2
    And User clicks on create userrole button
    Then Add role member picker should show no eligible users
