@setupApplicationTest
Feature: Profile | add user identity

  Background:
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User has identity "agent-odysseus" on "github"
    When User navigates to app/user/1

  Scenario: User sees existing identities

    Then User identity "agent-odysseus" is displayed
    And User has 1 identities

  Scenario: User adds an identity

    When User opens identity add form
    And User selects "ssh" as identity provider
    And User enters "build-key" in identity handle field
    And User saves identity form
    Then User identity "build-key" is displayed
    And User has 2 identities

  Scenario: User can cancel adding an identity

    When User opens identity add form
    And User cancels identity form
    Then Identity add form is not visible
    And User has 1 identities
