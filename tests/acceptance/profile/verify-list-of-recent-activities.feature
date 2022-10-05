@setupApplicationTest
Feature: Profile | verify list of recent activities

  Scenario: Verify that list of recent activities performed by user are rendered

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User has following details
    ---------------------------------------
    | recentActivities(userecentactivity) |
    | 5                                   |
    ---------------------------------------
    When User navigates to app/user/1
    Then All activities are present inside recent activities section