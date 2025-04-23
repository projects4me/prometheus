@setupApplicationTest
Feature: Project | delete a project member

  Scenario: Deleting a member

    Given There is no pre-existing data
    And project scenario is loaded
    And User_1 is logged in
    And There are 10 projects in system
    And User_1 selects Project 3
    And Project has following details
    ---------
    | role  |
    | 5     |
    ---------
    And User_1 is given role 1 in Project 3
    And User 2 is added as a member of project 3
    When User navigates to app/project/project_3
    And User clicks on delete button to delete member 2 
    # above step is present in edit project member steps file
    And Issues of that member are assigned to User 1
    And User clicks on save button
    Then User 2 is deleted from project 3