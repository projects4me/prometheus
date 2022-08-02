@setupApplicationTest
Feature: Project | select and navigate to project

  Scenario: Selecting one of a project from list and navigate to that project

    Given There is no pre-existing data
    Given default scenario is loaded
    Given User_1 is logged in
    Given There are 10 projects in system
    When User navigates to app/project
    When User selects project 5 from list
    Then User should be in app/project/5 page
