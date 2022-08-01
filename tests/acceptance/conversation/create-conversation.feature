@setupApplicationTest
Feature: Conversation | create conversation

  Scenario: Creating an conversation related to a project

    Given There is no pre-existing data
    Given default scenario is loaded
    Given User_1 is logged in
    Given User_1 selects Project 2
    When User navigates to app/project/2/conversations
    When User clicks on add button to create conversation
    When User enters testConversation in subject of conversation
    When User enters testTopic in topic of conversation
    When User selects type of conversation
    When User clicks on save button
    Then there is a conversation having a topic of testTopic