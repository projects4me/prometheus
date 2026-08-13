@setupApplicationTest
@setupHermesFake
Feature: Live | session and board remote updates

  Scenario: After sign-in Hermes is connected and notifications are registered
    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And User_4 selects Project 1
    When User navigates to app
    Then Hermes is connected with a fake socket
    And Hermes notifications intent is registered for the current user

  Scenario: User B sees User A's remote status change on the board
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
    Then Hermes intents include "issue.status.changed" for project "1"
    When Another user produces domain event "issue.status.changed" with:
      -----------------------------
      | key         | value       |
      | actorId     | user_a      |
      | projectId   | 1           |
      | resourceId  | 1           |
      | status      | in_progress |
      | milestoneId | 1           |
      | issueNumber | 1           |
      | actorName   | User A      |
      -----------------------------
    Then The issue "1" has live status "in_progress"
