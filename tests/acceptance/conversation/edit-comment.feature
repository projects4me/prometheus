@setupApplicationTest
Feature: Conversation | edit comment

  Scenario: Edit comment created by the logged in user

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
    And User add a comment having description testComment
    And User clicks on edit button of comment
    And User updates comment having description updatedComment
    And User clicks on save button
    Then Comment having description updatedComment is updated

  Scenario: User cannot edit comment created by other user

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    -----------------------------------
    | conversations(conversationroom) |
    | 1                               |
    -----------------------------------
    And Conversation has 1 comment
    And Comment is created by User_2
    When User navigates to app/project/PROJECT_1/conversations
    Then User shouldn't see edit button of comment

