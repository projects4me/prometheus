@setupApplicationTest
Feature: Project | workspace column and filter on the list

  Scenario: The list shows each project's workspace and the filter narrows it

    Given There is no pre-existing data
    And project scenario is loaded
    And User_1 is logged in
    And Workspace ENG exists with 2 projects
    And Workspace MKT exists with 1 projects
    When User navigates to app/project
    Then The projects list shows 3 projects
    And The project ENGP1 shows workspace ENG workspace
    And The project MKTP1 shows workspace MKT workspace
    And The project MKTP1 is flagged as only project
    When User filters the projects list by workspace ENG
    Then The projects list shows 2 projects
