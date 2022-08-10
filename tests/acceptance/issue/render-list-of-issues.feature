@setupApplicationTest
Feature: Issue | render list of issues

  Scenario: Check the rendering of list of issues in list issue view

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 5
    And Project has following details
    ---------
    | issue |
    | 10    |
    ---------
    When User navigates to app/project/5/issue
    Then There are 10 issues present inside list view