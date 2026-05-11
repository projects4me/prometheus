@setupApplicationTest
Feature: Project | render member account status

  Scenario: Display invited and inactive status for project members

    Given There is no pre-existing data
    And project scenario is loaded
    And There are 10 projects in system
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    ---------
    | role  |
    | 5     |
    ---------
    And User 2 is a project 1 member with account status invited and role 1
    And User 3 is a project 1 member with account status inactive and role 1
    When User navigates to app/project/project_1
    Then Project member 2 shows account status invited
    And Project member 3 shows account status inactive
