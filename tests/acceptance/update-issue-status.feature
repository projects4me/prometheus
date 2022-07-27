@setupApplicationTest
Feature: update issue status

  Scenario: the one where I type ember g feature

    Given User_4 is logged in
    Given Project 10 has 4 milestones
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