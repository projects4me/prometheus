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

  Scenario: User sees the workflows that reference the agent

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And Agent "Agent Achilles" runs for "Sponsor One" with models "sonnet" and "opus"
    And The Active workflow "Review issues" triggers on issue.created and runs the agent "Agent Achilles"
    When User opens the detail page of agent "Agent Achilles"
    Then The workflows box lists "Review issues" as Run agent with trigger "Issue · Created" and status "Active"

  Scenario: User sees that no workflow references the agent

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And Agent "Agent Achilles" runs for "Sponsor One" with models "sonnet" and "opus"
    When User opens the detail page of agent "Agent Achilles"
    Then The workflows box says no workflow references the agent

  Scenario: User sees the activities of the agent grouped by date

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And Agent "Agent Achilles" runs for "Sponsor One" with models "sonnet" and "opus"
    And Agent "Agent Achilles" has 2 activities
    And Gaia rejects an activity sort that carries its order
    When User opens the detail page of agent "Agent Achilles"
    Then The agent detail shows the AGENT label
    And The Agent Activities box shows 2 activities

  Scenario: User opens the detail page of an agent that does not exist

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    When User opens the detail page of an agent that does not exist
    Then The page not found error is shown

  Scenario: User opens the edit page of an agent that does not exist

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    When User opens the edit page of an agent that does not exist
    Then The page not found error is shown

  Scenario: User sees an error when the agent cannot be loaded

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And Gaia fails to load agents
    When User opens the detail page of an agent that does not exist
    Then The server error is shown

  Scenario: User sees an error instead of the edit form when the agent's roles cannot be loaded

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And Agent "Agent Achilles" runs for "Sponsor One" with models "sonnet" and "opus"
    And Gaia fails to load user roles
    When User opens the edit page of agent "Agent Achilles"
    Then The server error is shown
    And The agent form is not shown

  Scenario: User sees an error instead of the edit form when the roles to choose from cannot be loaded

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And Agent "Agent Achilles" runs for "Sponsor One" with models "sonnet" and "opus"
    And Gaia denies access to roles
    When User opens the edit page of agent "Agent Achilles"
    Then The server error is shown
    And The agent form is not shown
