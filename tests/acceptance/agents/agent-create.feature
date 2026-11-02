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

  Scenario: User gives a new agent access to roles and projects

    Given There is no pre-existing data
    And default scenario is loaded
    And Projects "Zeta, Alpha, Mango" exist
    And Roles "Reviewer, Developer" exist
    And User_1 is logged in
    When User navigates to app/agent/create
    And User enters "Agent Hermes" in agent name field
    And User enters "agent.hermes@projects4.me" in agent email field
    Then The agent projects list shows "Alpha, Mango, Zeta" in that order
    And The agent roles list shows "Developer, Reviewer" in that order
    When User searches "man" in the agent projects field
    Then The agent projects list shows "Mango" in that order
    When User picks "Mango" in the agent projects field
    Then The agent projects field shows "Mango"
    When User picks "Alpha" in the agent projects field
    And User picks "Zeta" in the agent projects field
    And User removes "Zeta" from the agent projects field
    And User searches "rev" in the agent roles field
    Then The agent roles list shows "Reviewer" in that order
    When User picks "Reviewer" in the agent roles field
    Then The agent projects field shows "Mango, Alpha"
    And The agent roles field shows "Reviewer"
    When User saves the agent
    Then Agent "Agent Hermes" is a member of the projects "Alpha, Mango"
    And Agent "Agent Hermes" has the roles "Reviewer"
    When User opens the edit page of agent "Agent Hermes"
    Then The agent projects field shows "Alpha, Mango"
    And The agent roles field shows "Reviewer"
