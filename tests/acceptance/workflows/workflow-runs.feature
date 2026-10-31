@setupApplicationTest
Feature: Workflows | runs and test run on the editor

  Scenario: A stored run is drawn on the flow with its steps

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And The Draft workflow Triage starts with an issue.created trigger
    And The workflow 1 has a run that took the issue.created step
    When User opens app/workflow/1
    And User clicks Runs on the workflow editor
    And User picks the first run in the list
    Then The canvas marks the step issue.created as ran
    And The run shows 1 step

  Scenario: A test run draws the simulated path

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And The Draft workflow Triage starts with an issue.created trigger
    When User opens app/workflow/1
    And User clicks Test run on the workflow editor
    And User test runs the workflow for the record 5
    Then The canvas marks the step issue.created as ran
    And The run shows 1 step
