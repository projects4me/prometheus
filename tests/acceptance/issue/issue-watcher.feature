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
    And User_1 is not core member of issue 1
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
    And User_1 is not core member of issue 1
    And Issue is already being watched
    When User navigates to app/project/PROJECT_1/issue/1
    And User clicks the watch button
    Then The issue should be marked as not watched
    And User should see success message "Issue watching disabled"
    And The watch button should show eye icon

  Scenario: Core member can see add watcher button
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    --------------
    | issue    |
    | 1        |
    --------------
    And User_1 is core member of issue 1
    When User navigates to app/project/PROJECT_1/issue/1
    Then User should see add watcher button
    And The watch button should be disabled

  Scenario: Core member can open add watchers dialog
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    --------------
    | issue    |
    | 1        |
    --------------
    And User_1 is core member of issue 1
    And Project has multiple members
    When User navigates to app/project/PROJECT_1/issue/1
    And User clicks add watcher button
    Then Available project members should be displayed
    And Core members should not be in available list
    And Current user should not be in available list

  Scenario: Core member can add project member as watcher
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    --------------
    | issue    |
    | 1        |
    --------------
    And User_1 is core member of issue 1
    And Project has multiple members
    And User_2 is project member but not core member
    When User navigates to app/project/PROJECT_1/issue/1
    And User clicks add watcher button
    And User clicks add watcher for User_2
    Then Success message should be displayed
    And User_2 should not appear in available members list

  Scenario: Core member cannot add themselves as watcher
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    --------------
    | issue    |
    | 1        |
    --------------
    And User_1 is core member of issue 1
    When User navigates to app/project/PROJECT_1/issue/1
    And User clicks add watcher button
    Then Current user should not be in available members list

  Scenario: Previously unwatched users can be re-added as watchers
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    --------------
    | issue    |
    | 1        |
    --------------
    And User_1 is core member of issue 1
    And Project has multiple members    
    And User_2 is project member but not core member
    And User_2 previously unwatched issue 1
    When User navigates to app/project/PROJECT_1/issue/1
    And User clicks add watcher button
    Then User_2 should appear in available members list
    And User can add User_2 as watcher again
