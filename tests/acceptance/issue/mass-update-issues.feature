@setupApplicationTest
Feature: Issue | mass update issues

  Scenario: Mass updating issues

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    ---------------------------------------
    | issue     | issuetype | issuestatus |
    | 4         | 4         | 4           |
    ---------------------------------------
    When User navigates to app/project/project_1/issue
    And User clicks on the "select all issues" button
    And User clicks on the "mass update issues" button
    And User selects New value for issue status
    And User selects Blocker value for issue priority
    And User clicks on save button
    Then all issues in the list should have status New
    And all issues in the list should have priority Blocker