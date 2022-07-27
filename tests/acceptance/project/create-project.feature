@setupApplicationTest
Feature: Project | create project

  Scenario: Creating a project with correct values

    Given There is no pre-existing data
    Given project scenario is loaded
    Given User_4 is logged in
    When User navigates to app/project/create
    When User enters test project in project name 
    When User enters test description in project description 
    When User selects start date of project
    When User selects end date of project
    When User selects option 2 of project type
    When User selects option 4 of project status
    When User enters test vision in project vision
    When User enters test vision in project scope
    When User selects option 3 of project issuetypes
    When User clicks on save button
    Then User should be in app/project/1 page
    Then Project name is test project
    Then Project description is test description