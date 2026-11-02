@setupApplicationTest
Feature: Agents | detail

  Scenario: User sees the agent with its sponsor and models

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And Agent "Agent Achilles" runs for "Sponsor One" with models "sonnet" and "opus"
    When User opens the detail page of agent "Agent Achilles"
    Then The agent detail shows the AGENT label
    And The agent detail shows sponsor "Sponsor One", model simple "sonnet" and model complex "opus"
