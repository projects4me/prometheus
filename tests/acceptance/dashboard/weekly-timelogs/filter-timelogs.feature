@setupApplicationTest
Feature: Dashboard - Weekly Timelogs Widget | Filter

  Scenario: User filters timelogs

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 2
    And There are 10 timelogs in system
    And 20 timelogs are for this week
    And 5 timelogs are for logged in user
    When User navigates to app
    And User filters timelogs by my timelogs
    Then There should be 5 timelogs present in weekly timelogs widget