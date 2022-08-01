@setupApplicationTest
Feature: Conversation | add comment on conversation

  Scenario: Adding a comment of existing conversations

    Given There is no pre-existing data
    Given default scenario is loaded
    Given User_1 is logged in
    Given User_1 selects Project 2
    Given Project 2 has following details
    -----------------------------------
    | conversations(conversationroom) |
    | 5                               |
    -----------------------------------
    When User navigates to app/project/2/conversations
    When User add a comment having description testComment
    Then User_1 has created a comment
    Then Comment having description testComment is created