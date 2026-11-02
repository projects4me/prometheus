@setupApplicationTest
@setupHermesFake
#UNCOMMON steps: tests/acceptance/steps/live/issue-page-live-updates-steps.js
Feature: Live | issue detail remote updates

  Scenario: The open issue follows a status, assignee and comment change made by another user
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User selects Project 1
    And Project has following details
    ---------
    | issue |
    | 5     |
    ---------
    And The issue 1 has the conversation room live-room
    When User navigates to app/project/project_1/issue/1
    Then Hermes intents include "issue.status.changed" for project "1"
    When Another user produces domain event "issue.status.changed" with:
      -------------------------------
      | key        | value          |
      | actorId    | 2              |
      | projectId  | 1              |
      | resourceId | 1              |
      | status     | in_progress    |
      | statusId   | 2              |
      -------------------------------
    Then The open issue has the status in_progress
    And A toast says the status was changed
    When Another user produces domain event "issue.assignee.changed" with:
      -------------------------------
      | key        | value          |
      | actorId    | 2              |
      | projectId  | 1              |
      | resourceId | 1              |
      | assignee   | 3              |
      -------------------------------
    Then The open issue is assigned to user 3
    When The comment live-comment exists in the room live-room
    And Another user produces domain event "conversation.comment.created" with:
      -------------------------------------
      | key            | value            |
      | actorId        | 2                |
      | projectId      | 1                |
      | resourceId     | live-comment     |
      | relatedId      | live-room        |
      | conversationId | live-room        |
      -------------------------------------
    Then The open issue lists the comment live-comment once
    And 3 toasts were shown
