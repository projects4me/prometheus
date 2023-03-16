@setupApplicationTest
Feature: Taskboard | filter issues board

  Scenario: filter issues from task board

    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And User_4 selects Project 2
    And Project has following details
    ------------------------------------------------------
    | milestones(milestone) | issuestatuses(issuestatus) |
    | 1                     | 6                          |
    ------------------------------------------------------ 
    And Each milestone has 4 issues and there status are
    ------------------------------------------------------------
    | new | in_progress | done | feedback | pending | deferred |
    | 1   | 1           | 2    |  0       | 0       | 0        |
    ------------------------------------------------------------
    And backlog has 2 issues
    ------------------------------------------------------------
    | new | in_progress | done | feedback | pending | deferred |
    | 1   | 0           | 0    |  1       | 0       | 0        |
    ------------------------------------------------------------
    When User navigates to app/project/2/board
    And User search Issue Test 4 from milestone 1
    Then There should be only issue 4 present inside milestone 1