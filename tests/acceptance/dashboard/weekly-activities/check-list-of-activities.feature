@setupApplicationTest
Feature: Dashboard - Weekly Activities | check list of activities

  Scenario: check list of activities

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 2
    And Project has following details
    --------------
    | activity   |
    | 10         |
    --------------
    When User navigates to app
    Then There should be 10 activities present in weekly activities widget

  Scenario: check list of activities with no activities
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 2
    When User navigates to app
    Then There should be no activities present in weekly activities widget