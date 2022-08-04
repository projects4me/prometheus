@setupApplicationTest
Feature: Project | edit project

  Scenario: Editing the project and after that checking its updated details

    Given There is no pre-existing data
    Given default scenario is loaded
    Given User_1 is logged in
    Given There are 10 projects in system
    When User navigates to app/project/1
    When User clicks on edit button
    When User enters edited Project in project name
    When User enters edited Description in project description
    When User clicks on save button
    Then Project name is edited Project
    Then Project description is edited Description