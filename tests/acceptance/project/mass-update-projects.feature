@setupApplicationTest
Feature: Project | mass update projects

  Background:
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And There are 3 projects in system
    When User navigates to app/project

  Scenario: Top and bottom list toolbars expose the same bulk actions

    Then top and bottom project list toolbars have matching bulk actions
    And project list toolbars do not include discuss or refresh

  Scenario: Mass updating projects from the top toolbar

    When User clicks on the "select all projects" button
    And User clicks on the "mass update projects" button
    And User selects New value for project status
    And User clicks on save button
    Then all projects in the list should have status New

  Scenario: Deleting selected projects from the top toolbar

    When User clicks on the "select all projects" button
    And User clicks on the "delete projects" button
    And User confirms the delete action
    Then the projects list should be empty
