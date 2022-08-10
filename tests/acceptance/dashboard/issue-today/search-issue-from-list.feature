@setupApplicationTest
Feature: Dashboard - Issue Today | search issue from list

  Scenario: Searching an issue that exists inside Issue Today Box

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
    And User searches for UniqueIssue inside Issue Today box
    Then Issue having subject UniqueIssue exists inside Issue Today Box

  Scenario: Searching an issue that doesn't exists inside Issue Today Box

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
    And User searches for UniqueIssue inside Issue Today box
    Then Issue having subject UniqueIssue not-exists inside Issue Today Box