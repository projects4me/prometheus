@setupApplicationTest
Feature: Project | edit a project member

  Scenario: Editing a member's role

    Given There is no pre-existing data
    And project scenario is loaded
    And User_1 is logged in
    And There are 10 projects in system
    And User_1 selects Project 3
    And Project has following details
    ---------
    | role  |
    | 5     |
    ---------
    And User_1 is given role 1 in Project 3
    When User navigates to app/project/project_3
    And User clicks on edit button to edit member 1
    And User selects a role 2 for that member
    And User clicks on save button
    Then User 1 membership is updated with role 2