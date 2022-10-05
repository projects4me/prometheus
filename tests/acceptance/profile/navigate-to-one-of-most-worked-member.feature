@setupApplicationTest
Feature: Profile | navigate to one of most worked member

  Scenario: navigate to one of the most worked member

    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And User has following details
    ------------------------------------------
    | mostWorkedMembers(userworkmostwith)    |
    | 3                                      |
    ------------------------------------------
    When User navigates to app/user/4
    When User clicks on most worked member 2
    Then User should be in app/user/2 page