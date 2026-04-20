@setupApplicationTest
Feature: Issue list collapse functionality | Issue

  Background:
    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And User_4 selects Project 1
    And Project has following details
    ---------
    | issue |
    | 5     |
    ---------
    When User navigates to app/project/project_1/issue

  Scenario: Divider handle is not visible when no issue is open

    Then User should not see the panel divider handle

  Scenario: Divider handle becomes visible when an issue is opened

    Given User clicks on first issue from the issue list to open details
    Then User should see the panel divider handle

  Scenario: Issue list is hidden when the divider handle is clicked

    Given User clicks on first issue from the issue list to open details
    When User clicks the panel divider handle
    Then User should not see the issue list content

  Scenario: Issue details panel expands to full width when list is collapsed

    Given User clicks on first issue from the issue list to open details
    When User clicks the panel divider handle
    Then The issue details panel should be in full width mode

  Scenario: Issue list restores when divider handle is clicked again

    Given User clicks on first issue from the issue list to open details
    And User clicks the panel divider handle
    When User clicks the panel divider handle to expand
    Then User should see the issue list content
    And User should see the panel divider handle

  Scenario: Issue details panel returns to default width after list is expanded

    Given User clicks on first issue from the issue list to open details
    And User clicks the panel divider handle
    When User clicks the panel divider handle to expand
    Then The issue details panel should be in default width mode
