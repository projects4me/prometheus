@setupApplicationTest
Feature: open issue in a sidepanel

  Scenario: Viewing issue details in sidepanel from list view

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    ---------
    | issue |
    | 5     |
    ---------
    When User navigates to app/project/project_1/issue
    And User clicks on issue 1 from issues list
    Then The sidepanel should be rendered
    And User should see the issue 1 details in the sidepanel

