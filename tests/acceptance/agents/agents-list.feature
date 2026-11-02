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
