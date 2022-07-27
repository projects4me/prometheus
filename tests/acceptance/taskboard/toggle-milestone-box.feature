@setupApplicationTest
Feature: Taskboard | toggle milestone box board

  Scenario: toggle one of the available milestone box in taskboard

    Given There is no pre-existing data
    Given default scenario is loaded
    Given User_4 is logged in
    Given Project 10 has 2 milestones
    When User navigates to app/project/10/board
    When User toggle milestone 1 container
    Then milestone box is toggled
