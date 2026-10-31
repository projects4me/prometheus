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

  Scenario: Switching the idea page to plan review mode and back

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User selects Project 1
    And The idea Dark mode is open in the project
    And The idea Dark mode has a proposed plan
    When User opens the idea Dark mode
    And User toggles the plan review mode
    Then The plan has the wide column
    When User toggles the plan review mode
    Then The conversation has the wide column

  Scenario: Opening the idea page in plan review mode

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User selects Project 1
    And The idea Dark mode is open in the project
    And The idea Dark mode has a proposed plan
    When User opens the idea Dark mode in plan review mode
    Then The plan has the wide column
