@setupApplicationTest
Feature: Issue tags | Add, reuse and remove tags on the issue detail page

  Scenario: User adds a new tag to an issue
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    --------------
    | issue    |
    | 1        |
    --------------
    When User navigates to app/project/PROJECT_1/issue/1
    And User adds the tag "backend" to the issue
    Then The issue should show the tag "backend"
    And The project should have 1 tag named "backend"

  Scenario: User reuses an existing tag of the project
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    --------------
    | issue    |
    | 1        |
    --------------
    And Project has the tag "urgent"
    When User navigates to app/project/PROJECT_1/issue/1
    And User adds the tag "Urgent" to the issue
    Then The issue should show the tag "urgent"
    And The project should have 1 tag named "urgent"

  Scenario: User removes a tag from an issue
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    --------------
    | issue    |
    | 1        |
    --------------
    And Issue 1 is tagged "urgent"
    When User navigates to app/project/PROJECT_1/issue/1
    And User removes the tag "urgent" from the issue
    Then The issue should not show the tag "urgent"
    And The project should have 1 tag named "urgent"
