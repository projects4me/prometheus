@setupApplicationTest
Feature: Project | render list of projects

  Scenario: Check the rendering of list of project in list project view

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And There are 10 projects in system
    When User navigates to app/project
    Then There are 10 projects present inside list view

  Scenario: Check member avatars and overflow count for a project with 5 members

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And There are 1 projects in system
    And 5 users are created and attached as members to project 1
    When User navigates to app/project
    Then 4 member avatars are visible in the first project row
    And the overflow count shows +1 in the first project row