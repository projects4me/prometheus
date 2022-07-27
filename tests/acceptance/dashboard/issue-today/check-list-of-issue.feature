@setupApplicationTest
Feature: Dashboard - Issue Today | check list of issues

  Scenario: Checking issues list on Issue Today Box

    Given There is no pre-existing data
    Given default scenario is loaded
    Given User_1 is logged in
    Given User_1 selects Project 2
    Given Project 2 has following details
    --------------
    | issue      |
    | 10         |
    --------------
    When User navigates to app
    Then There are 10 issues present on dashboard
