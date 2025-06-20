@setupApplicationTest
Feature: Dashboard - Recent Issues | filter issues

  Scenario: Filter issues by assigned to me
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 2
    And Project has following details
    --------------
    | issue      |
    | 10         |
    --------------
    And Issue 1 is assigned to User_1
    And Issue 2 is assigned to User_2
    When User navigates to app
    And User clicks on filter dropdown in Recent Issues box
    And User selects "assignedToMe" filter
    Then Only issues assigned to User_1 should be visible in Recent Issues box
    And Filter "assignedToMe" should be marked as active

  Scenario: Apply multiple filters simultaneously
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 2
    And Project has following details
    --------------
    | issue      |
    | 10         |
    --------------
    And Issue 1 is assigned to User_1 and has status "in_progress"
    And Issue 2 is assigned to User_1 and has status "closed"
    And Issue 3 is assigned to User_2 and has status "in_progress"
    When User navigates to app
    And User clicks on filter dropdown in Recent Issues box
    And User selects "assignedToMe" filter
    And User selects "inProgressIssues" filter
    Then Only issues assigned to User_1 with status "in_progress" should be visible in Recent Issues box
    And Both filters should be marked as active

  Scenario: Remove filter and verify other filters remain active
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 2
    And Project has following details
    --------------
    | issue      |
    | 10         |
    --------------
    And Issue 1 is assigned to User_1 and has status "in_progress"
    And Issue 2 is assigned to User_2 and has status "in_progress"
    When User navigates to app
    And User clicks on filter dropdown in Recent Issues box
    And User selects "assignedToMe" filter
    And User selects "inProgressIssues" filter
    And User deselects "assignedToMe" filter
    Then Only issues with status "in_progress" should be visible in Recent Issues box
    And Filter "inProgressIssues" should remain active
    And Filter "assignedToMe" should not be active

  Scenario: Filter badge shows correct count
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 2
    And Project has following details
    --------------
    | issue      |
    | 10         |
    --------------
    When User navigates to app
    And User clicks on filter dropdown in Recent Issues box
    And User selects "assignedToMe" filter
    And User selects "inProgressIssues" filter
    Then Filter badge should show count "2"