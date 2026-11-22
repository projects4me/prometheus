@setupApplicationTest
Feature: Workspace | Settings

  Background:
    Given There is no pre-existing data
    And project scenario is loaded
    And User_1 is logged in

  Scenario: Settings opens on the Projects tab with four tabs

    Given Workspace ENG exists with 0 projects
    When User visits app/workspace/ENG/settings
    Then The workspace settings show the tabs "projects, environment, agents, delete"
    And The workspace settings Projects tab is open

  Scenario: The Who Can Manage box lists the permissions

    Given Workspace ENG exists with 0 projects
    When User navigates to app/workspace/ENG/settings/projects
    Then The Who Can Manage box lists the workspace permissions

  Scenario: The old edit link lands on Settings

    Given Workspace ENG exists with 0 projects
    When User visits app/workspace/edit/ENG
    Then User should be in app/workspace/ENG/settings/projects page

  Scenario: The details are saved from Settings

    Given Workspace ENG exists with 0 projects
    When User navigates to app/workspace/ENG/settings/projects
    And User renames the workspace in Settings to "Platform"
    And User saves the workspace details in Settings
    Then Workspace "Platform" with code "ENG" is stored

  Scenario: The Environment tab lists the runtime and the repositories with their base branches

    Given Workspace ENG exists with 1 projects
    And Workspace ENG has environment facts with runtime "talos-1" online
    And Workspace ENG has repositories "api" on "main" and "web" on "dev"
    When User navigates to app/workspace/ENG/settings/environment
    Then The Environment tab shows runtime "talos-1" online and 2 repositories with base branches

  Scenario: The Agents tab links to the existing views

    Given Workspace ENG exists with 0 projects
    When User navigates to app/workspace/ENG/settings/agents
    Then The Agents tab links to agents, workflows, tools and skills

  Scenario: A workspace with projects can't be deleted

    Given Workspace ENG exists with 2 projects
    When User navigates to app/workspace/ENG/settings/delete
    Then The workspace settings delete button is disabled

  Scenario: An empty workspace is deleted after confirmation

    Given Workspace EMPTY exists with 0 projects
    When User navigates to app/workspace/EMPTY/settings/delete
    And User confirms deleting the workspace in Settings
    Then Workspace EMPTY is deleted and the workspaces list is shown

  Scenario: The Member Projects table lists the projects with four columns

    Given Workspace ENG exists with 2 projects
    When User navigates to app/workspace/ENG/settings/projects
    Then The Member Projects table lists 2 projects with the four columns

  Scenario: The Members table lists each person once with the sharing callout

    Given Workspace ENG exists with 2 projects
    And User 1 is a member of 2 projects of workspace ENG
    When User navigates to app/workspace/ENG/settings/projects
    Then The Members table lists 1 person with the sharing callout for 2 projects
