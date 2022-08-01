@setupApplicationTest
Feature: Issue | search issue from list

  Scenario: Searching an issue from the list of issues

    Given There is no pre-existing data
    Given default scenario is loaded
    Given User_1 is logged in
    Given User_1 selects Project 2
    Given Project has following details
    ---------
    | issue |
    | 10    |
    ---------
    Given There is a saved search related to issue
    When User navigates to app/project/2/issue
    When User selects a saved search
    Then the searched issue should be inside list