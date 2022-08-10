@setupApplicationTest
Feature: Project | create project

  Scenario: Creating a project with correct values

    Given There is no pre-existing data
    And project scenario is loaded
    And User_4 is logged in
    When User navigates to app/project/create
    And User enters test project in project name 
    And User enters test description in project description 
    And User selects start date of project
    And User selects end date of project
    And User selects option 2 of project type
    And User selects option 4 of project status
    And User enters test vision in project vision
    And User enters test vision in project scope
    And User selects option 3 of project issuetypes
    And User clicks on save button
    Then User should be in app/project/1 page
    And Project name is test project
    And Project description is test description