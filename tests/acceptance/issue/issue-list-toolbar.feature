@setupApplicationTest
#UNCOMMON steps: tests/acceptance/steps/issue/issue-list-toolbar-steps.js
Feature: Issue | issue list toolbar

  Background:
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    ---------
    | issue |
    | 3     |
    ---------
    When User navigates to app/project/project_1/issue

  Scenario: Top and bottom list toolbars expose the same bulk actions as the project list

    Then top and bottom issue list toolbars have matching bulk actions
    And issue list toolbars do not include share, discuss or refresh

  Scenario: Deleting selected issues from the top toolbar

    When User clicks on the "select all issues" button
    And User clicks on the "delete issues" button
    And User confirms the delete action
    Then the issues list should be empty
