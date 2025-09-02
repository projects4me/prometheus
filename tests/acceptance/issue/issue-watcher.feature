@setupApplicationTest
Feature: Issue Watcher | Watch and unwatch issues

  Scenario: User can watch an issue
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    --------------
    | issue    |
    | 1        |
    --------------
    When User navigates to app/project/PROJECT_1/issue/1
    And User clicks the watch button
    Then The issue should be marked as watched
    And User should see success message "Issue watching enabled"
    And The watch button should show eye-slash icon

  Scenario: User can unwatch an issue
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    --------------
    | issue    |
    | 1        |
    --------------
    And Issue is already being watched
    When User navigates to app/project/PROJECT_1/issue/1
    And User clicks the watch button
    Then The issue should be marked as not watched
    And User should see success message "Issue watching disabled"
    And The watch button should show eye icon
