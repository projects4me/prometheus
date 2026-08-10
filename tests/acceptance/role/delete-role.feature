@setupApplicationTest
Feature: Role | delete role

  Scenario: Delete a role from the role detail page

    Given There is no pre-existing data
    And default scenario is loaded
    And There are 10 roles in system
    And User_1 is logged in
    When User navigates to app/role/2
    And User deletes role from detail page
    Then User is redirected to app/role
    And there are 9 roles present in the template
    And Role of id 2 is not present inside list

  Scenario: Locked-out role deletion shows error

    Given There is no pre-existing data
    And default scenario is loaded
    And There are 10 roles in system
    And Role delete for role 1 is locked out
    And User_1 is logged in
    When User navigates to app/role/1
    And User deletes role from detail page
    Then Role delete lockout error is shown
    And there are 10 roles present in the template
