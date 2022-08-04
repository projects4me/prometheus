@setupApplicationTest
Feature: Issue | edit issue

  Scenario: Editing the issue and after that checking its updated details

    Given There is no pre-existing data
    Given default scenario is loaded
    Given User_1 is logged in
    Given User_1 selects Project 2
    Given Project has following details
    -----------------------------------------------
    | milestone | issuetype | issuestatus | issue |
    | 4         | 4         | 4           | 10    |
    -----------------------------------------------
    Given Issue 4 has issue status 4, issue type 2 and milestone 2
    When User navigates to app/project/2/issue/4
    When User clicks on edit button
    When User edit issue subject to Edited subject
    When User edit issue description to Edited description
    When User clicks on save button
    Then Issue subject is Edited subject
    Then Issue description is Edited description