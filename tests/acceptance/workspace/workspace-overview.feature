@setupApplicationTest
Feature: Workspace | read-only Overview

  Scenario: Header, projects and members with duplicates removed

    Given There is no pre-existing data
    And project scenario is loaded
    And User_1 is logged in
    And The membership requests are recorded
    And Workspace ENG exists with 2 projects
    And User 2 is a member of 2 projects of workspace ENG
    And User 3 is a member of 1 projects of workspace ENG
    When User navigates to app/workspace/ENG
    Then The workspace header shows ENG
    And The workspace lists 2 projects
    And The workspace lists 2 members
    And The workspace members were requested through workspacemember with a limit of 20 and no OR
    And The workspace members box links Manage members to the Settings page of workspace ENG

  Scenario: The Projects box is paged

    Given There is no pre-existing data
    And project scenario is loaded
    And User_1 is logged in
    And Workspace BIG exists with 25 projects
    And Workspace BIG requests are recorded
    When User navigates to app/workspace/BIG
    Then The projects of workspace BIG were requested with a limit of 10
    And The workspace lists 10 projects
    And The projects pager shows "1-10"
    When User moves the projects pager to the next page
    Then The workspace lists 10 projects
    And The projects pager shows "11-20"
    When User moves the projects pager to the next page
    Then The workspace lists 5 projects
    And The projects pager shows "21-25"

  Scenario: The Members box is paged by person

    Given There is no pre-existing data
    And project scenario is loaded
    And User_1 is logged in
    And Workspace PEOPLE exists with 3 projects
    And Workspace PEOPLE has 25 more members
    When User navigates to app/workspace/PEOPLE
    Then The workspace lists 20 members
    When User moves the members pager to the next page
    Then The workspace lists 5 members

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

  Scenario: The page header, facts and no delete tool

    Given There is no pre-existing data
    And project scenario is loaded
    And User_1 is logged in
    And Workspace ENG exists with 2 projects
    When User navigates to app/workspace/ENG
    Then The workspace page header links to workspace ENG
    And The workspace breadcrumb ends with "ENG"
    And The workspace facts show 2 projects
    And The workspace has a Settings button and no delete button

  Scenario: The Projects table shows the five columns

    Given There is no pre-existing data
    And project scenario is loaded
    And User_1 is logged in
    And Workspace ENG exists with 2 projects
    And Project 1 of workspace ENG has 7 open issues, milestone "Sprint 1", repository "eng-repo" and manager User 1
    And Workspace ENG requests are recorded
    When User navigates to app/workspace/ENG
    Then Project 1 of workspace ENG shows 7 open issues, milestone "Sprint 1", repository "eng-repo" and a manager
    And Project 2 of workspace ENG shows no milestone, no repository and no manager
    And The repositories of workspace ENG were requested once with a limit of 100 and no OR

  Scenario: The repositories follow the page

    Given There is no pre-existing data
    And project scenario is loaded
    And User_1 is logged in
    And Workspace BIG exists with 12 projects
    And Project 11 of workspace BIG has 0 open issues, milestone "Sprint 2", repository "big-repo-11" and manager User 1
    When User navigates to app/workspace/BIG
    Then Project 11 of workspace BIG is not listed
    When User moves the projects pager to the next page
    Then Project 11 of workspace BIG shows 0 open issues, milestone "Sprint 2", repository "big-repo-11" and a manager

  Scenario: The Environment box and header facts show Gaia's values for an online runtime

    Given There is no pre-existing data
    And project scenario is loaded
    And User_1 is logged in
    And Workspace ENG exists with 2 projects
    And Workspace ENG has environment facts with runtime "Talos" online
    When User navigates to app/workspace/ENG
    Then The workspace header shows 14 cross-project links, 3 blocking, and "Talos online" with a green dot
    And The Environment box shows runtime "Talos" with a green dot, 2 runs, "5 (3 project, 2 workspace)" repositories, 4 agents, 6 tool servers and 7 skills
    And The Environment box links Agents to the agents list

  Scenario: The status dot is grey when the runtime is offline

    Given There is no pre-existing data
    And project scenario is loaded
    And User_1 is logged in
    And Workspace ENG exists with 2 projects
    And Workspace ENG has environment facts with runtime "Talos" offline
    When User navigates to app/workspace/ENG
    Then The workspace header shows "Talos offline" with a grey dot
    And The Environment box shows runtime "Talos" with a grey dot

  Scenario: A workspace without a runtime

    Given There is no pre-existing data
    And project scenario is loaded
    And User_1 is logged in
    And Workspace ENG exists with 2 projects
    When User navigates to app/workspace/ENG
    Then The workspace header shows "No runtime bound"


  Scenario: Adding a project to the workspace shows up in the Workspace Activities timeline

    Given There is no pre-existing data
    And project scenario is loaded
    And User_1 is logged in
    And Workspace ENG exists with 2 projects
    And Workspace ENG has 12 activities
    When User navigates to app/workspace/ENG
    Then The Workspace Activities box lists 10 activities
    When User loads more workspace activities
    Then The Workspace Activities box lists 12 activities

  Scenario: A workspace without activities shows the empty state

    Given There is no pre-existing data
    And project scenario is loaded
    And User_1 is logged in
    And Workspace ENG exists with 2 projects
    When User navigates to app/workspace/ENG
    Then The Workspace Activities box shows the empty state
