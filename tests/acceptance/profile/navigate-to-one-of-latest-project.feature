@setupApplicationTest
Feature: Profile | navigate to one of latest project

  Scenario: navigate to one of the latest project of user

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    #setting up 5 projects because latestProjects are same as projects
    And There are 5 projects in system 
    And User has following details
    ------------------------------------------
    | latestProjects(userlatestproject)      |
    | 5                                      |
    ------------------------------------------
    When User navigates to app/user/1
    When User clicks on latest project 5
    Then User should be in app/project/5 page