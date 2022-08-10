@setupApplicationTest
Feature: Conversation | add comment on conversation

  Scenario: Adding a comment of existing conversations

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 2
    And Project has following details
    -----------------------------------
    | conversations(conversationroom) |
    | 5                               |
    -----------------------------------
    When User navigates to app/project/2/conversations
    And User add a comment having description testComment
    Then User_1 has created a comment
    And Comment having description testComment is created