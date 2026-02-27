@setupApplicationTest
Feature: Conversation | create conversation

  Scenario: Creating an conversation related to a project

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    When User navigates to app/project/project_1/conversations
    And User clicks on add button to create conversation
    And User enters testConversation in subject of conversation
    And User enters testDescription in description of conversation
    And User selects type of conversation
    And User clicks on save button
    Then there is a conversation having a topic of testTopic

  Scenario: Creating a conversation linked to an issue

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has 5 unlinked issues
    When User navigates to app/project/project_1/conversations
    And User clicks on add button to create conversation
    And User enters "Linked conv subject" in subject of conversation
    And User enters "Linked conv description" in description of conversation
    And User selects Discussion as conversation type
    And User searches and selects issue #1 in link issue
    And User clicks on save button
    Then the conversation is linked with issue #1