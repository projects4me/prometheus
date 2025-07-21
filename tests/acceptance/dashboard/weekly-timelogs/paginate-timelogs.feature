@setupApplicationTest
Feature: Dashboard - Weekly Timelogs Widget | Pagination

  Scenario: User paginates through weekly timelogs

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
    And There is another issue for previous week
    And Issue has following details
    ----------------------------------------------
    | spent(timelog)      | estimated(timelog)   |
    | 10                  | 10                   |
    ----------------------------------------------
    And Reverse navigation for pagination is enabled
    And There is custom callback setup to filter timelog model
    When User navigates to app
    And User clicks on previous page button in weekly timelogs
    Then There should be 1 timelog present in weekly timelogs widget
