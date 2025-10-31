@setupApplicationTest
Feature: open conversation in a sidepanel

  Scenario: Adding a comment of existing conversations

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    -----------------------------------
    | conversations(conversationroom) |
    | 5                               |
    -----------------------------------
    When User navigates to app/project/PROJECT_1
    And User clicks on conversation 1 from latest conversations section
    Then User should see the conversation 1 in the sidepanel