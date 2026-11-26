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

  Scenario: A new tag is created and added to the thread, an existing tag is reused, and a tag is removed

    Given Project has the tags "backend"
    When User navigates to app/project/PROJECT_1
    And User opens the vote thread 1 from the latest conversations
    Then The thread shows no tags
    When User types "frontend" in the thread tags field
    And User chooses the option "Add “frontend”" of the thread tags field
    Then The thread shows the tags "frontend"
    And The project has 2 tags
    When User types "back" in the thread tags field
    And User chooses the option "backend" of the thread tags field
    Then The thread shows the tags "frontend, backend"
    And The project has 2 tags
    When User removes the tag "frontend" from the thread
    Then The thread shows the tags "backend"
    And The project has 2 tags

  Scenario: The thread shows the tags it already has

    Given Project has the tags "backend"
    And Conversation 1 has the tag "backend"
    When User navigates to app/project/PROJECT_1
    And User opens the vote thread 1 from the latest conversations
    Then The thread shows the tags "backend"
