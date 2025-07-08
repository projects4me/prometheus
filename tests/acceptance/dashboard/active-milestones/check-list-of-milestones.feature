@setupApplicationTest
Feature: Dashboard - Active Milestones | check list of milestones

  Scenario: Checking milestones list on Active Milestones Widget

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 2
    And Project has following details
    --------------
    | milestone  |
    | 10         |
    --------------
    When User navigates to app
    Then There should be 10 milestones present in active milestones widget