@setupApplicationTest
Feature: Project | edit project

  Scenario: Editing the project and after that checking its updated details

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And There are 10 projects in system
    When User navigates to app/project/1
    And User clicks on edit button
    And User enters edited Project in project name
    And User enters edited Description in project description
    And User clicks on save button
    Then Project name is edited Project
    And Project description is edited Description