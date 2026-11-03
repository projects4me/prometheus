@setupApplicationTest
Feature: Issue | add estimate time for issue

  Scenario: Adding estimate time for an issue

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User selects Project 1
    And Project has following details
    ---------
    | issue |
    | 5     |
    ---------
    When User navigates to app/project/project_1/issue/4
    And User clicks on estimate time
    And User add following log time for issue
    ---------------------------
    | days  | hours | minutes |
    | 5     | 8    | 45       |
    ---------------------------
    When User enter test Description in description for estimate time
    And User clicks on save button
    Then Issue log is 6d 45m

  Scenario: Editing an existing estimate for an issue

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User selects Project 1
    And Project has following details
    ---------
    | issue |
    | 5     |
    ---------
    When User navigates to app/project/project_1/issue/4
    And User clicks on estimate time
    And User add following log time for issue
    ---------------------------
    | days  | hours | minutes |
    | 5     | 8    | 45       |
    ---------------------------
    When User enter first estimate in description for estimate time
    And User clicks on save button
    And User clicks on edit estimate
    And User sets estimate to 1 days 2 hours 30 minutes
    And User enter updated estimate in description for edited estimate
    And User clicks on save button
    Then User should see estimate updated message
    And Issue log is 1d 2h 30m
    And Estimate description is updated estimate
