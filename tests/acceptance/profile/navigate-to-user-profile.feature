@setupApplicationTest
Feature: Profile | navigate to user profile

  Scenario: navigation to user profile and check details

    Given There is no pre-existing data
    Given default scenario is loaded
    Given User_2 is logged in
    Given User has following details
    ----------------------------------------------------------------------------------------------------------------------------
    | name        | title             | Education | githubUrl  | skypeUrl    | gitlabUrl    | linkedinUrl   | skills           |
    | Rana Nouman | Software Engineer | BSCS      | nouman-rt  | rana-nouman | test-gitlab  | test-linkedin | EmberJS, Phalcon |
    ----------------------------------------------------------------------------------------------------------------------------
    When User navigates to app/user/2
    Then User name is Rana Nouman
    Then User designation is Software Engineer
    Then User education is BSCS
    Then User githubUrl is nouman-rt
    Then User gitlabUrl is test-gitlab
    Then User skypeUrl is rana-nouman
    Then User linkedinUrl is test-linkedin
    Then User has 2 skills
