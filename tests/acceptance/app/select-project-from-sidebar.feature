@setupApplicationTest
Feature: App | select project from sidebar

  Scenario: Selecting a project from sidebar and navigate to that project

    Given There is no pre-existing data
    Given default scenario is loaded
    Given User_1 is logged in
    Given Create 10 projects
    Given tracked project service has id null
    When User navigates to app
    When User selects project 10 from sidebar
    Then User should be in app/project/10 page
