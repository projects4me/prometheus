@setupApplicationTest
Feature: Dashboard - Weekly Conversations | check list of conversations

  Scenario: check list of conversations | One conversation

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 2
    And Project has following details
    --------------------------------------
    | conversations(conversationroom)    |
    | 1                                  |
    --------------------------------------
    And Conversationroom 1 has 10 comments
    When User navigates to app
    Then There should be 1 conversation present in weekly conversations widget
    And There should be 10 comments present in weekly conversations widget for conversation 1

  Scenario: check list of conversations | Two conversations

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 2
    And Project has following details
    --------------------------------------
    | conversations(conversationroom)    |
    | 2                                  |
    --------------------------------------
    And Conversationroom 1 has 11 comments
    And Conversationroom 2 has 9 comments
    When User navigates to app
    Then There should be 2 conversations present in weekly conversations widget
    And There should be 9 comments present in weekly conversations widget for conversation 2
