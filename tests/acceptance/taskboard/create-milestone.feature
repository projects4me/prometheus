@setupApplicationTest
Feature: Create milestone | Taskboard

  Scenario: create a new milestone from taskboard
    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And User_4 selects Project 1
    And Project has following details
    ------------------------------------------------------------------------------
    | milestones(milestone) | issuestatuses(issuestatus) | issuetypes(issuetype) |
    | 1                     | 7                          | 4                     |
    ------------------------------------------------------------------------------
    And Each milestone has 2 issues and there status are
    ------------------------------------------------------------------------
    | new | in_progress | in_review | done | feedback | pending | deferred |
    | 1   | 1           | 0         | 0    |  0       | 0       | 0        |
    ------------------------------------------------------------------------
    And backlog has 1 issues
    ------------------------------------------------------------------------
    | new | in_progress | in_review | done | feedback | pending | deferred |
    | 1   | 0           | 0         | 0    |  0       | 0       | 0        |
    ------------------------------------------------------------------------
    When User navigates to app/project/project_1/board
    And User clicks create milestone button
    And User enters "v0.4.9" in milestone name input field
    And User selects start date of milestone
    And User selects end date of milestone
    # 3rd option is sprint
    And User selects option 5 of milestone type
    # 2nd option is in_progress
    And User selects option 2 of milestone status
    And User enters "This is a description of the sprint v0.4.9" in milestone description textarea field
    And User clicks on save milestone button
    Then There is a new milestone created with Sprint v0.4.9
    And That milestone tab is active