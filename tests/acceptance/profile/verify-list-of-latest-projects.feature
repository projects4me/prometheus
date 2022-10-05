@setupApplicationTest
Feature: Profile | verify list of latest projects

  Scenario: Verify that list of latest projects are rendered 

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User has following details
    ------------------------------------------
    | latestProjects(userlatestproject)      |
    | 5                                      |
    ------------------------------------------
    When User navigates to app/user/1
    Then All projects are present inside latest projects section