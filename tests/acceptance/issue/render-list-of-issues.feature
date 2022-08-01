@setupApplicationTest
Feature: Issue | render list of issues

  Scenario: Check the rendering of list of issues in list issue view

    Given There is no pre-existing data
    Given default scenario is loaded
    Given User_1 is logged in
    Given User_1 selects Project 5
    Given Project 5 has following details
    ---------
    | issue |
    | 10    |
    ---------
    When User navigates to app/project/5/issue
    Then There are 10 issues present inside list view