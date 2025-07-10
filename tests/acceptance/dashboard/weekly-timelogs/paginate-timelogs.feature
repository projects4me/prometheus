@setupApplicationTest
Feature: Dashboard - Weekly Timelogs Widget | Pagination

  Scenario: User paginates through weekly timelogs

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 2
    And There are 20 timelogs in system
    And 15 timelogs are for this week
    And 5 timelogs are for previous week
    And Reverse navigation for pagination is enabled
    And There is custom callback setup to filter timelog model
    When User navigates to app
    And User clicks on previous page button in weekly timelogs
    Then There should be 5 timelogs present in weekly timelogs widget
