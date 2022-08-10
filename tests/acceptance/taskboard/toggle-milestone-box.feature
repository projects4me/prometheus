@setupApplicationTest
Feature: Taskboard | toggle milestone box board

  Scenario: toggle one of the available milestone box in taskboard

    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And Project 10 has 2 milestones
    When User navigates to app/project/10/board
    And User toggle milestone 1 container
    Then milestone box is toggled
