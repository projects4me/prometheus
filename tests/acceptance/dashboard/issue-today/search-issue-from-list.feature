@setupApplicationTest
Feature: Dashboard - Issue Today | search issue from list

  Scenario: Searching an issue that exists inside Issue Today Box

    Given There is no pre-existing data
    Given default scenario is loaded
    Given User_1 is logged in
    Given User_1 selects Project 2
    Given Project 2 has following details
    --------------
    | issue      |
    | 10         |
    --------------
    Given Issue 4 has subject UniqueIssue
    When User navigates to app
    When User searches for UniqueIssue inside Issue Today box
    Then Issue having subject UniqueIssue exists inside Issue Today Box

  Scenario: Searching an issue that doesn't exists inside Issue Today Box

    Given There is no pre-existing data
    Given default scenario is loaded
    Given User_1 is logged in
    Given User_1 selects Project 2
    Given Project 2 has following details
    --------------
    | issue      |
    | 10         |
    --------------
    When User navigates to app
    When User searches for UniqueIssue inside Issue Today box
    Then Issue having subject UniqueIssue not-exists inside Issue Today Box