@setupApplicationTest
Feature: Conversation | search conversation

  Scenario: Conversation linked with issue shows issue badge

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    -----------------------------------
    | conversations(conversationroom) |
    | 1                               |
    -----------------------------------
    And conversation 1 is linked with issue 1
    When User opens the threads of the project
    Then the first conversation should display linked issue badge