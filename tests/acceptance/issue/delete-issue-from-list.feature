@setupApplicationTest
Feature: Issue | delete issue from list

  Scenario: Delete issue from list

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User selects Project 1
    And Project has following details
    ---------
    | issue |
    | 5     |
    ---------
    When User navigates to app/project/project_1/issue
    And User deletes a issue of id 1
    Then Issue of id 1 is not present inside list
