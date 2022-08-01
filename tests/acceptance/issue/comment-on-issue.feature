@setupApplicationTest
Feature: Issue | comment on issue

  Scenario: Commenting on an issue

    Given There is no pre-existing data
    Given default scenario is loaded
    Given User_1 is logged in
    Given User_1 selects Project 3
    Given Project 3 has following details
    ---------
    | issue |
    | 5     |
    ---------
    When User navigates to app/project/3/issue/4
    When User add a comment having description testComment
    Then User_1 has created a comment
    Then Issue have a comment of testComment