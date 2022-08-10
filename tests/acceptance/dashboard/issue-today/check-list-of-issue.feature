@setupApplicationTest
Feature: Dashboard - Issue Today | check list of issues

  Scenario: Checking issues list on Issue Today Box

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 2
    And Project has following details
    --------------
    | issue      |
    | 10         |
    --------------
    When User navigates to app
    Then There are 10 issues present on dashboard
