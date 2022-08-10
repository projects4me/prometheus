@setupApplicationTest
Feature: Dashboard - Issue Today | select and navigate to issue

  Scenario: Select an issue and navigate to that selected issue

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    -------------
    | issue     |
    | 5         |
    -------------
    And Issue 3 has subject UniqueIssue
    When User navigates to app
    And User searches for UniqueIssue inside Issue Today box
    And User clicks on UniqueIssue
    Then User should be in app/project/1/issue/3 page
    And Issue subject is UniqueIssue