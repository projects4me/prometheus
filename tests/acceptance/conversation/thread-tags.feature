@setupApplicationTest
Feature: Threads | tags

  Background:
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    -----------------------------------
    | conversations(conversationroom) |
    | 1                               |
    -----------------------------------

  Scenario: The thread shows chips only and the + opens the tags modal

    Given Project has the tags "backend"
    And Conversation 1 has the tag "backend"
    When User navigates to app/project/PROJECT_1
    And User opens the vote thread 1 from the latest conversations
    Then The thread shows the tags "backend"
    And The thread tags have no remove buttons
    When User clicks the edit tags button of the thread
    Then The tags modal is open

  Scenario: The thread shows the tags it already has

    Given Project has the tags "backend"
    And Conversation 1 has the tag "backend"
    When User navigates to app/project/PROJECT_1
    And User opens the vote thread 1 from the latest conversations
    Then The thread shows the tags "backend"
