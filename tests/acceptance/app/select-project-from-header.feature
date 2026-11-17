@setupApplicationTest
Feature: App | select project from header

  Scenario: Selecting a project from header and navigate to that project

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And There are 10 projects in system
    And tracked project service has id null
    When User navigates to app
    And User selects project 10 from header
    Then User should be in app/project/project_10 page

  Scenario: Searching and selecting a project from header

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And There are 10 projects in system
    And tracked project service has id null
    When User navigates to app
    And User searches and selects project "project_10" from header
    Then User should be in app/project/project_10 page

  Scenario: No matching projects in header search

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And There are 10 projects in system
    And tracked project service has id null
    When User navigates to app
    And User searches for "zzzz-no-such-project" in header project switcher
    Then Header project switcher shows no projects found
