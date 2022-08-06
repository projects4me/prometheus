@setupApplicationTest
Feature: Issue | log time for an issue

  Scenario: Time logging for an issue

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
    When User clicks on log time
    When User add following log time for issue
    ---------------------------
    | days  | hours | minutes |
    | 5     | 8    | 45       |
    ---------------------------
    When User selects spentOn date
    When User enter test Description in description for time log
    When User clicks on save button
    Then Issue log is 6d 45m