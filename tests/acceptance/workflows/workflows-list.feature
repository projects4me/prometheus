@setupApplicationTest
Feature: Workflows | list

  Background:
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And Agent "Agent Achilles" runs for "Sponsor One" with models "sonnet" and "opus"
    And The Active workflow "Agent coding loop" triggers on issue.assignee.changed and runs the agent "Agent Achilles"
    And The Draft workflow "Triage new issues" triggers on issue.created and asks the user placeholder "{issue.reporterId}"
    And The workflow "Agent coding loop" ran 3 times in the last week
    When User navigates to app/workflow

  Scenario: User sees the workflows with trigger, actors and runs

    Then Workflows list has 2 workflows
    And Workflow "Agent coding loop" shows trigger "Issue · Assignee changed" and 3 runs
    And Workflow "Agent coding loop" has the agent actor "Agent Achilles"
    And Workflow "Triage new issues" shows trigger "Issue · Created" and 0 runs
    And Workflow "Triage new issues" shows last run "never"
    And Workflow "Triage new issues" has the actor "Reporter"

  Scenario: User deactivates and activates the selected workflows

    When User selects the row "Agent coding loop"
    And User selects the row "Triage new issues"
    And User clicks the list button "deactivate"
    Then Row "Agent coding loop" shows the status "Disabled"
    And Row "Triage new issues" shows the status "Disabled"
    When User clicks the list button "activate"
    Then Row "Agent coding loop" shows the status "Active"
    And Row "Triage new issues" shows the status "Active"

  Scenario: User exports the selected workflows

    Given Downloads of the list are captured
    When User selects the row "Triage new issues"
    And User clicks the list button "export"
    Then The list exported the rows "Triage new issues"
