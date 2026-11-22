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
