@setupApplicationTest
Feature: Agents | list

  Background:
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And Agent "Agent Achilles" runs for "Sponsor One" with models "sonnet" and "opus"
    And Agent "Agent Argus" has no sponsor and the model "sonnet"
    When User navigates to app/agent

  Scenario: User sees the agents with their sponsor and models

    Then Agents list has 2 agents
    And Agent "Agent Achilles" shows sponsor "Sponsor One" and models "sonnet · opus"
    And Agent "Agent Argus" shows sponsor "Autonomous" and models "sonnet"

  Scenario: User deactivates and activates the selected agents

    When User selects the row "Agent Achilles"
    And User clicks the list button "deactivate"
    Then Row "Agent Achilles" shows the status "Disabled"
    And Row "Agent Argus" shows the status "Active"
    When User clicks the list button "activate"
    Then Row "Agent Achilles" shows the status "Active"

  Scenario: User exports the selected agents

    Given Downloads of the list are captured
    When User selects the row "Agent Achilles"
    And User selects the row "Agent Argus"
    And User clicks the list button "export"
    Then The list exported the rows "Agent Achilles, Agent Argus"

  Scenario: User exports the current search when no agents are selected

    Given Downloads of the list are captured
    When User searches the list for "((Agent.name : Agent Argus))"
    And User clicks the list button "export"
    Then The list exported the search "((Agent.name : Agent Argus))"

  Scenario: User is asked to select or search before exporting

    Given Downloads of the list are captured
    When User clicks the list button "export"
    Then The list exported nothing and says "Select some Agents or search to export them"
