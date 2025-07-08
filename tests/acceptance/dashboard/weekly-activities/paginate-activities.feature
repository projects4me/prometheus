@setupApplicationTest
Feature: Dashboard - Weekly Activities Widget | pagination

  Scenario: User paginates through weekly activities

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 2
    And Project has following details
    --------------
    | activity  |
    | 20        |
    --------------
    And 15 activities are for this week
    And 5 activities are for previous week
    And There is custom callback setup to filter activity model
    When User navigates to app
    And User clicks on next page button in weekly activities
    Then There should be 5 activities present in weekly activities widget
  
  Scenario: User paginates through weekly activities with previous page button
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 2
    And Project has following details
    --------------
    | activity  |
    | 20        |
    --------------
    And 15 activities are for this week
    And 5 activities are for previous week
    And There is custom callback setup to filter activity model
    When User navigates to app
    And User clicks on next page button in weekly activities
    And User clicks on previous page button in weekly activities
    Then There should be 15 activities present in weekly activities widget