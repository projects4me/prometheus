@setupApplicationTest
Feature: Profile | navigate to one of latest issue

  Scenario: navigate to one of the latest issue of user

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 2
    And Project has following details
    ---------
    | issue |
    | 5     |
    ---------
    And User has following details
    ---------------------------------------
    | latestIssues(userlatestissue)       |
    | 5                                   |
    ---------------------------------------
    When User navigates to app/user/1
    When User clicks on latest issue 5
    Then User should be in app/project/2/issue/5 page