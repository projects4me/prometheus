@setupApplicationTest
Feature: Project | select and navigate to project

  Scenario: Selecting one of a project from list and navigate to that project

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And There are 10 projects in system
    When User navigates to app/project
    And User selects project 5 from list
    Then User should be in app/project/PROJECT_5 page
