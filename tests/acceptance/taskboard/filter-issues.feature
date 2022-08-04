@setupApplicationTest
Feature: Taskboard | filter issues board

  Scenario: filter issues from task board

    Given There is no pre-existing data
    Given default scenario is loaded
    Given User_4 is logged in
    Given Project 10 has 2 milestones
    Given Each milestone has 4 issues and there status are
    ------------------------------------------------------------
    | new | in_progress | done | feedback | pending | deferred |
    | 1   | 1           | 2    |  0       | 0       | 0        |
    ------------------------------------------------------------
    Given backlog has 2 issues
    ------------------------------------------------------------
    | new | in_progress | done | feedback | pending | deferred |
    | 1   | 0           | 0    |  1       | 0       | 0        |
    ------------------------------------------------------------
    When User navigates to app/project/10/board
    When User search Issue Test 4 from milestone 1
    Then There should be only issue 4 present inside milestone 1