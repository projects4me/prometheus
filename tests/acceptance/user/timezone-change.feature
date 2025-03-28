@setupApplicationTest
Feature: User | timezone change

  Scenario: User is prompted when browser timezone differs from profile timezone

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User has following details
    ---------------------------------------
    | timezone |
    | America/New_York |
    ---------------------------------------
    And Browser timezone is detected as Europe/NoWhere
    When User navigates to app
    And User accepts timezone change prompt
    Then User should see timezone updated success message
    And User timezone should be updated to Europe/NoWhere

  Scenario: User is not prompted when browser timezone matches profile timezone

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User has following details
    ---------------------------------------
    | timezone |
    | Europe/London |
    ---------------------------------------
    And Browser timezone is detected as Europe/London
    When User navigates to app
    Then User should not see timezone change prompt