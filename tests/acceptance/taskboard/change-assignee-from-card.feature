@setupApplicationTest
Feature: change assignee from the issue card

  Scenario: Reassigning an issue from its card on the task board

    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And User_4 selects Project 1
    And User_2 is core member of project 1
    And Project has following details
    ------------------------------------------------------
    | milestones(milestone) | issuestatuses(issuestatus) |
    | 1                     | 7                          |
    ------------------------------------------------------
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
    And User_1 is assignee of all issues
    When User navigates to app/project/project_1/board
    And User clicks on the assignee avatar of the first card
    And User selects User_2 from the card assignee menu of the first card
    Then The first card shows User_2 as assignee
