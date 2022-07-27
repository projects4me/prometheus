@setupApplicationTest
Feature: Issue | issue create

  Scenario: Checking pre-filled fields

    Given There is no pre-existing data
    Given default scenario is loaded
    Given User_4 is logged in
    Given User_4 selects Project 3
    When User navigates to issue create page 
    Then User_4 should be assignee
    Then User_4 should be owner

  Scenario: Creating issue with correct values

    Given There is no pre-existing data
    Given default scenario is loaded
    Given User_4 is logged in
    Given User_4 selects Project 2
    Given Project 2 has following details
    ---------------------------------------
    | milestone | issuetype | issuestatus |
    | 4         | 4         | 4           |
    ---------------------------------------
    When User navigates to issue create page
    When User enters test subject in subject
    When User enters test description in description
    When User selects option 3 of issue type
    When User selects start date of issue
    When User selects end date of issue
    When User selects option 4 of issue status
    When User selects option 3 from milestone
    When User clicks on save button
    Then User is navigated to issue detail view
    Then Issue subject is test subject
    Then Issue description is test description