@setupApplicationTest
Feature: Workspace | read-only Overview

  Scenario: Header, projects and members with duplicates removed

    Given There is no pre-existing data
    And project scenario is loaded
    And User_1 is logged in
    And The membership requests are recorded
    And Workspace ENG exists with 2 projects
    And User 2 is a member of both projects of workspace ENG
    And User 3 is a member of the first project of workspace ENG
    When User navigates to app/workspace/ENG
    Then The workspace header shows ENG
    And The workspace lists 2 projects
    And The workspace lists 2 members
    And The workspace members were requested once through project.workspaceId, paged, without OR

  Scenario: An empty workspace

    Given There is no pre-existing data
    And project scenario is loaded
    And User_1 is logged in
    And Workspace EMPTY exists with 0 projects
    When User navigates to app/workspace/EMPTY
    Then The workspace header shows EMPTY
    And The workspace lists 0 projects
    And The workspace lists 0 members

  Scenario: An unknown workspace code

    Given There is no pre-existing data
    And project scenario is loaded
    And User_1 is logged in
    When User navigates to app/workspace/NOPE
    Then The workspace is not found

  Scenario: A workspace with projects can't be deleted

    Given There is no pre-existing data
    And project scenario is loaded
    And User_1 is logged in
    And Workspace ENG exists with 2 projects
    When User navigates to app/workspace/ENG
    Then The workspace delete button is disabled

  Scenario: An empty workspace is deleted after confirmation

    Given There is no pre-existing data
    And project scenario is loaded
    And User_1 is logged in
    And Workspace EMPTY exists with 0 projects
    When User navigates to app/workspace/EMPTY
    And User confirms deleting the workspace
    Then Workspace EMPTY is deleted and the workspaces list is shown

  Scenario: Gaia refuses to delete the workspace

    Given There is no pre-existing data
    And project scenario is loaded
    And User_1 is logged in
    And Workspace EMPTY exists with 0 projects
    And Gaia refuses to delete workspace EMPTY with "The workspace still owns agents"
    When User navigates to app/workspace/EMPTY
    And User confirms deleting the workspace
    Then The workspace delete refusal shows "The workspace still owns agents"
