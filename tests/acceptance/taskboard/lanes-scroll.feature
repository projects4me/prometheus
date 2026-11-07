@setupApplicationTest
Feature: task board lanes scroll horizontally

  Scenario: Lanes beyond the viewport can be reached by scrolling

    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And User_4 selects Project 1
    And Project has following details
    ------------------------------------------------------
    | milestones(milestone) | issuestatuses(issuestatus) |
    | 1                     | 7                          |
    ------------------------------------------------------
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
    Then The active milestone lanes can be scrolled horizontally
