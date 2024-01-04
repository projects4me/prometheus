@setupApplicationTest
Feature: Role | search a role

  Scenario: Searching a role from the list of roles

    Given There is no pre-existing data
    And default scenario is loaded
    And There are 10 roles in system
    And Role 4 has name Astronaut
    And User_1 is logged in
    When User navigates to app/role
    And User searches for role name Astronaut
    Then There will a role name Astronaut in the template