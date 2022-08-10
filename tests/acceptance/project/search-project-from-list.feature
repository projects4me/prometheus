@setupApplicationTest
Feature: Project | search project from list

  Scenario: Searching a project from the list of projects

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And There are 10 projects in system
    And There is a saved search related to project
    When User navigates to app/project
    And User selects a saved search
    Then the searched project should be inside list