@setupApplicationTest
Feature: Issue | agents shown with the robot avatar and AGENT label

  Scenario: An agent is shown as an agent in the header, members, thread and time logs

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    ---------
    | issue |
    | 5     |
    ---------
    And Agent "Agent Achilles" runs for "Sponsor One" with models "sonnet" and "opus"
    And Agent "Agent Achilles" is assignee of issue 4 and has commented and logged time on it
    When User navigates to app/project/project_1/issue/4
    Then The issue header shows the robot avatar for the assignee
    And The Members box shows the AGENT label for the assignee
    And The thread comment of "Agent Achilles" shows the AGENT label and "for Sponsor One"
    And The time log of "Agent Achilles" shows the AGENT label

  Scenario: A human is shown without the agent marks

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    ---------
    | issue |
    | 5     |
    ---------
    And Agent "Agent Achilles" runs for "Sponsor One" with models "sonnet" and "opus"
    And User_1 is assignee of issue 4
    When User navigates to app/project/project_1/issue/4
    Then The issue shows no agent marks
