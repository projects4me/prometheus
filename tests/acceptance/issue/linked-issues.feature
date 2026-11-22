@setupApplicationTest
Feature: Issue Hierarchy | Parent-child relationship display

  Scenario: User creates parent issue and child issues, then views hierarchy
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    --------------
    | issue    |
    | 1        |
    --------------
    And There is custom callback for issue
    And User creates child issue with subject "Child Issue 1" and issue number 2
    And User creates child issue with subject "Child Issue 2" and issue number 3
    And User links child issues to parent issue 1    
    When User navigates to app/project/PROJECT_1/issue/1
    Then The issue hierarchy should display parent issue 1
    And The issue hierarchy should display child issue 2
    And The issue hierarchy should display child issue 3
    And Child issues should show correct priority icons
    And Child issues should show correct status badges

  Scenario: User views issue hierarchy with no child issues
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    --------------
    | issue    |
    | 1        |
    --------------
    And There is custom callback for issue
    When User navigates to app/project/PROJECT_1/issue/1
    Then The issue hierarchy should show no child issues message

  Scenario: User navigates to child issue from hierarchy
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    --------------
    | issue    |
    | 1        |
    --------------
    And There is custom callback for issue
    And User creates child issue with subject "Child Issue 1" and issue number 2
    And User links child issues to parent issue 1
    When User navigates to app/project/PROJECT_1/issue/1
    And User navigates to child issue page
    Then The child issue route should be /app/project/PROJECT_1/issue/2

  Scenario: User views issue hierarchy with multiple child issues and different priorities
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    --------------
    | issue    |
    | 1        |
    --------------
    And There is custom callback for issue
    And User creates child issue with subject "High Priority Task" and issue number 2
    And User creates child issue with subject "Low Priority Task" and issue number 3
    And User sets child issue 2 priority to high
    And User sets child issue 3 priority to low
    And User links child issues to parent issue 1    
    When User navigates to app/project/PROJECT_1/issue/1
    Then The issue hierarchy should display parent issue 1
    And The issue hierarchy should display child issue 2
    And The issue hierarchy should display child issue 3
    And Child issue 2 should show high priority icon
    And Child issue 3 should show low priority icon
