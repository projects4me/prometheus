@setupApplicationTest
Feature: Agents | create

  Scenario: User creates an agent

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    When User navigates to app/agent/create
    And User enters "Agent Hermes" in agent name field
    And User enters "agent.hermes@projects4.me" in agent email field
    And User saves the agent
    Then Agent "Agent Hermes" is saved with the email "agent.hermes@projects4.me"
    And Agent "Agent Hermes" has the model config simple "sonnet", complex "opus" and escalation "opus"
