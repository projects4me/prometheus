@setupApplicationTest
Feature: Project | workspace link on the Overview

  Scenario: The project Overview links to its workspace

    Given There is no pre-existing data
    And project scenario is loaded
    And User_1 is logged in
    And Workspace ENG exists with 1 projects
    And User_1 selects the first project of workspace ENG
    When User navigates to app/project/ENGP1
    Then The project shows workspace ENG as a link
    When User opens the project workspace link
    Then The workspace header shows ENG
