@setupApplicationTest
Feature: Ideas | conversation

  Scenario: Sending a message adds it to the thread

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User selects Project 1
    And The idea Dark mode is open in the project
    When User opens the idea Dark mode
    And User sends the idea message Let us start with the settings page
    Then The idea message Let us start with the settings page is saved and shown

  Scenario: Renaming the idea

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User selects Project 1
    And The idea Dark mode is open in the project
    When User opens the idea Dark mode
    And User renames the idea to Night theme
    Then The idea is titled Night theme

  Scenario: Archiving the idea disables the composer

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User selects Project 1
    And The idea Dark mode is open in the project
    When User opens the idea Dark mode
    And User archives the idea
    Then The idea is archived
    And The idea composer is disabled
