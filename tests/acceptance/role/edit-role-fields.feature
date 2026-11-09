@setupApplicationTest
Feature: Role | edit role fields

  Scenario: Edit and update the role name

    Given There is no pre-existing data
    And default scenario is loaded
    And There are 10 roles in system
    And There are 10 projects in system
    And There are 10 memberships in system
    And User_1 is logged in
    When User opens the roles page
    And User selects role 2
    And User clicks on the role name to edit
    And User edits the role name to Astronaut
    And User saves the role inline edit
    Then The role name shows Astronaut

  Scenario: Edit and update the role description

    Given There is no pre-existing data
    And default scenario is loaded
    And There are 10 roles in system
    And There are 10 projects in system
    And There are 10 memberships in system
    And User_1 is logged in
    When User opens the roles page
    And User selects role 2
    And User clicks on the role description to edit
    And User edits the role description to Astronaut description
    And User saves the role inline edit
    Then The role description shows Astronaut description

  Scenario: The role record box shows the role facts

    Given There is no pre-existing data
    And default scenario is loaded
    And There are 10 roles in system
    And There are 10 projects in system
    And There are 10 memberships in system
    And User_1 is logged in
    When User opens the roles page
    And User selects role 2
    Then The role record box shows the initials, access, members and actions facts
