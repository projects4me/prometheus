@setupApplicationTest
Feature: Issue | select and navigate to issue

  Scenario: Selecting one of an issue from list and navigate to that issue 

    Given There is no pre-existing data
    Given default scenario is loaded
    Given User_1 is logged in
    Given User_1 selects Project 2
    Given Project has following details
    ---------
    | issue |
    | 5     |
    ---------
    When User navigates to app/project/2/issue
    When User selects issue 5 from list
    Then User should be in app/project/2/issue/5 page