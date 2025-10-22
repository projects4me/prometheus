@setupApplicationTest
Feature: Mark milestone as complete | Taskboard

  Background:
    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And User_4 selects Project 1

  Scenario: Checkbox hidden on backlog, visible on milestone, modal opens, cancel unchecks
    And Project has following details
    ------------------------------------------------------------------------------
    | milestones(milestone) | issuestatuses(issuestatus) | issuetypes(issuetype) |
    | 2                     | 7                          | 4                     |
    ------------------------------------------------------------------------------
    And backlog has 2 issues
    ------------------------------------------------------------------------
    | new | in_progress | in_review | done | feedback | pending | deferred |
    | 1   | 0           | 0         | 0    | 1        | 0       | 0        |
    ------------------------------------------------------------------------
    When User navigates to app/project/project_1/board
    And User activates the "backlog" tab
    Then Mark as complete checkbox is not visible

  Scenario: Confirming marks milestone as complete and removes it from tabs
    And Project has following details
    ------------------------------------------------------------------------------
    | milestones(milestone) | issuestatuses(issuestatus) | issuetypes(issuetype) |
    | 2                     | 7                          | 4                     |
    ------------------------------------------------------------------------------
    When User navigates to app/project/project_1/board
    And Mark as complete checkbox is visible
    And User clicks Mark as complete checkbox
    And User clicks on save button
    Then The active milestone tab is removed from the milestone tabs


