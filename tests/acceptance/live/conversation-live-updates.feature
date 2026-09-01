@setupApplicationTest
@setupHermesFake
Feature: Live | conversation remote updates

  Scenario: User B sees a remote comment on an open conversation
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    -----------------------------------
    | conversations(conversationroom) |
    | 1                               |
    -----------------------------------
    When User navigates to app/project/PROJECT_1/conversations
    Then Hermes intents include "conversation.comment.created" for project "1"
    When Another user produces domain event "conversation.comment.created" with:
      ----------------------------------------
      | key            | value               |
      | actorId        | user_a              |
      | projectId      | 1                   |
      | resourceId     | remote-comment-1    |
      | relatedId      | 1                   |
      | conversationId | 1                   |
      | comment        | remote live comment |
      ----------------------------------------
    Then The conversation controller has remote comment "remote live comment"
