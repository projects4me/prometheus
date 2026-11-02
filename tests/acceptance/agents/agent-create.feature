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

  Scenario: User creates an agent with roles, projects and Active set

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And There is a role "Developer" and a project "Apollo"
    When User navigates to app/agent/create
    And User enters "Agent Hermes" in agent name field
    And User enters "agent.hermes@projects4.me" in agent email field
    And User selects the role "Developer" and the project "Apollo" for the agent
    And User saves the agent
    Then Agent "Agent Hermes" is saved with the email "agent.hermes@projects4.me"
    And Agent "Agent Hermes" has the role "Developer" and is a member of "Apollo"
    And User sees the success message "Agent Agent Hermes saved"
    And User is on the page of agent "Agent Hermes"

  Scenario: The agent is saved but a project membership fails to save

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And There is a role "Developer" and a project "Apollo"
    And Saving a project membership fails
    When User navigates to app/agent/create
    And User enters "Agent Hermes" in agent name field
    And User enters "agent.hermes@projects4.me" in agent email field
    And User selects the role "Developer" and the project "Apollo" for the agent
    And User saves the agent
    Then Agent "Agent Hermes" is saved with the email "agent.hermes@projects4.me"
    And User sees the error message "Agent Agent Hermes saved, but these could not be saved: Projects"
    And User is on the page of agent "Agent Hermes"
