@setupApplicationTest
Feature: Conversation | create conversation

  Scenario: Creating an conversation related to a project

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 2
    When User navigates to app/project/2/conversations
    And User clicks on add button to create conversation
    And User enters testConversation in subject of conversation
    And User enters testTopic in topic of conversation
    And User selects type of conversation
    And User clicks on save button
    Then there is a conversation having a topic of testTopic