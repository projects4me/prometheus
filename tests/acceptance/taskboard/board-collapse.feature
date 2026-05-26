@setupApplicationTest
Feature: Board collapse functionality | Taskboard

  Background:
    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And User_4 selects Project 1
    And Project has following details
    ------------------------------------------------------------------------------
    | milestones(milestone) | issuestatuses(issuestatus) | issuetypes(issuetype) |
    | 1                     | 7                          | 4                     |
    ------------------------------------------------------------------------------
    And Each milestone has 5 issues and there status are
    ------------------------------------------------------------------------
    | new | in_progress | in_review | done | feedback | pending | deferred |
    | 1   | 1           | 1         | 2    |  0       | 0       | 0        |
    ------------------------------------------------------------------------
    And backlog has 2 issues
    ------------------------------------------------------------------------
    | new | in_progress | in_review | done | feedback | pending | deferred |
    | 1   | 0           | 0         | 0    |  1       | 0       | 0        |
    ------------------------------------------------------------------------  
    And There is custom callback for board issues
    When User navigates to app/project/project_1/board

  Scenario: Divider handle is not visible when no issue is open

    Then User should not see the panel divider handle

  Scenario: Divider handle becomes visible when an issue is opened

    Given User clicks on first issue on the board to open details
    Then User should see the panel divider handle

  Scenario: Board is hidden when the divider handle is clicked

    Given User clicks on first issue on the board to open details
    When User clicks the panel divider handle
    Then User should not see the task board content

  Scenario: Issue details panel expands to full width when board is collapsed

    Given User clicks on first issue on the board to open details
    When User clicks the panel divider handle
    Then The issue details panel should be in full width mode

  Scenario: Board expands again when divider handle is clicked again

    Given User clicks on first issue on the board to open details
    And User clicks the panel divider handle
    When User clicks the panel divider handle to expand
    Then User should see the task board content
    And User should see the panel divider handle

  Scenario: Issue details panel returns to default width after board is expanded

    Given User clicks on first issue on the board to open details
    And User clicks the panel divider handle
    When User clicks the panel divider handle to expand
    Then The issue details panel should be in default width mode
