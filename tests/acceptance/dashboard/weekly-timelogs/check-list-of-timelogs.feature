@setupApplicationTest
Feature: Dashboard - Weekly Timelogs | check list of timelogs

  Scenario: check list of timelogs

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 2
    And There are 10 timelogs in system
    When User navigates to app
    Then There should be 10 timelogs present in weekly timelogs widget

  Scenario: check list of timelogs with no timelogs
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 2
    When User navigates to app
    Then There should be 0 timelogs present in weekly timelogs widget

  Scenario: check list of timelogs with 10 timelogs assigned to only one issue
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 2
    And There are 10 timelogs in system
    And 10 timelogs are added in only one issue for project 2
    When User navigates to app
    Then There should be 1 timelogs present in weekly timelogs widget