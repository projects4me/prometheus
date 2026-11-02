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

  Scenario: User issues, rotates and revokes the credentials of an agent

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And Agent "Agent Achilles" runs for "Sponsor One" with models "sonnet" and "opus"
    When User opens the detail page of agent "Agent Achilles"
    Then The credentials box says the agent has no credentials
    When User issues credentials for the agent
    Then The new secret is shown once with the gaia-mcp.env lines
    When User closes the new secret
    Then The credentials box shows the client ID and a masked secret
    When User rotates the secret of the agent
    Then The new secret is shown once with the gaia-mcp.env lines
    When User closes the new secret
    And User revokes the credentials of the agent
    Then The credentials box says the agent has no credentials
