@setupApplicationTest
Feature: Dashboard - Weekly Timelogs Widget | Filter

  Scenario: User filters timelogs

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
    #that will make 10hr spent and 10hr estimated
    And each timelog has 1 hr time
    # Means from 10 spent hrs, 5 are spent by logged in user
    And 5 hrs are spent by logged in user on the issue
    When User navigates to app
    And User filters timelogs by my timelogs
    Then There should be 1 timelog present with 5 spent hrs