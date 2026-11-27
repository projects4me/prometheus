@setupApplicationTest
Feature: Issue list tags | Show the tags of an issue and filter the list by one

  Background:
    Given There is no pre-existing data
    And default scenario is loaded
    And The issue statuses are available
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    --------------
    | issue |
    | 3     |
    --------------

  Scenario: The list shows the tags of an issue
    Given Issue 1 is tagged "backend"
    When User navigates to app/project/project_1/issue
    Then The issue list shows the tag "backend" on issue 1

  Scenario: More than three tags show a +n chip with the hidden names
    Given Issue 1 is tagged "alpha"
    And Issue 1 is tagged "bravo"
    And Issue 1 is tagged "charlie"
    And Issue 1 is tagged "delta"
    And Issue 1 is tagged "echo"
    When User navigates to app/project/project_1/issue
    Then The issue list shows 3 visible tags and a "+2" chip on issue 1

  Scenario: Clicking a tag filters the list by it
    Given Issue 1 is tagged "backend"
    When User navigates to app/project/project_1/issue
    And User clicks the tag "backend" on issue 1 in the list
    Then the issue search bar shows "((tag.tag : backend))"
    And the issue list was queried with "((tag.tag : backend))" and the project
