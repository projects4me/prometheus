@setupApplicationTest
Feature: Ideas | plan

  Scenario: Approving the latest proposed plan

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User selects Project 1
    And The idea Dark mode is open in the project
    And The idea Dark mode has a proposed plan
    When User opens the idea Dark mode
    And User approves the plan
    Then The plan is approved

  Scenario: Screens and steps from Gaia show in the thread and the plan box

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User selects Project 1
    And The idea Dark mode is open in the project
    And The idea Dark mode has a Nestor message with the screen Login screen and a step
    When User opens the idea Dark mode
    Then The screen Login screen is listed in the thread and in the plan box
    And The step of the Nestor message is listed
