@setupApplicationTest
Feature: Dashboard - Recent Issues | search issue from list

  Scenario: Searching an issue that exists inside Recent Issues Box

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 2
    And Project has following details
    --------------
    | issue      |
    | 10         |
    --------------
    And Issue 4 has subject UniqueIssue
    When User navigates to app
    And User searches for UniqueIssue inside Recent Issues box
    Then Issue having subject UniqueIssue exists inside Recent Issues Box

  Scenario: Searching an issue that doesn't exists inside Recent Issues Box

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 2
    And Project has following details
    --------------
    | issue      |
    | 10         |
    --------------
    When User navigates to app
    And User searches for UniqueIssue inside Recent Issues box
    Then Issue having subject UniqueIssue not-exists inside Recent Issues Box