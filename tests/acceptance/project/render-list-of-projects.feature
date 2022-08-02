@setupApplicationTest
Feature: Project | render list of projects

  Scenario: Check the rendering of list of project in list project view

    Given There is no pre-existing data
    Given default scenario is loaded
    Given User_1 is logged in
    Given There are 10 projects in system
    When User navigates to app/project
    Then There are 10 projects present inside list view