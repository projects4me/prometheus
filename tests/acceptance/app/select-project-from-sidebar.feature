@setupApplicationTest
Feature: App | select project from sidebar

  Scenario: Selecting a project from sidebar and navigate to that project

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And There are 10 projects in system
    And tracked project service has id null
    When User navigates to app
    And User selects project 10 from sidebar
    Then User should be in app/project/project_10 page

  Scenario: Searching and selecting a project from sidebar

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And There are 10 projects in system
    And tracked project service has id null
    When User navigates to app
    And User searches and selects project "project_10" from sidebar
    Then User should be in app/project/project_10 page

  Scenario: No matching projects in sidebar search

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And There are 10 projects in system
    And tracked project service has id null
    When User navigates to app
    And User searches for "zzzz-no-such-project" in sidebar project selector
    Then Sidebar project selector shows no projects found
