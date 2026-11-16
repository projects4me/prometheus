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


  Scenario: Dashboard loads the statuses and every widget's first load in one bulk request
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 2
    And User 1 has no dashboard
    And The dashboard load requests are recorded
    When User navigates to app
    Then Dashboard should render its widgets
    And One bulk request loaded the items "system-issuestatuses, recentIssues, activeMilestones, weeklyActivities, weeklyIssueTimelogs, weeklyConversations"
    And No widget loaded its first page with its own request

  Scenario: Dashboard batches only the widgets the user shows
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 2
    And User 1 dashboard widgets are "weeklyActivities, notAWidget, recentIssues"
    And The dashboard load requests are recorded
    When User navigates to app
    Then Dashboard should render its widgets
    And One bulk request loaded the items "system-issuestatuses, weeklyActivities, recentIssues"
    And No widget loaded its first page with its own request

  Scenario: A widget whose item fails renders empty and the others still render
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 2
    And User 1 dashboard widgets are "recentIssues, weeklyActivities"
    And The activities are forbidden to the user
    And The dashboard load requests are recorded
    When User navigates to app
    Then Dashboard should render its widgets
    And One bulk request loaded the items "system-issuestatuses, recentIssues, weeklyActivities"
    And The dashboard shows 2 widgets
