@setupApplicationTest
Feature: Agents | tool and skill catalogs

  Background:
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And Agent "Agent Achilles" runs for "Sponsor One" with models "sonnet" and "opus"
    And Tool server "gaia" has the tool "gaia_get_issue" granted to "Agent Achilles" with the rule "gaia_get_issue"
    And Skill "ship-issue" version "3" is granted to "Agent Achilles"

  Scenario: User sees the tool servers with their tool and agent counts

    When User opens the tool catalog
    Then Tool server "gaia" shows 1 tools and 1 agents

  Scenario: User grants a tool to an agent

    Given Agent "Agent Odysseus" runs for "Sponsor One" with models "sonnet" and "opus"
    When User opens the tool catalog
    And User selects the tool server "gaia" and the tool "gaia_get_issue"
    And User grants the selected tool to "Agent Odysseus" with the rule "gaia_get_issue"
    Then The tool "gaia_get_issue" is granted to "Agent Achilles, Agent Odysseus"

  Scenario: User sees the skills of an agent on its detail page

    When User opens the page of agent "Agent Achilles"
    Then The agent detail lists the tool "gaia_get_issue" and the skill "ship-issue"

  Scenario: User grants a skill to an agent

    Given Agent "Agent Odysseus" runs for "Sponsor One" with models "sonnet" and "opus"
    When User opens the skills screen and selects the skill "ship-issue"
    And User grants the selected skill to "Agent Odysseus"
    Then The skill "ship-issue" is used by 2 agents
