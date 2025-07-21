@setupApplicationTest
Feature: Dashboard - Weekly Timelogs | check list of timelogs

  Scenario: check list of timelogs

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 2
    And There is 1 issue for this week
    And Issue has following details
    ----------------------------------------------
    | spent(timelog)      | estimated(timelog)   |
    | 10                  | 10                   |
    ----------------------------------------------
    When User navigates to app
    Then There should be 1 timelog present in weekly timelogs widget

  Scenario: check list of timelogs with no timelogs
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 2
    And There is 1 issue for this week
    And Issue has following details
    ----------------------------------------------
    | spent(timelog)      | estimated(timelog)   |
    | 0                   | 0                   |
    ----------------------------------------------
    When User navigates to app
    Then There should be 1 timelog present in weekly timelogs widget with spent 0 and estimated 0

  Scenario: check list of timelogs that are assigned to two issues
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 2
    And There is 1 issue for this week
    And Issue has following details
    ----------------------------------------------
    | spent(timelog)      | estimated(timelog)   |
    | 10                  | 10                   |
    ----------------------------------------------
    And There is another issue for this week
    And Issue has following details
    ----------------------------------------------
    | spent(timelog)      | estimated(timelog)   |
    | 10                  | 10                   |
    ----------------------------------------------
    When User navigates to app
    Then There should be 2 timelogs present in weekly timelogs widget