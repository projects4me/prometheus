@setupApplicationTest
Feature: Project | add a project member

  Scenario: Adding a new member of a project

    Given There is no pre-existing data
    And project scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    ---------
    | role  |
    | 5     |
    ---------
    When User navigates to app/project/project_1
    And User clicks on add button to add a member
    And User selects User_2 as a member of project
    And User selects User_3 as a member of project
    And User selects a role 1 for that member
    And User clicks on save button
    Then User 2 is added as a member of project
    And User 3 is added as a member of project  