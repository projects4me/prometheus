@setupApplicationTest
Feature: Project | search project from list

  Scenario: Searching a project from the list of projects

    Given There is no pre-existing data
    Given default scenario is loaded
    Given User_1 is logged in
    Given There are 10 projects in system
    Given There is a saved search related to project
    When User navigates to app/project
    When User selects a saved search
    Then the searched project should be inside list