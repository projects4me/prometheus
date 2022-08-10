@setupApplicationTest
Feature: Issue | issue create

  Scenario: Checking pre-filled fields

    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And User_4 selects Project 3
    When User navigates to issue create page 
    Then User_4 should be assignee
    And User_4 should be owner

  Scenario: Creating issue with correct values

    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And User_4 selects Project 2
    And Project has following details
    ---------------------------------------
    | milestone | issuetype | issuestatus |
    | 4         | 4         | 4           |
    ---------------------------------------
    When User navigates to issue create page
    And User enters test subject in subject
    And User enters test description in description
    And User selects option 3 of issue type
    And User selects start date of issue
    And User selects end date of issue
    And User selects option 4 of issue status
    And User selects option 3 from milestone
    And User clicks on save button
    Then User is navigated to issue detail view
    And Issue subject is test subject
    And Issue description is test description