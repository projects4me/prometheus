@setupApplicationTest
Feature: update issue assignee inline

  Scenario: Updating issue assignee using dropdown | issue page view

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And User_2 is core member of project 1
    And Project has following details
    ---------
    | issue |
    | 5     |
    ---------
    And User_1 is assignee of issue 4
    When User navigates to app/project/project_1/issue/4
    And There is custom callback setup for issue updating
    And User clicks on assignee dropdown
    And User selects User_2 from assignee dropdown
    Then User_2 is assigned to issue 4