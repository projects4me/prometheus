@setupApplicationTest
@setupHermesFake
Feature: Conversation | vote thread

  Scenario: User votes once and sees the tallies, result and locked thumbs

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    -----------------------------------
    | conversations(conversationroom) |
    | 2                               |
    -----------------------------------
    And Conversation 1 is a vote thread with 1 agree votes and 1 disagree votes
    When User navigates to app/project/PROJECT_1
    And User opens the vote thread 1 from the latest conversations
    Then Vote body counts 1 agree and 1 disagree votes, "Tied" and the hint to vote
    And Vote body has no reply box and no linked issue box
    When User votes "agree" on the open vote
    Then Vote body counts 2 agree and 1 disagree votes, "Leaning: I agree (2 of 3)" and "You voted: I agree"
    And Vote body thumbs are locked

  Scenario: A vote of another user updates the open vote thread live

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    -----------------------------------
    | conversations(conversationroom) |
    | 2                               |
    -----------------------------------
    And Conversation 1 is a vote thread with 0 agree votes and 0 disagree votes
    When User navigates to app/project/PROJECT_1
    And User opens the vote thread 1 from the latest conversations
    Then Vote body counts 0 agree and 0 disagree votes, "No votes yet" and the hint to vote
    When Another user produces domain event "conversation.comment.created" with:
      ----------------------------------------
      | key            | value               |
      | actorId        | user_a              |
      | projectId      | 1                   |
      | resourceId     | remote-vote-1       |
      | relatedId      | 1                   |
      | conversationId | 1                   |
      | comment        | I disagree          |
      | createdUser    | user_a              |
      | createdUserName| User A              |
      | dateCreated    | 2026-01-02 10:00:00 |
      ----------------------------------------
    Then Vote body counts 0 agree and 1 disagree votes, "Leaning: I disagree (1 of 1)" and the hint to vote
    And Vote body lists 1 votes

  Scenario: The participants box lists the voters of a vote thread

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    -----------------------------------
    | conversations(conversationroom) |
    | 2                               |
    -----------------------------------
    And Conversation 1 is a vote thread with 1 agree votes and 1 disagree votes
    When User navigates to app/project/PROJECT_1
    And User opens the vote thread 1 from the latest conversations
    Then Participants box lists voter-2, voter-1

  Scenario: The participants box lists each commenter of a discussion once

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    -----------------------------------
    | conversations(conversationroom) |
    | 2                               |
    -----------------------------------
    And Conversation 1 is a discussion with comments by 2 people
    When User navigates to app/project/PROJECT_1
    And User opens the vote thread 1 from the latest conversations
    Then Participants box lists talker-2, talker-1
