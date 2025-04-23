@setupApplicationTest
Feature: Project | add custom issue types

  Scenario: Adding custom issue types to a project and checking if they are added

    Given There is no pre-existing data
    And project scenario is loaded
    And There is no issuetypes
    And User_4 is logged in
    When User navigates to app/project/create
    And User enters test project in project name 
    # And User selects option 2 of project type
    And User selects option 4 of project status
    And User enters issue-type1 in project issuetypes
    And User selects option 1 of project issuetypes
    And User enters issue-type2 in project issuetypes
    And User selects option 1 of project issuetypes
    And User clicks on save button
    Then User should be in app/project/testp page
    And Project name is test project
    And Project issuetypes are Issue Type 1, Issue Type 2