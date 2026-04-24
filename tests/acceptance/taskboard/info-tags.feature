@setupApplicationTest
Feature: info tags | Taskboard

  Scenario: Issue shows Blocked tag when status is new

    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And User_4 selects Project 1
    And Project has following details
    ------------------------------------------------------
    | milestones(milestone) | issuestatuses(issuestatus) |
    | 1                     | 7                          |
    ------------------------------------------------------ 
    And Each milestone has 1 issue with status "new"
    And Issue has parent issue with status "in_progress"
    And Issue has no endDate
    And Issue has description "Test issue description"
    When User navigates to app/project/project_1/board
    Then User should see "Blocked" info tag on first issue

  Scenario: Issue shows No Timelogs tag when done without timelogs

    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And User_4 selects Project 1
    And Project has following details
    ------------------------------------------------------
    | milestones(milestone) | issuestatuses(issuestatus) |
    | 1                     | 7                          |
    ------------------------------------------------------ 
    And Each milestone has 1 issue with status "done"
    And Issue has no spent timelogs
    And Issue has description "Test issue description"
    When User navigates to app/project/project_1/board
    Then User should see "No Timelogs" info tag on first issue

  Scenario: Issue shows Missing Description tag when no description

    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And User_4 selects Project 1
    And Project has following details
    ------------------------------------------------------
    | milestones(milestone) | issuestatuses(issuestatus) |
    | 1                     | 7                          |
    ------------------------------------------------------ 
    And Each milestone has 1 issue with status "new"
    And Issue has no description
    And Issue has no endDate
    When User navigates to app/project/project_1/board
    Then User should see "Missing Description" info tag on first issue

  Scenario: Issue shows highest priority tag when multiple conditions apply

    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And User_4 selects Project 1
    And Project has following details
    ------------------------------------------------------
    | milestones(milestone) | issuestatuses(issuestatus) |
    | 1                     | 7                          |
    ------------------------------------------------------ 
    And Each milestone has 1 issue with status "new"
    And Issue has parent issue with status "in_progress"
    And Issue has endDate "2020-01-01"
    And Issue has no description
    When User navigates to app/project/project_1/board
    Then User should see "Blocked" info tag on first issue

  Scenario: Issue shows no tag when no conditions apply

    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And User_4 selects Project 1
    And Project has following details
    ------------------------------------------------------
    | milestones(milestone) | issuestatuses(issuestatus) |
    | 1                     | 7                          |
    ------------------------------------------------------ 
    And Each milestone has 1 issue with status "done"
    And Issue has spent timelogs
    And Issue has description "Test issue description"
    And Issue has future endDate
    When User navigates to app/project/project_1/board
    Then User should see no info tag on first issue