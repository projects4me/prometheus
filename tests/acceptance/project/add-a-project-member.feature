@setupApplicationTest
Feature: Project | add a project member

  Scenario: Adding a new member of a project

    Given There is no pre-existing data
    Given project scenario is loaded
    Given User_1 is logged in
    Given User_1 selects Project 3
    Given Project has following details
    -------------------------
    | role  | members(user) |
    | 5     | 4             |
    -------------------------
    #FOR ABOVE STEP 4 new Users will be created and will be assigned to Project
    Given Project membership is given to 5 users
    When User navigates to app/project/3
    When User clicks on add button to add a member
    When User selects User_2 as a member of project
    When User selects a role for that member
    When User clicks on save button
    Then User_2 is added as a member of project