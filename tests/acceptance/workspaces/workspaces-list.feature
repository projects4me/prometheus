@setupApplicationTest
Feature: Workspaces | list

  Background:
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in

  Scenario: User sees the workspaces with their six columns

    Given Workspace "Engineering" with code "ENG" has 3 projects and 5 members
    And Workspace "Marketing" with code "MKT" has 1 projects and 2 members
    When User navigates to app/workspace
    Then Workspaces list has 2 workspaces
    And Workspace "Engineering" shows code "ENG", 3 projects and 5 members
    And Workspaces list shows the columns "Name, Short code, Projects, Members, Created by, Created on"

  Scenario: User searches the workspaces

    Given Workspace "Engineering" with code "ENG" has 3 projects and 5 members
    And Workspace "Marketing" with code "MKT" has 1 projects and 2 members
    When User navigates to app/workspace
    And User searches the list for "((Workspace.name : Marketing))"
    Then Workspaces list has 1 workspaces
    And Workspace "Marketing" shows code "MKT", 1 projects and 2 members

  Scenario: User sorts the workspaces

    Given Workspace "Engineering" with code "ENG" has 3 projects and 5 members
    And Workspace "Marketing" with code "MKT" has 1 projects and 2 members
    When User navigates to app/workspace
    Then The workspaces are listed in the order "Engineering, Marketing"
    When User sorts the workspaces by "Name"
    Then The workspaces are listed in the order "Marketing, Engineering"

  Scenario: User sees the empty state

    When User navigates to app/workspace
    Then Workspaces list has 0 workspaces
    And The workspaces list says "No workspaces found"
