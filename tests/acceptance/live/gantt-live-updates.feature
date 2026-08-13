@setupApplicationTest
@setupHermesFake
Feature: Live | gantt remote updates

  Scenario: Remote dates change updates the gantt issue model
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
    When User navigates to app/project/project_1/gantt
    Then Hermes intents include "issue.dates.changed" for project "1"
    When Another user produces domain event "issue.dates.changed" with:
      ---------------------------
      | key        | value      |
      | actorId    | user_a     |
      | projectId  | 1          |
      | resourceId | 1          |
      | startDate  | 2026-06-01 |
      | endDate    | 2026-06-15 |
      ---------------------------
    Then The gantt issue "1" has start date "2026-06-01"
