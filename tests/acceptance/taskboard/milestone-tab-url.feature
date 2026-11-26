@setupApplicationTest
Feature: Keep the open milestone tab in the URL | Taskboard

  Background:
    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And User_4 selects Project 1
    And Project has following details
    ------------------------------------------------------------------------------
    | milestones(milestone) | issuestatuses(issuestatus) | issuetypes(issuetype) |
    | 2                     | 7                          | 4                     |
    ------------------------------------------------------------------------------

  Scenario: Switching tabs puts the milestone in the URL and a reload reopens it
    When User navigates to app/project/project_1/board
    And User opens the "2" milestone tab
    Then The "2" milestone tab is open
    And The board URL has milestone "2"
    When User opens the "backlog" milestone tab
    Then The board URL has milestone "backlog"
    When User reloads the board
    Then The "backlog" milestone tab is open

  Scenario: Opening the board with a milestone in the URL opens that tab
    When User opens the board with milestone "2"
    Then The "2" milestone tab is open
    And The board URL has milestone "2"

  Scenario: A milestone that isn't on the board falls back to the first tab
    When User opens the board with milestone "999"
    Then The first milestone tab is open
    And The board URL has no milestone

  Scenario: Mark as complete moves to the next tab and puts it in the URL
    When User opens the board with milestone "1"
    And User clicks Mark as complete checkbox
    And User clicks on save button
    Then The first milestone tab is open
    And The "1" milestone tab is gone
    And The board URL has the first milestone
