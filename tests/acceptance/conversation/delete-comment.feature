@setupApplicationTest
Feature: Conversation | delete comment

  Scenario: Delete comment created by the logged in user

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
    And User clicks on delete button of comment
    And User clicks on save button
    Then Conversation has 0 comments

  Scenario: User cannot delete comment created by other user

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
    Then User shouldn't see delete button of comment