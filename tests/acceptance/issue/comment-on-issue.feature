@setupApplicationTest
Feature: Issue | comment on issue

  Scenario: Commenting on an issue

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 3
    And Project has following details
    ---------
    | issue |
    | 5     |
    ---------
    When User navigates to app/project/3/issue/4
    And User add a comment having description testComment
    Then User_1 has created a comment
    And Comment having description testComment is created