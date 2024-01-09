@setupApplicationTest
Feature: Role | edit role fields

  Scenario: Edit and update the role name

    Given There is no pre-existing data
    And default scenario is loaded
    And There are 10 roles in system
    And User_1 is logged in
    When User navigates to app/role
    And User selects role 2
    And User clicks on edit button to change role name
    And User enters Astronaut in role name input field
    And User clicks on save button to save role name
    Then Role name of type input value is Astronaut

  Scenario: Edit and update the role description

    Given There is no pre-existing data
    And default scenario is loaded
    And There are 10 roles in system
    And User_1 is logged in
    When User navigates to app/role
    And User selects role 2
    And User clicks on edit button to change role description
    And User enters Astronaut description in role description textarea field
    And User clicks on save button to save role description
    Then Role description of type textarea value is Astronaut description