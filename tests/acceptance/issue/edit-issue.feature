@setupApplicationTest
Feature: Issue | edit issue

  Scenario: Editing the issue and after that checking its updated details

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 2
    And Project has following details
    -----------------------------------------------
    | milestone | issuetype | issuestatus | issue |
    | 4         | 4         | 4           | 10    |
    -----------------------------------------------
    And Issue 4 has issue status 4, issue type 2 and milestone 2
    When User navigates to app/project/2/issue/4
    And User clicks on edit button
    And User edit issue subject to Edited subject
    And User edit issue description to Edited description
    And User clicks on save button
    Then Issue subject is Edited subject
    And Issue description is Edited description