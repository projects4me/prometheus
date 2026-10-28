@setupApplicationTest
#UNCOMMON steps: tests/acceptance/steps/dashboard/widgets-fallback/tolerate-invalid-widgets-steps.js
Feature: Dashboard | tolerates unknown or missing widgets

  Scenario: Dashboard lists an unknown widget
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 2
    And User 1 dashboard widgets are "recentIssues, notAWidget"
    When User navigates to app
    Then Dashboard should render its widgets

  Scenario: Dashboard has an empty widget list
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 2
    And User 1 has an empty dashboard widget list
    When User navigates to app
    Then Dashboard should render its widgets

  Scenario: User has no dashboard
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 2
    And User 1 has no dashboard
    When User navigates to app
    Then Dashboard should render its widgets
