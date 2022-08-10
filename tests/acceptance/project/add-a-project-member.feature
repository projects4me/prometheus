@setupApplicationTest
Feature: Project | add a project member

  Scenario: Adding a new member of a project

    Given There is no pre-existing data
    And project scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 3
    And Project has following details
    -------------------------
    | role  | members(user) |
    | 5     | 4             |
    -------------------------
    #FOR ABOVE STEP 4 new Users will be created and will be assigned to Project
    And Project membership is given to 5 users
    When User navigates to app/project/3
    And User clicks on add button to add a member
    And User selects User_2 as a member of project
    And User selects a role for that member
    And User clicks on save button
    Then User_2 is added as a member of project