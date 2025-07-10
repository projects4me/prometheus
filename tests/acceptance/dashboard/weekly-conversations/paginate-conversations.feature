@setupApplicationTest
Feature: Dashboard - Weekly Conversations Widget | pagination

  Scenario: User paginates through weekly conversations

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 2
    And Project has following details
    --------------------------------------
    | conversations(conversationroom)    |
    | 2                                  |
    --------------------------------------
    And 20 comments are for this week for conversation 1
    And 10 comments are for previous week for conversation 2
    And Reverse navigation for pagination is enabled
    And There is custom callback setup to filter comments model
    When User navigates to app
    And User clicks on previous page button in weekly conversations
    Then There should be 1 conversation present in weekly conversations widget

  Scenario: User paginates through weekly conversations with next page button
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 2
    And Project has following details
    --------------------------------------
    | conversations(conversationroom)    |
    | 2                                  |
    --------------------------------------
    And 20 comments are for this week for conversation 1
    And 10 comments are for previous week for conversation 2
    And Reverse navigation for pagination is enabled
    And There is custom callback setup to filter comments model
    When User navigates to app
    And User clicks on previous page button in weekly conversations
    And User clicks on next page button in weekly conversations
    Then There should be 1 conversation present in weekly conversations widget

  Scenario: User paginates through weekly conversations on a week with no conversations
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 2
    And Project has following details
    --------------------------------------
    | conversations(conversationroom)    |
    | 2                                  |
    --------------------------------------
    And 20 comments are for this week for conversation 1
    And 10 comments are for previous week for conversation 2
    And Reverse navigation for pagination is enabled
    And There is custom callback setup to filter comments model
    When User navigates to app
    And User clicks on previous page button in weekly conversations
    And User clicks on previous page button in weekly conversations
    Then There should be 0 conversation present in weekly conversations widget
