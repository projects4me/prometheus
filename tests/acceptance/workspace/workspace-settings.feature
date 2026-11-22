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

  Scenario: A project joins the workspace from the Add project dialog

    Given Workspace ENG exists with 1 projects
    And Project "Loner" exists outside workspace ENG
    And User 1 is a member of 1 projects of workspace ENG
    When User navigates to app/workspace/ENG/settings/projects
    And User opens the Add project dialog
    And User chooses the project "Loner" in the Add project dialog
    Then The Add project dialog shows the sharing and the environment
    When User confirms the Add project dialog
    Then The Member Projects table lists 2 projects with the four columns

  Scenario: Gaia refusal is shown in the Add project dialog

    Given Workspace ENG exists with 1 projects
    And Project "Loner" exists outside workspace ENG
    And Gaia refuses to move projects with "Work is in progress"
    When User navigates to app/workspace/ENG/settings/projects
    And User opens the Add project dialog
    And User chooses the project "Loner" in the Add project dialog
    And User confirms the Add project dialog
    Then The Add project dialog shows the error "Work is in progress"

  Scenario: A project moves out of the workspace to a new workspace

    Given Workspace ENG exists with 2 projects
    When User navigates to app/workspace/ENG/settings/projects
    And User opens the Move project out dialog of the first project
    And User confirms the Move project out dialog
    Then The Move project out dialog is closed
    And The Member Projects table lists 1 projects with the four columns

  Scenario: Gaia refuses to move out a project with work in progress

    Given Workspace ENG exists with 1 projects
    And The first project of workspace ENG has 1 runs in progress
    And Gaia refuses to move projects with "Work is in progress"
    When User navigates to app/workspace/ENG/settings/projects
    And User opens the Move project out dialog of the first project
    Then The Move project out dialog warns of 1 runs in progress
    When User confirms the Move project out dialog
    Then The Move project out dialog shows the error "Work is in progress"
