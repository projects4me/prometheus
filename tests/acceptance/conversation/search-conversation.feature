@setupApplicationTest
Feature: Conversation | search conversation

  Scenario: User searches for a conversation

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    -----------------------------------
    | conversations(conversationroom) |
    | 5                               |
    -----------------------------------
    When User navigates to app/project/PROJECT_1/conversations
    When User sets custom callback for conversation to return 1 conversations
    And User enters "test" in conversation search
    And User selects "discussion" from conversation filter dropdown
    And User selects "thisWeek" from conversation date dropdown
    And User clicks conversation search button
    Then conversation search filters are applied
    Then There should be 1 conversations in the list

  Scenario: User searches conversation that doesn't exist

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    -----------------------------------
    | conversations(conversationroom) |
    | 5                               |
    -----------------------------------
    When User navigates to app/project/PROJECT_1/conversations
    When User sets custom callback for conversation to return 0 conversations
    And User enters "test1" in conversation search
    And User selects "discussion" from conversation filter dropdown
    And User selects "thisWeek" from conversation date dropdown
    And User clicks conversation search button
    Then conversation search filters are applied
    Then There should be 0 conversations in the list
    Then No conversations found message is displayed

  Scenario: Conversation linked with issue shows issue badge

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    -----------------------------------
    | conversations(conversationroom) |
    | 1                               |
    -----------------------------------
    And conversation 1 is linked with issue 1
    When User navigates to app/project/PROJECT_1/conversations
    Then the first conversation should display linked issue badge