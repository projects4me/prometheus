@setupApplicationTest
Feature: task board columns follow the issue statuses

  Scenario: Board columns are ordered, coloured and labelled from the issue statuses

    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And User_4 selects Project 1
    And Project has following details
    ------------------------------------------------------
    | milestones(milestone) | issuestatuses(issuestatus) |
    | 1                     | 7                          |
    ------------------------------------------------------
    And The issue statuses of the project are
    ----------------------------------------
    | name             | sortOrder | color   |
    | new              | 2         | #123456 |
    | in_progress      | 1         | #80b5d3 |
    | in_review        | 3         | #80b5d3 |
    | done             | 8         | #80b5d3 |
    | feedback         | 4         | #80b5d3 |
    | pending          | 5         | #80b5d3 |
    | deferred         | 6         | #80b5d3 |
    | on_hold_upstream | 7         | #a52a2a |
    ----------------------------------------
    And Each milestone has 2 issues and there status are
    ------------------------------------------------------------------------
    | new | in_progress | in_review | done | feedback | pending | deferred |
    | 1   | 1           | 0         | 0    | 0        | 0       | 0        |
    ------------------------------------------------------------------------
    And backlog has 0 issues
    ------------------------------------------------------------------------
    | new | in_progress | in_review | done | feedback | pending | deferred |
    | 0   | 0           | 0         | 0    | 0        | 0       | 0        |
    ------------------------------------------------------------------------
    And There is custom callback for board issues
    When User navigates to app/project/project_1/board
    Then The board columns are in_progress, new, in_review, feedback, pending, deferred, on_hold_upstream, done
    And The new column header is coloured #123456
    And The on_hold_upstream column header is coloured #a52a2a
    And The new column header shows the label New
    And The on_hold_upstream column header shows the label on_hold_upstream

  Scenario: Issue status badge is painted with the colour of the status

    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And User_4 selects Project 1
    And Project has following details
    ------------------------------------------------------
    | milestones(milestone) | issuestatuses(issuestatus) |
    | 1                     | 7                          |
    ------------------------------------------------------
    And The issue statuses of the project are
    ----------------------------------------
    | name             | sortOrder | color   |
    | new              | 1         | #123456 |
    ----------------------------------------
    And Each milestone has 1 issues and there status are
    ------------------------------------------------------------------------
    | new | in_progress | in_review | done | feedback | pending | deferred |
    | 1   | 0           | 0         | 0    | 0        | 0       | 0        |
    ------------------------------------------------------------------------
    And backlog has 0 issues
    ------------------------------------------------------------------------
    | new | in_progress | in_review | done | feedback | pending | deferred |
    | 0   | 0           | 0         | 0    | 0        | 0       | 0        |
    ------------------------------------------------------------------------
    And There is custom callback for board issues
    When User navigates to app/project/project_1/issue
    Then The issue status badge is coloured #123456

  Scenario: A label added in Settings shows on the board without a reload

    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And User_4 has setting.get permission set to 1
    And User_4 has setting.update permission set to 1
    And User_4 selects Project 1
    And Project has following details
    ------------------------------------------------------
    | milestones(milestone) | issuestatuses(issuestatus) |
    | 1                     | 7                          |
    ------------------------------------------------------
    And The issue statuses of the project are
    ----------------------------------------
    | name             | sortOrder | color   |
    | on_hold_upstream | 7         | #a52a2a |
    ----------------------------------------
    And Each milestone has 1 issues and there status are
    ------------------------------------------------------------------------
    | new | in_progress | in_review | done | feedback | pending | deferred |
    | 1   | 0           | 0         | 0    | 0        | 0       | 0        |
    ------------------------------------------------------------------------
    And backlog has 0 issues
    ------------------------------------------------------------------------
    | new | in_progress | in_review | done | feedback | pending | deferred |
    | 0   | 0           | 0         | 0    | 0        | 0       | 0        |
    ------------------------------------------------------------------------
    And There is custom callback for board issues
    When User opens app/settings/issue-statuses
    And User creates the issue status On Hold Upstream
    And User navigates to app/project/project_1/board
    Then The on_hold_upstream column header shows the label On Hold Upstream
