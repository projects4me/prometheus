@setupApplicationTest
Feature: Taskboard | toggle milestone box board

  Scenario: toggle one of the available milestone box in taskboard

    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And User_4 selects Project 2
    And Project has following details
    ------------------------------------------------------
    | milestones(milestone) | issuestatuses(issuestatus) |
    | 1                     | 6                          |
    ------------------------------------------------------ 
    When User navigates to app/project/2/board
    And User toggle milestone 1 container
    Then milestone box is toggled
