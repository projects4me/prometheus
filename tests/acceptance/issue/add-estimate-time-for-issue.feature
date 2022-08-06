@setupApplicationTest
Feature: Issue | add estimate time for issue

  Scenario: Adding estimate time for an issue

    Given There is no pre-existing data
    Given default scenario is loaded
    Given User_1 is logged in
    Given User selects Project 3
    Given Project has following details
    ---------
    | issue |
    | 5     |
    ---------
    When User navigates to app/project/3/issue/4
    When User clicks on estimate time
    When User add following log time for issue
    ---------------------------
    | days  | hours | minutes |
    | 5     | 8    | 45       |
    ---------------------------
    When User enter test Description in description for estimate time
    When User clicks on save button
    Then Issue log is 6d 45m