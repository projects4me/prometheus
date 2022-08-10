@setupApplicationTest
Feature: Issue | search issue from list

  Scenario: Searching an issue from the list of issues

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 2
    And Project has following details
    ---------
    | issue |
    | 10    |
    ---------
    And There is a saved search related to issue
    When User navigates to app/project/2/issue
    And User selects a saved search
    Then the searched issue should be inside list