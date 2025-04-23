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
