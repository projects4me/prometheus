@setupApplicationTest
Feature: Conversation | edit conversation

  Scenario: Edit conversation created by the logged in user

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    -----------------------------------
    | conversations(conversationroom) |
    | 1                               |
    -----------------------------------
    And Conversation is created by User_1
    When User navigates to app/project/PROJECT_1/conversations
    And User clicks on edit button of conversation
    And User updates conversation subject to Updated Subject
    And User updates conversation description to Updated Description
    And User clicks on save button
    Then Conversation subject is updated to Updated Subject
    And Conversation description is updated to Updated Description

  Scenario: User cannot edit conversation created by other user

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    -----------------------------------
    | conversations(conversationroom) |
    | 1                               |
    -----------------------------------
    And Conversation is created by User_2
    When User navigates to app/project/PROJECT_1/conversations
    Then User shouldn't see edit button of conversation

