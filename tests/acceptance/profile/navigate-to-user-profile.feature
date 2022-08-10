@setupApplicationTest
Feature: Profile | navigate to user profile

  Scenario: navigation to user profile and check details

    Given There is no pre-existing data
    And default scenario is loaded
    And User_2 is logged in
    And User has following details
    ----------------------------------------------------------------------------------------------------------------------------
    | name        | title             | Education | githubUrl  | skypeUrl    | gitlabUrl    | linkedinUrl   | skills           |
    | Rana Nouman | Software Engineer | BSCS      | nouman-rt  | rana-nouman | test-gitlab  | test-linkedin | EmberJS, Phalcon |
    ----------------------------------------------------------------------------------------------------------------------------
    When User navigates to app/user/2
    Then User name is Rana Nouman
    And User designation is Software Engineer
    And User education is BSCS
    And User githubUrl is nouman-rt
    And User gitlabUrl is test-gitlab
    And User skypeUrl is rana-nouman
    And User linkedinUrl is test-linkedin
    And User has 2 skills
