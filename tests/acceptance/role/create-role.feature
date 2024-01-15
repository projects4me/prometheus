@setupApplicationTest
Feature: Role | create role

  Scenario: Creating a role with pre-defined values

    Given There is no pre-existing data
    And default scenario is loaded
    And There are 10 roles in system
    And User_1 is logged in
    When User navigates to app/role
    And User clicks on role create button
    And User enters Astronaut in role name input field
    And User enters Astronaut description in role description textarea field   
    And User clicks on save button    
    Then There will a role name Astronaut in the template    
