@setupApplicationTest
Feature: Issue | assignee picker groups people and agents

  Scenario: Agents are listed in their own group with the sponsor they run for

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Agent "Agent Achilles" runs for "Sponsor One" with models "sonnet" and "opus"
    And Project 1 has agent "Agent Achilles" as a member
    When User navigates to issue create page
    Then The assignee options have the groups "People" and "Agents"
    And Agent "Agent Achilles" is listed under Agents with the text "runs for Sponsor One"
    And The owner options have no Agents group
