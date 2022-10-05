@setupApplicationTest
Feature: Profile | verify list of latest issues

  Scenario: Verify that list of latest issues are rendered

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User has following details
    ---------------------------------------
    | latestIssues(userlatestissue)       |
    | 5                                   |
    ---------------------------------------
    When User navigates to app/user/1
    Then All issues are present inside latest issue section