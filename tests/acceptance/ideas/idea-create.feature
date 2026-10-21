@setupApplicationTest
Feature: Ideas | start a new idea

  Scenario: Starting an idea creates it with its first message and opens its page

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User selects Project 1
    When User opens the new idea page
    And User enters Dark mode in the idea title
    And User enters Let users switch to a dark theme in the idea description
    And User clicks the start idea button
    Then The idea Dark mode is saved with the message Let users switch to a dark theme
    And The idea page columns are shown
    And The idea browser lists the ideas Dark mode

  Scenario: An idea without a title is rejected

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User selects Project 1
    When User opens the new idea page
    And User clicks the start idea button
    Then No idea is created
    And User stays on the new idea page
