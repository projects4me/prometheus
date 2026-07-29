@setupApplicationTest
Feature: Project | delete a project member

  Scenario: Deleting a member

    Given There is no pre-existing data
    And project scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    When User navigates to app/project/project_1
    And User clicks on add button to add a member
    And User selects User_2 as a member of project
    And User clicks on save button
    And User clicks on delete button to delete member 2
    And Issues of that member are assigned to User 1
    And User clicks on save button
    Then User 2 is deleted from project 1