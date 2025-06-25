@setupApplicationTest
Feature: Recent Issues Widget | load more issues

  Scenario: loading more issues with load more button - first click
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 2
    And Project has following details
    --------------
    | issue      |
    | 20         |
    --------------
    And There is need to paginate the issues
    When User navigates to app
    And User clicks on load more button in recent issues widget
    Then There should be 10 issues displayed in recent issues widget

  Scenario: loading more issues with load more button - second click
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 2
    And Project has following details
    --------------
    | issue      |
    | 20         |
    --------------
    And There is need to paginate the issues
    When User navigates to app
    And User clicks on load more button in recent issues widget
    And User clicks on load more button in recent issues widget again
    Then There should be 15 issues displayed in recent issues widget