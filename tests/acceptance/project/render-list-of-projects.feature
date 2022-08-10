@setupApplicationTest
Feature: Project | render list of projects

  Scenario: Check the rendering of list of project in list project view

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And There are 10 projects in system
    When User navigates to app/project
    Then There are 10 projects present inside list view