@setupApplicationTest
Feature: Dashboard - Issue Today | select and navigate to issue

  Scenario: Select an issue and navigate to that selected issue

    Given There is no pre-existing data
    Given default scenario is loaded
    Given User_1 is logged in
    Given User_1 selects Project 1
    Given Project 1 has following details
    -------------
    | issue     |
    | 5         |
    -------------
    Given Issue 3 has subject UniqueIssue
    When User navigates to app
    When User searches for UniqueIssue inside Issue Today box
    When User clicks on UniqueIssue
    Then User should be in app/project/1/issue/3 page
    Then Issue subject is UniqueIssue