@setupApplicationTest
Feature: Conversation | toggle vote (love / unlove)

  Scenario: User loves a conversation

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
    And User clicks love button on the first conversation
    Then the first conversation shows loved state

  Scenario: User unloves a conversation after loving it

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
    And User clicks love button on the first conversation
    And User clicks love button on the first conversation
    Then the first conversation shows unlovable state
